import type { WorkStage } from "../../src/core/contracts.ts";
import type { WorkflowRailItem } from "../../src/core/lifecycle.ts";
import { workflowPresentation } from "./workbench-presentation.ts";
import { WorkbenchRail, type WorkbenchRailItem as RailPresentationItem } from "./primitives/WorkbenchRail.tsx";

// Translate the canonical marker without deriving workflow or command policy.
const markerPresentation = (marker: WorkflowRailItem["marker"]): Pick<RailPresentationItem, "statusLabel" | "statusTone" | "markerSymbol"> => {
  switch (marker) {
    case null: return {};
    case "READY": return { statusLabel: "Ready", statusTone: "neutral" };
    case "PROCESSING": return { statusLabel: "Processing", statusTone: "info", markerSymbol: "…" };
    case "ACTION_REQUIRED": return { statusLabel: "Action required", statusTone: "warning", markerSymbol: "!" };
    case "BLOCKED": return { statusLabel: "Blocked", statusTone: "danger", markerSymbol: "!" };
    case "STALE": return { statusLabel: "Stale", statusTone: "warning", markerSymbol: "!" };
    case "COMPLETE": return { statusLabel: "Complete", statusTone: "success", markerSymbol: "✓" };
  }
};

export const WorkflowRail = ({
  items, onSelect,
}: Readonly<{ items: readonly WorkflowRailItem[]; onSelect: (stage: WorkStage) => void }>) => (
  <WorkbenchRail
    items={items.map((item) => ({
      id: item.stage,
      label: workflowPresentation(item.stage).label,
      state: item.reach === "CURRENT"
        ? "current"
        : item.reach === "REACHED_HISTORICAL"
          ? "reached"
          : "unreached",
      selected: item.selected,
      ...markerPresentation(item.marker),
      onSelect: () => onSelect(item.stage),
    }))}
  />
);
