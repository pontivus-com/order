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
import { WorkbenchSection } from "./primitives/WorkbenchSection.tsx";
import { WorkbenchFacts } from "./primitives/WorkbenchFacts.tsx";
import { WorkbenchState } from "./primitives/WorkbenchState.tsx";
import { WorkbenchStatus } from "./primitives/WorkbenchStatus.tsx";
import { WorkbenchTable } from "./primitives/WorkbenchTable.tsx";

const errorText = (value: unknown): string =>
  value instanceof Error ? value.message : String(value);

const blockerText = (
  blocker: OpenCodeAccountMutationBlocker,
): string => {
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
    ? account.active
      ? "Active"
      : "Saved"
    : account.active
      ? "Active · needs sign-in"
      : "Needs sign-in";

const loginStatusText = (
  status:
    | "PENDING"
    | "COMPLETED"
    | "FAILED"
    | "EXPIRED"
    | "CANCELLED",
): string => {
  switch (status) {
    case "PENDING":
      return "Waiting for sign-in";
    case "COMPLETED":
      return "Sign-in complete";
    case "FAILED":
      return "Sign-in failed";
    case "EXPIRED":
      return "Sign-in expired";
    case "CANCELLED":
      return "Sign-in cancelled";
  }
};

export const OpenCodeAccountSettings = () => {
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [addLabel, setAddLabel] = useState("");
  const [renameAccountId, setRenameAccountId] =
    useState<OpenCodeAccountId | null>(null);
  const [renameLabel, setRenameLabel] = useState("");
  const [removeAccountId, setRemoveAccountId] =
    useState<OpenCodeAccountId | null>(null);
  const [loginAttemptId, setLoginAttemptId] =
    useState<OpenCodeAccountLoginAttemptId | null>(null);

  const accountStateQuery = useQuery({
    queryKey: workbenchQueryKeys.openCodeAccountState,
    queryFn: api.getOpenCodeAccountState,
  });

  const loginQuery = useQuery({
    queryKey: workbenchQueryKeys.openCodeAccountLogin(loginAttemptId),
    queryFn: () => {
      if (loginAttemptId === null) {
        throw new TypeError(
          "OpenCode login attempt is not selected",
        );
      }
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
        queryClient.invalidateQueries({
          queryKey: workbenchQueryKeys.openCodeAccountState,
        }),
        queryClient.invalidateQueries({
          queryKey: workbenchQueryKeys.settingsReadiness,
        }),
        queryClient.invalidateQueries({
          queryKey: workbenchQueryKeys.settingsModels,
        }),
      ]);
    }
  }, [loginQuery.data?.status, queryClient]);

  const updateAccountState = async (
    state: Awaited<
      ReturnType<typeof api.getOpenCodeAccountState>
    >,
  ): Promise<void> => {
    queryClient.setQueryData(
      workbenchQueryKeys.openCodeAccountState,
      state,
    );
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: workbenchQueryKeys.settingsReadiness,
      }),
      queryClient.invalidateQueries({
        queryKey: workbenchQueryKeys.settingsModels,
      }),
    ]);
  };

  const activate = useMutation({
    mutationFn: (accountId: OpenCodeAccountId) => {
      const state = accountStateQuery.data;
      if (state === undefined) {
        throw new TypeError(
          "OpenCode account state is unavailable",
        );
      }
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
    }: Readonly<{
      accountId: OpenCodeAccountId;
      label: string;
    }>) =>
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
      if (state === undefined) {
        throw new TypeError(
          "OpenCode account state is unavailable",
        );
      }
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
    mutationFn: async (
      attemptId: OpenCodeAccountLoginAttemptId,
    ) => {
      await api.cancelOpenCodeAccountLogin(attemptId);
    },
    onSuccess: async () => {
      setLoginAttemptId(null);
      setAdding(false);
      setAddLabel("");
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: workbenchQueryKeys.openCodeAccountState,
        }),
        queryClient.invalidateQueries({
          queryKey: workbenchQueryKeys.settingsReadiness,
        }),
      ]);
    },
  });

  const state = accountStateQuery.data;
  const blockers = state?.mutationBlockers ?? [];
  const mutationBlocked = blockers.length > 0;
  const loginAttempt = loginQuery.data;
  const removing =
    state?.accounts.find(
      (account) => account.id === removeAccountId,
    ) ?? null;
  const renaming =
    state?.accounts.find(
      (account) => account.id === renameAccountId,
    ) ?? null;

  const resetAdd = (): void => {
    if (loginAttempt?.status === "PENDING") return;
    setAdding(false);
    setAddLabel("");
    setLoginAttemptId(null);
  };

  if (renaming !== null) {
    return (
      <section
        className="order-settings-pane"
        data-testid="settings-opencode"
      >
        <div className="order-settings-bounded-task" data-testid="rename-opencode-account">
        <WorkbenchSectionHeader
          title="Rename OpenCode account"
          description={"Rename " + renaming.label + "."}
        />
        <WorkbenchSection content={<WorkbenchFacts items={[
          { id: "account", label: "Current account", value: renaming.label, emphasis: "strong" },
        ]} />} />
        <WorkbenchForm
          content={
            <TextInput
              label="Account label"
              value={renameLabel}
              onChange={setRenameLabel}
              hasAutoFocus
              width="100%"
            />
          }
          actions={
            <>
              <WorkbenchAction
                label="Save account label"
                tone="primary"
                loading={rename.isPending}
                disabled={
                  rename.isPending ||
                  !OpenCodeAccountLabelSchema.safeParse(
                    renameLabel,
                  ).success
                }
                onClick={() =>
                  rename.mutate({
                    accountId: renaming.id,
                    label: renameLabel,
                  })}
              />
              <WorkbenchAction
                label="Cancel rename"
                disabled={rename.isPending}
                onClick={() => {
                  setRenameAccountId(null);
                  setRenameLabel("");
                }}
              />
            </>
          }
          feedback={
            rename.error ? (
              <WorkbenchNotice
                tone="danger"
                title="Account rename failed"
                description={errorText(rename.error)}
              />
            ) : undefined
          }
        />
        </div>
      </section>
    );
  }

  if (adding && loginAttemptId === null) {
    return (
      <section
        className="order-settings-pane"
        data-testid="settings-opencode"
      >
        <div className="order-settings-bounded-task" data-testid="add-opencode-account">
          <WorkbenchSectionHeader
            title="Add OpenCode account"
            description="Create a human saved-account label, then complete one bounded sign-in."
          />
          <WorkbenchForm
            content={
              <TextInput
                label="Account label"
                value={addLabel}
                onChange={setAddLabel}
                placeholder="you@example.com"
                hasAutoFocus
                width="100%"
              />
            }
            actions={
              <>
                <WorkbenchAction
                  label="Continue to OpenCode sign-in"
                  tone="primary"
                  loading={startLogin.isPending}
                  disabled={
                    mutationBlocked ||
                    startLogin.isPending ||
                    !OpenCodeAccountLabelSchema.safeParse(
                      addLabel,
                    ).success
                  }
                  onClick={() =>
                    startLogin.mutate(addLabel)}
                />
                <WorkbenchAction
                  label="Cancel add account"
                  disabled={startLogin.isPending}
                  onClick={resetAdd}
                />
              </>
            }
            feedback={
              startLogin.error ? (
                <WorkbenchNotice
                  tone="danger"
                  title="OpenCode sign-in could not start"
                  description={errorText(startLogin.error)}
                />
              ) : undefined
            }
          />
        </div>
      </section>
    );
  }

  if (adding && loginAttemptId !== null) {
    return (
      <section
        className="order-settings-pane"
        data-testid="settings-opencode"
      >
        <div
          className="order-settings-login-task"
          data-testid="opencode-login-attempt"
        >
          <WorkbenchSectionHeader
            title="OpenCode sign-in"
            description="Complete the current saved-account authorization."
          />
          {loginAttempt ? (
            <>
              {loginAttempt.status === "PENDING" ? (
                <div className="order-settings-login-instructions">
                  <p>{loginAttempt.instructions}</p>
                  <Link href={loginAttempt.authorizationUrl} isExternalLink>
                    Open OpenCode sign-in
                  </Link>
                </div>
              ) : null}
              <WorkbenchStatus
                tone={
                  loginAttempt.status === "PENDING"
                    ? "info"
                    : loginAttempt.status === "COMPLETED"
                      ? "success"
                      : "warning"
                }
                label={loginStatusText(loginAttempt.status)}
              />
              <p>
                {loginAttempt.status === "PENDING"
                  ? "Waiting for OpenCode sign-in…"
                  : loginAttempt.status === "COMPLETED"
                    ? "OpenCode sign-in complete."
                    : loginAttempt.status === "FAILED"
                      ? loginAttempt.message ??
                        "OpenCode sign-in failed."
                      : loginAttempt.status === "EXPIRED"
                        ? "OpenCode sign-in expired."
                        : "OpenCode sign-in cancelled."}
              </p>
              {loginAttempt.status === "PENDING" ? (
                <>
                  <WorkbenchFacts items={[
                    { id: "expiry", label: "Authorization expires", value: new Date(loginAttempt.expiresAt).toLocaleString() },
                  ]} />
                  <div className="order-inline-actions">
                    <WorkbenchAction
                      label="Cancel OpenCode sign-in"
                      loading={cancelLogin.isPending}
                      disabled={cancelLogin.isPending}
                      onClick={() => cancelLogin.mutate(loginAttempt.id)}
                    />
                  </div>
                </>
              ) : (
                <div className="order-inline-actions">
                  <WorkbenchAction
                    label="Done"
                    tone="primary"
                    onClick={resetAdd}
                  />
                  {loginAttempt.status !== "COMPLETED" ? <WorkbenchAction
                    label="Try sign-in again" tone="secondary"
                    disabled={startLogin.isPending || mutationBlocked || addLabel.trim().length === 0}
                    loading={startLogin.isPending}
                    onClick={() => startLogin.mutate(addLabel)} /> : null}
                </div>
              )}
            </>
          ) : loginQuery.isPending ? (
            <WorkbenchState
              kind="loading"
              title="Starting OpenCode sign-in…"
            />
          ) : null}
          {startLogin.error ? <WorkbenchNotice tone="danger" title="OpenCode sign-in could not be started"
            description={errorText(startLogin.error)} /> : null}
          {cancelLogin.error ? <WorkbenchNotice tone="danger" title="OpenCode sign-in could not be cancelled"
            description={errorText(cancelLogin.error)} /> : null}
          {loginQuery.error ? (
            <>
              <WorkbenchNotice
                tone="danger"
                title="OpenCode sign-in state unavailable"
                description={errorText(loginQuery.error)}
              />
              <div className="order-inline-actions">
                <WorkbenchAction label="Retry sign-in status"
                  onClick={() => { void loginQuery.refetch(); }} />
              </div>
            </>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section
      className="order-settings-pane"
      data-testid="settings-opencode"
    >
      <WorkbenchSectionHeader
        title="OpenCode accounts"
        description="Manage the saved login identities available to this Order installation."
        action={
          <WorkbenchAction
            label="Add account"
            tone="primary"
            disabled={mutationBlocked}
            onClick={() => setAdding(true)}
          />
        }
      />

      {accountStateQuery.isPending ? (
        <WorkbenchState
          kind="loading"
          title="Checking saved accounts…"
        />
      ) : null}
      {accountStateQuery.error ? (
        <WorkbenchNotice
          tone="danger"
          title="OpenCode accounts unavailable"
          description={errorText(accountStateQuery.error)}
        />
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
          <WorkbenchState
            kind="empty"
            title="No saved OpenCode accounts"
          />
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
                  <div className="order-settings-account-status">
                    <WorkbenchStatus
                      tone={
                        account.status.status === "READY"
                          ? account.active
                            ? "success"
                            : "neutral"
                          : "warning"
                      }
                      label={accountStatusText(account)}
                    />
                    {account.status.status === "NEEDS_AUTH" ? (
                      <div>
                        <span>{account.status.message}</span>
                        {account.status.url ? (
                          <>
                            {" "}
                            <Link
                              href={account.status.url}
                              isExternalLink
                            >
                              Open OpenCode sign-in
                            </Link>
                          </>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ),
                actions: (
                  <div className="order-inline-actions">
                    {!account.active ? (
                      <WorkbenchAction
                        label={"Switch to " + account.label}
                        disabled={
                          mutationBlocked || activate.isPending
                        }
                        loading={
                          activate.isPending &&
                          activate.variables === account.id
                        }
                        onClick={() =>
                          activate.mutate(account.id)}
                      />
                    ) : null}
                    <WorkbenchAction
                      label={"Rename " + account.label}
                      tone="ghost"
                      disabled={
                        mutationBlocked || rename.isPending
                      }
                      onClick={() => {
                        setRenameAccountId(account.id);
                        setRenameLabel(account.label);
                      }}
                    />
                    <WorkbenchAction
                      label={"Remove " + account.label}
                      tone="ghost"
                      disabled={
                        mutationBlocked || remove.isPending
                      }
                      onClick={() =>
                        setRemoveAccountId(account.id)}
                    />
                  </div>
                ),
              },
            }))}
          />
        )
      ) : null}

      {activate.error ? (
        <WorkbenchNotice
          tone="danger"
          title="Account switch failed"
          description={errorText(activate.error)}
        />
      ) : null}
      {remove.error ? (
        <WorkbenchNotice
          tone="danger"
          title="Account removal failed"
          description={errorText(remove.error)}
        />
      ) : null}

      <p className="order-settings-account-help">
        Account changes affect login identity only. They do not change
        repository selection or the configured provider/model.
      </p>

      <WorkbenchConfirmation
        kind="destructive"
        open={removing !== null}
        onOpenChange={(open) => {
          if (!open) setRemoveAccountId(null);
        }}
        title="Remove saved OpenCode account?"
        description={
          removing === null
            ? "Remove the selected saved OpenCode credential."
            : "Remove the saved credential for " +
              removing.label +
              " from this Order installation. Repository selection and model configuration are unchanged."
        }
        confirmLabel="Remove account"
        pending={remove.isPending}
        onConfirm={() => {
          if (removing !== null) {
            remove.mutate(removing.id);
          }
        }}
      />
    </section>
  );
};
