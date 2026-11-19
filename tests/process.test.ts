import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const temporary: string[] = [];

const tempDir = (prefix: string): string => {
  const path = mkdtempSync(join(tmpdir(), prefix));
  temporary.push(path);
  return path;
};

afterEach(() => {
  for (const path of temporary.splice(0)) {
    rmSync(path, { recursive: true, force: true });
  }
});

const bunEval = (code: string): unknown => {
  const result = spawnSync("bun", ["--eval", code], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: { ...process.env },
    timeout: 20_000,
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout);
  }
  return JSON.parse(result.stdout.trim());
};

describe("process shell", () => {
  it("kills the entire detached process group on timeout", () => {
    const root = tempDir("order-process-timeout-");
    const pidFile = join(root, "descendant.pid");
    const output = bunEval(`
      const p = await import("./src/shell/process.ts");
      const fs = await import("node:fs");
      const pidFile = ${JSON.stringify(pidFile)};
      const env = {
        PATH: process.env.PATH ?? "/usr/bin:/bin",
        PIDFILE: pidFile,
      };
      const result = await p.runProcess(
        ["bash", "-c", 'sleep 300 & echo "$!" > "$PIDFILE"; wait'],
        ${JSON.stringify(root)},
        env,
        1,
      );
      const pid = Number(fs.readFileSync(pidFile, "utf8").trim());
      const dead = async () => {
        for (let i = 0; i < 40; i += 1) {
          try { process.kill(pid, 0); } catch (error) {
            if (error?.code === "ESRCH") return true;
            throw error;
          }
          await new Promise((resolve) => setTimeout(resolve, 25));
        }
        return false;
      };
      console.log(JSON.stringify({
        timedOut: result.timedOut,
        cancelled: result.cancelled,
        descendantDead: await dead(),
      }));
    `) as { timedOut: boolean; cancelled: boolean; descendantDead: boolean };

    expect(output).toEqual({
      timedOut: true,
      cancelled: false,
      descendantDead: true,
    });
  });

  it("uses the same group cleanup path for explicit cancellation", () => {
    const root = tempDir("order-process-cancel-");
    const pidFile = join(root, "descendant.pid");
    const output = bunEval(`
      const p = await import("./src/shell/process.ts");
      const fs = await import("node:fs");
      const pidFile = ${JSON.stringify(pidFile)};
      const controller = new AbortController();
      const env = {
        PATH: process.env.PATH ?? "/usr/bin:/bin",
        PIDFILE: pidFile,
      };
      const running = p.runProcess(
        ["bash", "-c", 'sleep 300 & echo "$!" > "$PIDFILE"; wait'],
        ${JSON.stringify(root)},
        env,
        30,
        controller.signal,
      );
      for (let i = 0; i < 100 && !fs.existsSync(pidFile); i += 1) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      if (!fs.existsSync(pidFile)) throw new Error("descendant pid was not recorded");
      const pid = Number(fs.readFileSync(pidFile, "utf8").trim());
      controller.abort();
      const result = await running;
      const dead = async () => {
        for (let i = 0; i < 40; i += 1) {
          try { process.kill(pid, 0); } catch (error) {
            if (error?.code === "ESRCH") return true;
            throw error;
          }
          await new Promise((resolve) => setTimeout(resolve, 25));
        }
        return false;
      };
      console.log(JSON.stringify({
        timedOut: result.timedOut,
        cancelled: result.cancelled,
        descendantDead: await dead(),
      }));
    `) as { timedOut: boolean; cancelled: boolean; descendantDead: boolean };

    expect(output).toEqual({
      timedOut: false,
      cancelled: true,
      descendantDead: true,
    });
  });
});
