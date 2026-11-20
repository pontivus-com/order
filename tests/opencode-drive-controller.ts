import { join } from "node:path";
import { pathToFileURL } from "node:url";

const driveRoot = process.env.PONTIVUS_ORDER_OPENCODE_DRIVE_ROOT;
const marker = process.env.ORDER_SD20_COMPATIBLE;
if (!driveRoot || !marker) {
  throw new TypeError("SD20 Drive controller environment is incomplete");
}

const moduleUrl = (path: string): string =>
  pathToFileURL(join(driveRoot, path)).href;

const Cause = await import(moduleUrl("node_modules/effect/dist/esm/Cause.js"));
const Effect = await import(moduleUrl("node_modules/effect/dist/esm/Effect.js"));
const Exit = await import(moduleUrl("node_modules/effect/dist/esm/Exit.js"));
const Stream = await import(moduleUrl("node_modules/effect/dist/esm/Stream.js"));
const Llm = await import(
  moduleUrl("node_modules/opencode-drive/src/driver/llm.ts")
);
const SimulationConnector = await import(
  moduleUrl("node_modules/opencode-drive/src/simulation/connector.ts")
);
const LlmController = await import(
  moduleUrl("node_modules/opencode-drive/src/driver/llm-controller.ts")
);

const response = () =>
  Stream.fromIterable([
    Llm.text(
      '[{"tag":"AGENT_MESSAGE_FINAL","text":"drive-production-admission","evidence":[]}]',
    ),
    Llm.finish("stop"),
  ]);

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
      const outcome = yield* Effect.exit(cycle);
      if (Exit.isFailure(outcome)) {
        yield* Effect.sync(() =>
          process.stderr.write(Cause.pretty(outcome.cause) + "\n")
        );
        yield* Effect.sleep("100 millis");
      }
    }
  }),
);

await Effect.runPromise(program);
