import { AlertDialog } from "@astryxdesign/core/AlertDialog";
import { Dialog } from "@astryxdesign/core/Dialog";
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
  kind: WorkbenchConfirmationKind;
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  pending: boolean;
  onConfirm: () => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
}>) => {
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
        <p className="order-workbench-confirmation-description">{description}</p>
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
