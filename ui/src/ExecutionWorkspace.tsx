import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MetadataList, MetadataListItem } from "@astryxdesign/core/MetadataList";

import type { ArtifactRef, ExecutionTask, Run, RunEvent, ValidationStage, WorkItem } from "../../src/core/contracts.ts";
import type { ExecutionOwner, ValidationBoundary } from "../../src/core/lifecycle.ts";
import * as api from "./http.ts";
import { EvidenceViewer } from "./EvidenceViewer.tsx";
import { RunEventTimeline } from "./RunEventTimeline.tsx";
import { invalidateWorkbenchMutation, workbenchQueryKeys } from "./query-keys.ts";
import {
  agentActivityRunEvents,
  runEventPresentation,
  runIsActive,
  runRoleLabel,
  runStatusLabel,
  lifecycleArtifactLabel,
  type EvidenceSelection,
  type WorkflowMaterial,
} from "./workbench-presentation.ts";
import { WorkflowStepIndex, WorkflowStepSummary, type WorkflowStepIndexGroup } from "./WorkflowStepFrame.tsx";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchDisclosure } from "./primitives/WorkbenchDisclosure.tsx";
import { WorkbenchMasterDetail } from "./primitives/WorkbenchMasterDetail.tsx";
import { WorkbenchNotice } from "./primitives/WorkbenchNotice.tsx";
import { WorkbenchResourceRow } from "./primitives/WorkbenchResourceRow.tsx";
import { WorkbenchSectionHeader } from "./primitives/WorkbenchSectionHeader.tsx";
import { WorkbenchState } from "./primitives/WorkbenchState.tsx";
import { WorkbenchStatus } from "./primitives/WorkbenchStatus.tsx";
import { WorkbenchSurface } from "./primitives/WorkbenchSurface.tsx";
import { WorkbenchTable } from "./primitives/WorkbenchTable.tsx";
import { WorkbenchTimeline } from "./primitives/WorkbenchTimeline.tsx";

const validationStages: readonly ValidationStage[] = ["V0","V1","V2","V3","V4","V5","V6","V7"];

const validationBoundaryTone = (
  boundary: ValidationBoundary | null,
): "danger" | "success" | "neutral" =>
  boundary?.tag === "FAILED_AT"
    ? "danger"
    : boundary?.tag === "COMPLETE" || boundary?.tag === "PASSED_THROUGH"
      ? "success"
      : "neutral";

const validationBoundaryLabel = (
  boundary: ValidationBoundary | null,
  scope: "Current" | "Recorded",
): string =>
  boundary === null
    ? scope + " boundary: updating"
    : boundary.tag === "FAILED_AT"
      ? scope + " boundary: failed at " + boundary.stage
    : boundary.tag === "PASSED_THROUGH"
        ? scope + " boundary: passed through " + boundary.stage
        : boundary.tag === "COMPLETE"
          ? scope + " boundary: complete"
          : scope + " boundary: none";

const validationBoundaryStatus = (
  boundary: ValidationBoundary | null,
  scope: "Current" | "Recorded",
) => (
  <WorkbenchStatus
    tone={validationBoundaryTone(boundary)}
    label={validationBoundaryLabel(boundary, scope)}
  />
);
const taskTone = (task: ExecutionTask): "danger" | "warning" | "success" | "neutral" =>
  task.state === "BLOCKED" ? "danger" :
  task.state === "CANDIDATE_DONE" || task.state === "ALREADY_SATISFIED" ? "success" :
  task.state === "TODO" ? "warning" : "neutral";
const taskVariant = (task: ExecutionTask): "error" | "warning" | "success" | "neutral" =>
  task.state === "BLOCKED" ? "error" :
  task.state === "CANDIDATE_DONE" || task.state === "ALREADY_SATISFIED" ? "success" :
  task.state === "TODO" ? "warning" : "neutral";
const runTone = (run: Run): "danger" | "warning" | "success" | "info" | "neutral" =>
  run.status === "FAILED" || run.status === "BLOCKED" ? "danger" :
  run.status === "WAITING_FOR_INPUT" ? "warning" :
  run.status === "COMPLETED" ? "success" :
  run.status === "RUNNING" ? "info" : "neutral";
