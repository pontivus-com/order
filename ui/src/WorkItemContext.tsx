import { useQuery } from "@tanstack/react-query";
import { MetadataList, MetadataListItem } from "@astryxdesign/core/MetadataList";
import type { Sha256, WorkItem } from "../../src/core/contracts.ts";
import * as api from "./http.ts";
import { workbenchQueryKeys } from "./query-keys.ts";
import { runRoleLabel, runStatusLabel, workflowMaterialLabel, workflowMaterialRunId, workflowPresentation, type WorkflowMaterial } from "./workbench-presentation.ts";
import { WorkbenchContextPanel } from "./primitives/WorkbenchContextPanel.tsx";
import { WorkbenchDisclosure } from "./primitives/WorkbenchDisclosure.tsx";
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
  const diagnosticsQuery=useQuery({queryKey:workbenchQueryKeys.workItemSourceDiagnostics,queryFn:api.listWorkItemSourceDiagnostics});
  const diagnostics=(diagnosticsQuery.data??[]).filter((item)=>item.workItemId===workItem.id||item.path===workItem.sourcePath);
  const kind=schemasQuery.data?.find((schema)=>schema.schemaId===workItem.schemaId)?.kind??workItem.schemaId;
  const selectedRun=(runsQuery.data??[]).find((run)=>run.id===selectedRunId)??null;
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
      </MetadataList>:null}
      {diagnostics.length>0?<WorkbenchNotice tone="warning" title="Source requires attention" description={diagnostics.length+" source issue"+(diagnostics.length===1?"":"s")+" require attention"}/>:null}
    </div>
    <WorkbenchDisclosure label="WorkItem technical details" content={<MetadataList columns="single">
      <MetadataListItem label="Canonical stage"><code>{workItem.stage}</code></MetadataListItem>
      <MetadataListItem label="Status"><code>{workItem.status}</code></MetadataListItem>
      <MetadataListItem label="Outcome"><code>{workItem.outcome??"—"}</code></MetadataListItem>
      <MetadataListItem label="Project">{workItem.projectId}</MetadataListItem>
      <MetadataListItem label="Kind">{kind}</MetadataListItem>
      <MetadataListItem label="Schema"><code>{workItem.schemaId}</code></MetadataListItem>
      <MetadataListItem label="Concerns">{workItem.concernIds.join(", ")||"—"}</MetadataListItem>
    </MetadataList>}/>
  </WorkbenchContextPanel>;
};
