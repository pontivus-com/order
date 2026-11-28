import type { FormEventHandler, ReactNode } from "react";

export const WorkbenchForm = ({
  content, actions, feedback, onSubmit,
}: Readonly<{
  content: ReactNode;
  actions: ReactNode;
  feedback?: ReactNode;
  onSubmit?: FormEventHandler<HTMLFormElement>;
}>) => (
  <form className="order-workbench-form" onSubmit={onSubmit}>
    <div className="order-workbench-form-content">{content}</div>
    {feedback === undefined ? null : <div className="order-workbench-form-feedback">{feedback}</div>}
    <div className="order-workbench-form-actions">{actions}</div>
  </form>
);
