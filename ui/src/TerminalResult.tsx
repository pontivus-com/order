import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CodeBlock } from "@astryxdesign/core/CodeBlock";
import { Markdown } from "@astryxdesign/core/Markdown";
import { Tab, TabList } from "@astryxdesign/core/TabList";

import {
  MarkdownTextSchema,
  type ArtifactRef,
  type WorkItem,
} from "../../src/core/contracts.ts";
import * as api from "./http.ts";
import { workbenchQueryKeys } from "./query-keys.ts";
import { WorkbenchEmptyState, WorkbenchErrorState } from "./primitives/WorkbenchState.tsx";
import { lifecycleArtifactRoleRank } from "./workbench-presentation.ts";

const resultText = (workItem: WorkItem): string => {
  switch (workItem.outcome) {
    case "DISPROVEN": return "The proposed work was disproven. No implementation is required.";
    case "DUPLICATE": return "The work is a duplicate of already governed work.";
    case "ALREADY_SATISFIED": return "The approved intent is already satisfied by the current repository state.";
    case "INVESTIGATION_COMPLETE": return "The investigation completed with an evidence-backed result.";
    case "AUDIT_COMPLETE": return "The audit completed with an evidence-backed result.";
    case "CANDIDATE_DONE": return "A verified candidate is available in the Execution workspace.";
    default: return "The WorkItem is complete.";
  }
};

const decode = (
  bytes: Uint8Array,
): Readonly<{ kind: "MARKDOWN"; value: string }> | Readonly<{ kind: "TEXT"; value: string }> => {
  try {
    const value = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    const markdown = MarkdownTextSchema.safeParse(value);
    return markdown.success
      ? { kind: "MARKDOWN", value: markdown.data }
      : { kind: "TEXT", value };
  } catch {
    const preview = Array.from(
      bytes.slice(0, 256),
      (value) => value.toString(16).padStart(2, "0"),
    ).join(" ");
    return {
      kind: "TEXT",
      value: "Binary result material (" + bytes.byteLength + " bytes)\n" + preview +
        (bytes.byteLength > 256 ? " …" : ""),
    };
  }
};

export const TerminalResult = ({ workItem }: Readonly<{ workItem: WorkItem }>) => {
  const artifactsQuery = useQuery({
    queryKey: workbenchQueryKeys.lifecycleArtifacts(workItem.id),
    queryFn: () => api.listLifecycleArtifacts(workItem.id),
    enabled:
      workItem.outcome === "INVESTIGATION_COMPLETE" ||
      workItem.outcome === "AUDIT_COMPLETE",
  });

  const artifacts = useMemo(
    () => [...(artifactsQuery.data ?? [])].sort(
      (left, right) => lifecycleArtifactRoleRank(left.role) - lifecycleArtifactRoleRank(right.role),
    ),
    [artifactsQuery.data],
  );
  const [selectedArtifactId, setSelectedArtifactId] = useState<ArtifactRef["id"] | null>(null);
  const selectedArtifact =
    artifacts.find((artifact) => artifact.id === selectedArtifactId) ??
    artifacts.at(-1) ??
    null;

  const contentQuery = useQuery({
    queryKey: workbenchQueryKeys.artifactContent(selectedArtifact?.id ?? null),
    queryFn: () => {
      if (!selectedArtifact) throw new TypeError("terminal result artifact required");
      return api.readArtifactContent(selectedArtifact.id);
    },
    enabled: selectedArtifact !== null,
  });

  const evidenceBacked =
    workItem.outcome === "INVESTIGATION_COMPLETE" ||
    workItem.outcome === "AUDIT_COMPLETE";

  return (
    <section className="order-workspace-section" data-testid="result-workspace">
      <div className="order-result">
        <span className="order-eyebrow">Terminal result</span>
        <h2>{workItem.outcome ?? "Complete"}</h2>
        <p>{resultText(workItem)}</p>
      </div>

      {evidenceBacked ? (
        <div className="order-result-material" data-testid="result-material">
          {artifactsQuery.isPending ? (
            <WorkbenchEmptyState compact title="Loading governed result…" />
          ) : artifactsQuery.isError ? (
            <WorkbenchErrorState
              title="Governed result unavailable"
              description={artifactsQuery.error instanceof Error
                ? artifactsQuery.error.message
                : String(artifactsQuery.error)}
            />
          ) : artifacts.length === 0 ? (
            <WorkbenchEmptyState
              title="No governed result artifact"
              description="The terminal classification is canonical, but no current result artifact is available."
            />
          ) : (
            <>
              <TabList
                value={selectedArtifact?.id ?? artifacts[0]!.id}
                onChange={(value) => {
                  const artifact = artifacts.find((candidate) => candidate.id === value);
                  if (artifact) setSelectedArtifactId(artifact.id);
                }}
                role="tablist"
                overflow="scroll"
              >
                {artifacts.map((artifact) => (
                  <Tab
                    key={artifact.id}
                    value={artifact.id}
                    label={artifact.role}
                  />
                ))}
              </TabList>

              {contentQuery.isPending ? (
                <WorkbenchEmptyState compact title="Loading result material…" />
              ) : contentQuery.isError ? (
                <WorkbenchErrorState
                  title="Result material unavailable"
                  description={contentQuery.error instanceof Error
                    ? contentQuery.error.message
                    : String(contentQuery.error)}
                />
              ) : contentQuery.data ? (
                (() => {
                  const content = decode(contentQuery.data);
                  return content.kind === "MARKDOWN" ? (
                    <div className="order-markdown-readonly">
                      <Markdown contentWidth="52rem" contentAlign="start">
                        {content.value}
                      </Markdown>
                    </div>
                  ) : (
                    <div className="order-code-view">
                      <CodeBlock
                        code={content.value}
                        language="plaintext"
                        hasCopyButton
                        width="100%"
                      />
                    </div>
                  );
                })()
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </section>
  );
};
