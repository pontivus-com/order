import type { QueryClient } from "@tanstack/react-query";
import type {
  ApprovalId,
  Approval,
  CandidateReviewEvent,
  WorkItem,
  AuthorityRef,
  ExecutionTaskId,
  Sha256,
  ArtifactRefId,
  EvidencePath,
  OpenCodeAccountLoginAttemptId,
  RunEventId,
  RunId,
  WorkItemId,
} from "../../src/core/contracts.ts";

export const workbenchQueryKeys = {
  workItems: ["workItems"] as const,
  projects: ["projects"] as const,
  workItemSchemas: ["workItemSchemas"] as const,
  workItemSourceDiagnostics: ["workItemSourceDiagnostics"] as const,
  settingsConfig: ["settings", "config"] as const,
  settingsReadiness: ["settings", "readiness"] as const,
  settingsRepositories: ["settings", "repositories"] as const,
  settingsModels: ["settings", "models"] as const,
  workItemSourceRoot: ["workItemSource"] as const,
  workItemDocumentationGitStatusRoot: ["workItemDocumentationGitStatus"] as const,
  openCodeAccountState: ["openCodeAccountState"] as const,
  lifecycleArtifactsRoot: ["lifecycleArtifacts"] as const,
  signoffPackageRoot: ["signoffPackage"] as const,
  currentApprovalRoot: ["currentApproval"] as const,
  approvalsRoot: ["approvals"] as const,
  runEventsRoot: ["runEvents"] as const,

  workItem: (workItemId: WorkItemId) =>
    ["workItem", workItemId] as const,
  workItemSource: (workItemId: WorkItemId) =>
    ["workItemSource", workItemId] as const,
  workItemDocumentationGitStatus: (workItemId: WorkItemId) =>
    ["workItemDocumentationGitStatus", workItemId] as const,
  workItemsIncludingArchived: ["workItems", "includeArchived"] as const,
  openCodeAccountLogin: (attemptId: OpenCodeAccountLoginAttemptId | null) =>
    ["openCodeAccountLogin", attemptId] as const,
  lifecycleArtifacts: (workItemId: WorkItemId) =>
    ["lifecycleArtifacts", workItemId] as const,
  signoffPackage: (workItemId: WorkItemId) =>
    ["signoffPackage", workItemId] as const,
  observedSignoffPackage: (workItemId: WorkItemId, packageHash: Sha256) =>
    ["observedSignoffPackage", workItemId, packageHash] as const,
  signoffPackageArtifacts: (workItemId: WorkItemId, packageHash: Sha256 | null) =>
    // Exact observed closure is independently keyed: invalidating the current
    // package must not refetch a previously observed hash before its replacement.
    ["signoffPackageArtifacts", workItemId, packageHash] as const,
  currentApproval: (workItemId: WorkItemId) =>
    ["currentApproval", workItemId] as const,
  approvals: (workItemId: WorkItemId) =>
    ["approvals", workItemId] as const,
  approvalArtifacts: (workItemId: WorkItemId, approvalId: ApprovalId | null) =>
    ["approvals", workItemId, approvalId, "artifacts"] as const,
  approvalCriterion: (workItemId: WorkItemId, approvalId: ApprovalId, taskId: ExecutionTaskId, acceptanceRef: AuthorityRef) =>
    ["approvals", workItemId, approvalId, "artifacts", taskId, acceptanceRef] as const,
  qaHistory: (workItemId: WorkItemId, approvalId: ApprovalId | null) =>
    ["approvals", workItemId, approvalId, "qa-events"] as const,
  qaProofRoot: (workItemId: WorkItemId) => ["qaProof", workItemId] as const,
  qaProof: (workItemId: WorkItemId, approvalId: ApprovalId | null, sequence: number | null) =>
    ["qaProof", workItemId, approvalId, sequence] as const,
  tasks: (workItemId: WorkItemId) =>
    ["tasks", workItemId] as const,
  runs: (workItemId: WorkItemId) =>
    ["runs", workItemId] as const,
  artifacts: (workItemId: WorkItemId) =>
    ["artifacts", workItemId] as const,
  runEvents: (runId: RunId | null) =>
    ["runEvents", runId] as const,
  proposalTarget: (proposalEventId: RunEventId | null) =>
    ["proposalTarget", proposalEventId] as const,
  artifactContent: (artifactId: ArtifactRefId | null) =>
    ["artifactContent", artifactId] as const,
  evidence: (runId: RunId | null, relativePath: EvidencePath | null) =>
    ["evidence", runId, relativePath] as const,
} as const;


export const workbenchMutationInvalidationKeys = (
  workItemId: WorkItemId,
) => [
  workbenchQueryKeys.workItem(workItemId),
  workbenchQueryKeys.workItems,
  workbenchQueryKeys.runs(workItemId),
  workbenchQueryKeys.runEventsRoot,
  workbenchQueryKeys.tasks(workItemId),
  workbenchQueryKeys.currentApproval(workItemId),
  workbenchQueryKeys.approvals(workItemId),
  workbenchQueryKeys.lifecycleArtifacts(workItemId),
  workbenchQueryKeys.artifacts(workItemId),
  workbenchQueryKeys.workItemSource(workItemId),
  workbenchQueryKeys.workItemSourceDiagnostics,
  workbenchQueryKeys.workItemDocumentationGitStatus(workItemId),
  workbenchQueryKeys.signoffPackage(workItemId),
] as const;


export const invalidateWorkbenchMutation = async (
  queryClient: QueryClient,
  workItemId: WorkItemId,
): Promise<void> => {
  // A proof belongs to one exact sequence, not to the history collection.
  // Invalidate without refetching the obsolete sequence concurrently with
  // the history and current WorkItem/Approval observations.
  const proofRoot=workbenchQueryKeys.qaProofRoot(workItemId);
  await queryClient.cancelQueries({queryKey:proofRoot});
  await queryClient.invalidateQueries({queryKey:proofRoot,refetchType:"none"});
  await Promise.all(
    workbenchMutationInvalidationKeys(workItemId)
      .map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  );
  const workItem=queryClient.getQueryData<WorkItem>(workbenchQueryKeys.workItem(workItemId));
  const approval=queryClient.getQueryData<Approval|null>(workbenchQueryKeys.currentApproval(workItemId));
  if(workItem?.stage!=="AWAITING_ACCEPTANCE"||approval==null)return;
  const history=queryClient.getQueryData<readonly CandidateReviewEvent[]>(workbenchQueryKeys.qaHistory(workItemId,approval.id));
  const sequence=history?.at(-1)?.sequence;
  if(sequence!==undefined)await queryClient.refetchQueries({
    queryKey:workbenchQueryKeys.qaProof(workItemId,approval.id,sequence),exact:true,type:"active",
  });
};
