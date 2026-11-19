import { describe, expect, it } from "vitest";

import {
  applyMarkdownFormat,
  type MarkdownFormatCommand,
} from "../ui/src/markdown-source-formatting.ts";

const transform = (
  markdown: string,
  from: number,
  to: number,
  command: MarkdownFormatCommand,
) => applyMarkdownFormat(markdown, { from, to }, command);

describe("Markdown source formatting", () => {
  it("wraps and toggles inline emphasis without changing unrelated source", () => {
    const source = "prefix alpha suffix";
    const bold = transform(source, 7, 12, "BOLD");
    expect(bold.markdown).toBe("prefix **alpha** suffix");
    expect(bold.selection).toEqual({ from: 9, to: 14 });

    const unbold = transform(bold.markdown, 9, 14, "BOLD");
    expect(unbold.markdown).toBe(source);
    expect(unbold.selection).toEqual({ from: 7, to: 12 });

    expect(transform("alpha", 0, 5, "ITALIC").markdown).toBe("*alpha*");
    expect(transform("alpha", 0, 5, "INLINE_CODE").markdown).toBe("`alpha`");
  });

  it("inserts empty inline formatting with the caret inside", () => {
    const bold = transform("alpha", 2, 2, "BOLD");
    expect(bold.markdown).toBe("al****pha");
    expect(bold.selection).toEqual({ from: 4, to: 4 });
  });

  it("applies and removes ATX heading levels", () => {
    const h2 = transform("alpha\nbeta", 0, 5, "HEADING_2");
    expect(h2.markdown).toBe("## alpha\nbeta");
    const off = transform(h2.markdown, 0, 8, "HEADING_2");
    expect(off.markdown).toBe("alpha\nbeta");

    const replace = transform("# alpha", 0, 7, "HEADING_3");
    expect(replace.markdown).toBe("### alpha");
  });

  it("toggles blockquote and unordered list prefixes across selected lines", () => {
    const quote = transform("alpha\nbeta\ngamma", 0, 10, "BLOCKQUOTE");
    expect(quote.markdown).toBe("> alpha\n> beta\ngamma");
    expect(transform(quote.markdown, 0, 14, "BLOCKQUOTE").markdown)
      .toBe("alpha\nbeta\ngamma");

    const list = transform("alpha\nbeta", 0, 10, "BULLET_LIST");
    expect(list.markdown).toBe("- alpha\n- beta");
    expect(transform(list.markdown, 0, list.markdown.length, "BULLET_LIST").markdown)
      .toBe("alpha\nbeta");
  });

  it("creates deterministic numbered lists and toggles them off", () => {
    const list = transform("alpha\nbeta\ngamma", 0, 16, "NUMBERED_LIST");
    expect(list.markdown).toBe("1. alpha\n2. beta\n3. gamma");
    expect(transform(list.markdown, 0, list.markdown.length, "NUMBERED_LIST").markdown)
      .toBe("alpha\nbeta\ngamma");
  });

  it("creates links and selects the URL placeholder", () => {
    const selected = transform("alpha", 0, 5, "LINK");
    expect(selected.markdown).toBe("[alpha](url)");
    expect(selected.selection).toEqual({ from: 8, to: 11 });

    const empty = transform("alpha", 0, 0, "LINK");
    expect(empty.markdown).toBe("[](url)alpha");
    expect(empty.selection).toEqual({ from: 3, to: 6 });
  });

  it("wraps and unwraps fenced code without inventing a language", () => {
    const fenced = transform("alpha\nbeta", 0, 10, "FENCED_CODE");
    expect(fenced.markdown).toBe("```\nalpha\nbeta\n```");
    expect(transform(
      fenced.markdown,
      0,
      fenced.markdown.length,
      "FENCED_CODE",
    ).markdown).toBe("alpha\nbeta");
  });

  it("inserts a standalone horizontal rule at a line boundary", () => {
    expect(transform("alpha\nbeta", 2, 2, "HORIZONTAL_RULE").markdown)
      .toBe("alpha\n---\nbeta");
    expect(transform("\nalpha", 0, 0, "HORIZONTAL_RULE").markdown)
      .toBe("---\nalpha");
  });

  it("preserves content outside the transformed range", () => {
    const source = "before\nalpha\nbeta\nafter";
    const result = transform(source, 7, 17, "BULLET_LIST");
    expect(result.markdown.startsWith("before\n")).toBe(true);
    expect(result.markdown.endsWith("\nafter")).toBe(true);
  });
});
