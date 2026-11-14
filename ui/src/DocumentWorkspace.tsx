import { useEffect, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertDialog } from "@astryxdesign/core/AlertDialog";

import {
  MarkdownTextSchema,
  type ArtifactRef,
  type Sha256,
  type WorkItem,
} from "../../src/core/contracts.ts";
import { artifactDirectEditIsAllowed } from "../../src/core/lifecycle.ts";
import * as api from "./http.ts";
import { workbenchQueryKeys } from "./query-keys.ts";
import { MarkdownEditor } from "./MarkdownEditor.tsx";
import { lifecycleArtifactLabel } from "./workbench-presentation.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import {
  WorkbenchEmptyState,
  WorkbenchErrorState,
} from "./primitives/WorkbenchState.tsx";

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

  const invalidateDocumentation = async (): Promise<void> => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.workItems }),
      queryClient.invalidateQueries({
        queryKey: workbenchQueryKeys.workItemSource(workItem.id),
      }),
      queryClient.invalidateQueries({
        queryKey: workbenchQueryKeys.lifecycleArtifacts(workItem.id),
      }),
      queryClient.invalidateQueries({
        queryKey: workbenchQueryKeys.artifacts(workItem.id),
      }),
      queryClient.invalidateQueries({
        queryKey: workbenchQueryKeys.signoffPackage(workItem.id),
      }),
    ]);
    void queryClient.invalidateQueries({
      queryKey: workbenchQueryKeys.workItemDocumentationGitStatus(workItem.id),
    });
  };

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
            path.state === "DELETED"
          )
          .map((path) => ({
            repositoryPath: path.repositoryPath,
            sha256: path.state === "DELETED"
              ? null
              : path.workingTreeSha256,
          })),
      });
    },
    onSuccess: async () => {
      setConfirmGitSave(false);
      await invalidateDocumentation();
    },
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
}: Readonly<{
  dirty: boolean;
  state: DocumentationGitState;
}>) => (
  <div
    className="order-document-toolbar-controls"
    data-testid="document-git-controls"
  >
    <span className="order-document-git-state" data-testid="document-git-state">
      {state.gitStateLabel}
    </span>
    {state.changedGitPaths.length > 0 ? (
      <WorkbenchAction
        label="Save documentation to Git"
        tone="primary"
        disabled={
          dirty ||
          state.gitStatusQuery.data === undefined ||
          state.gitStatusQuery.data.blockers.length > 0 ||
          state.commitDocumentation.isPending
        }
        loading={state.commitDocumentation.isPending}
        onClick={() => state.setConfirmGitSave(true)}
      />
    ) : null}
    {state.gitStatusQuery.isError ? (
      <span className="order-error-text">
        {errorText(state.gitStatusQuery.error)}
      </span>
    ) : null}
    {state.gitStatusQuery.data?.blockers.map((blocker) => (
      <span key={blocker} className="order-warning-text">
        {gitBlockerText(blocker)}
      </span>
    ))}
    {state.commitDocumentation.error ? (
      <span className="order-error-text">
        {errorText(state.commitDocumentation.error)}
      </span>
    ) : null}
  </div>
);

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
    <div className="order-document-technical-details">
      <div>
        <span>Selected path</span>
        <code>{selectedRepositoryPath ?? state.workItemDirectory}</code>
      </div>
      {state.selectedGitPath ? (
        <div>
          <span>Working tree</span>
          <code>
            {state.selectedGitPath.state.replaceAll("_", " ").toLowerCase()}
          </code>
        </div>
      ) : null}
      <div>
        <span>WorkItem directory</span>
        <code>{state.workItemDirectory}</code>
      </div>
      {state.gitStatusQuery.data ? (
        <>
          <div>
            <span>Branch</span>
            <code>{state.gitStatusQuery.data.branch ?? "detached HEAD"}</code>
          </div>
          <div>
            <span>HEAD</span>
            <code>{state.gitStatusQuery.data.headCommit}</code>
          </div>
        </>
      ) : null}
    </div>
    {children}
  </>
);

const DocumentationGitConfirmation = ({
  state,
}: Readonly<{
  state: DocumentationGitState;
}>) => (
  <AlertDialog
    isOpen={state.confirmGitSave}
    onOpenChange={state.setConfirmGitSave}
    title="Save WorkItem documentation to Git?"
    description={
      state.changedGitPaths.length === 0
        ? "No governed WorkItem paths differ from HEAD."
        : "Only these governed paths will be committed: " +
          state.changedGitPaths
            .map((path) => path.repositoryPath)
            .join(", ")
    }
    cancelLabel="Cancel"
    actionLabel="Save documentation to Git"
    onAction={() => state.commitDocumentation.mutate()}
  />
);

