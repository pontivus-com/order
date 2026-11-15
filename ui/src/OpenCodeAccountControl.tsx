import { useQuery } from "@tanstack/react-query";
import * as api from "./http.ts";
import { workbenchQueryKeys } from "./query-keys.ts";
import { WorkbenchUtilityLink } from "./primitives/WorkbenchUtilityLink.tsx";

export const OpenCodeAccountControl = ({ onOpenSettings }: Readonly<{ onOpenSettings: () => void }>) => {
  const accountStateQuery = useQuery({ queryKey: workbenchQueryKeys.openCodeAccountState, queryFn: api.getOpenCodeAccountState });
  const state = accountStateQuery.data;
  const active = state?.accounts.find((account) => account.active) ?? null;
  const needsAttention = active === null || active.status.status !== "READY" || (state?.mutationBlockers.length ?? 0) > 0;
  const accountLabel = active?.label ?? (accountStateQuery.isPending ? "Checking…" : "No account");
  return (
    <WorkbenchUtilityLink
      label={"OpenCode: " + accountLabel}
      detail={accountStateQuery.isError ? "Unavailable" : needsAttention ? "Needs attention" : "Ready"}
      href="/settings/opencode"
      testId="opencode-account-trigger"
      onNavigate={(event) => { event.preventDefault(); onOpenSettings(); }}
    />
  );
};
