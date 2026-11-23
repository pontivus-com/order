import type { ReactNode } from "react";

export const WorkbenchReview = ({
  currentness,
  summary,
  body,
  decisions,
}: Readonly<{
  currentness: ReactNode;
  summary: ReactNode;
  body: ReactNode;
  decisions: ReactNode;
}>) => (
  <section className="order-workbench-review">
    <header className="order-workbench-review-header">
      <div className="order-workbench-review-summary">{summary}</div>
      <div className="order-workbench-review-currentness">{currentness}</div>
    </header>
    <div className="order-workbench-review-body">{body}</div>
    <div className="order-workbench-review-decisions">{decisions}</div>
  </section>
);
