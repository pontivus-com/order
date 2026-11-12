import { useEffect, useState, type ReactNode } from "react";
import { Drawer } from "@astryxdesign/core/Drawer";

const RAIL_QUERY = "(min-width: 1200px)";

const useWideWorkbench = (): boolean => {
  const [wide, setWide] = useState(() =>
    typeof window === "undefined" || typeof window.matchMedia !== "function"
      ? true
      : window.matchMedia(RAIL_QUERY).matches);
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const media = window.matchMedia(RAIL_QUERY);
    const sync = (): void => setWide(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  return wide;
};

export const WorkbenchLayout = ({
  toolbar,
  children,
  inspector,
  inspectorOpen = false,
  onInspectorOpenChange,
}: Readonly<{
  toolbar?: ReactNode;
  children: ReactNode;
  inspector?: ReactNode;
  inspectorOpen?: boolean;
  onInspectorOpenChange?: (open: boolean) => void;
}>) => {
  const wide = useWideWorkbench();
  const hasInspector = inspector !== undefined && inspector !== null;
  return (
    <div className="order-workbench" data-testid="workbench-layout">
      {toolbar ? <header className="order-workbench-toolbar">{toolbar}</header> : null}
      <div className="order-workbench-body">
        <main className="order-workbench-main">{children}</main>
        {wide && hasInspector ? (
          <aside className="order-workbench-context" data-testid="work-item-context">{inspector}</aside>
        ) : null}
      </div>
      {!wide && hasInspector ? (
        <Drawer
          isOpen={inspectorOpen}
          onOpenChange={(open) => onInspectorOpenChange?.(open)}
          label="Work item context"
          width="24rem"
          side="end"
          padding={0}
          data-testid="work-item-context-drawer"
        >
          {inspector}
        </Drawer>
      ) : null}
    </div>
  );
};
