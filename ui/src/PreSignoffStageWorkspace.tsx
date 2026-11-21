import type { ReactNode } from "react";
import type { ArtifactRef, Run, RunEvent, Sha256, WorkItem } from "../../src/core/contracts.ts";
import type {
  CurrentAttentionTag, MaterialPresentationState, StageRunInteraction,
} from "../../src/core/lifecycle.ts";
import { StageRunMaterial } from "./ActivityWorkspace.tsx";
import {
  LifecycleDocumentMaterial, ReadOnlyLifecycleDocumentMaterial, SourceDocumentMaterial,
} from "./DocumentWorkspace.tsx";
import { EvidenceViewer } from "./EvidenceViewer.tsx";
import { ProposalReview } from "./ProposalReview.tsx";
import {
  lifecycleArtifactLabel, materialPresentationStateLabel, runStatusLabel,
  type EvidenceSelection, type ProposalSelection, type WorkflowMaterial,
} from "./workbench-presentation.ts";
import { PrimaryMaterialFrame, WorkflowStepFrame } from "./WorkflowStepFrame.tsx";
import {
  WorkflowMaterialSelector, type WorkflowMaterialSelectorGroup,
} from "./WorkflowMaterialSelector.tsx";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchDisclosure } from "./primitives/WorkbenchDisclosure.tsx";
import { WorkbenchResourceRow } from "./primitives/WorkbenchResourceRow.tsx";
import { WorkbenchState } from "./primitives/WorkbenchState.tsx";

export type SharedPreSignoffStage = "R1" | "R2" | "DESIGN" | "PLAN";

const documentLabel=(stage: SharedPreSignoffStage): string =>
  stage==="R1" ? "Research document" :
  stage==="R2" ? "Requirements document" :
  stage==="DESIGN" ? "Solution design document" : "Implementation plan document";
const supportingRoles=(stage: SharedPreSignoffStage): readonly ArtifactRef["role"][] =>
  stage==="R1" ? [] : stage==="R2" ? ["R1"] : stage==="DESIGN" ? ["R2","R1"] : ["DESIGN","R2"];

