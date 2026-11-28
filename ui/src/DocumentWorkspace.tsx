import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  MarkdownTextSchema,
  type ArtifactRef,
  type Sha256,
  type WorkItem,
  type WorkItemDocumentGitPathStatus,
  type WorkItemSchemaCatalogEntry,
} from "../../src/core/contracts.ts";
import { artifactDirectEditIsAllowed, artifactReturnOwner, type MaterialPresentationState } from "../../src/core/lifecycle.ts";
import * as api from "./http.ts";
import {
  invalidateWorkbenchMutation,
  workbenchQueryKeys,
} from "./query-keys.ts";
import { MarkdownEditor } from "./MarkdownEditor.tsx";
import { lifecycleArtifactLabel, materialPresentationStateLabel, workflowPresentation } from "./workbench-presentation.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchConfirmation } from "./primitives/WorkbenchConfirmation.tsx";
import { WorkbenchDocument } from "./primitives/WorkbenchDocument.tsx";
import { WorkbenchFacts } from "./primitives/WorkbenchFacts.tsx";
import { WorkbenchNotice } from "./primitives/WorkbenchNotice.tsx";
import { WorkbenchState } from "./primitives/WorkbenchState.tsx";
import { WorkbenchStatus, type WorkbenchStatusTone } from "./primitives/WorkbenchStatus.tsx";

const materialMaturityTone = (state: MaterialPresentationState): WorkbenchStatusTone => {
  switch (state.tag) {
    case "CURRENT": return "success";
    case "STALE":
    case "UPDATED_VALIDATION_REQUIRED": return "warning";
    case "DRAFT":
    case "HISTORICAL":
    case "SIGNED_LOCKED": return "neutral";
  }
};

const DocumentMaturity = ({ state }: Readonly<{ state: MaterialPresentationState }>) => (
  <span data-testid="document-maturity">
    <WorkbenchStatus tone={materialMaturityTone(state)} label={materialPresentationStateLabel(state)} />
  </span>
);

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

const committablePath = (
  path: WorkItemDocumentGitPathStatus,
): boolean =>
  path.state === "MODIFIED" ||
  path.state === "UNTRACKED" ||
  path.state === "DELETED";

const useDocumentationGitProjection = (
  workItem: WorkItem,
  dirty: boolean,
  selectedRepositoryPath: string | null,
) => {
  const queryClient = useQueryClient();
  const [reviewOpen, setReviewOpen] = useState(false);

  const sourceQuery = useQuery({
    queryKey: workbenchQueryKeys.workItemSource(workItem.id),
    queryFn: () => api.getWorkItemSource(workItem.id),
  });
  const statusQuery = useQuery({
    queryKey: workbenchQueryKeys.workItemDocumentationGitStatus(workItem.id),
    queryFn: () => api.getWorkItemDocumentationGitStatus(workItem.id),
  });

  const changedPaths =
    statusQuery.data?.paths.filter((path) => path.state !== "MATCHES_HEAD") ?? [];
  const selectedPath = selectedRepositoryPath === null
    ? null
    : statusQuery.data?.paths.find(
        (path) => path.repositoryPath === selectedRepositoryPath,
      ) ?? null;
  const sourcePath = sourceQuery.data?.path ?? workItem.sourcePath;
  const workItemDirectory = sourcePath.includes("/")
    ? sourcePath.slice(0, sourcePath.lastIndexOf("/"))
    : sourcePath;

  const statusLabel = dirty
    ? "Unsaved edits"
    : statusQuery.isPending
      ? "Checking Git…"
      : statusQuery.isError || statusQuery.data === undefined
        ? "Git state unavailable"
        : changedPaths.length === 0
          ? "Saved to Git"
          : "Saved to project, not Git";

  const invalidateDocumentation = (): Promise<void> =>
    invalidateWorkbenchMutation(queryClient, workItem.id);

  const commit = useMutation({
    mutationFn: async () => {
      const status = statusQuery.data;
      if (status === undefined) {
        throw new TypeError("Documentation Git status is unavailable");
      }
      return api.commitWorkItemDocumentation(workItem.id, {
        expectedHeadCommit: status.headCommit,
        expectedPaths: status.paths
          .filter(committablePath)
          .map((path) => ({
            repositoryPath: path.repositoryPath,
            sha256: path.state === "DELETED" ? null : path.workingTreeSha256,
          })),
      });
    },
    onSuccess: async () => {
      setReviewOpen(false);
      await invalidateDocumentation();
    },
    onError: invalidateDocumentation,
  });

  return {
    changedPaths,
    commit,
    reviewOpen,
    selectedPath,
    setReviewOpen,
    sourceQuery,
    statusLabel,
    statusQuery,
    workItemDirectory,
  };
};

