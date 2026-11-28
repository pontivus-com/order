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
import { WorkbenchIcon } from "./primitives/WorkbenchIcon.tsx";
import { WorkbenchResourceList } from "./primitives/WorkbenchResourceList.tsx";
import { WorkbenchSection } from "./primitives/WorkbenchSection.tsx";
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
  stage==="R1" ? [] : stage==="R2" ? ["R1"] : stage==="DESIGN" ? ["R2","R1"] : ["DESIGN","R2","R1"];

export const PreSignoffStageWorkspace = ({
  workItem, stage, runs, runEvents, artifacts, material, materialState, materialStateForArtifact,
  documentAttention, historicalReturn, stateNotice, stateAction,
  currentRunId, currentInteraction, currentAttention, focusedRequiredInputEventId,
  mutationsDisabled=false, authoringMutationsDisabled=false, authoringBlockedReason, onRequiredInputFocused,
  onSelectMaterial, onDirtyChange, onOpenArtifactEvidence, onOpenEvidence,
  onOpenProposalReview, onOpenSupportingMaterial, onReturnFromTransient,
  onContextDocumentChange, onMutationRefresh, onMutationError,
}: Readonly<{
  workItem: WorkItem; stage: SharedPreSignoffStage; runs: readonly Run[];
  runEvents: readonly RunEvent[]; artifacts: readonly ArtifactRef[]; material: WorkflowMaterial;
  materialState: MaterialPresentationState | null;
  materialStateForArtifact: (artifact: ArtifactRef) => MaterialPresentationState | null;
  documentAttention?: ReactNode; historicalReturn?: ReactNode;
  stateNotice?: ReactNode; stateAction?: ReactNode;
  currentRunId: Run["id"] | null; currentInteraction: StageRunInteraction | null;
  currentAttention: CurrentAttentionTag; focusedRequiredInputEventId: RunEvent["id"] | null;
  mutationsDisabled?: boolean; authoringMutationsDisabled?: boolean;
  authoringBlockedReason?: string;
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
      statusLabel:(()=>{const state=materialStateForArtifact(artifact); return state===null ? undefined : materialPresentationStateLabel(state);})(),
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
    <WorkbenchSection
      title="Related material"
      content={
        <WorkbenchResourceList
          items={supportingResources.map((item)=>({
            id: item.id,
            label: item.label,
            detail: [item.description,item.statusLabel].filter(Boolean).join(" · ") || undefined,
            action: (
              <WorkbenchAction
                label={"View "+item.label}
                icon={<WorkbenchIcon name={item.id.startsWith("run-") ? "dialogue" : "document"} />}
                tone="secondary"
                onClick={item.onSelect}
              />
            ),
          }))}
        />
      }
    />
  );

  const researchMaterial=stage==="R1" && stageArtifact!==null ? (
    <WorkbenchSection
      title="Research document"
      description={
        materialState===null
          ? "Current governed Research material"
          : materialPresentationStateLabel(materialState)
      }
      action={
        <WorkbenchAction
          label="View Research document"
          icon={<WorkbenchIcon name="document" />}
          tone="secondary"
          onClick={()=>onSelectMaterial({kind:"STAGE_DOCUMENT",artifactId:stageArtifact.id})}
        />
      }
      content={null}
    />
  ) : undefined;

  const dialogueSupport =
    researchMaterial === undefined && supportingMaterial === undefined ? undefined : (
      <>
        {researchMaterial}
        {supportingMaterial}
      </>
    );

  const primary=(()=>{
    switch(material.kind){
      case "STAGE_RUN": return <StageRunMaterial stage={stage} runs={runs} runEvents={runEvents}
        companion={dialogueSupport} selectedRunId={material.runId}
        currentRunId={workItem.stage===stage ? currentRunId : null}
        currentInteraction={workItem.stage===stage ? currentInteraction : null}
        currentAttention={currentAttention} focusedRequiredInputEventId={focusedRequiredInputEventId}
        stateNotice={stateNotice} stateAction={stateAction}
        mutationsDisabled={mutationsDisabled} onRequiredInputFocused={onRequiredInputFocused}
        onSelectedRunChange={(runId)=>onSelectMaterial({kind:"STAGE_RUN",runId})}
        onOpenEvidence={onOpenEvidence} onOpenProposalReview={onOpenProposalReview}
        onMutationRefresh={onMutationRefresh} onMutationError={onMutationError} />;
      case "STAGE_DOCUMENT": {
        const artifact = artifacts.find((candidate) => candidate.id === material.artifactId);
        const state = artifact === undefined ? null : materialStateForArtifact(artifact);
        return <LifecycleDocumentMaterial workItem={workItem} artifactId={material.artifactId}
          materialState={state} historicalArtifact={state?.tag === "HISTORICAL" || state?.tag === "SIGNED_LOCKED" ? artifact : undefined}
          mutationsDisabled={authoringMutationsDisabled} authoringBlockedReason={authoringBlockedReason}
          onDirtyChange={onDirtyChange} onOpenArtifactEvidence={onOpenArtifactEvidence}
          onContextDocumentChange={onContextDocumentChange} onMutationError={onMutationError} />;
      }
      case "SOURCE_DOCUMENT": return <SourceDocumentMaterial workItem={workItem} readOnly
        onDirtyChange={onDirtyChange} onContextDocumentChange={onContextDocumentChange} />;
      case "SUPPORTING_DOCUMENT": {
        const artifact = artifacts.find((candidate) => candidate.id === material.artifactId);
        const state = artifact === undefined ? null : materialStateForArtifact(artifact);
        return <ReadOnlyLifecycleDocumentMaterial workItem={workItem}
          artifactId={material.artifactId} materialState={state}
          historicalArtifact={state?.tag === "HISTORICAL" || state?.tag === "SIGNED_LOCKED" ? artifact : undefined}
          onOpenArtifactEvidence={onOpenArtifactEvidence} onContextDocumentChange={onContextDocumentChange} />;
      }
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

  const inspectingSupportingDocument =
    material.kind === "SOURCE_DOCUMENT" || material.kind === "SUPPORTING_DOCUMENT";
  return <section className="order-productive-stage" data-stage={stage}>
    {historicalReturn === undefined && !inspectingSupportingDocument ? null : (
      <div className="order-productive-navigation">
        {inspectingSupportingDocument ? (
          <WorkbenchAction label="Back to workflow context" icon={<WorkbenchIcon name="back" />}
            tone="ghost" onClick={onReturnFromTransient} />
        ) : null}
        {historicalReturn}
      </div>
    )}
    {material.kind === "STAGE_DOCUMENT" && historicalReturn === undefined ? documentAttention : null}
    <div className="order-productive-primary">
      {primary}
      {material.kind === "STAGE_RUN" ? null : supportingMaterial}
    </div>
  </section>;
};
