import type { ReactNode } from "react";
import { WorkbenchSection, type WorkbenchSectionProps } from "./WorkbenchSection.tsx";

export const WorkbenchResult = ({
  title, status, summary, sections = [], resources, action,
}: Readonly<{
  title: string;
  status: ReactNode;
  summary?: string;
  sections?: readonly WorkbenchSectionProps[];
  resources?: WorkbenchSectionProps;
  action?: ReactNode;
}>) => (
  <section className="order-workbench-result">
    <header className="order-workbench-result-header" data-testid="final-governed-outcome">
      <div className="order-workbench-result-meaning">
        <h2>{title}</h2>
        {summary === undefined ? null : <p>{summary}</p>}
        {status}
      </div>
      {action === undefined ? null : <div>{action}</div>}
    </header>
    {sections.map((section, index) => <WorkbenchSection key={index} {...section} />)}
    {resources === undefined ? null : <WorkbenchSection {...resources} />}
  </section>
);
