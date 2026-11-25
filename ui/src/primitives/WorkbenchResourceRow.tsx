import { ListItem } from "@astryxdesign/core/List";
import type { ReactNode } from "react";

export type WorkbenchResourceItem = Readonly<{
  id: string;
  label: string;
  detail?: ReactNode;
  meta?: ReactNode;
  action?: ReactNode;
}>;

export const WorkbenchResourceRow = ({
  id, label, detail, meta, action,
}: WorkbenchResourceItem) => (
  <ListItem
    itemKey={id}
    label={label}
    description={detail}
    startContent={meta}
    endContent={action}
  />
);