const runVariant = (run: Run): "error" | "warning" | "success" | "neutral" =>
  run.status === "FAILED" || run.status === "BLOCKED" ? "error" :
  run.status === "WAITING_FOR_INPUT" ? "warning" :
  run.status === "COMPLETED" ? "success" : "neutral";
const taskStateLabel = (task: ExecutionTask): string => task.state.replaceAll("_"," ").toLowerCase();
const latestValidationEvent = (events: readonly RunEvent[], stage: ValidationStage): RunEvent | null =>
  events.findLast((event) => (event.event.tag === "VALIDATION_PASSED" || event.event.tag === "VALIDATION_FAILED") && event.event.stage === stage) ?? null;

const validationRows = (
  events: readonly RunEvent[],
  stages: readonly ValidationStage[],
) => stages.map((stage) => {
  const event = latestValidationEvent(events, stage);
  const passed = event?.event.tag === "VALIDATION_PASSED";
  const failed = event?.event.tag === "VALIDATION_FAILED";
  return {
    id: stage,
    testId: "validation-stage-" + stage,
    cells: {
      stage: <code>{stage}</code>,
      state: (
        <WorkbenchStatus
          tone={passed ? "success" : failed ? "danger" : "neutral"}
          label={passed ? "Passed" : failed ? "Failed" : "Not recorded"}
        />
      ),
      result:
        failed && event.event.tag === "VALIDATION_FAILED"
          ? event.event.summary
          : passed
            ? "Validation passed."
            : "—",
    },
  };
});

const ValidationMatrix = ({
  events,
  active,
  boundary,
  boundaryScope,
}: Readonly<{
  events: readonly RunEvent[];
  active: boolean;
  boundary: ValidationBoundary | null;
  boundaryScope: "Current" | "Recorded";
}>) => {
  const recordedStages = validationStages.filter(
    (stage) => latestValidationEvent(events, stage) !== null,
  );

  if (recordedStages.length === 0) {
    return (
      <section data-testid="validation-matrix">
        <WorkbenchSectionHeader
          title="Validation"
          action={validationBoundaryStatus(boundary, boundaryScope)}
        />
        <WorkbenchState
          kind={active ? "pending" : "empty"}
          title={active ? "Validation in progress" : "Validation not started"}
          description={
            active
              ? "Recorded validation stages will appear while this implementation attempt advances."
              : "No durable validation evidence has been recorded for this implementation attempt."
          }
        />
      </section>
    );
  }

  return (
    <section data-testid="validation-matrix">
      <WorkbenchSectionHeader
        title="Validation"
        action={validationBoundaryStatus(boundary, boundaryScope)}
      />
      <WorkbenchTable
        label="Recorded validation"
        columns={[
          { key: "stage", label: "Stage" },
          { key: "state", label: "State" },
          { key: "result", label: "Result" },
        ]}
        rows={validationRows(events, recordedStages)}
      />
      {recordedStages.length < validationStages.length ? (
        <WorkbenchDisclosure
          label="Complete validation matrix"
          content={
            <WorkbenchTable
              label="Complete validation matrix"
              columns={[
                { key: "stage", label: "Stage" },
                { key: "state", label: "State" },
                { key: "result", label: "Result" },
              ]}
              rows={validationRows(events, validationStages)}
            />
          }
        />
      ) : null}
    </section>
  );
};

