import type { WorkbenchStatusTone } from "./WorkbenchStatus.tsx";

export type WorkbenchRailItem = Readonly<{
  id: string;
  label: string;
  state: "unreached" | "reached" | "current";
  selected: boolean;
  statusLabel?: string;
  statusTone?: WorkbenchStatusTone;
  markerSymbol?: string;
  onSelect: () => void;
}>;

export const WorkbenchRail = ({ items }: Readonly<{ items: readonly WorkbenchRailItem[] }>) => (
  <nav className="order-workbench-rail" aria-label="Workflow" data-testid="workflow-rail">
    <ol>
      {items.map((item, index) => {
        const descriptionId = "workflow-rail-status-" + item.id;
        const reached = item.state === "reached";
        const description = item.statusLabel ?? (reached ? "Previously reached (not a validation verdict)" : "Not yet reached");
        return (
          <li key={item.id} data-state={item.state}
            data-tone={reached ? "success" : item.statusTone ?? "neutral"}
            data-selected={item.selected ? "true" : "false"}>
            <button
              type="button"
              aria-label={item.label}
              aria-describedby={descriptionId}
              aria-current={item.state === "current" ? "step" : undefined}
              aria-pressed={item.selected}
              onClick={item.onSelect}
            >
              <span className="order-workbench-process-marker" aria-hidden="true" title={description}>
                {reached ? "✓" : item.markerSymbol ?? index + 1}
              </span>
              <span className="order-workbench-rail-label">{item.label}</span>
              <span id={descriptionId} className="order-workbench-rail-status"
                hidden={item.state !== "current"}>{description}</span>
            </button>
          </li>
        );
      })}
    </ol>
  </nav>
);
