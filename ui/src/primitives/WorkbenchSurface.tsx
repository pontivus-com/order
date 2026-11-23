import type { ReactNode } from "react";

export const WorkbenchSurface = ({
  attention, selector, material,
}: Readonly<{ attention?: ReactNode; selector?: ReactNode; material: ReactNode }>) => (
  <section className="order-workbench-surface">
    {attention == null ? null : (
      <div className="order-workbench-surface-attention">{attention}</div>
    )}
    {selector == null ? null : (
      <div className="order-workbench-surface-selector">{selector}</div>
    )}
    <div className="order-workbench-surface-material">{material}</div>
  </section>
);
