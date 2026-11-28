import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@astryxdesign/core/Link";
import { TextInput } from "@astryxdesign/core/TextInput";

import type { ArtifactRef, Run, RunEvent, Sha256, SignoffPackage, WorkItem, WorkItemSchemaCatalogEntry } from "../../src/core/contracts.ts";
import {
  artifactHasCurrentStageConformance,
  deriveCurrentAttention,
  deriveAcceptanceDecision,
  reconstructCandidateRounds,
  deriveExecutionOwner,
  deriveObservationCoherence,
  deriveValidationBoundary,
  deriveProposalDecision,
  deriveMaterialPresentationState,
  deriveReachedStages,
  deriveRecoveryDisposition,
  deriveWorkflowRail,
  materialCurrentnessForStage,
  normalizeMaterialCurrentness,
  reachStateForStage,
  stageRunInteraction,
} from "../../src/core/lifecycle.ts";
import * as api from "./http.ts";
import { invalidateWorkbenchMutation, workbenchQueryKeys } from "./query-keys.ts";
import {
  bindProspectiveApprovalSelection,
  prospectiveApprovalIsSuperseded,
  resolveWorkflowMaterial,
  runIsActive,
  workflowStepState,
  workflowMaterialIdentity,
  workflowPresentation,
  workflowSteps,
  type EvidenceSelection,
  type ProposalSelection,
  type WorkflowMaterial,
} from "./workbench-presentation.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchAttention } from "./primitives/WorkbenchAttention.tsx";
import { WorkbenchConfirmation } from "./primitives/WorkbenchConfirmation.tsx";
import { WorkbenchWorkItemShell } from "./primitives/WorkbenchWorkItemShell.tsx";
import { WorkbenchSurface } from "./primitives/WorkbenchSurface.tsx";
import { WorkbenchNotice } from "./primitives/WorkbenchNotice.tsx";
import { WorkItemIdentityRow } from "./WorkItemIdentityRow.tsx";
import { WorkflowRail } from "./WorkflowRail.tsx";
import { WorkbenchIcon } from "./primitives/WorkbenchIcon.tsx";
import {
  WorkbenchEmptyState,
  WorkbenchErrorState,
  WorkbenchState,
} from "./primitives/WorkbenchState.tsx";

const SourceDocumentMaterial = lazy(() =>
  import("./DocumentWorkspace.tsx").then((module) => ({ default: module.SourceDocumentMaterial })));
const LifecycleDocumentMaterial = lazy(() =>
  import("./DocumentWorkspace.tsx").then((module) => ({ default: module.LifecycleDocumentMaterial })));
const PreSignoffStageWorkspace = lazy(() =>
  import("./PreSignoffStageWorkspace.tsx").then((module) => ({ default: module.PreSignoffStageWorkspace })));
const ReadinessWorkspace = lazy(() =>
  import("./ReadinessWorkspace.tsx").then((module) => ({ default: module.ReadinessWorkspace })));
const SignoffReview = lazy(() =>
  import("./SignoffReview.tsx").then((module) => ({ default: module.SignoffReview })));
const ExecutionWorkspace = lazy(() =>
  import("./ExecutionWorkspace.tsx").then((module) => ({ default: module.ExecutionWorkspace })));
const EvidenceViewer = lazy(() =>
  import("./EvidenceViewer.tsx").then((module) => ({ default: module.EvidenceViewer })));
const AcceptanceWorkspace = lazy(() => import("./AcceptanceWorkspace.tsx").then(module => ({default: module.AcceptanceWorkspace})));
const TerminalResult = lazy(() =>
  import("./TerminalResult.tsx").then((module) => ({ default: module.TerminalResult })));

const preSignoff = new Set<WorkItem["stage"]>([
  "IDEA",
  "R1",
  "R2",
  "DESIGN",
  "PLAN",
  "R3",
]);

type WorkspaceSelection = Readonly<{
  step: WorkItem["stage"];
  material: WorkflowMaterial | null;
}>;

const startLabelForStage = (stage: WorkItem["stage"]): string =>
  stage === "IDEA"
    ? "Start Research"
    : stage === "PLAN"
      ? "Start Implementation planning"
      : "Start " + workflowPresentation(stage).label;

