import { useEffect, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MetadataList, MetadataListItem } from "@astryxdesign/core/MetadataList";

import {
  MarkdownTextSchema,
  type ArtifactRef,
  type Sha256,
  type WorkItem,
} from "../../src/core/contracts.ts";
import { artifactDirectEditIsAllowed } from "../../src/core/lifecycle.ts";
import * as api from "./http.ts";
import { invalidateWorkbenchMutation, workbenchQueryKeys } from "./query-keys.ts";
import { MarkdownEditor } from "./MarkdownEditor.tsx";
import { lifecycleArtifactLabel } from "./workbench-presentation.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchConfirmation } from "./primitives/WorkbenchConfirmation.tsx";
import { WorkbenchNotice } from "./primitives/WorkbenchNotice.tsx";
import { WorkbenchState } from "./primitives/WorkbenchState.tsx";
import { WorkbenchStatus } from "./primitives/WorkbenchStatus.tsx";

const errorText = (value: unknown): string =>
  value instanceof Error ? value.message : String(value);

const gitBlockerText = (blocker: string): string => {
  switch (blocker) {
    case "LIFECYCLE_INELIGIBLE":
      return "Documentation can only be saved to Git before Implementation or Complete.";
    case "ACTIVE_RUN":
      return "Finish or cancel the active activity before saving documentation to Git.";
    case "DETACHED_HEAD":
      return "Check out a local branch before saving documentation to Git.";
    case "GIT_OPERATION_ACTIVE":
      return "Finish the in-progress Git operation before saving documentation to Git.";
    case "MISSING_GIT_IDENTITY":
      return "Set repository-local Git user.name and user.email before saving documentation to Git.";
    case "MISSING_DOCUMENT":
      return "A governed WorkItem document is missing.";
    case "IGNORED_DOCUMENT":
      return "A governed WorkItem document is ignored by Git.";
    case "UNMERGED_DOCUMENT":
      return "Resolve the unmerged governed document before saving documentation to Git.";
    default:
      return blocker;
  }
};

