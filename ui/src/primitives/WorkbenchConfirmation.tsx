import { AlertDialog } from "@astryxdesign/core/AlertDialog";
export const WorkbenchConfirmation = ({ open, title, description, confirmLabel, pending, onConfirm, onOpenChange }: Readonly<{ open: boolean; title: string; description: string; confirmLabel: string; pending: boolean; onConfirm: () => void | Promise<void>; onOpenChange: (open: boolean) => void }>) => (
  <AlertDialog isOpen={open} onOpenChange={pending ? () => undefined : onOpenChange} title={title} description={description} actionLabel={confirmLabel} actionVariant="destructive" isActionLoading={pending} onAction={onConfirm} />
);
