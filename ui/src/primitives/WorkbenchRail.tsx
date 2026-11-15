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
    <ol>{items.map((item) => <li key={item.id} data-state={item.state}>
      <button
        type="button"
        aria-current={item.state === "current" ? "step" : undefined}
        aria-pressed={item.selected}
        onClick={item.onSelect}
      >
        <span>{item.label}</span>
        {item.statusLabel === undefined ? null : <small>{item.statusLabel}</small>}
      </button>
    </li>)}</ol>
  </nav>
);
