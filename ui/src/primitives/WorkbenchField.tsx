import { Field } from "@astryxdesign/core/Field";
import { useId, type ReactNode } from "react";
export const WorkbenchField = ({ label, description, control, error }: Readonly<{ label: string; description?: string; control: ReactNode; error?: string }>) => {
  const id = useId();
  return <Field label={label} description={description} inputID={id} status={error ? { type: "error", message: error } : undefined}>{control}</Field>;
};