export const SourceDocumentMaterial = ({
  workItem,
  onDirtyChange,
  onContextDocumentChange,
}: Readonly<{
  workItem: WorkItem;
  onDirtyChange: (dirty: boolean) => void;
  onContextDocumentChange: (path: string | null, sha256: Sha256 | null) => void;
}>) => {
  const [dirty, setDirty] = useState(false);
  const sourceReadOnly =
    workItem.stage === "EXECUTION" || workItem.stage === "COMPLETE";
  const git = useDocumentationGitState(
    workItem,
    dirty,
    gitSourcePath(workItem, null),
  );
  const selectedRepositoryPath = git.sourceQuery.data?.path ?? workItem.sourcePath;

  useEffect(() => {
    onContextDocumentChange(
      selectedRepositoryPath,
      git.sourceQuery.data?.sha256 ?? null,
    );
  }, [
    git.sourceQuery.data?.sha256,
    onContextDocumentChange,
    selectedRepositoryPath,
  ]);

  if (git.sourceQuery.isPending) {
    return (
      <section className="order-workspace-section" data-testid="source-document-material">
        <WorkbenchEmptyState compact title="Loading work request…" />
      </section>
    );
  }
  if (git.sourceQuery.isError || !git.sourceQuery.data) {
    return (
      <section className="order-workspace-section" data-testid="source-document-material">
        <WorkbenchErrorState
          title="Work request unavailable"
          description={errorText(git.sourceQuery.error)}
        />
      </section>
    );
  }

  return (
    <section className="order-workspace-section" data-testid="source-document-material">
      <div className="order-source-authoring">
        <MarkdownEditor
          key={"source-" + workItem.id}
          title="WorkItem source"
          description={
            sourceReadOnly
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
            const result = await api.saveWorkItemSourceBody(workItem.id, {
              expectedSha256,
              bodyMarkdown: value,
            });
            await git.invalidateDocumentation();
            return result;
          }}
          toolbarAccessory={
            <DocumentationControls dirty={dirty} state={git} />
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
      </div>
      <DocumentationGitConfirmation state={git} />
    </section>
  );
};

const gitSourcePath = (
  workItem: WorkItem,
  repositoryPath: string | null,
): string => repositoryPath ?? workItem.sourcePath;

export const LifecycleDocumentMaterial = ({
  workItem,
  artifactId,
  readOnly = false,
  onDirtyChange,
  onOpenArtifactEvidence,
  onContextDocumentChange,
}: Readonly<{
  workItem: WorkItem;
  artifactId: ArtifactRef["id"];
  readOnly?: boolean;
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
    (artifactsQuery.data ?? []).find((artifact) => artifact.id === artifactId) ??
    null;
  const contentQuery = useQuery({
    queryKey: workbenchQueryKeys.artifactContent(selectedArtifact?.id ?? null),
    queryFn: () => {
      if (!selectedArtifact) {
        throw new TypeError("lifecycle artifact selection required");
      }
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
    return (
      <section className="order-workspace-section" data-testid="lifecycle-document-material">
        <WorkbenchEmptyState compact title="Loading lifecycle document…" />
      </section>
    );
  }
  if (artifactsQuery.isError || contentQuery.isError) {
    const error = artifactsQuery.error ?? contentQuery.error;
    return (
      <section className="order-workspace-section" data-testid="lifecycle-document-material">
        <WorkbenchErrorState
          title="Lifecycle document unavailable"
          description={errorText(error)}
        />
      </section>
    );
  }
  if (!selectedArtifact || !contentQuery.data) {
    return (
      <section className="order-workspace-section" data-testid="lifecycle-document-material">
        <WorkbenchEmptyState
          compact
          title="Lifecycle document is no longer current"
        />
      </section>
    );
  }

  const markdown = decodeCanonicalMarkdown(contentQuery.data);
  const artifactReadOnly =
    readOnly || !artifactDirectEditIsAllowed(workItem, selectedArtifact);

  return (
    <section className="order-workspace-section" data-testid="lifecycle-document-material">
      {markdown === null ? (
        <div className="order-state">
          <strong>Lifecycle document is not canonical editable Markdown</strong>
          <div>
            The exact bytes remain inspection-only and will not be normalized
            or overwritten.
          </div>
          <div className="order-inline-actions">
            <WorkbenchAction
              label="Inspect exact bytes"
              onClick={() => onOpenArtifactEvidence(selectedArtifact.id)}
            />
            <DocumentationControls dirty={dirty} state={git} />
          </div>
        </div>
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
            const result = await api.saveArtifactContent(selectedArtifact.id, {
              expectedSha256,
              markdown: value,
            });
            await git.invalidateDocumentation();
            return result;
          }}
          toolbarAccessory={
            <DocumentationControls dirty={dirty} state={git} />
          }
          technicalDetails={
            <DocumentationTechnicalDetails
              selectedRepositoryPath={selectedArtifact.repositoryPath}
              state={git}
            />
          }
        />
      )}
      <DocumentationGitConfirmation state={git} />
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
