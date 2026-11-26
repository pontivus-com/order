import { CodeBlock } from "@astryxdesign/core/CodeBlock";
import { useQuery } from "@tanstack/react-query";

import * as api from "./http.ts";
import { workbenchQueryKeys } from "./query-keys.ts";
import type { EvidenceSelection } from "./workbench-presentation.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchSectionHeader } from "./primitives/WorkbenchSectionHeader.tsx";
import { WorkbenchState } from "./primitives/WorkbenchState.tsx";
import { WorkbenchSurface } from "./primitives/WorkbenchSurface.tsx";

const decodeEvidence = (bytes: Uint8Array): string => {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    const preview = Array.from(bytes.slice(0, 256), (value) =>
      value.toString(16).padStart(2, "0")).join(" ");
    return (
      "Binary evidence (" +
      bytes.byteLength +
      " bytes)\n" +
      preview +
      (bytes.byteLength > 256 ? " …" : "")
    );
  }
};

export const EvidenceViewer = ({
  selection,
  onBack,
}: Readonly<{
  selection: EvidenceSelection | null;
  onBack: () => void;
}>) => {
  const query = useQuery({
    queryKey:
      selection?.kind === "ARTIFACT"
        ? workbenchQueryKeys.artifactContent(selection.artifactId)
        : workbenchQueryKeys.evidence(
            selection?.runId ?? null,
            selection?.relativePath ?? null,
          ),
    queryFn: () => {
      if (selection === null) {
        throw new TypeError("evidence selection required");
      }
      return selection.kind === "ARTIFACT"
        ? api.readArtifactContent(selection.artifactId)
        : api.readEvidence(selection.runId, selection.relativePath);
    },
    enabled: selection !== null,
  });

  if (selection === null) {
    return (
      <WorkbenchState
        kind="empty"
        title="No evidence selected"
        description="Select an evidence resource from the owning workflow step."
      />
    );
  }

  const identity =
    selection.kind === "ARTIFACT"
      ? selection.label
      : selection.relativePath;

  return (
    <WorkbenchSurface
      material={
        <section
          className="order-evidence-composition"
          data-testid="evidence-workspace"
        >
          <WorkbenchSectionHeader
            title="Evidence"
            description="Read-only exact material."
            action={
              <WorkbenchAction
                label="Back to workflow context"
                tone="secondary"
                onClick={onBack}
              />
            }
          />
          <dl className="order-evidence-exact-identity">
            <dt>Exact identity</dt>
            <dd>{identity}</dd>
          </dl>
          <div className="order-evidence-bytes">
            {query.isPending ? (
              <WorkbenchState kind="loading" title="Loading evidence…" />
            ) : query.isError ? (
              <WorkbenchState
                kind="error"
                title="Evidence could not be read"
                description={
                  query.error instanceof Error
                    ? query.error.message
                    : String(query.error)
                }
                action={<WorkbenchAction label="Retry evidence read" onClick={() => { void query.refetch(); }} />}
              />
            ) : (
              <div
                className="order-evidence-raw"
                data-testid="raw-content-view"
              >
                <CodeBlock
                  className="order-evidence-code"
                  code={decodeEvidence(query.data)}
                  language="plaintext"
                  isWrapped
                  hasCopyButton
                  container="card"
                  width="100%"
                />
              </div>
            )}
          </div>
        </section>
      }
    />
  );
};
