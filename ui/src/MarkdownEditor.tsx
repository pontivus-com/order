import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Markdown } from "@astryxdesign/core/Markdown";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@astryxdesign/core/SegmentedControl";

import { type ExpectedHashWriteResult, type Sha256 } from "../../src/core/contracts.ts";
import {
  MarkdownSourceEditor,
  type MarkdownSourceEditorHandle,
} from "./MarkdownSourceEditor.tsx";
import type { MarkdownFormatCommand } from "./markdown-source-formatting.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import {
  WorkbenchIcon,
  type WorkbenchIconName,
} from "./primitives/WorkbenchIcon.tsx";

export type MarkdownEditorProps = Readonly<{
  title: string;
  description?: string;
  sha256: Sha256;
  markdown: string;
  readOnly: boolean;
  onSave: (expectedSha256: Sha256, markdown: string) => Promise<ExpectedHashWriteResult>;
  onDirtyChange?: (dirty: boolean) => void;
  toolbarAccessory?: ReactNode;
  technicalDetails?: ReactNode;
}>;

type MarkdownPresentationMode = "EDIT" | "PREVIEW" | "SPLIT";

type FormatAction = Readonly<{
  command: MarkdownFormatCommand;
  label: string;
  icon: WorkbenchIconName;
}>;

const historyActions = [
  { label: "Undo", icon: "undo" },
  { label: "Redo", icon: "redo" },
] as const;

const inlineActions: readonly FormatAction[] = [
  { command: "BOLD", label: "Bold", icon: "bold" },
  { command: "ITALIC", label: "Italic", icon: "italic" },
  { command: "INLINE_CODE", label: "Inline code", icon: "inlineCode" },
  { command: "LINK", label: "Link", icon: "link" },
];

const structureActions: readonly FormatAction[] = [
  { command: "HEADING_1", label: "Heading 1", icon: "heading1" },
  { command: "HEADING_2", label: "Heading 2", icon: "heading2" },
  { command: "HEADING_3", label: "Heading 3", icon: "heading3" },
  { command: "BLOCKQUOTE", label: "Blockquote", icon: "quote" },
  { command: "BULLET_LIST", label: "Bulleted list", icon: "bulletList" },
  { command: "NUMBERED_LIST", label: "Numbered list", icon: "numberedList" },
  { command: "FENCED_CODE", label: "Fenced code block", icon: "codeBlock" },
  { command: "HORIZONTAL_RULE", label: "Horizontal rule", icon: "horizontalRule" },
];

