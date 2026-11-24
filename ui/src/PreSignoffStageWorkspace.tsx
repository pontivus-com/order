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
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchResourceRow } from "./primitives/WorkbenchResourceRow.tsx";
import { WorkbenchState } from "./primitives/WorkbenchState.tsx";

export type SharedPreSignoffStage = "R1" | "R2" | "DESIGN" | "PLAN";

type RelatedMaterialItem = Readonly<{
  id: string;
  label: string;
  description?: string;
  statusLabel?: string;
  selected: boolean;
  onSelect: () => void;
}>;

const documentLabel=(stage: SharedPreSignoffStage): string =>
  stage==="R1" ? "Research document" :
  stage==="R2" ? "Requirements document" :
  stage==="DESIGN" ? "Solution design document" : "Implementation plan document";
const supportingRoles=(stage: SharedPreSignoffStage): readonly ArtifactRef["role"][] =>
  stage==="R1" ? [] : stage==="R2" ? ["R1"] : stage==="DESIGN" ? ["R2","R1"] : ["DESIGN","R2"];

export const PreSignoffStageWorkspace = ({
  workItem, stage, runs, runEvents, artifacts, material, materialState,
  documentAttention, historicalReturn, stateNotice, stateAction,
  currentRunId, currentInteraction, currentAttention, focusedRequiredInputEventId,
  mutationsDisabled=false, authoringMutationsDisabled=false, onRequiredInputFocused,
  onSelectMaterial, onDirtyChange, onOpenArtifactEvidence, onOpenEvidence,
  onOpenProposalReview, onOpenSupportingMaterial, onReturnFromTransient,
  onContextDocumentChange, onMutationRefresh, onMutationError,
}: Readonly<{
  workItem: WorkItem; stage: SharedPreSignoffStage; runs: readonly Run[];
  runEvents: readonly RunEvent[]; artifacts: readonly ArtifactRef[]; material: WorkflowMaterial;
  materialState: MaterialPresentationState | null;
  documentAttention?: ReactNode; historicalReturn?: ReactNode;
  stateNotice?: ReactNode; stateAction?: ReactNode;
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

  const items: RelatedMaterialItem[]=[
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
    {
      id:"source",label:"Work request",description:"Read-only source context",
      selected:material.kind==="SOURCE_DOCUMENT",
      onSelect:()=>onOpenSupportingMaterial({kind:"SOURCE_DOCUMENT"}),
    },
    ...upstream.map((artifact)=>({
      id:"supporting-"+artifact.id,
      label:lifecycleArtifactLabel(artifact.role),
      description:"Read-only upstream authority",
      selected:material.kind==="SUPPORTING_DOCUMENT" && material.artifactId===artifact.id,
      onSelect:()=>onOpenSupportingMaterial({kind:"SUPPORTING_DOCUMENT",artifactId:artifact.id}),
    })),
  ];
  const supportingResources=items.filter((item)=>
    item.selected!==true &&
    !(
      stage==="R1" &&
      material.kind==="STAGE_RUN" &&
      stageArtifact!==null &&
      item.id==="document-"+stageArtifact.id
    )
  );
  const supportingMaterial=supportingResources.length===0 ? undefined : (
    <section className="order-productive-supporting" aria-label="Supporting workflow material">
      <div className="order-resource-list">
        {supportingResources.map((item)=>(
          <WorkbenchResourceRow
            key={item.id}
            label={item.label}
            detail={[item.description,item.statusLabel].filter(Boolean).join(" · ") || undefined}
            actionLabel={"Open "+item.label}
            onOpen={item.onSelect}
          />
        ))}
      </div>
    </section>
  );

  const researchMaterial=stage==="R1" && stageArtifact!==null ? <section
    className="order-productive-research-context" aria-label="Research governed material">
    <strong>Repository-backed Research material</strong>
    <span>{materialState===null ? "Current governed Research material" : materialPresentationStateLabel(materialState)}</span>
    <WorkbenchAction label="Open Research document" tone="secondary"
      onClick={()=>onSelectMaterial({kind:"STAGE_DOCUMENT",artifactId:stageArtifact.id})} />
  </section> : undefined;

  const dialogueSupport =
    researchMaterial === undefined && supportingMaterial === undefined ? undefined : (
      <div className="order-productive-dialogue-support">
        {researchMaterial}
        {supportingMaterial}
      </div>
    );

  const primary=(()=>{
    switch(material.kind){
      case "STAGE_RUN": return <>
        {documentAttention}
        <StageRunMaterial stage={stage} runs={runs} runEvents={runEvents}
          companion={dialogueSupport} selectedRunId={material.runId}
          currentRunId={workItem.stage===stage ? currentRunId : null}
          currentInteraction={workItem.stage===stage ? currentInteraction : null}
          currentAttention={currentAttention} focusedRequiredInputEventId={focusedRequiredInputEventId}
          mutationsDisabled={mutationsDisabled} onRequiredInputFocused={onRequiredInputFocused}
          onSelectedRunChange={(runId)=>onSelectMaterial({kind:"STAGE_RUN",runId})}
          onOpenEvidence={onOpenEvidence} onOpenProposalReview={onOpenProposalReview}
          onMutationRefresh={onMutationRefresh} onMutationError={onMutationError} />
      </>;
      case "STAGE_DOCUMENT": return <>
        {documentAttention}
        {materialState?.tag==="DRAFT" || materialState?.tag==="HISTORICAL" ||
          materialState?.tag==="SIGNED_LOCKED"
          ? <ReadOnlyLifecycleDocumentMaterial workItem={workItem} artifactId={material.artifactId}
              onOpenArtifactEvidence={onOpenArtifactEvidence} onContextDocumentChange={onContextDocumentChange} />
          : <LifecycleDocumentMaterial workItem={workItem} artifactId={material.artifactId}
              mutationsDisabled={authoringMutationsDisabled} onDirtyChange={onDirtyChange}
              onOpenArtifactEvidence={onOpenArtifactEvidence} onContextDocumentChange={onContextDocumentChange}
              onMutationError={onMutationError} />}
      </>;
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
        mutationsDisabled={mutationsDisabled}
        onBack={onReturnFromTransient} onMutationError={onMutationError} />;
      case "EVIDENCE": return <EvidenceViewer selection={material.selection} onBack={onReturnFromTransient} />;
      case "STEP_STATE": return <>
        {stateNotice}
        <WorkbenchState kind="empty" title="This workflow step is ready"
          description="Use the current step action to start work." action={stateAction} />
      </>;
      case "UNREACHED": return <WorkbenchState kind="empty" title="This workflow step has not been reached"
        description="Workflow inspection does not create or promote lifecycle state." />;
      default: return <WorkbenchState kind="empty" title="Selected material does not belong to this workflow step" />;
    }
  })();

  if (material.kind === "PROPOSAL") return primary;

  return <section className="order-productive-stage" data-stage={stage}>
    {historicalReturn === undefined ? null : (
      <div className="order-inline-actions">{historicalReturn}</div>
    )}
    <div className="order-productive-primary">
      {primary}
      {material.kind === "STAGE_RUN" ? null : supportingMaterial}
    </div>
  </section>;
};
