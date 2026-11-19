import { useEffect, useState, type ReactNode } from "react";
import { Layout, LayoutContent, LayoutPanel } from "@astryxdesign/core/Layout";

const WIDE_QUERY = "(min-width: 1280px)";

const useWideSettings = (): boolean => {
  const [wide, setWide] = useState(() =>
    typeof window === "undefined" ? true : window.matchMedia(WIDE_QUERY).matches,
  );
  useEffect(() => {
    const media = window.matchMedia(WIDE_QUERY);
    const update = () => setWide(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return wide;
};

export const WorkbenchSettingsLayout = ({
  navigation,
  content,
}: Readonly<{ navigation: ReactNode; content: ReactNode }>) => {
  const wide = useWideSettings();

  if (!wide) {
    return (
      <section className="order-settings-layout-constrained" data-testid="workbench-settings-layout">
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
      start={<LayoutPanel width="var(--order-master-width)" hasDivider><div className="order-settings-layout-navigation-surface">{navigation}</div></LayoutPanel>}
      content={<LayoutContent><div className="order-settings-layout-content-surface">{content}</div></LayoutContent>}
      data-testid="workbench-settings-layout"
    />
  );
};
