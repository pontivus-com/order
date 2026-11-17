import type { ReactNode } from "react";

export const WorkbenchSurface = ({
  attention,
  selector,
  material,
  testId,
}: Readonly<{
  attention: ReactNode;
  selector?: ReactNode;
  material: ReactNode;
  testId?: string;
}>) => (
  <section className="order-workbench-surface" data-testid={testId}>
    <div className="order-workbench-surface-attention">{attention}</div>
    {selector ? <div className="order-workbench-surface-selector">{selector}</div> : null}
    <div className="order-workbench-surface-material">{material}</div>
  </section>
);
