import { useState, type ReactNode } from "react";
import { Drawer } from "@astryxdesign/core/Drawer";
import { Layout, LayoutContent, LayoutPanel } from "@astryxdesign/core/Layout";
import { WorkbenchAction } from "./WorkbenchAction.tsx";
import { WorkbenchTable } from "./WorkbenchTable.tsx";
import { WorkbenchState } from "./WorkbenchState.tsx";
import { useWorkbenchResponsiveClass } from "./workbench-responsive.ts";

export const WorkbenchMasterDetail = ({
  master, detail,
}: Readonly<{
  master: Readonly<{
    label: string;
    items: readonly Readonly<{
      id: string;
      label: string;
      detail?: string;
      state?: ReactNode;
      selected: boolean;
      onSelect: () => void;
    }>[];
  }>;
  detail: ReactNode;
}>) => {
  const responsiveClass = useWorkbenchResponsiveClass();
  const [masterOpen, setMasterOpen] = useState(false);
  const masterLabel = master.label;
  const masterContent = master.items.length === 0 ? (
    <WorkbenchState kind="empty" title="No approved tasks" />
  ) : (
    <WorkbenchTable label={masterLabel} selection="single"
      columns={[{ key: "item", label: masterLabel }]}
      rows={master.items.map((item) => ({
        id: item.id,
        selected: item.selected,
        onSelect: () => { item.onSelect(); setMasterOpen(false); },
        cells: { item: (
          <div className="order-workbench-master-item">
            <strong>{item.label}</strong>
            {item.state}
            {item.detail === undefined ? null : <span>{item.detail}</span>}
          </div>
        ) },
      }))}
    />
  );

  if (responsiveClass === "wide") {
    return (
      <Layout
        height="fill"
        padding={0}
        start={
          <LayoutPanel width="var(--order-master-width)" hasDivider padding={0} label={masterLabel}>
            <div className="order-workbench-master-detail-master" data-testid="workbench-master-detail-master">
              {masterContent}
            </div>
          </LayoutPanel>
        }
        content={<LayoutContent padding={0}>{detail}</LayoutContent>}
      />
    );
  }

  return (
    <div className="order-workbench-master-detail-constrained" data-responsive-class={responsiveClass}>
      <div className="order-workbench-master-toggle">
        <WorkbenchAction label={masterLabel} ariaExpanded={masterOpen} onClick={() => setMasterOpen(true)} />
      </div>
      <div className="order-workbench-master-detail-primary">{detail}</div>
      <Drawer
        side="start"
        hasScrim={false}
        label={masterLabel}
        isOpen={masterOpen}
        onOpenChange={setMasterOpen}
        width="var(--order-master-width)"
        padding={0}
      >
        <div className="order-workbench-master-drawer">
          <WorkbenchAction label={"Close " + masterLabel} tone="ghost" onClick={() => setMasterOpen(false)} />
          <div className="order-workbench-master-detail-master" data-testid="workbench-master-detail-master">
            {masterContent}
          </div>
        </div>
      </Drawer>
    </div>
  );
};
