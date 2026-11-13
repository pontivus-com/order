import { randomUUID } from "node:crypto";

import {
  ActivateOpenCodeAccountSchema,
  OpenCodeAccountIdSchema,
  OpenCodeAccountLabelSchema,
  OpenCodeAccountLoginAttemptIdSchema,
  OpenCodeAccountLoginAttemptSchema,
  OpenCodeAccountStateSchema,
  RemoveOpenCodeAccountSchema,
  RenameOpenCodeAccountSchema,
  StartOpenCodeAccountLoginSchema,
  type ActivateOpenCodeAccount,
  type OpenCodeAccount,
  type OpenCodeAccountId,
  type OpenCodeAccountLoginAttempt,
  type OpenCodeAccountLoginAttemptId,
  type OpenCodeAccountMutationBlocker,
  type OpenCodeAccountState,
  type RemoveOpenCodeAccount,
  type RenameOpenCodeAccount,
  type StartOpenCodeAccountLogin,
} from "../core/contracts.ts";
import {
  activateOpenCodeAccount,
  cancelOpenCodeAccountOAuth,
  listOpenCodeAccounts,
  pollOpenCodeAccountOAuth,
  removeOpenCodeAccount,
  renameOpenCodeAccount,
  startOpenCodeAccountControl,
  startOpenCodeAccountOAuth,
  stopOpenCodeAccountControl,
  type OpenCodeProviderProcess,
} from "../shell/opencode.ts";
import {
  loadRunsForWorkItem,
  loadWorkItems,
} from "../shell/sqlite.ts";
import type {
  CoordinatorRuntime,
  OpenCodeAccountLoginControl,
} from "./runtime.ts";

const activeRunExists = (runtime: CoordinatorRuntime): boolean =>
  loadWorkItems(runtime.database).some((workItem) =>
    loadRunsForWorkItem(runtime.database, workItem.id)
      .some((run) => run.status === "RUNNING" || run.status === "WAITING_FOR_INPUT")
  );

const mutationBlockers = (
  runtime: CoordinatorRuntime,
): readonly OpenCodeAccountMutationBlocker[] => {
  const blockers: OpenCodeAccountMutationBlocker[] = [];
  if (activeRunExists(runtime)) blockers.push("ACTIVE_RUN");
  if (runtime.openCodeAccountLogin !== null) blockers.push("LOGIN_ATTEMPT_ACTIVE");
  if (runtime.openCodeAccountMutationActive) blockers.push("ACCOUNT_MUTATION_ACTIVE");
  return blockers;
};

const stateFromAccounts = (
  runtime: CoordinatorRuntime,
  accounts: readonly OpenCodeAccount[],
): OpenCodeAccountState =>
  OpenCodeAccountStateSchema.parse({
    accounts,
    activeAccountId: accounts.find((account) => account.active)?.id ?? null,
    mutationBlockers: mutationBlockers(runtime),
  });

const withAccountControl = async <T>(
  runtime: CoordinatorRuntime,
  effect: (control: OpenCodeProviderProcess) => Promise<T>,
): Promise<T> => {
  const control = await startOpenCodeAccountControl(
    runtime.stateRoot,
    runtime.environment,
  );
  try {
    return await effect(control);
  } finally {
    await stopOpenCodeAccountControl(control).catch(() => undefined);
  }
};

export const openCodeAccountState = async (
  runtime: CoordinatorRuntime,
): Promise<OpenCodeAccountState> => {
  const accounts = await withAccountControl(
    runtime,
    listOpenCodeAccounts,
  );
  return stateFromAccounts(runtime, accounts);
};

const requireMutationAdmission = (
  runtime: CoordinatorRuntime,
): void => {
  const blockers = mutationBlockers(runtime);
  if (blockers.length !== 0) {
    throw new TypeError(
      "OpenCode account mutation is blocked: " + blockers.join(","),
    );
  }
};

const beginMutation = (runtime: CoordinatorRuntime): void => {
  requireMutationAdmission(runtime);
  runtime.openCodeAccountMutationActive = true;
};

const repeatMutationAdmission = (runtime: CoordinatorRuntime): void => {
  if (activeRunExists(runtime)) {
    throw new TypeError("OpenCode account mutation is blocked: ACTIVE_RUN");
  }
  if (runtime.openCodeAccountLogin !== null) {
    throw new TypeError("OpenCode account mutation is blocked: LOGIN_ATTEMPT_ACTIVE");
  }
};

const requireAccount = (
  accounts: readonly OpenCodeAccount[],
  accountId: OpenCodeAccountId,
): OpenCodeAccount => {
  const account = accounts.find((candidate) => candidate.id === accountId);
  if (account === undefined) throw new TypeError("OpenCode account does not exist");
  return account;
};

const requireUniqueLabel = (
  accounts: readonly OpenCodeAccount[],
  label: string,
  exceptAccountId: OpenCodeAccountId | null,
): void => {
  if (accounts.some((account) =>
    account.id !== exceptAccountId && account.label === label
  )) {
    throw new TypeError("OpenCode account label already exists");
  }
};