const decodeCanonicalMarkdown = (bytes: Uint8Array): string | null => {
  try {
    const parsed = MarkdownTextSchema.safeParse(
      new TextDecoder("utf-8", { fatal: true }).decode(bytes),
    );
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
};

const useDocumentationGitState = (
  workItem: WorkItem,
  dirty: boolean,
  selectedRepositoryPath: string | null,
) => {
  const queryClient = useQueryClient();
  const [confirmGitSave, setConfirmGitSave] = useState(false);
  const sourceQuery = useQuery({
    queryKey: workbenchQueryKeys.workItemSource(workItem.id),
    queryFn: () => api.getWorkItemSource(workItem.id),
  });
  const gitStatusQuery = useQuery({
    queryKey: workbenchQueryKeys.workItemDocumentationGitStatus(workItem.id),
    queryFn: () => api.getWorkItemDocumentationGitStatus(workItem.id),
  });

  const changedGitPaths =
    gitStatusQuery.data?.paths.filter((path) => path.state !== "MATCHES_HEAD") ?? [];
  const selectedGitPath = selectedRepositoryPath === null
    ? null
    : gitStatusQuery.data?.paths.find(
        (path) => path.repositoryPath === selectedRepositoryPath,
      ) ?? null;
  const sourcePath = sourceQuery.data?.path ?? workItem.sourcePath;
  const workItemDirectory = sourcePath.includes("/")
    ? sourcePath.slice(0, sourcePath.lastIndexOf("/"))
    : sourcePath;
  const gitStateLabel = dirty
    ? "Unsaved edits"
    : gitStatusQuery.isPending
      ? "Checking Git…"
      : gitStatusQuery.isError || gitStatusQuery.data === undefined
        ? "Git state unavailable"
        : changedGitPaths.length === 0
          ? "Saved to Git"
          : "Saved to project, not Git";

  const invalidateDocumentation = (): Promise<void> =>
    invalidateWorkbenchMutation(queryClient, workItem.id);

  const commitDocumentation = useMutation({
    mutationFn: async () => {
      const status = gitStatusQuery.data;
      if (!status) throw new TypeError("Documentation Git status is unavailable");
      return api.commitWorkItemDocumentation(workItem.id, {
        expectedHeadCommit: status.headCommit,
        expectedPaths: status.paths
          .filter((path) =>
            path.state === "MODIFIED" ||
            path.state === "UNTRACKED" ||
            path.state === "DELETED")
          .map((path) => ({
            repositoryPath: path.repositoryPath,
            sha256: path.state === "DELETED" ? null : path.workingTreeSha256,
          })),
      });
    },
    onSuccess: async () => {
      setConfirmGitSave(false);
      await invalidateDocumentation();
    },
    onError: invalidateDocumentation,
  });

  return {
    changedGitPaths,
    commitDocumentation,
    confirmGitSave,
    gitStateLabel,
    gitStatusQuery,
    invalidateDocumentation,
    selectedGitPath,
    setConfirmGitSave,
    sourceQuery,
    workItemDirectory,
  };
};

type DocumentationGitState = ReturnType<typeof useDocumentationGitState>;

const DocumentationControls = ({
  dirty,
  state,
  mutationsDisabled = false,
}: Readonly<{ dirty: boolean; state: DocumentationGitState; mutationsDisabled?: boolean }>) => {
  const blockers = state.gitStatusQuery.data?.blockers ?? [];
  const tone =
    dirty ? "warning" :
    state.gitStatusQuery.isError ? "danger" :
    state.changedGitPaths.length === 0 ? "success" : "info";
  return (
    <div className="order-document-controls" data-testid="document-git-controls">
      <span data-testid="document-git-state"><WorkbenchStatus tone={tone} label={state.gitStateLabel} /></span>
      {state.changedGitPaths.length > 0 ? (
        <WorkbenchAction
          label="Save documentation to Git"
          tone="primary"
          disabled={
            mutationsDisabled ||
            dirty ||
            state.gitStatusQuery.data === undefined ||
            blockers.length > 0 ||
            state.commitDocumentation.isPending
          }
          loading={state.commitDocumentation.isPending}
          onClick={() => state.setConfirmGitSave(true)}
        />
      ) : null}
      {state.gitStatusQuery.isError ? (
        <WorkbenchNotice
          tone="danger"
          title="Git state unavailable"
          description={errorText(state.gitStatusQuery.error)}
        />
      ) : null}
      {blockers.map((blocker) => (
        <WorkbenchNotice
          key={blocker}
          tone="warning"
          title="Documentation cannot be saved to Git"
          description={gitBlockerText(blocker)}
        />
      ))}
      {state.commitDocumentation.error ? (
        <WorkbenchNotice
          tone="danger"
          title="Documentation Git save failed"
          description={errorText(state.commitDocumentation.error)}
        />
      ) : null}
    </div>
  );
};

const DocumentationTechnicalDetails = ({
  selectedRepositoryPath,
  state,
  children,
}: Readonly<{
  selectedRepositoryPath: string | null;
  state: DocumentationGitState;
  children?: ReactNode;
}>) => (
  <>
    <MetadataList columns="single">
      <MetadataListItem label="Selected path">
        <code>{selectedRepositoryPath ?? state.workItemDirectory}</code>
      </MetadataListItem>
      {state.selectedGitPath ? (
        <MetadataListItem label="Working tree">
          <code>{state.selectedGitPath.state.replaceAll("_", " ").toLowerCase()}</code>
        </MetadataListItem>
      ) : null}
      <MetadataListItem label="WorkItem directory">
        <code>{state.workItemDirectory}</code>
      </MetadataListItem>
      {state.gitStatusQuery.data ? (
        <>
          <MetadataListItem label="Branch">
            <code>{state.gitStatusQuery.data.branch ?? "detached HEAD"}</code>
          </MetadataListItem>
          <MetadataListItem label="HEAD">
            <code>{state.gitStatusQuery.data.headCommit}</code>
          </MetadataListItem>
        </>
      ) : null}
    </MetadataList>
    {children}
  </>
);

const DocumentationGitConfirmation = ({
  state,
}: Readonly<{ state: DocumentationGitState }>) => (
  <WorkbenchConfirmation
    open={state.confirmGitSave}
    onOpenChange={state.setConfirmGitSave}
    title="Save WorkItem documentation to Git?"
    description={
      state.changedGitPaths.length === 0
        ? "No governed WorkItem paths differ from HEAD."
        : "Only these governed paths will be committed: " +
          state.changedGitPaths.map((path) => path.repositoryPath).join(", ")
    }
    confirmLabel="Save documentation to Git"
    actionTone="primary"
    pending={state.commitDocumentation.isPending}
    onConfirm={() => state.commitDocumentation.mutate()}
  />
);

const gitSourcePath = (
  workItem: WorkItem,
  repositoryPath: string | null,
): string => repositoryPath ?? workItem.sourcePath;

export const SourceDocumentMaterial = ({
  workItem,
  readOnly = false,
  mutationsDisabled = false,
  onDirtyChange,
  onContextDocumentChange,
}: Readonly<{
  workItem: WorkItem;
  readOnly?: boolean;
  mutationsDisabled?: boolean;
  onDirtyChange: (dirty: boolean) => void;
  onContextDocumentChange: (path: string | null, sha256: Sha256 | null) => void;
}>) => {
  const [dirty, setDirty] = useState(false);
  const sourceReadOnly =
    readOnly ||
    mutationsDisabled ||
    workItem.stage === "EXECUTION" ||
    workItem.stage === "COMPLETE";
  const git = useDocumentationGitState(workItem, dirty, gitSourcePath(workItem, null));
  const selectedRepositoryPath = git.sourceQuery.data?.path ?? workItem.sourcePath;

  useEffect(() => {
    onContextDocumentChange(selectedRepositoryPath, git.sourceQuery.data?.sha256 ?? null);
  }, [git.sourceQuery.data?.sha256, onContextDocumentChange, selectedRepositoryPath]);

  if (git.sourceQuery.isPending) {
    return (
      <section className="order-document-material" data-testid="source-document-material">
        {!sourceReadOnly ? <DocumentationControls dirty={dirty} state={git} /> : null}
        <WorkbenchState kind="loading" title="Loading work request…" />
      </section>
    );
  }
  if (git.sourceQuery.isError || !git.sourceQuery.data) {
    return (
      <section className="order-document-material" data-testid="source-document-material">
        <WorkbenchState
          kind="error"
          title="Work request unavailable"
          description={errorText(git.sourceQuery.error)}
        />
      </section>
    );
  }

  return (
    <section className="order-document-material" data-testid="source-document-material">
      <MarkdownEditor
        key={"source-" + workItem.id}
        title="WorkItem source"
        description={
          readOnly
            ? "Read-only supporting Work request context."
            : sourceReadOnly
              ? "Read-only in execution/completed state."
              : "Canonical human-authored work definition."
        }
        sha256={git.sourceQuery.data.sha256}
        markdown={git.sourceQuery.data.bodyMarkdown}
        readOnly={sourceReadOnly}
        onDirtyChange={(value) => {
          setDirty(value);
          onDirtyChange(value);
        }}
        onSave={async (expectedSha256, value) => {
          try {
            return await api.saveWorkItemSourceBody(workItem.id, {
              expectedSha256,
              bodyMarkdown: value,
            });
          } finally {
            await git.invalidateDocumentation();
          }
        }}
        toolbarAccessory={
          sourceReadOnly ? undefined : <DocumentationControls dirty={dirty} state={git} mutationsDisabled={mutationsDisabled} />
        }
        technicalDetails={
          <DocumentationTechnicalDetails
            selectedRepositoryPath={selectedRepositoryPath}
            state={git}
          >
            <div className="order-source-technical">
              <strong>Complete portable source</strong>
              <pre><code>{git.sourceQuery.data.markdown}</code></pre>
            </div>
          </DocumentationTechnicalDetails>
        }
      />
      {!sourceReadOnly ? <DocumentationGitConfirmation state={git} /> : null}
    </section>
  );
};

export const LifecycleDocumentMaterial = ({
  workItem,
  artifactId,
  readOnly = false,
  mutationsDisabled = false,
  onDirtyChange,
  onOpenArtifactEvidence,
  onContextDocumentChange,
}: Readonly<{
  workItem: WorkItem;
  artifactId: ArtifactRef["id"];
  readOnly?: boolean;
  mutationsDisabled?: boolean;
  onDirtyChange: (dirty: boolean) => void;
  onOpenArtifactEvidence: (artifactId: ArtifactRef["id"]) => void;
  onContextDocumentChange: (path: string | null, sha256: Sha256 | null) => void;
}>) => {
  const [dirty, setDirty] = useState(false);
  const artifactsQuery = useQuery({
    queryKey: workbenchQueryKeys.lifecycleArtifacts(workItem.id),
    queryFn: () => api.listLifecycleArtifacts(workItem.id),
  });
  const selectedArtifact =
    (artifactsQuery.data ?? []).find((artifact) => artifact.id === artifactId) ?? null;
  const contentQuery = useQuery({
    queryKey: workbenchQueryKeys.artifactContent(selectedArtifact?.id ?? null),
    queryFn: () => {
      if (!selectedArtifact) throw new TypeError("lifecycle artifact selection required");
      return api.readArtifactContent(selectedArtifact.id);
    },
    enabled: selectedArtifact !== null,
  });
  const selectedRepositoryPath = selectedArtifact?.repositoryPath ?? null;
  const git = useDocumentationGitState(
    workItem,
    dirty,
    gitSourcePath(workItem, selectedRepositoryPath),
  );

  useEffect(() => {
    onContextDocumentChange(
      selectedArtifact?.repositoryPath ?? null,
      selectedArtifact?.sha256 ?? null,
    );
  }, [
    onContextDocumentChange,
    selectedArtifact?.repositoryPath,
    selectedArtifact?.sha256,
  ]);

  if (artifactsQuery.isPending || contentQuery.isPending) {
    return <section className="order-document-material" data-testid="lifecycle-document-material"><WorkbenchState kind="loading" title="Loading lifecycle document…" /></section>;
  }
  if (artifactsQuery.isError || contentQuery.isError) {
    const error = artifactsQuery.error ?? contentQuery.error;
    return <section className="order-document-material" data-testid="lifecycle-document-material"><WorkbenchState kind="error" title="Lifecycle document unavailable" description={errorText(error)} /></section>;
  }
  if (!selectedArtifact || !contentQuery.data) {
    return <section className="order-document-material" data-testid="lifecycle-document-material"><WorkbenchState kind="empty" title="Lifecycle document is no longer current" /></section>;
  }

  const markdown = decodeCanonicalMarkdown(contentQuery.data);
  const artifactReadOnly =
    readOnly ||
    mutationsDisabled ||
    !artifactDirectEditIsAllowed(workItem, selectedArtifact);

  return (
    <section className="order-document-material" data-testid="lifecycle-document-material">
      {markdown === null ? (
        <WorkbenchNotice
          tone="warning"
          title="Lifecycle document is not canonical editable Markdown"
          description={
            <span>
              The exact bytes remain inspection-only and will not be normalized or overwritten.
              <span className="order-inline-actions">
                <WorkbenchAction
                  label="Inspect exact bytes"
                  onClick={() => onOpenArtifactEvidence(selectedArtifact.id)}
                />
                {!artifactReadOnly ? <DocumentationControls dirty={dirty} state={git} mutationsDisabled={mutationsDisabled} /> : null}
              </span>
            </span>
          }
        />
      ) : (
        <MarkdownEditor
          key={selectedArtifact.id}
          title={lifecycleArtifactLabel(selectedArtifact.role) + " document"}
          description={
            artifactReadOnly
              ? "Read-only in the current lifecycle state."
              : selectedArtifact.repositoryPath
          }
          sha256={selectedArtifact.sha256}
          markdown={markdown}
          readOnly={artifactReadOnly}
          onDirtyChange={(value) => {
            setDirty(value);
            onDirtyChange(value);
          }}
          onSave={async (expectedSha256, value) => {
            try {
              return await api.saveArtifactContent(selectedArtifact.id, {
                expectedSha256,
                markdown: value,
              });
            } finally {
              await git.invalidateDocumentation();
            }
          }}
          toolbarAccessory={
            artifactReadOnly ? undefined : <DocumentationControls dirty={dirty} state={git} mutationsDisabled={mutationsDisabled} />
          }
          technicalDetails={
            <DocumentationTechnicalDetails
              selectedRepositoryPath={selectedArtifact.repositoryPath}
              state={git}
            />
          }
        />
      )}
      {!artifactReadOnly ? <DocumentationGitConfirmation state={git} /> : null}
    </section>
  );
};

export const ReadOnlyLifecycleDocumentMaterial = (
  props: Readonly<{
    workItem: WorkItem;
    artifactId: ArtifactRef["id"];
    onOpenArtifactEvidence: (artifactId: ArtifactRef["id"]) => void;
    onContextDocumentChange: (path: string | null, sha256: Sha256 | null) => void;
  }>,
) => (
  <LifecycleDocumentMaterial
    {...props}
    readOnly
    onDirtyChange={() => {}}
  />
);
