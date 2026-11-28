import { useEffect, useState, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TextInput } from "@astryxdesign/core/TextInput";

import type {
  Approval,
  ArtifactRef,
  ExecutionTask,
  Sha256,
  SignoffPackage,
  SignedTaskDefinition,
  WorkItem,
} from "../../src/core/contracts.ts";
import type { MaterialPresentationState } from "../../src/core/lifecycle.ts";
import * as api from "./http.ts";
import { ReadOnlyLifecycleDocumentMaterial } from "./DocumentWorkspace.tsx";
import { invalidateWorkbenchMutation } from "./query-keys.ts";
import { lifecycleArtifactLabel, lifecycleArtifactRoleRank, type WorkflowMaterial } from "./workbench-presentation.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchIcon } from "./primitives/WorkbenchIcon.tsx";
import { WorkbenchReview } from "./primitives/WorkbenchReview.tsx";
import { WorkbenchFacts } from "./primitives/WorkbenchFacts.tsx";
import { WorkbenchResourceList } from "./primitives/WorkbenchResourceList.tsx";
import {
  WorkbenchErrorState,
  WorkbenchState,
} from "./primitives/WorkbenchState.tsx";

type ApprovalSelection = Extract<WorkflowMaterial, {kind:"APPROVAL_PACKAGE"}>;

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

const signedValues = (values: readonly string[]): ReactNode =>
  values.length === 0 ? "None" : (
    <ul >
      {values.map((value, index) => <li key={index}>{value}</li>)}
    </ul>
  );

const taskDetailSections = (
  task: SignedTaskDefinition | ExecutionTask,
) => [
  {
    id: "boundaries",
    title: "Scope and boundaries",
    description: "The authorized scope and exclusions govern implementation.",
    content: (
      <WorkbenchFacts
        label="Task boundaries"
        items={[
          { id: "scope", label: "Scope", value: signedValues(task.scope), emphasis: "strong" },
          { id: "exclusions", label: "Exclusions", value: signedValues(task.exclusions) },
          { id: "dependencies", label: "Dependencies", value: signedValues(task.dependsOn) },
        ]}
      />
    ),
  },
  {
    id: "verification",
    title: "Acceptance and authority",
    content: (
      <WorkbenchFacts
        label="Verification and traceability"
        items={[
          { id: "acceptance", label: "Acceptance", value: signedValues(task.acceptanceRefs) },
          { id: "gates", label: "Gates", value: signedValues(task.gateIds) },
          { id: "authority", label: "Authority", value: signedValues(task.authorityRefs) },
          { id: "concerns", label: "Concerns", value: signedValues(task.concernIds) },
        ]}
      />
    ),
  },
  {
    id: "change-surface",
    title: "Expected change surface",
    description: "Physical change forecast, not an additional scope boundary.",
    content: task.changeSurface.length === 0 ? (
      <WorkbenchFacts items={[{ id: "forecast", label: "Forecast", value: "None" }]} />
    ) : task.changeSurface.length === 1 ? (
      <WorkbenchFacts items={[{ id: "forecast", label: "Forecast", value: task.changeSurface[0] }]} />
    ) : (
      <WorkbenchResourceList items={resourceItems("change", task.changeSurface)} />
    ),
  },
] as const;

