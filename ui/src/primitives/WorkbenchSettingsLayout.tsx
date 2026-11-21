import type { ReactNode } from "react";
import { Layout, LayoutContent, LayoutPanel } from "@astryxdesign/core/Layout";
import { useWorkbenchResponsiveClass } from "./workbench-responsive.ts";

export const WorkbenchSettingsLayout = ({
  navigation, content,
}: Readonly<{ navigation: ReactNode; content: ReactNode }>) => {
  const responsiveClass = useWorkbenchResponsiveClass();

  if (responsiveClass !== "wide") {
    return (
      <section
        className="order-settings-layout-constrained"
        data-responsive-class={responsiveClass}
        data-testid="workbench-settings-layout"
      >
        <div className="order-settings-layout-constrained-navigation">
          <div className="order-settings-layout-navigation-surface">{navigation}</div>
        </div>
        <div className="order-settings-layout-constrained-content">
          <div className="order-settings-layout-content-surface">{content}</div>
        </div>
      </section>
    );
  }

  return (
    <Layout
      height="fill"
      padding={0}
      start={
        <LayoutPanel width="var(--order-master-width)" hasDivider>
          <div className="order-settings-layout-navigation-surface">{navigation}</div>
        </LayoutPanel>
      }
      content={
        <LayoutContent>
          <div className="order-settings-layout-content-surface">{content}</div>
        </LayoutContent>
      }
      data-testid="workbench-settings-layout"
    />
  );
};
