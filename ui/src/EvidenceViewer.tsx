import { CodeBlock } from "@astryxdesign/core/CodeBlock";
import { useQuery } from "@tanstack/react-query";
import * as api from "./http.ts";
import { workbenchQueryKeys } from "./query-keys.ts";
import type { EvidenceSelection } from "./workbench-presentation.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchSectionHeader } from "./primitives/WorkbenchSectionHeader.tsx";
import { WorkbenchState } from "./primitives/WorkbenchState.tsx";
import { WorkbenchSurface } from "./primitives/WorkbenchSurface.tsx";

const decodeBytes = (bytes: Uint8Array): string => {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    const preview = Array.from(bytes.slice(0, 256), (value) =>
      value.toString(16).padStart(2, "0")).join(" ");
    return "Binary evidence (" + bytes.byteLength + " bytes)\n" +
      preview + (bytes.byteLength > 256 ? " …" : "");
  }
};

export const EvidenceViewer = ({
  selection,
  onBack,
}: Readonly<{ selection: EvidenceSelection | null; onBack: () => void }>) => {
  const query = useQuery({
    queryKey: selection?.kind === "ARTIFACT"
      ? workbenchQueryKeys.artifactContent(selection.artifactId)
      : workbenchQueryKeys.evidence(selection?.runId ?? null, selection?.relativePath ?? null),
    queryFn: () => {
      if (!selection) throw new TypeError("evidence selection required");
      return selection.kind === "ARTIFACT"
        ? api.readArtifactContent(selection.artifactId)
        : api.readEvidence(selection.runId, selection.relativePath);
    },
    enabled: selection !== null,
  });

  if (!selection) {
    return <WorkbenchState kind="empty" title="No evidence selected" description="Select an evidence reference from the owning workflow step." />;
  }

  const identity = selection.kind === "ARTIFACT"
    ? selection.label
    : selection.relativePath;

  const material = (
    <div className="order-evidence-content">
      <dl className="order-evidence-identity">
        <dt>Evidence identity</dt>
        <dd>{identity}</dd>
      </dl>
      {query.isPending ? (
        <WorkbenchState kind="loading" title="Loading evidence…" />
      ) : query.isError ? (
        <WorkbenchState kind="error" title="Evidence could not be read" description={query.error instanceof Error ? query.error.message : String(query.error)} />
      ) : (
        <div className="order-evidence-raw-content" data-testid="raw-content-view">
          <CodeBlock
            className="order-evidence-code-block"
            code={decodeBytes(query.data)}
            language="plaintext"
            isWrapped
            hasCopyButton
            container="card"
            width="100%"
          />
        </div>
      )}
    </div>
  );

  return (
    <WorkbenchSurface
      attention={
        <WorkbenchSectionHeader
          title="Evidence"
          description="Read-only exact material. UTF-8 is shown verbatim; non-UTF-8 uses the bounded binary preview."
          action={<WorkbenchAction label="Back to workflow context" tone="secondary" onClick={onBack} />}
        />
      }
      material={material}
    />
  );
};
