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
import { WorkflowStepFrame } from "./WorkflowStepFrame.tsx";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchDisclosure } from "./primitives/WorkbenchDisclosure.tsx";
import { WorkbenchReview } from "./primitives/WorkbenchReview.tsx";
import { WorkbenchResourceRow } from "./primitives/WorkbenchResourceRow.tsx";
import { WorkbenchStatus } from "./primitives/WorkbenchStatus.tsx";
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

const listValues = (values: readonly string[]): ReactNode =>
  values.length === 0
    ? <p>None</p>
    : <ul>{values.map((value) => <li key={value}><code>{value}</code></li>)}</ul>;

const SignedTaskDetail = ({
  task,
}: Readonly<{ task: SignedTaskDefinition }>) => (
  <section
    className="order-review-approval-task"
    data-testid="approval-task-detail"
    aria-label="Signed task detail"
  >
    <header>
      <h2>{task.objective}</h2>
      <span>Signed implementation task</span>
    </header>
    <MetadataList columns="multi">
      <MetadataListItem label="Depends on">
        {task.dependsOn.length === 0 ? "None" : task.dependsOn.join(", ")}
      </MetadataListItem>
      <MetadataListItem label="Gates">
        {task.gateIds.length === 0 ? "None" : task.gateIds.join(", ")}
      </MetadataListItem>
      <MetadataListItem label="Concerns">
        {task.concernIds.length === 0 ? "None" : task.concernIds.join(", ")}
      </MetadataListItem>
      <MetadataListItem label="Acceptance">
        {task.acceptanceRefs.length === 0
          ? "None"
          : task.acceptanceRefs.join(", ")}
      </MetadataListItem>
    </MetadataList>
    <div className="order-review-approval-task-sections">
      <section><h3>Scope</h3>{listValues(task.scope)}</section>
      <section><h3>Exclusions</h3>{listValues(task.exclusions)}</section>
      <section><h3>Change surface</h3>{listValues(task.changeSurface)}</section>
      <section><h3>Authority</h3>{listValues(task.authorityRefs)}</section>
    </div>
    <WorkbenchDisclosure
      label="Task technical details"
      content={
        <dl>
          <div><dt>Task id</dt><dd><code>{task.id}</code></dd></div>
        </dl>
      }
    />
  </section>
);

const HistoricalTaskDetail = ({
  task,
}: Readonly<{ task: ExecutionTask }>) => (
  <section
    className="order-review-approval-task"
    data-testid="approval-task-detail"
    aria-label="Historical approved task detail"
  >
    <header>
      <h2>{task.objective}</h2>
      <span>Approved historical task</span>
    </header>
    <MetadataList columns="multi">
      <MetadataListItem label="Execution state">
        {task.state.replaceAll("_", " ").toLowerCase()}
      </MetadataListItem>
      <MetadataListItem label="Depends on">
        {task.dependsOn.length === 0 ? "None" : task.dependsOn.join(", ")}
      </MetadataListItem>
      <MetadataListItem label="Gates">
        {task.gateIds.length === 0 ? "None" : task.gateIds.join(", ")}
      </MetadataListItem>
      <MetadataListItem label="Concerns">
        {task.concernIds.length === 0 ? "None" : task.concernIds.join(", ")}
      </MetadataListItem>
      <MetadataListItem label="Acceptance">
        {task.acceptanceRefs.length === 0
          ? "None"
          : task.acceptanceRefs.join(", ")}
      </MetadataListItem>
    </MetadataList>
    <div className="order-review-approval-task-sections">
      <section><h3>Scope</h3>{listValues(task.scope)}</section>
      <section><h3>Exclusions</h3>{listValues(task.exclusions)}</section>
      <section><h3>Change surface</h3>{listValues(task.changeSurface)}</section>
      <section><h3>Authority</h3>{listValues(task.authorityRefs)}</section>
    </div>
    <WorkbenchDisclosure
      label="Task technical details"
      content={
        <dl>
          <div><dt>Execution task id</dt><dd><code>{task.id}</code></dd></div>
          <div><dt>Plan task id</dt><dd><code>{task.planTaskId}</code></dd></div>
          <div><dt>Approval id</dt><dd><code>{task.approvalId}</code></dd></div>
        </dl>
      }
    />
  </section>
);

