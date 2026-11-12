import { useQuery } from "@tanstack/react-query";
import type { WorkItem } from "../../src/core/contracts.ts";
import * as api from "./http.ts";
import { WorkbenchEmptyState, WorkbenchErrorState } from "./primitives/WorkbenchState.tsx";

export const SignoffReview = ({
  workItem,
  onOpenDocuments,
}: Readonly<{ workItem: WorkItem; onOpenDocuments: () => void }>) => {
  const query = useQuery({
    queryKey: ["signoffPackage", workItem.id],
    queryFn: () => api.getSignoffPackage(workItem.id),
    enabled: workItem.stage === "AWAITING_SIGNOFF",
  });
  const artifactsQuery = useQuery({
    queryKey: ["lifecycleArtifacts", workItem.id],
    queryFn: () => api.listLifecycleArtifacts(workItem.id),
    enabled: workItem.stage === "AWAITING_SIGNOFF",
  });

  if (query.isPending || artifactsQuery.isPending) return <WorkbenchEmptyState compact title="Resolving exact package…" />;
  if (query.isError || artifactsQuery.isError) {
    const error = query.error ?? artifactsQuery.error;
    return <WorkbenchErrorState title="Package is not current" description={error instanceof Error ? error.message : String(error)} />;
  }
  if (!query.data) return <WorkbenchEmptyState title="No sign-off package" />;

  return (
    <section className="order-workspace-section" data-testid="review-workspace">
      <div className="order-section-heading">
        <h2>Exact sign-off package</h2>
        <button type="button" onClick={onOpenDocuments}>Open governed documents</button>
      </div>
      <div className="order-review-grid">
        <div><span>Package hash</span><code data-testid="signoff-package-hash">{query.data.packageHash}</code></div>
        <div><span>Source binding</span><code>{query.data.sourceSha256}</code></div>
        <div><span>Baseline</span><code>{query.data.baselineCommit}</code></div>
      </div>
      <h3>Governed documents</h3>
      <div className="order-review-documents" data-testid="review-documents">
        {(artifactsQuery.data ?? []).map((artifact) => (
          <div key={artifact.id}>
            <strong>{artifact.role}</strong>
            <span>{artifact.repositoryPath}</span>
          </div>
        ))}
      </div>
      <h3>Signed tasks</h3>
      <div className="order-task-list">
        {query.data.taskBlock.tasks.map((task) => (
          <article key={task.id} className="order-task-card">
            <code>{task.id}</code>
            <strong>{task.objective}</strong>
            <div>Gates: {task.gateIds.join(", ")}</div>
            <div>Change surface: {task.changeSurface.join(", ")}</div>
          </article>
        ))}
      </div>
    </section>
  );
};
