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
  <List header={label}>
    {items.map((item) => (
      <WorkbenchResourceRow key={item.id} {...item} />
    ))}
  </List>
);
