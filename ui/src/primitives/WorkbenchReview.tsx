import type { ReactNode } from "react";
import { WorkbenchDisclosure } from "./WorkbenchDisclosure.tsx";
export const WorkbenchReview = ({ currentness, summary, body, decisions, technicalDetails, selector }: Readonly<{
  currentness: ReactNode; summary: ReactNode; body: ReactNode; decisions: ReactNode; technicalDetails?: ReactNode; selector?: ReactNode;
}>) => (
  <section className="order-workbench-review"><header>{currentness}{summary}</header>{selector}<div className="order-workbench-review-body">{body}</div><div className="order-workbench-review-decisions">{decisions}</div>{technicalDetails ? <WorkbenchDisclosure label="Technical details" content={technicalDetails} /> : null}</section>
);
