import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Drawer } from "@astryxdesign/core/Drawer";

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

export const OpenCodeAccountControl = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addLabel, setAddLabel] = useState("");
  const [renameAccountId, setRenameAccountId] = useState<OpenCodeAccountId | null>(null);
  const [renameLabel, setRenameLabel] = useState("");
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
      void queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.openCodeAccountState });
    }
  }, [loginQuery.data?.status, queryClient]);

  const activate = useMutation({
    mutationFn: (accountId: OpenCodeAccountId) => {
      const state = accountStateQuery.data;
      if (state === undefined) throw new TypeError("OpenCode account state is unavailable");
      return api.activateOpenCodeAccount(accountId, {
        expectedActiveAccountId: state.activeAccountId,
      });
    },
    onSuccess: (state) => {
      queryClient.setQueryData(workbenchQueryKeys.openCodeAccountState, state);
    },
  });

  const rename = useMutation({
    mutationFn: ({
      accountId,
      label,
    }: Readonly<{ accountId: OpenCodeAccountId; label: string }>) =>
      api.renameOpenCodeAccount(accountId, {
        label: OpenCodeAccountLabelSchema.parse(label),
      }),
    onSuccess: (state) => {
      queryClient.setQueryData(workbenchQueryKeys.openCodeAccountState, state);
      setRenameAccountId(null);
      setRenameLabel("");
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
      await queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.openCodeAccountState });
    },
  });

  const state = accountStateQuery.data;
  const activeAccount = state?.accounts.find((account) => account.active) ?? null;
  const blockers = state?.mutationBlockers ?? [];
  const mutationBlocked = blockers.length > 0;
  const activeRunBlocked = blockers.includes("ACTIVE_RUN");
  const loginAttempt = loginQuery.data;

  const triggerText = accountStateQuery.isError
    ? "OpenCode unavailable"
    : activeAccount === null
      ? "OpenCode: no account"
      : `OpenCode: ${activeAccount.label}`;

  const resetAdd = (): void => {
    if (loginAttempt?.status === "PENDING") return;
    setAdding(false);
    setAddLabel("");
    setLoginAttemptId(null);
  };

  return (
    <>
      <button
        type="button"
        className="order-opencode-account-trigger"
        aria-label={triggerText}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        data-testid="opencode-account-trigger"
      >
        <span className="order-opencode-account-prefix">OpenCode:</span>
        <strong>{activeAccount?.label ?? (accountStateQuery.isPending ? "Checking…" : "No account")}</strong>
        {activeAccount?.status.status === "NEEDS_AUTH" ? <span aria-hidden="true">!</span> : null}
      </button>

      <Drawer
        isOpen={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            setRenameAccountId(null);
            setRenameLabel("");
          }
        }}
        label="OpenCode accounts"
        width="30rem"
        side="end"
        padding={0}
        data-testid="opencode-account-drawer"
      >
        <div className="order-opencode-account-panel">
          <header>
            <div>
              <h2>OpenCode accounts</h2>
              <p>Saved OpenCode login accounts for this Order installation.</p>
            </div>
            <WorkbenchAction label="Close OpenCode accounts" tone="ghost" onClick={() => setOpen(false)} />
          </header>

          {accountStateQuery.isPending ? <p>Checking saved accounts…</p> : null}
          {accountStateQuery.error ? (
            <p className="order-error-text" role="alert">{errorText(accountStateQuery.error)}</p>
          ) : null}

          {blockers.map((blocker) => (
            <p
              key={blocker}
              className={blocker === "ACTIVE_RUN" ? "order-warning-text" : "order-muted-text"}
              role={blocker === "ACTIVE_RUN" ? "status" : undefined}
            >
              {blockerText(blocker)}
            </p>
          ))}

          {state ? (
            <div className="order-opencode-account-list" data-testid="opencode-account-list">
              {state.accounts.length === 0 ? <p>No saved OpenCode accounts.</p> : null}
              {state.accounts.map((account) => (
                <section key={account.id} className="order-opencode-account-row">
                  <div className="order-opencode-account-row-heading">
                    <div>
                      <strong>{account.label}</strong>
                      <span>{accountStatusText(account)}</span>
                    </div>
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
                    </div>
                  </div>
                  {account.status.status === "NEEDS_AUTH" ? (
                    <p className="order-warning-text">
                      {account.status.message}
                      {account.status.url ? (
                        <> <a href={account.status.url} target="_blank" rel="noreferrer">Open OpenCode sign-in</a></>
                      ) : null}
                    </p>
                  ) : null}
                  {renameAccountId === account.id ? (
                    <div className="order-opencode-account-edit">
                      <label>
                        Account label
                        <input
                          value={renameLabel}
                          onChange={(event) => setRenameLabel(event.currentTarget.value)}
                          autoFocus
                        />
                      </label>
                      <div className="order-inline-actions">
                        <WorkbenchAction
                          label="Save account label"
                          tone="primary"
                          loading={rename.isPending}
                          disabled={
                            rename.isPending ||
                            OpenCodeAccountLabelSchema.safeParse(renameLabel).success === false
                          }
                          onClick={() => rename.mutate({
                            accountId: account.id,
                            label: renameLabel,
                          })}
                        />
                        <WorkbenchAction
                          label="Cancel rename"
                          onClick={() => {
                            setRenameAccountId(null);
                            setRenameLabel("");
                          }}
                        />
                      </div>
                    </div>
                  ) : null}
                </section>
              ))}
            </div>
          ) : null}

          {activate.error ? <p className="order-error-text" role="alert">{errorText(activate.error)}</p> : null}
          {rename.error ? <p className="order-error-text" role="alert">{errorText(rename.error)}</p> : null}

          <div className="order-opencode-add-account">
            {!adding ? (
              <WorkbenchAction
                label="Add account"
                tone="primary"
                disabled={mutationBlocked}
                onClick={() => setAdding(true)}
              />
            ) : loginAttemptId === null ? (
              <>
                <h3>Add OpenCode account</h3>
                <label>
                  Account label
                  <input
                    value={addLabel}
                    onChange={(event) => setAddLabel(event.currentTarget.value)}
                    placeholder="you@example.com"
                    autoFocus
                  />
                </label>
                <div className="order-inline-actions">
                  <WorkbenchAction
                    label="Continue to OpenCode sign-in"
                    tone="primary"
                    loading={startLogin.isPending}
                    disabled={
                      mutationBlocked ||
                      startLogin.isPending ||
                      OpenCodeAccountLabelSchema.safeParse(addLabel).success === false
                    }
                    onClick={() => startLogin.mutate(addLabel)}
                  />
                  <WorkbenchAction label="Cancel add account" onClick={resetAdd} />
                </div>
                {startLogin.error ? (
                  <p className="order-error-text" role="alert">{errorText(startLogin.error)}</p>
                ) : null}
              </>
            ) : (
              <div className="order-opencode-login-attempt" data-testid="opencode-login-attempt">
                <h3>Sign in with OpenCode</h3>
                {loginAttempt ? (
                  <>
                    <p>{loginAttempt.instructions}</p>
                    <a
                      className="order-external-action"
                      href={loginAttempt.authorizationUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open OpenCode sign-in
                    </a>
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
                      <WorkbenchAction
                        label="Done"
                        tone="primary"
                        onClick={() => {
                          setLoginAttemptId(null);
                          setAdding(false);
                          setAddLabel("");
                        }}
                      />
                    )}
                  </>
                ) : loginQuery.isPending ? (
                  <p>Starting OpenCode sign-in…</p>
                ) : null}
                {loginQuery.error ? (
                  <p className="order-error-text" role="alert">{errorText(loginQuery.error)}</p>
                ) : null}
              </div>
            )}
          </div>

          {activeRunBlocked ? (
            <p className="order-opencode-account-footnote">
              Account switching never changes the configured provider or model.
            </p>
          ) : (
            <p className="order-opencode-account-footnote">
              Account changes affect login identity only; the configured provider and model stay unchanged.
            </p>
          )}
        </div>
      </Drawer>
    </>
  );
};
