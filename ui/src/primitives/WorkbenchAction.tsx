import { Button } from "@astryxdesign/core/Button";
import { IconButton } from "@astryxdesign/core/IconButton";
import type { MouseEventHandler, ReactNode } from "react";

export type WorkbenchActionTone = "primary" | "secondary" | "destructive" | "ghost";

export const WorkbenchAction = ({
  label, tone = "secondary", type = "button", disabled = false, loading = false,
  icon, iconOnly = false, onClick, testId,
}: Readonly<{
  label: string; tone?: WorkbenchActionTone; type?: "button" | "submit" | "reset";
  disabled?: boolean; loading?: boolean; icon?: ReactNode; iconOnly?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>; testId?: string;
}>) => iconOnly && icon ? (
  <IconButton type={type} label={label} variant={tone} size="sm" isDisabled={disabled}
    isLoading={loading} icon={icon} onClick={onClick} data-testid={testId} />
) : (
  <Button type={type} label={label} variant={tone} size="sm" isDisabled={disabled}
    isLoading={loading} icon={icon} onClick={onClick} data-testid={testId} />
);
