import { ListItem } from "@astryxdesign/core/List";
import type { ReactNode } from "react";
import { WorkbenchAction } from "./WorkbenchAction.tsx";

export const WorkbenchResourceRow = ({
  label, detail, actionLabel = "Open", onOpen, leading,
}: Readonly<{
  label: string;
  detail?: string;
  actionLabel?: string;
  onOpen: () => void;
  leading?: ReactNode;
}>) => (
  <ListItem
    label={label}
    description={detail}
    startContent={leading}
    endContent={<WorkbenchAction label={actionLabel} tone="ghost" onClick={onOpen} />}
  />
);
