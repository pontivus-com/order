import type { ReactNode } from "react";
import {
  WorkbenchReviewSection,
  type WorkbenchReviewSectionProps,
} from "./WorkbenchReviewSection.tsx";
import {
  WorkbenchReviewVerdict,
  type WorkbenchReviewVerdictProps,
} from "./WorkbenchReviewVerdict.tsx";

export type WorkbenchReviewProps = Readonly<{
  title: string;
  description?: string;
  verdict: WorkbenchReviewVerdictProps;
  sections: readonly WorkbenchReviewSectionProps[];
  decisions?: ReactNode;
}>;

export const WorkbenchReview = ({
  title,
  description,
  verdict,
  sections,
  decisions,
}: WorkbenchReviewProps) => (
  <section className="order-workbench-review">
    <header className="order-workbench-review-header">
      <div className="order-workbench-review-heading">
        <h2>{title}</h2>
        {description === undefined ? null : <p>{description}</p>}
      </div>
      <WorkbenchReviewVerdict {...verdict} />
    </header>
    <div className="order-workbench-review-sections">
      {sections.map((section) => (
        <WorkbenchReviewSection key={section.id} {...section} />
      ))}
    </div>
    {decisions === undefined ? null : (
      <div className="order-workbench-review-decisions">{decisions}</div>
    )}
  </section>
);