type DocumentationGitProjection = ReturnType<
  typeof useDocumentationGitProjection
>;

const documentationGitTone = (
  dirty: boolean,
  projection: DocumentationGitProjection,
): "warning" | "danger" | "success" | "info" =>
  dirty
    ? "warning"
    : projection.statusQuery.isError
      ? "danger"
      : projection.statusQuery.data === undefined
        ? "info"
        : projection.changedPaths.length === 0
          ? "success"
          : "info";

const DocumentationGitAction = ({
  dirty,
  projection,
  mutationsDisabled = false,
}: Readonly<{
  dirty: boolean;
  projection: DocumentationGitProjection;
  mutationsDisabled?: boolean;
}>) => {
  const blockers = projection.statusQuery.data?.blockers ?? [];
  return (
    <span data-testid="document-git-controls" className="order-document-git-action">
      {projection.changedPaths.length === 0 ? null : (
        <WorkbenchAction
          label="Save documentation to Git"
          tone="primary"
          disabled={
            mutationsDisabled ||
            dirty ||
            projection.statusQuery.data === undefined ||
            blockers.length > 0 ||
            projection.commit.isPending
          }
          loading={projection.commit.isPending}
          onClick={() => projection.setReviewOpen(true)}
        />
      )}
    </span>
  );
};

