import type { InputHTMLAttributes, ReactNode } from "react";
import { WorkbenchIcon } from "./WorkbenchIcon.tsx";

export const WorkbenchToolbar = ({
  start,
  end,
}: Readonly<{ start?: ReactNode; end?: ReactNode }>) => (
  <div className="order-toolbar">
    <div className="order-toolbar-start">{start}</div>
    <div className="order-toolbar-end">{end}</div>
  </div>
);

export const WorkbenchToolbarGroup = ({ children }: Readonly<{ children: ReactNode }>) => (
  <div className="order-toolbar-group">{children}</div>
);

export const WorkbenchToolbarSearch = (props: InputHTMLAttributes<HTMLInputElement>) => (
  <div className="order-toolbar-search-wrap" data-testid="workbench-search">
    <WorkbenchIcon name="search" />
    <input className="order-toolbar-search" type="search" {...props} />
  </div>
);