export const SignoffReview = ({
  workItem,
  packageValue,
  packageFetching,
  packageError,
  packageStale = false,
  selectedApproval,
  approvals,
  selection,
  onSelectionChange,
  materialStateForArtifact,
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
  selectedApproval: Approval | null;
  approvals: readonly Approval[];
  selection: ApprovalSelection;
  onSelectionChange: (material: ApprovalSelection) => void;
  materialStateForArtifact: (artifact: ArtifactRef) => MaterialPresentationState | null;
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
  const selectDetail = (detail: {artifactId?: ArtifactRef["id"]; taskId?: string} = {}): void =>
    onSelectionChange({kind:"APPROVAL_PACKAGE",approvalId:selection.approvalId,
      packageHash:selection.packageHash,...detail});
  const [approvedBy, setApprovedBy] = useState("");

  const currentApproval = workItem.stage === "AWAITING_SIGNOFF" && selectedApproval === null && selection.approvalId === undefined;
  const currentTasks = packageValue?.taskBlock.tasks ?? [];
  const approvalCompleted = selectedApproval !== null;
  const packageArtifacts = artifacts
    .filter((artifact) => packageDocumentRoles.has(artifact.role))
    .sort((left, right) =>
      lifecycleArtifactRoleRank(left.role) - lifecycleArtifactRoleRank(right.role) ||
      left.repositoryPath.localeCompare(right.repositoryPath));

  const selectedArtifact =
    selection.artifactId !== undefined
      ? packageArtifacts.find((artifact) => artifact.id === selection.artifactId) ?? null
      : null;
  const selectedTask =
    selection.taskId !== undefined
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
      if (packageValue === null || packageStale || artifactsPending || artifactsError !== null ||
          artifacts.length === 0 || selection.packageHash !== packageValue.packageHash) {
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

  if (selection.artifactId !== undefined) {
    return (
      <div className="order-document-inspection" data-testid="review-workspace">
        <div className="order-review-navigation">
          <WorkbenchAction
            label="Back to Approval"
            icon={<WorkbenchIcon name="back" />}
            tone="ghost"
            onClick={() => selectDetail()}
          />
        </div>
        {selectedArtifact === null ? (
          <WorkbenchState kind="empty" title="Governed document is no longer available" />
        ) : (
          <ReadOnlyLifecycleDocumentMaterial
            workItem={workItem}
            artifactId={selectedArtifact.id}
            materialState={materialStateForArtifact(selectedArtifact)}
            historicalArtifact={selectedArtifact}
            embeddedReadOnly={packageStale}
            onOpenArtifactEvidence={onOpenArtifactEvidence}
            onContextDocumentChange={onContextDocumentChange}
          />
        )}
      </div>
    );
  }

  if (selection.taskId !== undefined && selectedTask === null) {
    return (
      <div data-testid="review-workspace">
        <WorkbenchState kind="empty" title="Signed task is no longer available"
          action={<WorkbenchAction label="Back to Approval" onClick={() => selectDetail()} />} />
      </div>
    );
  }

  const taskItems = (currentApproval ? currentTasks : tasks).map((task, index) => ({
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
        label={"View task " + (index + 1)}
        icon={<WorkbenchIcon name="execution" />}
        tone="secondary"
        onClick={() => selectDetail({taskId:task.id})}
      />
    ),
  }));

  const documentItems = packageArtifacts.map((artifact) => ({
    id: "artifact:" + artifact.id,
    label: lifecycleArtifactLabel(artifact.role),
    action: (
      <WorkbenchAction
        label={"View " + lifecycleArtifactLabel(artifact.role)}
        icon={<WorkbenchIcon name="document" />}
        tone="secondary"
        onClick={() => selectDetail({artifactId:artifact.id})}
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
    packageValue !== null && selection.packageHash === packageValue.packageHash &&
    artifacts.length > 0 && !artifactsPending && artifactsError === null
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
        ? "Approval task detail"
        : "Approval task detail · " + taskState;

  const sections =
    selectedTask === null
      ? [
        {
          id: "tasks",
          title: currentApproval ? "Signed tasks" : "Approved tasks",
          content: taskItems.length === 1 ? (
            <>
              <WorkbenchFacts label="Signed task" items={[
                { id: "objective", label: "Objective", value: taskItems[0]!.label, emphasis: "strong" },
                { id: "scope-gates", label: "Authorization", value: taskItems[0]!.detail },
              ]} />
              <div className="order-inline-actions">{taskItems[0]!.action}</div>
            </>
          ) : (
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

      ]
      : [...taskDetailSections(selectedTask)];
  const reviewSections = [
    ...(selectedTask === null && (approvals.some(approval=>approval.id!==selectedApproval?.id) || selectedApproval !== null && workItem.stage==="AWAITING_SIGNOFF") ? [{
      id:"approval-history", title:"Approval history",
      content:<WorkbenchResourceList items={[
        ...(workItem.stage === "AWAITING_SIGNOFF" && selectedApproval !== null ? [{
          id:"prospective",label:"Current package",action:<WorkbenchAction label="View current package"
            onClick={()=>onSelectionChange({kind:"APPROVAL_PACKAGE"})} />
        }] : []),
        ...approvals.filter(approval=>approval.id!==selectedApproval?.id).map(approval=>({
          id:approval.id,label:"Approved "+new Date(approval.approvedAt).toLocaleString(),
          action:<WorkbenchAction label={"View Approval "+new Date(approval.approvedAt).toLocaleString()}
            onClick={()=>onSelectionChange({kind:"APPROVAL_PACKAGE",approvalId:approval.id})} />
        }))
      ]}/>
    }] : []),
    ...(reviewNotice === undefined ? [] : [{ id: "notice", title: "Current package status", content: reviewNotice }]),
    ...sections,
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
  ];

  const decisions =
    selectedTask === null
      ? reviewAction ?? approvalDecision
      : (
        <>
          <WorkbenchAction
            label="Back to Approval"
            icon={<WorkbenchIcon name="back" />}
            tone="ghost"
            onClick={() => selectDetail()}
          />
          {currentApproval ? reviewAction ?? approvalDecision : reviewAction}
        </>
      );

  return (
    <div className="order-review-workspace" data-testid="review-workspace">
      <WorkbenchReview
        title={selectedTask === null ? "Approval" : selectedTask.objective}
        description={
          selectedTaskDescription ??
          (currentApproval ? "Authorize the current governed package." : undefined)
        }
        verdict={verdict}
        sections={reviewSections}
        decisions={decisions}
      />
    </div>
  );
};
