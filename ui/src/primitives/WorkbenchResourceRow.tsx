import type { ReactNode } from "react";

import { WorkbenchAction } from "./WorkbenchAction.tsx";

export const WorkbenchResourceRow = ({
  label,
  detail,
  actionLabel = "Open",
  onOpen,
  leading,
}: Readonly<{
  label: string;
  detail?: string;
  actionLabel?: string;
  onOpen: () => void;
  leading?: ReactNode;
}>) => (
  <div className="order-resource-row">
    <div className="order-resource-identity">
      {leading}
      <div>
        <strong>{label}</strong>
        {detail ? <span>{detail}</span> : null}
      </div>
    </div>
    <WorkbenchAction label={actionLabel} tone="ghost" onClick={onOpen} />
  </div>
);
