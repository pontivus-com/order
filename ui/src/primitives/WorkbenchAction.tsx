import { Button } from "@astryxdesign/core/Button";
import { IconButton } from "@astryxdesign/core/IconButton";
import type { MouseEventHandler, ReactNode } from "react";

export type WorkbenchActionTone = "primary" | "secondary" | "destructive" | "ghost";

export const WorkbenchAction = ({
  label, tone = "secondary", type = "button", disabled = false, loading = false,
  icon, iconOnly = false, onClick, testId, ariaExpanded,
}: Readonly<{
  label: string; tone?: WorkbenchActionTone; type?: "button" | "submit" | "reset";
  disabled?: boolean; loading?: boolean; icon?: ReactNode; iconOnly?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>; testId?: string; ariaExpanded?: boolean;
}>) => iconOnly && icon ? (
  <IconButton type={type} label={label} variant={tone} size="sm" isDisabled={disabled}
    isLoading={loading} icon={icon} onClick={onClick} data-testid={testId} aria-expanded={ariaExpanded} />
) : (
  <Button type={type} label={label} variant={tone} size="sm" isDisabled={disabled}
    isLoading={loading} icon={icon} onClick={onClick} data-testid={testId} aria-expanded={ariaExpanded} />
);
