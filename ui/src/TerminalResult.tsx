import { useMemo, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { CodeBlock } from "@astryxdesign/core/CodeBlock";
import { Markdown } from "@astryxdesign/core/Markdown";
import { Tab, TabList } from "@astryxdesign/core/TabList";
import { MarkdownTextSchema, type ArtifactRef, type RunEvent, type WorkItem } from "../../src/core/contracts.ts";
import * as api from "./http.ts";
import { workbenchQueryKeys } from "./query-keys.ts";
import { eventEvidence, lifecycleArtifactRoleRank, type EvidenceSelection } from "./workbench-presentation.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchAttention } from "./primitives/WorkbenchAttention.tsx";
import { WorkbenchResourceRow } from "./primitives/WorkbenchResourceRow.tsx";
import { WorkbenchSectionHeader } from "./primitives/WorkbenchSectionHeader.tsx";
import { WorkbenchState } from "./primitives/WorkbenchState.tsx";
import { WorkbenchStatus } from "./primitives/WorkbenchStatus.tsx";
import { WorkbenchSurface } from "./primitives/WorkbenchSurface.tsx";

const resultText=(workItem:WorkItem):string=>{switch(workItem.outcome){
  case"DISPROVEN":return"The proposed work was disproven. No implementation is required.";
  case"DUPLICATE":return"The work is a duplicate of already governed work.";
  case"ALREADY_SATISFIED":return"The approved intent is already satisfied by the current repository state.";
  case"INVESTIGATION_COMPLETE":return"The investigation completed with an evidence-backed result.";
  case"AUDIT_COMPLETE":return"The audit completed with an evidence-backed result.";
  case"CANDIDATE_DONE":return"Implementation completed with a verified candidate. Detailed task and attempt history remains available under the reached Implementation step.";
  default:return"The WorkItem is complete.";
}};
const outcomeLabel=(workItem:WorkItem):string=>{const label=(workItem.outcome??"COMPLETE").replaceAll("_"," ").toLowerCase();return label.length===0?label:label[0]!.toUpperCase()+label.slice(1);};
const decode=(bytes:Uint8Array):Readonly<{kind:"MARKDOWN"|"TEXT";value:string}>=>{try{const value=new TextDecoder("utf-8",{fatal:true}).decode(bytes);const markdown=MarkdownTextSchema.safeParse(value);return markdown.success?{kind:"MARKDOWN",value:markdown.data}:{kind:"TEXT",value};}catch{const preview=Array.from(bytes.slice(0,256),(value)=>value.toString(16).padStart(2,"0")).join(" ");return{kind:"TEXT",value:"Binary result material ("+bytes.byteLength+" bytes)\n"+preview+(bytes.byteLength>256?" …":"")};}};

export const TerminalResult=({workItem,onOpenEvidence,onCreateRemediation}:Readonly<{
  workItem:WorkItem;onOpenEvidence:(selection:EvidenceSelection)=>void;onCreateRemediation?:(workItem:WorkItem)=>void;
}>)=>{
  const evidenceBacked=workItem.outcome==="INVESTIGATION_COMPLETE"||workItem.outcome==="AUDIT_COMPLETE";
  const candidateDone=workItem.outcome==="CANDIDATE_DONE";
  const artifactsQuery=useQuery({queryKey:workbenchQueryKeys.lifecycleArtifacts(workItem.id),queryFn:()=>api.listLifecycleArtifacts(workItem.id),enabled:evidenceBacked});
  const runsQuery=useQuery({queryKey:workbenchQueryKeys.runs(workItem.id),queryFn:()=>api.listRuns(workItem.id),enabled:candidateDone});
  const candidateRuns=candidateDone?(runsQuery.data??[]).filter((run)=>run.executionTaskId!==null):[];
  const eventQueries=useQueries({queries:candidateRuns.map((run)=>({queryKey:workbenchQueryKeys.runEvents(run.id),queryFn:()=>api.listRunEvents(run.id,0),enabled:candidateDone}))});
  const artifacts=useMemo(()=>[...(artifactsQuery.data??[])].sort((left,right)=>lifecycleArtifactRoleRank(left.role)-lifecycleArtifactRoleRank(right.role)),[artifactsQuery.data]);
  const[selectedArtifactId,setSelectedArtifactId]=useState<ArtifactRef["id"]|null>(null);
  const selectedArtifact=artifacts.find((artifact)=>artifact.id===selectedArtifactId)??artifacts.at(-1)??null;
  const contentQuery=useQuery({queryKey:workbenchQueryKeys.artifactContent(selectedArtifact?.id??null),queryFn:()=>{if(!selectedArtifact)throw new TypeError("terminal result artifact required");return api.readArtifactContent(selectedArtifact.id);},enabled:selectedArtifact!==null});
  const candidateEvidence=candidateRuns.flatMap((run,index)=>{const events=eventQueries[index]?.data??[];return events.flatMap((event:RunEvent)=>eventEvidence(event).map((evidence)=>({runId:run.id,role:run.role,eventTag:event.event.tag,evidence})));});
  const uniqueCandidateEvidence=candidateEvidence.filter((candidate,index,all)=>all.findIndex((other)=>other.runId===candidate.runId&&other.evidence.relativePath===candidate.evidence.relativePath)===index);

  const attention=<WorkbenchAttention
    title={outcomeLabel(workItem)}
    purpose={resultText(workItem)}
    status={<WorkbenchStatus tone={candidateDone?"success":"neutral"} label={candidateDone?"Verified candidate":"Terminal outcome"}/>}
    action={evidenceBacked&&onCreateRemediation?<WorkbenchAction label="Create linked remediation" tone="primary" onClick={()=>onCreateRemediation(workItem)}/>:undefined}
  />;

  const material=<div className="order-result-material-root">
    <section className="order-workspace-section" data-testid="final-governed-outcome">
      <WorkbenchSectionHeader title="Final governed outcome"/>
      <div>
        <h3>{outcomeLabel(workItem)}</h3>
        <p>{resultText(workItem)}</p>
      </div>
    </section>
    {candidateDone?<section data-testid="candidate-result-material">
      <WorkbenchSectionHeader title="Verified candidate resources"/>
      {runsQuery.isPending||eventQueries.some((query)=>query.isPending)?<WorkbenchState kind="loading" title="Loading candidate resources…"/>:
       runsQuery.isError||eventQueries.some((query)=>query.isError)?<WorkbenchState kind="error" title="Candidate resources unavailable" description="The candidate is complete, but its persisted evidence could not be loaded."/>:
       uniqueCandidateEvidence.length===0?<WorkbenchState kind="empty" title="No separate candidate resource is recorded" description="The verified task/attempt history remains available under Implementation."/>:
       <div className="order-resource-list">{uniqueCandidateEvidence.map((candidate)=><WorkbenchResourceRow key={candidate.runId+":"+candidate.evidence.relativePath} label={candidate.evidence.relativePath} detail={candidate.eventTag.replaceAll("_"," ").toLowerCase()+" · "+candidate.role.toLowerCase()} actionLabel={"Evidence: "+candidate.evidence.relativePath} onOpen={()=>onOpenEvidence({kind:"EVIDENCE",runId:candidate.runId,relativePath:candidate.evidence.relativePath})}/>)}</div>}
    </section>:null}
    {evidenceBacked?<section data-testid="result-material">
      <WorkbenchSectionHeader title="Governed result material"/>
      {artifactsQuery.isPending?<WorkbenchState kind="loading" title="Loading governed result…"/>:
       artifactsQuery.isError?<WorkbenchState kind="error" title="Governed result unavailable" description={artifactsQuery.error instanceof Error?artifactsQuery.error.message:String(artifactsQuery.error)}/>:
       artifacts.length===0?<WorkbenchState kind="empty" title="No governed result artifact" description="The terminal classification is canonical, but no current result artifact is available."/>:<>
        {artifacts.length>1?<TabList value={selectedArtifact?.id??artifacts[0]!.id} onChange={(value)=>{const artifact=artifacts.find((candidate)=>candidate.id===value);if(artifact)setSelectedArtifactId(artifact.id);}} role="tablist" overflow="scroll">{artifacts.map((artifact)=><Tab key={artifact.id} value={artifact.id} label={artifact.role}/>)}</TabList>:null}
        {contentQuery.isPending?<WorkbenchState kind="loading" title="Loading result material…"/>:
         contentQuery.isError?<WorkbenchState kind="error" title="Result material unavailable" description={contentQuery.error instanceof Error?contentQuery.error.message:String(contentQuery.error)}/>:
         contentQuery.data?(()=>{const content=decode(contentQuery.data);return content.kind==="MARKDOWN"?<div className="order-markdown-readonly"><Markdown contentWidth="52rem" contentAlign="start">{content.value}</Markdown></div>:<div className="order-code-view"><CodeBlock code={content.value} language="plaintext" hasCopyButton width="100%"/></div>;})():null}
       </>}
    </section>:null}
  </div>;
  return <div data-testid="result-workspace"><WorkbenchSurface attention={attention} material={material}/></div>;
};
