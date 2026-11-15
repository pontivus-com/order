import type { WorkItem } from "../../src/core/contracts.ts";
import { workflowSteps, workflowStepState } from "./workbench-presentation.ts";
import { WorkbenchRail } from "./primitives/WorkbenchRail.tsx";

export const WorkflowRail = ({ workItem, selectedStep, onSelect }: Readonly<{
  workItem: Pick<WorkItem, "stage">;
  selectedStep: WorkItem["stage"];
  onSelect: (stage: WorkItem["stage"]) => void;
}>) => (
  <WorkbenchRail
    items={workflowSteps.map((step) => {
      const state = workflowStepState(workItem, step.stage);
      return {
        id: step.stage,
        label: step.label,
        state: step.stage === workItem.stage
          ? "current"
          : state === "HISTORICAL"
            ? "reached"
            : "unreached",
        selected: selectedStep === step.stage,
        onSelect: () => onSelect(step.stage),
      };
    })}
  />
);
