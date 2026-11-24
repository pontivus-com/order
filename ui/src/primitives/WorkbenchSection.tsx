import type { ReactNode } from "react";
import { WorkbenchSectionHeader } from "./WorkbenchSectionHeader.tsx";

export type WorkbenchSectionProps = Readonly<{
  title?: string;
  description?: string;
  action?: ReactNode;
  content: ReactNode;
}>;

export const WorkbenchSection = ({
  title,
  description,
  action,
  content,
}: WorkbenchSectionProps) => (
  <section className="order-workbench-section">
    {title === undefined ? (
      description === undefined && action === undefined ? null : (
        <div className="order-workbench-section-meta">
          {description === undefined ? null : (
            <p className="order-workbench-section-description">{description}</p>
          )}
          {action === undefined ? null : (
            <div className="order-workbench-section-action">{action}</div>
          )}
        </div>
      )
    ) : (
      <WorkbenchSectionHeader title={title} description={description} action={action} />
    )}
    <div className="order-workbench-section-content">{content}</div>
  </section>
);
