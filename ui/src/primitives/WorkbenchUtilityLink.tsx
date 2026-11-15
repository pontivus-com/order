import { Link } from "@astryxdesign/core/Link";
import type { MouseEvent, ReactNode } from "react";

export const WorkbenchUtilityLink = ({ label, detail, icon, href, onNavigate }: Readonly<{
  label: string; detail?: string; icon?: ReactNode; href: string; onNavigate?: (event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
}>) => (
  <Link href={href} onClick={onNavigate} isStandalone color="secondary">
    <span className="order-utility-link">{icon}<span><strong>{label}</strong>{detail ? <small>{detail}</small> : null}</span></span>
  </Link>
);
