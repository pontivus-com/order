import { MultiSelector } from "@astryxdesign/core/MultiSelector";
import { RadioList, RadioListItem } from "@astryxdesign/core/RadioList";
import { Selector } from "@astryxdesign/core/Selector";
import { TextInput } from "@astryxdesign/core/TextInput";
import type { FormEvent } from "react";

import { WorkItemSchemaIdSchema, type ProjectManifest, type WorkItemId, type WorkItemSchemaCatalogEntry, type WorkItemSchemaId } from "../../src/core/contracts.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchForm } from "./primitives/WorkbenchForm.tsx";
import { WorkbenchIcon } from "./primitives/WorkbenchIcon.tsx";
import { WorkbenchNotice } from "./primitives/WorkbenchNotice.tsx";

export const CreateWorkItem = ({
  projects, schemas, projectId, schemaId, title, concernIds, availableConcernIds,
  derivedFromWorkItemId, pending, error, onProjectChange, onSchemaChange,
  onTitleChange, onConcernIdsChange, onSubmit,
}: Readonly<{
  projects: readonly ProjectManifest[]; schemas: readonly WorkItemSchemaCatalogEntry[];
  projectId: string; schemaId: WorkItemSchemaId | ""; title: string; concernIds: readonly string[];
  availableConcernIds: readonly string[]; derivedFromWorkItemId: WorkItemId | null;
  pending: boolean; error: string | null; onProjectChange: (value: string) => void;
  onSchemaChange: (value: WorkItemSchemaId) => void; onTitleChange: (value: string) => void;
  onConcernIdsChange: (value: readonly string[]) => void; onSubmit: () => void;
}>) => {
  const eligibleSchemas = schemas.filter((schema) => derivedFromWorkItemId === null || schema.kind === "CHANGE" || schema.kind === "DEFECT");
  const selectedProject = projects.find((project) => project.projectId === projectId) ?? null;
  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (projectId.length > 0 && schemaId !== "" && title.trim().length > 0) onSubmit();
  };

  return (
    <WorkbenchForm
      onSubmit={submit}
      content={<>
        <Selector
          label="Project"
          options={projects.map((project) => ({ value: project.projectId, label: project.projectId }))}
          value={projectId}
          onChange={onProjectChange}
          isRequired
          width="100%"
        />
        {selectedProject ? <div className="order-create-location" data-testid="create-work-item-location"><span>Repository documentation root</span><code>{selectedProject.workItems.root}</code></div> : null}
        <RadioList
          label="Work item type"
          value={schemaId}
          onChange={(value) => { const parsed = WorkItemSchemaIdSchema.safeParse(value); if (parsed.success) onSchemaChange(parsed.data); }}
          orientation="horizontal"
          size="sm"
          isRequired
        >
          {eligibleSchemas.map((schema) => (
            <RadioListItem key={schema.schemaId} value={schema.schemaId} label={schema.kind} startContent={<WorkbenchIcon name={schema.kind === "CHANGE" ? "change" : schema.kind === "DEFECT" ? "defect" : schema.kind === "INVESTIGATION" ? "investigation" : "audit"} />} />
          ))}
        </RadioList>
        <TextInput label="Title" value={title} onChange={onTitleChange} isRequired width="100%" />
        <MultiSelector label="Concern IDs" options={[...availableConcernIds]} value={[...concernIds]} onChange={(value) => onConcernIdsChange(value)} hasSearch size="sm" placeholder="Select concerns" width="100%" />
        {derivedFromWorkItemId !== null ? <div className="order-create-derived">Derived from completed investigation/audit: <code>{derivedFromWorkItemId}</code></div> : null}
      </>}
      actions={<WorkbenchAction type="submit" label={derivedFromWorkItemId === null ? "Create work item" : "Create linked remediation"} tone="primary" loading={pending} disabled={projectId.length === 0 || schemaId === "" || title.trim().length === 0} />}
      feedback={error ? <WorkbenchNotice tone="danger" title="Work item could not be created" description={error} /> : undefined}
    />
  );
};
