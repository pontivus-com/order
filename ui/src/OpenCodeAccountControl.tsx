import { useQuery } from "@tanstack/react-query";

import * as api from "./http.ts";
import { workbenchQueryKeys } from "./query-keys.ts";

export const OpenCodeAccountControl = ({
  onOpenSettings,
}: Readonly<{ onOpenSettings: () => void }>) => {
  const accountStateQuery = useQuery({
    queryKey: workbenchQueryKeys.openCodeAccountState,
    queryFn: api.getOpenCodeAccountState,
  });
  const state = accountStateQuery.data;
  const active = state?.accounts.find((account) => account.active) ?? null;
  const needsAttention =
    active === null ||
    active.status.status !== "READY" ||
    (state?.mutationBlockers.length ?? 0) > 0;
  const label = accountStateQuery.isError
    ? "OpenCode unavailable"
    : active === null
      ? "OpenCode: no account"
      : `OpenCode: ${active.label}`;

  return (
    <button
      type="button"
      className="order-opencode-account-trigger"
      aria-label={`${label}. Open Settings.`}
      onClick={onOpenSettings}
      data-testid="opencode-account-trigger"
    >
      <span className="order-opencode-account-prefix">OpenCode:</span>
      <strong>{active?.label ?? (accountStateQuery.isPending ? "Checking…" : "No account")}</strong>
      {needsAttention ? <span aria-hidden="true">!</span> : null}
    </button>
  );
};
