import { Collapsible } from "@astryxdesign/core/Collapsible";
import type { ReactNode } from "react";
export const WorkbenchDisclosure = ({ label, content }: Readonly<{ label: string; content: ReactNode }>) => <Collapsible trigger={label} defaultIsOpen={false}>{content}</Collapsible>;
