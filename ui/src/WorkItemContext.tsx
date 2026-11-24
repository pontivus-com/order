import { useQuery } from "@tanstack/react-query";
import type { Sha256, WorkItem } from "../../src/core/contracts.ts";
import * as api from "./http.ts";
import { workbenchQueryKeys } from "./query-keys.ts";
import {
  runRoleLabel,
  runStatusLabel,
  workflowMaterialLabel,
  workflowMaterialRunId,
  workflowPresentation,
  type WorkflowMaterial,
} from "./workbench-presentation.ts";
import { WorkbenchContextPanel } from "./primitives/WorkbenchContextPanel.tsx";
import { WorkbenchFacts } from "./primitives/WorkbenchFacts.tsx";
import { WorkbenchNotice } from "./primitives/WorkbenchNotice.tsx";
import { WorkbenchSection } from "./primitives/WorkbenchSection.tsx";
import { WorkbenchStatus } from "./primitives/WorkbenchStatus.tsx";

export const WorkItemContext=({workItem,selectedStep,selectedMaterial,selectedDocumentPath,selectedDocumentSha256,onClose}:Readonly<{
  workItem:WorkItem;selectedStep:WorkItem["stage"]|null;selectedMaterial:WorkflowMaterial|null;
  selectedDocumentPath:string|null;selectedDocumentSha256:Sha256|null;onClose:()=>void;
}>)=>{
  const step=selectedStep??workItem.stage;
  const material:WorkflowMaterial=selectedMaterial??{kind:"STEP_STATE"};
  const selectedRunId=workflowMaterialRunId(material);
  const schemasQuery=useQuery({queryKey:workbenchQueryKeys.workItemSchemas,queryFn:api.listWorkItemSchemas});
  const runsQuery=useQuery({queryKey:workbenchQueryKeys.runs(workItem.id),queryFn:()=>api.listRuns(workItem.id),enabled:selectedRunId!==null});
  const artifactsQuery=useQuery({
    queryKey:workbenchQueryKeys.artifacts(workItem.id),
    queryFn:()=>api.listArtifacts(workItem.id),
    enabled:selectedDocumentPath!==null,
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
    enabled:material.kind==="EXECUTION_TASK",
  });
  const diagnosticsQuery=useQuery({queryKey:workbenchQueryKeys.workItemSourceDiagnostics,queryFn:api.listWorkItemSourceDiagnostics});
  const diagnostics=(diagnosticsQuery.data??[]).filter((item)=>item.workItemId===workItem.id||item.path===workItem.sourcePath);
  const kind=schemasQuery.data?.find((schema)=>schema.schemaId===workItem.schemaId)?.kind??workItem.schemaId;
  const selectedRun=(runsQuery.data??[]).find((run)=>run.id===selectedRunId)??null;
  const selectedDocumentArtifact=(artifactsQuery.data??[]).find(
    (artifact)=>artifact.repositoryPath===selectedDocumentPath,
  )??null;
  const selectedProposalEvent=material.kind==="PROPOSAL"
    ?(proposalEventsQuery.data??[]).find((event)=>event.id===material.eventId)??null
    :null;
  const selectedTask=material.kind==="EXECUTION_TASK"
    ?(tasksQuery.data??[]).find((task)=>task.id===material.taskId)??null
    :null;
  const selectedPackage=material.kind==="APPROVAL_PACKAGE"
    ?signoffPackageQuery.data??null
    :null;
  const selectedDocumentIsRelevant=material.kind==="SOURCE_DOCUMENT"||material.kind==="STAGE_DOCUMENT"||material.kind==="SUPPORTING_DOCUMENT"||step==="AWAITING_SIGNOFF";

  const sections = [
    <WorkbenchSection
      key="selected-view"
      title="Selected view"
      content={
        <div data-testid="selected-view-context" className="order-workbench-context-selected">
          <WorkbenchStatus tone="info" label={workflowPresentation(step).label+" · "+workflowMaterialLabel(material)}/>
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
            ]}
          />
        }
      />
    ]:[]),
    ...(material.kind==="APPROVAL_PACKAGE"&&selectedPackage!==null?[
      <WorkbenchSection
        key="approval-package"
        title="Selected approval package identity"
        content={
          <WorkbenchFacts
            label="Selected approval package identity"
            items={[
              {id:"package-hash",label:"Package hash",value:<code data-testid="context-signoff-package-hash">{selectedPackage.packageHash}</code>,emphasis:"strong"},
              {id:"package-source",label:"Source SHA",value:<code>{selectedPackage.sourceSha256}</code>},
              {id:"package-baseline",label:"Baseline",value:<code>{selectedPackage.baselineCommit}</code>},
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
