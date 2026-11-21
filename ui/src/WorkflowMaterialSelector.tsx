import { WorkbenchSelector } from "./primitives/WorkbenchSelector.tsx";

export type WorkflowMaterialSelectorItem = Readonly<{
  id: string; label: string; description?: string; statusLabel?: string;
  selected?: boolean; onSelect: () => void;
}>;
export type WorkflowMaterialSelectorGroup = Readonly<{
  id: string; label: string; items: readonly WorkflowMaterialSelectorItem[];
}>;

export const WorkflowMaterialSelector = ({ groups, label }: Readonly<{
  groups: readonly WorkflowMaterialSelectorGroup[]; label: string;
}>) => <WorkbenchSelector
  label={label}
  groups={groups.map((group) => ({
    label: group.label,
    items: group.items.map((item) => {
      const detail = [item.description, item.statusLabel]
        .filter((value): value is string => value !== undefined && value.length > 0)
        .join(" · ");
      return {
        id: group.id + ":" + item.id,
        label: item.label,
        detail: detail.length === 0 ? undefined : detail,
        selected: item.selected === true,
        onSelect: item.onSelect,
      };
    }),
  }))}
/>;
