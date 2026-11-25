import type { ReactNode } from "react";
import { WorkbenchSectionHeader } from "./WorkbenchSectionHeader.tsx";

export type WorkbenchDocumentProps = Readonly<{
  title: string;
  description?: string;
  status?: ReactNode;
  action?: ReactNode;
  facts?: ReactNode;
  content: ReactNode;
}>;

export const WorkbenchDocument = ({
  title, description, status, action, facts, content,
}: WorkbenchDocumentProps) => (
  <section className="order-workbench-document" data-testid="workbench-document">
    <WorkbenchSectionHeader
      title={title}
      description={description}
      action={
        status === undefined && action === undefined ? undefined : (
          <span className="order-workbench-document-actions">
            {status}
            {action}
          </span>
        )
      }
    />
    {facts === undefined ? null : (
      <div className="order-workbench-document-facts">{facts}</div>
    )}
    <div className="order-workbench-document-content">{content}</div>
  </section>
);
