import { useEffect, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MetadataList, MetadataListItem } from "@astryxdesign/core/MetadataList";
import { Markdown } from "@astryxdesign/core/Markdown";

import {
  MarkdownTextSchema,
  type ArtifactRef,
  type Sha256,
  type WorkItem,
  type WorkItemDocumentGitPathStatus,
} from "../../src/core/contracts.ts";
import { artifactDirectEditIsAllowed } from "../../src/core/lifecycle.ts";
import * as api from "./http.ts";
import {
  invalidateWorkbenchMutation,
  workbenchQueryKeys,
} from "./query-keys.ts";
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

const DocumentationGitBar = ({
  dirty,
  projection,
  mutationsDisabled = false,
}: Readonly<{
  dirty: boolean;
  projection: DocumentationGitProjection;
  mutationsDisabled?: boolean;
}>) => {
  const blockers = projection.statusQuery.data?.blockers ?? [];
  const tone =
    dirty
      ? "warning"
      : projection.statusQuery.isError
        ? "danger"
        : projection.changedPaths.length === 0
          ? "success"
          : "info";

  return (
    <section
      className="order-document-git-region"
      aria-label="Documentation Git status"
      data-testid="document-git-controls"
    >
      <div className="order-document-git-summary">
        <span data-testid="document-git-state">
          <WorkbenchStatus tone={tone} label={projection.statusLabel} />
        </span>
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
      </div>

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
    </section>
  );
};

const DocumentationTechnicalDetails = ({
  selectedRepositoryPath,
  projection,
  children,
}: Readonly<{
  selectedRepositoryPath: string | null;
  projection: DocumentationGitProjection;
  children?: ReactNode;
}>) => (
  <div className="order-document-technical">
    <MetadataList columns="single">
      <MetadataListItem label="Selected path">
        <code>
          {selectedRepositoryPath ?? projection.workItemDirectory}
        </code>
      </MetadataListItem>
      {projection.selectedPath === null ? null : (
        <MetadataListItem label="Working tree">
          <code>
            {projection.selectedPath.state.replaceAll("_", " ").toLowerCase()}
          </code>
        </MetadataListItem>
      )}
      <MetadataListItem label="WorkItem directory">
        <code>{projection.workItemDirectory}</code>
      </MetadataListItem>
      {projection.statusQuery.data === undefined ? null : (
        <>
          <MetadataListItem label="Branch">
            <code>
              {projection.statusQuery.data.branch ?? "detached HEAD"}
            </code>
          </MetadataListItem>
          <MetadataListItem label="HEAD">
            <code>{projection.statusQuery.data.headCommit}</code>
          </MetadataListItem>
        </>
      )}
    </MetadataList>
    {children}
  </div>
);

