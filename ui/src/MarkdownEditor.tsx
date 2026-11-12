import { useEffect, useState, type FormEvent } from "react";
import { Markdown } from "@astryxdesign/core/Markdown";
import { TextArea } from "@astryxdesign/core/TextArea";

import { type ExpectedHashWriteResult, type Sha256 } from "../../src/core/contracts.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";

export type MarkdownEditorProps = Readonly<{
  title: string;
  description?: string;
  sha256: Sha256;
  markdown: string;
  readOnly: boolean;
  onSave: (expectedSha256: Sha256, markdown: string) => Promise<ExpectedHashWriteResult>;
  onDirtyChange?: (dirty: boolean) => void;
}>;

export const MarkdownEditor = ({
  title,
  description,
  sha256,
  markdown,
  readOnly,
  onSave,
  onDirtyChange,
}: MarkdownEditorProps) => {
  const [loadedSha256, setLoadedSha256] = useState(sha256);
  const [loadedMarkdown, setLoadedMarkdown] = useState(markdown);
  const [buffer, setBuffer] = useState(markdown);
  const [conflicted, setConflicted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const dirty = buffer !== loadedMarkdown;
  useEffect(() => onDirtyChange?.(dirty), [dirty, onDirtyChange]);
  useEffect(() => () => onDirtyChange?.(false), [onDirtyChange]);

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

  return (
    <form className="order-markdown-editor" onSubmit={(event) => void submit(event)}>
      <div className="order-editor-heading">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
      </div>

      <div className="order-editor-body">
        {readOnly ? (
          <div data-testid="markdown-readonly" className="order-markdown-readonly">
            <Markdown contentWidth="52rem" contentAlign="start">{buffer}</Markdown>
          </div>
        ) : (
          <TextArea
            label={title + " Markdown"}
            isLabelHidden
            value={buffer}
            onChange={(value) => setBuffer(value)}
            isDisabled={conflicted}
            rows={12}
            width="100%"
            containerClassName="order-markdown-field"
            controlClassName="order-markdown-textarea"
          />
        )}
      </div>

      {conflicted ? (
        <div role="alert" className="order-warning">
          The canonical file changed while this buffer was open. The local buffer was not rebased or overwritten.
          <div><WorkbenchAction label="Reload current" onClick={reloadCurrent} /></div>
        </div>
      ) : null}
      {saveError ? <div role="alert" className="order-error">{saveError}</div> : null}

      <div className="order-editor-actionbar">
        <details className="order-editor-identity">
          <summary>Identity</summary>
          <code>{loadedSha256}</code>
        </details>
        {!readOnly ? (
          <div className="order-inline-actions">
            <span className="order-editor-dirty-state">{dirty ? "Unsaved" : "Current"}</span>
            <WorkbenchAction type="submit" label={saving ? "Saving…" : "Save"} tone="primary" disabled={!dirty || conflicted || saving} />
            <WorkbenchAction label="Cancel" disabled={!dirty || saving} onClick={cancel} />
          </div>
        ) : null}
      </div>
    </form>
  );
};
