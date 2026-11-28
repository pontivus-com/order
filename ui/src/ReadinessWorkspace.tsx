import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Markdown } from "@astryxdesign/core/Markdown";

import {
  MarkdownTextSchema,
  type ArtifactRef,
  type Run,
  type RunEvent,
  type Sha256,
  type WorkItem,
} from "../../src/core/contracts.ts";
import * as api from "./http.ts";
import { workbenchQueryKeys } from "./query-keys.ts";
import { admittedStageCompletion } from "../../src/core/lifecycle.ts";
import type {
  CurrentAttentionTag,
  MaterialPresentationState,
  StageRunInteraction,
} from "../../src/core/lifecycle.ts";
import { StageRunMaterial } from "./ActivityWorkspace.tsx";
import { ReadOnlyLifecycleDocumentMaterial } from "./DocumentWorkspace.tsx";
import { EvidenceViewer } from "./EvidenceViewer.tsx";
import {
  eventEvidence,
  lifecycleArtifactLabel,
  materialPresentationStateLabel,
  readinessOutcomeLabel,
  runIsActive,
  runStatusLabel,
  type EvidenceSelection,
  type WorkflowMaterial,
} from "./workbench-presentation.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchResourceList } from "./primitives/WorkbenchResourceList.tsx";
import { WorkbenchReview } from "./primitives/WorkbenchReview.tsx";
import { WorkbenchState } from "./primitives/WorkbenchState.tsx";
import { WorkbenchIcon } from "./primitives/WorkbenchIcon.tsx";

const packageRoles = new Set<ArtifactRef["role"]>([
  "R1",
  "R2",
  "DESIGN",
  "PLAN",
]);

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