const ApprovalContext = ({
  currentApproval,
  packageValue,
  packageStale,
  approvalCompleted,
}: Readonly<{
  currentApproval: boolean;
  packageValue: SignoffPackage | null;
  packageStale: boolean;
  approvalCompleted: boolean;
}>) => {
  if (currentApproval && packageValue !== null && !packageStale) {
    return (
      <div className="order-review-approval-context" aria-label="Approval context">
        <section data-testid="approval-readiness-summary" aria-label="Approval readiness">
          <div>
            <h3>Readiness</h3>
            <p>Current R3 readiness admitted this exact package for authorization.</p>
          </div>
          <WorkbenchStatus tone="success" label="Ready for sign-off" />
        </section>
        <section aria-label="Approval package currentness">
          <div>
            <h3>Package currentness</h3>
            <p>
              {packageValue.taskBlock.tasks.length} signed task
              {packageValue.taskBlock.tasks.length === 1 ? "" : "s"} · exact package authority
            </p>
          </div>
          <WorkbenchStatus tone="success" label="Current" />
        </section>
      </div>
    );
  }

  if (currentApproval && packageStale) {
    return (
      <div className="order-review-approval-context" aria-label="Approval context">
        <section aria-label="Approval package currentness">
          <div>
            <h3>Package currentness</h3>
            <p>Prior package material is inspection-only while authority returns upstream.</p>
          </div>
          <WorkbenchStatus tone="warning" label="Stale" />
        </section>
      </div>
    );
  }

  return (
    <div className="order-review-approval-context" aria-label="Approval context">
      <section aria-label="Approval history currentness">
        <div>
          <h3>Approval history</h3>
          <p>
            {approvalCompleted
              ? "The approved task/document set remains inspectable as reached history."
              : "Approval was reached without creating sign-off authority before workflow returned upstream."}
          </p>
        </div>
        <WorkbenchStatus
          tone={approvalCompleted ? "success" : "neutral"}
          label={approvalCompleted ? "Approved package history" : "Returned before sign-off"}
        />
      </section>
    </div>
  );
};