const DocumentationGitFeedback = ({
  projection,
}: Readonly<{ projection: DocumentationGitProjection }>) => {
  const blockers = projection.statusQuery.data?.blockers ?? [];
  return projection.statusQuery.isError ||
    blockers.length > 0 ||
    projection.commit.error ? (
    <div className="order-document-git-feedback">
      {projection.statusQuery.isError ? (
        <WorkbenchNotice
          tone="danger"
          title="Git state unavailable"
          description={errorText(projection.statusQuery.error)}
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
      {projection.commit.error ? (
        <WorkbenchNotice
          tone="danger"
          title="Documentation Git save failed"
          description={errorText(projection.commit.error)}
        />
      ) : null}
    </div>
  ) : null;
};

const DocumentationGitReview = ({
  projection,
}: Readonly<{ projection: DocumentationGitProjection }>) => {
  return (
    <WorkbenchConfirmation
      kind="safety"
      open={projection.reviewOpen}
      onOpenChange={projection.setReviewOpen}
      title="Save WorkItem documentation to Git?"
      description={<>
        <p>Only the exact governed paths reviewed in WorkItemDocumentationGitStatus will be committed.</p>
        <ul className="order-document-reviewed-paths">
          {projection.changedPaths.map((path) => (
            <li key={path.repositoryPath}><code>{path.repositoryPath}</code><span>{"[" + path.state + "]"}</span></li>
          ))}
        </ul>
      </>}
      confirmLabel="Save documentation to Git"
      pending={projection.commit.isPending}
      onConfirm={() => projection.commit.mutate()}
    />
  );
};

const repositoryPathForGit = (
  workItem: WorkItem,
  selectedRepositoryPath: string | null,
): string => selectedRepositoryPath ?? workItem.sourcePath;

const humanKindLabel = (
  kind: WorkItemSchemaCatalogEntry["kind"],
): string => kind.charAt(0) + kind.slice(1).toLowerCase();

export const SourceDocumentMaterial = ({
  workItem,
  readOnly = false,
  mutationsDisabled = false,
  authoringLocked = false,
  authoringBlockedReason,
  onDirtyChange,
  onContextDocumentChange,
  onMutationError,
}: Readonly<{
  workItem: WorkItem;
  readOnly?: boolean;
  mutationsDisabled?: boolean;
  authoringLocked?: boolean;
  authoringBlockedReason?: string;
  onDirtyChange: (dirty: boolean) => void;
  onContextDocumentChange: (
    path: string | null,
    sha256: Sha256 | null,
    artifactId?: ArtifactRef["id"] | null,
  ) => void;
  onMutationError?: (error: unknown) => void;
}>) => {
  const queryClient = useQueryClient();
  const [dirty, setDirty] = useState(false);
  const sourceReadOnly =
    readOnly ||
    authoringLocked ||
    workItem.stage === "EXECUTION" ||
    workItem.stage === "COMPLETE";
  const git = useDocumentationGitProjection(
    workItem,
    dirty,
    repositoryPathForGit(workItem, null),
  );
  const schemasQuery = useQuery({
    queryKey: workbenchQueryKeys.workItemSchemas,
    queryFn: api.listWorkItemSchemas,
  });
  const selectedRepositoryPath =
    git.sourceQuery.data?.path ?? workItem.sourcePath;

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

  if (git.sourceQuery.isPending || schemasQuery.isPending) {
    return (
      <div className="order-document-material" data-testid="source-document-material">
        <WorkbenchState kind="loading" title="Loading work request…" />
      </div>
    );
  }

  if (
    git.sourceQuery.isError ||
    git.sourceQuery.data === undefined ||
    schemasQuery.isError ||
    schemasQuery.data === undefined
  ) {
    return (
      <div className="order-document-material" data-testid="source-document-material">
        <WorkbenchState
          kind="error"
          title="Work request unavailable"
          description={errorText(git.sourceQuery.error ?? schemasQuery.error)}
        />
      </div>
    );
  }

  const source = git.sourceQuery.data;
  const sourceSchema = schemasQuery.data.find(
    (schema) => schema.schemaId === source.metadata.schemaId,
  );
  if (sourceSchema === undefined) {
    return (
      <div className="order-document-material" data-testid="source-document-material">
        <WorkbenchState
          kind="error"
          title="Work request schema unavailable"
          description="The current Work request schema is not present in the governed schema catalog."
        />
      </div>
    );
  }

  const gitStatus = sourceReadOnly ? (
    <WorkbenchStatus tone="neutral" label="Read-only" />
  ) : (
    <span data-testid="document-git-state">
      <WorkbenchStatus
        tone={documentationGitTone(dirty, git)}
        label={git.statusLabel}
      />
    </span>
  );

  return (
    <div className="order-document-material" data-testid="source-document-material">
      <WorkbenchDocument
        title="Work request"
        description={
          readOnly
            ? "Read-only supporting Work request context."
            : workItem.stage === "EXECUTION" || workItem.stage === "COMPLETE"
              ? "Read-only in execution/completed state."
              : mutationsDisabled
                ? authoringBlockedReason ?? "Document authoring is unavailable while the current workflow state is reconciled."
                : "Canonical human-authored work definition."
        }
        status={gitStatus}
        action={
          sourceReadOnly ? undefined : (
            <DocumentationGitAction
              dirty={dirty}
              projection={git}
              mutationsDisabled={mutationsDisabled}
            />
          )
        }
        details={{
          label: "Work request context",
          content: (
            <WorkbenchFacts
              label="Work request context"
              items={[
              {
                id: "work-type",
                label: "Work type",
                value: humanKindLabel(sourceSchema.kind),
              },
              {
                id: "project",
                label: "Project",
                value: source.metadata.projectId,
              },
              {
                id: "concerns",
                label: "Concerns",
                value:
                  source.metadata.concernIds.length === 0
                    ? "—"
                    : source.metadata.concernIds.join(", "),
              },
              {
                id: "repository-path",
                label: "Repository path",
                value: source.path,
              },
              {
                id: "workitem-documents",
                label: "WorkItem documents",
                value: git.workItemDirectory,
              },
              ]}
            />
          ),
        }}
        content={
          <>
            {sourceReadOnly ? null : <DocumentationGitFeedback projection={git} />}
            <MarkdownEditor
              key={"source-" + workItem.id}
              sourceLabel="WorkItem source"
              sha256={source.sha256}
              markdown={source.bodyMarkdown}
              readOnly={sourceReadOnly}
              saveDisabled={mutationsDisabled}
              saveConsequence={workItem.stage === "IDEA" ? undefined : "Saving a changed Work request returns workflow ownership to Research and invalidates affected downstream conformance. Prior material remains available for inspection."}
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
                } catch (error) {
                  onMutationError?.(error);
                  throw error;
                } finally {
                  await invalidateWorkbenchMutation(queryClient, workItem.id);
                }
              }}
            />
          </>
        }
      />
      {sourceReadOnly ? null : <DocumentationGitReview projection={git} />}
    </div>
  );
};

