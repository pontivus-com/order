import type { WorkStage } from "../../src/core/contracts.ts";
import type { WorkflowRailItem } from "../../src/core/lifecycle.ts";
import { workflowPresentation } from "./workbench-presentation.ts";
import { WorkbenchRail } from "./primitives/WorkbenchRail.tsx";

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
      statusLabel: item.marker === null ? undefined : item.marker.replaceAll("_", " ").toLowerCase(),
      onSelect: () => onSelect(item.stage),
    }))}
  />
);
