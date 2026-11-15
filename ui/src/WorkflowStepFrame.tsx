import type { ReactNode } from "react";
import type { BadgeVariant } from "@astryxdesign/core/Badge";
import type { BannerStatus } from "@astryxdesign/core/Banner";

import { WorkflowMaterialSelector } from "./WorkflowMaterialSelector.tsx";
import { WorkbenchAttention } from "./primitives/WorkbenchAttention.tsx";
import { WorkbenchNotice } from "./primitives/WorkbenchNotice.tsx";
import { WorkbenchSectionHeader } from "./primitives/WorkbenchSectionHeader.tsx";
import { WorkbenchState } from "./primitives/WorkbenchState.tsx";
import { WorkbenchStatus, type WorkbenchStatusTone } from "./primitives/WorkbenchStatus.tsx";
import { WorkbenchSurface } from "./primitives/WorkbenchSurface.tsx";

export type WorkflowStepIndexItem = Readonly<{
  id: string; label: string; description?: string; statusLabel?: string;
  statusVariant?: BadgeVariant; selected?: boolean; onSelect: () => void;
}>;
export type WorkflowStepIndexGroup = Readonly<{ id: string; label: string; items: readonly WorkflowStepIndexItem[] }>;

export const WorkflowStepIndex = ({ groups, label = "Workflow material" }: Readonly<{
  groups: readonly WorkflowStepIndexGroup[]; label?: string;
}>) => <WorkflowMaterialSelector groups={groups} label={label} />;

export type WorkflowStepSummaryBlocker = Readonly<{ status: BannerStatus; title: string; description?: ReactNode }>;

const statusTone = (variant: BadgeVariant): WorkbenchStatusTone =>
  variant === "success" ? "success" :
  variant === "warning" ? "warning" :
  variant === "error" || variant === "red" ? "danger" :
  variant === "info" || variant === "blue" ? "info" : "neutral";

export const WorkflowStepSummary = ({
  label, purpose, stateLabel, stateVariant = "neutral", statusLabel,
  statusVariant = "neutral", blocker, action,
}: Readonly<{
  label: string; purpose: string; stateLabel: string; stateVariant?: BadgeVariant;
  statusLabel?: string; statusVariant?: BadgeVariant; blocker?: WorkflowStepSummaryBlocker | null; action?: ReactNode;
}>) => (
  <WorkbenchAttention
    title={label}
    purpose={purpose}
    status={<span className="order-workflow-summary-status"><WorkbenchStatus tone={statusTone(stateVariant)} label={stateLabel} />{statusLabel ? <WorkbenchStatus tone={statusTone(statusVariant)} label={statusLabel} /> : null}</span>}
    blocker={blocker ? <WorkbenchNotice tone={blocker.status === "error" ? "danger" : blocker.status} title={blocker.title} description={blocker.description} /> : undefined}
    action={action}
  />
);

export const PrimaryMaterialFrame = ({
  title, description, action, loading, error, empty, children,
}: Readonly<{
  title?: string; description?: ReactNode; action?: ReactNode; loading?: string | null;
  error?: Readonly<{ title: string; description: string }> | null;
  empty?: Readonly<{ title: string; description?: string }> | null;
  scrollable?: boolean; children?: ReactNode;
}>) => (
  <section className="order-primary-material-frame" data-testid="primary-material-frame">
    {title || description || action ? <WorkbenchSectionHeader title={title ?? ""} description={typeof description === "string" ? description : undefined} action={action} /> : null}
    <div className="order-primary-material-content">
      {loading ? <WorkbenchState kind="loading" title={loading} /> :
       error ? <WorkbenchState kind="error" title={error.title} description={error.description} /> :
       empty ? <WorkbenchState kind="empty" title={empty.title} description={empty.description} /> :
       children}
    </div>
  </section>
);

export const WorkflowStepFrame = ({ summary, index, indexLabel = "Workflow material", primary }: Readonly<{
  summary: ReactNode; index?: ReactNode; indexLabel?: string; primary: ReactNode;
}>) => (
  <WorkbenchSurface attention={summary} selector={index ? <div aria-label={indexLabel}>{index}</div> : undefined} material={primary} />
);
