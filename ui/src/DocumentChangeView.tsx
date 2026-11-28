import { CodeBlock } from "@astryxdesign/core/CodeBlock";
import { Markdown } from "@astryxdesign/core/Markdown";

import { WorkbenchDisclosure } from "./primitives/WorkbenchDisclosure.tsx";
import { WorkbenchState } from "./primitives/WorkbenchState.tsx";

type ProposedLine = Readonly<{
  text: string;
  changed: boolean;
  removedBefore: number;
}>;

type ProposedSegment = Readonly<{
  id: string;
  changed: boolean;
  markdown: string;
  removedLines: number;
}>;

const applyUnifiedDiff = (
  currentMarkdown: string,
  unifiedDiff: string,
): readonly ProposedLine[] | null => {
  const source = currentMarkdown.length === 0 ? [] : currentMarkdown.split("\n");
  const output: ProposedLine[] = [];
  let sourceIndex = 0;
  let inHunk = false;
  let sawHunk = false;
  let pendingRemoved = 0;
  let oldRemaining = 0;
  let newRemaining = 0;

  const flushRemoved = (): void => {
    if (pendingRemoved === 0) return;
    output.push({ text: "", changed: true, removedBefore: pendingRemoved });
    pendingRemoved = 0;
  };

  for (const line of unifiedDiff.split("\n")) {
    if (line.startsWith("@@")) {
      if (inHunk && (oldRemaining !== 0 || newRemaining !== 0)) return null;
      flushRemoved();
      const match = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/.exec(line);
      if (match === null) return null;
      const oldStart = Number(match[1]);
      const oldCount = match[2] === undefined ? 1 : Number(match[2]);
      oldRemaining = oldCount;
      newRemaining = match[4] === undefined ? 1 : Number(match[4]);
      const targetIndex = oldCount === 0 ? oldStart : Math.max(0, oldStart - 1);
      if (targetIndex < sourceIndex || targetIndex > source.length) return null;
      while (sourceIndex < targetIndex && sourceIndex < source.length) {
        output.push({
          text: source[sourceIndex] ?? "",
          changed: false,
          removedBefore: 0,
        });
        sourceIndex += 1;
      }
      inHunk = true;
      sawHunk = true;
      continue;
    }

    if (!inHunk) continue;
    if (line === "\\ No newline at end of file" || line.length === 0) continue;

    const marker = line[0];
    const text = line.slice(1);

    if (marker === " ") {
      if (oldRemaining <= 0 || newRemaining <= 0 || source[sourceIndex] !== text) return null;
      oldRemaining -= 1;
      newRemaining -= 1;
      flushRemoved();
      output.push({
        text: source[sourceIndex] ?? text,
        changed: false,
        removedBefore: 0,
      });
      sourceIndex += 1;
      continue;
    }

    if (marker === "-") {
      if (oldRemaining <= 0 || source[sourceIndex] !== text) return null;
      oldRemaining -= 1;
      pendingRemoved += 1;
      sourceIndex += 1;
      continue;
    }

    if (marker === "+") {
      if (newRemaining <= 0) return null;
      newRemaining -= 1;
      output.push({
        text,
        changed: true,
        removedBefore: pendingRemoved,
      });
      pendingRemoved = 0;
      continue;
    }

    return null;
  }

  if (!sawHunk || oldRemaining !== 0 || newRemaining !== 0) return null;
  flushRemoved();

  while (sourceIndex < source.length) {
    output.push({
      text: source[sourceIndex] ?? "",
      changed: false,
      removedBefore: 0,
    });
    sourceIndex += 1;
  }

  return output;
};

const proposedSegments = (
  lines: readonly ProposedLine[],
): readonly ProposedSegment[] => {
  const segments: ProposedSegment[] = [];
  let block: ProposedLine[] = [];
  let fence: string | null = null;

  const flushBlock = (): void => {
    if (block.length === 0) return;
    const changed = block.some((line) => line.changed);
    const markdown = block.map((line) => line.text).join("\n");
    const removedLines = block.reduce((sum, line) => sum + line.removedBefore, 0);
    const previous = segments.at(-1);
    if (previous !== undefined && previous.changed === changed) {
      segments[segments.length - 1] = {
        ...previous,
        markdown: previous.markdown + "\n" + markdown,
        removedLines: previous.removedLines + removedLines,
      };
    } else {
      segments.push({ id: "segment-" + segments.length, changed, markdown, removedLines });
    }
    block = [];
  };

  for (const line of lines) {
    const marker = /^ {0,3}(`{3,}|~{3,})/.exec(line.text)?.[1];
    if (marker !== undefined) {
      if (fence === null) fence = marker;
      else if (marker[0] === fence[0] && marker.length >= fence.length &&
          line.text.trim() === marker) fence = null;
    }
    block.push(line);
    if (fence === null && line.text.trim().length === 0) flushBlock();
  }
  flushBlock();

  return segments;
};

const ProposedDocument = ({
  lines,
}: Readonly<{ lines: readonly ProposedLine[] }>) => {
  const segments = proposedSegments(lines);

  return (
    <section
      className="order-document-change-proposed"
      aria-label="Proposed document"
    >
      <header className="order-document-change-heading">
        <h4>Proposed document</h4>
      </header>
      <div className="order-document-change-content">
        {segments.map((segment) =>
          segment.changed ? (
            <section
              className="order-document-change-region"
              data-testid="document-change-region"
              key={segment.id}
            >
              <div className="order-document-change-region-label">
                <strong>Changed</strong>
                {segment.removedLines === 0 ? null : (
                  <span>
                    {segment.removedLines} removed line
                    {segment.removedLines === 1 ? "" : "s"}
                  </span>
                )}
              </div>
              {segment.markdown.trim().length === 0 ? null : (
                <Markdown
                  contentWidth="var(--order-prose-max-width)"
                  contentAlign="start"
                >
                  {segment.markdown}
                </Markdown>
              )}
            </section>
          ) : segment.markdown.trim().length === 0 ? null : (
            <div className="order-document-change-context" key={segment.id}>
              <Markdown
                contentWidth="var(--order-prose-max-width)"
                contentAlign="start"
              >
                {segment.markdown}
              </Markdown>
            </div>
          ),
        )}
      </div>
    </section>
  );
};

export const DocumentChangeView = ({
  currentMarkdown,
  unifiedDiff,
}: Readonly<{
  currentMarkdown: string | null;
  unifiedDiff: string;
}>) => {
  const proposed = currentMarkdown === null ? null : applyUnifiedDiff(currentMarkdown, unifiedDiff);

  return (
    <div className="order-document-change-view" data-testid="document-change-view">
      {proposed === null ? (
        <WorkbenchState
          kind="error"
          title="Proposed document could not be reconstructed"
          description="The exact patch remains available below for inspection."
        />
      ) : (
        <ProposedDocument lines={proposed} />
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
