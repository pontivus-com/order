import type { ReactNode } from "react";
import { WorkbenchSectionHeader } from "./WorkbenchSectionHeader.tsx";

export type WorkbenchReviewSectionProps = Readonly<{
  id: string;
  title: string;
  description?: string;
  content: ReactNode;
}>;

export const WorkbenchReviewSection = ({
  id,
  title,
  description,
  content,
}: WorkbenchReviewSectionProps) => (
  <section className="order-workbench-review-section" data-review-section={id}>
    <WorkbenchSectionHeader title={title} description={description} />
    <div className="order-workbench-review-section-content">{content}</div>
  </section>
);
