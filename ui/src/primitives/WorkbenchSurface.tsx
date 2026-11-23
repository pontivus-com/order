import type { ReactNode } from "react";

export const WorkbenchSurface = ({
  attention,
  material,
}: Readonly<{
  attention?: ReactNode;
  material: ReactNode;
}>) => (
  <section className="order-workbench-surface">
    {attention === undefined ? null : (
      <div className="order-workbench-surface-attention">{attention}</div>
    )}
    <div className="order-workbench-surface-material">{material}</div>
  </section>
);
