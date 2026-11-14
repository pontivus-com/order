import { useEffect, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MetadataList,
  MetadataListItem,
} from "@astryxdesign/core/MetadataList";
import { TextInput } from "@astryxdesign/core/TextInput";

import type {
  ArtifactRef,
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

  const packageQuery = useQuery({
    queryKey: workbenchQueryKeys.signoffPackage(workItem.id),
    queryFn: () => api.getSignoffPackage(workItem.id),
    enabled: workItem.stage === "AWAITING_SIGNOFF",
  });
  const artifactsQuery = useQuery({
    queryKey: workbenchQueryKeys.lifecycleArtifacts(workItem.id),
    queryFn: () => api.listLifecycleArtifacts(workItem.id),
    enabled: workItem.stage === "AWAITING_SIGNOFF",
  });

  const packageArtifacts = (artifactsQuery.data ?? [])
    .filter((artifact) => packageDocumentRoles.has(artifact.role))
    .sort((left, right) =>
      left.repositoryPath.localeCompare(right.repositoryPath));
  const selectedArtifact =
    selection.kind === "DOCUMENT"
      ? packageArtifacts.find((artifact) => artifact.id === selection.artifactId) ?? null
      : null;
  const selectedTask =
    selection.kind === "TASK"
      ? packageQuery.data?.taskBlock.tasks.find((task) => task.id === selection.taskId) ?? null
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

  if (packageQuery.data?.taskBlock.tasks.length) {
    groups.push({
      id: "tasks",
      label: "Signed tasks",
      items: packageQuery.data.taskBlock.tasks.map((task) => ({
        id: task.id,
        label: task.id,
        description: task.objective,
        selected: selection.kind === "TASK" && selection.taskId === task.id,
        onSelect: () => setSelection({ kind: "TASK", taskId: task.id }),
      })),
    });
  }

  const primary = (() => {
    if (packageQuery.isPending || artifactsQuery.isPending) {
      return <WorkbenchEmptyState compact title="Resolving exact package…" />;
    }
    if (packageQuery.isError || artifactsQuery.isError) {
      const error = packageQuery.error ?? artifactsQuery.error;
      return (
        <WorkbenchErrorState
          title="Package is not current"
          description={error instanceof Error ? error.message : String(error)}
        />
      );
    }
    if (!packageQuery.data) {
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
      return selectedTask ? (
        <TaskDetail task={selectedTask} />
      ) : (
        <WorkbenchEmptyState compact title="Signed task is no longer current" />
      );
    }

    return (
      <section className="order-workspace-section order-approval-overview" data-testid="review-workspace">
        <div className="order-section-heading">
          <div>
            <h2>Exact approval package</h2>
            <span>
              {packageQuery.data.taskBlock.tasks.length} signed task
              {packageQuery.data.taskBlock.tasks.length === 1 ? "" : "s"} · package current
            </span>
          </div>
        </div>

        <MetadataList
          columns="multi"
          title="Technical identity"
          data-testid="approval-package-metadata"
        >
          <MetadataListItem label="Package">
            <code data-testid="signoff-package-hash">{packageQuery.data.packageHash}</code>
          </MetadataListItem>
          <MetadataListItem label="Source">
            <code>{packageQuery.data.sourceSha256}</code>
          </MetadataListItem>
          <MetadataListItem label="Baseline">
            <code>{packageQuery.data.baselineCommit}</code>
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
