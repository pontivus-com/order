import type { InputHTMLAttributes, ReactNode } from "react";
import { HStack } from "@astryxdesign/core/HStack";
import { WorkbenchIcon } from "./WorkbenchIcon.tsx";

export const WorkbenchToolbar = ({ start, end }: Readonly<{ start?: ReactNode; end?: ReactNode }>) => (
  <div className="order-toolbar" data-testid="workbench-toolbar">
    <div className="order-toolbar-start">{start}</div>
    <div className="order-toolbar-end">{end}</div>
  </div>
);
export const WorkbenchToolbarGroup = ({ children }: Readonly<{ children: ReactNode }>) => <HStack gap={2} align="center">{children}</HStack>;
export const WorkbenchToolbarUtilities = ({ children }: Readonly<{ children: ReactNode }>) => <HStack gap={2} align="center" data-testid="workbench-utilities">{children}</HStack>;
export const WorkbenchToolbarSearch = (props: InputHTMLAttributes<HTMLInputElement>) => (
  <div className="order-toolbar-search-wrap" data-testid="workbench-search"><WorkbenchIcon name="search" /><input className="order-toolbar-search" type="search" {...props} /></div>
);
