import type { ReactNode } from "react";

export type WorkbenchAttentionTone = "neutral" | "info" | "success" | "warning" | "danger";

export const WorkbenchAttention = ({ title, purpose, status, blocker, action, tone = "info" }: Readonly<{
  title: string;
  purpose?: string;
  status?: ReactNode;
  blocker?: ReactNode;
  action?: ReactNode;
  tone?: WorkbenchAttentionTone;
}>) => (
  <section className="order-workbench-attention" data-tone={tone} aria-labelledby="workbench-attention-title">
    <div className="order-workbench-attention-copy">
      <div className="order-workbench-attention-heading">
        <h2 id="workbench-attention-title">Current attention: {title}</h2>
        {status ? <div className="order-workbench-attention-status">{status}</div> : null}
      </div>
      {purpose ? <p>{purpose}</p> : null}
      {blocker ? <div className="order-workbench-attention-blocker">{blocker}</div> : null}
    </div>
    {action ? <div className="order-workbench-attention-action">{action}</div> : null}
  </section>
);
