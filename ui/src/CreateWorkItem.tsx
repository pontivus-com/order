import { MultiSelector } from "@astryxdesign/core/MultiSelector";
import { RadioList, RadioListItem } from "@astryxdesign/core/RadioList";
import { Selector } from "@astryxdesign/core/Selector";
import { TextInput } from "@astryxdesign/core/TextInput";
import type { FormEvent } from "react";

import {
  WorkItemSchemaIdSchema,
  type ProjectManifest,
  type WorkItem,
  type WorkItemSchemaCatalogEntry,
  type WorkItemSchemaId,
} from "../../src/core/contracts.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchForm } from "./primitives/WorkbenchForm.tsx";
import { WorkbenchNotice } from "./primitives/WorkbenchNotice.tsx";

const humanKindLabel = (
  kind: WorkItemSchemaCatalogEntry["kind"] | undefined,
): string =>
  kind === undefined
    ? "Work item"
    : kind.charAt(0) + kind.slice(1).toLowerCase();

export const CreateWorkItem = ({
  projects,
  schemas,
  projectId,
  schemaId,
  title,
  concernIds,
  availableConcernIds,
  derivedFromWorkItem,
  pending,
  error,
  onProjectChange,
  onSchemaChange,
  onTitleChange,
  onConcernIdsChange,
  onSubmit,
  onCancel,
}: Readonly<{
  projects: readonly ProjectManifest[];
  schemas: readonly WorkItemSchemaCatalogEntry[];
  projectId: string;
  schemaId: WorkItemSchemaId | "";
  title: string;
  concernIds: readonly string[];
  availableConcernIds: readonly string[];
  derivedFromWorkItem: WorkItem | null;
  pending: boolean;
  error: string | null;
  onProjectChange: (value: string) => void;
  onSchemaChange: (value: WorkItemSchemaId) => void;
  onTitleChange: (value: string) => void;
  onConcernIdsChange: (value: readonly string[]) => void;
  onSubmit: () => void;
  onCancel: () => void;
}>) => {
  const eligibleSchemas = schemas.filter(
    (schema) =>
      schema.authoringDefault &&
      (
        derivedFromWorkItem === null ||
        schema.kind === "CHANGE" ||
        schema.kind === "DEFECT"
      ),
  );
  const selectedProject =
    projects.find((project) => project.projectId === projectId) ?? null;
  const parentKind = derivedFromWorkItem === null
    ? null
    : humanKindLabel(
      schemas.find((schema) => schema.schemaId === derivedFromWorkItem.schemaId)
        ?.kind,
    );

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (
      projectId.length > 0 &&
      schemaId !== "" &&
      title.trim().length > 0
    ) {
      onSubmit();
    }
  };

  const canSubmit =
    projectId.length > 0 &&
    schemaId !== "" &&
    title.trim().length > 0 &&
    !pending;

  return (
    <WorkbenchForm
      onSubmit={submit}
      content={
        <div className="order-create-form-fields">
          {derivedFromWorkItem === null ? (
            <Selector
              label="Project"
              options={projects.map((project) => ({
                value: project.projectId,
                label: project.projectId,
              }))}
              value={projectId}
              onChange={onProjectChange}
              isRequired
              width="100%"
            />
          ) : (
            <>
              <section
                className="order-create-context"
                aria-label="Linked remediation parent"
              >
                <strong>Parent</strong>
                <span>{derivedFromWorkItem.title}</span>
                <small>{"Completed parent " + parentKind + " · same project"}</small>
              </section>
              <section
                className="order-create-context"
                data-testid="linked-remediation-project"
                aria-label="Linked remediation project"
              >
                <strong>Project</strong>
                <span>{derivedFromWorkItem.projectId}</span>
                <small>Fixed to the completed parent WorkItem.</small>
              </section>
            </>
          )}

          {selectedProject === null ? null : (
            <div
              className="order-create-supporting"
              data-testid="create-work-item-location"
            >
              <span>Repository documentation root</span>
              <code>{selectedProject.workItems.root}</code>
            </div>
          )}

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
                label={humanKindLabel(schema.kind)}
              />
            ))}
          </RadioList>

          <TextInput
            label="Title"
            value={title}
            onChange={onTitleChange}
            isRequired
            width="100%"
          />

          <MultiSelector
            label="Concerns"
            options={[...availableConcernIds]}
            value={[...concernIds]}
            onChange={(value) => onConcernIdsChange(value)}
            hasSearch
            size="sm"
            placeholder="Select concerns"
            width="100%"
          />

          {derivedFromWorkItem === null ? (
            <section className="order-create-context" aria-label="Derived WorkItem fields">
              <strong>Derived fields are not editable</strong>
              <span>
                WorkItem identity, schema version, lifecycle stage/status and
                artifact roles are assigned from canonical contracts after creation.
              </span>
            </section>
          ) : (
            <section className="order-create-context" aria-label="Canonical lineage">
              <strong>Canonical lineage</strong>
              <span>
                Parent linkage is system-owned and cannot be changed to another WorkItem.
              </span>
            </section>
          )}
        </div>
      }
      actions={
        <>
          <WorkbenchAction
            type="submit"
            label={
              derivedFromWorkItem === null
                ? "Create work item"
                : "Create linked remediation"
            }
            tone="primary"
            loading={pending}
            disabled={!canSubmit}
          />
          <WorkbenchAction
            label="Cancel"
            disabled={pending}
            onClick={onCancel}
          />
        </>
      }
      feedback={
        error === null ? undefined : (
          <WorkbenchNotice
            tone="danger"
            title="Work item could not be created"
            description={error}
          />
        )
      }
    />
  );
};
