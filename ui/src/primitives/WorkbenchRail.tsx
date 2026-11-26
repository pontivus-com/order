export type WorkbenchRailItem = Readonly<{
  id: string;
  label: string;
  state: "unreached" | "reached" | "current" | "complete" | "blocked";
  selected: boolean;
  statusLabel?: string;
  onSelect: () => void;
}>;

export const WorkbenchRail = ({ items }: Readonly<{ items: readonly WorkbenchRailItem[] }>) => (
  <nav className="order-workbench-rail" aria-label="Workflow" data-testid="workflow-rail">
    <ol>
      {items.map((item) => {
        const descriptionId = "workflow-rail-status-" + item.id;
        return (
          <li key={item.id} data-state={item.state} data-selected={item.selected ? "true" : "false"}>
            <button
              type="button"
              aria-label={item.label}
              aria-describedby={item.statusLabel === undefined ? undefined : descriptionId}
              aria-current={item.state === "current" ? "step" : undefined}
              aria-pressed={item.selected}
              onClick={item.onSelect}
            >
              <span className="order-workbench-rail-label">{item.label}</span>
              {item.statusLabel === undefined ? null : <span id={descriptionId} hidden>{item.statusLabel}</span>}
            </button>
          </li>
        );
      })}
    </ol>
  </nav>
);
