import { Layout, LayoutContent, LayoutPanel } from "@astryxdesign/core/Layout";
import type { ReactNode } from "react";
export const WorkbenchSettingsLayout = ({ navigation, content }: Readonly<{ navigation: ReactNode; content: ReactNode }>) => (
  <Layout height="fill" padding={0} start={<LayoutPanel width="var(--order-master-width)" hasDivider role="navigation" label="Settings" padding={4}>{navigation}</LayoutPanel>} content={<LayoutContent padding={4}>{content}</LayoutContent>} />
);
