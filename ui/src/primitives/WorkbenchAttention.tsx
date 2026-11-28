import { useId, type ReactNode } from "react";

export const WorkbenchAttention = ({
  title,
  description,
  feedback,
  action,
}: Readonly<{
  title: string;
  description?: ReactNode;
  feedback?: ReactNode;
  action?: ReactNode;
}>) => {
  const titleId = useId();

  return (
    <section className="order-workbench-attention" aria-labelledby={titleId}>
      <div className="order-workbench-attention-content">
        <h2 id={titleId}>{title}</h2>
        {description === undefined ? null : (
          <div className="order-workbench-attention-description">{description}</div>
        )}
        {feedback === undefined ? null : (
          <div className="order-workbench-attention-feedback">{feedback}</div>
        )}
      </div>
      {action === undefined ? null : (
        <div className="order-workbench-attention-action">{action}</div>
      )}
    </section>
  );
};
