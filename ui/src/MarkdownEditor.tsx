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
import { WorkbenchDisclosure } from "./primitives/WorkbenchDisclosure.tsx";
import {
  WorkbenchIcon,
  type WorkbenchIconName,
} from "./primitives/WorkbenchIcon.tsx";
import { WorkbenchNotice } from "./primitives/WorkbenchNotice.tsx";
import { WorkbenchSectionHeader } from "./primitives/WorkbenchSectionHeader.tsx";
import { WorkbenchStatus } from "./primitives/WorkbenchStatus.tsx";
import {
  WorkbenchToolbar,
  WorkbenchToolbarGroup,
} from "./primitives/WorkbenchToolbar.tsx";

export type MarkdownEditorProps = Readonly<{
  title: string;
  description?: string;
  sha256: Sha256;
  markdown: string;
  readOnly: boolean;
  saveDisabled?: boolean;
  onSave: (expectedSha256: Sha256, markdown: string) => Promise<ExpectedHashWriteResult>;
  onDirtyChange?: (dirty: boolean) => void;
  toolbarAccessory?: ReactNode;
  technicalDetails?: ReactNode;
  editingTitle?: string;
  viewAside?: ReactNode;
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
  saveDisabled = false,
  onSave,
  onDirtyChange,
  toolbarAccessory,
  technicalDetails,
  editingTitle,
  viewAside,
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
      className="order-markdown-preview"
    >
      <Markdown contentWidth="var(--order-prose-max-width)" contentAlign="start">
        {buffer}
      </Markdown>
    </div>
  );

  const presentation = !editing ? undefined : (
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

  const formatting = !editing ? undefined : (
    <div data-testid="markdown-format-toolbar" className="order-markdown-format-toolbar">
      <WorkbenchToolbarGroup>
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
      </WorkbenchToolbarGroup>
      <WorkbenchToolbarGroup>
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
      </WorkbenchToolbarGroup>
      <WorkbenchToolbarGroup>
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
      </WorkbenchToolbarGroup>
    </div>
  );

  if (!editing) {
    return (
      <section className="order-markdown-document-view" data-testid={readOnly ? "markdown-document-readonly" : "markdown-document-view"}>
        <header className="order-markdown-document-view-header">
          <div>
            <h2>{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>
          <div className="order-markdown-document-view-actions">
            {readOnly ? <WorkbenchStatus tone="neutral" label="Read-only supporting material" /> : toolbarAccessory}
            {!readOnly ? <WorkbenchAction label="Edit" tone="secondary" onClick={() => { editablePresentationMode.current = "SPLIT"; setPresentationMode("SPLIT"); setEditing(true); }} /> : null}
          </div>
        </header>
        <div className={"order-markdown-document-view-body" + (viewAside ? " order-markdown-document-view-with-aside" : "")}>
          {preview}
          {viewAside ? <aside className="order-markdown-document-view-aside">{viewAside}</aside> : null}
        </div>
        <WorkbenchDisclosure
          label="Technical details"
          content={<div className="order-editor-technical-content"><div><span>SHA-256</span><code>{loadedSha256}</code></div>{technicalDetails}</div>}
        />
      </section>
    );
  }

  return (
    <form className="order-markdown-editor" onSubmit={(event) => void submit(event)}>
      <WorkbenchSectionHeader
        title={editingTitle ?? title}
        description={description}
        action={presentation}
      />

      <WorkbenchToolbar
        start={formatting}
        end={
          <WorkbenchToolbarGroup>
            {toolbarAccessory}
            <WorkbenchDisclosure
              label="Technical details"
              content={
                <div className="order-editor-technical-content">
                  <div><span>SHA-256</span><code>{loadedSha256}</code></div>
                  {technicalDetails}
                </div>
              }
            />
            {!readOnly ? (
              <>
                <WorkbenchStatus
                  tone={dirty ? "warning" : "success"}
                  label={dirty ? "Unsaved" : "Current"}
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
              </>
            ) : null}
          </WorkbenchToolbarGroup>
        }
      />

      <div className="order-editor-notices">
        {conflicted ? (
          <WorkbenchNotice
            tone="warning"
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
        {readOnly ? preview : (
          <>
            {sourceVisible ? (
              <div className="order-editor-source-pane">
                <MarkdownSourceEditor
                  ref={sourceEditorRef}
                  value={buffer}
                  disabled={conflicted || saving}
                  ariaLabel={(editingTitle ?? title) + " Markdown source"}
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
    </form>
  );
};