const DocumentationGitReview = ({
  projection,
}: Readonly<{ projection: DocumentationGitProjection }>) => {
  const reviewedPaths = projection.changedPaths.map(
    (path) => path.repositoryPath + " [" + path.state + "]",
  );
  return (
    <WorkbenchConfirmation
      kind="safety"
      open={projection.reviewOpen}
      onOpenChange={projection.setReviewOpen}
      title="Save WorkItem documentation to Git?"
      description={[
        "Only the exact governed paths reviewed in WorkItemDocumentationGitStatus will be committed.",
        ...reviewedPaths,
      ].join("\n")}
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

const WorkRequestFacts = ({
  schemaId,
  projectId,
  concernIds,
}: Readonly<{
  schemaId: string;
  projectId: string;
  concernIds: readonly string[];
}>) => (
  <dl className="order-document-facts" aria-label="Work request facts">
    <div>
      <dt>Work type</dt>
      <dd>
        {schemaId.replace("-v1", "").replace("-v2", "")
          .replace(/^./, (value) => value.toUpperCase())}
      </dd>
    </div>
    <div>
      <dt>Project</dt>
      <dd>{projectId}</dd>
    </div>
    <div>
      <dt>Concerns</dt>
      <dd>{concernIds.length === 0 ? "—" : concernIds.join(", ")}</dd>
    </div>
  </dl>
);

const RequirementsAuthorityFacts = ({
  artifact,
  readOnly,
}: Readonly<{
  artifact: ArtifactRef;
  readOnly: boolean;
}>) => (
  <dl className="order-document-facts" aria-label="Requirements authority">
    <div>
      <dt>Status</dt>
      <dd>
        <WorkbenchStatus
          tone="success"
          label={readOnly ? "Reviewed governed material" : "Current governed material"}
        />
      </dd>
    </div>
    <div>
      <dt>Authority</dt>
      <dd>
        <span>Requirements document</span>
        <code>
          {artifact.authorityLayer === null
            ? "Lifecycle authority"
            : artifact.authorityLayer + " lifecycle authority"}
        </code>
      </dd>
    </div>
  </dl>
);

export const SourceDocumentMaterial = ({
  workItem,
  readOnly = false,
  mutationsDisabled = false,
  onDirtyChange,
  onContextDocumentChange,
  onMutationError,
}: Readonly<{
  workItem: WorkItem;
  readOnly?: boolean;
  mutationsDisabled?: boolean;
  onDirtyChange: (dirty: boolean) => void;
  onContextDocumentChange: (
    path: string | null,
    sha256: Sha256 | null,
  ) => void;
  onMutationError?: (error: unknown) => void;
}>) => {
  const queryClient = useQueryClient();
  const [dirty, setDirty] = useState(false);
  const sourceReadOnly =
    readOnly ||
    workItem.stage === "EXECUTION" ||
    workItem.stage === "COMPLETE";
  const git = useDocumentationGitProjection(
    workItem,
    dirty,
    repositoryPathForGit(workItem, null),
  );
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

  if (git.sourceQuery.isPending) {
    return (
      <section className="order-document-screen" data-testid="source-document-material">
        {sourceReadOnly ? null : (
          <DocumentationGitBar
            dirty={dirty}
            projection={git}
            mutationsDisabled={mutationsDisabled}
          />
        )}
        <WorkbenchState kind="loading" title="Loading work request…" />
      </section>
    );
  }

  if (git.sourceQuery.isError || git.sourceQuery.data === undefined) {
    return (
      <section className="order-document-screen" data-testid="source-document-material">
        <WorkbenchState
          kind="error"
          title="Work request unavailable"
          description={errorText(git.sourceQuery.error)}
        />
      </section>
    );
  }

  return (
    <section className="order-document-screen" data-testid="source-document-material">
      <MarkdownEditor
        key={"source-" + workItem.id}
        title="Work request"
        editingTitle="WorkItem source"
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
        saveDisabled={mutationsDisabled}
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
        toolbarAccessory={
          sourceReadOnly ? undefined : (
            <DocumentationGitBar
              dirty={dirty}
              projection={git}
              mutationsDisabled={mutationsDisabled}
            />
          )
        }
        viewAside={
          <WorkRequestFacts
            schemaId={git.sourceQuery.data.metadata.schemaId}
            projectId={git.sourceQuery.data.metadata.projectId}
            concernIds={git.sourceQuery.data.metadata.concernIds}
          />
        }
        technicalDetails={
          <DocumentationTechnicalDetails
            selectedRepositoryPath={selectedRepositoryPath}
            projection={git}
          >
            <section className="order-document-source-bytes" aria-label="Complete portable source">
              <strong>Complete portable source</strong>
              <pre><code>{git.sourceQuery.data.markdown}</code></pre>
            </section>
          </DocumentationTechnicalDetails>
        }
      />
      {sourceReadOnly ? null : <DocumentationGitReview projection={git} />}
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
  onMutationError,
  embeddedReadOnly = false,
  historicalArtifact,
}: Readonly<{
  workItem: WorkItem;
  artifactId: ArtifactRef["id"];
  readOnly?: boolean;
  mutationsDisabled?: boolean;
  embeddedReadOnly?: boolean;
  historicalArtifact?: ArtifactRef;
  onDirtyChange: (dirty: boolean) => void;
  onOpenArtifactEvidence: (artifactId: ArtifactRef["id"]) => void;
  onContextDocumentChange: (
    path: string | null,
    sha256: Sha256 | null,
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
    );
  }, [
    onContextDocumentChange,
    selectedArtifact?.repositoryPath,
    selectedArtifact?.sha256,
  ]);

  if (
    (historicalArtifact === undefined && artifactsQuery.isPending) ||
    contentQuery.isPending
  ) {
    return (
      <section className="order-document-screen" data-testid="lifecycle-document-material">
        <WorkbenchState kind="loading" title="Loading lifecycle document…" />
      </section>
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
      <section className="order-document-screen" data-testid="lifecycle-document-material">
        <WorkbenchState
          kind="error"
          title="Lifecycle document unavailable"
          description={errorText(error)}
        />
      </section>
    );
  }

  if (selectedArtifact === null || contentQuery.data === undefined) {
    return (
      <section className="order-document-screen" data-testid="lifecycle-document-material">
        <WorkbenchState
          kind="empty"
          title="Lifecycle document is no longer current"
        />
      </section>
    );
  }

  const markdown = decodeCanonicalMarkdown(contentQuery.data);
  const artifactReadOnly =
    readOnly ||
    mutationsDisabled ||
    !artifactDirectEditIsAllowed(workItem, selectedArtifact);

  return (
    <section className="order-document-screen" data-testid="lifecycle-document-material">
      {markdown === null ? (
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
                {artifactReadOnly ? null : (
                  <DocumentationGitBar
                    dirty={dirty}
                    projection={git}
                    mutationsDisabled={mutationsDisabled}
                  />
                )}
              </span>
            </span>
          }
        />
      ) : embeddedReadOnly && artifactReadOnly ? (
        <div className="order-document-readonly-body" data-testid="markdown-readonly">
          <Markdown
            contentWidth="var(--order-prose-max-width)"
            contentAlign="start"
          >
            {markdown}
          </Markdown>
        </div>
      ) : (
        <MarkdownEditor
          key={selectedArtifact.id}
          title={lifecycleArtifactLabel(selectedArtifact.role) + " document"}
          description={
            artifactReadOnly
              ? "Read-only in the current lifecycle state."
              : "Canonical governed lifecycle document."
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
            } catch (error) {
              onMutationError?.(error);
              throw error;
            } finally {
              await invalidateWorkbenchMutation(queryClient, workItem.id);
            }
          }}
          toolbarAccessory={
            artifactReadOnly ? undefined : (
              <DocumentationGitBar
                dirty={dirty}
                projection={git}
                mutationsDisabled={mutationsDisabled}
              />
            )
          }
          viewAside={
            selectedArtifact.role === "R2" ? (
              <RequirementsAuthorityFacts
                artifact={selectedArtifact}
                readOnly={artifactReadOnly}
              />
            ) : undefined
          }
          technicalDetails={
            <DocumentationTechnicalDetails
              selectedRepositoryPath={selectedArtifact.repositoryPath}
              projection={git}
            />
          }
        />
      )}
      {artifactReadOnly ? null : <DocumentationGitReview projection={git} />}
    </section>
  );
};

export const ReadOnlyLifecycleDocumentMaterial = (
  props: Readonly<{
    workItem: WorkItem;
    artifactId: ArtifactRef["id"];
    onOpenArtifactEvidence: (artifactId: ArtifactRef["id"]) => void;
    onContextDocumentChange: (
      path: string | null,
      sha256: Sha256 | null,
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
