import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Selector } from "@astryxdesign/core/Selector";
import { MultiSelector } from "@astryxdesign/core/MultiSelector";
import { RadioList, RadioListItem } from "@astryxdesign/core/RadioList";
import type { Approval, ArtifactRef, CandidateReviewEvent, RunEvent, WorkItem } from "../../src/core/contracts.ts";
import { candidateFindingActionIsAdmitted, candidateFindingDispositions, candidateMemberActionIsAdmitted, candidateEvidenceLineage,
  candidateSubmitIsAdmitted, deriveAcceptanceDecision, reconstructCandidateRounds } from "../../src/core/lifecycle.ts";
import * as api from "./http.ts";
import { invalidateWorkbenchMutation, workbenchQueryKeys } from "./query-keys.ts";
import { eventEvidence, lifecycleArtifactLabel, type EvidenceSelection, type WorkflowMaterial } from "./workbench-presentation.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchConfirmation } from "./primitives/WorkbenchConfirmation.tsx";
import { WorkbenchFacts } from "./primitives/WorkbenchFacts.tsx";
import { WorkbenchNotice } from "./primitives/WorkbenchNotice.tsx";
import { WorkbenchResourceList } from "./primitives/WorkbenchResourceList.tsx";
import { WorkbenchReview, type WorkbenchReviewProps } from "./primitives/WorkbenchReview.tsx";
import { WorkbenchStatus } from "./primitives/WorkbenchStatus.tsx";
import { WorkbenchTaskPanel } from "./primitives/WorkbenchTaskPanel.tsx";

type Material = Extract<WorkflowMaterial, {kind:"ACCEPTANCE_REVIEW"}>;
type FormAction = "REPORT"|"SUBMIT"|"RETEST"|"WITHDRAW"|"RETURN"|"ACCEPT"|"COPY";
const reportEntries = (events: readonly CandidateReviewEvent[]) => events.flatMap(entry =>
  entry.event.tag === "REPORT" ? [{...entry, event:entry.event}] : []);
const roundEntries = (events: readonly CandidateReviewEvent[]) => events.flatMap(entry =>
  entry.event.tag === "OPENED" || entry.event.tag === "REVIEW_COMPLETED" ? [{...entry,event:entry.event}] : []);
const formTitles: Record<FormAction,string> = {
  REPORT:"Report finding",SUBMIT:"Submit findings",RETEST:"Record retest",WITHDRAW:"Withdraw finding",
  RETURN:"Return to planning",ACCEPT:"Accept candidate",COPY:"Prepare test copy",
};

