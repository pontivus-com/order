import { List, ListItem } from "@astryxdesign/core/List";
import type { ReactNode } from "react";

export type WorkbenchTimelineItem = Readonly<{
  id: string;
  heading: ReactNode;
  meta?: ReactNode;
  body?: ReactNode;
  action?: ReactNode;
  evidence?: ReactNode;
}>;

export const WorkbenchTimeline = ({
  label, items,
}: Readonly<{ label: string; items: readonly WorkbenchTimelineItem[] }>) => (
  <section className="order-workbench-timeline" aria-label={label}>
    <List density="compact" hasDividers edge="padded" className="order-workbench-timeline-list">
      {items.map((item) => (
        <ListItem
          key={item.id}
          itemKey={item.id}
          label={item.heading}
          description={
            <span className="order-workbench-timeline-description">
              {item.meta}
              {item.body}
              {item.evidence}
            </span>
          }
          endContent={item.action}
        />
      ))}
    </List>
  </section>
);
