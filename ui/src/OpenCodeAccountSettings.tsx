import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@astryxdesign/core/Link";
import { TextInput } from "@astryxdesign/core/TextInput";

import {
  OpenCodeAccountLabelSchema,
  type OpenCodeAccount,
  type OpenCodeAccountId,
  type OpenCodeAccountLoginAttemptId,
  type OpenCodeAccountMutationBlocker,
} from "../../src/core/contracts.ts";
import * as api from "./http.ts";
import { workbenchQueryKeys } from "./query-keys.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchConfirmation } from "./primitives/WorkbenchConfirmation.tsx";
import { WorkbenchForm } from "./primitives/WorkbenchForm.tsx";
import { WorkbenchNotice } from "./primitives/WorkbenchNotice.tsx";
import { WorkbenchSectionHeader } from "./primitives/WorkbenchSectionHeader.tsx";
import { WorkbenchState } from "./primitives/WorkbenchState.tsx";
import { WorkbenchStatus } from "./primitives/WorkbenchStatus.tsx";
import { WorkbenchTable } from "./primitives/WorkbenchTable.tsx";

const errorText = (value: unknown): string =>
  value instanceof Error ? value.message : String(value);

const blockerText = (blocker: OpenCodeAccountMutationBlocker): string => {
  switch (blocker) {
    case "ACTIVE_RUN":
      return "Finish or cancel active agent work before changing the OpenCode account.";
    case "LOGIN_ATTEMPT_ACTIVE":
      return "Finish or cancel the current OpenCode sign-in before changing accounts.";
    case "ACCOUNT_MUTATION_ACTIVE":
      return "An OpenCode account change is already in progress.";
  }
};

const accountStatusText = (account: OpenCodeAccount): string =>
  account.status.status === "READY"
    ? account.active ? "Active" : "Saved"
    : account.active ? "Active · needs sign-in" : "Needs sign-in";

