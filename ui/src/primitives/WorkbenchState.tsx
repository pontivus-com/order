import type { ReactNode } from "react";

export type WorkbenchStateKind = "empty" | "loading" | "error" | "pending";

export const WorkbenchState = ({ kind, title, description, action }: Readonly<{
  kind: WorkbenchStateKind; title: string; description?: string; action?: ReactNode;
}>) => (
  <div className={"order-state order-state-" + kind} role={kind === "error" ? "alert" : "status"}>
    <strong>{title}</strong>
    {description ? <div>{description}</div> : null}
    {action ? <div className="order-state-action">{action}</div> : null}
  </div>
);

export const WorkbenchEmptyState = ({ title, description, compact = false }: Readonly<{
  title: string; description?: string; compact?: boolean;
}>) => <div className={compact ? "order-state-compact" : undefined}><WorkbenchState kind="empty" title={title} description={description} /></div>;

export const WorkbenchErrorState = ({ title, description, action }: Readonly<{
  title: string; description: string; action?: ReactNode;
}>) => <WorkbenchState kind="error" title={title} description={description} action={action} />;
