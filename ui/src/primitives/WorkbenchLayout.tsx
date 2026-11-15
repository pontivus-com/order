import { useEffect, useState, type ReactNode } from "react";
import { AppShell } from "@astryxdesign/core/AppShell";
import { Drawer } from "@astryxdesign/core/Drawer";
import { Layout } from "@astryxdesign/core/Layout";
import { LayoutContent } from "@astryxdesign/core/Layout";
import { LayoutHeader } from "@astryxdesign/core/Layout";
import { LayoutPanel } from "@astryxdesign/core/Layout";

const WIDE_QUERY = "(min-width: 1280px)";

export const useWideWorkbench = (): boolean => {
  const [wide, setWide] = useState(() => typeof window === "undefined" ||
    typeof window.matchMedia !== "function" || window.matchMedia(WIDE_QUERY).matches);
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const media = window.matchMedia(WIDE_QUERY);
    const sync = (): void => setWide(media.matches);
    sync(); media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  return wide;
};

export const WorkbenchLayout = ({
  toolbar, primary, workItemChrome,
}: Readonly<{
  toolbar: ReactNode;
  primary: ReactNode;
  workItemChrome: Readonly<{
    identity: ReactNode;
    workflowRail: ReactNode;
    context: Readonly<{ open: boolean; onOpenChange: (open: boolean) => void; content: ReactNode }> | null;
  }> | null;
}>) => {
  const wide = useWideWorkbench();
  const context = workItemChrome?.context ?? null;
  const content = workItemChrome === null ? primary : (
    <Layout
      height="fill"
      padding={0}
      header={<LayoutHeader padding={0} hasDivider><div className="order-workbench-chrome">{workItemChrome.identity}{workItemChrome.workflowRail}</div></LayoutHeader>}
      content={<LayoutContent padding={0}>{primary}</LayoutContent>}
      end={wide && context?.open ? <LayoutPanel width="var(--order-context-width)" padding={0} hasDivider role="complementary" label="Work item context">{context.content}</LayoutPanel> : undefined}
    />
  );
  return (
    <AppShell topNav={toolbar} mobileNav={false} contentPadding={0} height="fill" variant="section" data-testid="workbench-layout">
      {content}
      {!wide && context ? (
        <Drawer isOpen={context.open} onOpenChange={context.onOpenChange} label="Work item context"
          width="var(--order-context-width)" side="end" padding={0} data-testid="work-item-context-drawer">
          {context.content}
        </Drawer>
      ) : null}
    </AppShell>
  );
};
