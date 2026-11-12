import { Button } from "@astryxdesign/core/Button";
import type { MouseEventHandler, ReactNode } from "react";

export type WorkbenchActionTone = "primary" | "secondary" | "destructive" | "ghost";

export const WorkbenchAction = ({
  label,
  tone = "secondary",
  type = "button",
  disabled = false,
  loading = false,
  icon,
  iconOnly = false,
  onClick,
  testId,
}: Readonly<{
  label: string;
  tone?: WorkbenchActionTone;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconOnly?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  testId?: string;
}>) => (
  <Button
    type={type}
    label={label}
    variant={tone}
    size="sm"
    isDisabled={disabled}
    isLoading={loading}
    icon={icon}
    isIconOnly={iconOnly}
    onClick={onClick}
    data-testid={testId}
  />
);
