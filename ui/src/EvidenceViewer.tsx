import { useQuery } from "@tanstack/react-query";
import { CodeBlock } from "@astryxdesign/core/CodeBlock";

import * as api from "./http.ts";
import { workbenchQueryKeys } from "./query-keys.ts";
import type { EvidenceSelection } from "./workbench-presentation.ts";
import { WorkbenchEmptyState, WorkbenchErrorState } from "./primitives/WorkbenchState.tsx";

const decodeBytes = (bytes: Uint8Array): string => {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    const preview = Array.from(bytes.slice(0, 256), (value) => value.toString(16).padStart(2, "0")).join(" ");
    return "Binary evidence (" + bytes.byteLength + " bytes)\\n" + preview + (bytes.byteLength > 256 ? " …" : "");
  }
};

export const EvidenceViewer = ({ selection }: Readonly<{ selection: EvidenceSelection | null }>) => {
  const query = useQuery({
    queryKey: selection?.kind === "ARTIFACT"
      ? workbenchQueryKeys.artifactContent(selection.artifactId)
      : workbenchQueryKeys.evidence(
          selection?.runId ?? null,
          selection?.relativePath ?? null,
        ),
    queryFn: () => {
      if (!selection) throw new TypeError("evidence selection required");
      return selection.kind === "ARTIFACT"
        ? api.readArtifactContent(selection.artifactId)
        : api.readEvidence(selection.runId, selection.relativePath);
    },
    enabled: selection !== null,
  });

  if (!selection) return <WorkbenchEmptyState title="No evidence selected" description="Select an artifact or evidence reference from Execution." />;
  if (query.isPending) return <WorkbenchEmptyState compact title="Loading evidence…" />;
  if (query.isError) return <WorkbenchErrorState title="Evidence could not be read" description={query.error instanceof Error ? query.error.message : String(query.error)} />;
  const value = decodeBytes(query.data);
  const title = selection.kind === "ARTIFACT" ? selection.label : selection.relativePath;
  return (
    <section className="order-workspace-section" data-testid="evidence-workspace">
      <div className="order-section-heading"><h2>{title}</h2><span>Read-only exact material</span></div>
      <div data-testid="raw-content-view" className="order-code-view">
        <CodeBlock code={value} language="plaintext" hasCopyButton width="100%" maxHeight="calc(100vh - 13rem)" />
      </div>
    </section>
  );
};
