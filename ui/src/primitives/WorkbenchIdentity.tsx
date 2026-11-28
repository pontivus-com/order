import type { ReactNode } from "react";

export const WorkbenchIdentity = ({
  navigation,
  identity,
  utilities,
}: Readonly<{ navigation: ReactNode; identity: ReactNode; utilities: ReactNode }>) => (
  <header className="order-workbench-identity" data-testid="workbench-identity" aria-label="Selected work item">
    <nav className="order-workbench-identity-navigation" aria-label="Work item navigation">
      {navigation}
    </nav>
    <div className="order-workbench-identity-primary">{identity}</div>
    <div className="order-workbench-identity-utilities" role="group" aria-label="Work item actions">
      {utilities}
    </div>
  </header>
);
