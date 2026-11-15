import {
  Database,
} from "bun:sqlite";
import {
  type OpenCodeAccountId,
  type OpenCodeAccountLabel,
  type OpenCodeAccountLoginAttempt,
  type OpenCodeAccountLoginAttemptId,
  type OrderConfig,
  type Run,
  type RunId,
  type Sha256,
  type WorkItemId,
} from "../core/contracts.ts";
import {
  type OpenCodeProviderProcess,
  type OpenCodeServer,
} from "../shell/opencode.ts";

export type ActiveProvider = Readonly<{
  server: OpenCodeServer;
  sessionId: string;
  trustedAccountId: OpenCodeAccountId;
  stageMaterialIdentity: Sha256 | null;
}>;

export type OpenCodeAccountLoginControl = {
  readonly id: OpenCodeAccountLoginAttemptId;
  readonly providerAttemptId: string;
  readonly process: OpenCodeProviderProcess;
  readonly label: OpenCodeAccountLabel;
  readonly authorizationUrl: string;
  readonly instructions: string;
  readonly expiresAt: string;
};

export type CoordinatorRuntime = {
  readonly database: Database;
  readonly stateRoot: string;
  readonly config: OrderConfig;
  readonly environment: NodeJS.ProcessEnv;
  readonly activeProviders: Map<RunId, ActiveProvider>;
  readonly stageTurnTasks: Map<RunId, Promise<Run>>;
  readonly operatorMutations: Set<WorkItemId>;
  openCodeAccountMutationActive: boolean;
  openCodeAccountLogin: OpenCodeAccountLoginControl | null;
  openCodeAccountLoginTerminal: OpenCodeAccountLoginAttempt | null;
  tickActive: boolean;
  schedulerTimer: ReturnType<typeof setTimeout> | null;
  schedulerStopped: boolean;
};

export const createCoordinatorRuntime = (
  database: Database,
  stateRoot: string,
  environment: NodeJS.ProcessEnv,
  config: OrderConfig,
): CoordinatorRuntime => ({
  database,
  stateRoot,
  config,
  environment,
  activeProviders: new Map(),
  stageTurnTasks: new Map(),
  operatorMutations: new Set(),
  openCodeAccountMutationActive: false,
  openCodeAccountLogin: null,
  openCodeAccountLoginTerminal: null,
  tickActive: false,
  schedulerTimer: null,
  schedulerStopped: false,
});


export const workItemOperatorMutationIsActive = (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
): boolean => runtime.operatorMutations.has(workItemId);

export const withWorkItemOperatorMutation = async <T>(
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
  operation: () => Promise<T> | T,
): Promise<T> => {
  if (runtime.operatorMutations.has(workItemId)) {
    throw new TypeError("WORKITEM_MUTATION_IN_PROGRESS");
  }
  runtime.operatorMutations.add(workItemId);
  try {
    return await operation();
  } finally {
    runtime.operatorMutations.delete(workItemId);
  }
};


export const withWorkItemOperatorMutationSync = <T>(
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
  operation: () => T,
): T => {
  if (runtime.operatorMutations.has(workItemId)) {
    throw new TypeError("WORKITEM_MUTATION_IN_PROGRESS");
  }
  runtime.operatorMutations.add(workItemId);
  try {
    return operation();
  } finally {
    runtime.operatorMutations.delete(workItemId);
  }
};
