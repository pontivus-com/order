import { useState, type ReactNode } from "react";
import { Drawer } from "@astryxdesign/core/Drawer";
import { Layout, LayoutContent, LayoutPanel } from "@astryxdesign/core/Layout";
import { WorkbenchAction } from "./WorkbenchAction.tsx";
import { useWorkbenchResponsiveClass } from "./workbench-responsive.ts";

export const WorkbenchMasterDetail = ({
  master, detail, masterLabel,
}: Readonly<{ master: ReactNode; detail: ReactNode; masterLabel: string }>) => {
  const responsiveClass = useWorkbenchResponsiveClass();
  const [masterOpen, setMasterOpen] = useState(false);

  if (responsiveClass === "wide") {
    return (
      <Layout
        height="fill"
        padding={0}
        start={
          <LayoutPanel width="var(--order-master-width)" hasDivider padding={0} label={masterLabel}>
            <div className="order-workbench-master-detail-master" data-testid="workbench-master-detail-master">
              {master}
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
            {master}
          </div>
        </div>
      </Drawer>
    </div>
  );
};
