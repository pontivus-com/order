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
  openCodeAccountMutationActive: false,
  openCodeAccountLogin: null,
  openCodeAccountLoginTerminal: null,
  tickActive: false,
  schedulerTimer: null,
  schedulerStopped: false,
});
