import { useQuery } from "@tanstack/react-query";

import * as api from "./http.ts";
import { workbenchQueryKeys } from "./query-keys.ts";

export const useOpenCodeAccountControl = (): Readonly<{
  label: string;
  readiness: Readonly<{
    tone: "neutral" | "success" | "warning" | "danger";
    label: string;
  }>;
}> => {
  const accountStateQuery = useQuery({
    queryKey: workbenchQueryKeys.openCodeAccountState,
    queryFn: api.getOpenCodeAccountState,
  });
  const state = accountStateQuery.data;
  const activeAccount =
    state?.accounts.find((candidate) => candidate.active) ?? null;
  const hasMutationBlocker = (state?.mutationBlockers.length ?? 0) > 0;

  const readiness = accountStateQuery.isError
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

  return {
    label: activeAccount?.label ??
      (accountStateQuery.isPending ? "Checking…" : "No account"),
    readiness,
  };
};