export const OpenCodeAccountSettings = () => {
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [addLabel, setAddLabel] = useState("");
  const [renameAccountId, setRenameAccountId] = useState<OpenCodeAccountId | null>(null);
  const [renameLabel, setRenameLabel] = useState("");
  const [removeAccountId, setRemoveAccountId] = useState<OpenCodeAccountId | null>(null);
  const [loginAttemptId, setLoginAttemptId] = useState<OpenCodeAccountLoginAttemptId | null>(null);

  const accountStateQuery = useQuery({
    queryKey: workbenchQueryKeys.openCodeAccountState,
    queryFn: api.getOpenCodeAccountState,
  });

  const loginQuery = useQuery({
    queryKey: workbenchQueryKeys.openCodeAccountLogin(loginAttemptId),
    queryFn: () => {
      if (loginAttemptId === null) throw new TypeError("OpenCode login attempt is not selected");
      return api.getOpenCodeAccountLogin(loginAttemptId);
    },
    enabled: loginAttemptId !== null,
    refetchInterval: (query) =>
      query.state.data?.status === "PENDING" ? 1_000 : false,
  });

  useEffect(() => {
    const status = loginQuery.data?.status;
    if (
      status === "COMPLETED" ||
      status === "FAILED" ||
      status === "EXPIRED" ||
      status === "CANCELLED"
    ) {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.openCodeAccountState }),
        queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.settingsReadiness }),
        queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.settingsModels }),
      ]);
    }
  }, [loginQuery.data?.status, queryClient]);

  const updateAccountState = async (state: Awaited<ReturnType<typeof api.getOpenCodeAccountState>>) => {
    queryClient.setQueryData(workbenchQueryKeys.openCodeAccountState, state);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.settingsReadiness }),
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.settingsModels }),
    ]);
  };

  const activate = useMutation({
    mutationFn: (accountId: OpenCodeAccountId) => {
      const state = accountStateQuery.data;
      if (state === undefined) throw new TypeError("OpenCode account state is unavailable");
      return api.activateOpenCodeAccount(accountId, {
        expectedActiveAccountId: state.activeAccountId,
      });
    },
    onSuccess: updateAccountState,
  });

  const rename = useMutation({
    mutationFn: ({
      accountId,
      label,
    }: Readonly<{ accountId: OpenCodeAccountId; label: string }>) =>
      api.renameOpenCodeAccount(accountId, {
        label: OpenCodeAccountLabelSchema.parse(label),
      }),
    onSuccess: async (state) => {
      await updateAccountState(state);
      setRenameAccountId(null);
      setRenameLabel("");
    },
  });

  const remove = useMutation({
    mutationFn: (accountId: OpenCodeAccountId) => {
      const state = accountStateQuery.data;
      if (state === undefined) throw new TypeError("OpenCode account state is unavailable");
      return api.removeOpenCodeAccount(accountId, {
        expectedActiveAccountId: state.activeAccountId,
      });
    },
    onSuccess: async (state) => {
      await updateAccountState(state);
      setRemoveAccountId(null);
    },
  });

  const startLogin = useMutation({
    mutationFn: (label: string) =>
      api.startOpenCodeAccountLogin({
        label: OpenCodeAccountLabelSchema.parse(label),
      }),
    onSuccess: (attempt) => {
      queryClient.setQueryData(
        workbenchQueryKeys.openCodeAccountLogin(attempt.id),
        attempt,
      );
      setLoginAttemptId(attempt.id);
    },
  });

  const cancelLogin = useMutation({
    mutationFn: async (attemptId: OpenCodeAccountLoginAttemptId) => {
      await api.cancelOpenCodeAccountLogin(attemptId);
    },
    onSuccess: async () => {
      setLoginAttemptId(null);
      setAdding(false);
      setAddLabel("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.openCodeAccountState }),
        queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.settingsReadiness }),
      ]);
    },
  });

  const state = accountStateQuery.data;
  const blockers = state?.mutationBlockers ?? [];
  const mutationBlocked = blockers.length > 0;
  const loginAttempt = loginQuery.data;
  const removing = state?.accounts.find((account) => account.id === removeAccountId) ?? null;
  const renaming = state?.accounts.find((account) => account.id === renameAccountId) ?? null;

  const resetAdd = (): void => {
    if (loginAttempt?.status === "PENDING") return;
    setAdding(false);
    setAddLabel("");
    setLoginAttemptId(null);
  };

  return (
    <section className="order-settings-section" data-testid="settings-opencode">
      <WorkbenchSectionHeader
        title="OpenCode accounts"
        description="Manage the saved OpenCode login identities available to this Order installation."
      />

      {accountStateQuery.isPending ? <WorkbenchState kind="loading" title="Checking saved accounts…" /> : null}
      {accountStateQuery.error ? (
        <WorkbenchNotice tone="danger" title="OpenCode accounts unavailable" description={errorText(accountStateQuery.error)} />
      ) : null}

      {blockers.map((blocker) => (
        <WorkbenchNotice
          key={blocker}
          tone={blocker === "ACTIVE_RUN" ? "warning" : "info"}
          title="Account change unavailable"
          description={blockerText(blocker)}
        />
      ))}

      {state ? (
        state.accounts.length === 0 ? (
          <WorkbenchState kind="empty" title="No saved OpenCode accounts" />
        ) : (
          <WorkbenchTable
            label="Saved OpenCode accounts"
            columns={[
              { key: "account", label: "Account" },
              { key: "status", label: "Status" },
              { key: "actions", label: "" },
            ]}
            rows={state.accounts.map((account) => ({
              id: account.id,
              cells: {
                account: <strong>{account.label}</strong>,
                status: (
                  <div>
                    <WorkbenchStatus
                      tone={account.status.status === "READY" ? (account.active ? "success" : "neutral") : "warning"}
                      label={accountStatusText(account)}
                    />
                    {account.status.status === "NEEDS_AUTH" ? (
                      <div>
                        <span>{account.status.message}</span>
                        {account.status.url ? <> <Link href={account.status.url} isExternalLink>Open OpenCode sign-in</Link></> : null}
                      </div>
                    ) : null}
                  </div>
                ),
                actions: (
                  <div className="order-inline-actions">
                    {!account.active ? (
                      <WorkbenchAction
                        label={`Switch to ${account.label}`}
                        disabled={mutationBlocked || activate.isPending}
                        loading={activate.isPending && activate.variables === account.id}
                        onClick={() => activate.mutate(account.id)}
                      />
                    ) : null}
                    <WorkbenchAction
                      label={`Rename ${account.label}`}
                      tone="ghost"
                      disabled={mutationBlocked || rename.isPending}
                      onClick={() => {
                        setRenameAccountId(account.id);
                        setRenameLabel(account.label);
                      }}
                    />
                    <WorkbenchAction
                      label={`Remove ${account.label}`}
                      tone="ghost"
                      disabled={mutationBlocked || remove.isPending}
                      onClick={() => setRemoveAccountId(account.id)}
                    />
                  </div>
                ),
              },
            }))}
          />
        )
      ) : null}

      {renaming ? (
        <section data-testid="rename-opencode-account">
          <WorkbenchSectionHeader title={"Rename " + renaming.label} />
          <WorkbenchForm
            content={<TextInput label="Account label" value={renameLabel} onChange={setRenameLabel} hasAutoFocus width="100%" />}
            actions={<>
              <WorkbenchAction
                label="Save account label"
                tone="primary"
                loading={rename.isPending}
                disabled={rename.isPending || OpenCodeAccountLabelSchema.safeParse(renameLabel).success === false}
                onClick={() => rename.mutate({ accountId: renaming.id, label: renameLabel })}
              />
              <WorkbenchAction label="Cancel rename" onClick={() => { setRenameAccountId(null); setRenameLabel(""); }} />
            </>}
          />
        </section>
      ) : null}

      {activate.error ? <WorkbenchNotice tone="danger" title="Account switch failed" description={errorText(activate.error)} /> : null}
      {rename.error ? <WorkbenchNotice tone="danger" title="Account rename failed" description={errorText(rename.error)} /> : null}
      {remove.error ? <WorkbenchNotice tone="danger" title="Account removal failed" description={errorText(remove.error)} /> : null}

      <section data-testid="add-opencode-account">
        {!adding ? (
          <WorkbenchAction
            label="Add account"
            tone="primary"
            disabled={mutationBlocked}
            onClick={() => setAdding(true)}
          />
        ) : loginAttemptId === null ? (
          <>
            <WorkbenchSectionHeader title="Add OpenCode account" />
            <WorkbenchForm
              content={<TextInput label="Account label" value={addLabel} onChange={setAddLabel} placeholder="you@example.com" hasAutoFocus width="100%" />}
              actions={<>
                <WorkbenchAction
                  label="Continue to OpenCode sign-in"
                  tone="primary"
                  loading={startLogin.isPending}
                  disabled={mutationBlocked || startLogin.isPending || OpenCodeAccountLabelSchema.safeParse(addLabel).success === false}
                  onClick={() => startLogin.mutate(addLabel)}
                />
                <WorkbenchAction label="Cancel add account" onClick={resetAdd} />
              </>}
              feedback={startLogin.error ? <WorkbenchNotice tone="danger" title="OpenCode sign-in could not start" description={errorText(startLogin.error)} /> : undefined}
            />
          </>
        ) : (
          <section data-testid="opencode-login-attempt">
            <h3>Sign in with OpenCode</h3>
            {loginAttempt ? (
              <>
                <p>{loginAttempt.instructions}</p>
                <Link href={loginAttempt.authorizationUrl} isExternalLink>Open OpenCode sign-in</Link>
                <p>
                  {loginAttempt.status === "PENDING" ? "Waiting for OpenCode sign-in…" : null}
                  {loginAttempt.status === "COMPLETED" ? "OpenCode sign-in complete." : null}
                  {loginAttempt.status === "FAILED" ? loginAttempt.message ?? "OpenCode sign-in failed." : null}
                  {loginAttempt.status === "EXPIRED" ? "OpenCode sign-in expired." : null}
                  {loginAttempt.status === "CANCELLED" ? "OpenCode sign-in cancelled." : null}
                </p>
                {loginAttempt.status === "PENDING" ? (
                  <WorkbenchAction
                    label="Cancel OpenCode sign-in"
                    loading={cancelLogin.isPending}
                    onClick={() => cancelLogin.mutate(loginAttempt.id)}
                  />
                ) : (
                  <WorkbenchAction label="Done" tone="primary" onClick={resetAdd} />
                )}
              </>
            ) : loginQuery.isPending ? (
              <p>Starting OpenCode sign-in…</p>
            ) : null}
            {loginQuery.error ? (
              <WorkbenchNotice tone="danger" title="OpenCode sign-in state unavailable" description={errorText(loginQuery.error)} />
            ) : null}
          </section>
        )}
      </section>

      <p className="order-opencode-account-footnote">
        Account changes affect login identity only; the configured provider and model stay unchanged.
      </p>

      <WorkbenchConfirmation
        open={removeAccountId !== null}
        onOpenChange={(open) => { if (!open) setRemoveAccountId(null); }}
        title="Remove saved OpenCode account?"
        description="Remove the selected saved OpenCode credential from this installation."
        confirmLabel="Remove account"
        pending={remove.isPending}
        onConfirm={() => { if (removeAccountId !== null) remove.mutate(removeAccountId); }}
      />
    </section>
  );
};
