import { useQuery } from "@tanstack/react-query";

import * as api from "./http.ts";
import { workbenchQueryKeys } from "./query-keys.ts";
import { WorkbenchStatus } from "./primitives/WorkbenchStatus.tsx";
import { WorkbenchUtilityLink } from "./primitives/WorkbenchUtilityLink.tsx";

export const OpenCodeAccountControl = ({
  onOpenSettings,
}: Readonly<{ onOpenSettings: () => void }>) => {
  const accountStateQuery = useQuery({
    queryKey: workbenchQueryKeys.openCodeAccountState,
    queryFn: api.getOpenCodeAccountState,
  });
  const state = accountStateQuery.data;
  const activeAccount =
    state?.accounts.find((account) => account.active) ?? null;
  const hasMutationBlocker = (state?.mutationBlockers.length ?? 0) > 0;

  const status = accountStateQuery.isError
    ? { tone: "danger" as const, label: "Unavailable" }
    : accountStateQuery.isPending
      ? { tone: "neutral" as const, label: "Checking…" }
      : activeAccount === null
        ? { tone: "warning" as const, label: "Account required" }
        : activeAccount.status.status !== "READY"
          ? { tone: "warning" as const, label: "Needs sign-in" }
          : hasMutationBlocker
            ? { tone: "warning" as const, label: "Changes blocked" }
            : { tone: "success" as const, label: "Ready" };

  const label = activeAccount?.label ??
    (accountStateQuery.isPending ? "Checking…" : "No account");

  return (
    <WorkbenchUtilityLink
      label={label}
      detail={<WorkbenchStatus tone={status.tone} label={status.label} />}
      href="/settings/opencode"
      testId="opencode-account-trigger"
      onNavigate={(event) => {
        event.preventDefault();
        onOpenSettings();
      }}
    />
  );
};