export const MarkdownEditor = ({
  title,
  description,
  sha256,
  markdown,
  readOnly,
  onSave,
  onDirtyChange,
  toolbarAccessory,
  technicalDetails,
}: MarkdownEditorProps) => {
  const sourceEditorRef = useRef<MarkdownSourceEditorHandle | null>(null);
  const [loadedSha256, setLoadedSha256] = useState(sha256);
  const [loadedMarkdown, setLoadedMarkdown] = useState(markdown);
  const [buffer, setBuffer] = useState(markdown);
  const [conflicted, setConflicted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [presentationMode, setPresentationMode] =
    useState<MarkdownPresentationMode>(readOnly ? "PREVIEW" : "EDIT");

  const dirty = buffer !== loadedMarkdown;
  const sourceVisible = !readOnly && presentationMode !== "PREVIEW";
  const formattingDisabled = conflicted || saving || !sourceVisible;

  useEffect(() => onDirtyChange?.(dirty), [dirty, onDirtyChange]);
  useEffect(() => () => onDirtyChange?.(false), [onDirtyChange]);

  useEffect(() => {
    if (readOnly) setPresentationMode("PREVIEW");
  }, [readOnly]);

  useEffect(() => {
    if (sha256 === loadedSha256 || saving) return;
    if (dirty || conflicted) {
      setConflicted(true);
      return;
    }
    setLoadedSha256(sha256);
    setLoadedMarkdown(markdown);
    setBuffer(markdown);
  }, [conflicted, dirty, loadedSha256, markdown, saving, sha256]);

  const reloadCurrent = (): void => {
    setLoadedSha256(sha256);
    setLoadedMarkdown(markdown);
    setBuffer(markdown);
    setConflicted(false);
    setSaveError(null);
    onDirtyChange?.(false);
  };

  const cancel = (): void => {
    setBuffer(loadedMarkdown);
    setSaveError(null);
    onDirtyChange?.(false);
  };

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (readOnly || !dirty || conflicted || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      const result = await onSave(loadedSha256, buffer);
      if (result.tag === "STALE") {
        setConflicted(true);
        return;
      }
      setLoadedSha256(result.sha256);
      setLoadedMarkdown(buffer);
      onDirtyChange?.(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  };

  const format = (command: MarkdownFormatCommand): void => {
    sourceEditorRef.current?.format(command);
  };

  const preview = (
    <div
      data-testid={readOnly ? "markdown-readonly" : "markdown-preview"}
      className="order-markdown-preview"
    >
      <Markdown contentWidth="52rem" contentAlign="start">{buffer}</Markdown>
    </div>
  );

  return (
    <form className="order-markdown-editor" onSubmit={(event) => void submit(event)}>
      <div className="order-editor-toolbar" data-testid="markdown-editor-toolbar">
        <div className="order-editor-toolbar-main">
          <div className="order-editor-heading">
            <div>
              <h2>{title}</h2>
              {description ? <p>{description}</p> : null}
            </div>
            {!readOnly ? (
              <SegmentedControl
                label="Document presentation"
                value={presentationMode}
                onChange={(value) => {
                  if (value === "EDIT" || value === "PREVIEW" || value === "SPLIT") {
                    setPresentationMode(value);
                  }
                }}
                size="sm"
              >
                <SegmentedControlItem value="EDIT" label="Edit" />
                <SegmentedControlItem value="PREVIEW" label="Preview" />
                <SegmentedControlItem value="SPLIT" label="Split" />
              </SegmentedControl>
            ) : null}
          </div>

          {!readOnly ? (
            <div
              className="order-markdown-format-toolbar"
              role="toolbar"
              aria-label="Markdown formatting"
              data-testid="markdown-format-toolbar"
            >
              <div className="order-markdown-format-group" aria-label="History">
                <WorkbenchAction
                  label={historyActions[0].label}
                  icon={<WorkbenchIcon name={historyActions[0].icon} />}
                  iconOnly
                  disabled={formattingDisabled}
                  onClick={() => sourceEditorRef.current?.undo()}
                />
                <WorkbenchAction
                  label={historyActions[1].label}
                  icon={<WorkbenchIcon name={historyActions[1].icon} />}
                  iconOnly
                  disabled={formattingDisabled}
                  onClick={() => sourceEditorRef.current?.redo()}
                />
              </div>
              <div className="order-markdown-format-group" aria-label="Inline formatting">
                {inlineActions.map((action) => (
                  <WorkbenchAction
                    key={action.command}
                    label={action.label}
                    icon={<WorkbenchIcon name={action.icon} />}
                    iconOnly
                    disabled={formattingDisabled}
                    onClick={() => format(action.command)}
                  />
                ))}
              </div>
              <div className="order-markdown-format-group" aria-label="Block formatting">
                {structureActions.map((action) => (
                  <WorkbenchAction
                    key={action.command}
                    label={action.label}
                    icon={<WorkbenchIcon name={action.icon} />}
                    iconOnly
                    disabled={formattingDisabled}
                    onClick={() => format(action.command)}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="order-editor-toolbar-actions">
          {toolbarAccessory}
          <details className="order-editor-identity">
            <summary>Technical details</summary>
            <div className="order-editor-technical-content">
              <div><span>SHA-256</span><code>{loadedSha256}</code></div>
              {technicalDetails}
            </div>
          </details>
          {!readOnly ? (
            <div className="order-inline-actions">
              <span className="order-editor-dirty-state">{dirty ? "Unsaved" : "Current"}</span>
              <WorkbenchAction
                type="submit"
                label={saving ? "Saving…" : "Save"}
                tone="primary"
                disabled={!dirty || conflicted || saving}
              />
              <WorkbenchAction
                label="Cancel"
                disabled={!dirty || saving}
                onClick={cancel}
              />
            </div>
          ) : null}
        </div>
      </div>

      <div
        className={"order-editor-body order-editor-mode-" + presentationMode.toLowerCase()}
        data-testid="markdown-editor-body"
      >
        {readOnly ? preview : (
          <>
            {sourceVisible ? (
              <div className="order-editor-source-pane">
                <MarkdownSourceEditor
                  ref={sourceEditorRef}
                  value={buffer}
                  disabled={conflicted || saving}
                  ariaLabel={title + " Markdown source"}
                  onChange={setBuffer}
                />
              </div>
            ) : null}
            {presentationMode !== "EDIT" ? (
              <div className="order-editor-preview-pane">
                {preview}
              </div>
            ) : null}
          </>
        )}
      </div>

      {conflicted ? (
        <div role="alert" className="order-warning">
          The canonical file changed while this buffer was open. The local buffer was not rebased or overwritten.
          <div><WorkbenchAction label="Reload current" onClick={reloadCurrent} /></div>
        </div>
      ) : null}
      {saveError ? <div role="alert" className="order-error">{saveError}</div> : null}

    </form>
  );
};
