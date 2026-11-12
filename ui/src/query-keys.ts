import type {
  ArtifactRefId,
  EvidencePath,
  RunId,
  WorkItemId,
} from "../../src/core/contracts.ts";

export const workbenchQueryKeys = {
  workItems: ["workItems"] as const,
  projects: ["projects"] as const,
  workItemSchemas: ["workItemSchemas"] as const,
  workItemSourceDiagnostics: ["workItemSourceDiagnostics"] as const,
  workItemSourceRoot: ["workItemSource"] as const,
  lifecycleArtifactsRoot: ["lifecycleArtifacts"] as const,
  signoffPackageRoot: ["signoffPackage"] as const,
  runEventsRoot: ["runEvents"] as const,

  workItemSource: (workItemId: WorkItemId) =>
    ["workItemSource", workItemId] as const,
  lifecycleArtifacts: (workItemId: WorkItemId) =>
    ["lifecycleArtifacts", workItemId] as const,
  signoffPackage: (workItemId: WorkItemId) =>
    ["signoffPackage", workItemId] as const,
  tasks: (workItemId: WorkItemId) =>
    ["tasks", workItemId] as const,
  runs: (workItemId: WorkItemId) =>
    ["runs", workItemId] as const,
  artifacts: (workItemId: WorkItemId) =>
    ["artifacts", workItemId] as const,
  runEvents: (runId: RunId | null) =>
    ["runEvents", runId] as const,
  artifactContent: (artifactId: ArtifactRefId | null) =>
    ["artifactContent", artifactId] as const,
  evidence: (runId: RunId | null, relativePath: EvidencePath | null) =>
    ["evidence", runId, relativePath] as const,
} as const;
