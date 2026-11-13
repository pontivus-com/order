import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

const git = (...args: readonly string[]): string =>
  execFileSync("git", args, { encoding: "utf8" }).trim();

const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
  version?: unknown;
};
if (
  typeof packageJson.version !== "string" ||
  !/^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/.test(packageJson.version)
) {
  throw new TypeError("package.json contains an invalid release version");
}

const version = packageJson.version;
const gitCommit = git("rev-parse", "HEAD");
if (!/^[0-9a-f]{40}$/.test(gitCommit)) {
  throw new TypeError("release packaging requires an exact Git commit");
}

const commitEpoch = git("show", "-s", "--format=%ct", "HEAD");
if (!/^[0-9]+$/.test(commitEpoch)) {
  throw new TypeError("release packaging could not resolve the commit timestamp");
}
if (!existsSync("dist")) {
  throw new TypeError("release packaging requires the production dist/ build");
}

const outputRoot = resolve(process.argv[2] ?? "release");
rmSync(outputRoot, { recursive: true, force: true });
mkdirSync(outputRoot, { recursive: true });

const staging = mkdtempSync(join(tmpdir(), "pontivus-order-release-"));
const orderRoot = join(staging, "order");
mkdirSync(orderRoot, { recursive: true });

try {
  const tracked = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
    .split("\0")
    .filter((path) => path !== "")
    .filter((path) => !path.startsWith(".github/"))
    .filter((path) => !path.startsWith("tests/"))
    .filter((path) => path !== "playwright.config.ts")
    .filter((path) => path !== "vitest.config.ts");

  for (const path of tracked) {
    const destination = join(orderRoot, path);
    mkdirSync(dirname(destination), { recursive: true });
    cpSync(path, destination);
  }

  cpSync("dist", join(orderRoot, "dist"), { recursive: true });
  writeFileSync(
    join(orderRoot, "RELEASE.json"),
    JSON.stringify({ version, gitCommit }, null, 2) + "\n",
  );

  const tarPath = join(outputRoot, "pontivus-order.tar");
  execFileSync("tar", [
    "--sort=name",
    "--mtime=@" + commitEpoch,
    "--owner=0",
    "--group=0",
    "--numeric-owner",
    "-cf",
    tarPath,
    "-C",
    staging,
    "order",
  ]);
  execFileSync("gzip", ["-n", "-f", tarPath]);

  const generatedArchive = tarPath + ".gz";
  const archive = join(outputRoot, "pontivus-order.tar.gz");
  renameSync(generatedArchive, archive);

  const digest = createHash("sha256")
    .update(readFileSync(archive))
    .digest("hex");
  writeFileSync(
    join(outputRoot, "pontivus-order.tar.gz.sha256"),
    digest + "  pontivus-order.tar.gz\n",
  );

  const changelog = readFileSync("CHANGELOG.md", "utf8");
  const escapedVersion = version.replaceAll(".", "\\.");
  const headingPattern = new RegExp(
    "^## \\[" + escapedVersion + "\\] - [0-9]{4}-[0-9]{2}-[0-9]{2}$",
    "m",
  );
  const heading = headingPattern.exec(changelog);
  if (heading !== null && heading.index !== undefined) {
    const headingEnd = changelog.indexOf("\n", heading.index);
    const bodyStart = headingEnd === -1 ? changelog.length : headingEnd + 1;
    const nextHeading = changelog.indexOf("\n## [", bodyStart);
    const body = changelog
      .slice(bodyStart, nextHeading === -1 ? changelog.length : nextHeading)
      .trim();
    writeFileSync(
      join(outputRoot, "release-notes.md"),
      "# Order " + version + "\n\n" + body + "\n",
    );
  }

  process.stdout.write(archive + "\n");
} finally {
  rmSync(staging, { recursive: true, force: true });
}
