import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertDialog } from "@astryxdesign/core/AlertDialog";
import { Tab, TabList } from "@astryxdesign/core/TabList";

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
import {
  lifecycleArtifactLabel,
  lifecycleArtifactRoleRank,
  type WorkflowDocumentTarget,
} from "./workbench-presentation.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchEmptyState, WorkbenchErrorState } from "./primitives/WorkbenchState.tsx";

type SelectedDocument =
  | Readonly<{ kind: "SOURCE" }>
  | Readonly<{ kind: "ARTIFACT"; id: ArtifactRef["id"] }>;

const errorText = (value: unknown): string => value instanceof Error ? value.message : String(value);

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
    const parsed = MarkdownTextSchema.safeParse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
};

export const DocumentWorkspace = ({
  workItem,
  onDirtyChange,
  onOpenArtifactEvidence,
  requestedDocument,
  onContextDocumentChange,
}: Readonly<{
  workItem: WorkItem;
  onDirtyChange: (dirty: boolean) => void;
  onOpenArtifactEvidence: (artifactId: ArtifactRef["id"]) => void;
  requestedDocument?: Readonly<{
    document: WorkflowDocumentTarget;
    requestId: number;
  }> | null;
  onContextDocumentChange: (path: string | null, sha256: Sha256 | null) => void;
}>) => {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<SelectedDocument>({ kind: "SOURCE" });
  const [selectionInitialized, setSelectionInitialized] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<SelectedDocument | null>(null);
  const [confirmGitSave, setConfirmGitSave] = useState(false);
  const [requestedUnavailable, setRequestedUnavailable] =
    useState<WorkflowDocumentTarget | null>(null);

  const sourceQuery = useQuery({ queryKey: workbenchQueryKeys.workItemSource(workItem.id), queryFn: () => api.getWorkItemSource(workItem.id) });
  const artifactsQuery = useQuery({ queryKey: workbenchQueryKeys.lifecycleArtifacts(workItem.id), queryFn: () => api.listLifecycleArtifacts(workItem.id) });
  const gitStatusQuery = useQuery({
    queryKey: workbenchQueryKeys.workItemDocumentationGitStatus(workItem.id),
    queryFn: () => api.getWorkItemDocumentationGitStatus(workItem.id),
  });
  const artifacts = useMemo(
    () => [...(artifactsQuery.data ?? [])].sort((a, b) => lifecycleArtifactRoleRank(a.role) - lifecycleArtifactRoleRank(b.role)),
    [artifactsQuery.data],
  );

  useEffect(() => {
    if (selectionInitialized || artifactsQuery.isPending) return;
    if (
      workItem.stage === "R1" ||
      workItem.stage === "R2" ||
      workItem.stage === "DESIGN" ||
      workItem.stage === "PLAN" ||
      workItem.stage === "R3"
    ) {
      const current = artifacts.find((artifact) => artifact.role === workItem.stage);
      if (current) setSelected({ kind: "ARTIFACT", id: current.id });
    }
    setSelectionInitialized(true);
  }, [artifacts, artifactsQuery.isPending, selectionInitialized, workItem.stage]);

  const selectedArtifact = selected.kind === "ARTIFACT" ? artifacts.find((item) => item.id === selected.id) ?? null : null;
  const contentQuery = useQuery({
    queryKey: workbenchQueryKeys.artifactContent(selectedArtifact?.id ?? null),
    queryFn: () => {
      if (!selectedArtifact) throw new TypeError("lifecycle artifact selection required");
      return api.readArtifactContent(selectedArtifact.id);
    },
    enabled: selectedArtifact !== null,
  });
  const markdown = contentQuery.data === undefined ? null : decodeCanonicalMarkdown(contentQuery.data);
  const selectedRepositoryPath = selected.kind === "SOURCE"
    ? sourceQuery.data?.path ?? null
    : selectedArtifact?.repositoryPath ?? null;
  const selectedGitPath = selectedRepositoryPath === null
    ? null
    : gitStatusQuery.data?.paths.find((path) => path.repositoryPath === selectedRepositoryPath) ?? null;
  const changedGitPaths = gitStatusQuery.data?.paths.filter((path) => path.state !== "MATCHES_HEAD") ?? [];
  const workItemDirectory = sourceQuery.data?.path.includes("/")
    ? sourceQuery.data.path.slice(0, sourceQuery.data.path.lastIndexOf("/"))
    : sourceQuery.data?.path ?? workItem.sourcePath.slice(0, Math.max(0, workItem.sourcePath.lastIndexOf("/")));
  const gitStateLabel = dirty
    ? "Unsaved edits"
    : gitStatusQuery.isPending
      ? "Checking Git…"
      : gitStatusQuery.isError || gitStatusQuery.data === undefined
        ? "Git state unavailable"
        : changedGitPaths.length === 0
          ? "Saved to Git"
          : "Saved to project, not Git";

  const invalidate = async (): Promise<void> => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.workItems }),
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.workItemSource(workItem.id) }),
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.lifecycleArtifacts(workItem.id) }),
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.artifacts(workItem.id) }),
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.signoffPackage(workItem.id) }),
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
            sha256: path.state === "DELETED" ? null : path.workingTreeSha256,
          })),
      });
    },
    onSuccess: async () => {
      setConfirmGitSave(false);
      await invalidate();
    },
  });

  const select = (next: SelectedDocument): void => {
    if (dirty) setPendingSelection(next);
    else setSelected(next);
  };

  useEffect(() => {
    if (requestedDocument === null || requestedDocument === undefined) return;
    if (artifactsQuery.isPending) return;
    setRequestedUnavailable(null);
    if (requestedDocument.document === "SOURCE") {
      select({ kind: "SOURCE" });
      return;
    }
    const artifact = artifacts.find(
      (item) => item.role === requestedDocument.document,
    );
    if (artifact === undefined) {
      setRequestedUnavailable(requestedDocument.document);
      return;
    }
    select({ kind: "ARTIFACT", id: artifact.id });
  }, [
    artifacts,
    artifactsQuery.isPending,
    requestedDocument?.requestId,
  ]);

  useEffect(() => {
    if (selected.kind === "SOURCE") {
      onContextDocumentChange(workItem.sourcePath, sourceQuery.data?.sha256 ?? null);
      return;
    }
    onContextDocumentChange(
      selectedArtifact?.repositoryPath ?? null,
      selectedArtifact?.sha256 ?? null,
    );
  }, [
    onContextDocumentChange,
    selected.kind,
    selectedArtifact?.repositoryPath,
    selectedArtifact?.sha256,
    sourceQuery.data?.sha256,
    workItem.sourcePath,
  ]);

  const sourceReadOnly = workItem.stage === "EXECUTION" || workItem.stage === "COMPLETE";
  const artifactReadOnly = selectedArtifact === null || !artifactDirectEditIsAllowed(workItem, selectedArtifact);

  const documentationControls = (
    <div className="order-document-toolbar-controls" data-testid="document-git-controls">
      <span className="order-document-git-state" data-testid="document-git-state">
        {gitStateLabel}
      </span>
      {changedGitPaths.length > 0 ? (
        <WorkbenchAction
          label="Save documentation to Git"
          tone="primary"
          disabled={
            dirty ||
            gitStatusQuery.data === undefined ||
            gitStatusQuery.data.blockers.length > 0 ||
            commitDocumentation.isPending
          }
          loading={commitDocumentation.isPending}
          onClick={() => setConfirmGitSave(true)}
        />
      ) : null}
      {gitStatusQuery.isError ? (
        <span className="order-error-text">{errorText(gitStatusQuery.error)}</span>
      ) : null}
      {gitStatusQuery.data?.blockers.map((blocker) => (
        <span key={blocker} className="order-warning-text">{gitBlockerText(blocker)}</span>
      ))}
      {commitDocumentation.error ? (
        <span className="order-error-text">{errorText(commitDocumentation.error)}</span>
      ) : null}
    </div>
  );

  const documentationTechnicalDetails = (
    <div className="order-document-technical-details">
      <div><span>Selected path</span><code>{selectedRepositoryPath ?? workItemDirectory}</code></div>
      {selectedGitPath ? (
        <div>
          <span>Working tree</span>
          <code>{selectedGitPath.state.replaceAll("_", " ").toLowerCase()}</code>
        </div>
      ) : null}
      <div><span>WorkItem directory</span><code>{workItemDirectory}</code></div>
      {gitStatusQuery.data ? (
        <>
          <div><span>Branch</span><code>{gitStatusQuery.data.branch ?? "detached HEAD"}</code></div>
          <div><span>HEAD</span><code>{gitStatusQuery.data.headCommit}</code></div>
        </>
      ) : null}
    </div>
  );

  return (
    <section className="order-workspace-section" data-testid="document-workspace">
      <div className="order-document-nav" data-testid="governed-document-nav">
        <TabList
          value={selected.kind === "SOURCE" ? "SOURCE" : selected.id}
          onChange={(value) => {
            if (value === "SOURCE") select({ kind: "SOURCE" });
            else {
              const artifact = artifacts.find((item) => item.id === value);
              if (artifact) select({ kind: "ARTIFACT", id: artifact.id });
            }
          }}
          role="tablist"
          overflow="scroll"
        >
          <Tab value="SOURCE" label="Work request" />
          {artifacts.map((artifact) => (
            <Tab key={artifact.id} value={artifact.id} label={lifecycleArtifactLabel(artifact.role)} />
          ))}
        </TabList>
      </div>

      <div className="order-document-canvas">
        {requestedUnavailable !== null ? (
          <WorkbenchEmptyState
            compact
            title={requestedUnavailable + " material is not available"}
            description="This reached workflow step has no current canonical lifecycle document to inspect."
          />
        ) : selected.kind === "SOURCE" ? (
          sourceQuery.isPending ? <WorkbenchEmptyState compact title="Loading source…" /> :
          sourceQuery.isError ? <WorkbenchErrorState title="Source unavailable" description={errorText(sourceQuery.error)} /> :
          sourceQuery.data ? (
            <div className="order-source-authoring">
              <MarkdownEditor
                key={"source-" + workItem.id}
                title="WorkItem source"
                description={sourceReadOnly ? "Read-only in execution/completed state." : "Canonical human-authored work definition."}
                sha256={sourceQuery.data.sha256}
                markdown={sourceQuery.data.bodyMarkdown}
                readOnly={sourceReadOnly}
                onDirtyChange={(value) => { setDirty(value); onDirtyChange(value); }}
                onSave={async (expectedSha256, value) => {
                  const result = await api.saveWorkItemSourceBody(workItem.id, {
                    expectedSha256,
                    bodyMarkdown: value,
                  });
                  await invalidate();
                  return result;
                }}
                toolbarAccessory={documentationControls}
                technicalDetails={
                  <>
                    {documentationTechnicalDetails}
                    <div className="order-source-technical">
                      <strong>Complete portable source</strong>
                      <pre><code>{sourceQuery.data.markdown}</code></pre>
                    </div>
                  </>
                }
              />
            </div>
          ) : null
        ) : selectedArtifact === null ? (
          <WorkbenchEmptyState compact title="Lifecycle document is no longer current" />
        ) : contentQuery.isPending ? (
          <WorkbenchEmptyState compact title="Loading lifecycle document…" />
        ) : contentQuery.isError ? (
          <WorkbenchErrorState title="Lifecycle document unavailable" description={errorText(contentQuery.error)} />
        ) : contentQuery.data && markdown === null ? (
          <div className="order-state">
            <strong>Lifecycle document is not canonical editable Markdown</strong>
            <div>The exact bytes remain inspection-only and will not be normalized or overwritten.</div>
            <div className="order-inline-actions">
              <WorkbenchAction label="Inspect exact bytes" onClick={() => onOpenArtifactEvidence(selectedArtifact.id)} />
              {documentationControls}
            </div>
          </div>
        ) : contentQuery.data && markdown !== null ? (
          <MarkdownEditor
            key={selectedArtifact.id}
            title={lifecycleArtifactLabel(selectedArtifact.role) + " document"}
            description={artifactReadOnly ? "Read-only in the current lifecycle state." : selectedArtifact.repositoryPath}
            sha256={selectedArtifact.sha256}
            markdown={markdown}
            readOnly={artifactReadOnly}
            onDirtyChange={(value) => { setDirty(value); onDirtyChange(value); }}
            onSave={async (expectedSha256, value) => {
              const result = await api.saveArtifactContent(selectedArtifact.id, { expectedSha256, markdown: value });
              await invalidate();
              return result;
            }}
            toolbarAccessory={documentationControls}
            technicalDetails={documentationTechnicalDetails}
          />
        ) : null}
      </div>

      <AlertDialog
        isOpen={confirmGitSave}
        onOpenChange={setConfirmGitSave}
        title="Save WorkItem documentation to Git?"
        description={
          changedGitPaths.length === 0
            ? "No governed WorkItem paths differ from HEAD."
            : "Only these governed paths will be committed: " +
              changedGitPaths.map((path) => path.repositoryPath).join(", ")
        }
        cancelLabel="Cancel"
        actionLabel="Save documentation to Git"
        onAction={() => commitDocumentation.mutate()}
      />

      <AlertDialog
        isOpen={pendingSelection !== null}
        onOpenChange={(open) => { if (!open) setPendingSelection(null); }}
        title="Discard unsaved Markdown?"
        description="Changing documents would discard the current unsaved Markdown buffer."
        cancelLabel="Continue editing"
        actionLabel="Discard unsaved changes"
        actionVariant="destructive"
        onAction={() => {
          const next = pendingSelection;
          setPendingSelection(null);
          setDirty(false);
          onDirtyChange(false);
          if (next) setSelected(next);
        }}
      />
    </section>
  );
};