export const PreSignoffStageWorkspace = ({
  workItem, stage, runs, runEvents, artifacts, material, materialState, summary,
  currentRunId, currentInteraction, currentAttention, focusedRequiredInputEventId,
  mutationsDisabled=false, authoringMutationsDisabled=false, onRequiredInputFocused,
  onSelectMaterial, onDirtyChange, onOpenArtifactEvidence, onOpenEvidence,
  onOpenProposalReview, onOpenSupportingMaterial, onReturnFromTransient,
  onContextDocumentChange, onMutationRefresh, onMutationError,
}: Readonly<{
  workItem: WorkItem; stage: SharedPreSignoffStage; runs: readonly Run[];
  runEvents: readonly RunEvent[]; artifacts: readonly ArtifactRef[]; material: WorkflowMaterial;
  materialState: MaterialPresentationState | null; summary: ReactNode;
  currentRunId: Run["id"] | null; currentInteraction: StageRunInteraction | null;
  currentAttention: CurrentAttentionTag; focusedRequiredInputEventId: RunEvent["id"] | null;
  mutationsDisabled?: boolean; authoringMutationsDisabled?: boolean;
  onRequiredInputFocused: (eventId: RunEvent["id"]) => void;
  onSelectMaterial: (material: WorkflowMaterial) => void; onDirtyChange: (dirty:boolean)=>void;
  onOpenArtifactEvidence:(artifactId:ArtifactRef["id"])=>void;
  onOpenEvidence:(selection:EvidenceSelection)=>void;
  onOpenProposalReview:(selection:ProposalSelection)=>void;
  onOpenSupportingMaterial:(material:WorkflowMaterial)=>void; onReturnFromTransient:()=>void;
  onContextDocumentChange:(path:string|null,sha256:Sha256|null)=>void;
  onMutationRefresh:(acceptedEvent?:RunEvent)=>Promise<void>;
  onMutationError?:(error:unknown)=>void;
}>) => {
  const stageRuns=[...runs].filter((run)=>run.role==="STAGE" && run.stage===stage)
    .sort((a,b)=>b.attempt-a.attempt || b.startedAt.localeCompare(a.startedAt) || b.id.localeCompare(a.id));
  const stageArtifact=artifacts.find((artifact)=>artifact.role===stage) ?? null;
  const upstream=supportingRoles(stage).flatMap((role)=>{
    const artifact=artifacts.find((candidate)=>candidate.role===role);
    return artifact===undefined ? [] : [artifact];
  });

  const items: WorkflowMaterialSelectorGroup["items"]=[
    ...stageRuns.map((run)=>({
      id:"run-"+run.id,label:"Attempt "+run.attempt,description:new Date(run.startedAt).toLocaleString(),
      statusLabel:runStatusLabel(run.status),selected:material.kind==="STAGE_RUN" && material.runId===run.id,
      onSelect:()=>onSelectMaterial({kind:"STAGE_RUN",runId:run.id}),
    })),
    ...(stageArtifact===null ? [] : [{
      id:"document-"+stageArtifact.id,label:documentLabel(stage),description:"Governed current-stage material",
      statusLabel:materialState===null ? undefined : materialPresentationStateLabel(materialState),
      selected:material.kind==="STAGE_DOCUMENT" && material.artifactId===stageArtifact.id,
      onSelect:()=>onSelectMaterial({kind:"STAGE_DOCUMENT",artifactId:stageArtifact.id}),
    }]),
  ];
  const selector=items.length===0 ? undefined : <WorkflowMaterialSelector
    groups={[{id:"current",label:"Current work",items}]} label="Current workflow material" />;

  const companion=stage==="R1" && stageArtifact!==null ? <section
    className="order-productive-research-context" aria-label="Research governed material">
    <strong>Repository-backed Research material</strong>
    <span>{materialState===null ? "Current governed Research material" : materialPresentationStateLabel(materialState)}</span>
    <code>{stageArtifact.repositoryPath}</code>
    <WorkbenchAction label="Open Research document" tone="secondary"
      onClick={()=>onSelectMaterial({kind:"STAGE_DOCUMENT",artifactId:stageArtifact.id})} />
  </section> : undefined;

  const supporting=<WorkbenchDisclosure label="Supporting material and history" content={
    <div className="order-productive-support-list">
      {stageRuns.map((run)=><WorkbenchResourceRow key={run.id} label={"Attempt "+run.attempt}
        detail={runStatusLabel(run.status)+" · "+new Date(run.startedAt).toLocaleString()}
        actionLabel={"Open attempt "+run.attempt}
        onOpen={()=>onSelectMaterial({kind:"STAGE_RUN",runId:run.id})} />)}
      {stageArtifact===null ? null : <WorkbenchResourceRow label={documentLabel(stage)}
        detail={materialState===null ? "Governed stage document" : materialPresentationStateLabel(materialState)}
        actionLabel="Open current stage document"
        onOpen={()=>onSelectMaterial({kind:"STAGE_DOCUMENT",artifactId:stageArtifact.id})} />}
      <WorkbenchResourceRow label="Work request" detail="Read-only source context" actionLabel="Open Work request"
        onOpen={()=>onOpenSupportingMaterial({kind:"SOURCE_DOCUMENT"})} />
      {upstream.map((artifact)=><WorkbenchResourceRow key={artifact.id}
        label={lifecycleArtifactLabel(artifact.role)+" document"} detail="Read-only upstream authority"
        actionLabel={"Open "+lifecycleArtifactLabel(artifact.role)}
        onOpen={()=>onOpenSupportingMaterial({kind:"SUPPORTING_DOCUMENT",artifactId:artifact.id})} />)}
    </div>} />;

  const primary=(()=>{
    switch(material.kind){
      case "STAGE_RUN": return <StageRunMaterial stage={stage} runs={runs} runEvents={runEvents}
        companion={companion} selectedRunId={material.runId}
        currentRunId={workItem.stage===stage ? currentRunId : null}
        currentInteraction={workItem.stage===stage ? currentInteraction : null}
        currentAttention={currentAttention} focusedRequiredInputEventId={focusedRequiredInputEventId}
        mutationsDisabled={mutationsDisabled} onRequiredInputFocused={onRequiredInputFocused}
        onSelectedRunChange={(runId)=>onSelectMaterial({kind:"STAGE_RUN",runId})}
        onOpenEvidence={onOpenEvidence} onOpenProposalReview={onOpenProposalReview}
        onMutationRefresh={onMutationRefresh} onMutationError={onMutationError} />;
      case "STAGE_DOCUMENT": return materialState?.tag==="DRAFT" || materialState?.tag==="HISTORICAL" ||
        materialState?.tag==="SIGNED_LOCKED"
        ? <ReadOnlyLifecycleDocumentMaterial workItem={workItem} artifactId={material.artifactId}
            onOpenArtifactEvidence={onOpenArtifactEvidence} onContextDocumentChange={onContextDocumentChange} />
        : <LifecycleDocumentMaterial workItem={workItem} artifactId={material.artifactId}
            mutationsDisabled={authoringMutationsDisabled} onDirtyChange={onDirtyChange}
            onOpenArtifactEvidence={onOpenArtifactEvidence} onContextDocumentChange={onContextDocumentChange}
            onMutationError={onMutationError} />;
      case "SOURCE_DOCUMENT": return <section className="order-productive-transient">
        <WorkbenchAction label="Back to workflow context" tone="ghost" onClick={onReturnFromTransient} />
        <SourceDocumentMaterial workItem={workItem} readOnly onDirtyChange={onDirtyChange}
          onContextDocumentChange={onContextDocumentChange} />
      </section>;
      case "SUPPORTING_DOCUMENT": return <section className="order-productive-transient">
        <WorkbenchAction label="Back to workflow context" tone="ghost" onClick={onReturnFromTransient} />
        <ReadOnlyLifecycleDocumentMaterial workItem={workItem} artifactId={material.artifactId}
          onOpenArtifactEvidence={onOpenArtifactEvidence} onContextDocumentChange={onContextDocumentChange} />
      </section>;
      case "PROPOSAL": return <ProposalReview workItem={workItem}
        selection={{runId:material.runId,eventId:material.eventId}}
        currentRunId={workItem.stage===stage ? currentRunId : null}
        currentInteraction={workItem.stage===stage ? currentInteraction : null}
        mutationsDisabled={mutationsDisabled} onBack={onReturnFromTransient} onMutationError={onMutationError} />;
      case "EVIDENCE": return <EvidenceViewer selection={material.selection} onBack={onReturnFromTransient} />;
      case "STEP_STATE": return <WorkbenchState kind="empty" title="This workflow step is ready"
        description="Use the current step action to start work." />;
      case "UNREACHED": return <WorkbenchState kind="empty" title="This workflow step has not been reached"
        description="Workflow inspection does not create or promote lifecycle state." />;
      default: return <WorkbenchState kind="empty" title="Selected material does not belong to this workflow step" />;
    }
  })();

  return <WorkflowStepFrame summary={summary} index={selector} indexLabel="Current workflow material"
    primary={<PrimaryMaterialFrame><section className="order-productive-stage" data-stage={stage}>
      <div className="order-productive-primary">{primary}</div>
      <div className="order-productive-supporting">{supporting}</div>
    </section></PrimaryMaterialFrame>} />;
};
