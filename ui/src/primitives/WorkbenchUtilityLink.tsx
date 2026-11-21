import { Link } from "@astryxdesign/core/Link";
import type { MouseEvent, ReactNode } from "react";

export const WorkbenchUtilityLink = ({
  label, detail, icon, href, testId, onNavigate,
}: Readonly<{
  label: string;
  detail?: ReactNode;
  icon?: ReactNode;
  href: string;
  testId?: string;
  onNavigate?: (event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
}>) => (
  <Link href={href} onClick={onNavigate} isStandalone color="secondary" data-testid={testId}>
    <span className="order-utility-link">
      {icon}
      <span>
        <strong>{label}</strong>
        {detail === undefined ? null : <small>{detail}</small>}
      </span>
    </span>
  </Link>
);
