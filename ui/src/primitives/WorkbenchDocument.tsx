import type { ReactNode } from "react";
import { WorkbenchDisclosure } from "./WorkbenchDisclosure.tsx";
import { WorkbenchSectionHeader } from "./WorkbenchSectionHeader.tsx";

export type WorkbenchDocumentProps = Readonly<{
  title: string;
  description?: string;
  status?: ReactNode;
  action?: ReactNode;
  content: ReactNode;
  details?: Readonly<{
    label: string;
    content: ReactNode;
  }>;
}>;

export const WorkbenchDocument = ({
  title,
  description,
  status,
  action,
  content,
  details,
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
    <div className="order-workbench-document-content">{content}</div>
    {details === undefined ? null : (
      <div className="order-workbench-document-details">
        <WorkbenchDisclosure label={details.label} content={details.content} />
      </div>
    )}
  </section>
);
