import { CodeBlock } from "@astryxdesign/core/CodeBlock";
import { Markdown } from "@astryxdesign/core/Markdown";

import { WorkbenchDisclosure } from "./primitives/WorkbenchDisclosure.tsx";
import { WorkbenchState } from "./primitives/WorkbenchState.tsx";

const applyUnifiedDiff = (
  currentMarkdown: string,
  unifiedDiff: string,
): string | null => {
  const source = currentMarkdown.split("\n");
  const output: string[] = [];
  let sourceIndex = 0;
  let inHunk = false;
  let sawHunk = false;

  for (const line of unifiedDiff.split("\n")) {
    if (line.startsWith("@@")) {
      const match = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(line);
      if (match === null) return null;
      const oldStart = Number(match[1]);
      const targetIndex = Math.max(0, oldStart - 1);
      if (targetIndex < sourceIndex) return null;
      while (sourceIndex < targetIndex && sourceIndex < source.length) {
        output.push(source[sourceIndex] ?? "");
        sourceIndex += 1;
      }
      inHunk = true;
      sawHunk = true;
      continue;
    }
    if (!inHunk || line.startsWith("--- ") || line.startsWith("+++ ")) continue;
    if (line === "\\ No newline at end of file" || line.length === 0) continue;

    const marker = line[0];
    const text = line.slice(1);
    if (marker === " ") {
      output.push(source[sourceIndex] ?? text);
      sourceIndex += 1;
      continue;
    }
    if (marker === "-") {
      sourceIndex += 1;
      continue;
    }
    if (marker === "+") {
      output.push(text);
      continue;
    }
  }

  if (!sawHunk) return null;
  while (sourceIndex < source.length) {
    output.push(source[sourceIndex] ?? "");
    sourceIndex += 1;
  }
  return output.join("\n");
};

const DocumentPreview = ({
  label,
  markdown,
  proposed,
}: Readonly<{
  label: string;
  markdown: string;
  proposed: boolean;
}>) => (
  <section
    className="order-document-change-document"
    data-proposed={proposed ? "true" : "false"}
    aria-label={label}
  >
    <header><h4>{label}</h4></header>
    {markdown.trim().length === 0 ? (
      <WorkbenchState kind="empty" title={proposed ? "Empty proposed document" : "New document"} />
    ) : (
      <Markdown contentWidth="var(--order-prose-max-width)" contentAlign="start">
        {markdown}
      </Markdown>
    )}
  </section>
);

export const DocumentChangeView = ({
  currentMarkdown,
  unifiedDiff,
}: Readonly<{
  currentMarkdown: string;
  unifiedDiff: string;
}>) => {
  const proposedMarkdown = applyUnifiedDiff(currentMarkdown, unifiedDiff);

  return (
    <div className="order-document-change-view" data-testid="document-change-view">
      {proposedMarkdown === null ? (
        <WorkbenchState
          kind="error"
          title="Proposed document could not be reconstructed"
          description="The exact patch remains available below for inspection."
        />
      ) : (
        <div className="order-document-change-comparison">
          <DocumentPreview label="Current document" markdown={currentMarkdown} proposed={false} />
          <DocumentPreview label="Proposed document" markdown={proposedMarkdown} proposed />
        </div>
      )}
      <WorkbenchDisclosure
        label="View exact diff"
        content={
          <CodeBlock
            code={unifiedDiff}
            language="diff"
            isDiff
            isWrapped
            hasCopyButton
            container="section"
            width="100%"
          />
        }
      />
    </div>
  );
};
