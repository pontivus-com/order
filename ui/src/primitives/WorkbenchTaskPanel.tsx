import { Dialog } from "@astryxdesign/core/Dialog";
import type { FormEventHandler, ReactNode } from "react";

export const WorkbenchTaskPanel = ({
  open, title, onOpenChange, body, footer, feedback, onSubmit,
}: Readonly<{
  open: boolean;
  title: string;
  onOpenChange: (open: boolean) => void;
  body: ReactNode;
  footer: ReactNode;
  feedback?: ReactNode;
  onSubmit?: FormEventHandler<HTMLFormElement>;
}>) => (
  <Dialog
    isOpen={open}
    onOpenChange={onOpenChange}
    purpose="form"
    aria-label={title}
    padding={0}
  >
    <form className="order-workbench-task-panel" onSubmit={onSubmit}>
      <header className="order-workbench-task-panel-header">
        <h2 className="order-workbench-task-title">{title}</h2>
      </header>
      <div className="order-workbench-task-panel-body">
        {body}
        {feedback === undefined ? null : (
          <div className="order-workbench-task-panel-feedback">{feedback}</div>
        )}
      </div>
      <footer className="order-workbench-task-panel-footer">
        {footer}
      </footer>
    </form>
  </Dialog>
);
