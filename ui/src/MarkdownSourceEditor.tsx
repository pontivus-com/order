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
    backgroundColor: "var(--color-background-surface)",
    color: "var(--color-text-primary)",
    border: "1px solid var(--color-border-emphasized)",
  },
  "&.cm-focused": {
    outline: "var(--focus-outline-width) var(--focus-outline-style) var(--focus-outline-color)",
    outlineOffset: "var(--focus-outline-offset)",
  },
  ".cm-scroller": {
    height: "100%",
    minHeight: "0",
    overflow: "auto",
    fontFamily: "var(--font-family-code)",
    lineHeight: "1.55",
  },
  ".cm-content": {
    minHeight: "100%",
    padding: "var(--spacing-3) 0",
    caretColor: "var(--color-text-accent)",
  },
  ".cm-line": {
    padding: "0 var(--spacing-3)",
  },
  ".cm-cursor, .cm-dropCursor": {
    borderLeftColor: "var(--color-text-accent)",
  },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
    backgroundColor: "var(--color-info-muted)",
  },
  ".cm-activeLine": {
    backgroundColor: "var(--color-background-muted)",
  },
  ".cm-gutters": {
    backgroundColor: "var(--color-background-muted)",
    color: "var(--color-text-secondary)",
    borderRight: "1px solid var(--color-border-emphasized)",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "var(--color-background-muted)",
    color: "var(--color-text-primary)",
  },
  ".cm-panels": {
    backgroundColor: "var(--color-background-muted)",
    color: "var(--color-text-primary)",
  },
  ".cm-panel.cm-search": {
    borderBottom: "1px solid var(--color-border-emphasized)",
  },
  ".cm-searchMatch": {
    backgroundColor: "var(--color-warning-muted)",
    outline: "1px solid var(--color-text-warning)",
  },
  ".cm-searchMatch.cm-searchMatch-selected": {
    backgroundColor: "var(--color-info-muted)",
  },
  ".cm-tooltip": {
    backgroundColor: "var(--color-background-surface)",
    color: "var(--color-text-primary)",
    border: "1px solid var(--color-border-emphasized)",
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
    color: "var(--color-text-primary)",
    fontWeight: "700",
  },
  { tag: tags.strong, fontWeight: "700" },
  { tag: tags.emphasis, fontStyle: "italic" },
  {
    tag: [tags.link, tags.url],
    color: "var(--color-text-accent)",
    textDecoration: "underline",
  },
  { tag: tags.monospace, color: "var(--color-text-primary)" },
  {
    tag: tags.quote,
    color: "var(--color-text-secondary)",
    fontStyle: "italic",
  },
  { tag: tags.list, color: "var(--color-text-primary)" },
  {
    tag: [
      tags.processingInstruction,
      tags.meta,
      tags.contentSeparator,
      tags.punctuation,
    ],
    color: "var(--color-text-secondary)",
  },
  { tag: tags.comment, color: "var(--color-text-secondary)" },
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
