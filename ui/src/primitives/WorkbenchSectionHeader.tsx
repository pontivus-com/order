import type { ReactNode } from "react";
export const WorkbenchSectionHeader = ({ title, description, action }: Readonly<{ title: string; description?: string; action?: ReactNode }>) => (
  <header className="order-workbench-section-header"><div><h3>{title}</h3>{description ? <p>{description}</p> : null}</div>{action ? <div>{action}</div> : null}</header>
);