export const AcceptanceWorkspace = ({workItem,material,approvals,histories,historyPending,historyError,input,decision,
  signedArtifacts,onSelectMaterial,onReturnCurrent,onOpenEvidence}:Readonly<{
  workItem:WorkItem; material:Material; approvals:readonly Approval[]; histories:readonly CandidateReviewEvent[];
  historyPending:boolean; historyError:unknown; input:Parameters<typeof deriveAcceptanceDecision>[0];
  decision:ReturnType<typeof deriveAcceptanceDecision>; signedArtifacts:readonly ArtifactRef[];
  onSelectMaterial:(material:Material)=>void; onReturnCurrent:()=>void; onOpenEvidence:(selection:EvidenceSelection)=>void;
}>) => {
  const queryClient=useQueryClient();
  const approval = material.approvalId === undefined
    ? (input.approval !== null && histories.some(entry=>entry.approvalId===input.approval?.id) ? input.approval :
      approvals.findLast(value=>histories.some(entry=>entry.approvalId===value.id)) ?? null)
    : approvals.find(value=>value.id===material.approvalId) ?? null;
  const history=histories.filter(entry=>entry.approvalId===approval?.id);
  const roundHistory=roundEntries(history);
  const latest=roundHistory.at(-1);
  const round=material.roundId===undefined?latest:roundHistory.find(entry=>entry.id===material.roundId);
  const current=input.current && approval!==null && approval.id===input.approval?.id && round!==undefined && round.id===latest?.id && material.roundId===undefined;
  const nextRound=round===undefined?undefined:roundHistory.find(entry=>entry.sequence>round.sequence);
  const visibleHistory=round===undefined?[]:nextRound===undefined?history:history.filter(entry=>entry.sequence<nextRound.sequence);
  const selectedFinding=material.findingId??null;
  const setSelectedFinding=(id:string|null)=>onSelectMaterial({...material,findingId:id??undefined});
  const [form,setForm]=useState<Readonly<{action:FormAction;approvalId:string;roundId:string;sequence:number;hash:string;decision:typeof decision}>|null>(null);
  const [taskId,setTaskId]=useState("");
  const [findingIds,setFindingIds]=useState<string[]>([]);
  const [criteria,setCriteria]=useState<string[]>([]);
  const [evidenceIds,setEvidenceIds]=useState<string[]>([]);
  const [followup,setFollowup]=useState("");
  const [actor,setActor]=useState("");
  const [expected,setExpected]=useState("");
  const [observed,setObserved]=useState("");
  const [reproduction,setReproduction]=useState("");
  const [impact,setImpact]=useState("");
  const [rationale,setRationale]=useState("");
  const [outcome,setOutcome]=useState("");
  const [confirmed,setConfirmed]=useState("");
  const [feedback,setFeedback]=useState<string|null>(null);
  const [copyPath,setCopyPath]=useState<string|null>(null);
  const [pending,setPending]=useState(false);
  const [confirmRecovery,setConfirmRecovery]=useState<Readonly<{decision:typeof decision;approvalId:string;sequence:number}>|null>(null);
  const artifactsQuery=useQuery({
    queryKey:workbenchQueryKeys.approvalArtifacts(workItem.id,approval?.id??null),
    queryFn:()=>{if(approval===null)throw new TypeError("Approval identity required");return api.listApprovalArtifacts(workItem.id,approval.id);},
    enabled:approval!==null,retry:false,
  });
  const artifacts=approval?.id===input.approval?.id?signedArtifacts:artifactsQuery.data??[];
  const followupsQuery=useQuery({queryKey:workbenchQueryKeys.workItems,queryFn:api.listWorkItems,enabled:form?.action==="WITHDRAW"});
  const tasks=input.tasks.filter(task=>task.approvalId===approval?.id);
  let members:readonly (readonly [string,string])[]=[];
  let dispositions:ReturnType<typeof candidateFindingDispositions>=new Map();
  let observationError=false;
  if(approval!==null&&round!==undefined) {
    try {
      const rounds=reconstructCandidateRounds(approval,input.tasks,input.runs,input.runEvents,history);
      members=rounds.get(round.id)??[];
      dispositions=candidateFindingDispositions(visibleHistory,rounds,input.tasks,input.runs,input.runEvents);
    } catch { observationError=true; }
  }
  const memberFor=(id:string)=>input.runEvents.find(event=>event.id===members.find(member=>member[0]===id)?.[1]);
  const actionAllowed=(action:"REPORT"|"PREPARE_TEST_COPY",id:string)=> {
    const member=memberFor(id);
    try{return member!==undefined&&candidateMemberActionIsAdmitted(input,current,action,id,member.id);}catch{return false;}
  };
  const findingAllowed=(action:"WITHDRAW"|"RETEST",id:string)=>{
    try{return candidateFindingActionIsAdmitted(input,current,action,id);}catch{return false;}
  };
  const reports=reportEntries(visibleHistory);
  const report=reports.find(entry=>entry.id===selectedFinding);
  const chosenTask=tasks.find(task=>task.id===taskId);
  const chosenReport=reports.find(entry=>entry.id===findingIds[0]);
  const evidenceOptions=(id:string)=>{
    const member=memberFor(id);
    if(member===undefined)return [];
    try {
      const lineage=candidateEvidenceLineage(member,input.runs,input.runEvents);
      return input.runEvents.filter(event=>lineage.has(event.runId)&&eventEvidence(event).length>0)
        .map(event=>({value:event.id,label:eventEvidence(event).map(ref=>ref.relativePath).join(", ")}));
    } catch {return [];}
  };
  const sequence=history.at(-1)?.sequence??0;
  const open=(action:FormAction,memberTask="",finding="")=>{
    if(!current||approval===null||round===undefined)return;
    setForm({action,approvalId:approval.id,roundId:round.id,sequence,hash:round.event.candidateHash,decision});
    setTaskId(memberTask);setFindingIds(finding?[finding]:[]);setCriteria([]);setEvidenceIds([]);setFollowup("");setActor("");setExpected("");setObserved("");
    setReproduction("");setImpact("");setRationale("");setOutcome("");setConfirmed("");setFeedback(null);setCopyPath(null);
  };
  const stable=form!==null&&current&&form.approvalId===approval?.id&&form.roundId===round?.id&&form.sequence===sequence&&form.decision.tag===decision.tag&&input.coherent&&!pending;
  const eligibleReports=reports.filter(entry=>decision.tag==="SUBMIT_FINDINGS"&&decision.findingIds.includes(entry.id));
  let submitEligible=false;
  try {submitEligible=candidateSubmitIsAdmitted(input,current,findingIds);} catch {/* fail closed */}
  const nonempty=(...values:string[])=>values.every(value=>value.trim().length>0);
  const valid=stable&&form!==null&&(form.action==="COPY"?actionAllowed("PREPARE_TEST_COPY",taskId):nonempty(actor)&&(
    form.action==="REPORT"?actionAllowed("REPORT",taskId)&&nonempty(expected,observed,reproduction,impact):
    form.action==="SUBMIT"?submitEligible:
    form.action==="RETEST"?findingIds.length===1&&findingAllowed("RETEST",findingIds[0]!)&&nonempty(rationale)&&(outcome==="RESOLVED"||outcome==="FAILED"&&nonempty(observed)):
    form.action==="WITHDRAW"?findingIds.length===1&&findingAllowed("WITHDRAW",findingIds[0]!)&&nonempty(rationale)&&confirmed==="yes":
    form.action==="RETURN"?nonempty(rationale)&&(decision.tag==="REANALYSE_NO_OP"||decision.tag==="REANALYSE_PROOF_UNAVAILABLE"):
    decision.tag==="ACCEPT"&&confirmed==="yes"));
  const submit=async()=>{
    if(!valid||form===null||approval===null)return;
    setPending(true);setFeedback(null);
    const base={expectedCandidateHash:form.hash,expectedReviewSequence:form.sequence};
    const human={...base,actor};
    try {
      switch(form.action){
        case "REPORT": await api.reportCandidateFinding(workItem.id,approval.id,{...human,taskId,candidateEventId:memberFor(taskId)!.id,acceptanceRefs:criteria,expected,observed,reproduction,impact,evidence:evidenceIds});break;
        case "SUBMIT": await api.submitCandidateFindings(workItem.id,approval.id,{...human,findingIds});break;
        case "RETEST": if(outcome==="RESOLVED")await api.recordCandidateDisposition(workItem.id,approval.id,{...human,findingId:findingIds[0]!,outcome:"RESOLVED",rationale,followupWorkItemId:null,withdrawalAttestation:null});
          else await api.recordCandidateRetestFailure(workItem.id,approval.id,{...human,findingId:findingIds[0]!,observed,rationale,evidence:evidenceIds});break;
        case "WITHDRAW": await api.recordCandidateDisposition(workItem.id,approval.id,{...human,findingId:findingIds[0]!,outcome:"WITHDRAWN",rationale,followupWorkItemId:followup||null,withdrawalAttestation:"NOT_A_KNOWN_UNMET_OBLIGATION"});break;
        case "RETURN": if(form.decision.tag==="REANALYSE_NO_OP")await api.requestCandidateReanalysis(workItem.id,approval.id,{...human,reason:"NO_OP_CHALLENGE",owner:"PLAN",findingIds:form.decision.findingIds,rationale});
          else await api.requestCandidateReanalysis(workItem.id,approval.id,{...human,expectedCandidateHash:null,reason:"CANDIDATE_PROOF_UNAVAILABLE",owner:"PLAN",findingIds:[],rationale});break;
        case "ACCEPT": await api.acceptCandidate(workItem.id,approval.id,human);break;
        case "COPY": setCopyPath(await api.prepareCandidateTestCopy(workItem.id,approval.id,{...base,taskId,candidateEventId:memberFor(taskId)!.id}));return;
      }
      setForm(null); await invalidateWorkbenchMutation(queryClient,workItem.id);
    } catch {setFeedback("The decision could not be recorded. Refresh current evidence before retrying.");await invalidateWorkbenchMutation(queryClient,workItem.id);}
    finally {setPending(false);}
  };
  const recover=async()=>{
    if(confirmRecovery===null||pending||!current||approval===null||confirmRecovery.approvalId!==approval.id||confirmRecovery.sequence!==sequence||confirmRecovery.decision.tag!==decision.tag)return;
    setPending(true);
    try{
      if(confirmRecovery.decision.tag==="RECONCILE_SOURCE")await api.reconcileAcceptanceSource(workItem.id,approval.id,sequence);
      else if(confirmRecovery.decision.tag==="RECONCILE_AUTHORITY"&&decision.tag==="RECONCILE_AUTHORITY"&&confirmRecovery.decision.owner===decision.owner)
        await api.reconcileWorkItemAuthority(workItem.id,{expectedApprovalId:approval.id,expectedReviewSequence:sequence,expectedOwner:decision.owner});
      setConfirmRecovery(null);await invalidateWorkbenchMutation(queryClient,workItem.id);
    }catch{setFeedback("Authority reconciliation was rejected. Reinspect current authority.");await invalidateWorkbenchMutation(queryClient,workItem.id);}
    finally{setPending(false);}
  };
  const evidenceActions=(events:readonly RunEvent[])=>events.flatMap(event=>eventEvidence(event).map(ref=>({
    id:event.id+":"+ref.relativePath,label:ref.relativePath,detail:ref.mediaType,
    action:<WorkbenchAction label="View evidence" onClick={()=>onOpenEvidence({kind:"EVIDENCE",runId:event.runId,relativePath:ref.relativePath})}/>
  })));
  const findingDetails=(entry:ReturnType<typeof reportEntries>[number],inspect=true)=>{
    const retest=visibleHistory.findLast(value=>value.event.tag==="RETEST_FAILED"&&value.event.findingId===entry.id);
    const disposition=visibleHistory.findLast(value=>value.event.tag==="DISPOSITION"&&value.event.findingId===entry.id);
    const completed=visibleHistory.findLast(value=>{
      const event=value.event;
      return event.tag==="REVIEW_COMPLETED"&&visibleHistory.some(sub=>sub.id===event.submissionId&&sub.event.tag==="SUBMIT"&&sub.event.findingIds.includes(entry.id));
    });
    const completedId=completed?.event.tag==="REVIEW_COMPLETED"?completed.event.candidateEventId:null;
    const completedMember=input.runEvents.find(value=>value.id===completedId);
    const review=completedMember===undefined?undefined:input.runEvents.find(value=>value.runId===completedMember.runId&&value.event.tag==="REVIEW_PASSED");
    const assessment=review?.event.tag==="REVIEW_PASSED"?review.event.qaAssessments?.find(value=>value.findingId===entry.id):undefined;
    return <>
      <WorkbenchFacts items={[
        {id:"expected",label:"Expected behavior",value:entry.event.expected},
        {id:"observed",label:"Observed behavior",value:entry.event.observed},
        {id:"reproduction",label:"Reproduction",value:entry.event.reproduction},
        {id:"impact",label:"Impact",value:entry.event.impact},
        {id:"criteria",label:"Linked criteria",value:entry.event.acceptanceRefs.join(", ")||"Not classified"},
        {id:"assessment",label:completedMember!==undefined&&completedMember.id===memberFor(entry.event.taskId)?.id?"Independent assessment":"Historical assessment",
          value:assessment===undefined?"No finding-specific assessment recorded.":assessment.verdict==="SATISFIED"?"Satisfied":assessment.verdict==="NOT_REPRODUCED"?"Not reproduced":assessment.verdict==="UPSTREAM"?"Upstream authority":"Repair required"},
        ...(assessment===undefined?[]:[{id:"assessment-rationale",label:"Assessment rationale",value:assessment.rationale}]),
        ...(retest?.event.tag==="RETEST_FAILED"?[{id:"retest-observed",label:"Retest observation",value:retest.event.observed},{id:"retest-rationale",label:"Retest rationale",value:retest.event.rationale}]:[]),
        ...(disposition?.event.tag==="DISPOSITION"?[{id:"disposition",label:dispositions.get(entry.id)==="DISPOSED"?"Human disposition":"Prior human disposition",value:(disposition.event.outcome==="RESOLVED"?"Resolved":"Withdrawn")+" · "+disposition.actor+" · "+new Date(disposition.occurredAt).toLocaleString()},{id:"disposition-rationale",label:"Disposition rationale",value:disposition.event.rationale}]:[]),
      ]}/>
      {inspect?<WorkbenchResourceList items={evidenceActions(input.runEvents.filter(event=>entry.event.evidence.includes(event.id)||(retest?.event.tag==="RETEST_FAILED"&&retest.event.evidence.includes(event.id))))}/>:null}
      {inspect&&assessment!==undefined&&review!==undefined?<WorkbenchResourceList items={assessment.evidence.map(ref=>({id:review.id+":"+ref.relativePath,label:"Independent assessment evidence",action:<WorkbenchAction label="View evidence" onClick={()=>onOpenEvidence({kind:"EVIDENCE",runId:review.runId,relativePath:ref.relativePath})}/> }))}/>:null}
    </>;
  };
  const verdict:WorkbenchReviewProps["verdict"]=(()=>{
    if(historyPending)return {label:"Loading current review",tone:"info",description:"Please wait."};
    if(historyError!=null||feedback!==null&&form===null)return {label:"Review could not be updated",tone:"danger",description:"Reinspect current evidence."};
    if(!current)return {label:history.some(entry=>entry.event.tag==="ACCEPT")?"Accepted candidate":workItem.stage==="EXECUTION"?"Correction in progress":"Historical review",tone:"neutral",currentness:"Read-only"};
    switch(decision.tag){
      case "ACCEPT":return {label:"Verified candidate",tone:"success",description:"Awaiting human review."};
      case "SUBMIT_FINDINGS":return {label:"Findings open",tone:"warning",description:"Action required."};
      case "RETEST":return {label:"Ready for retest",tone:"warning",description:"Action required."};
      case "QUEUED":return {label:"Correction queued",tone:"info",description:"Processing."};
      case "REANALYSE_NO_OP":return {label:"No-change task challenged",tone:"warning",description:"Return to planning."};
      case "REANALYSE_PROOF_UNAVAILABLE":return {label:"Candidate proof unavailable",tone:"danger",description:"Blocked."};
      case "RECONCILE_SOURCE":case "RECONCILE_AUTHORITY":return {label:"Authority changed",tone:"warning",description:"Reconciliation required."};
      default:return {label:observationError?"Candidate proof unavailable":"Loading current review",tone:observationError?"danger":"info",description:"No decision is admitted until current proof is available."};
    }
  })();
  const primaryAction=()=>{
    if(!current)return <WorkbenchAction label={workItem.stage==="COMPLETE"?"View final result":workItem.stage==="AWAITING_ACCEPTANCE"?"Return to current review":"Return to current step"} tone="primary" onClick={onReturnCurrent}/>;
    switch(decision.tag){
      case "ACCEPT":return <WorkbenchAction label="Accept candidate" tone="primary" onClick={()=>open("ACCEPT")}/>;
      case "SUBMIT_FINDINGS":return <WorkbenchAction label="Submit findings" tone="primary" onClick={()=>open("SUBMIT")}/>;
      case "RETEST":return <WorkbenchAction label="Record retest" tone="primary" onClick={()=>open("RETEST")}/>;
      case "REANALYSE_NO_OP":case "REANALYSE_PROOF_UNAVAILABLE":return <WorkbenchAction label="Return to planning" tone="primary" onClick={()=>open("RETURN")}/>;
      case "RECONCILE_SOURCE":case "RECONCILE_AUTHORITY":return <WorkbenchAction label="Reconcile authority" tone="primary" onClick={()=>approval!==null&&setConfirmRecovery({decision,approvalId:approval.id,sequence})}/>;
      default:return null;
    }
  };
  const field=(label:string,value:string,set:(value:string)=>void)=><TextInput label={label} value={value} onChange={set} isRequired width="100%"/>;
  const choice=(label:string,value:string,set:(value:string)=>void,options:readonly {value:string;label:string}[])=><Selector label={label} value={value} onChange={set} options={[...options]} isRequired width="100%"/>;
  const affirmation=(label:string)=><RadioList label={label} value={confirmed} onChange={setConfirmed} isRequired><RadioListItem value="yes" label="I confirm"/></RadioList>;
  const taskOptions=tasks.filter(task=>form?.action==="REPORT"?actionAllowed("REPORT",task.id):eligibleReports.some(entry=>entry.event.taskId===task.id)).map(task=>({value:task.id,label:task.objective}));
  const formBody=form===null?null:copyPath!==null?<WorkbenchFacts items={[{id:"copy",label:"Local checkout path",value:copyPath}]}/>:<>
    {form.action==="REPORT"||form.action==="SUBMIT"?choice("Task",taskId,value=>{setTaskId(value);setFindingIds([]);setCriteria([]);setEvidenceIds([]);},taskOptions):null}
    {form.action==="REPORT"?<>
      <MultiSelector label="Acceptance criteria" options={[...(chosenTask?.acceptanceRefs??[])]} value={criteria} onChange={setCriteria} width="100%"/>
      {field("Expected behavior",expected,setExpected)}{field("Observed behavior",observed,setObserved)}
      {field("Reproduction",reproduction,setReproduction)}{field("Impact",impact,setImpact)}
      <MultiSelector label="Supporting evidence" options={evidenceOptions(taskId)} value={evidenceIds} onChange={setEvidenceIds} width="100%"/>
    </>:null}
    {form.action==="SUBMIT"?<MultiSelector label="Findings" options={eligibleReports.filter(entry=>entry.event.taskId===taskId).map(entry=>({value:entry.id,label:entry.event.observed}))} value={findingIds} onChange={setFindingIds} width="100%"/>:null}
    {form.action==="RETEST"?<>
      {choice("Finding",findingIds[0]??"",id=>{setFindingIds([id]);setEvidenceIds([]);},reports.filter(entry=>findingAllowed("RETEST",entry.id)).map(entry=>({value:entry.id,label:entry.event.observed})))}
      {chosenReport?findingDetails(chosenReport,false):null}
      <RadioList label="Retest outcome" value={outcome} onChange={setOutcome} isRequired><RadioListItem value="RESOLVED" label="Correction confirmed"/><RadioListItem value="FAILED" label="Defect still present"/></RadioList>
      {outcome==="FAILED"?field("Observed behavior",observed,setObserved):null}
    </>:null}
    {form.action==="RETEST"||form.action==="WITHDRAW"||form.action==="RETURN"?field("Rationale",rationale,setRationale):null}
    {form.action==="RETEST"&&outcome==="FAILED"?<MultiSelector label="Supporting evidence" options={evidenceOptions(chosenReport?.event.taskId??"")} value={evidenceIds} onChange={setEvidenceIds} width="100%"/>:null}
    {form.action==="WITHDRAW"&&chosenReport?findingDetails(chosenReport,false):null}
    {form.action==="WITHDRAW"?<>{affirmation("This is not a known unmet signed obligation")}<Selector label="Follow-up WorkItem" value={followup} onChange={setFollowup} options={[{value:"",label:"None"},...(followupsQuery.data??[]).filter(item=>item.projectId===workItem.projectId&&item.id!==workItem.id).map(item=>({value:item.id,label:item.title}))]} width="100%"/></>:null}
    {form.action==="ACCEPT"?<><WorkbenchResourceList items={tasks.map(task=>({id:task.id,label:task.objective}))}/>{affirmation("No known unmet signed obligations")}</>:null}
    {form.action==="COPY"?<p>Prepare an isolated local copy of the selected candidate. No delivery or overwrite is performed.</p>:field("Your name",actor,setActor)}
  </>;
  return <>
    <WorkbenchReview title="Acceptance" description="Review the exact verified candidate before human acceptance." verdict={verdict} sections={[
      {id:"criteria",title:"Acceptance criteria",content:<>{tasks.map(task=><WorkbenchResourceList key={task.id} label={task.objective}
        items={task.acceptanceRefs.map(ref=>({id:ref,label:ref,detail:current&&input.currentProof!==null?"Member proof available":"Historical criterion reference"}))}
        empty={<p>No signed criterion references.</p>}/>)}</>},
      {id:"candidate",title:"Candidate and evidence",content:<>
        {observationError?<WorkbenchNotice tone="warning" title="Exact member evidence unavailable"/>:null}
        <WorkbenchResourceList items={tasks.flatMap(task=>{
          const member=memberFor(task.id);if(member===undefined)return [];
          const state=member.event.tag==="CANDIDATE_RECORDED"?input.runEvents.find(event=>event.id===(member.event.tag==="CANDIDATE_RECORDED"?member.event.candidateStateEventId:"")):undefined;
          return [{id:task.id,label:task.objective,detail:member.event.tag==="TASK_ALREADY_SATISFIED"?"No change required":"Verified candidate",
            action:actionAllowed("PREPARE_TEST_COPY",task.id)?<WorkbenchAction label="Prepare test copy" onClick={()=>open("COPY",task.id)}/>:undefined},
            ...evidenceActions([member,...(state?[state]:[]),...input.runEvents.filter(event=>event.runId===member.runId&&event.event.tag.startsWith("VALIDATION_"))])];
        })}/>
        <WorkbenchResourceList items={artifacts.map(artifact=>({id:artifact.id,label:lifecycleArtifactLabel(artifact.role),detail:artifact.repositoryPath,
          action:<WorkbenchAction label="Open document" onClick={()=>onOpenEvidence({kind:"ARTIFACT",artifactId:artifact.id,label:"Signed document"})}/> }))}/>
      </>},
      {id:"findings",title:"QA findings",content:<>{report===undefined?<WorkbenchResourceList items={reports.map(entry=>({id:entry.id,label:entry.event.observed,detail:tasks.find(task=>task.id===entry.event.taskId)?.objective,
        meta:<WorkbenchStatus tone="neutral" label={dispositions.get(entry.id)==="DISPOSED"?"Disposed":dispositions.get(entry.id)==="RETEST_REQUIRED"?"Retest required":dispositions.get(entry.id)==="RETEST_FAILED"?"Retest failed":"Open"}/>,
        action:<WorkbenchAction label="Inspect finding" onClick={()=>setSelectedFinding(entry.id)}/> }))} empty={<p>No findings reported.</p>}/>:<>
        <WorkbenchAction label="Back to findings" onClick={()=>setSelectedFinding(null)}/>
        {findingDetails(report)}
        {findingAllowed("RETEST",report.id)?<WorkbenchAction label="Record retest" onClick={()=>open("RETEST","",report.id)}/>:null}
        {findingAllowed("WITHDRAW",report.id)?<WorkbenchAction label="Withdraw finding" onClick={()=>open("WITHDRAW","",report.id)}/>:null}
      </>}
      {tasks.some(task=>actionAllowed("REPORT",task.id))?<WorkbenchAction label="Report finding" onClick={()=>open("REPORT")}/>:null}</>},
      {id:"history",title:"Review history",content:<WorkbenchResourceList items={approvals.flatMap(value=>roundEntries(histories.filter(entry=>entry.approvalId===value.id)).map((entry,index)=>({id:entry.id,label:"Review round "+(index+1),detail:new Date(entry.occurredAt).toLocaleString(),action:<WorkbenchAction label="Inspect round" onClick={()=>{onSelectMaterial({kind:"ACCEPTANCE_REVIEW",approvalId:value.id,roundId:entry.id});}}/>})))} empty={<p>No correction rounds yet.</p>}/>}
    ]} decisions={primaryAction()}/>
    <WorkbenchTaskPanel open={form!==null} title={form===null?"Acceptance":formTitles[form.action]} onOpenChange={next=>{if(!next&&!pending)setForm(null);}}
      body={formBody} feedback={feedback!==null?<WorkbenchNotice tone="danger" title={feedback}/>:form!==null&&!stable&&copyPath===null?<WorkbenchNotice tone="warning" title="Review identity must remain current."/>:undefined}
      footer={<><WorkbenchAction label={copyPath!==null?"Close":"Cancel"} disabled={pending} onClick={()=>setForm(null)}/>{copyPath===null&&form!==null?<WorkbenchAction label={formTitles[form.action]} tone="primary" type="submit" disabled={!valid} loading={pending}/>:null}</>}
      onSubmit={event=>{event.preventDefault();void submit();}}/>
    <WorkbenchConfirmation kind="safety" open={confirmRecovery!==null} title="Reconcile authority"
      description={confirmRecovery?.decision.tag==="RECONCILE_AUTHORITY"?"Return to the exact stale authority owner.":"Return to Research to reconcile source authority."}
      confirmLabel="Reconcile authority" pending={pending} onConfirm={recover} onOpenChange={next=>{if(!next&&!pending)setConfirmRecovery(null);}}/>
  </>;
};
