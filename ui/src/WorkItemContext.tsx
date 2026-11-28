import { useQuery } from "@tanstack/react-query";
import type { WorkItem } from "../../src/core/contracts.ts";
import * as api from "./http.ts";
import { workbenchQueryKeys } from "./query-keys.ts";
import {
  runRoleLabel,
  runStatusLabel,
  workflowMaterialLabel,
  workflowMaterialRunId,
  workflowPresentation,
  selectedContextArtifactId,
  resolveContextArtifact,
  type ContextDocumentIdentity,
  type WorkflowMaterial,
} from "./workbench-presentation.ts";
import { WorkbenchContextPanel } from "./primitives/WorkbenchContextPanel.tsx";
import { WorkbenchFacts } from "./primitives/WorkbenchFacts.tsx";
import { WorkbenchNotice } from "./primitives/WorkbenchNotice.tsx";
import { WorkbenchSection } from "./primitives/WorkbenchSection.tsx";
import { WorkbenchStatus } from "./primitives/WorkbenchStatus.tsx";

export const WorkItemContext=({workItem,selectedStep,selectedMaterial,selectedDocument,onClose}:Readonly<{
  workItem:WorkItem;selectedStep:WorkItem["stage"]|null;selectedMaterial:WorkflowMaterial|null;
  selectedDocument:ContextDocumentIdentity|null;onClose:()=>void;
}>)=>{
  const step=selectedStep??workItem.stage;
  const material:WorkflowMaterial=selectedMaterial??{kind:"STEP_STATE"};
  const selectedRunId=workflowMaterialRunId(material);
  const artifactId=selectedContextArtifactId(material,selectedDocument);
  const schemasQuery=useQuery({queryKey:workbenchQueryKeys.workItemSchemas,queryFn:api.listWorkItemSchemas});
  const runsQuery=useQuery({queryKey:workbenchQueryKeys.runs(workItem.id),queryFn:()=>api.listRuns(workItem.id),enabled:selectedRunId!==null});
  const artifactsQuery=useQuery({
    queryKey:workbenchQueryKeys.artifacts(workItem.id),
    queryFn:()=>api.listArtifacts(workItem.id),
    enabled:artifactId!==null,
  });
  const proposalRunId=material.kind==="PROPOSAL"?material.runId:null;
  const proposalEventsQuery=useQuery({
    queryKey:workbenchQueryKeys.runEvents(proposalRunId),
    queryFn:()=>proposalRunId===null?Promise.resolve([]):api.listRunEvents(proposalRunId,0),
    enabled:proposalRunId!==null,
  });
  const signoffPackageQuery=useQuery({
    queryKey:workbenchQueryKeys.signoffPackage(workItem.id),
    queryFn:()=>api.getSignoffPackage(workItem.id),
    enabled:material.kind==="APPROVAL_PACKAGE"&&workItem.stage==="AWAITING_SIGNOFF",
    retry:false,
  });
  const tasksQuery=useQuery({
    queryKey:workbenchQueryKeys.tasks(workItem.id),
    queryFn:()=>api.listExecutionTasks(workItem.id),
    enabled:material.kind==="EXECUTION_TASK"||(material.kind==="APPROVAL_PACKAGE"&&material.approvalId!==undefined&&material.taskId!==undefined),
  });
  const diagnosticsQuery=useQuery({queryKey:workbenchQueryKeys.workItemSourceDiagnostics,queryFn:api.listWorkItemSourceDiagnostics});
  const diagnostics=(diagnosticsQuery.data??[]).filter((item)=>item.workItemId===workItem.id||item.path===workItem.sourcePath);
  const kind=schemasQuery.data?.find((schema)=>schema.schemaId===workItem.schemaId)?.kind??workItem.schemaId;
  const selectedRun=(runsQuery.data??[]).find((run)=>run.id===selectedRunId &&
    run.workItemId===workItem.id &&
    (material.kind!=="EXECUTION_TASK"||run.executionTaskId===material.taskId))??null;
  const selectedDocumentArtifact=resolveContextArtifact(workItem.id,artifactId,artifactsQuery.data??[]);
  const sourceSelected=material.kind==="SOURCE_DOCUMENT";
  const selectedDocumentPath=sourceSelected?workItem.sourcePath:selectedDocumentArtifact?.repositoryPath??null;
  const selectedDocumentSha256=sourceSelected
    ?selectedDocument?.artifactId===null&&selectedDocument.path===workItem.sourcePath
      ?selectedDocument.sha256:workItem.sourceSha256
    :selectedDocumentArtifact?.sha256??null;
  const selectedProposalEvent=material.kind==="PROPOSAL"
    ?(proposalEventsQuery.data??[]).find((event)=>event.id===material.eventId&&event.runId===material.runId&&event.event.tag==="ARTIFACT_PROPOSAL_CREATED")??null
    :null;
  const selectedProposalDisposition=material.kind==="PROPOSAL"
    ?(proposalEventsQuery.data??[]).find(event=>event.runId===material.runId&&event.event.tag==="ARTIFACT_PROPOSAL_DISPOSITIONED"&&event.event.proposalEventId===material.eventId)??null
    :null;
  const selectedTask=material.kind==="EXECUTION_TASK"
    ?(tasksQuery.data??[]).find((task)=>task.id===material.taskId)??null
    :material.kind==="APPROVAL_PACKAGE"&&material.approvalId!==undefined
      ?(tasksQuery.data??[]).find(task=>task.id===material.taskId&&task.approvalId===material.approvalId)??null:null;
  const selectedPackage=material.kind==="APPROVAL_PACKAGE"&&material.approvalId===undefined&&workItem.stage==="AWAITING_SIGNOFF"
    ?signoffPackageQuery.data?.packageHash===material.packageHash ? signoffPackageQuery.data??null : null
    :null;
  const approvalsQuery=useQuery({
    queryKey:workbenchQueryKeys.approvals(workItem.id),
    queryFn:()=>api.listApprovals(workItem.id),
    enabled:selectedTask!==null||(material.kind==="APPROVAL_PACKAGE"&&material.approvalId!==undefined),
  });
  const finalApprovalQuery=useQuery({
    queryKey:workbenchQueryKeys.currentApproval(workItem.id),
    queryFn:()=>api.getCurrentApproval(workItem.id),
    enabled:material.kind==="APPROVAL_PACKAGE"&&(workItem.stage==="EXECUTION"||workItem.stage==="COMPLETE"),
    retry:false,
  });
  const selectedApproval=selectedTask!==null
    ?(approvalsQuery.data??[]).find(approval=>approval.id===selectedTask.approvalId&&approval.workItemId===workItem.id)??null
    :material.kind==="APPROVAL_PACKAGE"&&material.approvalId!==undefined
      ?(approvalsQuery.data??[]).find(approval=>approval.id===material.approvalId&&approval.workItemId===workItem.id)??null
      :material.kind==="APPROVAL_PACKAGE"&&material.packageHash===undefined&&
      (workItem.stage==="EXECUTION"||workItem.stage==="COMPLETE")?finalApprovalQuery.data??null:null;
  const selectedDocumentIsRelevant=sourceSelected||artifactId!==null;

  const sections = [
    <WorkbenchSection
      key="selected-view"
      title="Selected view"
      content={
        <div data-testid="selected-view-context" className="order-workbench-context-selected">
          <WorkbenchStatus tone="info" label={workflowPresentation(step).label+" · "+workflowMaterialLabel(material)}/>
          {artifactId!==null&&selectedDocumentArtifact===null?(
            <WorkbenchNotice tone={artifactsQuery.isPending?"info":"warning"}
              title={artifactsQuery.isPending?"Resolving selected document":"Selected document identity unavailable"}/>
          ):null}
          {material.kind==="APPROVAL_PACKAGE"&&material.approvalId===undefined&&
            material.packageHash!==undefined&&selectedPackage===null?(
            <WorkbenchFacts label="Inspected package identity" items={[
              {id:"inspected-package-hash",label:"Inspected package hash",value:<code data-testid="context-signoff-package-hash">{material.packageHash}</code>},
            ]}/>
          ):null}
          {selectedDocumentIsRelevant&&selectedDocumentPath?(
            <WorkbenchFacts
              label="Selected document identity"
              items={[
                {id:"selected-document",label:"Selected document",value:<code>{selectedDocumentPath}</code>,emphasis:"strong"},
                {id:"selected-document-sha",label:"Exact SHA",value:<code>{selectedDocumentSha256??"Resolving…"}</code>},
                ...(selectedDocumentArtifact===null?[]:[
                  {id:"artifact-id",label:"Artifact id",value:<code>{selectedDocumentArtifact.id}</code>},
                  {id:"artifact-authority",label:"Authority layer",value:<code>{selectedDocumentArtifact.authorityLayer??"—"}</code>},
                  {id:"artifact-commit",label:"Git commit",value:<code>{selectedDocumentArtifact.gitCommit??"—"}</code>},
                ]),
              ]}
            />
          ):null}
          {selectedRunId!==null&&selectedRun===null?(
            <WorkbenchNotice tone={runsQuery.isPending?"info":"warning"}
              title={runsQuery.isPending?"Resolving selected Run":"Selected Run identity unavailable"}/>
          ):null}
          {selectedRun?(
            <WorkbenchFacts
              label="Selected Run identity"
              items={[
                {id:"run-id",label:"Selected Run",value:<code>{selectedRun.id}</code>,emphasis:"strong"},
                {id:"run-role",label:"Role",value:runRoleLabel(selectedRun.role)},
                {id:"run-status",label:"Status",value:<WorkbenchStatus tone={selectedRun.status==="FAILED"||selectedRun.status==="BLOCKED"?"danger":selectedRun.status==="WAITING_FOR_INPUT"?"warning":selectedRun.status==="COMPLETED"?"success":"info"} label={runStatusLabel(selectedRun.status)}/>},
                {id:"run-attempt",label:"Attempt",value:selectedRun.attempt},
                {id:"run-started",label:"Started",value:new Date(selectedRun.startedAt).toLocaleString()},
                {id:"run-ended",label:"Ended",value:selectedRun.endedAt===null?"—":new Date(selectedRun.endedAt).toLocaleString()},
                {id:"run-baseline",label:"Baseline",value:<code>{selectedRun.baselineCommit}</code>},
                {id:"run-context",label:"Context hash",value:<code>{selectedRun.contextHash}</code>},
                {id:"run-provider",label:"Provider session",value:<code>{selectedRun.providerSessionId??"—"}</code>},
                {id:"run-terminal",label:"Terminal classification",value:<code>{selectedRun.terminalClassification??"—"}</code>},
              ]}
            />
          ):null}
          {material.kind==="EXECUTION_TASK"&&selectedTask===null?(
            <WorkbenchNotice tone={tasksQuery.isPending?"info":"warning"} title={tasksQuery.isPending?"Resolving selected task":"Selected task identity unavailable"}/>
          ):null}
          {((selectedTask!==null&&selectedApproval===null)||
            (material.kind==="APPROVAL_PACKAGE"&&material.approvalId===undefined&&workItem.stage==="AWAITING_SIGNOFF"&&selectedPackage===null)||
            (material.kind==="APPROVAL_PACKAGE"&&finalApprovalQuery.isError))?(
            <WorkbenchNotice tone="warning" title="Selected approval identity unavailable"/>
          ):null}
          {diagnostics.length>0?<WorkbenchNotice tone="warning" title="Source requires attention" description={diagnostics.length+" source issue"+(diagnostics.length===1?"":"s")+" require attention"}/>:null}
        </div>
      }
    />,
    <WorkbenchSection
      key="workitem-identity"
      title="WorkItem identity"
      content={
        <WorkbenchFacts
          label="WorkItem identity"
          items={[
            {id:"workitem-id",label:"WorkItem id",value:<code>{workItem.id}</code>,emphasis:"strong"},
            {id:"workitem-stage",label:"Canonical stage",value:<code>{workItem.stage}</code>},
            {id:"workitem-status",label:"Status",value:<code>{workItem.status}</code>},
            {id:"workitem-outcome",label:"Outcome",value:<code>{workItem.outcome??"—"}</code>},
            {id:"workitem-project",label:"Project",value:workItem.projectId},
            {id:"workitem-kind",label:"Kind",value:kind},
            {id:"workitem-schema",label:"Schema",value:<code>{workItem.schemaId}</code>},
            {id:"workitem-concerns",label:"Concerns",value:workItem.concernIds.join(", ")||"—"},
          ]}
        />
      }
    />,
    ...(material.kind==="PROPOSAL"?[
      <WorkbenchSection
        key="proposal-identity"
        title="Selected proposal identity"
        content={
          <WorkbenchFacts
            label="Selected proposal identity"
            items={[
              {id:"proposal-run",label:"Run id",value:<code>{material.runId}</code>},
              {id:"proposal-event",label:"Proposal event id",value:<code>{material.eventId}</code>},
              ...(selectedProposalEvent?.event.tag==="ARTIFACT_PROPOSAL_CREATED"?[
                {id:"proposal-target",label:"Target path",value:<code>{selectedProposalEvent.event.targetPath}</code>,emphasis:"strong" as const},
                {id:"proposal-base",label:"Base SHA",value:<code>{selectedProposalEvent.event.baseSha256??"—"}</code>},
                {id:"proposal-authority",label:"Authority layer",value:<code>{selectedProposalEvent.event.authorityLayer}</code>},
              ]:[]),
              ...(selectedProposalDisposition?.event.tag==="ARTIFACT_PROPOSAL_DISPOSITIONED"?[
                {id:"proposal-disposition",label:"Disposition",value:<code>{selectedProposalDisposition.event.disposition}</code>},
                {id:"proposal-disposition-event",label:"Disposition event",value:<code>{selectedProposalDisposition.id}</code>},
              ]:[]),
            ]}
          />
        }
      />
    ]:[]),
    ...((material.kind==="APPROVAL_PACKAGE"||selectedTask!==null)&&(selectedApproval!==null||selectedPackage!==null)?[
      <WorkbenchSection
        key="approval-package"
        title="Selected approval package identity"
        content={
          <WorkbenchFacts
            label="Selected approval package identity"
            items={[
              {id:"package-hash",label:"Package hash",value:<code data-testid="context-signoff-package-hash">{(selectedApproval??selectedPackage)?.packageHash}</code>,emphasis:"strong"},
              {id:"package-source",label:"Source SHA",value:<code>{(selectedApproval??selectedPackage)?.sourceSha256}</code>},
              {id:"package-baseline",label:"Baseline",value:<code>{(selectedApproval??selectedPackage)?.baselineCommit}</code>},
              ...(material.kind==="APPROVAL_PACKAGE"&&material.taskId!==undefined&&selectedPackage?.taskBlock.tasks.some(task=>task.id===material.taskId)?[
                {id:"prospective-task",label:"Plan task id",value:<code>{material.taskId}</code>},
              ]:[]),
              ...(selectedApproval===null?[]:[
                {id:"signed-approval-id",label:"Approval id",value:<code>{selectedApproval.id}</code>},
                {id:"signed-plan-id",label:"Signed PLAN ArtifactRef",value:<code>{selectedApproval.planArtifactRefId}</code>},
                {id:"signed-r3-id",label:"Signed R3 ArtifactRef",value:<code>{selectedApproval.r3ArtifactRefId}</code>},
              ]),
            ]}
          />
        }
      />
    ]:[]),
    ...(material.kind==="EXECUTION_TASK"?[
      <WorkbenchSection
        key="execution-identity"
        title="Selected execution identity"
        content={
          <WorkbenchFacts
            label="Selected execution identity"
            items={[
              {id:"execution-task",label:"Execution task id",value:<code>{material.taskId}</code>,emphasis:"strong"},
              ...(selectedTask===null?[]:[
                {id:"plan-task",label:"Plan task id",value:<code>{selectedTask.planTaskId}</code>},
                {id:"approval-id",label:"Approval id",value:<code>{selectedTask.approvalId}</code>},
              ]),
              ...(material.runId===null?[]:[{id:"selected-run",label:"Selected Run id",value:<code>{material.runId}</code>}]),
            ]}
          />
        }
      />
    ]:[]),
    ...(material.kind==="EVIDENCE"?[
      <WorkbenchSection
        key="evidence-identity"
        title="Selected evidence identity"
        content={
          <WorkbenchFacts
            label="Selected evidence identity"
            items={material.selection.kind==="ARTIFACT"
              ?[{id:"evidence-artifact",label:"Artifact id",value:<code>{material.selection.artifactId}</code>,emphasis:"strong"}]
              :[
                {id:"evidence-run",label:"Run id",value:<code>{material.selection.runId}</code>},
                {id:"evidence-path",label:"Evidence path",value:<code>{material.selection.relativePath}</code>,emphasis:"strong"},
              ]}
          />
        }
      />
    ]:[]),
  ];

  return <WorkbenchContextPanel title="Technical context" onClose={onClose} sections={sections}/>;
};
