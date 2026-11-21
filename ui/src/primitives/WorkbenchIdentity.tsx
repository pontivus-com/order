import type { ReactNode } from "react";

export const WorkbenchIdentity = ({
  navigation, identity, utilities,
}: Readonly<{ navigation: ReactNode; identity: ReactNode; utilities: ReactNode }>) => (
  <div className="order-workbench-identity" data-testid="workbench-identity">
    <div className="order-workbench-identity-navigation">{navigation}</div>
    <div className="order-workbench-identity-primary">{identity}</div>
    <div className="order-workbench-identity-utilities">{utilities}</div>
  </div>
);
