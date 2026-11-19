import { StatusDot } from "@astryxdesign/core/StatusDot";
import type { ReactNode } from "react";
export type WorkbenchStatusTone = "neutral" | "info" | "success" | "warning" | "danger";
const dotTone = (tone: WorkbenchStatusTone): "neutral" | "accent" | "success" | "warning" | "error" =>
  tone === "info" ? "accent" : tone === "danger" ? "error" : tone;
export const WorkbenchStatus = ({ tone, label, icon }: Readonly<{ tone: WorkbenchStatusTone; label: string; icon?: ReactNode }>) => (
  <span className="order-workbench-status" data-tone={tone}><StatusDot variant={dotTone(tone)} label={label} icon={icon} /><span>{label}</span></span>
);
