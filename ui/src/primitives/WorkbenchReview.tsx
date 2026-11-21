import type { ReactNode } from "react";
import { WorkbenchDisclosure } from "./WorkbenchDisclosure.tsx";

export const WorkbenchReview = ({
  currentness, summary, body, decisions, technicalDetails, selector,
}: Readonly<{
  currentness: ReactNode;
  summary: ReactNode;
  body: ReactNode;
  decisions: ReactNode;
  technicalDetails?: ReactNode;
  selector?: ReactNode;
}>) => (
  <section className="order-workbench-review">
    <header className="order-workbench-review-header">
      <div className="order-workbench-review-summary">{summary}</div>
      <div className="order-workbench-review-currentness">{currentness}</div>
    </header>
    {selector === undefined ? null : <div className="order-workbench-review-selector">{selector}</div>}
    <div className="order-workbench-review-body">{body}</div>
    <div className="order-workbench-review-decisions">{decisions}</div>
    {technicalDetails === undefined ? null : (
      <WorkbenchDisclosure label="Technical details" content={technicalDetails} />
    )}
  </section>
);