const readinessFindingsMarkdown = (markdown: string): string | null => {
  const selected: string[] = [];
  let includedHeadingLevel: number | null = null;
  let fence: string | null = null;
  for (const line of markdown.split("\n")) {
    const fenceMatch = /^\s{0,3}(`{3,}|~{3,})/.exec(line)?.[1] ?? null;
    if (fenceMatch !== null) {
      if (fence === null) fence = fenceMatch;
      else if (fence[0] === fenceMatch[0] && fenceMatch.length >= fence.length) fence = null;
      if (includedHeadingLevel !== null) selected.push(line);
      continue;
    }
    const heading = fence === null ? /^(#{2,6})\s+(.+?)\s*$/.exec(line) : null;
    if (heading !== null) {
      const level = heading[1]!.length;
      const label = heading[2]!.trim().toLowerCase();
      if (includedHeadingLevel !== null && level > includedHeadingLevel) {
        selected.push(line);
        continue;
      }
      includedHeadingLevel =
        label === "findings" || label === "r3 findings" || label === "package judgment"
          ? level : null;
      continue;
    }
    if (includedHeadingLevel !== null) selected.push(line);
  }
  const value = selected.join("\n").trim();
  return value.length === 0 ? null : value;
};

export const ReadinessWorkspace = ({
  workItem,
  runs,
  runEvents,
  artifacts,
  material,
  materialStateForArtifact,
  reviewNotice,
  reviewAction,
  currentRunId,
  currentInteraction,
  currentAttention,
  focusedRequiredInputEventId,
  mutationsDisabled = false,
  onRequiredInputFocused,
  onSelectMaterial,
  onOpenArtifactEvidence,
  onOpenEvidence,
  onReturnFromTransient,
  onContextDocumentChange,
  onMutationRefresh,
  onMutationError,
}: Readonly<{
  workItem: WorkItem;
  runs: readonly Run[];
  runEvents: readonly RunEvent[];
  artifacts: readonly ArtifactRef[];
  material: WorkflowMaterial;
  materialState: MaterialPresentationState | null;
  materialStateForArtifact: (artifact: ArtifactRef) => MaterialPresentationState | null;
  reviewNotice?: ReactNode;
  reviewAction?: ReactNode;
  currentRunId: Run["id"] | null;
  currentInteraction: StageRunInteraction | null;
  currentAttention: CurrentAttentionTag;
  focusedRequiredInputEventId: RunEvent["id"] | null;
  mutationsDisabled?: boolean;
  onRequiredInputFocused: (eventId: RunEvent["id"]) => void;
  onSelectMaterial: (material: WorkflowMaterial) => void;
  onOpenArtifactEvidence: (artifactId: ArtifactRef["id"]) => void;
  onOpenEvidence: (selection: EvidenceSelection) => void;
  onReturnFromTransient: () => void;
  onContextDocumentChange: (path: string | null, sha256: Sha256 | null) => void;
  onMutationRefresh: (acceptedEvent?: RunEvent) => Promise<void>;
  onMutationError?: (error: unknown) => void;
}>) => {
  const stageRuns = [...runs]
    .filter((run) => run.role === "STAGE" && run.stage === "R3")
    .sort(
      (left, right) =>
        right.attempt - left.attempt ||
        right.startedAt.localeCompare(left.startedAt) ||
        right.id.localeCompare(left.id),
    );
  const latestRun = stageRuns[0] ?? null;
  const selectedRun = material.kind === "STAGE_RUN"
    ? stageRuns.find(run => run.id === material.runId) ?? null : latestRun;
  const completion = selectedRun === null ? null :
    admittedStageCompletion(workItem.id, selectedRun, runEvents);
  const matchingArtifacts = completion === null ? [] :
    artifacts.filter(artifact => artifact.id === completion.artifactRefIds[0] &&
      artifact.workItemId === workItem.id && artifact.role === "R3");
  const readinessArtifact = matchingArtifacts.length === 1 ? matchingArtifacts[0]! : null;
  const readinessContentQuery = useQuery({
    queryKey: workbenchQueryKeys.artifactContent(readinessArtifact?.id ?? null),
    queryFn: () => {
      if (readinessArtifact === null) {
        throw new TypeError("readiness artifact selection required");
      }
      return api.readArtifactContent(readinessArtifact.id);
    },
    enabled: readinessArtifact !== null,
  });
  const readinessMarkdown =
    readinessContentQuery.data === undefined
      ? null
      : decodeCanonicalMarkdown(readinessContentQuery.data);
  const findingsMarkdown =
    readinessMarkdown === null
      ? null
      : readinessFindingsMarkdown(readinessMarkdown);

  const outcome = completion?.completion.stage === "R3" &&
    readinessArtifact !== null && readinessContentQuery.isSuccess &&
    readinessMarkdown !== null ? completion.completion.outcome : null;

  const verdict =
    outcome !== null
      ? readinessOutcomeLabel(outcome)
      : latestRun === null
        ? "Not started"
        : latestRun.status === "BLOCKED"
          ? "Blocked"
          : latestRun.status === "FAILED"
            ? "Review failed"
            : latestRun.status === "CANCELLED"
              ? "Review cancelled"
              : latestRun.status === "COMPLETED"
                ? "No recorded verdict"
                : "Review in progress";
  const readyForSignoff = outcome !== null && verdict === "Ready for sign-off";
  const verdictTone =
    readyForSignoff
      ? "success"
      : outcome !== null
        ? "warning"
        : latestRun?.status === "BLOCKED" || latestRun?.status === "FAILED"
          ? "danger"
          : latestRun === null || latestRun.status === "CANCELLED"
            ? "neutral"
            : latestRun.status === "COMPLETED"
              ? "warning"
              : "info";
  const verdictDescription =
    readyForSignoff
      ? "The package passed readiness review. Human authorization takes place in Approval."
      : outcome === null
        ? latestRun === null
          ? "Start the independent review of the exact package."
          : latestRun.status === "FAILED" || latestRun.status === "BLOCKED"
            ? "The review has not established readiness. Resolve the current review condition."
            : "The independent review has not yet recorded a verdict."
        : outcome.startsWith("RETURN_TO_")
          ? "Readiness returned ownership to the upstream stage named in the findings."
          : "The review did not establish readiness for sign-off.";

  const packageArtifacts = artifacts
    .filter((artifact) => packageRoles.has(artifact.role))
    .sort((left, right) =>
      left.repositoryPath.localeCompare(right.repositoryPath));

  const selectedSupportingArtifact =
    material.kind === "SUPPORTING_DOCUMENT"
      ? artifacts.find((artifact) => artifact.id === material.artifactId) ?? null
      : null;

  const selectedSupportingMaterialState = selectedSupportingArtifact === null
    ? null : materialStateForArtifact(selectedSupportingArtifact);

  const reviewMaterial =
    readinessArtifact === null
      ? (
        <WorkbenchState
          kind="empty"
          title={latestRun === null ? "No review findings yet" : "No recorded review findings"}
          description={latestRun === null
            ? "Start Readiness review to obtain the independent findings."
            : "The governed review findings will appear here when available."}
        />
      )
      : readinessContentQuery.isPending
        ? <WorkbenchState kind="loading" title="Loading readiness findings…" />
        : readinessContentQuery.isError
          ? (
            <WorkbenchState
              kind="error"
              title="Readiness findings unavailable"
              description="Use Governed review to inspect the complete readiness document."
            />
          )
          : findingsMarkdown === null
            ? (
              <WorkbenchState
                kind="empty"
                title="No separate readiness findings were recorded"
                description="Use Governed review to inspect the complete readiness document."
              />
            )
            : (
              <div>
                <Markdown
                  contentWidth="var(--order-prose-max-width)"
                  contentAlign="start"
                >
                  {findingsMarkdown}
                </Markdown>
              </div>
            );

  const requiredInputOwnsAttention =
    workItem.stage === "R3" &&
    material.kind === "STAGE_RUN" &&
    material.runId === currentRunId &&
    currentInteraction?.tag === "REQUIRED_INPUT";

  const selectedSecondary = (() => {
    switch (material.kind) {
      case "STAGE_RUN":
        return (
          <StageRunMaterial
            stage="R3"
            runs={runs}
            runEvents={runEvents}
            selectedRunId={material.runId}
            currentRunId={workItem.stage === "R3" ? currentRunId : null}
            currentInteraction={workItem.stage === "R3" ? currentInteraction : null}
            currentAttention={currentAttention}
            focusedRequiredInputEventId={focusedRequiredInputEventId}
            mutationsDisabled={mutationsDisabled}
            onRequiredInputFocused={onRequiredInputFocused}
            onSelectedRunChange={(runId) =>
              onSelectMaterial({ kind: "STAGE_RUN", runId })}
            onOpenEvidence={onOpenEvidence}
            onMutationRefresh={onMutationRefresh}
            onMutationError={onMutationError}
          />
        );

      case "SUPPORTING_DOCUMENT":
        return selectedSupportingArtifact === null
          ? (
            <WorkbenchState
              kind="empty"
              title="Supporting document is no longer current"
            />
          )
          : (
            <ReadOnlyLifecycleDocumentMaterial
              workItem={workItem}
              artifactId={selectedSupportingArtifact.id}
              materialState={selectedSupportingMaterialState}
              historicalArtifact={selectedSupportingMaterialState?.tag === "HISTORICAL" || selectedSupportingMaterialState?.tag === "SIGNED_LOCKED" ? selectedSupportingArtifact : undefined}
              onOpenArtifactEvidence={onOpenArtifactEvidence}
              onContextDocumentChange={onContextDocumentChange}
            />
          );

      case "EVIDENCE":
        return (
          <EvidenceViewer
            selection={material.selection}
            onBack={onReturnFromTransient}
          />
        );

      default:
        return null;
    }
  })();

  const historicalRunSelected =
    material.kind === "STAGE_RUN" &&
    material.runId !== currentRunId;
  const activeDialogueSelected = material.kind === "STAGE_RUN" &&
    currentInteraction !== null && currentInteraction.tag !== "CLOSED";

  if (
    selectedSecondary !== null &&
    (
      requiredInputOwnsAttention ||
      activeDialogueSelected ||
      historicalRunSelected ||
      material.kind === "SUPPORTING_DOCUMENT"
    )
  ) {
    return (
      <div className={material.kind === "SUPPORTING_DOCUMENT" ? "order-document-inspection" : "order-readiness-dialogue"} data-testid="review-workspace">
        {requiredInputOwnsAttention ? null : (
          <div className="order-inline-actions">
            <WorkbenchAction
              label="Back to Readiness review"
              tone="ghost"
              onClick={onReturnFromTransient}
            />
          </div>
        )}
        {selectedSecondary}
      </div>
    );
  }

  if (selectedSecondary !== null && material.kind === "EVIDENCE") {
    return <div data-testid="review-workspace">{selectedSecondary}</div>;
  }

  const exactMaterialState = readinessArtifact === null ? null : materialStateForArtifact(readinessArtifact);
  const materialCurrentness =
    exactMaterialState === null
      ? undefined
      : materialPresentationStateLabel(exactMaterialState);
  const currentness =
    materialCurrentness === verdict ? undefined : materialCurrentness;

  const packageItems = packageArtifacts.map((artifact) => ({
      id: "package-" + artifact.id,
      label: lifecycleArtifactLabel(artifact.role),
      action: (
        <WorkbenchAction
          label={"View " + lifecycleArtifactLabel(artifact.role)}
          icon={<WorkbenchIcon name="document" />}
          tone="secondary"
          onClick={() =>
            onSelectMaterial({
              kind: "SUPPORTING_DOCUMENT",
              artifactId: artifact.id,
            })}
        />
      ),
    }));

  const evidenceItems = stageRuns.flatMap((run) => {
    const evidence = runEvents
      .filter((event) => event.runId === run.id)
      .flatMap((event) => eventEvidence(event));
    const unique = [...new Map(
      evidence.map((reference) => [reference.relativePath, reference] as const),
    ).values()];
    return unique.map((reference, index) => ({
      id: "evidence-" + run.id + "-" + index,
      label:
        "Evidence " +
        (index + 1) +
        " · Attempt " +
        run.attempt,
      detail: reference.mediaType,
      action: (
        <WorkbenchAction
          label={"Inspect evidence " + (index + 1) + " from Readiness attempt " + run.attempt}
          icon={<WorkbenchIcon name="evidence" />}
          tone="secondary"
          onClick={() =>
            onOpenEvidence({
              kind: "EVIDENCE",
              runId: run.id,
              relativePath: reference.relativePath,
            })}
        />
      ),
    }));
  });

  const attemptItems = stageRuns.map((run) => ({
    id: "attempt-" + run.id,
    label: "Attempt " + run.attempt,
    detail: runStatusLabel(run.status) + " · " + new Date(run.startedAt).toLocaleString(),
    action: (
      <WorkbenchAction
        label={"View Readiness attempt " + run.attempt}
        icon={<WorkbenchIcon name="dialogue" />}
        tone="secondary"
        onClick={() => onSelectMaterial({ kind: "STAGE_RUN", runId: run.id })}
      />
    ),
  }));

  return (
    <div className="order-review-workspace" data-testid="review-workspace">
      <WorkbenchReview
        title="Readiness review"
        description="Independent package readiness."
        verdict={{
          label: verdict,
          description: verdictDescription,
          tone: verdictTone,
          currentness,
        }}
        sections={[
          {
            id: "findings",
            title: outcome?.startsWith("RETURN_TO_")
              ? "Findings and return owner"
              : "Findings",
            content: (
              <>
                {reviewNotice}
                {outcome?.startsWith("RETURN_TO_") ? (
                  <strong>{readinessOutcomeLabel(outcome)}</strong>
                ) : null}
                {reviewMaterial}
              </>
            ),
          },
          {
            id: "governed-review",
            title: "Governed review",
            content: readinessArtifact === null
              ? <WorkbenchState kind="empty" title={latestRun === null ? "No governed review yet" : runIsActive(latestRun) ? "Readiness review is in progress" : "No governed review is available"} />
              : (
                <WorkbenchAction
                  label="Read readiness review"
                  icon={<WorkbenchIcon name="document" />}
                  tone="secondary"
                  onClick={() =>
                    onSelectMaterial({
                      kind: "SUPPORTING_DOCUMENT",
                      artifactId: readinessArtifact.id,
                    })}
                />
              ),
          },
          {
            id: "package",
            title: "Package documents",
            content: packageItems.length === 0
              ? <WorkbenchState kind="empty" title="No package documents" />
              : <WorkbenchResourceList items={packageItems} />,
          },
          {
            id: "evidence",
            title: "Evidence",
            content: evidenceItems.length === 0
              ? <WorkbenchState kind="empty" title="No readiness evidence" />
              : <WorkbenchResourceList items={evidenceItems} />,
          },
          {
            id: "attempts",
            title: "Readiness attempts",
            content: attemptItems.length === 0
              ? <WorkbenchState kind="empty" title="No readiness attempts" />
              : <WorkbenchResourceList items={attemptItems} />,
          },
        ]}
        decisions={reviewAction}
      />
    </div>
  );
};
