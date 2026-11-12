import { useQuery } from "@tanstack/react-query";
import type { WorkItem } from "../../src/core/contracts.ts";
import * as api from "./http.ts";
import { workbenchQueryKeys } from "./query-keys.ts";
import { WorkbenchEmptyState, WorkbenchErrorState } from "./primitives/WorkbenchState.tsx";

export const SignoffReview = ({
  workItem,
  onOpenDocuments,
}: Readonly<{ workItem: WorkItem; onOpenDocuments: () => void }>) => {
  const query = useQuery({
    queryKey: workbenchQueryKeys.signoffPackage(workItem.id),
    queryFn: () => api.getSignoffPackage(workItem.id),
    enabled: workItem.stage === "AWAITING_SIGNOFF",
  });
  const artifactsQuery = useQuery({
    queryKey: workbenchQueryKeys.lifecycleArtifacts(workItem.id),
    queryFn: () => api.listLifecycleArtifacts(workItem.id),
    enabled: workItem.stage === "AWAITING_SIGNOFF",
  });

  if (query.isPending || artifactsQuery.isPending) {
    return (
      <section className="order-workspace-section" data-testid="review-workspace">
        <WorkbenchEmptyState compact title="Resolving exact package…" />
      </section>
    );
  }
  if (query.isError || artifactsQuery.isError) {
    const error = query.error ?? artifactsQuery.error;
    return (
      <section className="order-workspace-section" data-testid="review-workspace">
        <WorkbenchErrorState title="Package is not current" description={error instanceof Error ? error.message : String(error)} />
      </section>
    );
  }
  if (!query.data) {
    return (
      <section className="order-workspace-section" data-testid="review-workspace">
        <WorkbenchEmptyState title="No sign-off package" />
      </section>
    );
  }

  return (
    <section className="order-workspace-section" data-testid="review-workspace">
      <div className="order-section-heading">
        <h2>Exact sign-off package</h2>
        <button type="button" onClick={onOpenDocuments}>Open governed documents</button>
      </div>
      <dl className="order-review-metadata">
        <div><dt>Package</dt><dd><code data-testid="signoff-package-hash">{query.data.packageHash}</code></dd></div>
        <div><dt>Source</dt><dd><code>{query.data.sourceSha256}</code></dd></div>
        <div><dt>Baseline</dt><dd><code>{query.data.baselineCommit}</code></dd></div>
      </dl>
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
      <div className="order-signed-task-list">
        {query.data.taskBlock.tasks.map((task) => (
          <details key={task.id} className="order-signed-task">
            <summary>
              <code>{task.id}</code>
              <strong>{task.objective}</strong>
            </summary>
            <div>Gates: {task.gateIds.join(", ")}</div>
            <div>Change surface: {task.changeSurface.join(", ")}</div>
          </details>
        ))}
      </div>
    </section>
  );
};
