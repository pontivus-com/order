import type { ReactNode } from "react";
import { Drawer } from "@astryxdesign/core/Drawer";
import { Layout, LayoutContent, LayoutHeader, LayoutPanel } from "@astryxdesign/core/Layout";
import { useWorkbenchResponsiveClass } from "./workbench-responsive.ts";

export const WorkbenchWorkItemShell = ({
  identity,
  workflowRail,
  primary,
  context,
}: Readonly<{
  identity: ReactNode;
  workflowRail: ReactNode;
  primary: ReactNode;
  context: Readonly<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
    content: ReactNode;
  }> | null;
}>) => {
  const responsiveClass = useWorkbenchResponsiveClass();
  const contextDocked = responsiveClass === "wide" && context !== null && context.open;

  return (
    <div
      className="order-workbench-workitem-shell"
      data-responsive-class={responsiveClass}
      data-testid="workbench-workitem-shell"
    >
      <Layout
        height="fill"
        padding={0}
        header={
          <LayoutHeader padding={0}>
            <div className="order-workbench-chrome">
              {identity}
              {workflowRail}
            </div>
          </LayoutHeader>
        }
        content={<LayoutContent padding={0}>{primary}</LayoutContent>}
        end={
          contextDocked ? (
            <LayoutPanel
              width="var(--order-context-width)"
              padding={0}
              hasDivider
              role="complementary"
              label="Work item context"
              data-testid="work-item-context"
            >
              {context?.content}
            </LayoutPanel>
          ) : undefined
        }
      />
      {responsiveClass !== "wide" && context !== null ? (
        <Drawer
          isOpen={context.open}
          onOpenChange={context.onOpenChange}
          label="Work item context"
          width="var(--order-context-width)"
          side="end"
          padding={0}
          data-testid="work-item-context-drawer"
        >
          {context.content}
        </Drawer>
      ) : null}
    </div>
  );
};
