import type { ReactNode } from "react";
export const WorkbenchAttention = ({ title, purpose, status, blocker, action }: Readonly<{
  title: string; purpose?: string; status?: ReactNode; blocker?: ReactNode; action?: ReactNode;
}>) => (
  <section className="order-workbench-attention" aria-labelledby="workbench-attention-title">
    <div className="order-workbench-attention-copy"><div className="order-workbench-attention-heading"><h2 id="workbench-attention-title">{title}</h2>{status}</div>{purpose ? <p>{purpose}</p> : null}{blocker ? <div className="order-workbench-attention-blocker">{blocker}</div> : null}</div>
    {action ? <div className="order-workbench-attention-action">{action}</div> : null}
  </section>
);
