import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

type Version = readonly [number, number, number];

const argv = process.argv.slice(2);

const argument = (name: string): string | null => {
  const index = argv.indexOf(name);
  return index === -1 ? null : argv[index + 1] ?? null;
};

const fail = (message: string): never => {
  throw new TypeError(message);
};

const git = (...args: readonly string[]): string =>
  execFileSync("git", args, { encoding: "utf8" }).trim();

const parseVersion = (value: string): Version => {
  const match = /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/.exec(value);
  if (match === null) fail(`invalid semantic version: ${value}`);
  return [Number(match[1]), Number(match[2]), Number(match[3])] as const;
};

const compareVersions = (left: Version, right: Version): number => {
  for (let index = 0; index < 3; index += 1) {
    const delta = left[index]! - right[index]!;
    if (delta !== 0) return delta;
  }
  return 0;
};

const packageVersionFromText = (text: string): string => {
  const value: unknown = JSON.parse(text);
  if (
    typeof value !== "object" ||
    value === null ||
    !("version" in value) ||
    typeof value.version !== "string"
  ) {
    fail("package.json must contain a string version");
  }
  parseVersion(value.version);
  return value.version;
};

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^$()|[\]\\{}]/g, "\\$&");

const packageVersion = packageVersionFromText(readFileSync("package.json", "utf8"));
const changelog = readFileSync("CHANGELOG.md", "utf8");

if (!/^## \[Unreleased\]$/m.test(changelog)) {
  fail("CHANGELOG.md must contain an [Unreleased] section");
}

const releasedSectionExists = (version: string): boolean =>
  new RegExp(
    `^## \\[${escapeRegExp(version)}\\] - [0-9]{4}-[0-9]{2}-[0-9]{2}$`,
    "m",
  ).test(changelog);

const pullRequestBody = (): string => {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (eventPath === undefined || eventPath === "") return "";
  const event: unknown = JSON.parse(readFileSync(eventPath, "utf8"));
  if (
    typeof event === "object" &&
    event !== null &&
    "pull_request" in event &&
    typeof event.pull_request === "object" &&
    event.pull_request !== null &&
    "body" in event.pull_request &&
    typeof event.pull_request.body === "string"
  ) {
    return event.pull_request.body;
  }
  return "";
};

const mode = argument("--mode") ?? fail("--mode is required");
const base = argument("--base") ?? "origin/master";

if (mode === "pr") {
  const baseVersion = packageVersionFromText(git("show", `${base}:package.json`));
  const headRef = process.env.GITHUB_HEAD_REF ?? argument("--head-ref") ?? "";
  const changedFiles = git("diff", "--name-only", `${base}...HEAD`)
    .split("\n")
    .filter((path) => path !== "");

  if (headRef.startsWith("release/")) {
    if (!headRef.startsWith("release/v")) {
      fail("release PR branch must be release/vX.Y.Z");
    }
    const target = headRef.slice("release/v".length);
    parseVersion(target);
    if (packageVersion !== target) {
      fail("release PR package.json version must equal its branch version");
    }
    if (compareVersions(parseVersion(packageVersion), parseVersion(baseVersion)) <= 0) {
      fail("release PR version must be greater than the base version");
    }
    if (!releasedSectionExists(packageVersion)) {
      fail("release PR changelog must contain the matching released version section");
    }
    const allowed = new Set(["package.json", "CHANGELOG.md", "README.md"]);
    const forbidden = changedFiles.filter((path) => !allowed.has(path));
    if (forbidden.length !== 0) {
      fail(`release PR contains non-release files: ${forbidden.join(", ")}`);
    }
  } else {
    if (packageVersion !== baseVersion) {
      fail("ordinary work PRs must not change package.json.version");
    }
    if (!changedFiles.includes("CHANGELOG.md")) {
      fail("ordinary work PRs must update CHANGELOG.md [Unreleased]");
    }
    const body = pullRequestBody();
    const impact = /SemVer impact:\s*\*\*(patch|minor|major)\*\*/i.exec(body)?.[1];
    if (impact === undefined) {
      fail("PR body must declare SemVer impact: **patch|minor|major**");
    }
    const target = /Target release:\s*\*\*([0-9]+\.[0-9]+\.[0-9]+)\*\*/i.exec(body)?.[1];
    if (target === undefined) {
      fail("PR body must declare Target release: **X.Y.Z**");
    }
    parseVersion(target);
  }
} else if (mode === "release-commit") {
  const baseVersion = packageVersionFromText(git("show", `${base}:package.json`));
  if (compareVersions(parseVersion(packageVersion), parseVersion(baseVersion)) <= 0) {
    fail("release commit must increase package.json.version");
  }
  if (!releasedSectionExists(packageVersion)) {
    fail("release commit changelog must contain the matching released version section");
  }
} else {
  fail(`unsupported release verification mode: ${mode}`);
}

process.stdout.write(`release metadata verified for ${mode}: ${packageVersion}\n`);
