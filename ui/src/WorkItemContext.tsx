import { useQuery } from "@tanstack/react-query";
import { MetadataList, MetadataListItem } from "@astryxdesign/core/MetadataList";
import type { Sha256, WorkItem } from "../../src/core/contracts.ts";
import * as api from "./http.ts";
import { workbenchQueryKeys } from "./query-keys.ts";
import { runRoleLabel, runStatusLabel, workflowMaterialLabel, workflowMaterialRunId, workflowPresentation, type WorkflowMaterial } from "./workbench-presentation.ts";
import { WorkbenchContextPanel } from "./primitives/WorkbenchContextPanel.tsx";
import { WorkbenchNotice } from "./primitives/WorkbenchNotice.tsx";
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
  return <WorkbenchContextPanel title="Technical context" onClose={onClose}>
    <div data-testid="selected-view-context">
      <WorkbenchStatus tone="info" label={workflowPresentation(step).label+" · "+workflowMaterialLabel(material)}/>
      {selectedDocumentIsRelevant&&selectedDocumentPath?<MetadataList columns="single">
        <MetadataListItem label="Selected document"><code>{selectedDocumentPath}</code></MetadataListItem>
        <MetadataListItem label="Exact SHA"><code>{selectedDocumentSha256??"Resolving…"}</code></MetadataListItem>
      </MetadataList>:null}
      {selectedRun?<MetadataList columns="single">
        <MetadataListItem label="Selected Run"><code>{selectedRun.id}</code></MetadataListItem>
        <MetadataListItem label="Role">{runRoleLabel(selectedRun.role)}</MetadataListItem>
        <MetadataListItem label="Status"><WorkbenchStatus tone={selectedRun.status==="FAILED"||selectedRun.status==="BLOCKED"?"danger":selectedRun.status==="WAITING_FOR_INPUT"?"warning":selectedRun.status==="COMPLETED"?"success":"info"} label={runStatusLabel(selectedRun.status)}/></MetadataListItem>
        <MetadataListItem label="Attempt">{selectedRun.attempt}</MetadataListItem>
        <MetadataListItem label="Started">{new Date(selectedRun.startedAt).toLocaleString()}</MetadataListItem>
        <MetadataListItem label="Ended">{selectedRun.endedAt===null?"—":new Date(selectedRun.endedAt).toLocaleString()}</MetadataListItem>
        <MetadataListItem label="Baseline"><code>{selectedRun.baselineCommit}</code></MetadataListItem>
        <MetadataListItem label="Context hash"><code>{selectedRun.contextHash}</code></MetadataListItem>
        <MetadataListItem label="Provider session"><code>{selectedRun.providerSessionId??"—"}</code></MetadataListItem>
        <MetadataListItem label="Terminal classification"><code>{selectedRun.terminalClassification??"—"}</code></MetadataListItem>
      </MetadataList>:null}
      {diagnostics.length>0?<WorkbenchNotice tone="warning" title="Source requires attention" description={diagnostics.length+" source issue"+(diagnostics.length===1?"":"s")+" require attention"}/>:null}
    </div>
    <section className="order-workbench-context-group" aria-label="WorkItem identity">
      <h3>WorkItem identity</h3>
      <MetadataList columns="single">
        <MetadataListItem label="WorkItem id"><code>{workItem.id}</code></MetadataListItem>
        <MetadataListItem label="Canonical stage"><code>{workItem.stage}</code></MetadataListItem>
        <MetadataListItem label="Status"><code>{workItem.status}</code></MetadataListItem>
        <MetadataListItem label="Outcome"><code>{workItem.outcome??"—"}</code></MetadataListItem>
        <MetadataListItem label="Project">{workItem.projectId}</MetadataListItem>
        <MetadataListItem label="Kind">{kind}</MetadataListItem>
        <MetadataListItem label="Schema"><code>{workItem.schemaId}</code></MetadataListItem>
        <MetadataListItem label="Concerns">{workItem.concernIds.join(", ")||"—"}</MetadataListItem>
      </MetadataList>
    </section>
    {material.kind==="PROPOSAL"?<section className="order-workbench-context-group" aria-label="Selected proposal identity">
      <h3>Selected proposal identity</h3>
      <MetadataList columns="single">
        <MetadataListItem label="Run id"><code>{material.runId}</code></MetadataListItem>
        <MetadataListItem label="Proposal event id"><code>{material.eventId}</code></MetadataListItem>
        {selectedProposalEvent?.event.tag==="ARTIFACT_PROPOSAL_CREATED"?<>
          <MetadataListItem label="Target path"><code>{selectedProposalEvent.event.targetPath}</code></MetadataListItem>
          <MetadataListItem label="Base SHA"><code>{selectedProposalEvent.event.baseSha256??"—"}</code></MetadataListItem>
          <MetadataListItem label="Authority layer"><code>{selectedProposalEvent.event.authorityLayer}</code></MetadataListItem>
        </>:null}
      </MetadataList>
    </section>:null}
    {material.kind==="APPROVAL_PACKAGE"&&selectedPackage!==null?<section className="order-workbench-context-group" aria-label="Selected approval package identity">
      <h3>Selected approval package identity</h3>
      <MetadataList columns="single">
        <MetadataListItem label="Package hash"><code data-testid="context-signoff-package-hash">{selectedPackage.packageHash}</code></MetadataListItem>
        <MetadataListItem label="Source SHA"><code>{selectedPackage.sourceSha256}</code></MetadataListItem>
        <MetadataListItem label="Baseline"><code>{selectedPackage.baselineCommit}</code></MetadataListItem>
      </MetadataList>
    </section>:null}
    {material.kind==="EXECUTION_TASK"?<section className="order-workbench-context-group" aria-label="Selected execution identity">
      <h3>Selected execution identity</h3>
      <MetadataList columns="single">
        <MetadataListItem label="Execution task id"><code>{material.taskId}</code></MetadataListItem>
        {selectedTask===null?null:<>
          <MetadataListItem label="Plan task id"><code>{selectedTask.planTaskId}</code></MetadataListItem>
          <MetadataListItem label="Approval id"><code>{selectedTask.approvalId}</code></MetadataListItem>
        </>}
        {material.runId===null?null:<MetadataListItem label="Selected Run id"><code>{material.runId}</code></MetadataListItem>}
      </MetadataList>
    </section>:null}
    {material.kind==="EVIDENCE"?<section className="order-workbench-context-group" aria-label="Selected evidence identity">
      <h3>Selected evidence identity</h3>
      <MetadataList columns="single">
        {material.selection.kind==="ARTIFACT"
          ? <MetadataListItem label="Artifact id"><code>{material.selection.artifactId}</code></MetadataListItem>
          : <>
              <MetadataListItem label="Run id"><code>{material.selection.runId}</code></MetadataListItem>
              <MetadataListItem label="Evidence path"><code>{material.selection.relativePath}</code></MetadataListItem>
            </>}
      </MetadataList>
    </section>:null}
  </WorkbenchContextPanel>;
};
