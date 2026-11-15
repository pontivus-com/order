import { AlertDialog } from "@astryxdesign/core/AlertDialog";
export const WorkbenchConfirmation = ({ open, title, description, confirmLabel, pending, actionTone = "destructive", onConfirm, onOpenChange }: Readonly<{ open: boolean; title: string; description: string; confirmLabel: string; pending: boolean; actionTone?: "primary" | "secondary" | "destructive"; onConfirm: () => void | Promise<void>; onOpenChange: (open: boolean) => void }>) => (
  <AlertDialog isOpen={open} onOpenChange={pending ? () => undefined : onOpenChange} title={title} description={description} actionLabel={confirmLabel} actionVariant={actionTone} isActionLoading={pending} onAction={onConfirm} />
);
