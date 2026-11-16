import { Dialog } from "@astryxdesign/core/Dialog";
import { Layout, LayoutContent, LayoutHeader } from "@astryxdesign/core/Layout";
import type { ReactNode } from "react";
export const WorkbenchTaskPanel = ({ open, title, onOpenChange, content }: Readonly<{ open: boolean; title: string; onOpenChange: (open: boolean) => void; content: ReactNode }>) => (
  <Dialog isOpen={open} onOpenChange={onOpenChange} purpose="form" aria-label={title} width="min(42rem, calc(100vw - 2rem))" padding={0}>
    <Layout height="auto" padding={0} header={<LayoutHeader hasDivider><h2 className="order-workbench-task-title">{title}</h2></LayoutHeader>} content={<LayoutContent isScrollable={false}>{content}</LayoutContent>} />
  </Dialog>
);
