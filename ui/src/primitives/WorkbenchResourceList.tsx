import { List } from "@astryxdesign/core/List";
import type { ReactNode } from "react";
import {
  WorkbenchResourceRow,
  type WorkbenchResourceItem,
} from "./WorkbenchResourceRow.tsx";

export const WorkbenchResourceList = ({
  label, items, empty = null,
}: Readonly<{
  label?: ReactNode;
  items: readonly WorkbenchResourceItem[];
  empty?: ReactNode;
}>) => items.length === 0 ? empty : (
  <List header={label} density="balanced" hasDividers edge="padded" className="order-workbench-resource-list" data-testid="workbench-resource-list">
    {items.map((item) => (
      <WorkbenchResourceRow key={item.id} {...item} />
    ))}
  </List>
);
