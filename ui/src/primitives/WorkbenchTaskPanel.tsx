import { Dialog } from "@astryxdesign/core/Dialog";
import type { FormEventHandler, ReactNode } from "react";
import { WorkbenchForm } from "./WorkbenchForm.tsx";

export const WorkbenchTaskPanel = ({
  open,
  title,
  description,
  onOpenChange,
  body,
  footer,
  feedback,
  onSubmit,
}: Readonly<{
  open: boolean;
  title: string;
  description?: ReactNode;
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
    <section className="order-workbench-task-panel">
      <header className="order-workbench-task-panel-header">
        <h2 className="order-workbench-task-title">{title}</h2>
        {description === undefined ? null : (
          <div className="order-workbench-task-description">{description}</div>
        )}
      </header>
      <WorkbenchForm
        content={<div className="order-workbench-task-panel-body">{body}</div>}
        feedback={
          feedback === undefined
            ? undefined
            : <div className="order-workbench-task-panel-feedback">{feedback}</div>
        }
        actions={
          <footer className="order-workbench-task-panel-footer">{footer}</footer>
        }
        onSubmit={onSubmit}
      />
    </section>
  </Dialog>
);
