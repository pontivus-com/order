import { WorkbenchSelector } from "./primitives/WorkbenchSelector.tsx";
import type { WorkflowStepIndexGroup } from "./WorkflowStepFrame.tsx";

export const WorkflowMaterialSelector = ({ groups, label }: Readonly<{
  groups: readonly WorkflowStepIndexGroup[];
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
