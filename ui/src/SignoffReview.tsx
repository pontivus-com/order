import { useEffect, useState, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TextInput } from "@astryxdesign/core/TextInput";

import type {
  ArtifactRef,
  ExecutionTask,
  Sha256,
  SignoffPackage,
  SignedTaskDefinition,
  WorkItem,
} from "../../src/core/contracts.ts";
import * as api from "./http.ts";
import { ReadOnlyLifecycleDocumentMaterial } from "./DocumentWorkspace.tsx";
import { invalidateWorkbenchMutation } from "./query-keys.ts";
import { lifecycleArtifactLabel } from "./workbench-presentation.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchIcon } from "./primitives/WorkbenchIcon.tsx";
import { WorkbenchReview } from "./primitives/WorkbenchReview.tsx";
import { WorkbenchResourceList } from "./primitives/WorkbenchResourceList.tsx";
import {
  WorkbenchErrorState,
  WorkbenchState,
} from "./primitives/WorkbenchState.tsx";

type ApprovalSelection =
  | Readonly<{ kind: "OVERVIEW" }>
  | Readonly<{ kind: "DOCUMENT"; artifactId: ArtifactRef["id"] }>
  | Readonly<{ kind: "TASK"; taskId: string }>;

const packageDocumentRoles = new Set<ArtifactRef["role"]>([
  "R1",
  "R2",
  "DESIGN",
  "PLAN",
  "R3",
]);

const resourceItems = (
  prefix: string,
  values: readonly string[],
) => values.map((value, index) => ({
  id: prefix + ":" + index,
  label: value,
}));

const taskStateLabel = (task: SignedTaskDefinition | ExecutionTask): string | null => {
  if (!("state" in task)) return null;
  switch (task.state) {
    case "TODO":
      return "Not started";
    case "RUNNING":
      return "In progress";
    case "CANDIDATE_DONE":
      return "Candidate ready";
    case "ALREADY_SATISFIED":
      return "Already satisfied";
    case "BLOCKED":
      return "Blocked";
  }
};

const taskDetailSections = (
  task: SignedTaskDefinition | ExecutionTask,
) => [
  {
    id: "scope",
    title: "Scope",
    content: (
      <WorkbenchResourceList
        items={resourceItems("scope", task.scope)}
        empty={<WorkbenchState kind="empty" title="No scope entries" />}
      />
    ),
  },
  {
    id: "exclusions",
    title: "Exclusions",
    content: (
      <WorkbenchResourceList
        items={resourceItems("exclusion", task.exclusions)}
        empty={<WorkbenchState kind="empty" title="No exclusions" />}
      />
    ),
  },
  {
    id: "acceptance",
    title: "Acceptance",
    content: (
      <WorkbenchResourceList
        items={resourceItems("acceptance", task.acceptanceRefs)}
        empty={<WorkbenchState kind="empty" title="No acceptance references" />}
      />
    ),
  },
  {
    id: "gates",
    title: "Gates",
    content: (
      <WorkbenchResourceList
        items={resourceItems("gate", task.gateIds)}
        empty={<WorkbenchState kind="empty" title="No gates" />}
      />
    ),
  },
  {
    id: "authority",
    title: "Authority",
    content: (
      <WorkbenchResourceList
        items={resourceItems("authority", task.authorityRefs)}
        empty={<WorkbenchState kind="empty" title="No authority references" />}
      />
    ),
  },
  {
    id: "concerns",
    title: "Concerns",
    content: (
      <WorkbenchResourceList
        items={resourceItems("concern", task.concernIds)}
        empty={<WorkbenchState kind="empty" title="No concerns" />}
      />
    ),
  },
  {
    id: "dependencies",
    title: "Dependencies",
    content: (
      <WorkbenchResourceList
        items={resourceItems("dependency", task.dependsOn)}
        empty={<WorkbenchState kind="empty" title="No dependencies" />}
      />
    ),
  },
  {
    id: "change-surface",
    title: "Expected change surface",
    content: (
      <WorkbenchResourceList
        items={resourceItems("change", task.changeSurface)}
        empty={<WorkbenchState kind="empty" title="No forecast entries" />}
      />
    ),
  },
] as const;

