import { Selector, type SelectorOptionType } from "@astryxdesign/core/Selector";

export type WorkbenchSelectorItem = Readonly<{ id: string; label: string; detail?: string; selected: boolean; onSelect: () => void }>;
export type WorkbenchSelectorGroup = Readonly<{ label?: string; items: readonly WorkbenchSelectorItem[] }>;

export const WorkbenchSelector = ({ label, groups }: Readonly<{ label: string; groups: readonly WorkbenchSelectorGroup[] }>) => {
  const items = groups.flatMap((group) => group.items);
  const selected = items.find((item) => item.selected);
  const options: SelectorOptionType[] = groups.flatMap((group) => {
    const groupOptions = group.items.map((item) => ({
      value: item.id,
      label: item.label,
      description: item.detail,
    }));
    return group.label
      ? [{ type: "section" as const, title: group.label, options: groupOptions }]
      : groupOptions;
  });
  return (
    <Selector
      label={label}
      options={options}
      value={selected?.id}
      onChange={(id) => items.find((item) => item.id === id)?.onSelect()}
      variant="secondary"
      presentation="adaptive"
      size="sm"
      width="100%"
    />
  );
};