export const activateSavedOpenCodeAccount = async (
  runtime: CoordinatorRuntime,
  accountId: OpenCodeAccountId,
  input: ActivateOpenCodeAccount,
): Promise<OpenCodeAccountState> => {
  const id = OpenCodeAccountIdSchema.parse(accountId);
  const command = ActivateOpenCodeAccountSchema.parse(input);
  beginMutation(runtime);
  let accounts: readonly OpenCodeAccount[];
  try {
    accounts = await withAccountControl(runtime, async (control) => {
      const before = await listOpenCodeAccounts(control);
      const current = before.find((account) => account.active)?.id ?? null;
      if (current !== command.expectedActiveAccountId) {
        throw new TypeError("OpenCode active account changed");
      }
      const target = requireAccount(before, id);
      repeatMutationAdmission(runtime);
      if (!target.active) await activateOpenCodeAccount(control, id);
      const after = await listOpenCodeAccounts(control);
      if (!requireAccount(after, id).active) {
        throw new TypeError("OpenCode account activation was not retained");
      }
      return after;
    });
  } finally {
    runtime.openCodeAccountMutationActive = false;
  }
  return stateFromAccounts(runtime, accounts);
};

export const renameSavedOpenCodeAccount = async (
  runtime: CoordinatorRuntime,
  accountId: OpenCodeAccountId,
  input: RenameOpenCodeAccount,
): Promise<OpenCodeAccountState> => {
  const id = OpenCodeAccountIdSchema.parse(accountId);
  const command = RenameOpenCodeAccountSchema.parse(input);
  beginMutation(runtime);
  let accounts: readonly OpenCodeAccount[];
  try {
    accounts = await withAccountControl(runtime, async (control) => {
      const before = await listOpenCodeAccounts(control);
      requireAccount(before, id);
      requireUniqueLabel(before, command.label, id);
      repeatMutationAdmission(runtime);
      await renameOpenCodeAccount(control, id, command.label);
      const after = await listOpenCodeAccounts(control);
      if (requireAccount(after, id).label !== command.label) {
        throw new TypeError("OpenCode account rename was not retained");
      }
      return after;
    });
  } finally {
    runtime.openCodeAccountMutationActive = false;
  }
  return stateFromAccounts(runtime, accounts);
};

export const removeSavedOpenCodeAccount = async (
  runtime: CoordinatorRuntime,
  accountId: OpenCodeAccountId,
  input: RemoveOpenCodeAccount,
): Promise<OpenCodeAccountState> => {
  const id = OpenCodeAccountIdSchema.parse(accountId);
  const command = RemoveOpenCodeAccountSchema.parse(input);
  beginMutation(runtime);
  let accounts: readonly OpenCodeAccount[];
  try {
    accounts = await withAccountControl(runtime, async (control) => {
      const before = await listOpenCodeAccounts(control);
      const current = before.find((account) => account.active)?.id ?? null;
      if (current !== command.expectedActiveAccountId) {
        throw new TypeError("OpenCode active account changed");
      }
      requireAccount(before, id);
      repeatMutationAdmission(runtime);
      await removeOpenCodeAccount(control, id);
      const after = await listOpenCodeAccounts(control);
      if (after.some((account) => account.id === id)) {
        throw new TypeError("OpenCode account removal was not retained");
      }
      return after;
    });
  } finally {
    runtime.openCodeAccountMutationActive = false;
  }
  return stateFromAccounts(runtime, accounts);
};

const pendingAttempt = (
  control: OpenCodeAccountLoginControl,
): OpenCodeAccountLoginAttempt =>
  OpenCodeAccountLoginAttemptSchema.parse({
    id: control.id,
    authorizationUrl: control.authorizationUrl,
    instructions: control.instructions,
    expiresAt: control.expiresAt,
    status: "PENDING",
    message: null,
  });

const releaseLogin = async (
  runtime: CoordinatorRuntime,
  terminal: OpenCodeAccountLoginAttempt,
): Promise<OpenCodeAccountLoginAttempt> => {
  const control = runtime.openCodeAccountLogin;
  runtime.openCodeAccountLogin = null;
  runtime.openCodeAccountLoginTerminal = terminal;
  if (control !== null) {
    await stopOpenCodeAccountControl(control.process).catch(() => undefined);
  }
  return terminal;
};

