import type { ReactNode } from "react";

import {
  WorkflowMaterialSelector,
  type WorkflowMaterialSelectorGroup,
} from "./WorkflowMaterialSelector.tsx";
import { WorkbenchAttention, type WorkbenchAttentionTone } from "./primitives/WorkbenchAttention.tsx";
import { WorkbenchNotice } from "./primitives/WorkbenchNotice.tsx";
import { WorkbenchSectionHeader } from "./primitives/WorkbenchSectionHeader.tsx";
import { WorkbenchState } from "./primitives/WorkbenchState.tsx";
import { WorkbenchStatus, type WorkbenchStatusTone } from "./primitives/WorkbenchStatus.tsx";
import { WorkbenchSurface } from "./primitives/WorkbenchSurface.tsx";

export type WorkflowStatusVariant = "neutral" | "info" | "success" | "warning" | "error";
export type WorkflowNoticeStatus = "info" | "success" | "warning" | "error";
export type WorkflowStepIndexItem = WorkflowMaterialSelectorGroup["items"][number] & Readonly<{
  statusVariant?: WorkflowStatusVariant;
}>;
export type WorkflowStepIndexGroup = Omit<WorkflowMaterialSelectorGroup, "items"> & Readonly<{
  items: readonly WorkflowStepIndexItem[];
}>;

export const WorkflowStepIndex = ({
  groups, label = "Workflow material",
}: Readonly<{ groups: readonly WorkflowStepIndexGroup[]; label?: string }>) => (
  <div data-testid="workflow-step-index">
    <WorkflowMaterialSelector groups={groups} label={label} />
  </div>
);

export type WorkflowStepSummaryBlocker = Readonly<{
  status: WorkflowNoticeStatus;
  title: string;
  description?: ReactNode;
}>;

const statusTone = (variant: WorkflowStatusVariant): WorkbenchStatusTone =>
  variant === "error" ? "danger" : variant;

const attentionTone = (
  stateVariant: WorkflowStatusVariant,
  blocker: WorkflowStepSummaryBlocker | null | undefined,
): WorkbenchAttentionTone => {
  if (blocker?.status === "error" || stateVariant === "error") return "danger";
  if (blocker?.status === "warning" || stateVariant === "warning") return "warning";
  if (stateVariant === "success") return "success";
  return "info";
};

export const WorkflowStepSummary = ({
  label, purpose, stateLabel, stateVariant = "neutral", statusLabel,
  statusVariant = "neutral", blocker, action,
}: Readonly<{
  label: string;
  purpose: string;
  stateLabel: string;
  stateVariant?: WorkflowStatusVariant;
  statusLabel?: string;
  statusVariant?: WorkflowStatusVariant;
  blocker?: WorkflowStepSummaryBlocker | null;
  action?: ReactNode;
}>) => (
  <div data-testid="workflow-step-summary">
    <WorkbenchAttention
      title={label}
      tone={attentionTone(stateVariant, blocker)}
      purpose={purpose}
      status={
        <span className="order-workflow-summary-status">
          <WorkbenchStatus tone={statusTone(stateVariant)} label={stateLabel} />
          {statusLabel === undefined ? null : <WorkbenchStatus tone={statusTone(statusVariant)} label={statusLabel} />}
        </span>
      }
      blocker={
        blocker == null
          ? undefined
          : <WorkbenchNotice
              tone={blocker.status === "error" ? "danger" : blocker.status}
              title={blocker.title}
              description={blocker.description}
            />
      }
      action={action}
    />
  </div>
);

export const PrimaryMaterialFrame = ({
  title, description, action, loading, error, empty, children,
}: Readonly<{
  title?: string;
  description?: ReactNode;
  action?: ReactNode;
  loading?: string | null;
  error?: Readonly<{ title: string; description: string }> | null;
  empty?: Readonly<{ title: string; description?: string }> | null;
  scrollable?: boolean;
  children?: ReactNode;
}>) => (
  <section className="order-primary-material-frame" data-testid="primary-material-frame">
    {title || description || action ? (
      <WorkbenchSectionHeader
        title={title ?? ""}
        description={typeof description === "string" ? description : undefined}
        action={action}
      />
    ) : null}
    <div className="order-primary-material-content">
      {loading ? <WorkbenchState kind="loading" title={loading} /> :
       error ? <WorkbenchState kind="error" title={error.title} description={error.description} /> :
       empty ? <WorkbenchState kind="empty" title={empty.title} description={empty.description} /> :
       children}
    </div>
  </section>
);

export const WorkflowStepFrame = ({
  summary, index, indexLabel = "Workflow material", primary,
}: Readonly<{ summary: ReactNode; index?: ReactNode; indexLabel?: string; primary: ReactNode }>) => (
  <WorkbenchSurface
    attention={summary}
    selector={index ? <div aria-label={indexLabel}>{index}</div> : undefined}
    material={primary}
  />
);
