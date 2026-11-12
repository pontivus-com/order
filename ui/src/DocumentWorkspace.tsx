import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertDialog } from "@astryxdesign/core/AlertDialog";
import { Tab, TabList } from "@astryxdesign/core/TabList";

import {
  MarkdownTextSchema,
  type ArtifactRef,
  type WorkItem,
} from "../../src/core/contracts.ts";
import { artifactDirectEditIsAllowed } from "../../src/core/lifecycle.ts";
import * as api from "./http.ts";
import { workbenchQueryKeys } from "./query-keys.ts";
import { MarkdownEditor } from "./MarkdownEditor.tsx";
import { lifecycleArtifactRoleRank } from "./workbench-presentation.ts";
import { WorkbenchEmptyState, WorkbenchErrorState } from "./primitives/WorkbenchState.tsx";

type SelectedDocument =
  | Readonly<{ kind: "SOURCE" }>
  | Readonly<{ kind: "ARTIFACT"; id: ArtifactRef["id"] }>;

const errorText = (value: unknown): string => value instanceof Error ? value.message : String(value);
const decodeCanonicalMarkdown = (bytes: Uint8Array): string | null => {
  try {
    const parsed = MarkdownTextSchema.safeParse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
};

export const DocumentWorkspace = ({
  workItem,
  onDirtyChange,
  onOpenArtifactEvidence,
}: Readonly<{
  workItem: WorkItem;
  onDirtyChange: (dirty: boolean) => void;
  onOpenArtifactEvidence: (artifactId: ArtifactRef["id"]) => void;
}>) => {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<SelectedDocument>({ kind: "SOURCE" });
  const [selectionInitialized, setSelectionInitialized] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<SelectedDocument | null>(null);

  const sourceQuery = useQuery({ queryKey: workbenchQueryKeys.workItemSource(workItem.id), queryFn: () => api.getWorkItemSource(workItem.id) });
  const artifactsQuery = useQuery({ queryKey: workbenchQueryKeys.lifecycleArtifacts(workItem.id), queryFn: () => api.listLifecycleArtifacts(workItem.id) });
  const artifacts = useMemo(
    () => [...(artifactsQuery.data ?? [])].sort((a, b) => lifecycleArtifactRoleRank(a.role) - lifecycleArtifactRoleRank(b.role)),
    [artifactsQuery.data],
  );

  useEffect(() => {
    if (selectionInitialized || artifactsQuery.isPending) return;
    if (
      workItem.stage === "R1" ||
      workItem.stage === "R2" ||
      workItem.stage === "DESIGN" ||
      workItem.stage === "PLAN" ||
      workItem.stage === "R3"
    ) {
      const current = artifacts.find((artifact) => artifact.role === workItem.stage);
      if (current) setSelected({ kind: "ARTIFACT", id: current.id });
    }
    setSelectionInitialized(true);
  }, [artifacts, artifactsQuery.isPending, selectionInitialized, workItem.stage]);

  const selectedArtifact = selected.kind === "ARTIFACT" ? artifacts.find((item) => item.id === selected.id) ?? null : null;
  const contentQuery = useQuery({
    queryKey: workbenchQueryKeys.artifactContent(selectedArtifact?.id ?? null),
    queryFn: () => {
      if (!selectedArtifact) throw new TypeError("lifecycle artifact selection required");
      return api.readArtifactContent(selectedArtifact.id);
    },
    enabled: selectedArtifact !== null,
  });
  const markdown = contentQuery.data === undefined ? null : decodeCanonicalMarkdown(contentQuery.data);

  const invalidate = async (): Promise<void> => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.workItems }),
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.workItemSource(workItem.id) }),
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.lifecycleArtifacts(workItem.id) }),
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.artifacts(workItem.id) }),
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.signoffPackage(workItem.id) }),
    ]);
  };

  const select = (next: SelectedDocument): void => {
    if (dirty) setPendingSelection(next);
    else setSelected(next);
  };

  const sourceReadOnly = workItem.stage === "EXECUTION" || workItem.stage === "COMPLETE";
  const artifactReadOnly = selectedArtifact === null || !artifactDirectEditIsAllowed(workItem, selectedArtifact);

  return (
    <section className="order-workspace-section" data-testid="document-workspace">
      <div className="order-document-nav" data-testid="governed-document-nav">
        <TabList
          value={selected.kind === "SOURCE" ? "SOURCE" : selected.id}
          onChange={(value) => {
            if (value === "SOURCE") select({ kind: "SOURCE" });
            else {
              const artifact = artifacts.find((item) => item.id === value);
              if (artifact) select({ kind: "ARTIFACT", id: artifact.id });
            }
          }}
          role="tablist"
          overflow="scroll"
        >
          <Tab value="SOURCE" label="Source" />
          {artifacts.map((artifact) => <Tab key={artifact.id} value={artifact.id} label={artifact.role} />)}
        </TabList>
      </div>

      <div className="order-document-canvas">
        {selected.kind === "SOURCE" ? (
          sourceQuery.isPending ? <WorkbenchEmptyState compact title="Loading source…" /> :
          sourceQuery.isError ? <WorkbenchErrorState title="Source unavailable" description={errorText(sourceQuery.error)} /> :
          sourceQuery.data ? (
            <MarkdownEditor
              key={"source-" + workItem.id}
              title="WorkItem source"
              description={sourceReadOnly ? "Read-only in execution/completed state." : "Canonical originating work definition."}
              sha256={sourceQuery.data.sha256}
              markdown={sourceQuery.data.markdown}
              readOnly={sourceReadOnly}
              onDirtyChange={(value) => { setDirty(value); onDirtyChange(value); }}
              onSave={async (expectedSha256, value) => {
                const result = await api.saveWorkItemSource(workItem.id, { expectedSha256, markdown: value });
                await invalidate();
                return result;
              }}
            />
          ) : null
        ) : selectedArtifact === null ? (
          <WorkbenchEmptyState compact title="Lifecycle document is no longer current" />
        ) : contentQuery.isPending ? (
          <WorkbenchEmptyState compact title="Loading lifecycle document…" />
        ) : contentQuery.isError ? (
          <WorkbenchErrorState title="Lifecycle document unavailable" description={errorText(contentQuery.error)} />
        ) : contentQuery.data && markdown === null ? (
          <div className="order-state">
            <strong>Lifecycle document is not canonical editable Markdown</strong>
            <div>The exact bytes remain inspection-only and will not be normalized or overwritten.</div>
            <button type="button" onClick={() => onOpenArtifactEvidence(selectedArtifact.id)}>Inspect exact bytes</button>
          </div>
        ) : contentQuery.data && markdown !== null ? (
          <MarkdownEditor
            key={selectedArtifact.id}
            title={selectedArtifact.role + " lifecycle document"}
            description={artifactReadOnly ? "Read-only in the current lifecycle state." : selectedArtifact.repositoryPath}
            sha256={selectedArtifact.sha256}
            markdown={markdown}
            readOnly={artifactReadOnly}
            onDirtyChange={(value) => { setDirty(value); onDirtyChange(value); }}
            onSave={async (expectedSha256, value) => {
              const result = await api.saveArtifactContent(selectedArtifact.id, { expectedSha256, markdown: value });
              await invalidate();
              return result;
            }}
          />
        ) : null}
      </div>

      <AlertDialog
        isOpen={pendingSelection !== null}
        onOpenChange={(open) => { if (!open) setPendingSelection(null); }}
        title="Discard unsaved Markdown?"
        description="Changing documents would discard the current unsaved Markdown buffer."
        cancelLabel="Continue editing"
        actionLabel="Discard unsaved changes"
        actionVariant="destructive"
        onAction={() => {
          const next = pendingSelection;
          setPendingSelection(null);
          setDirty(false);
          onDirtyChange(false);
          if (next) setSelected(next);
        }}
      />
    </section>
  );
};
