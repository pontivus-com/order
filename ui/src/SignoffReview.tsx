import { useEffect, useState, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MetadataList,
  MetadataListItem,
} from "@astryxdesign/core/MetadataList";
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
import {
  WorkflowStepFrame,
} from "./WorkflowStepFrame.tsx";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchDisclosure } from "./primitives/WorkbenchDisclosure.tsx";
import { WorkbenchReview } from "./primitives/WorkbenchReview.tsx";
import { WorkbenchResourceRow } from "./primitives/WorkbenchResourceRow.tsx";
import { WorkbenchStatus } from "./primitives/WorkbenchStatus.tsx";
import {
  WorkbenchEmptyState,
  WorkbenchErrorState,
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

const TaskDetail = ({
  task,
}: Readonly<{
  task: SignedTaskDefinition;
}>) => (
  <section className="order-approval-task-detail" data-testid="approval-task-detail">
    <div className="order-section-heading">
      <div>
        <h2>{task.objective}</h2>
        <span>Signed implementation task</span>
      </div>
    </div>
    <MetadataList columns="multi">
      <MetadataListItem label="Task id"><code>{task.id}</code></MetadataListItem>
      <MetadataListItem label="Depends on">
        {task.dependsOn.length > 0 ? task.dependsOn.join(", ") : "None"}
      </MetadataListItem>
      <MetadataListItem label="Gates">
        {task.gateIds.length > 0 ? task.gateIds.join(", ") : "None"}
      </MetadataListItem>
      <MetadataListItem label="Concerns">
        {task.concernIds.length > 0 ? task.concernIds.join(", ") : "None"}
      </MetadataListItem>
      <MetadataListItem label="Acceptance">
        {task.acceptanceRefs.length > 0
          ? task.acceptanceRefs.join(", ")
          : "None"}
      </MetadataListItem>
    </MetadataList>
    <div className="order-approval-task-sections">
      <section>
        <h3>Scope</h3>
        {task.scope.length > 0 ? (
          <ul>{task.scope.map((value) => <li key={value}><code>{value}</code></li>)}</ul>
        ) : <p>None</p>}
      </section>
      <section>
        <h3>Exclusions</h3>
        {task.exclusions.length > 0 ? (
          <ul>{task.exclusions.map((value) => <li key={value}><code>{value}</code></li>)}</ul>
        ) : <p>None</p>}
      </section>
      <section>
        <h3>Change surface</h3>
        <ul>
          {task.changeSurface.map((value) => <li key={value}><code>{value}</code></li>)}
        </ul>
      </section>
      <section>
        <h3>Authority</h3>
        <ul>
          {task.authorityRefs.map((value) => <li key={value}><code>{value}</code></li>)}
        </ul>
      </section>
    </div>
  </section>
);

const HistoricalTaskDetail = ({
  task,
}: Readonly<{
  task: ExecutionTask;
}>) => (
  <section className="order-approval-task-detail" data-testid="approval-task-detail">
    <div className="order-section-heading">
      <div>
        <h2>{task.objective}</h2>
        <span>Approved historical task</span>
      </div>
    </div>
    <MetadataList columns="multi">
      <MetadataListItem label="Task id"><code>{task.planTaskId}</code></MetadataListItem>
      <MetadataListItem label="Approval">
        <code>{task.approvalId}</code>
      </MetadataListItem>
      <MetadataListItem label="Execution state">
        {task.state.replaceAll("_", " ").toLowerCase()}
      </MetadataListItem>
      <MetadataListItem label="Depends on">
        {task.dependsOn.length > 0 ? task.dependsOn.join(", ") : "None"}
      </MetadataListItem>
      <MetadataListItem label="Gates">
        {task.gateIds.length > 0 ? task.gateIds.join(", ") : "None"}
      </MetadataListItem>
      <MetadataListItem label="Concerns">
        {task.concernIds.length > 0 ? task.concernIds.join(", ") : "None"}
      </MetadataListItem>
      <MetadataListItem label="Acceptance">
        {task.acceptanceRefs.length > 0
          ? task.acceptanceRefs.join(", ")
          : "None"}
      </MetadataListItem>
    </MetadataList>
    <div className="order-approval-task-sections">
      <section>
        <h3>Scope</h3>
        {task.scope.length > 0 ? (
          <ul>{task.scope.map((value) => <li key={value}><code>{value}</code></li>)}</ul>
        ) : <p>None</p>}
      </section>
      <section>
        <h3>Exclusions</h3>
        {task.exclusions.length > 0 ? (
          <ul>{task.exclusions.map((value) => <li key={value}><code>{value}</code></li>)}</ul>
        ) : <p>None</p>}
      </section>
      <section>
        <h3>Change surface</h3>
        <ul>
          {task.changeSurface.map((value) => <li key={value}><code>{value}</code></li>)}
        </ul>
      </section>
      <section>
        <h3>Authority</h3>
        <ul>
          {task.authorityRefs.map((value) => <li key={value}><code>{value}</code></li>)}
        </ul>
      </section>
    </div>
  </section>
);

export const SignoffReview = ({
  workItem,
  summary,
  packageValue,
  packageFetching,
  packageError,
  artifacts,
  artifactsPending,
  artifactsError,
  tasks,
  tasksPending,
  tasksError,
  mutationsDisabled = false,
  onOpenArtifactEvidence,
  onContextDocumentChange,
  onMutationError,
}: Readonly<{
  workItem: WorkItem;
  summary: ReactNode;
  packageValue: SignoffPackage | null;
  packageFetching: boolean;
  packageError: unknown;
  artifacts: readonly ArtifactRef[];
  artifactsPending: boolean;
  artifactsError: unknown;
  tasks: readonly ExecutionTask[];
  tasksPending: boolean;
  tasksError: unknown;
  mutationsDisabled?: boolean;
  onOpenArtifactEvidence: (artifactId: ArtifactRef["id"]) => void;
  onContextDocumentChange: (path: string | null, sha256: Sha256 | null) => void;
  onMutationError?: (error: unknown) => void;
}>) => {
  const queryClient = useQueryClient();
  const [selection, setSelection] = useState<ApprovalSelection>({
    kind: "OVERVIEW",
  });
  const [approvedBy, setApprovedBy] = useState("");

  const currentApproval = workItem.stage === "AWAITING_SIGNOFF";

  const packageArtifacts = artifacts
    .filter((artifact) => packageDocumentRoles.has(artifact.role))
    .sort((left, right) =>
      left.repositoryPath.localeCompare(right.repositoryPath));
  const selectedArtifact =
    selection.kind === "DOCUMENT"
      ? packageArtifacts.find((artifact) => artifact.id === selection.artifactId) ?? null
      : null;
  const selectedCurrentTask =
    selection.kind === "TASK" && currentApproval
      ? packageValue?.taskBlock.tasks.find(
          (task) => task.id === selection.taskId,
        ) ?? null
      : null;
  const selectedHistoricalTask =
    selection.kind === "TASK" && !currentApproval
      ? tasks.find(
          (task) => task.id === selection.taskId,
        ) ?? null
      : null;

  useEffect(() => {
    if (selectedArtifact) return;
    onContextDocumentChange(null, null);
  }, [onContextDocumentChange, selectedArtifact]);

  const invalidate = (): Promise<void> =>
    invalidateWorkbenchMutation(queryClient, workItem.id);

  const signoff = useMutation({
    mutationFn: () => {
      if (!packageValue) {
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

  const packageMaterial = (
    <WorkbenchDisclosure
      label="Package material"
      content={
        <div className="order-resource-list">
          <WorkbenchResourceRow
            label="Approval overview"
            detail={currentApproval ? "Exact current package and authorization" : "Reached Approval history"}
            actionLabel="Open approval overview"
            onOpen={() => setSelection({ kind: "OVERVIEW" })}
          />
          {packageArtifacts.map((artifact) => (
            <WorkbenchResourceRow
              key={artifact.id}
              label={lifecycleArtifactLabel(artifact.role)}
              detail="Read-only governed package material"
              actionLabel={"Open " + lifecycleArtifactLabel(artifact.role)}
              onOpen={() => setSelection({ kind: "DOCUMENT", artifactId: artifact.id })}
            />
          ))}
          {(currentApproval ? packageValue?.taskBlock.tasks ?? [] : tasks).map((task) => (
            <WorkbenchResourceRow
              key={task.id}
              label={task.objective}
              detail={currentApproval ? "Signed implementation task" : "Approved historical task"}
              actionLabel={"Inspect task: " + task.objective}
              onOpen={() => setSelection({ kind: "TASK", taskId: task.id })}
            />
          ))}
        </div>
      }
    />
  );

  const primary = (() => {
    if (
      artifactsPending ||
      (currentApproval ? packageFetching : tasksPending)
    ) {
      return (
        <WorkbenchEmptyState
          compact
          title={currentApproval
            ? "Resolving exact package…"
            : "Loading approved package history…"}
        />
      );
    }
    if (
      artifactsError !== null ||
      (currentApproval ? packageError !== null : tasksError !== null)
    ) {
      const error = artifactsError ??
        (currentApproval ? packageError : tasksError);
      return (
        <WorkbenchErrorState
          title={currentApproval
            ? "Package is not current"
            : "Approved package history unavailable"}
          description={error instanceof Error ? error.message : String(error)}
        />
      );
    }
    if (currentApproval && !packageValue) {
      return (
        <WorkbenchEmptyState
          title="No current sign-off package"
          description="Approval remains blocked until the exact package is current."
        />
      );
    }

    if (selection.kind === "DOCUMENT") {
      return selectedArtifact ? (
        <ReadOnlyLifecycleDocumentMaterial
          workItem={workItem}
          artifactId={selectedArtifact.id}
          onOpenArtifactEvidence={onOpenArtifactEvidence}
          onContextDocumentChange={onContextDocumentChange}
        />
      ) : (
        <WorkbenchEmptyState
          compact
          title="Governed document is no longer current"
        />
      );
    }

    if (selection.kind === "TASK") {
      if (currentApproval) {
        return selectedCurrentTask ? (
          <TaskDetail task={selectedCurrentTask} />
        ) : (
          <WorkbenchEmptyState compact title="Signed task is no longer current" />
        );
      }
      return selectedHistoricalTask ? (
        <HistoricalTaskDetail task={selectedHistoricalTask} />
      ) : (
        <WorkbenchEmptyState compact title="Approved task is unavailable" />
      );
    }

    if (!currentApproval) {
      return (
        <section
          className="order-workspace-section order-approval-overview"
          data-testid="review-workspace"
        >
          <div className="order-section-heading">
            <div>
              <h2>{approvalCompleted ? "Approved package history" : "Approval history"}</h2>
              <span>
                {approvalCompleted
                  ? historicalTasks.length + " signed task" +
                    (historicalTasks.length === 1 ? "" : "s") +
                    " · approval completed"
                  : "Sign-off not completed · workflow returned upstream"}
              </span>
            </div>
          </div>
          <p>
            {approvalCompleted
              ? "Signed task and governed document material remains inspectable here. Exact package hash and baseline are current-Approval facts and are not re-derived after sign-off."
              : "Approval was reached, but no sign-off authority was created before the workflow returned upstream. Governed documents remain inspectable within reached history."}
          </p>
        </section>
      );
    }

    if (!packageValue) {
      return (
        <WorkbenchEmptyState
          title="No current sign-off package"
          description="Approval remains blocked until the exact package is current."
        />
      );
    }

    return (
      <section className="order-workspace-section order-approval-overview" data-testid="review-workspace">
        <div className="order-section-heading">
          <div>
            <h2>Package currentness</h2>
            <span>
              {packageValue.taskBlock.tasks.length} signed task
              {packageValue.taskBlock.tasks.length === 1 ? "" : "s"} · exact package current
            </span>
          </div>
          <WorkbenchStatus tone="success" label="Current" />
        </div>

        <section>
          <h3>Signed task meaning / scope / gates</h3>
          <div className="order-resource-list">
            {packageValue.taskBlock.tasks.map((task) => (
              <WorkbenchResourceRow
                key={task.id}
                label={task.objective}
                detail={task.scope.length + " scope item" + (task.scope.length === 1 ? "" : "s") + " · " + task.gateIds.length + " gate" + (task.gateIds.length === 1 ? "" : "s")}
                actionLabel={"Inspect signed task: " + task.objective}
                onOpen={() => setSelection({ kind: "TASK", taskId: task.id })}
              />
            ))}
          </div>
        </section>

        <section>
          <h3>Governed documents</h3>
          <p>{packageArtifacts.length} current package document{packageArtifacts.length === 1 ? "" : "s"} available for inspection.</p>
        </section>

        <WorkbenchDisclosure
          label="Technical details"
          content={
            <MetadataList
              columns="multi"
              title="Technical identity"
              data-testid="approval-package-metadata"
            >
              <MetadataListItem label="Package">
                <code data-testid="signoff-package-hash">{packageValue.packageHash}</code>
              </MetadataListItem>
              <MetadataListItem label="Source">
                <code>{packageValue.sourceSha256}</code>
              </MetadataListItem>
              <MetadataListItem label="Baseline">
                <code>{packageValue.baselineCommit}</code>
              </MetadataListItem>
            </MetadataList>
          }
        />
      </section>
    );
  })();

  const approvalAction =
    currentApproval &&
    packageValue &&
    packageError === null &&
    !packageFetching ? (
      <div className="order-approval-action-region">
        <TextInput
          label="Approved by"
          description="Identify the operator authorizing this exact package."
          value={approvedBy}
          onChange={(value) => setApprovedBy(value)}
          placeholder="Local operator identity"
          isDisabled={mutationsDisabled || signoff.isPending}
          width="100%"
        />
        <WorkbenchAction
          label="Sign off exact package"
          tone="primary"
          loading={signoff.isPending}
          disabled={mutationsDisabled || approvedBy.trim().length === 0 || signoff.isPending}
          onClick={() => signoff.mutate()}
        />
        {signoff.error ? (
          <WorkbenchErrorState
            title="Sign-off failed"
            description={signoff.error instanceof Error
              ? signoff.error.message
              : String(signoff.error)}
          />
        ) : null}
      </div>
    ) : null;

  return (
    <WorkflowStepFrame
      summary={summary}
      primary={
        <WorkbenchReview
          currentness={
            <WorkbenchStatus
              tone={currentApproval ? "warning" : approvalCompleted ? "success" : "neutral"}
              label={
                currentApproval
                  ? "Awaiting authorization"
                  : approvalCompleted
                    ? "Approved package history"
                    : "Returned before sign-off"
              }
            />
          }
          summary={
            <div>
              <h2>
                {currentApproval
                  ? "Exact approval package"
                  : approvalCompleted
                    ? "Approved package"
                    : "Approval history"}
              </h2>
              <p>
                {currentApproval
                  ? "Review and authorize the exact signed package."
                  : approvalCompleted
                    ? "Inspect the governed package retained after approval."
                    : "Inspect the reached Approval stage retained after the workflow returned upstream without sign-off."}
              </p>
            </div>
          }
          body={
            <div className="order-review-material-stack">
              {primary}
              <div className="order-review-supporting-disclosure">{packageMaterial}</div>
            </div>
          }
          decisions={approvalAction ?? <></>}
        />
      }
    />
  );
};
