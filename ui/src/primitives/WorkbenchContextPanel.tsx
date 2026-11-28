import type { ReactElement } from "react";
import { WorkbenchAction } from "./WorkbenchAction.tsx";
import {
  WorkbenchSection,
  type WorkbenchSectionProps,
} from "./WorkbenchSection.tsx";

export const WorkbenchContextPanel = ({
  title,
  onClose,
  sections,
}: Readonly<{
  title: string;
  onClose: () => void;
  sections: readonly ReactElement<WorkbenchSectionProps, typeof WorkbenchSection>[];
}>) => (
  <section className="order-workbench-context-panel">
    <header className="order-workbench-context-header">
      <h2>{title}</h2>
      <WorkbenchAction label="Close context" tone="ghost" onClick={onClose} />
    </header>
    <div className="order-workbench-context-sections">{sections}</div>
  </section>
);
