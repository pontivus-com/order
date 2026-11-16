import { Banner } from "@astryxdesign/core/Banner";
import type { ReactNode } from "react";
export type WorkbenchNoticeTone = "info" | "success" | "warning" | "danger";
export const WorkbenchNotice = ({ tone, title, description, action }: Readonly<{ tone: WorkbenchNoticeTone; title: string; description?: ReactNode; action?: ReactNode }>) => (
  <Banner status={tone === "danger" ? "error" : tone} title={title} description={description} endContent={action} container="section" collapsible={false} />
);
