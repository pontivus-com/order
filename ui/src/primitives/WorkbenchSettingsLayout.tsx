import type { ReactNode } from "react";
import { Layout, LayoutContent, LayoutHeader, LayoutPanel } from "@astryxdesign/core/Layout";
import { useWorkbenchResponsiveClass } from "./workbench-responsive.ts";

export const WorkbenchSettingsLayout = ({
  navigation, content,
}: Readonly<{ navigation: ReactNode; content: ReactNode }>) => {
  const responsiveClass = useWorkbenchResponsiveClass();
  const constrained = responsiveClass !== "wide";
  const navigationSurface = (
    <div className="order-settings-layout-navigation-surface">{navigation}</div>
  );

  // Keep the content slot mounted when navigation changes regions. Settings
  // owns unsaved inputs, confirmations and login-attempt identity in this tree.
  return (
    <Layout
      height="fill"
      padding={0}
      className={constrained ? "order-settings-layout-constrained" : undefined}
      data-responsive-class={responsiveClass}
      data-testid="workbench-settings-layout"
      header={constrained ? (
        <LayoutHeader padding={0} hasDivider className="order-settings-layout-constrained-navigation">
          {navigationSurface}
        </LayoutHeader>
      ) : undefined}
      start={constrained ? undefined : (
        <LayoutPanel width="var(--order-master-width)" hasDivider>
          {navigationSurface}
        </LayoutPanel>
      )}
      content={
        <LayoutContent
          padding={constrained ? 3 : undefined}
          className={constrained ? "order-settings-layout-constrained-content" : undefined}
        >
          <div className="order-settings-layout-content-surface">{content}</div>
        </LayoutContent>
      }
    />
  );
};