export const SignoffReview = ({
  workItem,
  summary,
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
  onOpenArtifactEvidence,
  onContextDocumentChange,
  onMutationError,
}: Readonly<{
  workItem: WorkItem;
  summary: ReactNode;
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
  onOpenArtifactEvidence: (artifactId: ArtifactRef["id"]) => void;
  onContextDocumentChange: (path: string | null, sha256: Sha256 | null) => void;
  onMutationError?: (error: unknown) => void;
}>) => {
  const queryClient = useQueryClient();
  const [selection, setSelection] = useState<ApprovalSelection>({ kind: "OVERVIEW" });
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
      ? packageValue?.taskBlock.tasks.find((task) => task.id === selection.taskId) ?? null
      : null;
  const selectedHistoricalTask =
    selection.kind === "TASK" && !currentApproval
      ? tasks.find((task) => task.id === selection.taskId) ?? null
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

  const currentTasks = packageValue?.taskBlock.tasks ?? [];
  const approvalCompleted = !currentApproval && tasks.length > 0;

  const packageMaterial = (
    <WorkbenchDisclosure
      label="Package material"
      content={
        <div className="order-review-approval-resources">
          <WorkbenchResourceRow
            label="Approval overview"
            detail={
              packageStale
                ? "Stale package history and recovery context"
                : currentApproval
                  ? "Exact current package and authorization"
                  : "Reached Approval history"
            }
            actionLabel="Open approval overview"
            onOpen={() => setSelection({ kind: "OVERVIEW" })}
          />
          {packageArtifacts.map((artifact) => (
            <WorkbenchResourceRow
              key={artifact.id}
              label={lifecycleArtifactLabel(artifact.role)}
              detail="Read-only governed package material"
              actionLabel={"Open " + lifecycleArtifactLabel(artifact.role)}
              onOpen={() =>
                setSelection({
                  kind: "DOCUMENT",
                  artifactId: artifact.id,
                })}
            />
          ))}
          {(currentApproval ? currentTasks : tasks).map((task) => (
            <WorkbenchResourceRow
              key={task.id}
              label={task.objective}
              detail={
                currentApproval
                  ? "Signed implementation task"
                  : "Approved historical task"
              }
              actionLabel={"Inspect task: " + task.objective}
              onOpen={() =>
                setSelection({
                  kind: "TASK",
                  taskId: task.id,
                })}
            />
          ))}
        </div>
      }
    />
  );

  const selectedMaterial = (() => {
    if (
      artifactsPending ||
      (currentApproval ? packageFetching : tasksPending)
    ) {
      return (
        <WorkbenchState
          kind="loading"
          title={
            packageStale
              ? "Loading historical package material…"
              : currentApproval
                ? "Resolving exact package…"
                : "Loading approved package history…"
          }
        />
      );
    }

    if (
      artifactsError !== null ||
      (currentApproval
        ? packageError !== null && !packageStale
        : tasksError !== null)
    ) {
      const error =
        artifactsError ??
        (currentApproval ? packageError : tasksError);
      return (
        <WorkbenchErrorState
          title={
            currentApproval
              ? "Package is not current"
              : "Approved package history unavailable"
          }
          description={error instanceof Error ? error.message : String(error)}
        />
      );
    }

    if (selection.kind === "DOCUMENT") {
      return selectedArtifact === null
        ? (
          <WorkbenchState
            kind="empty"
            title="Governed document is no longer current"
          />
        )
        : (
          <ReadOnlyLifecycleDocumentMaterial
            workItem={workItem}
            artifactId={selectedArtifact.id}
            historicalArtifact={packageStale ? selectedArtifact : undefined}
            embeddedReadOnly={packageStale}
            onOpenArtifactEvidence={onOpenArtifactEvidence}
            onContextDocumentChange={onContextDocumentChange}
          />
        );
    }

    if (selection.kind === "TASK") {
      if (currentApproval) {
        return selectedCurrentTask === null
          ? <WorkbenchState kind="empty" title="Signed task is no longer current" />
          : <SignedTaskDetail task={selectedCurrentTask} />;
      }
      return selectedHistoricalTask === null
        ? <WorkbenchState kind="empty" title="Approved task is unavailable" />
        : <HistoricalTaskDetail task={selectedHistoricalTask} />;
    }

    if (currentApproval && packageStale) {
      return (
        <section className="order-review-approval-overview" data-testid="review-workspace">
          <h3>Package no longer current</h3>
          <p>Prior governed package material remains inspection-only.</p>
          <p>
            Review the prior governed documents while workflow ownership returns
            to the canonical upstream owner. This package cannot be signed.
          </p>
        </section>
      );
    }

    if (currentApproval && packageValue === null) {
      return (
        <WorkbenchState
          kind="empty"
          title="No current sign-off package"
          description="Approval remains blocked until the exact package is current."
        />
      );
    }

    if (!currentApproval) {
      return (
        <section className="order-review-approval-overview" data-testid="review-workspace">
          <h3>{approvalCompleted ? "Approved package history" : "Approval history"}</h3>
          <p>
            {approvalCompleted
              ? tasks.length +
                " signed task" +
                (tasks.length === 1 ? "" : "s") +
                " · approval completed"
              : "Sign-off not completed · workflow returned upstream"}
          </p>
          <p>
            {approvalCompleted
              ? "Signed task and governed document material remains inspectable here. Exact package hash and baseline are current-Approval facts and are not re-derived after sign-off."
              : "Approval was reached, but no sign-off authority was created before the workflow returned upstream. Governed documents remain inspectable within reached history."}
          </p>
        </section>
      );
    }

    return (
      <section className="order-review-approval-overview" data-testid="review-workspace">
        <h3>Signed task meaning / scope / gates</h3>
        <div className="order-review-approval-resources">
          {currentTasks.map((task) => (
            <WorkbenchResourceRow
              key={task.id}
              label={task.objective}
              detail={
                task.scope.length +
                " scope item" +
                (task.scope.length === 1 ? "" : "s") +
                " · " +
                task.gateIds.length +
                " gate" +
                (task.gateIds.length === 1 ? "" : "s")
              }
              actionLabel={"Inspect signed task: " + task.objective}
              onOpen={() => setSelection({ kind: "TASK", taskId: task.id })}
            />
          ))}
        </div>
        <section>
          <h3>Governed documents</h3>
          <p>
            {packageArtifacts.length} current package document
            {packageArtifacts.length === 1 ? "" : "s"} available for inspection.
          </p>
        </section>
      </section>
    );
  })();

  const approvalAction =
    currentApproval &&
    !packageStale &&
    packageValue !== null &&
    packageError === null &&
    !packageFetching
      ? (
        <section
          className="order-review-approval-authorization"
          aria-label="Approval authorization"
        >
          <div>
            <h3>Authorization</h3>
            <p>
              Approver identity and exact-package decision remain in the Review
              decision region.
            </p>
          </div>
          <div className="order-review-approval-authorization-controls">
            <TextInput
              label="Approved by"
              description="Identify the operator authorizing this exact package."
              value={approvedBy}
              onChange={setApprovedBy}
              placeholder="Local operator identity"
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
          {signoff.error ? (
            <WorkbenchErrorState
              title="Sign-off failed"
              description={
                signoff.error instanceof Error
                  ? signoff.error.message
                  : String(signoff.error)
              }
            />
          ) : null}
        </section>
      )
      : null;

  const headerStatus = (
    <WorkbenchStatus
      tone={
        packageStale
          ? "warning"
          : currentApproval
            ? "info"
            : approvalCompleted
              ? "success"
              : "neutral"
      }
      label={
        packageStale
          ? "Package stale"
          : currentApproval
            ? "Awaiting authorization"
            : approvalCompleted
              ? "Approved package history"
              : "Returned before sign-off"
      }
    />
  );

  const title =
    packageStale
      ? "Stale approval package"
      : currentApproval
        ? "Exact approval package"
        : approvalCompleted
          ? "Approved package"
          : "Approval history";

  const description =
    packageStale
      ? "Inspect prior governed package material while the canonical upstream owner is restored."
      : currentApproval
        ? "Review and authorize the exact signed package."
        : approvalCompleted
          ? "Inspect the governed package retained after approval."
          : "Inspect the reached Approval stage retained after workflow returned upstream without sign-off.";

  return (
    <WorkflowStepFrame
      summary={summary}
      primary={
        <div data-testid="review-workspace">
          <WorkbenchReview
            currentness={headerStatus}
            summary={<div><h2>{title}</h2><p>{description}</p></div>}
            body={
              <div className="order-review-approval-body">
                <ApprovalContext
                  currentApproval={currentApproval}
                  packageValue={packageValue}
                  packageStale={packageStale}
                  approvalCompleted={approvalCompleted}
                />
                {selectedMaterial}
                {packageMaterial}
              </div>
            }
            decisions={approvalAction ?? <></>}
            technicalDetails={
              currentApproval &&
              !packageStale &&
              packageValue !== null
                ? (
                  <MetadataList
                    columns="multi"
                    title="Technical identity"
                    data-testid="approval-package-metadata"
                  >
                    <MetadataListItem label="Package">
                      <code data-testid="signoff-package-hash">
                        {packageValue.packageHash}
                      </code>
                    </MetadataListItem>
                    <MetadataListItem label="Source">
                      <code>{packageValue.sourceSha256}</code>
                    </MetadataListItem>
                    <MetadataListItem label="Baseline">
                      <code>{packageValue.baselineCommit}</code>
                    </MetadataListItem>
                  </MetadataList>
                )
                : undefined
            }
          />
        </div>
      }
    />
  );
};
