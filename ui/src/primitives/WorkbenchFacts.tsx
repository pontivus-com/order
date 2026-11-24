import type { ReactNode } from "react";

export type WorkbenchFact = Readonly<{
  id: string;
  label: string;
  value: ReactNode;
  emphasis?: "normal" | "strong";
}>;

export const WorkbenchFacts = ({
  label,
  items,
}: Readonly<{
  label?: string;
  items: readonly WorkbenchFact[];
}>) => (
  <dl
    className="order-workbench-facts"
    aria-label={label}
  >
    {items.map((item) => (
      <div
        className="order-workbench-fact"
        data-emphasis={item.emphasis ?? "normal"}
        key={item.id}
      >
        <dt>{item.label}</dt>
        <dd>{item.value}</dd>
      </div>
    ))}
  </dl>
);
