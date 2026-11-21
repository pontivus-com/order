import type { ReactNode } from "react";
import { WorkbenchAction } from "./WorkbenchAction.tsx";

export const WorkbenchContextPanel = ({
  title, onClose, children,
}: Readonly<{ title: string; onClose: () => void; children: ReactNode }>) => (
  <section className="order-workbench-context-panel">
    <header>
      <h2>{title}</h2>
      <WorkbenchAction label="Close context" tone="ghost" onClick={onClose} />
    </header>
    <div>{children}</div>
  </section>
);
