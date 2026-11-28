import type { QueryClient } from "@tanstack/react-query";
import type {
  ApprovalId,
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
    ["signoffPackage", workItemId, packageHash, "artifacts"] as const,
  currentApproval: (workItemId: WorkItemId) =>
    ["currentApproval", workItemId] as const,
  approvals: (workItemId: WorkItemId) =>
    ["approvals", workItemId] as const,
  approvalArtifacts: (workItemId: WorkItemId, approvalId: ApprovalId | null) =>
    ["approvals", workItemId, approvalId, "artifacts"] as const,
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
  await Promise.all(
    workbenchMutationInvalidationKeys(workItemId)
      .map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  );
};
