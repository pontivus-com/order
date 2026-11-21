import { Selector, SelectorOption, type SelectorOptionType } from "@astryxdesign/core/Selector";

export type WorkbenchSelectorItem = Readonly<{
  id: string;
  label: string;
  detail?: string;
  selected: boolean;
  onSelect: () => void;
}>;
export type WorkbenchSelectorGroup = Readonly<{
  label?: string;
  items: readonly WorkbenchSelectorItem[];
}>;

export const WorkbenchSelector = ({
  label, groups,
}: Readonly<{ label: string; groups: readonly WorkbenchSelectorGroup[] }>) => {
  const items = groups.flatMap((group) => group.items);
  const selectedId = items.find((item) => item.selected)?.id;
  const options: SelectorOptionType[] = [];

  for (const group of groups) {
    const groupOptions = group.items.map((item) => ({
      value: item.id,
      label: item.label,
      description: item.detail,
    }));
    if (group.label === undefined) {
      options.push(...groupOptions);
    } else {
      options.push({
        type: "section",
        title: group.label,
        options: groupOptions,
      });
    }
  }

  return (
    <Selector
      label={label}
      options={options}
      value={selectedId}
      onChange={(id) => items.find((item) => item.id === id)?.onSelect()}
      renderOption={(option) => (
        <SelectorOption
          icon={option.icon}
          label={option.label ?? option.value}
          description={
            option.description === undefined
              ? undefined
              : <span aria-hidden="true">{option.description}</span>
          }
        />
      )}
      variant="secondary"
      presentation="adaptive"
      size="sm"
      width="100%"
    />
  );
};