export const WorkItemWorkspace = ({
  workItem,
  schemas,
  selectedWorkItemFetching,
  selectedWorkItemUpdatedAt,
  selectedWorkItemError,
  contextOpen,
  onContextOpenChange,
  contextContent,
  onBack,
  onContextSelectionChange,
  onContextDocumentChange,
  onCreateRemediation,
  onDirtyChange,
}: Readonly<{
  workItem: WorkItem;
  schemas: readonly WorkItemSchemaCatalogEntry[];
  selectedWorkItemFetching: boolean;
  selectedWorkItemUpdatedAt: number;
  selectedWorkItemError: unknown;
  contextOpen: boolean;
  onContextOpenChange: (open: boolean) => void;
  contextContent: ReactNode;
  onBack: () => void;
  onContextSelectionChange: (
    step: WorkItem["stage"],
    material: WorkflowMaterial,
  ) => void;
  onContextDocumentChange: (path: string | null, sha256: Sha256 | null, artifactId?: ArtifactRef["id"] | null) => void;
  onCreateRemediation: (workItem: WorkItem) => void;
  onDirtyChange: (dirty: boolean) => void;
}>) => {
  const queryClient = useQueryClient();
  const [selectedStep, setSelectedStep] = useState<WorkItem["stage"]>(workItem.stage);
  const [explicitMaterial, setExplicitMaterial] = useState<WorkflowMaterial | null>(null);
  const [dirty, setDirty] = useState(false);
  const [acceptanceDiscardVersion,setAcceptanceDiscardVersion]=useState(0);
  const [pendingSelection, setPendingSelection] = useState<WorkspaceSelection | null>(null);
  const [pendingReturnSelection, setPendingReturnSelection] =
    useState<WorkspaceSelection | null>(null);
  const [returnSelection, setReturnSelection] = useState<WorkspaceSelection | null>(null);
  const [returnFocusName, setReturnFocusName] = useState<string | null>(null);
  const [titleEditing, setTitleEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(workItem.title);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [mutationConflict, setMutationConflict] = useState(false);
  const [mutationRefreshPending, setMutationRefreshPending] = useState(false);
  const [terminalDrainPending, setTerminalDrainPending] = useState(false);
  const [focusedRequiredInputEventId, setFocusedRequiredInputEventId] =
    useState<RunEvent["id"] | null>(null);
  const priorActiveRunIds = useRef<readonly Run["id"][]>([]);
  const mutationConflictObservation = useRef<string | null>(null);
  const mutationConflictWorkItemUpdatedAt = useRef<number | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const priorWorkItemStage = useRef<WorkItem["stage"]>(workItem.stage);

  const runsQuery = useQuery({
    queryKey: workbenchQueryKeys.runs(workItem.id),
    queryFn: () => api.listRuns(workItem.id),
    refetchInterval: (query) =>
      query.state.data?.some(runIsActive) === true ? 1000 : false,
  });
  const artifactsQuery = useQuery({
    queryKey: workbenchQueryKeys.lifecycleArtifacts(workItem.id),
    queryFn: () => api.listLifecycleArtifacts(workItem.id),
  });
  const historicalPreSignoffSelected =
    selectedStep !== workItem.stage &&
    (
      selectedStep === "R1" ||
      selectedStep === "R2" ||
      selectedStep === "DESIGN" ||
      selectedStep === "PLAN" ||
      selectedStep === "R3"
    );
  const historicalArtifactsRequired =
    historicalPreSignoffSelected ||
    selectedStep === "R3" ||
    selectedStep === "AWAITING_SIGNOFF" ||
    workItem.stage === "AWAITING_SIGNOFF" ||
    selectedStep === "EXECUTION" || selectedStep === "AWAITING_ACCEPTANCE" ||
    selectedStep === "COMPLETE" ||
    workItem.stage === "EXECUTION" || workItem.stage === "AWAITING_ACCEPTANCE" ||
    workItem.stage === "COMPLETE";
  const allArtifactsQuery = useQuery({
    queryKey: workbenchQueryKeys.artifacts(workItem.id),
    queryFn: () => api.listArtifacts(workItem.id),
    enabled: historicalArtifactsRequired,
  });
  const currentApprovalRequired = workItem.stage === "EXECUTION" || workItem.stage === "AWAITING_ACCEPTANCE" || workItem.stage === "COMPLETE";
  const currentApprovalQuery = useQuery({
    queryKey: workbenchQueryKeys.currentApproval(workItem.id),
    queryFn: () => api.getCurrentApproval(workItem.id),
    enabled: currentApprovalRequired,
  });
  const currentApproval = currentApprovalRequired ? currentApprovalQuery.data : undefined;
  const signedArtifactsQuery = useQuery({
    queryKey: workbenchQueryKeys.approvalArtifacts(workItem.id, currentApproval?.id ?? null),
    queryFn: () => {
      if (currentApproval == null) throw new TypeError("current Approval identity required");
      return api.listApprovalArtifacts(workItem.id, currentApproval.id);
    },
    enabled: currentApproval != null,
  });
  const approvalMembershipUnresolved = currentApprovalRequired &&
    (currentApprovalQuery.isPending || currentApprovalQuery.isError ||
      (currentApproval != null && (!signedArtifactsQuery.isSuccess || signedArtifactsQuery.isFetching)));
  const tasksRequired =
    selectedStep === "AWAITING_SIGNOFF" ||
    selectedStep === "EXECUTION" || selectedStep === "AWAITING_ACCEPTANCE" ||
    workItem.stage === "EXECUTION" || workItem.stage === "AWAITING_ACCEPTANCE" ||
    workItem.stage === "COMPLETE";
  const tasksQuery = useQuery({
    queryKey: workbenchQueryKeys.tasks(workItem.id),
    queryFn: () => api.listExecutionTasks(workItem.id),
    enabled: tasksRequired,
  });
  const sourceQuery = useQuery({
    queryKey: workbenchQueryKeys.workItemSource(workItem.id),
    queryFn: () => api.getWorkItemSource(workItem.id),
  });
  const diagnosticsQuery = useQuery({
    queryKey: workbenchQueryKeys.workItemSourceDiagnostics,
    queryFn: api.listWorkItemSourceDiagnostics,
  });
  const signoffPackageQuery = useQuery({
    queryKey: workbenchQueryKeys.signoffPackage(workItem.id),
    queryFn: () => api.getSignoffPackage(workItem.id),
    enabled: workItem.stage === "AWAITING_SIGNOFF",
  });
  const packageHash = workItem.stage === "AWAITING_SIGNOFF" ? signoffPackageQuery.data?.packageHash ?? null : null;
  useEffect(() => {
    if (!signoffPackageQuery.isSuccess || signoffPackageQuery.data === undefined) return;
    const observed = signoffPackageQuery.data;
    // Retain the canonical response by exact identity for read-only inspection
    // after the current package changes. This cache never authorizes sign-off.
    queryClient.setQueryData(workbenchQueryKeys.observedSignoffPackage(workItem.id, observed.packageHash), observed);
  }, [queryClient, workItem.id, signoffPackageQuery.data, signoffPackageQuery.isSuccess]);
  const prospectiveArtifactsQuery = useQuery({
    queryKey: workbenchQueryKeys.signoffPackageArtifacts(workItem.id, packageHash),
    queryFn: () => {
      if (packageHash === null) throw new TypeError("prospective package hash required");
      return api.listSignoffPackageArtifacts(workItem.id, packageHash);
    },
    enabled: packageHash !== null,
    retry: false,
  });
  const approvalsQuery = useQuery({
    queryKey: workbenchQueryKeys.approvals(workItem.id),
    queryFn: () => api.listApprovals(workItem.id),
    enabled: selectedStep === "AWAITING_SIGNOFF" || tasksRequired,
  });
  const qaApprovals = approvalsQuery.data ?? [];
  const qaHistories = useQueries({queries: qaApprovals.map(approval => ({queryKey: workbenchQueryKeys.qaHistory(workItem.id,approval.id), queryFn: () => api.listCandidateReviewEvents(workItem.id,approval.id), retry:false, refetchInterval: workItem.stage === "AWAITING_ACCEPTANCE" ? 2000 : false}))});
  const allReviewEvents = qaHistories.flatMap(query => query.data ?? []);
  const explicitApproval = explicitMaterial?.kind === "APPROVAL_PACKAGE" ? explicitMaterial : null;
  const selectedApproval = explicitApproval?.approvalId === undefined
    ? workItem.stage === "AWAITING_SIGNOFF" || explicitApproval?.packageHash !== undefined ? null : currentApproval ??
      (currentApprovalRequired ? null : approvalsQuery.data?.at(-1) ?? null)
    : approvalsQuery.data?.find(approval => approval.id === explicitApproval.approvalId) ?? null;
  const selectedApprovalUnresolved = explicitApproval?.approvalId !== undefined && selectedApproval === null;
  const selectedApprovalArtifactsQuery = useQuery({
    queryKey: workbenchQueryKeys.approvalArtifacts(workItem.id, selectedApproval?.id ?? null),
    queryFn: () => {
      if (selectedApproval === null) throw new TypeError("Approval identity required");
      return api.listApprovalArtifacts(workItem.id, selectedApproval.id);
    },
    enabled: selectedStep === "AWAITING_SIGNOFF" && selectedApproval !== null,
    retry: false,
  });

  const runs = runsQuery.data ?? [];

  useEffect(() => {
    if (!runs.some(runIsActive)) return;
    const interval = window.setInterval(() => {
      void queryClient.refetchQueries({
        queryKey: workbenchQueryKeys.workItem(workItem.id),
        type: "active",
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [queryClient, runs, workItem.id]);

  useEffect(() => {
    const activeIds = runs.filter(runIsActive).map((run) => run.id);
    const terminalized = priorActiveRunIds.current.filter(
      (runId) => !activeIds.includes(runId),
    );
    priorActiveRunIds.current = activeIds;
    if (terminalized.length === 0) return;

    setTerminalDrainPending(true);
    void (async () => {
      for (const runId of terminalized) {
        const key = workbenchQueryKeys.runEvents(runId);
        const cached = queryClient.getQueryData<readonly RunEvent[]>(key) ?? [];
        const afterSequence = cached.at(-1)?.sequence ?? 0;
        const finalEvents = await api.listRunEvents(runId, afterSequence);
        if (finalEvents.length > 0) {
          const byId = new Map(
            [...cached, ...finalEvents].map((event) => [event.id, event] as const),
          );
          queryClient.setQueryData(
            key,
            [...byId.values()].sort((left, right) =>
              left.sequence - right.sequence ||
              left.id.localeCompare(right.id)),
          );
        }
      }
      await Promise.all([
        queryClient.refetchQueries({
          queryKey: workbenchQueryKeys.workItem(workItem.id),
          type: "active",
        }),
        queryClient.refetchQueries({
          queryKey: workbenchQueryKeys.runs(workItem.id),
          type: "active",
        }),
        queryClient.refetchQueries({
          queryKey: workbenchQueryKeys.tasks(workItem.id),
          type: "active",
        }),
        queryClient.refetchQueries({
          queryKey: workbenchQueryKeys.currentApproval(workItem.id),
          type: "active",
        }),
        queryClient.refetchQueries({
          queryKey: workbenchQueryKeys.approvals(workItem.id),
          type: "active",
        }),
        queryClient.refetchQueries({
          queryKey: workbenchQueryKeys.lifecycleArtifacts(workItem.id),
          type: "active",
        }),
        queryClient.refetchQueries({
          queryKey: workbenchQueryKeys.artifacts(workItem.id),
          type: "active",
        }),
        queryClient.refetchQueries({
          queryKey: workbenchQueryKeys.workItemSource(workItem.id),
          type: "active",
        }),
        queryClient.refetchQueries({
          queryKey: workbenchQueryKeys.workItemSourceDiagnostics,
          type: "active",
        }),
        queryClient.refetchQueries({
          queryKey: workbenchQueryKeys.signoffPackage(workItem.id),
          type: "active",
        }),
      ]);
    })().finally(() => setTerminalDrainPending(false));
  }, [queryClient, runs, workItem.id]);

  const artifacts = artifactsQuery.data ?? [];
  const allArtifacts = allArtifactsQuery.data ?? [];
  const currentArtifactIds = new Set(artifacts.map((artifact) => artifact.id));
  const signedArtifacts = currentApproval != null && signedArtifactsQuery.isSuccess
    ? signedArtifactsQuery.data : [];
  const signedArtifactIds = new Set(signedArtifacts.map(artifact => artifact.id));
  const inspectionArtifacts = historicalArtifactsRequired
    ? [...new Map([...signedArtifacts, ...artifacts, ...allArtifacts]
        .map(artifact => [artifact.id, artifact] as const)).values()]
    : artifacts;
  const tasks = tasksQuery.data ?? [];
  const coherenceTasks = currentApproval == null
    ? []
    : tasks.filter((task) => task.approvalId === currentApproval.id);
  const currentExecutionTasks = workItem.stage === "EXECUTION" ? coherenceTasks : [];
  const runEventQueries = useQueries({
    queries: runs.map((run) => ({
      queryKey: workbenchQueryKeys.runEvents(run.id),
      queryFn: () => api.listRunEvents(run.id, 0),
      refetchInterval: runIsActive(run) ? 1000 : false,
    })),
  });
  const allRunEvents = runEventQueries.flatMap((query) => query.data ?? []);
  const workflow = workflowPresentation(workItem.stage);
  const selectedWorkflow = workflowPresentation(selectedStep);
  const sharedPreSignoffStage =
    selectedStep === "R1" ||
    selectedStep === "R2" ||
    selectedStep === "DESIGN" ||
    selectedStep === "PLAN"
      ? selectedStep
      : null;
  const currentStageRun =
    workItem.stage === "R1" ||
    workItem.stage === "R2" ||
    workItem.stage === "DESIGN" ||
    workItem.stage === "PLAN" ||
    workItem.stage === "R3"
      ? [...runs]
          .filter((run) => run.role === "STAGE" && run.stage === workItem.stage)
          .sort((left, right) =>
            left.attempt - right.attempt ||
            left.startedAt.localeCompare(right.startedAt) ||
            left.id.localeCompare(right.id))
          .at(-1) ?? null
      : null;
  const currentStageEvents = currentStageRun === null
    ? []
    : allRunEvents.filter((event) => event.runId === currentStageRun.id);
  const currentStageEventsPending =
    currentStageRun !== null &&
    runs.some((run, index) =>
      run.id === currentStageRun.id &&
      runEventQueries[index]?.data === undefined
    );
  const executionEventsPending =
    workItem.stage === "EXECUTION" &&
    runs.some((run, index) =>
      run.executionTaskId !== null &&
      runEventQueries[index]?.data === undefined
    );
  const currentStageObservationPending =
    currentStageEventsPending || mutationRefreshPending;
  const proposalDecision =
    currentStageRun === null || currentStageObservationPending
      ? { tag: "NONE" as const }
      : deriveProposalDecision(currentStageEvents);
  const currentStageInteraction =
    currentStageRun === null || currentStageObservationPending
      ? null
      : stageRunInteraction(currentStageRun, currentStageEvents);
  const pendingProposal: ProposalSelection | null =
    currentStageRun !== null && proposalDecision.tag !== "NONE"
      ? {
          runId: currentStageRun.id,
          eventId: proposalDecision.proposalEventId,
        }
      : null;
  const selectedTaskId =
    explicitMaterial?.kind === "EXECUTION_TASK"
      ? explicitMaterial.taskId
      : null;
  const selectedRunId =
    explicitMaterial?.kind === "STAGE_RUN"
      ? explicitMaterial.runId
      : explicitMaterial?.kind === "EXECUTION_TASK"
        ? explicitMaterial.runId
        : explicitMaterial?.kind === "PROPOSAL"
          ? explicitMaterial.runId
          : null;

  const reachedStages = deriveReachedStages(
    workItem,
    runs,
    allRunEvents,
    artifacts,
    tasks,
    allReviewEvents,
  );

  const selectedStepState = workflowStepState(
    workItem,
    reachedStages,
    selectedStep,
  );

  const selectedStageArtifact =
    selectedStep === "R1" ||
    selectedStep === "R2" ||
    selectedStep === "DESIGN" ||
    selectedStep === "PLAN" ||
    selectedStep === "R3"
      ? inspectionArtifacts.find((artifact) => artifact.role === selectedStep) ?? null
      : null;

  const sourceDiagnostics = (diagnosticsQuery.data ?? []).filter(
    (item) => item.workItemId === workItem.id || item.path === workItem.sourcePath,
  );
  const sourceAuthorityChanged =
    sourceQuery.data !== undefined &&
    sourceQuery.data.sha256 !== workItem.sourceSha256;
  const sourceAuthorityRequiresReconciliation =
    sourceDiagnostics.length > 0 || sourceAuthorityChanged;
  const observedPackageError = signoffPackageQuery.error ?? prospectiveArtifactsQuery.error;
  const packageStaleOwner =
    workItem.stage === "AWAITING_SIGNOFF" &&
    api.isOrderHttpRequestFailure(observedPackageError) &&
    observedPackageError.orderError.code === "STALE_AUTHORITY"
      ? observedPackageError.orderError.staleAuthorityOwner
      : null;
  const changedAuthorityOwners =
    sourceAuthorityRequiresReconciliation
      ? (["R1"] as const)
      : packageStaleOwner === null
        ? []
        : [packageStaleOwner];
  const currentness = normalizeMaterialCurrentness(
    changedAuthorityOwners.length === 0,
    changedAuthorityOwners,
  );
  const executionOwner = deriveExecutionOwner(currentExecutionTasks, runs);
  const currentExecutionObservationRequired = workItem.stage === "EXECUTION";
  const currentReviewHistory = allReviewEvents.filter(entry => entry.approvalId === currentApproval?.id);
  const executionHistoryQuery=qaHistories[qaApprovals.findIndex(approval=>approval.id===currentApproval?.id)];
  const executionObservationPending =
    currentExecutionObservationRequired &&
    (
      runsQuery.data === undefined ||
      tasksQuery.data === undefined ||
      currentApprovalQuery.data === undefined ||
      approvalsQuery.isPending ||
      (currentApproval != null && executionHistoryQuery?.isPending === true) ||
      executionEventsPending
    );
  let validationBoundary: ReturnType<typeof deriveValidationBoundary> | null = null;
  let validationObservationError: Error | null = null;
  if (!executionObservationPending) {
    try {
      validationBoundary = deriveValidationBoundary(executionOwner, currentExecutionTasks, runs, allRunEvents,
        currentApproval??null,currentReviewHistory);
    } catch (error) {
      validationObservationError = error instanceof Error ? error : new Error(String(error));
    }
  }
  const recovery = deriveRecoveryDisposition(workItem, runs, currentness);
  const semanticCoherence = deriveObservationCoherence(
    workItem,
    runs,
    allRunEvents,
    coherenceTasks,
  );
  const currentStageEventsError =
    currentStageRun === null
      ? null
      : runs.reduce<unknown>((error, run, index) =>
          error ??
          (
            run.id === currentStageRun.id
              ? runEventQueries[index]?.error ?? null
              : null
          ), null);
  const currentExecutionEventsError =
    workItem.stage !== "EXECUTION"
      ? null
      : (approvalsQuery.error??executionHistoryQuery?.error??runs.reduce<unknown>((error, run, index) =>
          error ??
          (
            run.executionTaskId !== null
              ? runEventQueries[index]?.error ?? null
              : null
          ), null));
  const currentExecutionTasksFetching =
    (workItem.stage === "EXECUTION" || workItem.stage === "AWAITING_ACCEPTANCE" || workItem.stage === "COMPLETE") &&
    tasksQuery.isFetching;
  const selectedStageConformancePending =
    selectedStageArtifact !== null &&
    runs.some((run, index) =>
      run.role === "STAGE" &&
      run.stage === selectedStep &&
      runEventQueries[index]?.data === undefined
    );
  const transportConverging =
    terminalDrainPending ||
    mutationRefreshPending ||
    runsQuery.data === undefined ||
    artifactsQuery.data === undefined ||
    sourceQuery.data === undefined ||
    diagnosticsQuery.data === undefined ||
    (
      historicalArtifactsRequired &&
      allArtifactsQuery.data === undefined
    ) ||
    currentExecutionTasksFetching ||
    (currentApprovalRequired && currentApprovalQuery.isPending) ||
    executionEventsPending ||
    currentStageEventsPending ||
    selectedStageConformancePending ||
    (
      workItem.stage === "AWAITING_SIGNOFF" &&
      signoffPackageQuery.isPending
    );
  const currentObservationError =
    selectedWorkItemError ??
    runsQuery.error ??
    artifactsQuery.error ??
    sourceQuery.error ??
    diagnosticsQuery.error ??
    currentStageEventsError ??
    currentExecutionEventsError ??
    validationObservationError ??
    (
      workItem.stage === "EXECUTION" || workItem.stage === "AWAITING_ACCEPTANCE" || workItem.stage === "COMPLETE"
        ? tasksQuery.error ?? currentApprovalQuery.error ?? signedArtifactsQuery.error
        : null
    ) ??
    (historicalArtifactsRequired ? allArtifactsQuery.error : null) ??
    (
      workItem.stage === "AWAITING_SIGNOFF" && packageStaleOwner === null
        ? observedPackageError
        : null
    );
  const currentReviewSequence = currentReviewHistory.at(-1)?.sequence ?? null;
  const qaProofQuery = useQuery({
    queryKey: workbenchQueryKeys.qaProof(workItem.id,currentApproval?.id ?? null,currentReviewSequence),
    queryFn: () => {
      if (currentApproval == null || currentReviewSequence === null) throw new TypeError("Current review identity required");
      return api.listCandidateReviewEvents(workItem.id,currentApproval.id,currentReviewSequence);
    },
    enabled: workItem.stage === "AWAITING_ACCEPTANCE" && currentApproval != null && currentReviewSequence !== null,
    retry:false, refetchInterval: 2000,
  });
  const acceptanceDiagnostic = api.isOrderHttpRequestFailure(qaProofQuery.error) ? qaProofQuery.error.orderError : null;
  let currentRounds: ReturnType<typeof reconstructCandidateRounds> = new Map();
  let acceptanceCoherent = !transportConverging && semanticCoherence === "COHERENT" && !mutationConflict && !qaProofQuery.isFetching;
  if (currentApproval != null && currentReviewHistory.length > 0) {
    try { currentRounds = reconstructCandidateRounds(currentApproval,tasks,runs,allRunEvents,currentReviewHistory); }
    catch { if (acceptanceDiagnostic === null) acceptanceCoherent = false; }
  }
  const acceptanceInput = {
    current:workItem.stage === "AWAITING_ACCEPTANCE", coherent:acceptanceCoherent,
    mutationConflict, approval:currentApproval ?? null, history:currentReviewHistory,
    currentProof:qaProofQuery.isSuccess && !qaProofQuery.isFetching ? qaProofQuery.data : null,
    diagnostic:acceptanceDiagnostic, rounds:currentRounds,tasks,runs,runEvents:allRunEvents,
  };
  let acceptanceDecision: ReturnType<typeof deriveAcceptanceDecision> = {tag:"NONE"};
  try { acceptanceDecision = deriveAcceptanceDecision(acceptanceInput); } catch { /* incoherent proof cannot admit action */ }
  const currentAttention = deriveCurrentAttention({
    workItem,
    acceptanceDecision,
    coherence: transportConverging ? "CONVERGING" : semanticCoherence,
    mutationConflict,
    stageInteraction: currentStageInteraction,
    proposal: proposalDecision,
    recovery,
    currentness,
    executionOwner,
    automaticWorkActive: runs.some(
      (run) => run.role !== "STAGE" && runIsActive(run),
    ),
    ordinaryActionAvailable:
      workItem.status === "ACTIVE" &&
      !runs.some(runIsActive),
  });
  const railItems = deriveWorkflowRail(
    workItem,
    reachedStages,
    currentAttention,
    recovery,
    selectedStep,
  );
  const mutationsDisabled = currentAttention === "CONVERGING";
  const interactionMutationsDisabled =
    mutationsDisabled || currentAttention === "MUTATION_CONFLICT";
  const activeRunOwnsAuthoring = runs.some(runIsActive);
  const documentMutationsDisabled =
    interactionMutationsDisabled || activeRunOwnsAuthoring || approvalMembershipUnresolved;
  const authoringBlockedReason = activeRunOwnsAuthoring
    ? "Finish or cancel the active workflow attempt before editing or saving this document."
    : documentMutationsDisabled
      ? "Document authoring is unavailable until the current workflow state is reconciled."
      : undefined;
  const workflowMutationsDisabled =
    interactionMutationsDisabled ||
    (currentness.tag === "STALE" && !activeRunOwnsAuthoring) ||
    validationObservationError !== null;

  const resolvedMaterial = resolveWorkflowMaterial({
    workItem,
    selectedStep,
    reachedStages,
    runs,
    artifacts: inspectionArtifacts,
    currentStageRunId: currentStageRun?.id ?? null,
    currentStageRunActive: currentStageRun !== null && runIsActive(currentStageRun),
    currentAttention,
    stageInteraction: currentStageInteraction,
    executionOwner,
    pendingProposal,
    approvalPackageAvailable: signoffPackageQuery.data != null,
    tasks,
    selectedTaskId,
    selectedRunId,
    explicitSelection: explicitMaterial,
    dirtyDocument: dirty,
  });
  const material: WorkflowMaterial = resolvedMaterial.kind !== "APPROVAL_PACKAGE" ? resolvedMaterial :
    selectedApprovalUnresolved ? resolvedMaterial :
    selectedApproval !== null ? {
      kind: "APPROVAL_PACKAGE", approvalId: selectedApproval.id,
      ...(resolvedMaterial.approvalId === selectedApproval.id ? {
        artifactId: resolvedMaterial.artifactId, taskId: resolvedMaterial.taskId,
      } : {}),
    } : bindProspectiveApprovalSelection(resolvedMaterial, packageHash);
  const supersededProspective = material.kind === "APPROVAL_PACKAGE" &&
    (prospectiveApprovalIsSuperseded(material, packageHash) ||
      (material.approvalId === undefined && material.packageHash !== undefined &&
        workItem.stage !== "AWAITING_SIGNOFF"));
  useEffect(() => {
    if (selectedStep !== "AWAITING_SIGNOFF" || workItem.stage !== "AWAITING_SIGNOFF" ||
        material.kind !== "APPROVAL_PACKAGE" || material.approvalId !== undefined ||
        material.packageHash === undefined) return;
    setExplicitMaterial(previous => previous === null ||
      (previous.kind === "APPROVAL_PACKAGE" && previous.approvalId === undefined &&
        previous.packageHash === undefined) ? material : previous);
  }, [selectedStep, workItem.stage, material.kind, packageHash, explicitMaterial]);
  const supersededHash = supersededProspective && material.kind === "APPROVAL_PACKAGE"
    ? material.packageHash : undefined;
  const supersededPackage = supersededHash === undefined ? null :
    queryClient.getQueryData<SignoffPackage>(workbenchQueryKeys.observedSignoffPackage(workItem.id, supersededHash)) ?? null;
  const supersededArtifacts = supersededHash === undefined ? [] :
    queryClient.getQueryData<readonly ArtifactRef[]>(workbenchQueryKeys.signoffPackageArtifacts(workItem.id, supersededHash)) ?? [];
  const resolvedCurrentMaterial = resolveWorkflowMaterial({
    workItem,
    selectedStep: workItem.stage,
    reachedStages,
    runs,
    artifacts,
    currentStageRunId: currentStageRun?.id ?? null,
    currentStageRunActive: currentStageRun !== null && runIsActive(currentStageRun),
    currentAttention,
    stageInteraction: currentStageInteraction,
    executionOwner,
    pendingProposal,
    approvalPackageAvailable: signoffPackageQuery.data != null,
    tasks,
    selectedTaskId: null,
    selectedRunId: null,
    explicitSelection: null,
    dirtyDocument: false,
  });
  const canonicalCurrentMaterial: WorkflowMaterial =
    resolvedCurrentMaterial.kind === "APPROVAL_PACKAGE" && packageHash !== null
      ? {kind:"APPROVAL_PACKAGE",packageHash} : resolvedCurrentMaterial;
  const evidence =
    material.kind === "EVIDENCE" ? material.selection : null;
  const materialIdentity = workflowMaterialIdentity(material);
  const canonicalCurrentMaterialIdentity =
    workflowMaterialIdentity(canonicalCurrentMaterial);
  const materialStateForArtifact = (artifact: ArtifactRef) => {
    const owner = artifact.role;
    if (owner !== "R1" && owner !== "R2" && owner !== "DESIGN" && owner !== "PLAN" && owner !== "R3") return null;
    if (approvalMembershipUnresolved || artifactsQuery.data === undefined || runsQuery.data === undefined ||
      runs.some((run, index) => run.role === "STAGE" && run.stage === owner &&
        runEventQueries[index]?.data === undefined)) return null;
    const current = currentArtifactIds.has(artifact.id);
    const reach = reachStateForStage(workItem, reachedStages, owner);
    return deriveMaterialPresentationState(
      current,
      reach,
      materialCurrentnessForStage(currentness, owner),
      artifactHasCurrentStageConformance(artifact, runs, allRunEvents),
      signedArtifactIds.has(artifact.id) && reach !== "UNREACHED",
    );
  };
  const selectedStageMaterialState = selectedStageArtifact === null
    ? null : materialStateForArtifact(selectedStageArtifact);
  const selectedDocumentArtifact = material.kind === "STAGE_DOCUMENT"
    ? inspectionArtifacts.find((artifact) => artifact.id === material.artifactId) ?? null
    : null;
  const selectedDocumentMaterialState = selectedDocumentArtifact === null
    ? null : materialStateForArtifact(selectedDocumentArtifact);

  const currentStepSelectedForMaterial = selectedStep === workItem.stage;
  const explicitStageArtifactId =
    explicitMaterial?.kind === "STAGE_DOCUMENT"
      ? explicitMaterial.artifactId
      : null;
  const explicitStageArtifactStillCurrent =
    explicitStageArtifactId !== null &&
    inspectionArtifacts.some((artifact) => artifact.id === explicitStageArtifactId);

  useEffect(() => {
    if (
      explicitStageArtifactId === null ||
      explicitStageArtifactStillCurrent ||
      !currentStepSelectedForMaterial ||
      selectedStageArtifact === null
    ) {
      return;
    }
    setExplicitMaterial({
      kind: "STAGE_DOCUMENT",
      artifactId: selectedStageArtifact.id,
    });
  }, [
    explicitStageArtifactId,
    explicitStageArtifactStillCurrent,
    currentStepSelectedForMaterial,
    selectedStageArtifact?.id,
  ]);

  const currentStageEventUpdatedAt =
    currentStageRun === null
      ? 0
      : runs.reduce(
          (updatedAt, run, index) =>
            run.id === currentStageRun.id
              ? runEventQueries[index]?.dataUpdatedAt ?? updatedAt
              : updatedAt,
          0,
        );
  const currentTaskUpdatedAt =
    workItem.stage === "EXECUTION" || workItem.stage === "AWAITING_ACCEPTANCE" || workItem.stage === "COMPLETE"
      ? tasksQuery.dataUpdatedAt
      : 0;
  const currentSignoffUpdatedAt =
    workItem.stage === "AWAITING_SIGNOFF"
      ? signoffPackageQuery.dataUpdatedAt
      : 0;
  const observationVersion = [
    workItem.id,
    workItem.stage,
    workItem.status,
    workItem.outcome ?? "",
    workItem.sourceSha256,
    selectedWorkItemUpdatedAt,
    runsQuery.dataUpdatedAt,
    currentStageEventUpdatedAt,
    artifactsQuery.dataUpdatedAt,
    currentTaskUpdatedAt,
    sourceQuery.dataUpdatedAt,
    diagnosticsQuery.dataUpdatedAt,
    currentSignoffUpdatedAt,
  ].join(":");

  useEffect(() => {
    headingRef.current?.focus();
  }, [workItem.id]);

  useEffect(() => {
    if (
      mutationConflict &&
      !transportConverging &&
      currentObservationError === null &&
      mutationConflictObservation.current !== null &&
      mutationConflictWorkItemUpdatedAt.current !== null &&
      selectedWorkItemUpdatedAt !== mutationConflictWorkItemUpdatedAt.current &&
      mutationConflictObservation.current !== observationVersion
    ) {
      mutationConflictObservation.current = null;
      mutationConflictWorkItemUpdatedAt.current = null;
      setMutationConflict(false);
    }
  }, [
    currentObservationError,
    mutationConflict,
    observationVersion,
    selectedWorkItemUpdatedAt,
    transportConverging,
  ]);

  useEffect(() => {
    onContextSelectionChange(selectedStep, material);
  }, [
    materialIdentity,
    onContextSelectionChange,
    selectedStep,
  ]);

  useEffect(() => {
    if (
      material.kind !== "SOURCE_DOCUMENT" &&
      material.kind !== "STAGE_DOCUMENT" &&
      material.kind !== "SUPPORTING_DOCUMENT" &&
      selectedStep !== "AWAITING_SIGNOFF"
    ) {
      onContextDocumentChange(null, null);
    }
  }, [
    materialIdentity,
    onContextDocumentChange,
    selectedStep,
  ]);

  useEffect(() => {
    if (dirty) return;
    const priorStage = priorWorkItemStage.current;
    if (priorStage === workItem.stage) return;

    priorWorkItemStage.current = workItem.stage;
    if (selectedStep !== priorStage) return;

    setSelectedStep(workItem.stage);
    setExplicitMaterial(null);
    setReturnSelection(null);
  }, [
    dirty,
    selectedStep,
    workItem.stage,
  ]);

  const refreshWorkbenchMutation = async (acceptedEvent?: RunEvent): Promise<void> => {
    setMutationRefreshPending(true);
    if (acceptedEvent !== undefined) {
      const eventKey = workbenchQueryKeys.runEvents(acceptedEvent.runId);
      queryClient.setQueryData<readonly RunEvent[]>(eventKey, (current = []) => {
        const byId = new Map(
          [...current, acceptedEvent].map((event) => [event.id, event] as const),
        );
        return [...byId.values()].sort(
          (left, right) =>
            left.sequence - right.sequence ||
            left.id.localeCompare(right.id),
        );
      });
    }
    try {
      await invalidateWorkbenchMutation(queryClient, workItem.id);
    } finally {
      setMutationRefreshPending(false);
    }
  };
  const invalidate = async (): Promise<void> => {
    await refreshWorkbenchMutation();
  };

  const reportMutationError = (error: unknown): void => {
    if (!api.isCurrentStateConflict(error)) return;
    mutationConflictObservation.current = observationVersion;
    mutationConflictWorkItemUpdatedAt.current = selectedWorkItemUpdatedAt;
    setMutationConflict(true);
  };

  const titleMutation = useMutation({
    mutationFn: () => {
      if (documentMutationsDisabled) throw new TypeError("work item title authoring is not currently admitted");
      return api.updateWorkItemTitle(workItem.id, {
      expectedSourceSha256: workItem.sourceSha256,
      title: titleDraft.trim(),
      });
    },
    onSuccess: async (result) => {
      if (result.tag === "STALE") {
        setTitleError("The WorkItem source changed. Reload the current title before editing again.");
        await invalidate();
        return;
      }
      setTitleEditing(false);
      setTitleError(null);
      await invalidate();
    },
    onError: invalidate,
  });

  const archiveMutation = useMutation({
    mutationFn: () => {
      if (mutationsDisabled) throw new TypeError("workflow observation is converging");
      return api.setWorkItemArchived(workItem.id, {
        expectedArchived: workItem.archived,
        archived: !workItem.archived,
      });
    },
    onSuccess: async () => {
      setConfirmArchive(false);
      await invalidate();
      onBack();
    },
    onError: invalidate,
  });

  const commitSelection = (
    next: WorkspaceSelection,
    nextReturnSelection: WorkspaceSelection | null = null,
  ): void => {
    setSelectedStep(next.step);
    setExplicitMaterial(next.material);
    setReturnSelection(nextReturnSelection);
  };

  const requestSelection = (
    next: WorkspaceSelection,
    nextReturnSelection: WorkspaceSelection | null = null,
  ): void => {
    if (dirty) {
      setPendingSelection(next);
      setPendingReturnSelection(nextReturnSelection);
      return;
    }
    commitSelection(next, nextReturnSelection);
  };

  const start = useMutation({
    mutationFn: () => {
      if (mutationsDisabled) throw new TypeError("workflow observation is converging");
      return api.startInteractiveRun(workItem.id);
    },
    onSuccess: async (run) => {
      commitSelection({
        step: run.stage,
        material: { kind: "STAGE_RUN", runId: run.id },
      });
      queryClient.setQueryData<readonly Run[]>(
        workbenchQueryKeys.runs(workItem.id),
        (current) => [...(current ?? []).filter((item) => item.id !== run.id), run],
      );
      await invalidate();
    },
    onError: async (error) => {
      reportMutationError(error);
      await invalidate();
    },
  });

  const resumeCurrent = useMutation({
    mutationFn: () => {
      if (mutationsDisabled) {
        throw new TypeError("workflow observation is converging");
      }
      return api.resumeWorkItem(workItem.id);
    },
    onSuccess: async () => {
      await invalidate();
    },
    onError: async (error) => {
      reportMutationError(error);
      await invalidate();
    },
  });

  const reconcileAuthority = useMutation({
    mutationFn: async (): Promise<void> => {
      if (mutationsDisabled) {
        throw new TypeError("workflow observation is converging");
      }
      if (sourceAuthorityRequiresReconciliation) {
        await api.reconcileWorkItemSources();
        return;
      }
      if (packageStaleOwner !== null) {
        await api.reconcileWorkItemAuthority(workItem.id, {
          expectedOwner: packageStaleOwner,
        });
        return;
      }
      throw new TypeError("no stale authority owner is available for reconciliation");
    },
    onSuccess: async () => {
      await invalidate();
    },
    onError: async (error) => {
      reportMutationError(error);
      await invalidate();
    },
  });

  const setDirtyState = (value: boolean): void => {
    if (
      value &&
      explicitMaterial === null &&
      (
        material.kind === "SOURCE_DOCUMENT" ||
        material.kind === "STAGE_DOCUMENT" ||
        material.kind === "SUPPORTING_DOCUMENT"
      )
    ) {
      setExplicitMaterial(material);
    }
    setDirty(value);
    onDirtyChange(value);
  };

  const inspectWorkflowStep = (step: WorkItem["stage"]): void => {
    requestSelection({ step, material: null });
  };

  const focusReturnedControl = (name: string): void => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const target = Array.from(
          document.querySelectorAll<HTMLButtonElement>("button"),
        ).find((button) =>
          button.getAttribute("data-testid") === name ||
          button.getAttribute("aria-label") === name ||
          button.textContent?.trim() === name);
        target?.focus();
      });
    });
  };

  const openEvidence = (selection: EvidenceSelection): void => {
    const origin: WorkspaceSelection = { step: selectedStep, material };
    setReturnFocusName(
      selection.kind === "EVIDENCE"
        ? "Evidence: " + selection.relativePath
        : selection.label === "Lifecycle document exact bytes"
          ? "Inspect exact bytes"
          : "Open " + selection.label,
    );
    requestSelection(
      {
        step: selectedStep,
        material: { kind: "EVIDENCE", selection },
      },
      origin,
    );
  };

  const openArtifactEvidence = (artifactId: ArtifactRef["id"]): void => {
    openEvidence({
      kind: "ARTIFACT",
      artifactId,
      label: "Lifecycle document exact bytes",
    });
  };

  const openProposalReview = (selection: ProposalSelection): void => {
    setReturnFocusName("Review proposed document change");
    const ownerRun = runs.find((run) => run.id === selection.runId);
    const ownerStep = ownerRun?.stage ?? selectedStep;
    const origin: WorkspaceSelection = {
      step: ownerStep,
      material: { kind: "STAGE_RUN", runId: selection.runId },
    };
    requestSelection(
      {
        step: ownerStep,
        material: {
          kind: "PROPOSAL",
          runId: selection.runId,
          eventId: selection.eventId,
        },
      },
      origin,
    );
  };

  const openSupportingMaterial = (nextMaterial: WorkflowMaterial): void => {
    const origin: WorkspaceSelection = { step: selectedStep, material };
    requestSelection(
      { step: selectedStep, material: nextMaterial },
      origin,
    );
  };

  const returnFromTransient = (): void => {
    const origin = returnSelection;
    const focusName = returnFocusName;
    setReturnSelection(null);
    setReturnFocusName(null);
    if (origin) {
      commitSelection(origin);
    } else if (material.kind === "PROPOSAL") {
      commitSelection({
        step: selectedStep,
        material: { kind: "STAGE_RUN", runId: material.runId },
      });
    } else {
      setExplicitMaterial(null);
    }
    if (focusName) focusReturnedControl(focusName);
  };

  const currentStepSelected = selectedStep === workItem.stage;
  const canStart =
    preSignoff.has(workItem.stage) &&
    currentAttention === "ACTIONABLE";
  const canRetry =
    currentAttention !== "MUTATION_CONFLICT" &&
    recovery.tag === "RETRY_CURRENT_STAGE";
  const canResume =
    currentAttention !== "MUTATION_CONFLICT" &&
    recovery.tag === "RESUME_CURRENT_OWNER";
  const canReconcile =
    currentAttention !== "MUTATION_CONFLICT" &&
    recovery.tag === "RECONCILE_AUTHORITY" &&
    !runs.some(runIsActive);
  const summaryBlocker = sourceDiagnostics[0]
      ? {
          status: "error" as const,
          title: "Work request source needs attention",
          description: sourceDiagnostics[0].detail,
        }
      : sourceAuthorityChanged
        ? {
            status: "warning" as const,
            title: "Work request source changed",
            description:
              "Reconcile the current Work request before continuing this workflow.",
          }
        : currentAttention === "MUTATION_CONFLICT"
          ? {
              status: "error" as const,
              title: "Workflow state changed during the action",
              description:
                "Review the refreshed current workflow state before attempting another mutation.",
            }
          : start.error
        ? {
            status: "error" as const,
            title: "Could not start current workflow step",
            description: start.error instanceof Error
              ? start.error.message
              : String(start.error),
          }
        : resumeCurrent.error
          ? {
              status: "error" as const,
              title: "Could not resume current workflow owner",
              description: resumeCurrent.error instanceof Error
                ? resumeCurrent.error.message
                : String(resumeCurrent.error),
            }
          : reconcileAuthority.error
            ? {
                status: "error" as const,
                title: "Could not reconcile current authority",
                description: reconcileAuthority.error instanceof Error
                  ? reconcileAuthority.error.message
                  : String(reconcileAuthority.error),
              }
            : currentAttention === "BLOCKER"
            ? {
                status: "error" as const,
                title: workflow.label + " is blocked",
                description: currentStageEvents.findLast(event => event.event.tag === "STAGE_BLOCKED")?.event.tag === "STAGE_BLOCKED"
                  ? currentStageEvents.flatMap(event => event.event.tag === "STAGE_BLOCKED" ? [event.event.reason] : []).at(-1) ?? "Resolve the current canonical blocker before continuing."
                  : "Resolve the current canonical blocker before continuing.",
              }
            : currentAttention === "RECOVERY"
              ? {
                  status: "warning" as const,
                  title: workflow.label + " requires recovery",
                  description:
                    "Use the current governed recovery action before continuing.",
                }
              : currentness.tag === "STALE"
                ? {
                    status: "warning" as const,
                    title: "Approval authority is stale",
                    description:
                      "Return workflow ownership to " +
                      workflowPresentation(currentness.owner).label +
                      " before continuing.",
                  }
                : workItem.stage === "AWAITING_SIGNOFF" &&
                    signoffPackageQuery.isError
                  ? {
                    status: "error" as const,
                    title: "Approval package unavailable",
                    description: signoffPackageQuery.error instanceof Error
                      ? signoffPackageQuery.error.message
                      : String(signoffPackageQuery.error),
                  }
                : null;

  const inspectingCurrentPackage = currentStepSelected && material.kind === "APPROVAL_PACKAGE" &&
    material.approvalId === undefined && material.packageHash !== undefined &&
    material.packageHash === packageHash;
  const inspectedHistorical =
    !currentStepSelected ||
    (materialIdentity !== canonicalCurrentMaterialIdentity && !inspectingCurrentPackage);

  const currentOwnerAction =
    canRetry ? (
      <WorkbenchAction
        label={"Retry " + workflow.label}
        tone="primary"
        loading={start.isPending}
        disabled={mutationsDisabled || dirty || start.isPending}
        onClick={() => start.mutate()}
      />
    ) : canResume ? (
      <WorkbenchAction
        label="Resume resolved blocker"
        tone="primary"
        loading={resumeCurrent.isPending}
        disabled={mutationsDisabled || resumeCurrent.isPending}
        onClick={() => resumeCurrent.mutate()}
      />
    ) : canReconcile ? (
      <WorkbenchAction
        label={
          sourceAuthorityRequiresReconciliation
            ? "Reconcile source authority"
            : currentness.tag === "STALE"
              ? "Return to " + workflowPresentation(currentness.owner).label
              : "Reconcile authority"
        }
        tone="primary"
        loading={reconcileAuthority.isPending}
        disabled={mutationsDisabled || reconcileAuthority.isPending}
        onClick={() => reconcileAuthority.mutate()}
      />
    ) : canStart ? (
      <WorkbenchAction
        label={startLabelForStage(workItem.stage)}
        tone="primary"
        loading={start.isPending}
        disabled={mutationsDisabled || dirty || start.isPending}
        onClick={() => start.mutate()}
      />
    ) : null;

  const currentMaterialAction =
    titleEditing ? undefined : inspectedHistorical ? (
      <WorkbenchAction
        label={"Return to " + workflow.label}
        tone="primary"
        onClick={() => requestSelection({ step: workItem.stage, material: canonicalCurrentMaterial })}
      />
    ) : currentOwnerAction ?? undefined;

  const currentReviewNotice =
    summaryBlocker === null ? undefined : (
      <WorkbenchNotice
        tone={summaryBlocker.status === "error" ? "danger" : summaryBlocker.status}
        title={summaryBlocker.title}
        description={summaryBlocker.description}
      />
    );

  const currentRequestId = currentStageInteraction?.tag === "REQUIRED_INPUT" ? currentStageInteraction.requestEventId : null;
  const currentRequest = currentRequestId === null ? undefined :
    allRunEvents.find(event => event.id === currentRequestId &&
      event.runId === currentStageRun?.id && event.event.tag === "HUMAN_INPUT_REQUESTED");
  const currentInspectionReason = currentRequest?.event.tag === "HUMAN_INPUT_REQUESTED"
    ? currentRequest.event.question
    : currentAttention === "PROPOSAL_DECISION" ? "A document change requires your decision."
    : currentAttention === "PROPOSAL_ADOPTION" ? "The current document change is being applied."
    : currentAttention === "CONVERGING" ? "The current workflow state is being refreshed."
    : summaryBlocker?.description;
  const historicalReturn =
    inspectedHistorical && currentMaterialAction !== undefined
      ? <>{currentInspectionReason === undefined ? null : <span>{currentInspectionReason}</span>}{currentMaterialAction}</>
      : undefined;

  const currentInteractionAttention =
    !inspectedHistorical && summaryBlocker !== null ? (
      <WorkbenchAttention
        title={summaryBlocker.title}
        description={summaryBlocker.description}
        action={currentMaterialAction}
      />
    ) : !inspectedHistorical && currentMaterialAction != null ? (
      <WorkbenchAttention
        title={workflow.label + " is ready for your action"}
        action={currentMaterialAction}
      />
    ) : undefined;

  const semanticWorkItemKind = schemas.find(
    (schema) => schema.schemaId === workItem.schemaId,
  )?.kind;
  const workItemKindLabel = semanticWorkItemKind === undefined
    ? "Work item"
    : semanticWorkItemKind.charAt(0) + semanticWorkItemKind.slice(1).toLowerCase();

  const identity = (
    <WorkItemIdentityRow
      navigation={
        <Link href="/" isStandalone color="secondary" onClick={(event) => { event.preventDefault(); onBack(); }}>
          <span className="order-workitem-back"><WorkbenchIcon name="back" />Back to queue</span>
        </Link>
      }
      title={workItem.title}
      kind={workItemKindLabel}
      headingRef={headingRef}
      editing={
        titleEditing ? (
          <div className="order-workitem-title-edit">
            <TextInput label="Work item title" isLabelHidden size="sm" width="100%" value={titleDraft} hasAutoFocus onChange={setTitleDraft} />
            <WorkbenchAction label="Save title" tone="primary" loading={titleMutation.isPending} disabled={documentMutationsDisabled || titleDraft.trim().length === 0 || titleMutation.isPending} onClick={() => titleMutation.mutate()} />
            <WorkbenchAction label="Cancel title edit" disabled={titleMutation.isPending} onClick={() => { setTitleDraft(workItem.title); setTitleError(null); setTitleEditing(false); }} />
          </div>
        ) : undefined
      }
      detail={
        titleError || titleMutation.error ? (
          <span role="alert">
            {titleError ?? (titleMutation.error instanceof Error ? titleMutation.error.message : String(titleMutation.error))}
          </span>
        ) : undefined
      }
      utilities={
        <>
          {!titleEditing && workItem.stage !== "EXECUTION" && workItem.stage !== "AWAITING_ACCEPTANCE" && workItem.stage !== "COMPLETE" ? (
            <WorkbenchAction label="Edit title" tone="ghost" disabled={documentMutationsDisabled} onClick={() => { setTitleDraft(workItem.title); setTitleError(null); setTitleEditing(true); }} />
          ) : null}
          <WorkbenchAction
            label="Context"
            tone="ghost"
            icon={<WorkbenchIcon name="context" />}
            ariaExpanded={contextOpen}
            onClick={() => onContextOpenChange(!contextOpen)}
          />
          <WorkbenchAction
            label={workItem.archived ? "Restore" : "Archive"}
            tone="ghost"
            disabled={mutationsDisabled || workItem.stage === "EXECUTION" || workItem.stage === "AWAITING_ACCEPTANCE" || runs.some(runIsActive) || archiveMutation.isPending}
            onClick={() => setConfirmArchive(true)}
          />
        </>
      }
    />
  );

  const workflowRail = (
    <WorkflowRail items={railItems} onSelect={inspectWorkflowStep} />
  );

  const acceptanceMaterial=selectedStep==="AWAITING_ACCEPTANCE"
    ? material.kind==="ACCEPTANCE_REVIEW"?material:
      returnSelection?.step==="AWAITING_ACCEPTANCE"&&returnSelection.material?.kind==="ACCEPTANCE_REVIEW"
        ?returnSelection.material:null
    :null;
  const acceptanceInspection=(nextMaterial:WorkflowMaterial,focusId?:string):void=>{
    if(material.kind!=="ACCEPTANCE_REVIEW")return;
    if(focusId!==undefined)setReturnFocusName(focusId);
    // Observational inspection keeps this exact Review owner mounted, with no
    // second visible interaction and no discard/rebinding of its local form.
    commitSelection({step:"AWAITING_ACCEPTANCE",material:nextMaterial},{step:selectedStep,material});
  };
  const primary = (
    <div className="order-workitem-workspace" data-testid="work-item-workspace">
    <div
      key={selectedStep}
      className="order-mode-canvas"
      role="region"
      aria-label={selectedWorkflow.label + " workspace"}
      data-testid="workflow-step-workspace"
    >
      {acceptanceMaterial!==null?<Suspense fallback={<WorkbenchState kind="loading" title="Loading Acceptance…" />}>
          <AcceptanceWorkspace key={acceptanceDiscardVersion} workItem={workItem} material={acceptanceMaterial}
            active={material.kind==="ACCEPTANCE_REVIEW"} onDirtyChange={setDirtyState} approvals={qaApprovals}
            histories={allReviewEvents} historyPending={approvalsQuery.isPending || qaHistories.some(query=>query.isPending)}
            historyError={approvalsQuery.error ?? qaHistories.find(query=>query.isError)?.error ?? null}
            input={acceptanceInput} decision={acceptanceDecision} signedArtifacts={signedArtifacts}
            onSelectMaterial={next=>requestSelection({step:"AWAITING_ACCEPTANCE",material:next})}
            onReturnCurrent={()=>requestSelection({step:workItem.stage,material:null})}
            onOpenEvidence={(selection,focusId)=>acceptanceInspection({kind:"EVIDENCE",selection},focusId)}
            onOpenDocument={(artifactId,focusId)=>acceptanceInspection({kind:"SUPPORTING_DOCUMENT",artifactId},focusId)}
            onOpenCorrection={(taskId,runId)=>requestSelection({step:"EXECUTION",material:{kind:"EXECUTION_TASK",taskId,runId}},{step:selectedStep,material})}
            onMutationError={reportMutationError} />
        </Suspense>:null}
      {material.kind === "EVIDENCE" && selectedStep !== "EXECUTION" ? (
        <Suspense fallback={<WorkbenchState kind="loading" title="Loading evidence…" />}>
          {historicalReturn === undefined ? null : <div className="order-inline-actions">{historicalReturn}</div>}
          <EvidenceViewer
            selection={material.selection}
            onBack={returnFromTransient}
          />
        </Suspense>
      ) : material.kind === "UNREACHED" ? (
        <WorkbenchSurface material={<WorkbenchState kind="empty" title={selectedWorkflow.label + " has not been reached"} />} />
      ) : sharedPreSignoffStage ? (
        <Suspense fallback={<WorkbenchState kind="loading" title="Loading workflow step…" />}>
          <PreSignoffStageWorkspace
            workItem={workItem}
            stage={sharedPreSignoffStage}
            runs={runs}
            runEvents={allRunEvents}
            artifacts={inspectionArtifacts}
            material={material}
            materialState={selectedStageMaterialState}
            materialStateForArtifact={materialStateForArtifact}
            documentAttention={currentInteractionAttention}
            historicalReturn={historicalReturn}
            stateNotice={inspectedHistorical ? undefined : currentReviewNotice}
            stateAction={inspectedHistorical ? undefined : currentOwnerAction ?? undefined}
            currentRunId={currentStageRun?.id ?? null}
            currentInteraction={currentStageInteraction}
            currentAttention={currentAttention}
            focusedRequiredInputEventId={focusedRequiredInputEventId}
            mutationsDisabled={workflowMutationsDisabled}
            onRequiredInputFocused={setFocusedRequiredInputEventId}
            authoringMutationsDisabled={documentMutationsDisabled}
            authoringBlockedReason={authoringBlockedReason}
            onSelectMaterial={(nextMaterial) =>
              requestSelection({
                step: sharedPreSignoffStage,
                material: nextMaterial,
              })}
            onDirtyChange={setDirtyState}
            onOpenArtifactEvidence={openArtifactEvidence}
            onOpenEvidence={openEvidence}
            onOpenProposalReview={openProposalReview}
            onOpenSupportingMaterial={openSupportingMaterial}
            onReturnFromTransient={returnFromTransient}
            onContextDocumentChange={onContextDocumentChange}
            onMutationRefresh={refreshWorkbenchMutation}
            onMutationError={reportMutationError}
          />
        </Suspense>
      ) : selectedStep === "R3" ? (
        <Suspense fallback={<WorkbenchState kind="loading" title="Loading readiness review…" />}>
          <ReadinessWorkspace
            workItem={workItem}
            runs={runs}
            runEvents={allRunEvents}
            artifacts={inspectionArtifacts}
            currentLifecycleArtifacts={artifacts}
            material={material}
            materialState={selectedStageMaterialState}
            materialStateForArtifact={materialStateForArtifact}
            reviewNotice={currentReviewNotice}
            reviewAction={historicalReturn ?? currentMaterialAction}
            currentRunId={currentStageRun?.id ?? null}
            currentInteraction={currentStageInteraction}
            currentAttention={currentAttention}
            focusedRequiredInputEventId={focusedRequiredInputEventId}
            mutationsDisabled={workflowMutationsDisabled}
            onRequiredInputFocused={setFocusedRequiredInputEventId}
            onSelectMaterial={(nextMaterial) =>
              requestSelection({
                step: "R3",
                material: nextMaterial,
              })}
            onOpenArtifactEvidence={openArtifactEvidence}
            onOpenEvidence={openEvidence}
            onReturnFromTransient={returnFromTransient}
            onContextDocumentChange={onContextDocumentChange}
            onMutationRefresh={refreshWorkbenchMutation}
            onMutationError={reportMutationError}
          />
        </Suspense>
      ) : selectedStep === "AWAITING_SIGNOFF" ? (
        <Suspense fallback={<WorkbenchState kind="loading" title="Loading approval package…" />}>
          <SignoffReview
            key={material.kind === "APPROVAL_PACKAGE" ? material.approvalId ?? material.packageHash ?? "unresolved" : "unresolved"}
            workItem={workItem}
            packageSuperseded={supersededProspective}
            reviewNotice={currentReviewNotice}
            reviewAction={historicalReturn ?? currentMaterialAction}
            packageValue={supersededProspective ? supersededPackage : selectedApproval === null && workItem.stage === "AWAITING_SIGNOFF" ? signoffPackageQuery.data ?? null : null}
            packageFetching={selectedApproval === null && signoffPackageQuery.isFetching}
            packageError={selectedApproval === null ? signoffPackageQuery.error : null}
            packageStale={selectedApproval === null && packageStaleOwner !== null}
            selectedApproval={selectedApproval}
            approvals={approvalsQuery.data ?? []}
            selection={material.kind === "APPROVAL_PACKAGE" ? material : {kind:"APPROVAL_PACKAGE"}}
            onSelectionChange={(next) => requestSelection({step:"AWAITING_SIGNOFF",material:next})}
            materialStateForArtifact={(artifact) => supersededProspective || (selectedApproval !== null && selectedApproval.id !== currentApproval?.id)
              ? { tag: "HISTORICAL" } : materialStateForArtifact(artifact)}
            artifacts={supersededProspective ? supersededArtifacts : selectedApproval !== null ? selectedApprovalArtifactsQuery.data ?? [] : prospectiveArtifactsQuery.data ?? []}
            artifactsPending={approvalsQuery.isPending || (currentApprovalRequired && currentApprovalQuery.isPending) || (selectedApproval !== null
              ? selectedApprovalArtifactsQuery.isPending || selectedApprovalArtifactsQuery.isFetching
              : packageHash !== null && (prospectiveArtifactsQuery.isPending || prospectiveArtifactsQuery.isFetching))}
            artifactsError={approvalsQuery.error ?? (currentApprovalRequired ? currentApprovalQuery.error : null) ?? (selectedApprovalUnresolved
              ? new TypeError("Selected Approval is unavailable")
              : selectedApproval !== null ? selectedApprovalArtifactsQuery.error : packageStaleOwner !== null ? null : prospectiveArtifactsQuery.error)}
            tasks={selectedApproval === null ? [] : tasks.filter(task => task.approvalId === selectedApproval.id)}
            tasksPending={tasksQuery.isPending}
            tasksError={tasksQuery.error}
            mutationsDisabled={workflowMutationsDisabled}
            onOpenArtifactEvidence={openArtifactEvidence}
            onContextDocumentChange={onContextDocumentChange}
            onMutationError={reportMutationError}
          />
        </Suspense>
      ) : selectedStep === "EXECUTION" ? (
        <Suspense fallback={<WorkbenchState kind="loading" title="Loading implementation…" />}>
          <ExecutionWorkspace
            workItem={workItem}
            material={material}
            tasks={workItem.stage === "EXECUTION" ? currentExecutionTasks : tasks}
            runs={runs}
            runEvents={allRunEvents}
            artifacts={allArtifacts}
            statePending={
              runsQuery.isPending ||
              tasksQuery.isPending ||
              (currentApprovalRequired && currentApprovalQuery.isPending) ||
              allArtifactsQuery.isPending || executionObservationPending
            }
            stateError={
              runsQuery.error ??
              tasksQuery.error ??
              (currentApprovalRequired ? currentApprovalQuery.error : null) ??
              allArtifactsQuery.error ??
              currentExecutionEventsError ??
              validationObservationError
            }
            executionOwner={executionOwner}
            validationBoundary={validationBoundary}
            mutationsDisabled={workflowMutationsDisabled}
            onSelectMaterial={(nextMaterial) =>
              requestSelection({
                step: "EXECUTION",
                material: nextMaterial,
              })}
            onOpenEvidence={openEvidence}
            onReturnFromEvidence={returnFromTransient}
            onReturnToAcceptance={returnSelection?.step==="AWAITING_ACCEPTANCE"?returnFromTransient:undefined}
            reviewEvents={allReviewEvents}
            onOpenFinding={entry=>requestSelection({step:"AWAITING_ACCEPTANCE",material:{kind:"ACCEPTANCE_REVIEW",approvalId:entry.approvalId,findingId:entry.id}},{step:selectedStep,material})}
            onMutationError={reportMutationError}
          />
        </Suspense>
      ) : selectedStep === "AWAITING_ACCEPTANCE" && material.kind === "ACCEPTANCE_REVIEW" ? null
        : selectedStep === "AWAITING_ACCEPTANCE" && material.kind === "SUPPORTING_DOCUMENT" ? (
        <Suspense fallback={<WorkbenchState kind="loading" title="Loading signed document…"/>}>
          <WorkbenchAction label="Back to Acceptance" onClick={returnFromTransient}/>
          {inspectionArtifacts.find(artifact=>artifact.id===material.artifactId)===undefined
            ? <WorkbenchState kind="error" title="Exact signed document unavailable"/>
            : <LifecycleDocumentMaterial workItem={workItem} artifactId={material.artifactId}
                historicalArtifact={inspectionArtifacts.find(artifact=>artifact.id===material.artifactId)}
                materialState={{tag:"SIGNED_LOCKED"}} readOnly onDirtyChange={()=>{}}
                onOpenArtifactEvidence={openArtifactEvidence} onContextDocumentChange={onContextDocumentChange}/>}
        </Suspense>
      ) : selectedStep === "COMPLETE" && material.kind !== "EVIDENCE" ? (
        <Suspense fallback={<WorkbenchState kind="loading" title="Loading final outcome…" />}>
          <TerminalResult
            workItem={workItem}
            onOpenEvidence={openEvidence}
            onCreateRemediation={onCreateRemediation}
          />
        </Suspense>
      ) : material.kind === "SOURCE_DOCUMENT" || material.kind === "STAGE_DOCUMENT" ? (
        <div className="order-document-inspection">
          {historicalReturn === undefined ? currentInteractionAttention : (
            <div className="order-review-navigation">{historicalReturn}</div>
          )}
          <Suspense fallback={<WorkbenchState kind="loading" title="Loading document…" />}>
            {material.kind === "SOURCE_DOCUMENT" ? (
              <SourceDocumentMaterial
                workItem={workItem}
                authoringLocked={activeRunOwnsAuthoring}
                mutationsDisabled={documentMutationsDisabled}
                authoringBlockedReason={authoringBlockedReason}
                onDirtyChange={setDirtyState}
                onContextDocumentChange={onContextDocumentChange}
                onMutationError={reportMutationError}
              />
            ) : (
              <LifecycleDocumentMaterial
                workItem={workItem}
                artifactId={material.artifactId}
                materialState={selectedDocumentMaterialState}
                historicalArtifact={selectedDocumentMaterialState?.tag === "HISTORICAL" || selectedDocumentMaterialState?.tag === "SIGNED_LOCKED" ? selectedDocumentArtifact ?? undefined : undefined}
                mutationsDisabled={documentMutationsDisabled}
                authoringBlockedReason={authoringBlockedReason}
                onDirtyChange={setDirtyState}
                onOpenArtifactEvidence={openArtifactEvidence}
                onContextDocumentChange={onContextDocumentChange}
                onMutationError={reportMutationError}
              />
            )}
          </Suspense>
        </div>
      ) : (
        <WorkbenchSurface
          attention={currentInteractionAttention}
          material={
            <>
              {historicalReturn === undefined ? null : (
                <div className="order-inline-actions">{historicalReturn}</div>
              )}
              <Suspense fallback={<WorkbenchState kind="loading" title="Loading workspace…" />}>
              {material.kind === "STEP_STATE" ? (
                <WorkbenchEmptyState
                  compact
                  title={
                    selectedStepState === "CURRENT" && canStart
                      ? selectedWorkflow.label + " is ready to start"
                      : "No current material for " + selectedWorkflow.label
                  }
                  description={
                    selectedStepState === "CURRENT" && canStart
                      ? "Use the current workflow action to begin this step."
                      : "This reached workflow step has no current canonical material to inspect."
                  }
                />
              ) : null}
              </Suspense>
            </>
          }
        />
      )}
    </div>
    </div>
  );

  return (
    <>
      <WorkbenchWorkItemShell
        identity={identity}
        workflowRail={workflowRail}
        primary={primary}
        context={{
          open: contextOpen,
          onOpenChange: onContextOpenChange,
          content: contextContent,
        }}
      />

      <WorkbenchConfirmation
        kind="safety"
        open={confirmArchive}
        onOpenChange={setConfirmArchive}
        title={workItem.archived ? "Restore work item?" : "Archive work item?"}
        description={<>
          <strong>{workItem.title}</strong>
          <p>{workItem.archived
            ? "Restore this WorkItem to the active queue. Its lifecycle and history are unchanged."
            : "Archive this WorkItem from the active queue. Its source, lifecycle documents, Runs, evidence, approvals and history remain intact."}</p>
        </>}
        confirmLabel={workItem.archived ? "Restore work item" : "Archive work item"}
        pending={archiveMutation.isPending}
        onConfirm={() => {
          if (!mutationsDisabled) archiveMutation.mutate();
        }}
      />

      {archiveMutation.error ? (
        <WorkbenchNotice
          tone="danger"
          title="Work item update failed"
          description={archiveMutation.error instanceof Error ? archiveMutation.error.message : String(archiveMutation.error)}
        />
      ) : null}

      <WorkbenchConfirmation
        kind="destructive"
        open={pendingSelection !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingSelection(null);
            setPendingReturnSelection(null);
          }
        }}
        title={acceptanceMaterial!==null?"Discard unsaved review form?":"Discard unsaved Markdown?"}
        description={acceptanceMaterial!==null?"Changing workflow step or material would discard the current unsaved review form.":"Changing workflow step or material would discard the current unsaved Markdown buffer."}
        confirmLabel="Discard unsaved changes"
        pending={false}
        onConfirm={() => {
          const next = pendingSelection;
          const nextReturn = pendingReturnSelection;
          setPendingSelection(null);
          setPendingReturnSelection(null);
          setDirtyState(false);
          if(acceptanceMaterial!==null)setAcceptanceDiscardVersion(value=>value+1);
          if (next) commitSelection(next, nextReturn);
        }}
      />
    </>
  );
};
