export type MarkdownFormatCommand =
  | "HEADING_1"
  | "HEADING_2"
  | "HEADING_3"
  | "BOLD"
  | "ITALIC"
  | "INLINE_CODE"
  | "BLOCKQUOTE"
  | "BULLET_LIST"
  | "NUMBERED_LIST"
  | "LINK"
  | "FENCED_CODE"
  | "HORIZONTAL_RULE";

export type MarkdownSourceSelection = Readonly<{
  from: number;
  to: number;
}>;

export type MarkdownSourceTransform = Readonly<{
  markdown: string;
  selection: MarkdownSourceSelection;
}>;

const normalizedSelection = (
  markdown: string,
  selection: MarkdownSourceSelection,
): MarkdownSourceSelection => {
  const from = Math.max(0, Math.min(markdown.length, selection.from));
  const to = Math.max(from, Math.min(markdown.length, selection.to));
  return { from, to };
};

const replaceRange = (
  markdown: string,
  from: number,
  to: number,
  insert: string,
  selection: MarkdownSourceSelection,
): MarkdownSourceTransform => ({
  markdown: markdown.slice(0, from) + insert + markdown.slice(to),
  selection,
});

const wrapToggle = (
  markdown: string,
  selection: MarkdownSourceSelection,
  before: string,
  after: string,
): MarkdownSourceTransform => {
  const current = normalizedSelection(markdown, selection);
  const selected = markdown.slice(current.from, current.to);
  const externalBefore = current.from >= before.length &&
    markdown.slice(current.from - before.length, current.from) === before;
  const externalAfter =
    markdown.slice(current.to, current.to + after.length) === after;

  if (externalBefore && externalAfter) {
    const from = current.from - before.length;
    const to = current.to + after.length;
    const insert = selected;
    return replaceRange(markdown, from, to, insert, {
      from,
      to: from + selected.length,
    });
  }

  if (
    selected.length >= before.length + after.length &&
    selected.startsWith(before) &&
    selected.endsWith(after)
  ) {
    const insert = selected.slice(before.length, selected.length - after.length);
    return replaceRange(markdown, current.from, current.to, insert, {
      from: current.from,
      to: current.from + insert.length,
    });
  }

  const insert = before + selected + after;
  const innerFrom = current.from + before.length;
  return replaceRange(markdown, current.from, current.to, insert, {
    from: innerFrom,
    to: innerFrom + selected.length,
  });
};

type LineRange = Readonly<{
  from: number;
  to: number;
  text: string;
}>;

const selectedLineRange = (
  markdown: string,
  selection: MarkdownSourceSelection,
): LineRange => {
  const current = normalizedSelection(markdown, selection);
  const from = current.from === 0
    ? 0
    : markdown.lastIndexOf("\n", current.from - 1) + 1;
  const target = current.to > current.from ? current.to - 1 : current.to;
  const newline = markdown.indexOf("\n", target);
  const to = newline === -1 ? markdown.length : newline;
  return { from, to, text: markdown.slice(from, to) };
};

const transformSelectedLines = (
  markdown: string,
  selection: MarkdownSourceSelection,
  transform: (line: string, index: number, lines: readonly string[]) => string,
): MarkdownSourceTransform => {
  const range = selectedLineRange(markdown, selection);
  const lines = range.text.split("\n");
  const insert = lines.map((line, index) => transform(line, index, lines)).join("\n");
  return replaceRange(markdown, range.from, range.to, insert, {
    from: range.from,
    to: range.from + insert.length,
  });
};

