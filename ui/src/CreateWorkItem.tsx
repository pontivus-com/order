import { MultiSelector } from "@astryxdesign/core/MultiSelector";
import { RadioList, RadioListItem } from "@astryxdesign/core/RadioList";
import type { FormEvent } from "react";

import {
  WorkItemSchemaIdSchema,
  type ProjectManifest,
  type WorkItemId,
  type WorkItemSchemaCatalogEntry,
  type WorkItemSchemaId,
} from "../../src/core/contracts.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchIcon } from "./primitives/WorkbenchIcon.tsx";

export const CreateWorkItem = ({
  projects,
  schemas,
  projectId,
  schemaId,
  title,
  concernIds,
  availableConcernIds,
  derivedFromWorkItemId,
  pending,
  error,
  onProjectChange,
  onSchemaChange,
  onTitleChange,
  onConcernIdsChange,
  onSubmit,
}: Readonly<{
  projects: readonly ProjectManifest[];
  schemas: readonly WorkItemSchemaCatalogEntry[];
  projectId: string;
  schemaId: WorkItemSchemaId | "";
  title: string;
  concernIds: readonly string[];
  availableConcernIds: readonly string[];
  derivedFromWorkItemId: WorkItemId | null;
  pending: boolean;
  error: string | null;
  onProjectChange: (value: string) => void;
  onSchemaChange: (value: WorkItemSchemaId) => void;
  onTitleChange: (value: string) => void;
  onConcernIdsChange: (value: readonly string[]) => void;
  onSubmit: () => void;
}>) => {
  const eligibleSchemas = schemas.filter((schema) =>
    derivedFromWorkItemId === null || schema.kind === "CHANGE" || schema.kind === "DEFECT");

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (projectId.length > 0 && schemaId !== "" && title.trim().length > 0) onSubmit();
  };

  return (
    <form className="order-create-form" onSubmit={submit}>
      <label className="order-field">
        <span>Project</span>
        <select value={projectId} onChange={(event) => onProjectChange(event.currentTarget.value)} required>
          {projects.map((project) => <option key={project.projectId} value={project.projectId}>{project.projectId}</option>)}
        </select>
      </label>

      <RadioList
        label="Work item type"
        value={schemaId}
        onChange={(value) => {
          const parsed = WorkItemSchemaIdSchema.safeParse(value);
          if (parsed.success) onSchemaChange(parsed.data);
        }}
        orientation="horizontal"
        size="sm"
        isRequired
      >
        {eligibleSchemas.map((schema) => (
          <RadioListItem
            key={schema.schemaId}
            value={schema.schemaId}
            label={schema.kind}
            startContent={<WorkbenchIcon name={
              schema.kind === "CHANGE" ? "change" :
              schema.kind === "DEFECT" ? "defect" :
              schema.kind === "INVESTIGATION" ? "investigation" : "audit"
            } />}
          />
        ))}
      </RadioList>

      <label className="order-field">
        <span>Title</span>
        <input value={title} onChange={(event) => onTitleChange(event.currentTarget.value)} required />
      </label>

      <MultiSelector
        label="Concern IDs"
        options={[...availableConcernIds]}
        value={[...concernIds]}
        onChange={(value) => onConcernIdsChange(value)}
        hasSearch
        size="sm"
        placeholder="Select concerns"
      />

      {derivedFromWorkItemId !== null ? (
        <div className="order-create-derived">
          Derived from completed investigation/audit: <code>{derivedFromWorkItemId}</code>
        </div>
      ) : null}

      <div className="order-create-actions">
        <WorkbenchAction
          type="submit"
          label={derivedFromWorkItemId === null ? "Create work item" : "Create linked remediation"}
          tone="primary"
          loading={pending}
          disabled={projectId.length === 0 || schemaId === "" || title.trim().length === 0}
        />
        {error ? <span role="alert" className="order-error-text">{error}</span> : null}
      </div>
    </form>
  );
};
