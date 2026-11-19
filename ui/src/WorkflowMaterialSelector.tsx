import { WorkbenchSelector } from "./primitives/WorkbenchSelector.tsx";

export type WorkflowMaterialSelectorItem = Readonly<{
  id: string;
  label: string;
  description?: string;
  statusLabel?: string;
  selected?: boolean;
  onSelect: () => void;
}>;

export type WorkflowMaterialSelectorGroup = Readonly<{
  id: string;
  label: string;
  items: readonly WorkflowMaterialSelectorItem[];
}>;

export const WorkflowMaterialSelector = ({ groups, label }: Readonly<{
  groups: readonly WorkflowMaterialSelectorGroup[];
  label: string;
}>) => (
  <WorkbenchSelector
    label={label}
    groups={groups.map((group) => ({
      label: group.label,
      items: group.items.map((item) => ({
        id: group.id + ":" + item.id,
        label: item.label,
        detail: [item.description, item.statusLabel].filter(Boolean).join(" · ") || undefined,
        selected: item.selected === true,
        onSelect: item.onSelect,
      })),
    }))}
  />
);
