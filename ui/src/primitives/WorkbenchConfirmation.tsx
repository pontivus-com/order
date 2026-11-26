import { AlertDialog } from "@astryxdesign/core/AlertDialog";
import { Dialog } from "@astryxdesign/core/Dialog";
import type { ReactNode } from "react";
import { WorkbenchAction } from "./WorkbenchAction.tsx";

export type WorkbenchConfirmationKind = "safety" | "destructive";

export const WorkbenchConfirmation = ({
  kind,
  open,
  title,
  description,
  confirmLabel,
  pending,
  onConfirm,
  onOpenChange,
}: Readonly<{
  open: boolean;
  title: string;
  confirmLabel: string;
  pending: boolean;
  onConfirm: () => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
}> & (
  | Readonly<{ kind: "safety"; description: ReactNode }>
  | Readonly<{ kind: "destructive"; description: string }>
)) => {
  const onGuardedOpenChange = (nextOpen: boolean): void => {
    if (!pending) onOpenChange(nextOpen);
  };

  if (kind === "destructive") {
    return (
      <AlertDialog
        isOpen={open}
        onOpenChange={onGuardedOpenChange}
        title={title}
        description={description}
        actionLabel={confirmLabel}
        actionVariant="destructive"
        isActionLoading={pending}
        onAction={onConfirm}
      />
    );
  }

  return (
    <Dialog
      isOpen={open}
      onOpenChange={onGuardedOpenChange}
      aria-label={title}
      padding={0}
    >
      <section className="order-workbench-confirmation">
        <h2>{title}</h2>
        <div className="order-workbench-confirmation-description">{description}</div>
        <div className="order-workbench-confirmation-actions">
          <WorkbenchAction
            label="Cancel"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          />
          <WorkbenchAction
            label={confirmLabel}
            tone="primary"
            loading={pending}
            disabled={pending}
            onClick={() => { void onConfirm(); }}
          />
        </div>
      </section>
    </Dialog>
  );
};