export const startSavedOpenCodeAccountLogin = async (
  runtime: CoordinatorRuntime,
  input: StartOpenCodeAccountLogin,
): Promise<OpenCodeAccountLoginAttempt> => {
  const command = StartOpenCodeAccountLoginSchema.parse(input);
  requireMutationAdmission(runtime);

  const initialAccounts = await withAccountControl(runtime, listOpenCodeAccounts);
  requireUniqueLabel(initialAccounts, command.label, null);

  beginMutation(runtime);
  let control: OpenCodeProviderProcess | null = null;
  try {
    control = await startOpenCodeAccountControl(
      runtime.stateRoot,
      runtime.environment,
    );
    repeatMutationAdmission(runtime);
    const currentAccounts = await listOpenCodeAccounts(control);
    requireUniqueLabel(currentAccounts, command.label, null);
    const providerAttempt = await startOpenCodeAccountOAuth(control, command.label);
    repeatMutationAdmission(runtime);

    const id = OpenCodeAccountLoginAttemptIdSchema.parse(randomUUID());
    runtime.openCodeAccountLoginTerminal = null;
    runtime.openCodeAccountLogin = {
      id,
      providerAttemptId: providerAttempt.providerAttemptId,
      process: control,
      label: OpenCodeAccountLabelSchema.parse(command.label),
      authorizationUrl: providerAttempt.authorizationUrl,
      instructions: providerAttempt.instructions,
      expiresAt: providerAttempt.expiresAt,
    };
    control = null;
    return pendingAttempt(runtime.openCodeAccountLogin);
  } finally {
    runtime.openCodeAccountMutationActive = false;
    if (control !== null) {
      await stopOpenCodeAccountControl(control).catch(() => undefined);
    }
  }
};

const requireLogin = (
  runtime: CoordinatorRuntime,
  attemptId: OpenCodeAccountLoginAttemptId,
): OpenCodeAccountLoginControl => {
  const current = runtime.openCodeAccountLogin;
  if (current === null || current.id !== attemptId) {
    throw new TypeError("OpenCode account login attempt does not exist");
  }
  return current;
};

export const pollSavedOpenCodeAccountLogin = async (
  runtime: CoordinatorRuntime,
  attemptId: OpenCodeAccountLoginAttemptId,
): Promise<OpenCodeAccountLoginAttempt> => {
  const id = OpenCodeAccountLoginAttemptIdSchema.parse(attemptId);
  if (runtime.openCodeAccountLoginTerminal?.id === id) {
    return runtime.openCodeAccountLoginTerminal;
  }
  const control = requireLogin(runtime, id);
  const status = await pollOpenCodeAccountOAuth(
    control.process,
    control.providerAttemptId,
  );
  if (status.status === "PENDING") return pendingAttempt(control);

  if (status.status === "COMPLETED") {
    const accounts = await listOpenCodeAccounts(control.process);
    const completedAccount = accounts.find((account) =>
      account.label === control.label && account.active
    );
    if (completedAccount === undefined) {
      throw new TypeError(
        "OpenCode login completed before the new account became the active safe projection",
      );
    }
  }

  const terminal = OpenCodeAccountLoginAttemptSchema.parse({
    id: control.id,
    authorizationUrl: control.authorizationUrl,
    instructions: control.instructions,
    expiresAt: control.expiresAt,
    status: status.status,
    message: status.message,
  });
  return releaseLogin(runtime, terminal);
};

export const cancelSavedOpenCodeAccountLogin = async (
  runtime: CoordinatorRuntime,
  attemptId: OpenCodeAccountLoginAttemptId,
): Promise<void> => {
  const id = OpenCodeAccountLoginAttemptIdSchema.parse(attemptId);
  if (runtime.openCodeAccountLoginTerminal?.id === id) return;

  const control = requireLogin(runtime, id);
  const status = await pollOpenCodeAccountOAuth(
    control.process,
    control.providerAttemptId,
  );
  if (status.status !== "PENDING") {
    if (status.status === "COMPLETED") {
      const accounts = await listOpenCodeAccounts(control.process);
      if (!accounts.some((account) =>
        account.label === control.label && account.active
      )) {
        throw new TypeError(
          "OpenCode login completed before the new account became the active safe projection",
        );
      }
    }
    await releaseLogin(runtime, OpenCodeAccountLoginAttemptSchema.parse({
      id: control.id,
      authorizationUrl: control.authorizationUrl,
      instructions: control.instructions,
      expiresAt: control.expiresAt,
      status: status.status,
      message: status.message,
    }));
    return;
  }

  await cancelOpenCodeAccountOAuth(
    control.process,
    control.providerAttemptId,
  );
  await releaseLogin(runtime, OpenCodeAccountLoginAttemptSchema.parse({
    id: control.id,
    authorizationUrl: control.authorizationUrl,
    instructions: control.instructions,
    expiresAt: control.expiresAt,
    status: "CANCELLED",
    message: null,
  }));
};


export const stopSavedOpenCodeAccountControl = async (
  runtime: CoordinatorRuntime,
): Promise<void> => {
  const control = runtime.openCodeAccountLogin;
  runtime.openCodeAccountLogin = null;
  runtime.openCodeAccountLoginTerminal = null;
  runtime.openCodeAccountMutationActive = false;
  if (control !== null) {
    await stopOpenCodeAccountControl(control.process).catch(() => undefined);
  }
};
