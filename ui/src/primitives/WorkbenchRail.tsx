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
    <ol>{items.map((item) => {
      const statusId = "workflow-rail-status-" + item.id;
      return <li key={item.id} data-state={item.state}>
        <button
          type="button"
          aria-label={item.label}
          aria-describedby={item.statusLabel === undefined ? undefined : statusId}
          aria-current={item.state === "current" ? "step" : undefined}
          aria-pressed={item.selected}
          onClick={item.onSelect}
        >
          <span>{item.label}</span>
          {item.statusLabel === undefined ? null : <small id={statusId}>{item.statusLabel}</small>}
        </button>
      </li>;
    })}</ol>
  </nav>
);