export const ExecutionWorkspace = ({ workItem, material, tasks, runs, artifacts, statePending, stateError, executionOwner, validationBoundary, mutationsDisabled = false, onSelectMaterial, onOpenEvidence, onReturnFromEvidence, onMutationError }: Readonly<{
  workItem: WorkItem;
  material: WorkflowMaterial;
  tasks: readonly ExecutionTask[];
  runs: readonly Run[];
  artifacts: readonly ArtifactRef[];
  statePending: boolean;
  stateError: unknown;
  executionOwner: ExecutionOwner;
  validationBoundary: ValidationBoundary | null;
  mutationsDisabled?: boolean;
  onSelectMaterial: (material: WorkflowMaterial) => void;
  onOpenEvidence: (selection: EvidenceSelection) => void;
  onReturnFromEvidence: () => void;
  onMutationError?: (error: unknown) => void;
}>) => {
  const queryClient = useQueryClient();
  const currentOwnerTask = executionOwner.tag === "NONE"
    ? null
    : tasks.find((task) => task.id === executionOwner.taskId) ?? null;
  const currentOwnerRun = currentOwnerTask === null
    ? null
    : runs.find((run) =>
        run.executionTaskId === currentOwnerTask.id &&
        runIsActive(run)) ?? null;
  const materialTaskId = material.kind === "EXECUTION_TASK" ? material.taskId : null;
  const selectedTask = tasks.find((task) => task.id === materialTaskId) ?? tasks.find((task) => task.state === "RUNNING" || task.state === "BLOCKED") ?? tasks[0] ?? null;
  const taskRuns = selectedTask ? runs.filter((run) => run.executionTaskId === selectedTask.id) : [];
  const materialRunId = material.kind === "EXECUTION_TASK" ? material.runId : null;
  const selectedRun = taskRuns.find((run) => run.id === materialRunId) ?? taskRuns.find(runIsActive) ?? taskRuns.at(-1) ?? null;

  useEffect(() => {
    if (!selectedTask || material.kind === "EVIDENCE") return;
    const next: WorkflowMaterial = { kind:"EXECUTION_TASK", taskId:selectedTask.id, runId:selectedRun?.id ?? null };
    if (material.kind !== "EXECUTION_TASK" || material.taskId !== next.taskId || material.runId !== next.runId) onSelectMaterial(next);
  }, [material,onSelectMaterial,selectedRun,selectedTask]);

  const eventKey=workbenchQueryKeys.runEvents(selectedRun?.id ?? null);
  const eventsQuery=useQuery({
    queryKey:eventKey,
    queryFn:async()=>{if(!selectedRun)return[];const current=queryClient.getQueryData<readonly RunEvent[]>(eventKey)??[];const after=current.at(-1)?.sequence??0;const next=await api.listRunEvents(selectedRun.id,after);return after===0?next:[...current,...next];},
    enabled:selectedRun!==null,
    refetchInterval:selectedRun&&runIsActive(selectedRun)?1000:false,
  });
  const events=eventsQuery.data??[];
  const activityEvents=agentActivityRunEvents(events);
  const invalidate=():Promise<void>=>invalidateWorkbenchMutation(queryClient,workItem.id);
  const reportError=async(error:unknown):Promise<void>=>{onMutationError?.(error);await invalidate();};
  const start=useMutation({
    mutationFn:()=>{
      if(!currentOwnerTask)throw new TypeError("current execution owner has no task");
      return api.startExecutionTask(workItem.id,currentOwnerTask.id);
    },
    onSuccess:invalidate,
    onError:reportError,
  });
  const cancel=useMutation({
    mutationFn:()=>{
      if(!currentOwnerRun)throw new TypeError("current implementation owner has no active attempt");
      return api.cancelRun(currentOwnerRun.id);
    },
    onSuccess:invalidate,
    onError:reportError,
  });
  const resume=useMutation({
    mutationFn:()=>api.resumeWorkItem(workItem.id),
    onSuccess:invalidate,
    onError:reportError,
  });

  const canRunNext=
    workItem.stage==="EXECUTION"&&
    workItem.status==="ACTIVE"&&
    executionOwner.tag==="CURRENT_TASK"&&
    currentOwnerTask?.state==="TODO"&&
    currentOwnerRun===null;
  const canResume=
    workItem.stage==="EXECUTION"&&
    workItem.status==="BLOCKED"&&
    executionOwner.tag==="BLOCKED_TASK";
  const currentAction=currentOwnerRun?
    <WorkbenchAction label="Cancel current implementation attempt" tone="destructive" loading={cancel.isPending} disabled={mutationsDisabled || cancel.isPending} onClick={()=>cancel.mutate()}/>:
    canResume?<WorkbenchAction label="Resume resolved blocker" tone="primary" loading={resume.isPending} disabled={mutationsDisabled || resume.isPending} onClick={()=>resume.mutate()}/>:
    canRunNext?<WorkbenchAction label="Start current task" tone="primary" loading={start.isPending} disabled={mutationsDisabled || start.isPending} onClick={()=>start.mutate()}/>:undefined;
  const mutationError=start.error??cancel.error??resume.error;
  const summaryBlocker=executionOwner.tag==="BLOCKED_TASK"?
    {status:"error" as const,title:"Implementation task is blocked",description:"Resolve the recorded blocker before resuming this approved task."}:
    mutationError?{status:"error" as const,title:"Implementation action failed",description:mutationError instanceof Error?mutationError.message:String(mutationError)}:null;

  const attemptGroups:WorkflowStepIndexGroup[]=selectedTask&&taskRuns.length>0?[{
    id:"attempts",
    label:"Attempts",
    items:taskRuns.map((run)=>({
      id:run.id,
      label:runRoleLabel(run.role)+" · Attempt "+run.attempt,
      description:new Date(run.startedAt).toLocaleString(),
      statusLabel:runStatusLabel(run.status),
      statusVariant:runVariant(run),
      selected:run.id===selectedRun?.id,
      onSelect:()=>onSelectMaterial({kind:"EXECUTION_TASK",taskId:selectedTask.id,runId:run.id}),
    })),
  }]:[];

  const summary=<WorkflowStepSummary
    label="Implementation" purpose="Execute and verify the approved change"
    stateLabel={workItem.stage==="EXECUTION"?"Current":"Reached"} stateVariant={workItem.stage==="EXECUTION"?"info":"neutral"}
    statusLabel={currentOwnerTask?taskStateLabel(currentOwnerTask):workItem.status==="COMPLETE"?"Complete":workItem.status.toLowerCase()}
    statusVariant={currentOwnerTask?taskVariant(currentOwnerTask):workItem.status==="BLOCKED"?"error":workItem.status==="COMPLETE"?"success":"neutral"}
    blocker={summaryBlocker} action={currentAction}
  />;

  const master=tasks.length>0?<WorkbenchTable
    label="Approved tasks"
    selection="single"
    columns={[
      {key:"task",label:"Approved task"},
      {key:"state",label:"State"},
    ]}
    rows={tasks.map((task)=>({
      id:task.id,
      selected:task.id===selectedTask?.id,
      onSelect:()=>onSelectMaterial({
        kind:"EXECUTION_TASK",
        taskId:task.id,
        runId:runs.findLast((run)=>run.executionTaskId===task.id)?.id??null,
      }),
      cells:{
        task:<strong>{task.objective}</strong>,
        state:<WorkbenchStatus tone={taskTone(task)} label={taskStateLabel(task)}/>,
      },
    }))}
  />:<WorkbenchState kind="empty" title="No approved tasks"/>;
  const detail=stateError?<WorkbenchState kind="error" title="Implementation state unavailable" description={stateError instanceof Error?stateError.message:String(stateError)}/>:
    statePending?<WorkbenchState kind="loading" title="Loading implementation state…"/>:
    selectedTask?<section className="order-execution-task-material" data-testid="execution-task-detail">
      <WorkbenchSectionHeader title={selectedTask.objective} description="Approved task" action={<WorkbenchStatus tone={taskTone(selectedTask)} label={taskStateLabel(selectedTask)}/>} />
      <MetadataList columns="multi">
        <MetadataListItem label="Scope">{selectedTask.scope.join(", ")||"None"}</MetadataListItem>
      </MetadataList>
      {attemptGroups.length>0?<WorkflowStepIndex groups={attemptGroups} label="Attempts"/>:null}
      {selectedRun ? (
        <div data-testid="selected-run-header">
          <WorkbenchSectionHeader
            title={runRoleLabel(selectedRun.role)+" · Attempt "+selectedRun.attempt}
            action={<WorkbenchStatus tone={runTone(selectedRun)} label={runStatusLabel(selectedRun.status)}/>}
          />
        </div>
      ) : <WorkbenchState kind="empty" title="No attempts yet"/>}
      <WorkbenchDisclosure label="Technical details" content={<dl>
        <div><dt>Task id</dt><dd><code>{selectedTask.id}</code></dd></div>
        <div><dt>Approval id</dt><dd><code>{selectedTask.approvalId}</code></dd></div>
        <div><dt>Plan task id</dt><dd><code>{selectedTask.planTaskId}</code></dd></div>
        <div><dt>Gates</dt><dd>{selectedTask.gateIds.join(", ") || "None"}</dd></div>
        <div><dt>Depends on</dt><dd>{selectedTask.dependsOn.join(", ") || "None"}</dd></div>
        <div><dt>Change surface</dt><dd>{selectedTask.changeSurface.join(", ") || "None"}</dd></div>
        {selectedRun ? <>
          <div><dt>Run id</dt><dd><code>{selectedRun.id}</code></dd></div>
          <div><dt>Baseline</dt><dd><code>{selectedRun.baselineCommit}</code></dd></div>
          <div><dt>Context</dt><dd><code>{selectedRun.contextHash}</code></dd></div>
          <div><dt>Provider session</dt><dd><code>{selectedRun.providerSessionId??"—"}</code></dd></div>
          <div><dt>Terminal classification</dt><dd><code>{selectedRun.terminalClassification??"—"}</code></dd></div>
        </> : null}
      </dl>}/>
      {activityEvents.length > 0 ? (
        <WorkbenchTimeline
          label="Agent activity"
          items={activityEvents.map((event) => {
            const presentation = runEventPresentation(event);
            return {
              id: event.id,
              heading: <strong>{presentation.detail}</strong>,
              meta: <time>{new Date(event.occurredAt).toLocaleString()}</time>,
              body: event.event.tag === "AGENT_ACTIVITY_RECORDED" && event.event.resource
                ? <code>{event.event.resource}</code>
                : undefined,
            };
          })}
        />
      ) : selectedRun !== null && runIsActive(selectedRun) ? (
        <WorkbenchState kind="pending" title="Agent activity" description="Waiting for bounded operational activity…" />
      ) : null}
      <ValidationMatrix
        events={events}
        active={selectedRun !== null && runIsActive(selectedRun)}
        boundary={
          currentOwnerTask?.id === selectedTask.id
            ? validationBoundary
            : selectedTask.state === "CANDIDATE_DONE" || selectedTask.state === "ALREADY_SATISFIED"
              ? { tag: "COMPLETE" }
              : { tag: "NONE" }
        }
        boundaryScope={currentOwnerTask?.id === selectedTask.id ? "Current" : "Recorded"}
      />
      {selectedRun===null?<WorkbenchState kind="empty" title="No persisted attempt events"/>:
       eventsQuery.isPending?<WorkbenchState kind="loading" title="Loading attempt timeline…"/>:
       eventsQuery.isError?<WorkbenchState kind="error" title="Attempt timeline unavailable" description={eventsQuery.error instanceof Error?eventsQuery.error.message:String(eventsQuery.error)}/>:
       events.length>0?<RunEventTimeline run={selectedRun} events={events} onOpenEvidence={onOpenEvidence}/>:<WorkbenchState kind="empty" title="No persisted attempt events"/>}
      <WorkbenchSectionHeader title="Implementation material"/>
      <div className="order-resource-list">{artifacts.map((artifact)=>{
        const label=lifecycleArtifactLabel(artifact.role);
        return <WorkbenchResourceRow key={artifact.id} label={label} detail="Read-only governed implementation material" actionLabel={"Open "+label} onOpen={()=>onOpenEvidence({kind:"ARTIFACT",artifactId:artifact.id,label:label+": "+artifact.repositoryPath})}/>;
      })}</div>
    </section>:<WorkbenchState kind="empty" title="No implementation tasks materialized"/>;

  const detailSurface=material.kind==="EVIDENCE"&&stateError===null&&!statePending
    ?<EvidenceViewer selection={material.selection} onBack={onReturnFromEvidence}/>
    :<WorkbenchSurface attention={summary} material={detail}/>;

  return (
    <div data-testid="execution-workspace">
      <WorkbenchMasterDetail
        master={master}
        detail={detailSurface}
        masterLabel="Approved tasks"
      />
    </div>
  );
};
