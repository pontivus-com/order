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
    label={<span className="order-workbench-resource-label">{label}</span>}
    description={detail === undefined ? undefined : <div className="order-workbench-resource-detail">{detail}</div>}
    align="first-line"
    startContent={meta}
    endContent={action}
  />
);