const heading = (
  markdown: string,
  selection: MarkdownSourceSelection,
  level: 1 | 2 | 3,
): MarkdownSourceTransform => {
  const range = selectedLineRange(markdown, selection);
  const lines = range.text.split("\n");
  const wanted = "#".repeat(level) + " ";
  const allWanted = lines.every((line) => line.startsWith(wanted));

  return transformSelectedLines(markdown, selection, (line) => {
    const withoutHeading = line.replace(/^#{1,6}\s+/, "");
    return allWanted ? withoutHeading : wanted + withoutHeading;
  });
};

const prefixLines = (
  markdown: string,
  selection: MarkdownSourceSelection,
  prefix: string,
  pattern: RegExp,
): MarkdownSourceTransform => {
  const range = selectedLineRange(markdown, selection);
  const lines = range.text.split("\n");
  const allPrefixed = lines.every((line) => pattern.test(line));
  return transformSelectedLines(markdown, selection, (line) =>
    allPrefixed ? line.replace(pattern, "") : prefix + line.replace(pattern, ""));
};

const numberedList = (
  markdown: string,
  selection: MarkdownSourceSelection,
): MarkdownSourceTransform => {
  const range = selectedLineRange(markdown, selection);
  const lines = range.text.split("\n");
  const pattern = /^\d+\.\s+/;
  const allNumbered = lines.every((line) => pattern.test(line));
  return transformSelectedLines(markdown, selection, (line, index) => {
    const plain = line.replace(pattern, "");
    return allNumbered ? plain : String(index + 1) + ". " + plain;
  });
};

const link = (
  markdown: string,
  selection: MarkdownSourceSelection,
): MarkdownSourceTransform => {
  const current = normalizedSelection(markdown, selection);
  const selected = markdown.slice(current.from, current.to);
  const insert = selected.length === 0 ? "[](url)" : "[" + selected + "](url)";
  const urlFrom = current.from + selected.length + 3;
  return replaceRange(markdown, current.from, current.to, insert, {
    from: urlFrom,
    to: urlFrom + 3,
  });
};

const fencedCode = (
  markdown: string,
  selection: MarkdownSourceSelection,
): MarkdownSourceTransform => {
  const range = selectedLineRange(markdown, selection);
  const text = range.text;
  if (text.startsWith("```\n") && text.endsWith("\n```")) {
    const insert = text.slice(4, -4);
    return replaceRange(markdown, range.from, range.to, insert, {
      from: range.from,
      to: range.from + insert.length,
    });
  }
  const insert = "```\n" + text + "\n```";
  return replaceRange(markdown, range.from, range.to, insert, {
    from: range.from + 4,
    to: range.from + 4 + text.length,
  });
};

const horizontalRule = (
  markdown: string,
  selection: MarkdownSourceSelection,
): MarkdownSourceTransform => {
  const range = selectedLineRange(markdown, selection);
  const emptyLine = range.text.length === 0;
  const insertAt = emptyLine ? range.from : range.to;
  const insert = emptyLine
    ? "---"
    : "\n---";
  const caret = insertAt + insert.length;
  return replaceRange(markdown, insertAt, insertAt, insert, {
    from: caret,
    to: caret,
  });
};

export const applyMarkdownFormat = (
  markdown: string,
  selection: MarkdownSourceSelection,
  command: MarkdownFormatCommand,
): MarkdownSourceTransform => {
  switch (command) {
    case "HEADING_1":
      return heading(markdown, selection, 1);
    case "HEADING_2":
      return heading(markdown, selection, 2);
    case "HEADING_3":
      return heading(markdown, selection, 3);
    case "BOLD":
      return wrapToggle(markdown, selection, "**", "**");
    case "ITALIC":
      return wrapToggle(markdown, selection, "*", "*");
    case "INLINE_CODE":
      return wrapToggle(markdown, selection, "`", "`");
    case "BLOCKQUOTE":
      return prefixLines(markdown, selection, "> ", /^>\s?/);
    case "BULLET_LIST":
      return prefixLines(markdown, selection, "- ", /^[-+*]\s+/);
    case "NUMBERED_LIST":
      return numberedList(markdown, selection);
    case "LINK":
      return link(markdown, selection);
    case "FENCED_CODE":
      return fencedCode(markdown, selection);
    case "HORIZONTAL_RULE":
      return horizontalRule(markdown, selection);
  }
};
