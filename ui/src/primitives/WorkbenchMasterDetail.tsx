import { useState, type ReactNode } from "react";
import { Drawer } from "@astryxdesign/core/Drawer";
import { Layout, LayoutContent, LayoutPanel } from "@astryxdesign/core/Layout";
import { WorkbenchAction } from "./WorkbenchAction.tsx";
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
      parentId?: string;
      containsSelection?: boolean;
      onSelect: () => void;
    }>[];
  }>;
  detail: ReactNode;
}>) => {
  const responsiveClass = useWorkbenchResponsiveClass();
  const [masterOpen, setMasterOpen] = useState(false);
  const masterLabel = master.label;
  const masterContent = (
    <nav aria-label={masterLabel} className="order-workbench-master-navigation">
      <header className="order-workbench-master-heading"><strong>{masterLabel}</strong></header>
      {master.items.length === 0 ? (
        <WorkbenchState kind="empty" title="No approved tasks" />
      ) : (
        <ul className="order-workbench-master-list">
          {master.items.filter((item) => item.parentId === undefined).map((item) => {
            const attempts = master.items.filter((attempt) => attempt.parentId === item.id);
            return (
              <li key={item.id} data-contains-selection={item.containsSelection || item.selected}>
                <button type="button" className="order-workbench-master-item"
                  aria-pressed={item.selected}
                  onClick={() => { item.onSelect(); setMasterOpen(false); }}>
                  <strong>{item.label}</strong>
                  {item.state}
                  {item.detail === undefined ? null : <span>{item.detail}</span>}
                </button>
                {attempts.length === 0 ? null : (
                  <div className="order-workbench-master-attempt-group">
                    <div className="order-workbench-master-attempt-heading">Attempts</div>
                    <ul className="order-workbench-master-attempts" aria-label={"Attempts for " + item.label}>
                      {attempts.map((attempt) => (
                        <li key={attempt.id}>
                          <button type="button" className="order-workbench-master-item"
                            aria-pressed={attempt.selected}
                            onClick={() => { attempt.onSelect(); setMasterOpen(false); }}>
                            <strong>{attempt.label}</strong>
                            {attempt.state}
                            {attempt.detail === undefined ? null : <span>{attempt.detail}</span>}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </nav>
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