export const SignoffReview = ({
  workItem,
  packageValue,
  packageFetching,
  packageError,
  packageStale = false,
  artifacts,
  artifactsPending,
  artifactsError,
  tasks,
  tasksPending,
  tasksError,
  mutationsDisabled = false,
  reviewNotice,
  reviewAction,
  onOpenArtifactEvidence,
  onContextDocumentChange,
  onMutationError,
}: Readonly<{
  workItem: WorkItem;
  packageValue: SignoffPackage | null;
  packageFetching: boolean;
  packageError: unknown;
  packageStale?: boolean;
  artifacts: readonly ArtifactRef[];
  artifactsPending: boolean;
  artifactsError: unknown;
  tasks: readonly ExecutionTask[];
  tasksPending: boolean;
  tasksError: unknown;
  mutationsDisabled?: boolean;
  reviewNotice?: ReactNode;
  reviewAction?: ReactNode;
  onOpenArtifactEvidence: (artifactId: ArtifactRef["id"]) => void;
  onContextDocumentChange: (path: string | null, sha256: Sha256 | null) => void;
  onMutationError?: (error: unknown) => void;
}>) => {
  const queryClient = useQueryClient();
  const [selection, setSelection] = useState<ApprovalSelection>({ kind: "OVERVIEW" });
  const [approvedBy, setApprovedBy] = useState("");

  const currentApproval = workItem.stage === "AWAITING_SIGNOFF";
  const currentTasks = packageValue?.taskBlock.tasks ?? [];
  const approvalCompleted = !currentApproval && tasks.length > 0;
  const packageArtifacts = artifacts
    .filter((artifact) => packageDocumentRoles.has(artifact.role))
    .sort((left, right) =>
      left.repositoryPath.localeCompare(right.repositoryPath));

  const selectedArtifact =
    selection.kind === "DOCUMENT"
      ? packageArtifacts.find((artifact) => artifact.id === selection.artifactId) ?? null
      : null;
  const selectedTask =
    selection.kind === "TASK"
      ? currentApproval
        ? currentTasks.find((task) => task.id === selection.taskId) ?? null
        : tasks.find((task) => task.id === selection.taskId) ?? null
      : null;

  useEffect(() => {
    if (selectedArtifact !== null) return;
    onContextDocumentChange(null, null);
  }, [onContextDocumentChange, selectedArtifact]);

  const invalidate = (): Promise<void> =>
    invalidateWorkbenchMutation(queryClient, workItem.id);

  const signoff = useMutation({
    mutationFn: () => {
      if (packageValue === null || packageStale) {
        throw new TypeError("current sign-off package is unavailable");
      }
      return api.signOffWorkItem(
        workItem.id,
        packageValue.packageHash,
        approvedBy.trim(),
      );
    },
    onSuccess: async () => {
      setApprovedBy("");
      await invalidate();
    },
    onError: async (error) => {
      onMutationError?.(error);
      if (currentApproval) await invalidate();
    },
  });

  if (
    artifactsPending ||
    (currentApproval ? packageFetching : tasksPending)
  ) {
    return (
      <div data-testid="review-workspace">
        <WorkbenchState
          kind="loading"
          title={currentApproval ? "Resolving approval package…" : "Loading approval history…"}
        />
      </div>
    );
  }

  if (
    artifactsError !== null ||
    (currentApproval ? packageError !== null && !packageStale : tasksError !== null)
  ) {
    const error =
      artifactsError ??
      (currentApproval ? packageError : tasksError);
    return (
      <div data-testid="review-workspace">
        <WorkbenchErrorState
          title={currentApproval ? "Approval package unavailable" : "Approval history unavailable"}
          description={error instanceof Error ? error.message : String(error)}
        />
      </div>
    );
  }

  if (selection.kind === "DOCUMENT") {
    return (
      <div data-testid="review-workspace">
        <div className="order-review-navigation">
          <WorkbenchAction
            label="Back to Approval"
            icon={<WorkbenchIcon name="back" />}
            tone="ghost"
            onClick={() => setSelection({ kind: "OVERVIEW" })}
          />
        </div>
        {selectedArtifact === null ? (
          <WorkbenchState kind="empty" title="Governed document is no longer available" />
        ) : (
          <ReadOnlyLifecycleDocumentMaterial
            workItem={workItem}
            artifactId={selectedArtifact.id}
            historicalArtifact={packageStale ? selectedArtifact : undefined}
            embeddedReadOnly={packageStale}
            onOpenArtifactEvidence={onOpenArtifactEvidence}
            onContextDocumentChange={onContextDocumentChange}
          />
        )}
      </div>
    );
  }

  if (selection.kind === "TASK" && selectedTask === null) {
    return (
      <div data-testid="review-workspace">
        <WorkbenchState kind="empty" title="Signed task is no longer available" />
      </div>
    );
  }

  const taskItems = (currentApproval ? currentTasks : tasks).map((task) => ({
    id: "task:" + task.id,
    label: task.objective,
    detail:
      task.scope.length +
      " scope item" +
      (task.scope.length === 1 ? "" : "s") +
      " · " +
      task.gateIds.length +
      " gate" +
      (task.gateIds.length === 1 ? "" : "s"),
    action: (
      <WorkbenchAction
        label={"View task " + task.objective}
        icon={<WorkbenchIcon name="execution" />}
        iconOnly
        tone="ghost"
        onClick={() => setSelection({ kind: "TASK", taskId: task.id })}
      />
    ),
  }));

  const documentItems = packageArtifacts.map((artifact) => ({
    id: "artifact:" + artifact.id,
    label: lifecycleArtifactLabel(artifact.role),
    detail: packageStale ? "Historical governed document" : "Governed package document",
    action: (
      <WorkbenchAction
        label={"View " + lifecycleArtifactLabel(artifact.role)}
        icon={<WorkbenchIcon name="document" />}
        iconOnly
        tone="ghost"
        onClick={() => setSelection({ kind: "DOCUMENT", artifactId: artifact.id })}
      />
    ),
  }));

  const verdict = packageStale
    ? {
      label: "Package stale",
      description: "Sign-off is unavailable while ownership returns upstream.",
      tone: "warning" as const,
      currentness: "Historical package",
    }
    : currentApproval
      ? {
        label: "Ready for sign-off",
        description: "The current readiness result admits this exact package for authorization.",
        tone: "success" as const,
        currentness: "Current package",
      }
      : approvalCompleted
        ? {
          label: "Approved",
          description: "This package has already been authorized.",
          tone: "success" as const,
          currentness: "Approval history",
        }
        : {
          label: "Returned before sign-off",
          description: "Approval was reached without creating sign-off authority.",
          tone: "neutral" as const,
          currentness: "Approval history",
        };

  const approvalDecision =
    currentApproval &&
    !packageStale &&
    packageValue !== null
      ? (
        <div className="order-approval-decision">
          <TextInput
            label="Approved by"
            value={approvedBy}
            onChange={setApprovedBy}
            placeholder="Operator identity"
            isDisabled={mutationsDisabled || signoff.isPending}
            width="100%"
          />
          <WorkbenchAction
            label="Sign off exact package"
            tone="primary"
            loading={signoff.isPending}
            disabled={
              mutationsDisabled ||
              approvedBy.trim().length === 0 ||
              signoff.isPending
            }
            onClick={() => signoff.mutate()}
          />
        </div>
      )
      : undefined;

  const taskState = selectedTask === null ? null : taskStateLabel(selectedTask);
  const selectedTaskDescription =
    selectedTask === null
      ? undefined
      : taskState === null
        ? selectedTask.objective
        : selectedTask.objective + " · " + taskState;

  const sections =
    selectedTask === null
      ? [
        {
          id: "tasks",
          title: currentApproval ? "Signed tasks" : "Approved tasks",
          content: (
            <WorkbenchResourceList
              items={taskItems}
              empty={<WorkbenchState kind="empty" title="No signed tasks" />}
            />
          ),
        },
        {
          id: "documents",
          title: "Package documents",
          content: (
            <WorkbenchResourceList
              items={documentItems}
              empty={<WorkbenchState kind="empty" title="No package documents" />}
            />
          ),
        },
        ...(reviewNotice === undefined
          ? []
          : [{
            id: "notice",
            title: "Status",
            content: reviewNotice,
          }]),
        ...(signoff.error === null
          ? []
          : [{
            id: "signoff-error",
            title: "Sign-off failed",
            content: (
              <WorkbenchErrorState
                title="Sign-off failed"
                description={signoff.error instanceof Error
                  ? signoff.error.message
                  : String(signoff.error)}
              />
            ),
          }]),
      ]
      : [...taskDetailSections(selectedTask)];

  const decisions =
    selectedTask === null
      ? reviewAction ?? approvalDecision
      : (
        <>
          <WorkbenchAction
            label="Back to Approval"
            icon={<WorkbenchIcon name="back" />}
            tone="ghost"
            onClick={() => setSelection({ kind: "OVERVIEW" })}
          />
          {currentApproval ? approvalDecision : null}
        </>
      );

  return (
    <div data-testid="review-workspace">
      <WorkbenchReview
        title="Approval"
        description={
          selectedTaskDescription ??
          (currentApproval ? "Authorize the current governed package." : undefined)
        }
        verdict={verdict}
        sections={sections}
        decisions={decisions}
      />
    </div>
  );
};
