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
import { WorkbenchNotice } from "./primitives/WorkbenchNotice.tsx";
import { WorkbenchStatus } from "./primitives/WorkbenchStatus.tsx";

export type MarkdownEditorProps = Readonly<{
  sourceLabel: string;
  sha256: Sha256;
  markdown: string;
  readOnly: boolean;
  saveDisabled?: boolean;
  onSave: (expectedSha256: Sha256, markdown: string) => Promise<ExpectedHashWriteResult>;
  onDirtyChange?: (dirty: boolean) => void;
  saveConsequence?: string;
  toolbarAccessory?: ReactNode;
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

const presentationMarkdown = (value: string): string =>
  value
    .split("\n")
    .filter((line) => !(line.startsWith("<!-- Order template: ") && line.endsWith(" -->")))
    .join("\n");

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
  sourceLabel,
  sha256,
  markdown,
  readOnly,
  saveDisabled = false,
  onSave,
  onDirtyChange,
  saveConsequence,
  toolbarAccessory,
}: MarkdownEditorProps) => {
  const sourceEditorRef = useRef<MarkdownSourceEditorHandle | null>(null);
  const onDirtyChangeRef = useRef(onDirtyChange);
  onDirtyChangeRef.current = onDirtyChange;
  const [loadedSha256, setLoadedSha256] = useState(sha256);
  const [loadedMarkdown, setLoadedMarkdown] = useState(markdown);
  const [buffer, setBuffer] = useState(markdown);
  const [conflicted, setConflicted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const editablePresentationMode = useRef<MarkdownPresentationMode>("SPLIT");
  const [presentationMode, setPresentationMode] =
    useState<MarkdownPresentationMode>("SPLIT");

  const dirty = buffer !== loadedMarkdown;
  const sourceVisible = editing && presentationMode !== "PREVIEW";
  const formattingDisabled = conflicted || saving || !sourceVisible;

  useEffect(() => {
    onDirtyChangeRef.current?.(dirty);
  }, [dirty]);
  useEffect(() => () => onDirtyChangeRef.current?.(false), []);

  useEffect(() => {
    if (readOnly) setEditing(false);
    setPresentationMode(editablePresentationMode.current);
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
    onDirtyChangeRef.current?.(false);
  };

  const cancel = (): void => {
    setBuffer(loadedMarkdown);
    setSaveError(null);
    setEditing(false);
    onDirtyChangeRef.current?.(false);
  };

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (readOnly || saveDisabled || !dirty || conflicted || saving) return;
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
      onDirtyChangeRef.current?.(false);
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
      className={readOnly ? "order-markdown-readonly" : "order-markdown-preview"}
    >
      <Markdown contentWidth="var(--order-prose-max-width)" contentAlign="start">
        {presentationMarkdown(readOnly ? markdown : buffer)}
      </Markdown>
    </div>
  );

  const presentation = (
    <SegmentedControl
      label="Document presentation"
      value={presentationMode}
      onChange={(value) => {
        if (value === "EDIT" || value === "PREVIEW" || value === "SPLIT") {
          editablePresentationMode.current = value;
          setPresentationMode(value);
        }
      }}
      size="sm"
    >
      <SegmentedControlItem value="EDIT" label="Edit" />
      <SegmentedControlItem value="PREVIEW" label="Preview" />
      <SegmentedControlItem value="SPLIT" label="Split" />
    </SegmentedControl>
  );

  const formatting = (
    <div data-testid="markdown-format-toolbar" className="order-markdown-format-toolbar">
      <span className="order-markdown-format-group">
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
      </span>
      <span className="order-markdown-format-group">
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
      </span>
      <span className="order-markdown-format-group">
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
      </span>
    </div>
  );

  if (!editing) {
    return (
      <div
        className="order-markdown-document-view"
        data-testid={readOnly ? "markdown-document-readonly" : "markdown-document-view"}
      >
        {readOnly ? null : (
          <div className="order-markdown-editor-controls" data-testid="markdown-editor-controls">
            <div className="order-markdown-editor-actions">
              {toolbarAccessory}
              <WorkbenchAction
                label="Edit"
                tone="secondary"
                onClick={() => {
                  editablePresentationMode.current = "SPLIT";
                  setPresentationMode("SPLIT");
                  setEditing(true);
                }}
              />
            </div>
          </div>
        )}
        {preview}
      </div>
    );
  }

  return (
    <form className="order-markdown-editor" onSubmit={(event) => void submit(event)}>
      <div className="order-markdown-editor-controls" data-testid="markdown-editor-controls">
        {presentation}
        {formatting}
        <div className="order-markdown-editor-actions">
          {toolbarAccessory}
          <WorkbenchStatus
            tone={dirty ? "warning" : "success"}
            label={dirty ? "Unsaved" : "No unsaved edits"}
          />
          <WorkbenchAction
            type="submit"
            label={saving ? "Saving…" : "Save"}
            tone="primary"
            loading={saving}
            disabled={saveDisabled || !dirty || conflicted || saving}
          />
          <WorkbenchAction
            label="Cancel"
            disabled={saving}
            onClick={cancel}
          />
        </div>
      </div>

      <div className="order-editor-notices">
        {dirty && !saveDisabled && !conflicted && saveConsequence !== undefined ? (
          <WorkbenchNotice tone="info" title="Effect of saving" description={saveConsequence} />
        ) : null}
        {conflicted ? (
          <WorkbenchNotice
            tone="danger"
            title="Canonical document changed"
            description="The canonical file changed while this buffer was open. The local buffer was not rebased or overwritten."
            action={<WorkbenchAction label="Reload current" onClick={reloadCurrent} />}
          />
        ) : null}
        {saveError ? (
          <WorkbenchNotice
            tone="danger"
            title="Document save failed"
            description={saveError}
          />
        ) : null}
      </div>

      <div
        className={"order-editor-body order-editor-mode-" + presentationMode.toLowerCase()}
        data-testid="markdown-editor-body"
      >
        <div
          className={"order-editor-source-pane" + (sourceVisible ? "" : " order-editor-source-pane-hidden")}
          aria-hidden={sourceVisible ? undefined : true}
        >
          <MarkdownSourceEditor
            ref={sourceEditorRef}
            value={buffer}
            disabled={conflicted || saving}
            ariaLabel={sourceLabel + " Markdown source"}
            onChange={setBuffer}
          />
        </div>
        {presentationMode !== "EDIT" ? (
          <div className="order-editor-preview-pane">
            {preview}
          </div>
        ) : null}
      </div>
    </form>
  );
};
