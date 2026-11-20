import { join } from "node:path";
import { pathToFileURL } from "node:url";

const driveRoot = process.env.PONTIVUS_ORDER_OPENCODE_DRIVE_ROOT;
const marker = process.env.ORDER_SD20_COMPATIBLE;
if (!driveRoot || !marker) {
  throw new TypeError("SD20 Drive controller environment is incomplete");
}

const moduleUrl = (path: string): string =>
  pathToFileURL(join(driveRoot, path)).href;

const drive = await import(
  moduleUrl("node_modules/opencode-drive/src/index.ts")
);
const { Effect, Llm } = drive;
const SimulationConnector = await import(
  moduleUrl("node_modules/opencode-drive/src/simulation/connector.ts")
);
const LlmController = await import(
  moduleUrl("node_modules/opencode-drive/src/driver/llm-controller.ts")
);

const response = () =>
  LlmController.response(
    Llm.text(
      '[{"tag":"AGENT_MESSAGE_FINAL","text":"drive-production-admission","evidence":[]}]',
    ),
    Llm.finish("stop"),
  );

const program = Effect.scoped(
  Effect.gen(function* () {
    while (true) {
      const cycle = Effect.scoped(
        Effect.gen(function* () {
          const controller = yield* LlmController.make({
            requestTimeout: 60_000,
            settlementTimeout: 60_000,
          });
          yield* controller.serve(() => response());
          const backend = yield* SimulationConnector.backend(
            "ws://127.0.0.1:40950",
            {
              connectTimeout: 1_000,
              requestTimeout: 60_000,
              compatibility: "required",
            },
          );
          yield* backend.attachTools([]);
          yield* Effect.promise(() => Bun.write(marker, "compatible\n"));
          const attachment = yield* controller.attach(backend);
          yield* backend.closed.pipe(
            Effect.ensuring(attachment.detach()),
          );
        }),
      );
      yield* Effect.matchCauseEffect(cycle, {
        onFailure: (cause: unknown) =>
          Effect.sync(() =>
            process.stderr.write(String(cause) + "\n")
          ).pipe(Effect.andThen(Effect.sleep("100 millis"))),
        onSuccess: () => Effect.void,
      });
    }
  }),
);

await Effect.runPromise(program);
