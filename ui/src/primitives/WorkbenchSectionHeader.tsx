import type { ReactNode } from "react";

export const WorkbenchSectionHeader = ({
  title, description, action,
}: Readonly<{ title: string; description?: string; action?: ReactNode }>) => (
  <header className="order-workbench-section-header">
    <div>
      <h3>{title}</h3>
      {description === undefined ? null : <p>{description}</p>}
    </div>
    {action === undefined ? null : <div>{action}</div>}
  </header>
);
