import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MetadataList, MetadataListItem } from "@astryxdesign/core/MetadataList";

import type { ExecutionTask, Run, RunEvent, ValidationStage, WorkItem } from "../../src/core/contracts.ts";
import { deriveExecutionOwner } from "../../src/core/lifecycle.ts";
import * as api from "./http.ts";
import { EvidenceViewer } from "./EvidenceViewer.tsx";
import { RunEventTimeline } from "./RunEventTimeline.tsx";
import { invalidateWorkbenchMutation, workbenchQueryKeys } from "./query-keys.ts";
import { runIsActive, runRoleLabel, runStatusLabel, type EvidenceSelection, type WorkflowMaterial } from "./workbench-presentation.ts";
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

const validationStages: readonly ValidationStage[] = ["V0","V1","V2","V3","V4","V5","V6","V7"];
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
}: Readonly<{ events: readonly RunEvent[]; active: boolean }>) => {
  const recordedStages = validationStages.filter(
    (stage) => latestValidationEvent(events, stage) !== null,
  );

  if (recordedStages.length === 0) {
    return (
      <section data-testid="validation-matrix">
        <WorkbenchSectionHeader title="Validation" />
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
      <WorkbenchSectionHeader title="Validation" />
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

export const ExecutionWorkspace = ({ workItem, material, mutationsDisabled = false, onSelectMaterial, onOpenEvidence, onReturnFromEvidence }: Readonly<{
  workItem: WorkItem; material: WorkflowMaterial; mutationsDisabled?: boolean; onSelectMaterial: (material: WorkflowMaterial) => void;
  onOpenEvidence: (selection: EvidenceSelection) => void; onReturnFromEvidence: () => void;
}>) => {
  const queryClient = useQueryClient();
  const tasksQuery = useQuery({ queryKey: workbenchQueryKeys.tasks(workItem.id), queryFn: () => api.listExecutionTasks(workItem.id) });
  const runsQuery = useQuery({ queryKey: workbenchQueryKeys.runs(workItem.id), queryFn: () => api.listRuns(workItem.id), refetchInterval: (query) => query.state.data?.some(runIsActive) === true ? 1000 : false });
  const artifactsQuery = useQuery({ queryKey: workbenchQueryKeys.artifacts(workItem.id), queryFn: () => api.listArtifacts(workItem.id) });
  const tasks = tasksQuery.data ?? [];
  const runs = runsQuery.data ?? [];
  const executionOwner = deriveExecutionOwner(tasks, runs);
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
  const invalidate=():Promise<void>=>invalidateWorkbenchMutation(queryClient,workItem.id);
  const tick=useMutation({mutationFn:api.tick,onSuccess:invalidate});
  const cancel=useMutation({
    mutationFn:()=>{
      if(!currentOwnerRun)throw new TypeError("current implementation owner has no active attempt");
      return api.cancelRun(currentOwnerRun.id);
    },
    onSuccess:invalidate,
  });
  const resume=useMutation({mutationFn:()=>api.resumeWorkItem(workItem.id),onSuccess:invalidate});

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
    canRunNext?<WorkbenchAction label="Run next implementation step" tone="primary" loading={tick.isPending} disabled={mutationsDisabled || tick.isPending} onClick={()=>tick.mutate()}/>:undefined;
  const mutationError=tick.error??cancel.error??resume.error;
  const summaryBlocker=executionOwner.tag==="BLOCKED_TASK"?
    {status:"error" as const,title:"Implementation task is blocked",description:"Resolve the recorded blocker before resuming this approved task."}:
    mutationError?{status:"error" as const,title:"Implementation action failed",description:mutationError instanceof Error?mutationError.message:String(mutationError)}:null;

  const groups:WorkflowStepIndexGroup[]=[];
  if(tasks.length>0)groups.push({id:"tasks",label:"Approved tasks",items:tasks.map((task)=>({
    id:task.id,label:task.planTaskId,description:task.objective,statusLabel:taskStateLabel(task),statusVariant:taskVariant(task),selected:task.id===selectedTask?.id,
    onSelect:()=>onSelectMaterial({kind:"EXECUTION_TASK",taskId:task.id,runId:runs.findLast((run)=>run.executionTaskId===task.id)?.id??null}),
  }))});
  if(selectedTask&&taskRuns.length>0)groups.push({id:"attempts",label:"Attempts",items:taskRuns.map((run)=>({
    id:run.id,label:runRoleLabel(run.role)+" · Attempt "+run.attempt,description:new Date(run.startedAt).toLocaleString(),statusLabel:runStatusLabel(run.status),statusVariant:runVariant(run),selected:run.id===selectedRun?.id,
    onSelect:()=>onSelectMaterial({kind:"EXECUTION_TASK",taskId:selectedTask.id,runId:run.id}),
  }))});

  const summary=<WorkflowStepSummary
    label="Implementation" purpose="Execute and verify the approved change"
    stateLabel={workItem.stage==="EXECUTION"?"Current":"Reached"} stateVariant={workItem.stage==="EXECUTION"?"info":"neutral"}
    statusLabel={currentOwnerTask?taskStateLabel(currentOwnerTask):workItem.status==="COMPLETE"?"Complete":workItem.status.toLowerCase()}
    statusVariant={currentOwnerTask?taskVariant(currentOwnerTask):workItem.status==="BLOCKED"?"error":workItem.status==="COMPLETE"?"success":"neutral"}
    blocker={summaryBlocker} action={currentAction}
  />;

  const master=groups.length>0?<WorkflowStepIndex groups={groups} label="Implementation work"/>:<WorkbenchState kind="empty" title="No implementation work"/>;
  const implementationStateError=tasksQuery.error??runsQuery.error??artifactsQuery.error;
  const detail=implementationStateError?<WorkbenchState kind="error" title="Implementation state unavailable" description={implementationStateError instanceof Error?implementationStateError.message:String(implementationStateError)}/>:
    tasksQuery.isPending||runsQuery.isPending||artifactsQuery.isPending?<WorkbenchState kind="loading" title="Loading implementation state…"/>:
    selectedTask?<section className="order-execution-task-material" data-testid="execution-task-detail">
      <WorkbenchSectionHeader title={selectedTask.planTaskId} description={selectedTask.objective} action={<WorkbenchStatus tone={taskTone(selectedTask)} label={taskStateLabel(selectedTask)}/>} />
      <MetadataList columns="multi">
        <MetadataListItem label="Gates">{selectedTask.gateIds.join(", ")||"None"}</MetadataListItem>
        <MetadataListItem label="Scope">{selectedTask.scope.join(", ")||"None"}</MetadataListItem>
        <MetadataListItem label="Change surface">{selectedTask.changeSurface.join(", ")||"None"}</MetadataListItem>
        <MetadataListItem label="Depends on">{selectedTask.dependsOn.length>0?selectedTask.dependsOn.join(", "):"None"}</MetadataListItem>
      </MetadataList>
      {selectedRun?<>
        <div data-testid="selected-run-header">
          <WorkbenchSectionHeader
            title={runRoleLabel(selectedRun.role)+" · Attempt "+selectedRun.attempt}
            action={<WorkbenchStatus tone={runTone(selectedRun)} label={runStatusLabel(selectedRun.status)}/>} 
          />
        </div>
        <WorkbenchDisclosure label="Technical details" content={<dl>
          <div><dt>Task id</dt><dd><code>{selectedTask.id}</code></dd></div>
          <div><dt>Approval id</dt><dd><code>{selectedTask.approvalId}</code></dd></div>
          <div><dt>Run id</dt><dd><code>{selectedRun.id}</code></dd></div>
          <div><dt>Baseline</dt><dd><code>{selectedRun.baselineCommit}</code></dd></div>
          <div><dt>Context</dt><dd><code>{selectedRun.contextHash}</code></dd></div>
          <div><dt>Provider session</dt><dd><code>{selectedRun.providerSessionId??"—"}</code></dd></div>
          <div><dt>Terminal classification</dt><dd><code>{selectedRun.terminalClassification??"—"}</code></dd></div>
        </dl>}/>
      </>:<WorkbenchState kind="empty" title="No attempts yet"/>}
      <ValidationMatrix events={events} active={selectedRun !== null && runIsActive(selectedRun)}/>
      {eventsQuery.isPending?<WorkbenchState kind="loading" title="Loading attempt timeline…"/>:
       eventsQuery.isError?<WorkbenchState kind="error" title="Attempt timeline unavailable" description={eventsQuery.error instanceof Error?eventsQuery.error.message:String(eventsQuery.error)}/>:
       selectedRun&&events.length>0?<RunEventTimeline run={selectedRun} events={events} onOpenEvidence={onOpenEvidence}/>:<WorkbenchState kind="empty" title="No persisted attempt events"/>}
      <WorkbenchSectionHeader title="Implementation material"/>
      <div className="order-resource-list">{(artifactsQuery.data??[]).map((artifact)=><WorkbenchResourceRow key={artifact.id} label={artifact.role} detail={artifact.repositoryPath} actionLabel={"Open "+artifact.role+": "+artifact.repositoryPath} onOpen={()=>onOpenEvidence({kind:"ARTIFACT",artifactId:artifact.id,label:artifact.role+": "+artifact.repositoryPath})}/>)}</div>
    </section>:<WorkbenchState kind="empty" title="No implementation tasks materialized"/>;

  const detailSurface=material.kind==="EVIDENCE"&&implementationStateError===null&&!tasksQuery.isPending&&!runsQuery.isPending&&!artifactsQuery.isPending
    ?<EvidenceViewer selection={material.selection} onBack={onReturnFromEvidence}/>
    :<WorkbenchSurface attention={summary} material={detail}/>;

  return (
    <div data-testid="execution-workspace">
      <WorkbenchMasterDetail
        master={master}
        detail={detailSurface}
        masterLabel="Implementation work"
      />
    </div>
  );
};
