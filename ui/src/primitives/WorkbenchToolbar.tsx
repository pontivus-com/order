import type { ReactNode } from "react";
import { HStack } from "@astryxdesign/core/HStack";
import { TextInput } from "@astryxdesign/core/TextInput";
import { WorkbenchIcon } from "./WorkbenchIcon.tsx";

export const WorkbenchToolbar = ({
  start, end,
}: Readonly<{ start?: ReactNode; end?: ReactNode }>) => (
  <div className="order-toolbar" data-testid="workbench-toolbar">
    <div className="order-toolbar-start">{start}</div>
    <div className="order-toolbar-end">{end}</div>
  </div>
);

export const WorkbenchToolbarGroup = ({ children }: Readonly<{ children: ReactNode }>) => (
  <HStack gap={2} align="center">{children}</HStack>
);

export const WorkbenchToolbarUtilities = ({ children }: Readonly<{ children: ReactNode }>) => (
  <HStack gap={2} align="center" data-testid="workbench-utilities">{children}</HStack>
);

export const WorkbenchToolbarSearch = ({
  value, onChange, placeholder = "Search work items",
}: Readonly<{ value: string; onChange: (value: string) => void; placeholder?: string }>) => (
  <div className="order-toolbar-search-wrap" data-testid="workbench-search">
    <TextInput
      label="Search work items"
      isLabelHidden
      type="search"
      size="sm"
      width="100%"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      startIcon={<WorkbenchIcon name="search" />}
    />
  </div>
);