export const LifecycleDocumentMaterial = ({
  workItem,
  artifactId,
  materialState,
  readOnly = false,
  mutationsDisabled = false,
  authoringBlockedReason,
  onDirtyChange,
  onOpenArtifactEvidence,
  onContextDocumentChange,
  onMutationError,
  embeddedReadOnly = false,
  historicalArtifact,
}: Readonly<{
  workItem: WorkItem;
  artifactId: ArtifactRef["id"];
  materialState: MaterialPresentationState | null;
  readOnly?: boolean;
  mutationsDisabled?: boolean;
  authoringBlockedReason?: string;
  embeddedReadOnly?: boolean;
  historicalArtifact?: ArtifactRef;
  onDirtyChange: (dirty: boolean) => void;
  onOpenArtifactEvidence: (artifactId: ArtifactRef["id"]) => void;
  onContextDocumentChange: (
    path: string | null,
    sha256: Sha256 | null,
    artifactId?: ArtifactRef["id"] | null,
  ) => void;
  onMutationError?: (error: unknown) => void;
}>) => {
  const queryClient = useQueryClient();
  const [dirty, setDirty] = useState(false);

  const artifactsQuery = useQuery({
    queryKey: workbenchQueryKeys.lifecycleArtifacts(workItem.id),
    queryFn: () => api.listLifecycleArtifacts(workItem.id),
    enabled: historicalArtifact === undefined,
  });
  const selectedArtifact =
    historicalArtifact ??
    (artifactsQuery.data ?? []).find((artifact) => artifact.id === artifactId) ??
    null;
  const contentQuery = useQuery({
    queryKey: workbenchQueryKeys.artifactContent(selectedArtifact?.id ?? null),
    queryFn: () => {
      if (selectedArtifact === null) {
        throw new TypeError("lifecycle artifact selection required");
      }
      return api.readArtifactContent(selectedArtifact.id);
    },
    enabled: selectedArtifact !== null,
  });

  const selectedRepositoryPath = selectedArtifact?.repositoryPath ?? null;
  const git = useDocumentationGitProjection(
    workItem,
    dirty,
    repositoryPathForGit(workItem, selectedRepositoryPath),
  );

  useEffect(() => {
    onContextDocumentChange(
      selectedArtifact?.repositoryPath ?? null,
      selectedArtifact?.sha256 ?? null,
      selectedArtifact?.id ?? null,
    );
  }, [
    onContextDocumentChange,
    selectedArtifact?.id,
    selectedArtifact?.repositoryPath,
    selectedArtifact?.sha256,
  ]);

  if (
    (historicalArtifact === undefined && artifactsQuery.isPending) ||
    (selectedArtifact !== null && contentQuery.isPending)
  ) {
    return (
      <div className="order-document-material" data-testid="lifecycle-document-material">
        <WorkbenchState kind="loading" title="Loading lifecycle document…" />
      </div>
    );
  }

  if (
    (historicalArtifact === undefined && artifactsQuery.isError) ||
    contentQuery.isError
  ) {
    const error = historicalArtifact === undefined
      ? artifactsQuery.error ?? contentQuery.error
      : contentQuery.error;
    return (
      <div className="order-document-material" data-testid="lifecycle-document-material">
        <WorkbenchState
          kind="error"
          title="Lifecycle document unavailable"
          description={errorText(error)}
        />
      </div>
    );
  }

  if (selectedArtifact === null || contentQuery.data === undefined) {
    return (
      <div className="order-document-material" data-testid="lifecycle-document-material">
        <WorkbenchState
          kind="empty"
          title="Lifecycle document is no longer current"
        />
      </div>
    );
  }

  const markdown = decodeCanonicalMarkdown(contentQuery.data);
  const artifactReadOnly =
    readOnly ||
    historicalArtifact !== undefined ||
    materialState === null ||
    mutationsDisabled ||
    materialState?.tag === "DRAFT" ||
    materialState?.tag === "HISTORICAL" ||
    materialState?.tag === "SIGNED_LOCKED" ||
    !artifactDirectEditIsAllowed(workItem, selectedArtifact);
  const title = lifecycleArtifactLabel(selectedArtifact.role) + " document";
  const description = embeddedReadOnly && artifactReadOnly
    ? "Read-only supporting governed document."
    : mutationsDisabled && !readOnly && authoringBlockedReason !== undefined
      ? authoringBlockedReason
      : artifactReadOnly
        ? "Read-only in the current lifecycle state."
        : "Canonical governed lifecycle document.";

  const gitStatus = artifactReadOnly ? (
    <WorkbenchStatus tone="neutral" label="Read-only" />
  ) : (
    <span data-testid="document-git-state">
      <WorkbenchStatus
        tone={documentationGitTone(dirty, git)}
        label={git.statusLabel}
      />
    </span>
  );

  const documentContent = markdown === null ? (
    <WorkbenchNotice
      tone="warning"
      title="Lifecycle document is not canonical editable Markdown"
      description={
        <span>
          The exact bytes remain inspection-only and will not be normalized
          or overwritten.
          <span className="order-inline-actions">
            <WorkbenchAction
              label="Inspect exact bytes"
              onClick={() => onOpenArtifactEvidence(selectedArtifact.id)}
            />
          </span>
        </span>
      }
    />
  ) : (
    <>
      {artifactReadOnly ? null : <DocumentationGitFeedback projection={git} />}
      <MarkdownEditor
        key={selectedArtifact.id}
        sourceLabel={title}
        sha256={selectedArtifact.sha256}
        markdown={markdown}
        readOnly={artifactReadOnly}
        saveDisabled={mutationsDisabled}
        saveConsequence={"Saving a changed document returns workflow ownership to " + workflowPresentation(artifactReturnOwner(selectedArtifact)).label + " and invalidates affected downstream conformance. Prior material remains available for inspection."}
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
          } catch (error) {
            onMutationError?.(error);
            throw error;
          } finally {
            await invalidateWorkbenchMutation(queryClient, workItem.id);
          }
        }}
      />
    </>
  );

  return (
    <div className="order-document-material" data-testid="lifecycle-document-material">
      <WorkbenchDocument
        title={title}
        description={description}
        status={<>
          {materialState === null ? null : <DocumentMaturity state={materialState} />}
          {gitStatus}
        </>}
        action={
          artifactReadOnly ? undefined : (
            <DocumentationGitAction
              dirty={dirty}
              projection={git}
              mutationsDisabled={mutationsDisabled}
            />
          )
        }
        details={{
          label: "Document location",
          content: (
            <WorkbenchFacts
              label="Document location"
              items={[
              {
                id: "repository-path",
                label: "Repository path",
                value: selectedArtifact.repositoryPath,
              },
              {
                id: "workitem-documents",
                label: "WorkItem documents",
                value: git.workItemDirectory,
              },
              ]}
            />
          ),
        }}
        content={documentContent}
      />
      {artifactReadOnly ? null : <DocumentationGitReview projection={git} />}
    </div>
  );
};

export const ReadOnlyLifecycleDocumentMaterial = (
  props: Readonly<{
    workItem: WorkItem;
    artifactId: ArtifactRef["id"];
    materialState: MaterialPresentationState | null;
    onOpenArtifactEvidence: (artifactId: ArtifactRef["id"]) => void;
    onContextDocumentChange: (
      path: string | null,
      sha256: Sha256 | null,
      artifactId?: ArtifactRef["id"] | null,
    ) => void;
    embeddedReadOnly?: boolean;
    historicalArtifact?: ArtifactRef;
  }>,
) => (
  <LifecycleDocumentMaterial
    {...props}
    readOnly
    onDirtyChange={() => {}}
  />
);
