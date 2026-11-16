import type { ReactNode } from "react";
import { WorkbenchIdentity } from "./primitives/WorkbenchIdentity.tsx";

export const WorkItemIdentityRow = ({ navigation, title, detail, utilities }: Readonly<{
  navigation: ReactNode; title: ReactNode; detail?: ReactNode; utilities: ReactNode;
}>) => (
  <WorkbenchIdentity
    navigation={navigation}
    identity={<div className="order-workitem-identity-copy"><div className="order-workitem-identity-title">{title}</div>{detail ? <div className="order-workitem-identity-detail">{detail}</div> : null}</div>}
    utilities={utilities}
  />
);
