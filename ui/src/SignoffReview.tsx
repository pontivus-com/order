import { useEffect, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MetadataList,
  MetadataListItem,
} from "@astryxdesign/core/MetadataList";
import { TextInput } from "@astryxdesign/core/TextInput";

import type {
  ArtifactRef,
  ExecutionTask,
  Sha256,
  SignedTaskDefinition,
  WorkItem,
} from "../../src/core/contracts.ts";
import * as api from "./http.ts";
import { ReadOnlyLifecycleDocumentMaterial } from "./DocumentWorkspace.tsx";
import { workbenchQueryKeys } from "./query-keys.ts";
import { lifecycleArtifactLabel } from "./workbench-presentation.ts";
import {
  PrimaryMaterialFrame,
  WorkflowStepFrame,
  WorkflowStepIndex,
  type WorkflowStepIndexGroup,
} from "./WorkflowStepFrame.tsx";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
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
        <h2>{task.id}</h2>
        <span>{task.objective}</span>
      </div>
    </div>
    <MetadataList columns="multi">
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
        <h2>{task.planTaskId}</h2>
        <span>{task.objective}</span>
      </div>
    </div>
    <MetadataList columns="multi">
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
  onOpenArtifactEvidence,
  onContextDocumentChange,
}: Readonly<{
  workItem: WorkItem;
  summary: ReactNode;
  onOpenArtifactEvidence: (artifactId: ArtifactRef["id"]) => void;
  onContextDocumentChange: (path: string | null, sha256: Sha256 | null) => void;
}>) => {
  const queryClient = useQueryClient();
  const [selection, setSelection] = useState<ApprovalSelection>({
    kind: "OVERVIEW",
  });
  const [approvedBy, setApprovedBy] = useState("");

  const currentApproval = workItem.stage === "AWAITING_SIGNOFF";

  const packageQuery = useQuery({
    queryKey: workbenchQueryKeys.signoffPackage(workItem.id),
    queryFn: () => api.getSignoffPackage(workItem.id),
    enabled: currentApproval,
  });
  const artifactsQuery = useQuery({
    queryKey: workbenchQueryKeys.lifecycleArtifacts(workItem.id),
    queryFn: () => api.listLifecycleArtifacts(workItem.id),
    enabled: true,
  });
  const tasksQuery = useQuery({
    queryKey: workbenchQueryKeys.tasks(workItem.id),
    queryFn: () => api.listExecutionTasks(workItem.id),
    enabled: !currentApproval,
  });

  const packageArtifacts = (artifactsQuery.data ?? [])
    .filter((artifact) => packageDocumentRoles.has(artifact.role))
    .sort((left, right) =>
      left.repositoryPath.localeCompare(right.repositoryPath));
  const selectedArtifact =
    selection.kind === "DOCUMENT"
      ? packageArtifacts.find((artifact) => artifact.id === selection.artifactId) ?? null
      : null;
  const selectedCurrentTask =
    selection.kind === "TASK" && currentApproval
      ? packageQuery.data?.taskBlock.tasks.find(
          (task) => task.id === selection.taskId,
        ) ?? null
      : null;
  const selectedHistoricalTask =
    selection.kind === "TASK" && !currentApproval
      ? (tasksQuery.data ?? []).find(
          (task) => task.id === selection.taskId,
        ) ?? null
      : null;

  useEffect(() => {
    if (selectedArtifact) return;
    onContextDocumentChange(null, null);
  }, [onContextDocumentChange, selectedArtifact]);

  const invalidate = async (): Promise<void> => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.workItems }),
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.runs(workItem.id) }),
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.lifecycleArtifacts(workItem.id) }),
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.tasks(workItem.id) }),
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.signoffPackage(workItem.id) }),
    ]);
  };

  const signoff = useMutation({
    mutationFn: () => {
      const packageValue = packageQuery.data;
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
    onError: async () => {
      if (currentApproval) {
        await queryClient.invalidateQueries({
          queryKey: workbenchQueryKeys.signoffPackage(workItem.id),
        });
      }
    },
  });

  const groups: WorkflowStepIndexGroup[] = [
    {
      id: "overview",
      label: "Package",
      items: [{
        id: "overview",
        label: "Overview",
        description: "Exact package and approval decision",
        selected: selection.kind === "OVERVIEW",
        onSelect: () => setSelection({ kind: "OVERVIEW" }),
      }],
    },
  ];

  if (packageArtifacts.length > 0) {
    groups.push({
      id: "documents",
      label: "Governed documents",
      items: packageArtifacts.map((artifact) => ({
        id: artifact.id,
        label: lifecycleArtifactLabel(artifact.role),
        description: artifact.repositoryPath,
        selected:
          selection.kind === "DOCUMENT" &&
          selection.artifactId === artifact.id,
        onSelect: () =>
          setSelection({ kind: "DOCUMENT", artifactId: artifact.id }),
      })),
    });
  }

  const currentTasks = packageQuery.data?.taskBlock.tasks ?? [];
  const historicalTasks = tasksQuery.data ?? [];
  if (
    (currentApproval && currentTasks.length > 0) ||
    (!currentApproval && historicalTasks.length > 0)
  ) {
    groups.push({
      id: "tasks",
      label: "Signed tasks",
      items: currentApproval
        ? currentTasks.map((task) => ({
            id: task.id,
            label: task.id,
            description: task.objective,
            selected: selection.kind === "TASK" && selection.taskId === task.id,
            onSelect: () => setSelection({ kind: "TASK", taskId: task.id }),
          }))
        : historicalTasks.map((task) => ({
            id: task.id,
            label: task.planTaskId,
            description: task.objective,
            selected: selection.kind === "TASK" && selection.taskId === task.id,
            onSelect: () => setSelection({ kind: "TASK", taskId: task.id }),
          })),
    });
  }

  const primary = (() => {
    if (
      artifactsQuery.isPending ||
      (currentApproval ? packageQuery.isPending : tasksQuery.isPending)
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
      artifactsQuery.isError ||
      (currentApproval ? packageQuery.isError : tasksQuery.isError)
    ) {
      const error = artifactsQuery.error ??
        (currentApproval ? packageQuery.error : tasksQuery.error);
      return (
        <WorkbenchErrorState
          title={currentApproval
            ? "Package is not current"
            : "Approved package history unavailable"}
          description={error instanceof Error ? error.message : String(error)}
        />
      );
    }
    if (currentApproval && !packageQuery.data) {
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
              <h2>Approved package history</h2>
              <span>
                {historicalTasks.length} signed task
                {historicalTasks.length === 1 ? "" : "s"} · approval completed
              </span>
            </div>
          </div>
          <p>
            Signed task and governed document material remains inspectable here.
            Exact package hash and baseline are current-Approval facts and are
            not re-derived after sign-off.
          </p>
        </section>
      );
    }

    const packageValue = packageQuery.data;
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
            <h2>Exact approval package</h2>
            <span>
              {packageValue.taskBlock.tasks.length} signed task
              {packageValue.taskBlock.tasks.length === 1 ? "" : "s"} · package current
            </span>
          </div>
        </div>

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

        <div className="order-approval-action-region">
          <TextInput
            label="Approved by"
            description="Identify the operator authorizing this exact package."
            value={approvedBy}
            onChange={(value) => setApprovedBy(value)}
            placeholder="Local operator identity"
            isDisabled={signoff.isPending}
            width="100%"
          />
          <WorkbenchAction
            label="Sign off exact package"
            tone="primary"
            loading={signoff.isPending}
            disabled={approvedBy.trim().length === 0 || signoff.isPending}
            onClick={() => signoff.mutate()}
          />
        </div>

        {signoff.error ? (
          <WorkbenchErrorState
            title="Sign-off failed"
            description={signoff.error instanceof Error
              ? signoff.error.message
              : String(signoff.error)}
          />
        ) : null}
      </section>
    );
  })();

  return (
    <WorkflowStepFrame
      summary={summary}
      index={<WorkflowStepIndex groups={groups} />}
      indexLabel="Approval package"
      primary={<PrimaryMaterialFrame>{primary}</PrimaryMaterialFrame>}
    />
  );
};
