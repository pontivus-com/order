import type { ReactNode } from "react";
import { AppShell } from "@astryxdesign/core/AppShell";

export const WorkbenchAppShell = ({
  toolbar,
  destination,
}: Readonly<{ toolbar: ReactNode; destination: ReactNode }>) => (
  <AppShell
    topNav={<div className="order-application-toolbar">{toolbar}</div>}
    mobileNav={false}
    contentPadding={0}
    height="fill"
    variant="section"
    data-testid="workbench-app-shell"
  >
    <div className="order-workbench-app-destination">{destination}</div>
  </AppShell>
);
