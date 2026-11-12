import type { ReactNode } from "react";

export const WorkbenchEmptyState = ({
  title,
  description,
  compact = false,
}: Readonly<{ title: string; description?: string; compact?: boolean }>) => (
  <div className={compact ? "order-state order-state-compact" : "order-state"}>
    <strong>{title}</strong>
    {description ? <div>{description}</div> : null}
  </div>
);

export const WorkbenchErrorState = ({
  title,
  description,
  action,
}: Readonly<{ title: string; description: string; action?: ReactNode }>) => (
  <div role="alert" className="order-state order-state-error">
    <strong>{title}</strong>
    <div>{description}</div>
    {action ? <div className="order-state-action">{action}</div> : null}
  </div>
);
