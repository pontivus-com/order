import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { redo, undo } from "@codemirror/commands";
import { markdown } from "@codemirror/lang-markdown";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { Compartment } from "@codemirror/state";
import { basicSetup, EditorView } from "codemirror";
import { tags } from "@lezer/highlight";

import {
  applyMarkdownFormat,
  type MarkdownFormatCommand,
} from "./markdown-source-formatting.ts";

export type MarkdownSourceEditorHandle = Readonly<{
  focus: () => void;
  undo: () => void;
  redo: () => void;
  format: (command: MarkdownFormatCommand) => void;
}>;

export type MarkdownSourceEditorProps = Readonly<{
  value: string;
  disabled: boolean;
  ariaLabel: string;
  onChange: (markdown: string) => void;
}>;

const orderEditorTheme = EditorView.theme({
  "&": {
    height: "100%",
    minHeight: "0",
    backgroundColor: "var(--order-editor-bg)",
    color: "var(--order-editor-text)",
    border: "1px solid var(--order-editor-border)",
  },
  "&.cm-focused": {
    outline: "2px solid var(--order-editor-accent)",
    outlineOffset: "-2px",
  },
  ".cm-scroller": {
    height: "100%",
    minHeight: "0",
    overflow: "auto",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    lineHeight: "1.55",
  },
  ".cm-content": {
    minHeight: "100%",
    padding: "0.75rem 0",
    caretColor: "var(--order-editor-accent)",
  },
  ".cm-line": {
    padding: "0 0.85rem",
  },
  ".cm-cursor, .cm-dropCursor": {
    borderLeftColor: "var(--order-editor-accent)",
  },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
    backgroundColor: "var(--order-editor-selection-bg)",
  },
  ".cm-activeLine": {
    backgroundColor: "var(--order-editor-active-line-bg)",
  },
  ".cm-gutters": {
    backgroundColor: "var(--order-editor-gutter-bg)",
    color: "var(--order-editor-gutter-text)",
    borderRight: "1px solid var(--order-editor-border)",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "var(--order-editor-active-line-bg)",
    color: "var(--order-editor-text)",
  },
  ".cm-panels": {
    backgroundColor: "var(--order-editor-gutter-bg)",
    color: "var(--order-editor-text)",
  },
  ".cm-panel.cm-search": {
    borderBottom: "1px solid var(--order-editor-border)",
  },
  ".cm-searchMatch": {
    backgroundColor: "var(--order-editor-search-bg)",
    outline: "1px solid var(--order-editor-search-outline)",
  },
  ".cm-searchMatch.cm-searchMatch-selected": {
    backgroundColor: "var(--order-editor-selection-bg)",
  },
  ".cm-tooltip": {
    backgroundColor: "var(--order-editor-bg)",
    color: "var(--order-editor-text)",
    border: "1px solid var(--order-editor-border)",
  },
});

const orderMarkdownHighlight = HighlightStyle.define([
  {
    tag: [
      tags.heading1,
      tags.heading2,
      tags.heading3,
      tags.heading4,
      tags.heading5,
      tags.heading6,
    ],
    color: "var(--order-editor-accent)",
    fontWeight: "700",
  },
  { tag: tags.strong, fontWeight: "700" },
  { tag: tags.emphasis, fontStyle: "italic" },
  {
    tag: [tags.link, tags.url],
    color: "var(--order-editor-link)",
    textDecoration: "underline",
  },
  { tag: tags.monospace, color: "var(--order-editor-code)" },
  {
    tag: tags.quote,
    color: "var(--order-editor-muted)",
    fontStyle: "italic",
  },
  { tag: tags.list, color: "var(--order-editor-accent)" },
  {
    tag: [
      tags.processingInstruction,
      tags.meta,
      tags.contentSeparator,
      tags.punctuation,
    ],
    color: "var(--order-editor-muted)",
  },
  { tag: tags.comment, color: "var(--order-editor-muted)" },
]);

const minimalChange = (
  before: string,
  after: string,
): Readonly<{ from: number; to: number; insert: string }> => {
  let prefix = 0;
  const maximumPrefix = Math.min(before.length, after.length);
  while (prefix < maximumPrefix && before[prefix] === after[prefix]) prefix += 1;

  let suffix = 0;
  const maximumSuffix = Math.min(before.length - prefix, after.length - prefix);
  while (
    suffix < maximumSuffix &&
    before[before.length - 1 - suffix] === after[after.length - 1 - suffix]
  ) {
    suffix += 1;
  }

  return {
    from: prefix,
    to: before.length - suffix,
    insert: after.slice(prefix, after.length - suffix),
  };
};

export const MarkdownSourceEditor = forwardRef<
  MarkdownSourceEditorHandle,
  MarkdownSourceEditorProps
>(function MarkdownSourceEditor(
  {
    value,
    disabled,
    ariaLabel,
    onChange,
  },
  ref,
) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const initialValueRef = useRef(value);
  const programmaticRef = useRef(false);
  const editableCompartmentRef = useRef(new Compartment());

  onChangeRef.current = onChange;

  useImperativeHandle(ref, () => ({
    focus: () => viewRef.current?.focus(),
    undo: () => {
      const view = viewRef.current;
      if (view !== null) undo(view);
    },
    redo: () => {
      const view = viewRef.current;
      if (view !== null) redo(view);
    },
    format: (command) => {
      const view = viewRef.current;
      if (view === null || !view.state.facet(EditorView.editable)) return;
      const selection = view.state.selection.main;
      const current = view.state.doc.toString();
      const result = applyMarkdownFormat(current, {
        from: selection.from,
        to: selection.to,
      }, command);
      if (result.markdown === current) return;
      const change = minimalChange(current, result.markdown);
      view.dispatch({
        changes: change,
        selection: {
          anchor: result.selection.from,
          head: result.selection.to,
        },
        scrollIntoView: true,
      });
      view.focus();
    },
  }), []);

  useEffect(() => {
    const host = hostRef.current;
    if (host === null) return;

    const view = new EditorView({
      doc: initialValueRef.current,
      parent: host,
      extensions: [
        basicSetup,
        markdown(),
        EditorView.lineWrapping,
        editableCompartmentRef.current.of(EditorView.editable.of(!disabled)),
        EditorView.contentAttributes.of({
          "aria-label": ariaLabel,
          "data-testid": "markdown-source-content",
        }),
        orderEditorTheme,
        syntaxHighlighting(orderMarkdownHighlight),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !programmaticRef.current) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
      ],
    });
    viewRef.current = view;

    return () => {
      viewRef.current = null;
      view.destroy();
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (view === null) return;
    view.dispatch({
      effects: editableCompartmentRef.current.reconfigure(
        EditorView.editable.of(!disabled),
      ),
    });
  }, [disabled]);

  useEffect(() => {
    const view = viewRef.current;
    if (view === null) return;
    const current = view.state.doc.toString();
    if (current === value) return;

    const selection = view.state.selection.main;
    const anchor = Math.min(selection.anchor, value.length);
    const head = Math.min(selection.head, value.length);
    programmaticRef.current = true;
    try {
      view.dispatch({
        changes: {
          from: 0,
          to: current.length,
          insert: value,
        },
        selection: { anchor, head },
      });
    } finally {
      programmaticRef.current = false;
    }
  }, [value]);

  return (
    <div
      ref={hostRef}
      className="order-markdown-source-editor"
      data-testid="markdown-source-editor"
    />
  );
});
