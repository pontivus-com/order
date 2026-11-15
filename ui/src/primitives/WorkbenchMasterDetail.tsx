import { useEffect, useState, type ReactNode } from "react";
import { Drawer } from "@astryxdesign/core/Drawer";
import { Layout, LayoutContent, LayoutPanel } from "@astryxdesign/core/Layout";

const WIDE_QUERY = "(min-width: 1280px)";
export const WorkbenchMasterDetail = ({ master, detail, masterLabel }: Readonly<{ master: ReactNode; detail: ReactNode; masterLabel: string }>) => {
  const [wide, setWide] = useState(() => typeof window === "undefined" || typeof window.matchMedia !== "function" || window.matchMedia(WIDE_QUERY).matches);
  const [open, setOpen] = useState(false);
  useEffect(() => { if (typeof window.matchMedia !== "function") return; const m = window.matchMedia(WIDE_QUERY); const sync = () => setWide(m.matches); sync(); m.addEventListener("change", sync); return () => m.removeEventListener("change", sync); }, []);
  if (wide) return <Layout height="fill" padding={0} start={<LayoutPanel width="var(--order-master-width)" hasDivider padding={0} label={masterLabel}>{master}</LayoutPanel>} content={<LayoutContent padding={0}>{detail}</LayoutContent>} />;
  return <div className="order-workbench-master-detail-constrained"><button className="order-workbench-master-toggle" type="button" onClick={() => setOpen(true)}>{masterLabel}</button><div className="order-workbench-master-detail-primary">{detail}</div><Drawer side="start" hasScrim={false} label={masterLabel} isOpen={open} onOpenChange={setOpen} width="var(--order-master-width)" padding={0}>{master}</Drawer></div>;
};
