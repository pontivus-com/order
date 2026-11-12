import {
  Database,
} from "bun:sqlite";
import {
  type OrderConfig,
  type RunId,
} from "../core/contracts.ts";
import {
  type OpenCodeServer,
} from "../shell/opencode.ts";

export type ActiveProvider = Readonly<{
  server: OpenCodeServer;
  sessionId: string;
}>;

export type CoordinatorRuntime = {
  readonly database: Database;
  readonly stateRoot: string;
  readonly config: OrderConfig;
  readonly environment: NodeJS.ProcessEnv;
  readonly activeProviders: Map<RunId, ActiveProvider>;
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
  tickActive: false,
  schedulerTimer: null,
  schedulerStopped: false,
});
