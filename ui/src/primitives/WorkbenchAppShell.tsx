import type { ReactNode } from "react";
import { AppShell } from "@astryxdesign/core/AppShell";

export const WorkbenchAppShell = ({
  toolbar,
  destination,
}: Readonly<{ toolbar: ReactNode; destination: ReactNode }>) => (
  <AppShell
    topNav={toolbar}
    mobileNav={false}
    contentPadding={0}
    height="fill"
    variant="section"
    data-testid="workbench-app-shell"
  >
    <main
      className="order-workbench-destination"
      data-testid="workbench-app-destination"
    >
      {destination}
    </main>
  </AppShell>
);
