import type { ReactNode, Ref } from "react";
import { WorkbenchIdentity } from "./primitives/WorkbenchIdentity.tsx";

export const WorkItemIdentityRow = ({
  navigation, title, kind, headingRef, editing, detail, utilities,
}: Readonly<{
  navigation: ReactNode;
  title: string;
  kind: string;
  headingRef: Ref<HTMLHeadingElement>;
  editing?: ReactNode;
  detail?: ReactNode;
  utilities: ReactNode;
}>) => (
  <WorkbenchIdentity
    navigation={navigation}
    identity={
      <div className="order-workitem-identity-copy">
        {editing === undefined ? (
          <div className="order-workitem-title-row">
            <h1 ref={headingRef} tabIndex={-1} data-testid="work-item-heading" title={title}>{title}</h1>
            <span className="order-workitem-kind">{kind}</span>
          </div>
        ) : editing}
        {detail === undefined ? null : <div className="order-workitem-identity-detail">{detail}</div>}
      </div>
    }
    utilities={utilities}
  />
);
