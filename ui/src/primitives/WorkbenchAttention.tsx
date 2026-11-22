import { useId, type ReactNode } from "react";

export const WorkbenchAttention = ({
  title, purpose, status, blocker, action,
}: Readonly<{
  title: string;
  purpose?: string;
  status?: ReactNode;
  blocker?: ReactNode;
  action?: ReactNode;
}>) => {
  const titleId = useId();

  return (
    <section className="order-workbench-attention" aria-labelledby={titleId}>
      <div className="order-workbench-attention-content">
        <div className="order-workbench-attention-heading">
          <h2 id={titleId}>Current attention: {title}</h2>
          {status === undefined ? null : (
            <div className="order-workbench-attention-status">{status}</div>
          )}
        </div>
        {purpose === undefined ? null : (
          <p className="order-workbench-attention-purpose">{purpose}</p>
        )}
        {blocker === undefined ? null : (
          <div className="order-workbench-attention-blocker">{blocker}</div>
        )}
      </div>
      {action === undefined ? null : (
        <div className="order-workbench-attention-action">{action}</div>
      )}
    </section>
  );
};
