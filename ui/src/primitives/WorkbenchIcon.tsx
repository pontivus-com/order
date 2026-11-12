import { Icon, type IconName } from "@astryxdesign/core/Icon";
import type { ReactNode } from "react";

export type WorkbenchIconName =
  | "add" | "refresh" | "search" | "copy"
  | "system" | "light" | "dark"
  | "change" | "defect" | "investigation" | "audit"
  | "document" | "locked" | "dialogue" | "review"
  | "success" | "warning" | "failure" | "evidence"
  | "execution" | "back" | "context";

const astryxIcons: Partial<Record<WorkbenchIconName, IconName>> = {
  refresh: "arrowsUpDown",
  search: "search",
  copy: "copy",
  change: "wrench",
  defect: "warning",
  investigation: "info",
  audit: "search",
  locked: "eyeSlash",
  dialogue: "microphone",
  review: "checkDouble",
  success: "success",
  warning: "warning",
  failure: "error",
  evidence: "eyeSlash",
  execution: "wrench",
  back: "chevronLeft",
  context: "info",
};

const fallback: Partial<Record<WorkbenchIconName, string>> = {
  add: "+",
  system: "◐",
  light: "☀",
  dark: "☾",
  document: "▤",
};

export const WorkbenchIcon = ({
  name,
  label,
}: Readonly<{ name: WorkbenchIconName; label?: string }>): ReactNode => {
  const icon = astryxIcons[name];
  if (icon !== undefined) return <Icon icon={icon} size="sm" label={label} />;
  return (
    <span aria-hidden={label === undefined ? "true" : undefined} aria-label={label}>
      {fallback[name] ?? "•"}
    </span>
  );
};
