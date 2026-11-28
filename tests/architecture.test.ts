import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readlinkSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, extname, join, matchesGlob, relative, resolve } from "node:path";

import { describe, expect, it } from "vitest";
import { admitSignedTaskBlockForSchema, parseSignedTaskBlockFromPlan } from "../src/core/execution.ts";

const repositoryRoot = process.cwd();
const sourceExtensions = new Set([".ts", ".tsx"]);

const repositoryPath = (absolutePath: string): string =>
  relative(repositoryRoot, absolutePath).replaceAll("\\", "/");

const collectProductionFiles = (relativeRoot: string): readonly string[] => {
  const absoluteRoot = join(repositoryRoot, relativeRoot);
  if (!existsSync(absoluteRoot)) return [];
  const files: string[] = [];
  const visit = (directory: string): void => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const absolute = join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(absolute);
      } else if (entry.isFile() && sourceExtensions.has(extname(entry.name))) {
        files.push(repositoryPath(absolute));
      }
    }
  };
  visit(absoluteRoot);
  return files.sort();
};

const productionFiles = [
  ...collectProductionFiles("src"),
  ...collectProductionFiles("ui/src"),
];

const sourceText = (path: string): string =>
  readFileSync(join(repositoryRoot, path), "utf8");

const importSpecifiers = (source: string): readonly string[] => {
  const specifiers: string[] = [];
  const patterns = [
    /\bfrom\s+["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
    /\bimport\s+["']([^"']+)["']/g,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      const value = match[1];
      if (value !== undefined) specifiers.push(value);
    }
  }
  return specifiers;
};

type Layer = "core" | "shell" | "daemon" | "cli" | "installer" | "version" | "ui" | "other";

const layerOf = (path: string): Layer => {
  if (path.startsWith("src/core/")) return "core";
  if (path.startsWith("src/shell/")) return "shell";
  if (path.startsWith("src/daemon/")) return "daemon";
  if (path === "src/cli.ts") return "cli";
  if (path === "src/installer.ts") return "installer";
  if (path === "src/version.ts") return "version";
  if (path.startsWith("ui/src/")) return "ui";
  return "other";
};

const resolvedRepositoryImport = (
  sourcePath: string,
  specifier: string,
): string | null => {
  if (!specifier.startsWith(".")) return null;
  return repositoryPath(resolve(repositoryRoot, dirname(sourcePath), specifier));
};

// This campaign sensor distinguishes reviewed specification evidence from candidate
// conformance. An allowed path is not authorization: the caller must resolve and
// verify the exact existing operator provenance and baseline before supplying it.
const campaignInputDifferences = (
  reviewed: ReadonlyMap<string, string>,
  candidate: ReadonlyMap<string, string>,
  authorizedPaths: ReadonlySet<string>,
): readonly string[] =>
  [...new Set([...reviewed.keys(), ...candidate.keys()])]
    .sort()
    .filter((path) => reviewed.get(path) !== candidate.get(path) && !authorizedPaths.has(path));

const parseCampaignInputSnapshot = (bytes: string): ReadonlyMap<string, string> => {
  const entries = new Map<string, string>();
  let previous: string | undefined;
  if (!bytes.endsWith("\n")) throw new Error("snapshot requires final LF");
  for (const line of bytes.slice(0, -1).split("\n")) {
    const match = line.match(/^(100644|100755|120000)\t([0-9a-f]{40})\t([^\t\r\n]+)$/);
    if (!match?.[1] || !match[2] || !match[3]) throw new Error("malformed snapshot entry");
    const [, mode, sha, path] = match;
    if (previous !== undefined && previous >= path) throw new Error("snapshot paths must be sorted and unique");
    entries.set(path, mode + "\t" + sha);
    previous = path;
  }
  return entries;
};

const campaignSnapshotBytes = (entries: ReadonlyMap<string, string>): string =>
  [...entries.entries()]
    .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
    .map(([path, identity]) => identity + "\t" + path + "\n")
    .join("");

const verifyCampaignReviewedInputs = (
  root: string,
  campaignPlanPath: string,
  inputBlob: string,
  allGatesPass: boolean,
): void => {
  const hashBlob = (bytes: Buffer): string =>
    createHash("sha1").update("blob " + bytes.length + "\0").update(bytes).digest("hex");
  const readText = (path: string): string => readFileSync(join(root, path), "utf8");
  const fileBlob = (path: string): string => hashBlob(readFileSync(join(root, path)));
  const source = readText(campaignPlanPath);
  const reuseSection = source.match(/#### Current delta reuse binding\r?\n([\s\S]*?)(?=\r?\n## 9\.)/)?.[1] ?? "";
  const gateSection = source.match(/## 18\. Phase\/gate status register\r?\n([\s\S]*?)(?=\r?\n## 19\.)/)?.[1] ?? "";
  // The frozen rows are the existing reviewed-input evidence, not a new
  // authority or a candidate snapshot to refresh after implementation.
  const campaignDirectory = dirname(campaignPlanPath);
  const readinessPath = join(campaignDirectory, "readiness-review.md").replaceAll("\\", "/");
  const excluded = new Set([campaignPlanPath, "CHANGELOG.md", readinessPath]);
  const frozenText = reuseSection.match(/\*\*Frozen reviewed input rows:\*\*\r?\n\r?\n~~~reviewed-inputs\r?\n([\s\S]*?)~~~(?:\r?\n|$)/)?.[1];
  if (!frozenText || hashBlob(Buffer.from(frozenText, "utf8")) !== inputBlob) {
    throw new Error("frozen reviewed input rows must match the exact reviewed digest");
  }
  const frozen = parseCampaignInputSnapshot(frozenText);
  if ([...excluded].some((path) => frozen.has(path))) throw new Error("invalid reviewed input exclusions");
  const git = (args: readonly string[]): string =>
    execFileSync("git", [...args], {
      cwd: root, encoding: "utf8", maxBuffer: 8 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"],
    });
  const readCommitInputs = (commit: string): ReadonlyMap<string, string> => {
    const entries = new Map<string, string>();
    for (const entry of git(["ls-tree", "-r", "-z", commit]).split("\0").filter(Boolean)) {
      const match = entry.match(/^(100644|100755|120000) blob ([0-9a-f]{40})\t([^\t\r\n]+)$/);
      if (!match?.[1] || !match[2] || !match[3]) throw new Error("unsupported tracked baseline entry");
      const [, mode, sha, path] = match;
      if (!excluded.has(path)) entries.set(path, mode + "\t" + sha);
    }
    return entries;
  };
  const readLiveInputs = (): ReadonlyMap<string, string> => {
    const entries = new Map<string, string>();
    for (const entry of git(["ls-files", "--stage", "-z"]).split("\0").filter(Boolean)) {
      const match = entry.match(/^(100644|100755|120000) [0-9a-f]{40} 0\t([^\t\r\n]+)$/);
      if (!match?.[1] || !match[2]) throw new Error("unmerged or unsupported tracked input");
      const [, mode, path] = match;
      if (excluded.has(path)) continue;
      const bytes = mode === "120000"
        ? Buffer.from(readlinkSync(join(root, path)), "utf8")
        : readFileSync(join(root, path));
      // Also reject unstaged executable-bit drift, not merely index modes.
      if (mode !== "120000") {
        const actualMode = (statSync(join(root, path)).mode & 0o111) !== 0 ? "100755" : "100644";
        entries.set(path, actualMode + "\t" + hashBlob(bytes));
      } else {
        entries.set(path, mode + "\t" + hashBlob(bytes));
      }
    }
    return entries;
  };
  const boundedSection = source.match(/## 17A\. Bounded pre-sign-off realization authorization\r?\n([\s\S]*?)(?=\r?\n## 18\.)/)?.[1] ?? "";
  const normalLine = gateSection.match(/^\*\*Current normal authorization: (NONE|T1 only)\.\*\*$/m)?.[1];
  const boundedLine = boundedSection.match(/^\*\*Current bounded authorization: (NONE|IA27\/IA28 only)\.\*\*$/m)?.[1];
  if (!normalLine || !boundedLine ||
    (gateSection.match(/^\*\*Current normal authorization:/gm) ?? []).length !== 1 ||
    (boundedSection.match(/^\*\*Current bounded authorization:/gm) ?? []).length !== 1) {
    throw new Error("missing, duplicated or malformed current campaign authorization");
  }
  const normal = normalLine === "T1 only";
  const bounded = boundedLine === "IA27/IA28 only";
  if (normal && bounded) throw new Error("normal and bounded authorization cannot coexist");
  const normalDetails = /^\*\*Authorized (?:baseline commit|R3 blob|operator decision):/gm;
  const boundedDetails = /^\*\*Authorized (?:baseline commit|R3 blob|operator decision|bounded paths):/gm;
  if ((!normal && normalDetails.test(gateSection)) || (!bounded && boundedDetails.test(boundedSection))) {
    throw new Error("inactive authorization must not carry active authorization details");
  }

  if (!normal && !bounded) {
    const actualInputs = hashBlob(Buffer.from(campaignSnapshotBytes(readLiveInputs()), "utf8"));
    if (actualInputs !== inputBlob) {
      throw new Error("delta reuse exact reviewed inputs changed: expected " + actualInputs);
    }
  } else {
    if (!allGatesPass) {
      throw new Error("authorized candidate requires all specification gates PASS");
    }
    const section = normal ? gateSection : boundedSection;
    const exactField = (name: string, pattern: string): string => {
      const values = [...section.matchAll(new RegExp("^\\*\\*Authorized " + name + ":\\*\\* " + pattern + "$", "gm"))];
      const value = values[0]?.[1];
      if (values.length !== 1 || !value) throw new Error("missing/duplicate authorized " + name);
      return value;
    };
    const baselineCommit = exactField("baseline commit", "\x60([0-9a-f]{40})\x60");
    const r3Blob = exactField("R3 blob", "\x60([0-9a-f]{40})\x60");
    // The human decision itself is independently checked in PR evidence.
    // This is a provenance reference, never proof of a human's identity.
    exactField("operator decision", "(https://github\\.com/pontivus-com/order/pull/83#(?:issuecomment|pullrequestreview)-[0-9]+)");
    if (fileBlob(readinessPath) !== r3Blob) throw new Error("authorized R3 bytes changed");
    const planText = readText(join(campaignDirectory, "implementation-plan.md"));
    const blocks = [...planText.matchAll(/\x60\x60\x60order-tasks\r?\n([\s\S]*?)\r?\n\x60\x60\x60/g)];
    if (blocks.length !== 1 || !blocks[0]?.[1]) throw new Error("expected one exact signed task block");
    const parsed = JSON.parse(blocks[0][1]) as { tasks?: readonly { id?: string; scope?: readonly string[]; exclusions?: readonly string[] }[] };
    const task = parsed.tasks?.[0];
    if (parsed.tasks?.length !== 1 || task?.id !== "T1" || !Array.isArray(task.scope) || !Array.isArray(task.exclusions)) {
      throw new Error("unresolved exact T1 scope/exclusions");
    }
    const scope = new Set(task.scope);
    const exclusions = new Set(task.exclusions);
    if (scope.size !== 62 || exclusions.size !== 58 || task.scope.length !== scope.size || task.exclusions.length !== exclusions.size || [...scope].some((path) => exclusions.has(path))) {
      throw new Error("invalid exact T1 scope/exclusions");
    }
    const allowed = normal ? scope : new Set(exactField("bounded paths", "([^\\r\\n]+)").split(", "));
    if (allowed.size === 0 || [...allowed].some((path) => !scope.has(path) || exclusions.has(path))) {
      throw new Error("authorization exceeds exact T1 scope");
    }
    // The existing bounded-authorization owner declares the maximum
    // IA27/IA28 surface; the actual grant may only narrow it.
    if (bounded) {
      const maxima = [...boundedSection.matchAll(/^\*\*Bounded IA27\/IA28 maximum mutable paths:\*\* ([^\r\n]+)$/gm)];
      if (maxima.length !== 1 || !maxima[0]?.[1]) throw new Error("missing exact bounded maximum");
      const boundedOwners = new Set(maxima[0][1].split(", "));
      if ([...allowed].some((path) => !boundedOwners.has(path)) ||
          [...boundedOwners].some((path) => !scope.has(path) || exclusions.has(path))) {
        throw new Error("bounded authorization exceeds IA27/IA28 mutable owners");
      }
    }
    const stripAuthorization = (text: string): string =>
      text.replace(/^\*\*Current normal authorization: T1 only\.\*\*$/m, "**Current normal authorization: NONE.**")
        .replace(/^\*\*Current bounded authorization: IA27\/IA28 only\.\*\*$/m, "**Current bounded authorization: NONE.**")
        .replace(/^\*\*Authorized (?:baseline commit|R3 blob|operator decision|bounded paths):\*\* [^\r\n]+\r?\n/gm, "");
    const proveCandidate = (entries: ReadonlyMap<string, string>, candidateCommit?: string): void => {
      const drift = campaignInputDifferences(frozen, entries, allowed);
      if (drift.length !== 0) throw new Error("authorized candidate changed out-of-scope inputs: " + drift.join(", "));
      const changelogSha = candidateCommit === undefined
        ? fileBlob("CHANGELOG.md")
        : git(["rev-parse", candidateCommit + ":CHANGELOG.md"]).trim();
      // CHANGELOG is an existing reviewed-input exclusion, but is a
      // signed mutation owner; bounded work must explicitly include it.
      if (!allowed.has("CHANGELOG.md")) {
        if (changelogSha !== git(["rev-parse", baselineCommit + ":CHANGELOG.md"]).trim()) {
          throw new Error("authorization does not include changelog mutation");
        }
      }
    };

    // Before squash delivery the exact reviewed commit is a real ancestor.
    // After squash, the original branch SHA need not survive in master.
    // Only actual integrated PR #83 ancestry with identical control/R3
    // bytes establishes historical campaign evidence.
    let integratedCommit: string | undefined;
    if (normal) {
      for (const masterRef of ["refs/remotes/origin/master"]) {
        try {
          const masterCampaign = git(["show", masterRef + ":" + campaignPlanPath]);
          if (masterCampaign !== source) continue;
          const commit = git(["log", "-1", "--first-parent", "--format=%H", masterRef, "--", campaignPlanPath]).trim();
          if (!/^[0-9a-f]{40}$/.test(commit)) continue;
          const subject = git(["show", "-s", "--format=%s", commit]).trim();
          if (!/(?:^|[^0-9])#83(?:[^0-9]|$)/.test(subject)) continue;
          git(["merge-base", "--is-ancestor", commit, "HEAD"]);
          if (git(["show", commit + ":" + campaignPlanPath]) !== source ||
              git(["rev-parse", commit + ":" + readinessPath]).trim() !== r3Blob) continue;
          integratedCommit = commit;
          break;
        } catch {
          // A missing/nonmatching integration is not a bypass: the live
          // authorized-candidate proof below still has to succeed.
        }
      }
    }
    if (integratedCommit !== undefined) {
      proveCandidate(readCommitInputs(integratedCommit), integratedCommit);
    } else {
      git(["merge-base", "--is-ancestor", baselineCommit, "HEAD"]);
      if (hashBlob(Buffer.from(campaignSnapshotBytes(readCommitInputs(baselineCommit)), "utf8")) !== inputBlob) {
        throw new Error("authorized baseline tree does not match frozen review inputs");
      }
      if (git(["rev-parse", baselineCommit + ":" + readinessPath]).trim() !== r3Blob) {
        throw new Error("authorization does not bind reviewed R3");
      }
      const baselineCampaign = git(["show", baselineCommit + ":" + campaignPlanPath]);
      if (baselineCampaign !== stripAuthorization(source)) {
        throw new Error("candidate changed frozen campaign control or authorization baseline");
      }
      proveCandidate(readLiveInputs());
    }
  }
};

describe("architecture fitness", () => {
  it("keeps pyramid placement and semantic-lifecycle law at the canonical P0/P1 owner", () => {
    const governance = sourceText("docs/governance/systems-governance.md");

    expect(governance).toContain(
      "### Pyramid proposition placement, authority and derivation law",
    );
    expect(governance).toContain(
      "### Semantic lifecycle closure and noninterference",
    );

    const placement = governance.split(
      "### Pyramid proposition placement, authority and derivation law",
    )[1]?.split("## 3. P0 — Order governance kernel")[0] ?? "";
    for (const layer of ["P0", "P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8"]) {
      expect(placement).toMatch(new RegExp("\\*\\*" + layer + "\\*\\*"));
    }

    for (const ruleId of [
      "GW-P1-CANONICAL-OWNERSHIP",
      "GW-P1-EXPLICIT-FLOW",
      "GW-P1-DOC-CANONICALITY",
    ]) {
      expect(governance).toContain(ruleId);
    }

    expect(governance).toContain(
      "technical access to a field or type is not semantic authorization",
    );
    expect(governance).toContain(
      "changes to that fact must not alter the consumer's semantic result",
    );
    expect(governance).not.toMatch(
      /GW-P1-(?:SEMANTIC-LIFECYCLE|FUNCTIONAL-PYRAMID|NONINTERFERENCE)/,
    );
  });

  it("distinguishes exact campaign review inputs from bounded candidate differences", () => {
    const sha = "1".repeat(40);
    const changedSha = "2".repeat(40);
    const reviewed = parseCampaignInputSnapshot(
      "100644\t" + sha + "\ta.ts\n100644\t" + sha + "\tauthority.md\n100755\t" + sha + "\tverify.sh\n",
    );
    expect(campaignSnapshotBytes(reviewed)).toBe(
      "100644\t" + sha + "\ta.ts\n100644\t" + sha + "\tauthority.md\n100755\t" + sha + "\tverify.sh\n",
    );
    const candidate = new Map(reviewed);
    candidate.set("a.ts", "100644\t" + changedSha);
    expect(campaignInputDifferences(reviewed, candidate, new Set())).toEqual(["a.ts"]);
    expect(campaignInputDifferences(reviewed, candidate, new Set(["a.ts"]))).toEqual([]);
    candidate.set("authority.md", "100644\t" + changedSha);
    candidate.set("verify.sh", "100644\t" + sha);
    candidate.set("unexpected.ts", "100644\t" + sha);
    expect(campaignInputDifferences(reviewed, candidate, new Set(["a.ts"]))).toEqual([
      "authority.md", "unexpected.ts", "verify.sh",
    ]);
    candidate.delete("authority.md");
    expect(campaignInputDifferences(reviewed, candidate, new Set(["a.ts"]))).toContain("authority.md");
    expect(() => parseCampaignInputSnapshot("100644\t" + sha + "\ta.ts\n100644\t" + sha + "\ta.ts\n")).toThrow();
    expect(() => parseCampaignInputSnapshot("100644\t" + sha + "\ta.ts")).toThrow();
  });


  it("proves the frozen-input sensor across synthetic authorized Git candidates and squash delivery", () => {
    // Local disposable Git evidence only. This fixture neither authorizes the
    // repository campaign nor constructs a native Approval/RunEvent.
    const root = mkdtempSync(join(tmpdir(), "order-campaign-fitness-"));
    const git = (...args: readonly string[]): string =>
      execFileSync("git", [...args], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
    const write = (path: string, content: string): void => writeFileSync(join(root, path), content);
    const blob = (content: string): string =>
      createHash("sha1").update("blob " + Buffer.byteLength(content) + "\0").update(content).digest("hex");
    const campaignPath = "item/campaign.md";
    const planPath = "item/implementation-plan.md";
    const readinessPath = "item/readiness-review.md";
    const ready = "synthetic readiness bytes\n";
    const normalNone = "**Current normal authorization: NONE.**";
    const boundedNone = "**Current bounded authorization: NONE.**";
    const fixtureDecision = "https://github.com/pontivus-com/order/pull/83#issuecomment-1";
    try {
      git("init", "--initial-branch=master");
      git("config", "user.name", "Order test fixture");
      git("config", "user.email", "order-test@example.invalid");
      git("config", "commit.gpgsign", "false");
      mkdirSync(join(root, "item"));
      const plan = "\x60\x60\x60order-tasks\n" + JSON.stringify({ tasks: [{
        id: "T1",
        scope: ["a.ts", "CHANGELOG.md", ...Array.from({ length: 60 }, (_, i) => "scope-" + i)],
        exclusions: ["protected.md", ...Array.from({ length: 57 }, (_, i) => "excluded-" + i)],
      }] }) + "\n\x60\x60\x60\n";
      const baselineInputs = new Map([
        ["a.ts", "100644\t" + blob("old\n")],
        ["protected.md", "100644\t" + blob("protected\n")],
        [planPath, "100644\t" + blob(plan)],
      ]);
      const frozen = campaignSnapshotBytes(baselineInputs);
      const digest = blob(frozen);
      const campaign = [
        "#### Current delta reuse binding", "", "**Frozen reviewed input rows:**", "",
        "~~~reviewed-inputs", frozen.slice(0, -1), "~~~", "", "## 9. Finding",
        "", "## 17A. Bounded pre-sign-off realization authorization", "", boundedNone,
        "", "**Bounded IA27/IA28 maximum mutable paths:** a.ts", "",
        "## 18. Phase/gate status register", "", normalNone, "", "## 19. Completion", "",
      ].join("\n");
      write("a.ts", "old\n");
      write("protected.md", "protected\n");
      write("CHANGELOG.md", "old changelog\n");
      write(planPath, plan);
      write(readinessPath, ready);
      write(campaignPath, campaign);
      git("add", ".");
      git("commit", "-m", "synthetic reviewed baseline");
      const baseline = git("rev-parse", "HEAD");
      const check = (gates = true): void => verifyCampaignReviewedInputs(root, campaignPath, digest, gates);
      expect(() => check()).not.toThrow();
      write("a.ts", "authorized content\n");
      expect(() => check()).toThrow("delta reuse exact reviewed inputs changed");
      write("a.ts", "old\n");
      const provenance = "\n**Authorized baseline commit:** \x60" + baseline +
        "\x60\n**Authorized R3 blob:** \x60" + blob(ready) +
        "\x60\n**Authorized operator decision:** " + fixtureDecision;
      const signed = campaign.replace(normalNone, "**Current normal authorization: T1 only.**" + provenance);
      write(campaignPath, signed);
      expect(() => check(false)).toThrow("all specification gates PASS");
      git("add", campaignPath);
      git("commit", "-m", "synthetic authorization provenance");
      write("a.ts", "authorized content\n");
      expect(() => check()).not.toThrow();
      write("CHANGELOG.md", "final changelog\n");
      expect(() => check()).not.toThrow();
      write("protected.md", "unauthorized\n");
      expect(() => check()).toThrow("out-of-scope inputs: protected.md");
      write("protected.md", "protected\n");
      write(readinessPath, "stale R3\n");
      expect(() => check()).toThrow("authorized R3 bytes changed");
      write(readinessPath, ready);
      write(campaignPath, signed + "changed control\n");
      expect(() => check()).toThrow("candidate changed frozen campaign control");
      write(campaignPath, signed);
      write(campaignPath, signed.replace(baseline, "0".repeat(40)));
      expect(() => check()).toThrow();
      write(campaignPath, signed);
      git("add", ".");
      git("commit", "-m", "synthetic authorized candidate");

      // Bounded authorization is distinct and does not permit changelog or
      // another T1 path unless that exact path is granted within its maximum.
      git("checkout", "-b", "bounded-fixture", baseline);
      const bounded = campaign.replace(boundedNone,
        "**Current bounded authorization: IA27/IA28 only.**" + provenance + "\n**Authorized bounded paths:** a.ts");
      write(campaignPath, bounded);
      write("a.ts", "bounded evidence\n");
      expect(() => check()).not.toThrow();
      write("CHANGELOG.md", "ungranted changelog\n");
      expect(() => check()).toThrow("authorization does not include changelog mutation");
      write("CHANGELOG.md", "old changelog\n");
      write(campaignPath, bounded.replace("**Authorized bounded paths:** a.ts", "**Authorized bounded paths:** scope-0"));
      expect(() => check()).toThrow("bounded authorization exceeds");
      write(campaignPath, bounded.replace(normalNone, "**Current normal authorization: T1 only.**"));
      expect(() => check()).toThrow("cannot coexist");

      // Squash integration has no ancestry relation to the reviewed branch
      // baseline. The fetched default-branch reference supplies the integrated
      // tree, whose exact control and scope are checked independently.
      git("checkout", "--force", "master");
      git("checkout", "--orphan", "integrated-fixture");
      git("add", ".");
      git("commit", "-m", "synthetic squash integration (#83)");
      git("update-ref", "refs/remotes/origin/master", git("rev-parse", "HEAD"));
      expect(() => git("merge-base", "--is-ancestor", baseline, "HEAD")).toThrow();
      expect(() => check()).not.toThrow();
      write("protected.md", "later maintenance bytes\n");
      expect(() => check()).not.toThrow();
      write(campaignPath, signed + "drifted historical control\n");
      expect(() => check()).toThrow();
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("enforces the P4 dependency direction and explicit CLI shell exceptions", () => {
    const violations: string[] = [];

    for (const sourcePath of productionFiles) {
      const sourceLayer = layerOf(sourcePath);
      for (const specifier of importSpecifiers(sourceText(sourcePath))) {
        const targetPath = resolvedRepositoryImport(sourcePath, specifier);
        if (targetPath === null) {
          if (specifier.startsWith("@astryxdesign/") && sourceLayer !== "ui") {
            violations.push(sourcePath + " imports Astryx outside the UI boundary: " + specifier);
          }
          if (
            sourceLayer === "ui" &&
            (
              specifier === "@stylexjs/stylex" ||
              specifier.startsWith("@astryxdesign/build") ||
              specifier.startsWith("@astryxdesign/cli") ||
              specifier.includes("RichTextEditor") ||
              specifier.includes("Lexical")
            )
          ) {
            violations.push(sourcePath + " imports prohibited UI implementation dependency: " + specifier);
          }
          continue;
        }
        const targetLayer = layerOf(targetPath);

        if (
          targetLayer === "version" &&
          sourceLayer !== "version" &&
          sourceLayer !== "cli" &&
          sourceLayer !== "daemon"
        ) {
          violations.push(`${sourcePath} -> ${targetPath}: package version may be consumed only by CLI/daemon`);
        }
        if (sourceLayer === "version" && targetLayer !== "other") {
          violations.push(`${sourcePath} -> ${targetPath}: version owner may depend only on package metadata`);
        }

        if (sourceLayer === "core" && targetLayer !== "core" && targetLayer !== "other") {
          violations.push(`${sourcePath} -> ${targetPath}: core may not depend on ${targetLayer}`);
        }
        if (sourceLayer === "shell" && ["daemon", "cli", "ui"].includes(targetLayer)) {
          violations.push(`${sourcePath} -> ${targetPath}: shell may not depend on ${targetLayer}`);
        }
        if (sourceLayer === "daemon" && ["cli", "ui"].includes(targetLayer)) {
          violations.push(`${sourcePath} -> ${targetPath}: daemon may not depend on ${targetLayer}`);
        }
        if (sourceLayer === "ui") {
          if (["shell", "daemon", "cli"].includes(targetLayer)) {
            violations.push(`${sourcePath} -> ${targetPath}: UI may not depend on ${targetLayer}`);
          }
          const exactPlanParserImport =
            sourcePath === "ui/src/DocumentWorkspace.tsx" &&
            targetPath === "src/core/execution.ts" &&
            specifier === "../../src/core/execution.ts" &&
            importSpecifiers(sourceText(sourcePath)).filter(candidate =>
              resolvedRepositoryImport(sourcePath, candidate) === targetPath).length === 1 &&
            /^import\s+\{\s*admitSignedTaskBlockForSchema\s*,\s*parseSignedTaskBlockFromPlan\s*\}\s+from\s+"\.\.\/\.\.\/src\/core\/execution\.ts";$/m.test(sourceText(sourcePath));
          if (
            targetLayer === "core" &&
            !["src/core/contracts.ts", "src/core/lifecycle.ts"].includes(targetPath) &&
            !exactPlanParserImport
          ) {
            violations.push(
              `${sourcePath} -> ${targetPath}: UI may import only browser-safe canonical contracts or lifecycle policy from core`,
            );
          }
        }
        if (sourceLayer === "cli" && targetLayer === "shell") {
          if (!["src/shell/runtime.ts", "src/shell/opencode.ts", "src/shell/setup.ts"].includes(targetPath)) {
            violations.push(`${sourcePath} -> ${targetPath}: CLI shell dependency is not an authorized bootstrap/setup boundary`);
          }
        }
        if (sourceLayer === "cli" && ["core", "ui"].includes(targetLayer)) {
          violations.push(`${sourcePath} -> ${targetPath}: CLI may not depend directly on ${targetLayer}`);
        }
        if (
          sourceLayer === "installer" &&
          targetLayer === "shell" &&
          ![
            "src/shell/setup.ts",
            "src/shell/runtime.ts",
            "src/shell/sqlite.ts",
          ].includes(targetPath)
        ) {
          violations.push(
            `${sourcePath} -> ${targetPath}: installer shell dependency is not an authorized setup/update boundary`,
          );
        }
        if (sourceLayer === "installer" && ["core", "daemon", "cli", "ui"].includes(targetLayer)) {
          violations.push(`${sourcePath} -> ${targetPath}: installer may not depend directly on ${targetLayer}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("keeps the functional core free of effectful external dependencies", () => {
    const violations: string[] = [];
    for (const sourcePath of productionFiles.filter((path) => layerOf(path) === "core")) {
      for (const specifier of importSpecifiers(sourceText(sourcePath))) {
        if (specifier.startsWith(".")) continue;
        if (sourcePath === "src/core/contracts.ts" && specifier === "zod") continue;
        violations.push(`${sourcePath} imports effect/external dependency ${specifier}`);
      }
    }
    expect(violations).toEqual([]);
  });

  it("keeps concrete effect mechanics at their canonical owners", () => {
    const rules: readonly Readonly<{
      label: string;
      pattern: RegExp;
      owners: readonly string[];
    }>[] = [
      { label: "SQLite query", pattern: /\.query\s*\(/g, owners: ["src/shell/sqlite.ts"] },
      { label: "SQLite construction", pattern: /\bnew\s+Database\s*\(/g, owners: ["src/shell/sqlite.ts"] },
      { label: "process spawn", pattern: /\bBun\.spawn(?:Sync)?\s*\(/g, owners: ["src/shell/process.ts", "src/installer.ts"] },
      { label: "HTTP server", pattern: /\bBun\.serve\s*\(/g, owners: ["src/daemon/server.ts"] },
      { label: "TOML parse", pattern: /\bBun\.TOML\.parse\s*\(/g, owners: ["src/shell/project.ts"] },
    ];
    const violations: string[] = [];

    for (const sourcePath of productionFiles) {
      const source = sourceText(sourcePath);
      for (const rule of rules) {
        if (rule.pattern.test(source) && !rule.owners.includes(sourcePath)) {
          violations.push(`${rule.label} appears outside canonical owner: ${sourcePath}`);
        }
        rule.pattern.lastIndex = 0;
      }
    }

    expect(violations).toEqual([]);
  });

  it("prevents OOP/DTO/service architecture and unchecked strict-typing escape hatches", () => {
    const forbiddenSegments = [
      "/services/",
      "/repositories/",
      "/controllers/",
      "/interfaces/",
      "/providers/",
      "/adapters/",
      "/dto/",
      "/models/",
    ];
    const violations: string[] = [];

    for (const sourcePath of productionFiles) {
      const normalized = `/${sourcePath.toLowerCase()}`;
      for (const segment of forbiddenSegments) {
        if (normalized.includes(segment)) {
          violations.push(`forbidden architectural directory in ${sourcePath}: ${segment}`);
        }
      }

      const source = sourceText(sourcePath);
      if (/^\s*(?:export\s+)?(?:default\s+)?class\s+/m.test(source)) {
        violations.push(`Order-owned class declaration in ${sourcePath}`);
      }
      if (/\bas\s+unknown\s+as\b/.test(source)) {
        violations.push(`double assertion in ${sourcePath}`);
      }
      if (/\bas\s+any\b/.test(source)) {
        violations.push(`as any escape hatch in ${sourcePath}`);
      }
    }

    expect(violations).toEqual([]);
  });

  it("certifies the 0.2.2 productive-provider ownership and Workbench structural boundaries", () => {
    const contracts = sourceText("src/core/contracts.ts");
    const repository = sourceText("src/shell/repository.ts");
    const openCode = sourceText("src/shell/opencode.ts");
    const stage = sourceText("src/daemon/stage.ts");
    const execution = sourceText("src/daemon/execution.ts");
    const queue = sourceText("ui/src/WorkItemQueue.tsx");
    const documents = sourceText("ui/src/DocumentWorkspace.tsx");
    const activity = sourceText("ui/src/ActivityWorkspace.tsx");
    const settings = sourceText("ui/src/SettingsWorkspace.tsx");

    expect(stage).toContain("materializeStageInspectionWorkspace");
    expect(stage).toContain("admitProductiveOpenCode");
    expect(stage).not.toContain("startOpenCodeServer");
    expect(stage).not.toContain("createOpenCodeSession");
    expect(execution).toContain("admitProductiveOpenCode");
    expect(execution).not.toContain("startOpenCodeServer");
    expect(execution).not.toContain("createOpenCodeSession");

    expect(openCode).toContain("export const admitProductiveOpenCode");
    expect(openCode.match(/client\.session\.create\s*\(/g) ?? []).toHaveLength(1);
    expect(openCode).toContain("client.skill.list");
    expect(openCode).toContain("client.mcp.list");
    expect(openCode).toContain('resource: ".git"');
    expect(openCode).toContain('resource: ".git/*"');
    expect(openCode).not.toContain("session.instruction");
    expect(openCode).not.toContain("instruction.create");

    const stageMaterializer = repository.slice(
      repository.indexOf("export const materializeStageInspectionWorkspace"),
      repository.indexOf("export const replayAndVerifyCandidate"),
    );
    expect(stageMaterializer).toContain("captureCandidate");
    expect(stageMaterializer).toContain("createFreshCheckout");
    expect(stageMaterializer).toContain('"apply", "--binary", "-"');
    expect(stageMaterializer).not.toContain(".gitignore");
    for (const forbidden of ["node_modules", ".venv", "vendor/", "target/", "dist/"]) {
      expect(stageMaterializer).not.toContain(forbidden);
    }

    const configSchema = contracts.slice(
      contracts.indexOf("export const OrderConfigSchema"),
      contracts.indexOf("export type OrderConfig"),
    );
    expect(configSchema).not.toMatch(/\bskills?\b/i);
    expect(configSchema).not.toMatch(/\bmcp\b/i);

    expect(settings).not.toContain("Connect target repository");
    expect(settings).toContain('label="Add repository"');
    expect(settings).toContain('title="Disconnect repository?"');
    expect(settings).not.toMatch(/onClick=\{\(\) => disconnect\.mutate/);

    expect(queue).toContain("workflowPresentation(item.stage).label");
    expect(queue).not.toContain("{item.stage}</");
    expect(documents).toContain("lifecycleArtifactLabel(selectedArtifact.role)");
    expect(documents).not.toContain("label={artifact.role}");
    expect(documents).not.toContain("@astryxdesign/core/TabList");
    expect(activity).toContain('data-testid="selected-run-header"');
    expect(activity).not.toContain('data-testid="activity-summary"');
  });

  it("keeps Zod canonical semantic ownership in core/contracts.ts", () => {
    const violations = productionFiles
      .filter((path) => path !== "src/core/contracts.ts")
      .filter((path) => importSpecifiers(sourceText(path)).includes("zod"))
      .map((path) => `non-canonical Zod owner: ${path}`);
    expect(violations).toEqual([]);
  });

  it("enforces the canonical core and daemon module ownership/dependency graph", () => {
    const files = new Set(productionFiles);
    const violations: string[] = [];

    const coreAllowed: Readonly<Record<string, readonly string[]>> = {
      "src/core/contracts.ts": [],
      "src/core/canonical.ts": ["src/core/contracts.ts"],
      "src/core/governance.ts": [
        "src/core/contracts.ts",
        "src/core/canonical.ts",
      ],
      "src/core/lifecycle.ts": ["src/core/contracts.ts"],
      "src/core/work-item-source.ts": ["src/core/contracts.ts"],
      "src/core/execution.ts": ["src/core/contracts.ts"],
    };

    const daemonAllowed: Readonly<Record<string, readonly string[]>> = {
      "src/daemon/runtime.ts": [],
      "src/daemon/run.ts": ["src/daemon/runtime.ts"],
      "src/daemon/authority.ts": [
        "src/daemon/runtime.ts",
        "src/daemon/run.ts",
        "src/daemon/work-item-source.ts",
      ],
      "src/daemon/stage.ts": [
        "src/daemon/runtime.ts",
        "src/daemon/run.ts",
        "src/daemon/authority.ts",
      ],
      "src/daemon/validation.ts": [
        "src/daemon/runtime.ts",
        "src/daemon/run.ts",
        "src/daemon/authority.ts",
      ],
      "src/daemon/execution.ts": [
        "src/daemon/runtime.ts",
        "src/daemon/run.ts",
        "src/daemon/authority.ts",
        "src/daemon/validation.ts",
      ],
      "src/daemon/coordinator.ts": [
        "src/daemon/runtime.ts",
        "src/daemon/run.ts",
        "src/daemon/authority.ts",
        "src/daemon/stage.ts",
        "src/daemon/validation.ts",
        "src/daemon/execution.ts",
        "src/daemon/work-item-source.ts",
        "src/daemon/work-item-documentation.ts",
      ],
      "src/daemon/work-item-documentation.ts": [
        "src/daemon/runtime.ts",
        "src/daemon/authority.ts",
      ],
      "src/daemon/work-item-source.ts": [
        "src/daemon/runtime.ts",
      ],
      "src/daemon/opencode-account.ts": [
        "src/daemon/runtime.ts",
      ],
      "src/daemon/settings.ts": [
        "src/daemon/runtime.ts",
        "src/daemon/coordinator.ts",
        "src/daemon/opencode-account.ts",
      ],
      "src/daemon/server.ts": [
        "src/daemon/runtime.ts",
        "src/daemon/coordinator.ts",
        "src/daemon/opencode-account.ts",
        "src/daemon/settings.ts",
      ],
    };

    for (const sourcePath of productionFiles.filter((path) => layerOf(path) === "core")) {
      const allowedTargets = coreAllowed[sourcePath];
      if (allowedTargets === undefined) {
        violations.push(
          `${sourcePath}: core module is not registered in the canonical dependency map`,
        );
        continue;
      }
      for (const specifier of importSpecifiers(sourceText(sourcePath))) {
        const targetPath = resolvedRepositoryImport(sourcePath, specifier);
        if (
          targetPath !== null &&
          targetPath.startsWith("src/core/") &&
          !allowedTargets.includes(targetPath)
        ) {
          violations.push(
            `${sourcePath} -> ${targetPath}: core dependency is not authorized`,
          );
        }
      }
    }

    for (const sourcePath of Object.keys(coreAllowed)) {
      if (!files.has(sourcePath)) {
        violations.push(`${sourcePath}: required canonical core owner is missing`);
      }
    }
    if (files.has("src/core/policy.ts")) {
      violations.push("src/core/policy.ts must remain absent");
    }

    for (const sourcePath of productionFiles.filter((path) => layerOf(path) === "daemon")) {
      const allowedTargets = daemonAllowed[sourcePath];
      if (allowedTargets === undefined) {
        violations.push(
          `${sourcePath}: daemon module is not registered in the canonical dependency map`,
        );
        continue;
      }
      for (const specifier of importSpecifiers(sourceText(sourcePath))) {
        const targetPath = resolvedRepositoryImport(sourcePath, specifier);
        if (
          targetPath !== null &&
          targetPath.startsWith("src/daemon/") &&
          !allowedTargets.includes(targetPath)
        ) {
          violations.push(
            `${sourcePath} -> ${targetPath}: daemon dependency is not authorized`,
          );
        }
      }
    }

    for (const sourcePath of Object.keys(daemonAllowed)) {
      if (!files.has(sourcePath)) {
        violations.push(`${sourcePath}: required canonical daemon owner is missing`);
      }
    }

    if (files.has("src/daemon/coordinator.ts")) {
      const coordinator = sourceText("src/daemon/coordinator.ts");
      for (const movedOwner of [
        "startStageRun",
        "computeSignoffPackage",
        "runRequiredGates",
        "executeReviewerRun",
        "executeMutatingRun",
        "appendRunEvent",
      ]) {
        const declaration = new RegExp(`^(?:export\\s+)?const\\s+${movedOwner}\\s*=`, "m");
        if (declaration.test(coordinator)) {
          violations.push(
            `src/daemon/coordinator.ts must not reclaim moved responsibility ${movedOwner}`,
          );
        }
      }
      if (/^const\s+byteEqual\s*=/m.test(coordinator)) {
        violations.push("src/daemon/coordinator.ts duplicates the runtime byteEqual owner");
      }
    }

    if (!files.has("src/installer.ts")) {
      violations.push("src/installer.ts: required productive installer owner is missing");
    }

    if (!files.has("src/shell/setup.ts")) {
      violations.push("src/shell/setup.ts: required guided setup shell owner is missing");
    }

    if (!files.has("src/shell/config.ts")) {
      violations.push("src/shell/config.ts: required productive configuration shell owner is missing");
    } else {
      for (const specifier of importSpecifiers(sourceText("src/shell/config.ts"))) {
        const targetPath = resolvedRepositoryImport("src/shell/config.ts", specifier);
        if (
          targetPath !== null &&
          targetPath.startsWith("src/shell/") &&
          targetPath !== "src/shell/runtime.ts"
        ) {
          violations.push(
            `src/shell/config.ts -> ${targetPath}: config shell may depend only on shell/runtime.ts within shell`,
          );
        }
      }
    }

    const fileWriteConsumers = productionFiles
      .filter((sourcePath) =>
        importSpecifiers(sourceText(sourcePath))
          .map((specifier) => resolvedRepositoryImport(sourcePath, specifier))
          .includes("src/shell/file-write.ts"),
      )
      .sort();
    expect(fileWriteConsumers).toEqual([
      "src/shell/repository.ts",
      "src/shell/work-item-source.ts",
    ]);

    const guardedWriter = sourceText("src/shell/file-write.ts");
    for (const requiredMechanic of [
      "O_EXCL",
      "O_NOFOLLOW",
      "fsyncSync",
      "renameSync",
      "replaceRegularFileExpectedHash",
      "createRegularFileExclusive",
    ]) {
      if (!guardedWriter.includes(requiredMechanic)) {
        violations.push(
          `src/shell/file-write.ts must retain guarded writer mechanic ${requiredMechanic}`,
        );
      }
    }
    const sourceFilesystem = sourceText("src/shell/work-item-source.ts");
    for (const forbiddenMechanic of ["fsyncSync", "renameSync", "O_EXCL", "O_NOFOLLOW"]) {
      if (sourceFilesystem.includes(forbiddenMechanic)) {
        violations.push(
          `src/shell/work-item-source.ts duplicates guarded writer mechanic ${forbiddenMechanic}`,
        );
      }
    }
    const repositoryShell = sourceText("src/shell/repository.ts");
    if (!repositoryShell.includes("replaceRegularFileExpectedHash")) {
      violations.push(
        "src/shell/repository.ts must route direct Markdown replacement through file-write.ts",
      );
    }

    const requiredShellOwners: Readonly<Record<string, readonly string[]>> = {
      "src/shell/file-write.ts": ["src/shell/runtime.ts"],
      "src/shell/work-item-source.ts": [
        "src/shell/file-write.ts",
        "src/shell/runtime.ts",
      ],
      "src/shell/project-config.ts": [
        "src/shell/project.ts",
        "src/shell/repository.ts",
        "src/shell/runtime.ts",
      ],
    };
    for (const [sourcePath, allowedTargets] of Object.entries(requiredShellOwners)) {
      if (!files.has(sourcePath)) {
        violations.push(`${sourcePath}: required source-backed shell owner is missing`);
        continue;
      }
      for (const specifier of importSpecifiers(sourceText(sourcePath))) {
        const targetPath = resolvedRepositoryImport(sourcePath, specifier);
        if (
          targetPath !== null &&
          targetPath.startsWith("src/shell/") &&
          !allowedTargets.includes(targetPath)
        ) {
          violations.push(`${sourcePath} -> ${targetPath}: shell dependency is not authorized`);
        }
      }
    }

    if (files.has("src/core/governance.ts")) {
      const governanceCore = sourceText("src/core/governance.ts");
      if (!governanceCore.includes("export const evaluateStageConformance")) {
        violations.push(
          "src/core/governance.ts must own evaluateStageConformance",
        );
      }
    }

    if (files.has("src/daemon/stage.ts")) {
      const stage = sourceText("src/daemon/stage.ts");
      for (const requiredConformanceOwner of [
        "evaluateStageConformance",
        "validateStageDocumentStructure",
        "authorityDispositionOwnerRefs",
        "parseSignedTaskBlockFromPlan",
      ]) {
        if (!stage.includes(requiredConformanceOwner)) {
          violations.push(
            `src/daemon/stage.ts must enforce ${requiredConformanceOwner} before lifecycle promotion`,
          );
        }
      }
    }

    if (files.has("src/core/work-item-source.ts")) {
      const workItemSourceCore = sourceText("src/core/work-item-source.ts");
      for (const requiredOwner of [
        "isUnsupportedWorkItemSchemaFailure",
        "defaultSchemaForKind",
        "classifyExistingWorkItemSource",
        "linkedRemediationIsAllowed",
        "r1CompletionIsAllowedForSchema",
        "unresolvedConcernIdsForProject",
        "validateStageDocumentStructure",
      ]) {
        if (!workItemSourceCore.includes(`export const ${requiredOwner}`)) {
          violations.push(
            `src/core/work-item-source.ts must own ${requiredOwner}`,
          );
        }
      }
    }
    if (files.has("src/core/lifecycle.ts")) {
      const lifecycle = sourceText("src/core/lifecycle.ts");
      if (lifecycle.includes("work-item-source")) {
        violations.push(
          "src/core/lifecycle.ts must receive schema-resolved policy as typed input rather than importing source policy",
        );
      }
      for (const duplicatedKind of ["\"CHANGE\"", "\"DEFECT\"", "\"INVESTIGATION\"", "\"AUDIT\""]) {
        if (lifecycle.includes(duplicatedKind)) {
          violations.push(
            `src/core/lifecycle.ts duplicates schema kind policy ${duplicatedKind}`,
          );
        }
      }
    }
    if (files.has("src/daemon/work-item-source.ts")) {
      const sourceOrchestration = sourceText("src/daemon/work-item-source.ts");
      for (const forbiddenOwner of [
        "const canReclassify",
        "const allowedR1",
        "\"change-v1\"",
        "\"defect-v1\"",
        "\"investigation-v1\"",
        "\"audit-v1\"",
        "includes(\"concern\")",
        "startsWith(\"UNSUPPORTED_SCHEMA",
      ]) {
        if (sourceOrchestration.includes(forbiddenOwner)) {
          violations.push(
            `src/daemon/work-item-source.ts duplicates functional-core source policy: ${forbiddenOwner}`,
          );
        }
      }
    }

    const requiredUiOwners = [
      "ui/src/WorkItemWorkspace.tsx",
      "ui/src/PreSignoffStageWorkspace.tsx",
      "ui/src/ReadinessWorkspace.tsx",
      "ui/src/MarkdownEditor.tsx",
      "ui/src/MarkdownSourceEditor.tsx",
      "ui/src/markdown-source-formatting.ts",
      "ui/src/CreateWorkItem.tsx",
      "ui/src/WorkItemQueue.tsx",
      "ui/src/WorkItemContext.tsx",
      "ui/src/DocumentWorkspace.tsx",
      "ui/src/ActivityWorkspace.tsx",
      "ui/src/RunEventTimeline.tsx",
      "ui/src/SignoffReview.tsx",
      "ui/src/ExecutionWorkspace.tsx",
      "ui/src/EvidenceViewer.tsx",
      "ui/src/TerminalResult.tsx",
      "ui/src/workbench-presentation.ts",
      "ui/src/query-keys.ts",
    ] as const;

    for (const requiredAbsent of [
      "ui/src/WorkflowStepFrame.tsx",
      "ui/src/WorkflowMaterialSelector.tsx",
    ]) {
      if (productionFiles.includes(requiredAbsent)) {
        violations.push(requiredAbsent + " must remain required-absent");
      }
    }

    const workItemWorkspace = sourceText("ui/src/WorkItemWorkspace.tsx");
    for (const forbidden of ["WorkStageSchema.options.indexOf", "artifactIsDownstream"]) {
      if (workItemWorkspace.includes(forbidden)) {
        violations.push(
          "ui/src/WorkItemWorkspace.tsx must consume canonical lifecycle policy without re-ranking stages: " + forbidden,
        );
      }
    }

    const documentWorkspace = sourceText("ui/src/DocumentWorkspace.tsx");
    if (!documentWorkspace.includes("artifactDirectEditIsAllowed")) {
      violations.push(
        "ui/src/DocumentWorkspace.tsx must consume artifactDirectEditIsAllowed from the canonical lifecycle owner",
      );
    }

    const executionWorkspace = sourceText("ui/src/ExecutionWorkspace.tsx");
    for (const forbidden of ['"status" in value', 'as Run["status"]']) {
      if (executionWorkspace.includes(forbidden)) {
        violations.push(
          "ui/src/ExecutionWorkspace.tsx must consume canonical Run[] values without shape guessing: " + forbidden,
        );
      }
    }

    // Acceptance is a prospective authorized renderer in DESIGN, not part of the
    // pre-cutover runtime. Once either stage or renderer is materialized, require
    // both and the shell consumer together; partial cutover is an architecture defect.
    const acceptanceStageDeclared = /export const WorkStageSchema = z\.enum\(\[[\s\S]*?"AWAITING_ACCEPTANCE"[\s\S]*?\]\);/.test(sourceText("src/core/contracts.ts").split("export const WorkStatusSchema")[0]);
    const acceptanceRendererExists = files.has("ui/src/AcceptanceWorkspace.tsx");
    if (acceptanceStageDeclared !== acceptanceRendererExists ||
        (acceptanceStageDeclared && !workItemWorkspace.includes("AcceptanceWorkspace"))) {
      violations.push("Acceptance requires one atomic stage/renderer/WorkItemWorkspace cutover");
    }

    for (const sourcePath of requiredUiOwners) {
      if (!files.has(sourcePath)) {
        violations.push(sourcePath + ": required workbench UI owner is missing");
      }
    }

    for (const obsolete of [
      "ui/src/ExecutionInspector.tsx",
      "ui/src/primitives/DetailRow.tsx",
      "ui/src/primitives/InspectorContent.tsx",
      "ui/src/primitives/Panel.tsx",
      "ui/src/primitives/PanelQueue.tsx",
      "ui/src/primitives/PanelSection.tsx",
      "ui/src/primitives/WorkbenchChip.tsx",
      "ui/src/primitives/WorkbenchEmptyState.tsx",
      "ui/src/primitives/workbench-styles.ts",
    ]) {
      if (files.has(obsolete)) {
        violations.push(obsolete + ": obsolete inspector-centric primitive owner must be removed");
      }
    }

    if (files.has("ui/src/app.tsx")) {
      const application = sourceText("ui/src/app.tsx");
      for (const forbidden of ["MarkdownEditor", "ExecutionWorkspace", "lifecycleRoleRank"]) {
        const declaration = new RegExp("^(?:export\\\\s+)?const\\\\s+" + forbidden + "\\\\s*=", "m");
        if (declaration.test(application)) {
          violations.push("ui/src/app.tsx must not reclaim " + forbidden + " responsibility");
        }
      }
    }

    if (files.has("src/shell/sqlite.ts")) {
      const sqlite = sourceText("src/shell/sqlite.ts");
      if (/order-tasks/.test(sqlite) || /SignedTaskBlockSchema/.test(sqlite)) {
        violations.push("src/shell/sqlite.ts must not own signed PLAN task-block parsing");
      }
      if (/\b(?:String|Number)\s*\(\s*queryScalar\s*\(/.test(sqlite)) {
        violations.push(
          "src/shell/sqlite.ts coerces unknown scalar ingress instead of narrowing it",
        );
      }
    }

    expect(violations).toEqual([]);
  });
  it("enforces typed, acyclic and cohesive UI presentation ownership", () => {
    const violations: string[] = [];
    const uiFiles = productionFiles.filter((path) => path.startsWith("ui/src/"));
    const uiFileSet = new Set(uiFiles);

    const substantiveOwners = new Set([
      "ui/src/AcceptanceWorkspace.tsx",
      "ui/src/CreateWorkItem.tsx",
      "ui/src/DocumentWorkspace.tsx",
      "ui/src/EvidenceViewer.tsx",
      "ui/src/ExecutionWorkspace.tsx",
      "ui/src/MarkdownEditor.tsx",
      "ui/src/MarkdownSourceEditor.tsx",
      "ui/src/ProposalReview.tsx",
      "ui/src/PreSignoffStageWorkspace.tsx",
      "ui/src/ReadinessWorkspace.tsx",
      "ui/src/SignoffReview.tsx",
      "ui/src/ProposalReview.tsx",
      "ui/src/ActivityWorkspace.tsx",
      "ui/src/RunEventTimeline.tsx",
      "ui/src/TerminalResult.tsx",
      "ui/src/WorkItemContext.tsx",
      "ui/src/WorkItemQueue.tsx",
    ]);

    const allowedSubstantiveDependencies: Readonly<Record<string, readonly string[]>> = {
      "ui/src/AcceptanceWorkspace.tsx": ["ui/src/DocumentWorkspace.tsx", "ui/src/EvidenceViewer.tsx"],
      "ui/src/DocumentWorkspace.tsx": ["ui/src/MarkdownEditor.tsx"],
      "ui/src/MarkdownEditor.tsx": ["ui/src/MarkdownSourceEditor.tsx"],
      "ui/src/ActivityWorkspace.tsx": ["ui/src/RunEventTimeline.tsx"],
      "ui/src/PreSignoffStageWorkspace.tsx": [
        "ui/src/ActivityWorkspace.tsx",
        "ui/src/DocumentWorkspace.tsx",
        "ui/src/ProposalReview.tsx",
        "ui/src/EvidenceViewer.tsx",
      ],
      "ui/src/ReadinessWorkspace.tsx": [
        "ui/src/ActivityWorkspace.tsx",
        "ui/src/DocumentWorkspace.tsx",
        "ui/src/EvidenceViewer.tsx",
      ],
      "ui/src/SignoffReview.tsx": ["ui/src/DocumentWorkspace.tsx"],
      "ui/src/ExecutionWorkspace.tsx": [
        "ui/src/RunEventTimeline.tsx",
        "ui/src/EvidenceViewer.tsx",
      ],
    };

    const localUiDependencies = new Map<string, readonly string[]>();
    const codeMirrorPackages = new Set([
      "codemirror",
      "@codemirror/commands",
      "@codemirror/lang-markdown",
      "@codemirror/language",
      "@codemirror/state",
      "@lezer/highlight",
    ]);

    for (const sourcePath of uiFiles) {
      const source = sourceText(sourcePath);
      for (const line of source.split(/\r?\n/)) {
        if (
          /:\s*any\b|<any>|\bas\s+any\b|\bany\[\]|(?:Array|ReadonlyArray)<any>/.test(line)
        ) {
          violations.push(sourcePath + ": UI production code must not use any");
        }
        if (
          !/^\s*import\b/.test(line) &&
          /\bas\s+(?!const\b)[A-Za-z_{[(]/.test(line)
        ) {
          violations.push(
            sourcePath + ": unchecked UI type assertion is prohibited: " + line.trim(),
          );
        }
        if (
          /\b(?:type|interface)\s+[A-Za-z0-9_$]*(?:DTO|Dto|ViewModel)\b/.test(line)
        ) {
          violations.push(
            sourcePath + ": UI must not introduce DTO/view-model semantic copies: " + line.trim(),
          );
        }
      }

      if (sourcePath !== "ui/src/http.ts" && /\bfetch\s*\(/.test(source)) {
        violations.push(sourcePath + ": browser transport must remain owned by ui/src/http.ts");
      }
      if (
        substantiveOwners.has(sourcePath) &&
        !new Set([
          "ui/src/ActivityWorkspace.tsx",
          "ui/src/ExecutionWorkspace.tsx",
          "ui/src/WorkItemQueue.tsx",
        ]).has(sourcePath) &&
        /<button\b/.test(source)
      ) {
        violations.push(
          sourcePath +
          ": substantive actions must use the shared workbench action grammar; native buttons are reserved for selectable task/run/queue rows",
        );
      }


      for (const specifier of importSpecifiers(source)) {
        if (/^(?:zustand|redux|@reduxjs\/|jotai|mobx)(?:\/|$)/.test(specifier)) {
          violations.push(sourcePath + ": second UI state-store dependency is prohibited: " + specifier);
        }
        if (
          codeMirrorPackages.has(specifier) &&
          sourcePath !== "ui/src/MarkdownSourceEditor.tsx"
        ) {
          violations.push(
            sourcePath + ": CodeMirror production imports must remain isolated to ui/src/MarkdownSourceEditor.tsx: " + specifier,
          );
        }
      }

      const dependencies = importSpecifiers(source)
        .map((specifier) => resolvedRepositoryImport(sourcePath, specifier))
        .filter((targetPath): targetPath is string =>
          targetPath !== null && targetPath.startsWith("ui/src/") && uiFileSet.has(targetPath),
        );
      localUiDependencies.set(sourcePath, dependencies);

      if (sourcePath.startsWith("ui/src/primitives/")) {
        for (const targetPath of dependencies) {
          if (
            substantiveOwners.has(targetPath) ||
            targetPath === "ui/src/app.tsx" ||
            targetPath === "ui/src/WorkItemWorkspace.tsx" ||
            targetPath === "ui/src/http.ts"
          ) {
            violations.push(
              sourcePath + " -> " + targetPath +
              ": primitive boundary must not depend on substantive workspace/application owners",
            );
          }
        }
      }

      if (substantiveOwners.has(sourcePath)) {
        const allowed = new Set(allowedSubstantiveDependencies[sourcePath] ?? []);
        for (const targetPath of dependencies) {
          if (substantiveOwners.has(targetPath) && !allowed.has(targetPath)) {
            violations.push(
              sourcePath + " -> " + targetPath +
              ": substantive workspace siblings must coordinate through the composition boundary",
            );
          }
        }
      }
    }

    const sourceEditor = sourceText("ui/src/MarkdownSourceEditor.tsx");
    for (const required of [
      'from "codemirror"',
      'from "@codemirror/lang-markdown"',
      'from "@codemirror/language"',
      'from "@codemirror/commands"',
      'from "@codemirror/state"',
      'from "@lezer/highlight"',
      "applyMarkdownFormat",
      "EditorView.updateListener",
    ]) {
      if (!sourceEditor.includes(required)) {
        violations.push(
          "ui/src/MarkdownSourceEditor.tsx must own CodeMirror source-editor mechanic " + required,
        );
      }
    }

    const formattingOwner = sourceText("ui/src/markdown-source-formatting.ts");
    for (const forbiddenImport of [
      "react",
      "codemirror",
      "@codemirror/",
      "@astryxdesign/",
      "@tanstack/",
      "./http",
      "../../src/core/",
    ]) {
      if (formattingOwner.includes("from \"" + forbiddenImport)) {
        violations.push(
          "ui/src/markdown-source-formatting.ts must remain a pure source-transform owner: " + forbiddenImport,
        );
      }
    }

    const queryKeyOwner = sourceText("ui/src/query-keys.ts");
    for (const requiredOwner of [
      "export const workbenchQueryKeys",
      "workItems:",
      "runs:",
      "runEvents:",
      "artifactContent:",
      "evidence:",
    ]) {
      if (!queryKeyOwner.includes(requiredOwner)) {
        violations.push(
          "ui/src/query-keys.ts must own shared typed query identity " + requiredOwner,
        );
      }
    }

    for (const sourcePath of uiFiles.filter((path) => path !== "ui/src/query-keys.ts")) {
      const source = sourceText(sourcePath);
      if (/queryKey:\s*\[\s*["']/.test(source)) {
        violations.push(
          sourcePath + ": TanStack query identity must use ui/src/query-keys.ts",
        );
      }
      if (/invalidateQueries\(\{\s*queryKey:\s*\[\s*["']/.test(source)) {
        violations.push(
          sourcePath + ": query invalidation identity must use ui/src/query-keys.ts",
        );
      }
    }

    const presentationPolicy = sourceText("ui/src/workbench-presentation.ts");
    for (const requiredOwner of [
      "export type WorkflowMaterial",
      "export type EvidenceSelection",
      "export const workflowStepState",
      "export const resolveWorkflowMaterial",
      "export const runIsActive",
      "export const runEventPresentation",
      "export const proposalDispositionFor",
      "export const lifecycleArtifactRoleRank",
    ]) {
      if (!presentationPolicy.includes(requiredOwner)) {
        violations.push(
          "ui/src/workbench-presentation.ts must own shared typed presentation rule " + requiredOwner,
        );
      }
    }

    const workItemChrome = sourceText("ui/src/WorkItemWorkspace.tsx");
    const documentChrome = sourceText("ui/src/DocumentWorkspace.tsx");
    const markdownChrome = sourceText("ui/src/MarkdownEditor.tsx");
    const applicationChrome = sourceText("ui/src/app.tsx");
    const themeStyles = sourceText("ui/src/theme.css");
    for (const [owner, source, forbidden] of [
      ["WorkItemWorkspace", workItemChrome, "order-workflow-orientation"],
      ["DocumentWorkspace", documentChrome, "order-document-state-strip"],
      ["MarkdownEditor", markdownChrome, "order-editor-actionbar"],
      ["app", applicationChrome, 'aria-label="Theme"'],
      ["theme.css", themeStyles, "order-workflow-orientation"],
      ["theme.css", themeStyles, "order-document-state-strip"],
      ["theme.css", themeStyles, "order-editor-actionbar"],
      ["theme.css", themeStyles, "order-theme-control select"],
    ] as const) {
      if (source.includes(forbidden)) {
        violations.push(
          owner + ": superseded T06 chrome must not remain: " + forbidden,
        );
      }
    }
    for (const required of ["workflowStepState", "resolveWorkflowMaterial"]) {
      if (!workItemChrome.includes(required)) {
        violations.push(
          "ui/src/WorkItemWorkspace.tsx must use the workflow-step presentation owner: " + required,
        );
      }
    }
    for (const forbidden of [
      "workspace-view-selector",
      "SegmentedControlItem",
      "visibleModes",
      "workItemInitialMode",
      "workflowInspectionTarget",
      "returnMode",
    ]) {
      if (workItemChrome.includes(forbidden)) {
        violations.push(
          "ui/src/WorkItemWorkspace.tsx must not retain superseded global mode navigation: " + forbidden,
        );
      }
    }
    if (!markdownChrome.includes("toolbarAccessory")) {
      violations.push(
        "ui/src/MarkdownEditor.tsx must expose the narrow document-control slot",
      );
    }

    for (const sourcePath of uiFiles.filter((path) => path !== "ui/src/workbench-presentation.ts")) {
      const source = sourceText(sourcePath);
      if (/new Set<Run\["status"\]>\(\["RUNNING", "WAITING_FOR_INPUT"\]\)/.test(source)) {
        violations.push(
          sourcePath + ": active Run classification must use the shared presentation owner",
        );
      }
      if (
        sourcePath === "ui/src/EvidenceViewer.tsx" &&
        /export\s+(?:type|interface)\s+EvidenceSelection\b/.test(source)
      ) {
        violations.push(
          sourcePath + ": presentation selection types must remain owned by workbench-presentation.ts",
        );
      }
      if (/\bconst\s+proposalDisposition\s*=/.test(source)) {
        violations.push(
          sourcePath + ": proposal disposition projection must use the shared presentation owner",
        );
      }
      if (/\bconst\s+roleOrder\s*:/.test(source)) {
        violations.push(
          sourcePath + ": lifecycle artifact ordering must use the shared presentation owner",
        );
      }
    }

    const visiting = new Set<string>();
    const visited = new Set<string>();
    const visitDependency = (sourcePath: string, stack: readonly string[]): void => {
      if (visiting.has(sourcePath)) {
        violations.push(
          "UI dependency cycle: " + [...stack, sourcePath].join(" -> "),
        );
        return;
      }
      if (visited.has(sourcePath)) return;
      visiting.add(sourcePath);
      for (const targetPath of localUiDependencies.get(sourcePath) ?? []) {
        visitDependency(targetPath, [...stack, sourcePath]);
      }
      visiting.delete(sourcePath);
      visited.add(sourcePath);
    };
    for (const sourcePath of uiFiles) visitDependency(sourcePath, []);

    expect(violations).toEqual([]);
  });

  it("locks the 0.2.1 Settings, source-authoring and workbench owner boundaries", () => {
    const runtime = sourceText("src/daemon/runtime.ts");
    const config = sourceText("src/shell/config.ts");
    const projectConfig = sourceText("src/shell/project-config.ts");
    const accountUtility = sourceText("ui/src/OpenCodeAccountControl.tsx");
    const accountSettings = sourceText("ui/src/OpenCodeAccountSettings.tsx");
    const documentWorkspace = sourceText("ui/src/DocumentWorkspace.tsx");
    const application = sourceText("ui/src/app.tsx");
    const theme = sourceText("ui/src/theme.css");

    expect(runtime).toContain("readonly config: OrderConfig");
    expect(config).toContain("export const writeOrderConfig");
    expect(config).toContain("export const writeOrderConfigExpected");

    expect(projectConfig).toContain("mutateWorkItemsRootText");
    expect(projectConfig).toContain("activateWorkItemsRootManifest");
    expect(projectConfig).toContain("rollbackWorkItemsRootMigration");

    expect(accountUtility).toContain("useQuery");
    expect(accountUtility).toContain("useOpenCodeAccountControl");
    expect(accountUtility).not.toContain("useMutation");
    expect(accountUtility).not.toContain("WorkbenchUtilityLink");
    expect(accountUtility).not.toContain("WorkbenchStatus");
    expect(application).toContain("useOpenCodeAccountControl");
    expect(accountUtility).not.toContain("api.activateOpenCodeAccount");
    expect(accountUtility).not.toContain("api.renameOpenCodeAccount");
    expect(accountUtility).not.toContain("api.removeOpenCodeAccount");
    for (const requiredMutation of [
      "api.activateOpenCodeAccount",
      "api.renameOpenCodeAccount",
      "api.removeOpenCodeAccount",
      "api.startOpenCodeAccountLogin",
    ]) {
      expect(accountSettings).toContain(requiredMutation);
    }

    expect(documentWorkspace).not.toContain("parseWorkItemSourceMarkdown");
    expect(documentWorkspace).not.toContain("recomposeWorkItemSourceBody");
    expect(documentWorkspace).toContain("api.saveWorkItemSourceBody");

    expect(application).not.toMatch(/<select[^>]*aria-label=["']Theme["']/);
    expect(theme).not.toContain("order-theme-control select");
    expect(theme).not.toContain("order-workflow-orientation");
    expect(theme).not.toContain("order-document-state-strip");
    expect(theme).not.toContain("order-editor-actionbar");

    const ownershipViolations: string[] = [];
    for (const sourcePath of productionFiles) {
      const source = sourceText(sourcePath);
      if (
        sourcePath !== "src/shell/config.ts" &&
        sourcePath !== "src/installer.ts" &&
        /statePaths\([^)]*\)\.config/.test(source)
      ) {
        ownershipViolations.push(
          sourcePath + ": productive config.json path access must remain owned by src/shell/config.ts",
        );
      }
      if (/\b(?:runtime|owner\.current)\.config\s*=(?!=)/.test(source)) {
        ownershipViolations.push(sourcePath + ": CoordinatorRuntime.config must never be reassigned");
      }
      if (/\.config\.(?:model|repositoryRoots|referenceRoots)\s*=(?!=)/.test(source)) {
        ownershipViolations.push(sourcePath + ": canonical runtime config fields must never be mutated in place");
      }
      if (
        /\.config\.(?:repositoryRoots|referenceRoots)\.(?:copyWithin|fill|pop|push|reverse|shift|sort|splice|unshift)\s*\(/.test(source)
      ) {
        ownershipViolations.push(sourcePath + ": canonical runtime config arrays must remain immutable snapshots");
      }

      if (layerOf(sourcePath) === "ui") {
        if (/\b(?:settings|config)(?:Store|Context|Reducer)\b/i.test(source)) {
          ownershipViolations.push(sourcePath + ": browser configuration must not introduce a global store owner");
        }
        for (const forbidden of [
          "parseWorkItemSourceMarkdown",
          "recomposeWorkItemSourceBody",
          "WorkItemSourceMetadataSchema",
        ]) {
          if (source.includes(forbidden)) {
            ownershipViolations.push(
              sourcePath + ": browser must not parse or recompose WorkItem source metadata: " + forbidden,
            );
          }
        }
      }
    }

    for (const required of [
      "statePaths(stateRoot).config",
      "O_NOFOLLOW",
      "fsyncSync",
      "renameSync",
    ]) {
      if (!config.includes(required)) {
        ownershipViolations.push("src/shell/config.ts must retain canonical config writer mechanic " + required);
      }
    }
    if (/api\.saveWorkItemSource\s*\(/.test(documentWorkspace)) {
      ownershipViolations.push("ordinary Source authoring must not retain the complete-source save path");
    }

    expect(ownershipViolations).toEqual([]);
  });

  it("enforces canonical documentation concern ownership and identifier references", () => {
    const violations: string[] = [];
    const docsDirectory = join(repositoryRoot, "docs");
    const documentationFiles: string[] = [];
    const visitDocumentation = (directory: string): void => {
      for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const absolute = join(directory, entry.name);
        const path = repositoryPath(absolute);
        if (entry.isDirectory()) {
          if (path === "docs/order/work-items" || path.startsWith("docs/order/work-items/")) {
            continue;
          }
          visitDocumentation(absolute);
        } else if (entry.isFile() && entry.name.endsWith(".md")) {
          documentationFiles.push(path);
        }
      }
    };
    visitDocumentation(docsDirectory);

    const activeDocumentationFiles = ["AGENTS.md", ...documentationFiles].sort();

    for (const path of activeDocumentationFiles) {
      if (path !== "AGENTS.md" && path !== "docs/README.md" && /(?:^|\/)\d+-[^/]+\.md$/.test(path)) {
        violations.push(`${path}: canonical documentation filenames must be semantic, not ordinal-prefixed`);
      }
    }

    type ConcernMetadata = Readonly<{
      path: string;
      stableId: string;
      versionedId: string;
    }>;

    const concernByPath = new Map<string, ConcernMetadata>();
    const currentOwnerByStable = new Map<string, string>();
    const seenVersioned = new Map<string, string>();
    const retainedVersionMatch = (path: string): RegExpMatchArray | null =>
      path.match(/\.v([0-9]+)(?:-(\d{4}-\d{2}-\d{2}))?\.md$/);
    const retainedSemanticVersionPath = (path: string): boolean =>
      retainedVersionMatch(path) !== null;

    for (const path of activeDocumentationFiles) {
      const source = sourceText(path);
      const stable = source.match(/^\*\*Canonical concern ID:\*\* `([A-Z0-9-]+)`/m)?.[1];
      const versioned = source.match(/^\*\*Versioned concern ID:\*\* `([A-Z0-9-]+)`/m)?.[1];

      if ((stable === undefined) !== (versioned === undefined)) {
        violations.push(`${path}: canonical concern metadata must declare both stable and versioned ids`);
        continue;
      }
      if (stable === undefined || versioned === undefined) continue;

      if (!/^GW-DOC-[A-Z0-9-]+$/.test(stable)) {
        violations.push(`${path}: invalid canonical concern id ${stable}`);
      }
      if (!versioned.startsWith(`${stable}-V`)) {
        violations.push(
          `${path}: versioned concern id ${versioned} must extend stable id ${stable} with -V...`,
        );
      }
      const retainedVersion = retainedVersionMatch(path);
      if (retainedVersion !== null) {
        const semanticVersion = retainedVersion[1];
        const snapshotDate = retainedVersion[2];
        const expectedSuffix =
          `-V${semanticVersion}${snapshotDate === undefined ? "" : `-${snapshotDate}`}`;
        if (!versioned.endsWith(expectedSuffix)) {
          violations.push(
            `${path}: retained semantic-version filename must match ${versioned}`,
          );
        }
      }

      const versionSnapshotDate =
        versioned.match(/-V[0-9]+-(\d{4}-\d{2}-\d{2})$/)?.[1];
      if (versionSnapshotDate !== undefined) {
        const verifiedDate =
          source.match(/^\*\*Verified:\*\*\s*(\d{4}-\d{2}-\d{2})\s*$/m)?.[1];
        if (verifiedDate !== versionSnapshotDate) {
          violations.push(
            `${path}: dated version ${versioned} must match declared Verified date ${versionSnapshotDate}`,
          );
        }
      }

      if (!retainedSemanticVersionPath(path)) {
        const priorCurrentOwner = currentOwnerByStable.get(stable);
        if (priorCurrentOwner !== undefined) {
          violations.push(
            `${stable}: duplicate current canonical concern owner ${priorCurrentOwner}, ${path}`,
          );
        } else {
          currentOwnerByStable.set(stable, path);
        }
      }

      const priorVersioned = seenVersioned.get(versioned);
      if (priorVersioned !== undefined) {
        violations.push(`${versioned}: duplicate versioned concern owner ${priorVersioned}, ${path}`);
      } else {
        seenVersioned.set(versioned, path);
      }

      concernByPath.set(path, { path, stableId: stable, versionedId: versioned });
    }

    const manifest = sourceText("pontivus-order.toml");
    const refsBody = manifest.match(/\[refs\]\r?\n([\s\S]*?)(?=\r?\n\[|$)/)?.[1] ?? "";
    const refs = new Map<string, string>();
    for (const line of refsBody.split(/\r?\n/)) {
      const match = line.match(/^([A-Za-z0-9_.-]+)\s*=\s*"([^"]+)"\s*$/);
      if (match?.[1] !== undefined && match[2] !== undefined) {
        if (refs.has(match[1])) {
          violations.push(`${match[1]}: duplicate manifest ref identifier`);
        } else {
          refs.set(match[1], match[2]);
        }
      }
    }

    const manifestAuthorityBody =
      manifest.match(/\[authority\]\r?\n([\s\S]*?)(?=\r?\n\[|$)/)?.[1] ?? "";
    const authorityPatterns = ["p1", "p2", "p3", "p4", "p5", "p6"].flatMap((layer) => [
      ...(manifestAuthorityBody.match(new RegExp("^" + layer + "\\s*=\\s*\\[(.*)\\]\\s*$", "m"))?.[1]
        ?.matchAll(/"([^"]+)"/g) ?? []),
    ].map((match) => match[1]).filter((value): value is string => value !== undefined));
    for (const [authorityRef, sourcePath] of refs) {
      if (!authorityPatterns.some((pattern) => matchesGlob(sourcePath, pattern))) {
        violations.push(
          `${authorityRef}: manifest ref source must be selected by authority.p1-p6: ${sourcePath}`,
        );
      }
    }

    for (const metadata of concernByPath.values()) {
      if (
        !retainedSemanticVersionPath(metadata.path) &&
        refs.get(metadata.stableId) !== metadata.path
      ) {
        violations.push(
          `${metadata.stableId}: stable manifest ref must resolve to current canonical owner ${metadata.path}`,
        );
      }
      if (refs.get(metadata.versionedId) !== metadata.path) {
        violations.push(
          `${metadata.versionedId}: versioned manifest ref must resolve to exact semantic source ${metadata.path}`,
        );
      }
    }

    for (const [stableId, currentPath] of currentOwnerByStable) {
      if (refs.get(stableId) !== currentPath) {
        violations.push(
          `${stableId}: stable manifest ref must select exactly one current semantic owner`,
        );
      }
    }

    for (const [ref, ownerPath] of refs) {
      if (!ref.startsWith("GW-DOC-")) continue;
      const metadata = concernByPath.get(ownerPath);
      if (metadata === undefined) {
        violations.push(`${ref}: GW-DOC ref resolves to a document without canonical concern metadata: ${ownerPath}`);
        continue;
      }
      if (ref !== metadata.stableId && ref !== metadata.versionedId) {
        violations.push(`${ref}: undocumented alias for canonical concern owner ${ownerPath}`);
      }
    }

    const authorityBody =
      manifest.match(/\[authority\]\r?\n([\s\S]*?)(?=\r?\n\[|$)/)?.[1] ?? "";
    for (const line of authorityBody.split(/\r?\n/)) {
      const match = line.match(/^p[1-6]\s*=\s*\[(.*)\]\s*$/);
      if (match?.[1] === undefined) continue;
      for (const item of match[1].matchAll(/"([^"]+)"/g)) {
        const authorityPath = item[1];
        if (
          authorityPath === undefined ||
          !authorityPath.endsWith(".md") ||
          /[?*{}[\]!]/.test(authorityPath)
        ) {
          continue;
        }
        const metadata = concernByPath.get(authorityPath);
        if (metadata === undefined) {
          violations.push(
            `${authorityPath}: literal authority document must declare canonical concern metadata`,
          );
          continue;
        }
        if (retainedSemanticVersionPath(authorityPath)) {
          const currentPath = currentOwnerByStable.get(metadata.stableId);
          if (currentPath === undefined) {
            violations.push(
              `${authorityPath}: retained semantic-version authority must have a current canonical owner for ${metadata.stableId}`,
            );
            continue;
          }
          const currentSelectedInLayer = [...match[1].matchAll(/"([^"]+)"/g)]
            .some((candidate) => candidate[1] === currentPath);
          if (!currentSelectedInLayer) {
            violations.push(
              `${authorityPath}: retained semantic-version authority must be selected beside current owner ${currentPath} in the same authority layer`,
            );
          }
        }
      }
    }

    // A permanent current document depends on the current owner through the
    // stable concern id. Versioned ids are reserved for exact semantic
    // snapshots (for example the governed WorkItem package) and retained
    // historical evidence.
    const advancedConcerns = [...currentOwnerByStable.entries()].flatMap(
      ([stableId, currentPath]) => {
        const versionedIds = [...refs.entries()]
          .filter(([refId, ownerPath]) =>
            refId !== stableId &&
            refId.startsWith(stableId + "-V") &&
            concernByPath.get(ownerPath)?.stableId === stableId
          )
          .map(([refId]) => refId);
        const hasRetainedVersion = [...concernByPath.values()].some(
          (metadata) =>
            metadata.stableId === stableId &&
            retainedSemanticVersionPath(metadata.path),
        );
        return hasRetainedVersion
          ? [{ stableId, currentPath, versionedIds }]
          : [];
      },
    );
    for (const sourcePath of activeDocumentationFiles.filter(
      (path) => !retainedSemanticVersionPath(path)
    )) {
      for (const { stableId, currentPath, versionedIds } of advancedConcerns) {
        if (sourcePath === currentPath) continue;
        for (const [index, line] of sourceText(sourcePath).split(/\r?\n/).entries()) {
          for (const versionedId of versionedIds) {
            if (line.includes(versionedId)) {
              violations.push(
                `${sourcePath}:${index + 1}: current authority consumer must reference stable ${stableId}, not exact ${versionedId}`,
              );
            }
          }
        }
      }
    }

    for (const sourcePath of activeDocumentationFiles) {
      const lines = sourceText(sourcePath).split(/\r?\n/);
      for (const metadata of concernByPath.values()) {
        if (metadata.path === sourcePath) continue;
        // AGENTS.md is a conventional project-local filename and can legitimately
        // refer to nested/consumer instruction files rather than this repository root owner.
        if (metadata.path === "AGENTS.md") continue;

        const sourceDirectory = dirname(sourcePath);
        const relativeTarget = relative(sourceDirectory, metadata.path).replaceAll("\\", "/");
        const referenceForms = new Set([
          metadata.path,
          relativeTarget,
          relativeTarget.startsWith(".") ? relativeTarget : `./${relativeTarget}`,
        ]);

        for (const [index, line] of lines.entries()) {
          if (![...referenceForms].some((reference) => line.includes(reference))) continue;
          const concernIds = [...concernByPath.values()]
            .filter((candidate) => candidate.stableId === metadata.stableId)
            .flatMap((candidate) => [candidate.stableId, candidate.versionedId]);
          if (!concernIds.some((id) => line.includes(id))) {
            violations.push(
              `${sourcePath}:${index + 1}: reference to ${metadata.path} must carry an identifier for canonical concern ${metadata.stableId}`,
            );
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("enforces v2 WorkItem documentation hygiene without reinterpreting historical v1 packages", () => {
    const violations: string[] = [];
    const manifest = sourceText("pontivus-order.toml");
    const refsBody = manifest.match(/\[refs\]\r?\n([\s\S]*?)(?=\r?\n\[|$)/)?.[1] ?? "";
    const resolvedRefs = new Map<string, string>();
    for (const line of refsBody.split(/\r?\n/)) {
      const match = line.match(/^([A-Za-z0-9_.-]+)\s*=\s*"([^"]+)"\s*$/);
      if (match?.[1] !== undefined && match[2] !== undefined) {
        resolvedRefs.set(match[1], match[2]);
      }
    }
    const authorityBody =
      manifest.match(/\[authority\]\r?\n([\s\S]*?)(?=\r?\n\[|$)/)?.[1] ?? "";
    const p3Patterns = [
      ...(authorityBody.match(/^p3\s*=\s*\[(.*)\]\s*$/m)?.[1].matchAll(/"([^"]+)"/g) ?? []),
    ].map((match) => match[1]).filter((value): value is string => value !== undefined);
    const stableP3Ids = new Set(
      [...resolvedRefs.entries()]
        .filter(([id, path]) =>
          /^GW-FR-[A-Z0-9-]+$/.test(id) &&
          p3Patterns.some((pattern) => matchesGlob(path, pattern))
        )
        .map(([id]) => id),
    );
    const stableCoverageDelta = (
      expected: ReadonlySet<string>,
      declared: readonly string[],
    ): Readonly<{ missing: readonly string[]; duplicate: readonly string[]; extra: readonly string[] }> => {
      const counts = new Map<string, number>();
      for (const id of declared) counts.set(id, (counts.get(id) ?? 0) + 1);
      return {
        missing: [...expected].filter((id) => !counts.has(id)).sort(),
        duplicate: [...counts.entries()].filter(([, count]) => count > 1).map(([id]) => id).sort(),
        extra: [...counts.keys()].filter((id) => !expected.has(id)).sort(),
      };
    };
    expect(
      stableCoverageDelta(
        new Set(["GW-FR-A", "GW-FR-B"]),
        ["GW-FR-A", "GW-FR-A", "GW-FR-C"],
      ),
    ).toEqual({
      missing: ["GW-FR-B"],
      duplicate: ["GW-FR-A"],
      extra: ["GW-FR-C"],
    });
    const workItemsRoot = join(repositoryRoot, "docs", "order", "work-items");
    for (const entry of readdirSync(workItemsRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const workItemDirectory = join(workItemsRoot, entry.name);
      const requestPath = join(workItemDirectory, "work-request.md");
      if (!existsSync(requestPath)) continue;
      const request = readFileSync(requestPath, "utf8");
      const schemaId = request.match(/"schemaId"\s*:\s*"([^"]+)"/)?.[1];
      if (schemaId !== "change-v2" && schemaId !== "defect-v2") continue;

      const markdownFiles = readdirSync(workItemDirectory, { withFileTypes: true })
        .filter((candidate) => candidate.isFile() && candidate.name.endsWith(".md"))
        .map((candidate) => candidate.name)
        .sort();

      for (const filename of markdownFiles) {
        const path = join(workItemDirectory, filename);
        const source = readFileSync(path, "utf8");
        if (/^\*\*Canonical concern ID:\*\*/m.test(source) ||
          /^\*\*Versioned concern ID:\*\*/m.test(source)) {
          violations.push(
            `docs/order/work-items/${entry.name}/${filename}: WorkItem documents must not declare canonical concern ownership`,
          );
        }
        if (/\bWF-FR-[A-Z0-9-]+\b/.test(source)) {
          violations.push(
            `docs/order/work-items/${entry.name}/${filename}: v2 WorkItem documents must not create the retired WF-FR shadow namespace`,
          );
        }
      }

      const requirementsPath = join(workItemDirectory, "requirements.md");
      if (existsSync(requirementsPath)) {
        const requirements = readFileSync(requirementsPath, "utf8");
        if (!requirements.includes("## Functional authority disposition ledger")) {
          violations.push(
            `docs/order/work-items/${entry.name}/requirements.md: v2 R2 requires the functional authority disposition ledger`,
          );
        }
        const ledger = requirements.match(
          /## Functional authority disposition ledger\r?\n([\s\S]*?)(?=\r?\n## |$)/,
        )?.[1] ?? "";
        const dataRows = ledger
          .split(/\r?\n/)
          .filter((line) => /^\|/.test(line.trim()))
          .filter((line) =>
            !/^\|\s*Requirement\s*\|/.test(line.trim()) &&
            !/^\|\s*[-:]+\s*\|/.test(line.trim())
          )
          .filter((line) =>
            line.trim().slice(1, -1).split("|").some((cell) => cell.trim().length > 0)
          );
        if (dataRows.length === 0) {
          violations.push(
            `docs/order/work-items/${entry.name}/requirements.md: v2 authority disposition ledger must contain at least one material requirement row`,
          );
        }
        if (entry.name === "work_0f6d97bf-5c9e-4ed7-8f4c-2dd8806d4a21") {
          const campaignPlan = sourceText(
            "docs/order/work-items/work_0f6d97bf-5c9e-4ed7-8f4c-2dd8806d4a21/0.6.0-design-campaign-plan.md",
          );
          const g3Status = campaignPlan.match(/^\| G3 \|[^|]*\|\s*([^|]+?)\s*\|/m)?.[1] ?? "";
          if (g3Status === "PASS") {
            const declaredStableIds = dataRows
              .map((row) => row.trim().slice(1, -1).split("|")[0]?.trim() ?? "")
              .filter((id) => /^GW-FR-[A-Z0-9-]+$/.test(id));
            const delta = stableCoverageDelta(stableP3Ids, declaredStableIds);
            if (delta.missing.length > 0) {
              violations.push(
                `docs/order/work-items/${entry.name}/requirements.md: G3 PASS missing stable P3 dispositions: ${delta.missing.join(", ")}`,
              );
            }
            if (delta.duplicate.length > 0) {
              violations.push(
                `docs/order/work-items/${entry.name}/requirements.md: G3 PASS duplicate stable P3 dispositions: ${delta.duplicate.join(", ")}`,
              );
            }
            if (delta.extra.length > 0) {
              violations.push(
                `docs/order/work-items/${entry.name}/requirements.md: G3 PASS contains non-authoritative GW-FR disposition ids: ${delta.extra.join(", ")}`,
              );
            }
          }
        }

        for (const row of dataRows) {
          const cells = row.trim().slice(1, -1).split("|").map((cell) => cell.trim());
          const [requirement = "", disposition = "", owner = ""] = cells;
          if (requirement.length === 0) {
            violations.push(
              `docs/order/work-items/${entry.name}/requirements.md: authority disposition row has empty requirement`,
            );
          }
          if (!["REFERENCE", "DELTA", "LOCAL"].includes(disposition)) {
            violations.push(
              `docs/order/work-items/${entry.name}/requirements.md: invalid authority disposition ${disposition}`,
            );
          }
          if (
            (disposition === "REFERENCE" || disposition === "DELTA") &&
            !/^GW-/.test(owner)
          ) {
            violations.push(
              `docs/order/work-items/${entry.name}/requirements.md: ${disposition} row requires a GW-* canonical owner`,
            );
          }
          if (
            (disposition === "REFERENCE" || disposition === "DELTA") &&
            /^GW-/.test(owner) &&
            !resolvedRefs.has(owner)
          ) {
            violations.push(
              `docs/order/work-items/${entry.name}/requirements.md: unresolved canonical owner ${owner}`,
            );
          }
          if (
            (disposition === "REFERENCE" || disposition === "DELTA") &&
            /^GW-/.test(owner) &&
            resolvedRefs.has(owner)
          ) {
            const ownerPath = resolvedRefs.get(owner)!;
            if (!p3Patterns.some((pattern) => matchesGlob(ownerPath, pattern))) {
              violations.push(
                `docs/order/work-items/${entry.name}/requirements.md: ${disposition} owner ${owner} is not selected by authority.p3`,
              );
            }
            if (
              /^GW-FR-[A-Z0-9-]+$/.test(requirement) &&
              !sourceText(ownerPath).includes(requirement)
            ) {
              violations.push(
                `docs/order/work-items/${entry.name}/requirements.md: ${owner} does not contain stable requirement ${requirement}`,
              );
            }
            if (/^GW-FR-[A-Z0-9-]+$/.test(requirement)) {
              const canonicalRequirementPath = resolvedRefs.get(requirement);
              if (canonicalRequirementPath === undefined) {
                violations.push(
                  `docs/order/work-items/${entry.name}/requirements.md: unresolved stable requirement ${requirement}`,
                );
              } else if (canonicalRequirementPath !== ownerPath) {
                violations.push(
                  `docs/order/work-items/${entry.name}/requirements.md: ${requirement} owner ${owner} resolves to ${ownerPath}, expected canonical P3 owner path ${canonicalRequirementPath}`,
                );
              }
            }
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });


  it("enforces single-owned campaign state and pre-delivery foundation ancestry", () => {
    const campaignPlanPath =
      "docs/order/work-items/work_0f6d97bf-5c9e-4ed7-8f4c-2dd8806d4a21/0.6.0-design-campaign-plan.md";
    const campaignLedgerPath =
      "docs/order/work-items/work_0f6d97bf-5c9e-4ed7-8f4c-2dd8806d4a21/0.6.0-concern-coverage-ledger.md";
    if (!existsSync(join(repositoryRoot, campaignPlanPath))) return;

    const source = sourceText(campaignPlanPath);
    const violations: string[] = [];
    const campaignDirectory = dirname(campaignPlanPath);
    if (!source.startsWith("# Order 0.6.0 design campaign plan\n")) {
      violations.push("campaign must retain its canonical H1 as the first line");
    }
    const gitBlobSha = (path: string): string => {
      const bytes = readFileSync(join(repositoryRoot, path));
      return createHash("sha1")
        .update("blob " + bytes.length + "\0")
        .update(bytes)
        .digest("hex");
    };
    const exactAlignPackageBlobs = new Map([
      ["R1", gitBlobSha(join(campaignDirectory, "research.md"))],
      ["R2", gitBlobSha(join(campaignDirectory, "requirements.md"))],
      ["DESIGN", gitBlobSha(join(campaignDirectory, "solution-design.md"))],
      ["PLAN", gitBlobSha(join(campaignDirectory, "implementation-plan.md"))],
      ["P3 Workbench", gitBlobSha("docs/requirements/workbench.md")],
      ["P4 Workbench", gitBlobSha("docs/architecture/workbench.md")],
      ["P4 Workbench Theme", gitBlobSha("docs/architecture/workbench-theme.md")],
    ] as const);
    const currentGateProjection =
      /^(?:\*\*Status:\*\*[^\n]*\bG(?:5A|[0-6])\b[^\n]*\b(?:PASS|IN_PROGRESS|BLOCKED|REVALIDATION|NOT_STARTED)\b|\s*(?:[-*]\s*)?(?:\*\*)?G(?:5A|[0-6])(?:\*\*)?\s*(?::|=|is\b)[^\n]*\b(?:PASS|IN_PROGRESS|BLOCKED|REVALIDATION|NOT_STARTED|complete|closed|ready)\b)/i;
    const currentGateVerdictHeading =
      /^#{1,6}\s+.*\bG(?:5A|[0-6])\b.*\b(?:verdict|status|closure|state)\b/i;
    for (const entry of readdirSync(join(repositoryRoot, campaignDirectory), { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith(".md") || entry.name === "0.6.0-design-campaign-plan.md") {
        continue;
      }
      const siblingPath = join(campaignDirectory, entry.name).replaceAll("\\", "/");
      for (const [index, line] of sourceText(siblingPath).split(/\r?\n/).entries()) {
        if (currentGateProjection.test(line) || currentGateVerdictHeading.test(line)) {
          violations.push(
            `${siblingPath}:${index + 1}: current G0-G5/G5A/G6 state must be owned only by campaign §18`,
          );
        }
      }
    }

    if (/^\*\*Status:\*\*/m.test(source)) {
      violations.push("campaign header must not duplicate current gate/concern state");
    }
    if (/^\*\*Prerequisite:\*\*/m.test(source)) {
      violations.push("campaign header must not duplicate the current G0 baseline");
    }
    if (/^\*\*C\d{2} status:\*\*/m.test(source)) {
      violations.push("concern START/END prose must not duplicate current concern state");
    }
    if (source.includes("## 20. Current execution state")) {
      violations.push("campaign must not maintain a second current execution-state projection");
    }
    if (!source.includes("## 20. Derived execution-state view")) {
      violations.push("campaign must retain the explicitly derived-only execution-state view");
    }

    const concernSection =
      source.match(/## 7\. Master concern register\r?\n([\s\S]*?)(?=\r?\n## 8\.)/)?.[1] ?? "";
    const pairSection =
      source.match(/#### Current pair-audit status\r?\n([\s\S]*?)(?=\r?\n## 9\.)/)?.[1] ?? "";
    const alignSection =
      source.match(/## 13A\. Phase 3A — ALIGN final vertical domain completion\r?\n([\s\S]*?)(?=\r?\n## 14\.)/)?.[1] ?? "";
    const alignHeading = "## 13A. Phase 3A — ALIGN final vertical domain completion";
    const alignStart = source.indexOf(alignHeading);
    const alignEnd = alignStart < 0 ? -1 : source.indexOf("\n## 14.", alignStart);
    const outsideAlign = alignStart < 0 || alignEnd < 0
      ? source
      : source.slice(0, alignStart) + source.slice(alignEnd);
    for (const [index, line] of outsideAlign.split(/\r?\n/).entries()) {
      if (/^\| ALIGN-(?:A\d{2}|H1) \|\s*(?:NOT_STARTED|IN_REVIEW|PASS|FAIL|BLOCKED|REVALIDATION)\s*\|/.test(line)) {
        violations.push(
          "campaign:" + (index + 1) +
            ": ALIGN current-state rows must exist only inside §13A",
        );
      }
    }
    const gateSection =
      source.match(/## 18\. Phase\/gate status register\r?\n([\s\S]*?)(?=\r?\n## 19\.)/)?.[1] ?? "";

    if (!concernSection.includes("sole current-state owner for C01-C22")) {
      violations.push("§7 must explicitly own all current concern state");
    }
    if (!alignSection.includes("sole current-state owner for ALIGN audit progression")) {
      violations.push("§13A must explicitly own current ALIGN audit progression");
    }
    if (!gateSection.includes("sole current-state owner for G0-G5, G5A and G6")) {
      violations.push("§18 must explicitly own all current gate state");
    }

    const tableCells = (line: string): readonly string[] =>
      line.trim().slice(1, -1).split("|").map((cell) => cell.trim());

    const concerns = concernSection
      .split(/\r?\n/)
      .filter((line) => /^\| C\d{2} \|/.test(line))
      .map((line) => {
        const cells = tableCells(line);
        return {
          id: cells[0] ?? "",
          r1: cells[3] ?? "",
          r2: cells[4] ?? "",
          design: cells[5] ?? "",
          plan: cells[6] ?? "",
          overall: cells[7] ?? "",
        };
      });

    if (concerns.length !== 22) {
      violations.push(`§7 must contain exactly 22 concern rows, found ${concerns.length}`);
    }
    if (new Set(concerns.map((concern) => concern.id)).size !== concerns.length) {
      violations.push("§7 concern ids must be unique");
    }

    const campaignGateOrder = ["G0", "G1", "G2", "G3", "G4", "G5", "G5A", "G6"] as const;
    const gates = new Map(
      gateSection
        .split(/\r?\n/)
        .filter((line) => /^\| G(?:5A|[0-6]) \|/.test(line))
        .map((line) => {
          const cells = tableCells(line);
          return [cells[0] ?? "", {
            status: cells[2] ?? "",
            evidence: cells[3] ?? "",
          }] as const;
        }),
    );
    if (
      gates.size !== campaignGateOrder.length ||
      campaignGateOrder.some((gateId) => !gates.has(gateId))
    ) {
      violations.push("§18 must contain exactly G0-G5, G5A and G6");
    }

    const pairRows = pairSection
      .split(/\r?\n/)
      .filter((line) => /^\| A\d{2} \|/.test(line))
      .map((line) => {
        const cells = tableCells(line);
        return {
          id: cells[0] ?? "",
          concerns: cells[1] ?? "",
          R1: cells[2] ?? "",
          R2: cells[3] ?? "",
          DESIGN: cells[4] ?? "",
          PLAN: cells[5] ?? "",
        };
      });
    const expectedPairIds = Array.from({ length: 11 }, (_, index) =>
      `A${String(index + 1).padStart(2, "0")}`
    );
    if (pairRows.length !== expectedPairIds.length) {
      violations.push(`§8.4 must contain exactly 11 pair rows, found ${pairRows.length}`);
    }
    if (new Set(pairRows.map((pair) => pair.id)).size !== pairRows.length) {
      violations.push("§8.4 pair ids must be unique");
    }
    for (const pairId of expectedPairIds) {
      if (!pairRows.some((pair) => pair.id === pairId)) {
        violations.push(`§8.4 missing pair row ${pairId}`);
      }
    }

    const revalidationBoundary = source.lastIndexOf(
      "CURRENT REVALIDATION EVIDENCE START — G-F06/G-F07/G-F08",
    );
    const currentAuditSource =
      revalidationBoundary >= 0 ? source.slice(revalidationBoundary) : source;
    // Campaign-level evidence reuse is not a new lifecycle or approval state.
    // The exact current input snapshot and unchanged original audit bodies are
    // bound once, independently of final exact-package R3/Approval.
    const retainedAuditIds = new Set<string>();
    const reuseHeading = "#### Current delta reuse binding";
    const reuseSection = pairSection.split(reuseHeading)[1] ?? "";
    const auditRecord = (id: string): string | null => {
      const isAlign = id.startsWith("ALIGN-");
      const auditSource = isAlign ? alignSection : currentAuditSource;
      const kind = isAlign ? "ALIGN" : "PAIR";
      const startToken = kind + " AUDIT START: " + id;
      const endToken = kind + " AUDIT END: " + id;
      if (auditSource.split(startToken).length !== 2 || auditSource.split(endToken).length !== 2) return null;
      const start = auditSource.indexOf(startToken);
      const end = auditSource.indexOf(endToken, start + startToken.length);
      return start >= 0 && end >= 0 ? auditSource.slice(start, end + endToken.length) : null;
    };
    const hashBlob = (bytes: Buffer): string =>
      createHash("sha1").update("blob " + bytes.length + "\0").update(bytes).digest("hex");
    const hasCurrentAuthorization = /^\*\*Current (?:normal authorization: T1 only|bounded authorization: IA27\/IA28 only)\.\*\*$/m.test(source);
    if (reuseSection === "" && (hasCurrentAuthorization || gates.get("G6")?.status === "PASS")) {
      violations.push("current readiness/authorization requires exact reviewed input and audit binding");
    }
    if (reuseSection !== "") {
      const bindingErrors: string[] = [];
      if (pairSection.split(reuseHeading).length !== 2) bindingErrors.push("one current delta reuse binding required");
      const priorCommit = reuseSection.match(/\*\*Prior reviewed commit:\*\* `([0-9a-f]{40})`/)?.[1];
      const reviewCommit = reuseSection.match(/\*\*Impact review baseline:\*\* `([0-9a-f]{40})`/)?.[1];
      const inputBlob = reuseSection.match(/\*\*Reviewed input snapshot blob:\*\* `([0-9a-f]{40})`/)?.[1];
      const evidenceBlob = reuseSection.match(/\*\*Retained audit evidence blob:\*\* `([0-9a-f]{40})`/)?.[1];
      if (!priorCommit || !reviewCommit || !inputBlob || !evidenceBlob) {
        bindingErrors.push("delta reuse requires exact prior/review commits and input/evidence blob identities");
      }
      const allowedAuditIds = new Set([
        ...["R1", "R2", "DESIGN", "PLAN"].flatMap((phase) => expectedPairIds.map((id) => phase + "-" + id)),
        ...expectedPairIds.map((id) => "ALIGN-" + id),
      ]);
      const proposedIds = new Set<string>();
      for (const line of reuseSection.split(/\r?\n/).filter((line) => /^\| (?:R1|R2|DESIGN|PLAN|ALIGN)-A\d{2}/.test(line))) {
        const [ids, rationale] = tableCells(line);
        if (!rationale || rationale.trim().length < 30) bindingErrors.push("retained audits require explicit impact rationale");
        for (const id of (ids ?? "").split(",").map((item) => item.trim())) {
          if (!allowedAuditIds.has(id) || proposedIds.has(id)) bindingErrors.push("invalid/duplicate retained audit: " + id);
          proposedIds.add(id);
        }
      }
      if (proposedIds.size === 0) bindingErrors.push("empty reuse binding");
      const evidenceParts: string[] = [];
      for (const id of [...proposedIds].sort()) {
        const record = auditRecord(id);
        if (record === null || !/Verdict:\*{0,2}\s*`?PASS`?/i.test(record)) {
          bindingErrors.push("retained audit lacks original PASS record: " + id);
          continue;
        }
        const status = id.startsWith("ALIGN-")
          ? alignSection.split(/\r?\n/).find((line) => line.startsWith("| " + id + " |"))?.split("|")[2]?.trim()
          : pairRows.find((row) => row.id === id.slice(-3))?.[id.slice(0, -4) as "R1" | "R2" | "DESIGN" | "PLAN"];
        if (status !== "PASS") bindingErrors.push("retained audit must still be PASS in its sole register: " + id);
        evidenceParts.push(id + "\n" + record + "\n");
      }
      const actualEvidence = hashBlob(Buffer.from(evidenceParts.join(""), "utf8"));
      if (actualEvidence !== evidenceBlob) bindingErrors.push("retained original audit evidence changed: expected " + actualEvidence);
      try {
        if (!inputBlob) throw new Error("missing exact reviewed input digest");
        verifyCampaignReviewedInputs(repositoryRoot, campaignPlanPath, inputBlob,
          campaignGateOrder.every((id) => gates.get(id)?.status === "PASS"));
      } catch (error) {
        bindingErrors.push("cannot establish exact reviewed baseline/candidate fitness: " + String(error));
      }
      if (bindingErrors.length === 0) for (const id of proposedIds) retainedAuditIds.add(id);
      violations.push(...bindingErrors);
    }

    const phaseNames = ["R1", "R2", "DESIGN", "PLAN"] as const;
    for (const phase of phaseNames) {
      for (const [index, pair] of pairRows.entries()) {
        const status = pair[phase];
        const auditId = `${phase}-${pair.id}`;
        if (status === "PASS" && !retainedAuditIds.has(auditId) && index > 0 && pairRows[index - 1]?.[phase] !== "PASS") {
          violations.push(
            `${phase}-${pair.id} PASS requires prior pair ${phase}-${pairRows[index - 1]?.id} PASS`,
          );
        }
        if (status !== "PASS") continue;
        const startToken = `PAIR AUDIT START: ${auditId}`;
        const endToken = `PAIR AUDIT END: ${auditId}`;
        const startCount = currentAuditSource.split(startToken).length - 1;
        const endCount = currentAuditSource.split(endToken).length - 1;
        const start = currentAuditSource.indexOf(startToken);
        const end = currentAuditSource.indexOf(endToken, start + startToken.length);
        if (startCount !== 1 || endCount !== 1 || start < 0 || end < 0) {
          violations.push(
            `${auditId} PASS requires exactly one current mandatory pair-audit record; starts=${startCount}, ends=${endCount}`,
          );
          continue;
        }
        const record = currentAuditSource.slice(start, end + endToken.length + 400);
        const checks = [
          ["exact baseline", /Exact baseline:/i],
          ["repository commit", /repository commit:\s*`?[0-9a-f]{40}`?/i],
          ["artifact hashes/SHAs", /artifact hashes\/SHAs:\s*[^\n]*[0-9a-f]{40}/i],
          ["detailed checks", /Detailed checks:/i],
          ["general checklist PASS", /general checklist:[^\n]*PASS/i],
          ["phase-specific checklist PASS", /phase-specific checklist:[^\n]*PASS/i],
          ["cross-concern interface PASS", /cross-concern interface:[^\n]*PASS/i],
          ["reused-material revalidation PASS", /reused-material revalidation:[^\n]*PASS/i],
          ["findings", /Findings:/i],
          ["reopened concerns", /Reopened concerns:/i],
          ["unproven items", /Unproven items:/i],
          ["verdict PASS", /Verdict:\*{0,2}\s*`?PASS`?/i],
          ["next-pair authorization", /Next (?:pair|R1 pair) authorized:\*{0,2}\s*(?:YES|NO)/i],
        ] as const;
        for (const [label, pattern] of checks) {
          if (!pattern.test(record)) {
            violations.push(`${auditId} PASS record missing ${label}`);
          }
        }
        const expectedPairArtifacts: readonly (readonly [string, string])[] = [
          ["research", exactAlignPackageBlobs.get("R1")!],
          ...(phase === "R1" ? [] : [["requirements", exactAlignPackageBlobs.get("R2")!] as const]),
          ...((phase === "DESIGN" || phase === "PLAN")
            ? [["design", exactAlignPackageBlobs.get("DESIGN")!] as const]
            : []),
          ...(phase === "PLAN" ? [["plan", exactAlignPackageBlobs.get("PLAN")!] as const] : []),
        ];
        for (const [artifact, expectedBlob] of expectedPairArtifacts) {
          const match = record.match(
            new RegExp(artifact + "=`([0-9a-f]{40})`", "i"),
          );
          if (!match || (!retainedAuditIds.has(auditId) && match[1] !== expectedBlob)) {
            violations.push(
              auditId + " PASS must bind current " + artifact +
                " blob " + expectedBlob + "; found " + (match?.[1] ?? "missing"),
            );
          }
        }
      }
    }

    const alignRows = alignSection
      .split(/\r?\n/)
      .filter((line) => /^\| ALIGN-(?:A\d{2}|H1) \|/.test(line))
      .map((line) => {
        const cells = tableCells(line);
        return {
          id: cells[0] ?? "",
          status: cells[1] ?? "",
          evidence: cells[2] ?? "",
        };
      });
    const expectedAlignIds = [
      ...Array.from({ length: 11 }, (_, index) =>
        "ALIGN-A" + String(index + 1).padStart(2, "0")
      ),
      "ALIGN-H1",
    ];
    if (
      alignRows.length !== expectedAlignIds.length ||
      expectedAlignIds.some((id) => !alignRows.some((row) => row.id === id))
    ) {
      violations.push("§13A must contain exactly ALIGN-A01-A11 and ALIGN-H1 current status rows");
    }
    const alignById = new Map(alignRows.map((row) => [row.id, row] as const));
    const allowedAlignStatuses = new Set([
      "NOT_STARTED", "IN_REVIEW", "PASS", "FAIL", "BLOCKED", "REVALIDATION",
    ]);
    for (const row of alignRows) {
      if (!allowedAlignStatuses.has(row.status)) {
        violations.push(row.id + " has invalid ALIGN status: " + row.status);
      }
    }
    for (let index = 0; index < 11; index += 1) {
      const id = expectedAlignIds[index]!;
      if (alignById.get(id)?.status !== "PASS" || retainedAuditIds.has(id)) continue;
      if (index > 0) {
        const prior = expectedAlignIds[index - 1]!;
        if (alignById.get(prior)?.status !== "PASS") {
          violations.push(id + " PASS requires " + prior + " PASS");
        }
      }
    }
    if (
      alignById.get("ALIGN-H1")?.status === "PASS" &&
      expectedAlignIds.slice(0, 11).some((id) => alignById.get(id)?.status !== "PASS")
    ) {
      violations.push("ALIGN-H1 PASS requires ALIGN-A01-A11 PASS");
    }

    for (const row of alignRows) {
      if (row.status !== "PASS" && row.status !== "FAIL") continue;
      const startToken = "ALIGN AUDIT START: " + row.id;
      const endToken = "ALIGN AUDIT END: " + row.id;
      const startCount = alignSection.split(startToken).length - 1;
      const endCount = alignSection.split(endToken).length - 1;
      const start = alignSection.indexOf(startToken);
      const end = alignSection.indexOf(endToken, start + startToken.length);
      if (startCount !== 1 || endCount !== 1 || start < 0 || end < 0) {
        violations.push(
          row.id + " " + row.status +
            " requires exactly one current ALIGN audit record; starts=" +
            startCount + ", ends=" + endCount,
        );
        continue;
      }
      const record = alignSection.slice(start, end + endToken.length + 500);
      const requiredRecordPatterns: readonly [string, RegExp][] = [
        ["repository baseline", /Repository evidence baseline:\*\*\s*`[0-9a-f]{40}`/i],
        ["R1 blob", /R1 blob:\*\*\s*`[0-9a-f]{40}`/i],
        ["R2 blob", /R2 blob:\*\*\s*`[0-9a-f]{40}`/i],
        ["DESIGN blob", /DESIGN blob:\*\*\s*`[0-9a-f]{40}`/i],
        ["PLAN blob", /PLAN blob:\*\*\s*`[0-9a-f]{40}`/i],
        ["P3 Workbench blob", /P3 Workbench blob:\*\*\s*`[0-9a-f]{40}`/i],
        ["P4 Workbench blob", /P4 Workbench blob:\*\*\s*`[0-9a-f]{40}`/i],
        ["atomic vertical matrix", /Atomic vertical matrix/i],
        ["reverse trace", /Reverse trace/i],
        ["cross-domain imports\/exports", /Cross-domain imports\/exports/i],
        ["quality summary", /Quality summary/i],
        ["findings", /Findings:/i],
        ["failure route", /Failure route:/i],
      ];
      for (const [label, pattern] of requiredRecordPatterns) {
        if (!pattern.test(record)) {
          violations.push(row.id + " " + row.status + " record missing " + label);
        }
      }
      for (const [label, expectedBlob] of exactAlignPackageBlobs) {
        const match = record.match(
          new RegExp("\\*\\*" + label + " blob:\\*\\*\\s*`([0-9a-f]{40})`", "i"),
        );
        if (!match || (!(row.status === "PASS" && retainedAuditIds.has(row.id)) && match[1] !== expectedBlob)) {
          violations.push(
            row.id + " " + row.status + " must bind current " + label +
              " blob " + expectedBlob + "; found " + (match?.[1] ?? "missing"),
          );
        }
      }
      if (!record.includes("**Verdict:** `" + row.status + "`")) {
        violations.push(row.id + " record verdict does not match current status " + row.status);
      }
      if (row.status === "PASS") {
        for (let quality = 1; quality <= 12; quality += 1) {
          const qPattern = new RegExp(
            "\\| Q" + quality + "[^|]*\\|\\s*PROVEN\\s*\\|",
            "i",
          );
          if (!qPattern.test(record)) {
            violations.push(row.id + " PASS requires Q" + quality + " PROVEN");
          }
        }
      }
    }

    if (
      gates.get("G5A")?.status === "PASS" &&
      expectedAlignIds.some((id) => alignById.get(id)?.status !== "PASS")
    ) {
      violations.push("G5A PASS requires ALIGN-A01-A11 and ALIGN-H1 PASS");
    }

    if (gates.get("G6")?.status === "PASS") {
      const readinessPath = join(campaignDirectory, "readiness-review.md").replaceAll("\\", "/");
      const readiness = sourceText(readinessPath);
      if (!/## Readiness verdict[\s\S]{0,160}`READY_FOR_SIGNOFF`/i.test(readiness)) {
        violations.push("G6 PASS requires current R3 readiness-review verdict READY_FOR_SIGNOFF");
      }
      for (const [label, expectedBlob] of exactAlignPackageBlobs) {
        const match = readiness.match(
          new RegExp("\\*\\*" + label + " blob:\\*\\*\\s*`([0-9a-f]{40})`", "i"),
        );
        if (match?.[1] !== expectedBlob) {
          violations.push(
            "G6 PASS readiness-review must bind current " + label +
              " blob " + expectedBlob + "; found " + (match?.[1] ?? "missing"),
          );
        }
      }
      if (!readiness.includes("GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1")) {
        violations.push("G6 PASS readiness-review must explicitly apply the P0 bounded-realization ordering");
      }
      if (!source.includes("R3/G6 `READY_FOR_SIGNOFF`") && !source.includes("R3/G6 READY_FOR_SIGNOFF")) {
        violations.push("campaign must state that bounded IA27/IA28 realization is downstream of R3/G6 READY_FOR_SIGNOFF");
      }
    }

    for (
      const entry of readdirSync(join(repositoryRoot, campaignDirectory), {
        withFileTypes: true,
      })
    ) {
      if (
        !entry.isFile() ||
        !entry.name.endsWith(".md") ||
        entry.name === "0.6.0-design-campaign-plan.md"
      ) {
        continue;
      }
      const siblingPath = join(campaignDirectory, entry.name).replaceAll("\\", "/");
      const sibling = sourceText(siblingPath);
      if (/^\| G5A \|/m.test(sibling) || /ALIGN AUDIT START:\s*ALIGN-/m.test(sibling)) {
        violations.push(siblingPath + ": competing ALIGN/G5A campaign progression projection");
      }
    }

    const gatePairPhase = [
      ["G2", "R1"],
      ["G3", "R2"],
      ["G4", "DESIGN"],
      ["G5", "PLAN"],
    ] as const;
    for (const [gateId, phase] of gatePairPhase) {
      if (gates.get(gateId)?.status === "PASS") {
        const unresolved = pairRows.filter((pair) => pair[phase] !== "PASS");
        if (unresolved.length > 0) {
          violations.push(
            `${gateId} PASS requires all ${phase} pair audits PASS; unresolved: ${unresolved.map((pair) => pair.id).join(", ")}`,
          );
        }
      }
    }
    for (const [rank, gateId] of campaignGateOrder.entries()) {
      if (rank === 0 || gates.get(gateId)?.status !== "PASS") continue;
      const missingPrior = campaignGateOrder
        .slice(0, rank)
        .find((prior) => gates.get(prior)?.status !== "PASS");
      if (missingPrior !== undefined) {
        violations.push(`${gateId} PASS requires all prior campaign gates PASS; first missing: ${missingPrior}`);
      }
    }

    const inProgressGates = [...gates.entries()]
      .filter(([, gate]) => gate.status === "IN_PROGRESS")
      .map(([id]) => id);
    if (inProgressGates.length > 1) {
      violations.push("at most one campaign gate may be IN_PROGRESS");
    }
    for (const gateId of inProgressGates) {
      const rank = campaignGateOrder.indexOf(gateId as typeof campaignGateOrder[number]);
      if (rank < 0) continue;
      const missingPrior = campaignGateOrder
        .slice(0, rank)
        .find((prior) => gates.get(prior)?.status !== "PASS");
      if (missingPrior !== undefined) {
        violations.push(`${gateId} may be IN_PROGRESS only after all prior gates PASS; first missing: ${missingPrior}`);
      }
    }

    const g2 = gates.get("G2");
    const activeR1 = concerns.filter((concern) => concern.r1 === "IN_REVIEW");
    const blockedR1 = concerns.filter((concern) =>
      concern.r1 === "BLOCKED" || concern.r1 === "REVALIDATION"
    );
    if (g2?.status === "IN_PROGRESS") {
      if (activeR1.length > 1) {
        violations.push("G2 IN_PROGRESS permits at most one active R1 concern");
      }
      if (activeR1.length === 0 && blockedR1.length === 0) {
        violations.push("G2 IN_PROGRESS requires one active R1 concern or an explicit blocked/revalidation owner");
      }
    }
    if (g2?.status === "PASS") {
      const unresolved = concerns.filter(
        (concern) => !["FACTS_CLOSED", "GAP_FOUND"].includes(concern.r1),
      );
      if (unresolved.length > 0) {
        violations.push(
          "G2 PASS requires every R1 concern factually closed; unresolved: " +
            unresolved.map((concern) => concern.id).join(", "),
        );
      }
    }

    const phasedConcernChecks = [
      { gate: "G3", field: "r2", closed: "FUNCTIONAL_CLOSED", label: "R2" },
      { gate: "G4", field: "design", closed: "TECHNICAL_CLOSED", label: "DESIGN" },
      { gate: "G5", field: "plan", closed: "PLAN_COVERED", label: "PLAN" },
    ] as const;

    for (const check of phasedConcernChecks) {
      const gate = gates.get(check.gate);
      const active = concerns.filter((concern) => concern[check.field] === "IN_REVIEW");
      const blocked = concerns.filter((concern) =>
        concern[check.field] === "BLOCKED" || concern[check.field] === "REVALIDATION"
      );
      if (gate?.status === "IN_PROGRESS") {
        if (active.length > 1) {
          violations.push(
            `${check.gate} IN_PROGRESS permits at most one active ${check.label} concern`,
          );
        }
        if (active.length === 0 && blocked.length === 0) {
          violations.push(
            `${check.gate} IN_PROGRESS requires one active ${check.label} concern or an explicit blocked/revalidation owner`,
          );
        }
      }
      if (gate?.status === "PASS") {
        const unresolved = concerns.filter(
          (concern) => concern[check.field] !== check.closed,
        );
        if (unresolved.length > 0) {
          violations.push(
            `${check.gate} PASS requires every concern ${check.closed}; unresolved: ` +
              unresolved.map((concern) => concern.id).join(", "),
          );
        }
      }
    }

    const g0 = gates.get("G0");
    const baseline = g0?.evidence.match(/baseline `([0-9a-f]{40})`/)?.[1] ?? null;
    if (g0?.status === "PASS") {
      if (baseline === null) {
        violations.push("G0 PASS requires one exact full 40-character baseline SHA in §18");
      } else {
        let campaignIntegratedOnDefaultBranch = false;
        try {
          const sharedDefaultAncestor = execFileSync(
            "git",
            ["merge-base", "refs/remotes/origin/master", "HEAD"],
            { cwd: repositoryRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
          ).trim();
          execFileSync(
            "git",
            ["cat-file", "-e", `${sharedDefaultAncestor}:${campaignPlanPath}`],
            { cwd: repositoryRoot, stdio: "pipe" },
          );
          campaignIntegratedOnDefaultBranch = true;
        } catch {
          try {
            campaignIntegratedOnDefaultBranch =
              execFileSync(
                "git",
                ["branch", "--show-current"],
                { cwd: repositoryRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
              ).trim() === "master";
          } catch {
            campaignIntegratedOnDefaultBranch = false;
          }
        }

        if (!campaignIntegratedOnDefaultBranch) {
          try {
            execFileSync(
              "git",
              ["merge-base", "--is-ancestor", baseline, "HEAD"],
              { cwd: repositoryRoot, stdio: "pipe" },
            );
          } catch {
            violations.push(
              `G0 PASS baseline ${baseline} must be an ancestor of the pre-delivery campaign HEAD`,
            );
          }
        }
        if (
          existsSync(join(repositoryRoot, campaignLedgerPath)) &&
          !sourceText(campaignLedgerPath).includes(baseline)
        ) {
          violations.push("G1 coverage ledger must record the exact current G0 baseline SHA");
        }
      }
      const openFoundationFinding = source
        .split(/\r?\n/)
        .some((line) => line.startsWith("| ") && line.includes("| OPEN_FOUNDATION |"));
      if (openFoundationFinding) {
        violations.push("G0 PASS is illegal while an OPEN_FOUNDATION finding remains");
      }
    }

    expect(violations).toEqual([]);
  });

  it("enforces exhaustive 0.6.0 semantic traceability package structure", () => {
    const workItemRoot =
      "docs/order/work-items/work_0f6d97bf-5c9e-4ed7-8f4c-2dd8806d4a21";
    const requirementsPath = workItemRoot + "/requirements.md";
    if (!existsSync(join(repositoryRoot, requirementsPath))) return;

    const researchPath = workItemRoot + "/research.md";
    const designPath = workItemRoot + "/solution-design.md";
    const planPath = workItemRoot + "/implementation-plan.md";
    const campaignPath = workItemRoot + "/0.6.0-design-campaign-plan.md";
    const phasePaths = [
      "implementation-plan/00-governance.md",
      "implementation-plan/01-a01-lifecycle-product.md",
      "implementation-plan/02-a02-governance-intake.md",
      "implementation-plan/03-a03-queue-source.md",
      "implementation-plan/04-a04-workbench-research.md",
      "implementation-plan/05-a05-requirements-design.md",
      "implementation-plan/06-a06-plan-readiness.md",
      "implementation-plan/07-a07-approval-execution.md",
      "implementation-plan/08-a08-complete-materials.md",
      "implementation-plan/09-a09-provider-settings.md",
      "implementation-plan/10-a10-recovery-accessibility.md",
      "implementation-plan/11-a11-component-certification.md",
      "implementation-plan/12-action-catalog.md",
      "implementation-plan/13-verification-closeout.md",
    ] as const;
    const semanticPhasePaths = phasePaths.filter((path) =>
      /\/\d{2}-a\d{2}-/.test(path),
    );

    // The inventory follows prospective canonical authority, not the current runtime enum.
    const coverageLedger = sourceText(workItemRoot + "/0.6.0-concern-coverage-ledger.md");
    const lifecycleStageSection = coverageLedger.split("## 6. Lifecycle-stage coverage")[1]?.split("## 7.")[0] ?? "";
    const canonicalStageGrammar = sourceText("docs/contracts/canonical-contracts.md").match(/type WorkStage =([\s\S]*?);/)?.[1] ?? "";
    const coveredStages = [...lifecycleStageSection.matchAll(/^\| ([A-Z][A-Z0-9_]*)(?: \/ [^|]+)? \|/gm)].map((match) => match[1]);
    const canonicalStages = [...canonicalStageGrammar.matchAll(/"([A-Z0-9_]+)"/g)].map((match) => match[1]);
    expect(canonicalStages.length).toBeGreaterThan(0);
    expect(coveredStages).toEqual(canonicalStages);

    const requirements = sourceText(requirementsPath);
    const research = sourceText(researchPath);
    const design = sourceText(designPath);
    const p3Workbench = sourceText("docs/requirements/workbench.md");
    const p4Workbench = sourceText("docs/architecture/workbench.md");
    const plan = sourceText(planPath);
    const campaign = sourceText(campaignPath);
    const ciWorkflow = sourceText(".github/workflows/ci.yml");
    const browserSpec = sourceText("tests/browser.spec.ts");
    const g5Status = campaign.match(
      /^\| G5 \|[^\n]*\| (PASS|IN_PROGRESS|BLOCKED|REVALIDATION|NOT_STARTED) \|/m,
    )?.[1] ?? null;
    const violations: string[] = [];
    if (g5Status === null) {
      violations.push("campaign G5 status is not structurally readable");
    }

    const diagnosticWorkflowTokens = [
      "Record current-state diagnostic candidate",
      "diagnostic current-state rendered evidence",
      'PONTIVUS_ORDER_RENDERED_EVIDENCE_KIND: "diagnostic_current_state"',
      'rendered-diagnostic-current-state-${{ steps.diagnostic_candidate.outputs.sha }}',
      "Validate current-state diagnostic completeness",
      // The diagnostic mode proves the actual current runtime, never target fixtures.
      // IA39 updates the capture dispatch/count atomically with the native stage.
      sourceText("src/core/contracts.ts").split("export const WorkStatusSchema")[0].includes('"AWAITING_ACCEPTANCE"')
        ? "diagnostic surface coverage must be 38" : "diagnostic surface coverage must be 37",
      "Resolve bounded evidence authorization",
      "Current bounded authorization:",
      "steps.bounded_authorization.outputs.active == 'true'",
      'PONTIVUS_ORDER_RENDERED_EVIDENCE_KIND: "bounded_phase_acceptance"',
      'PONTIVUS_ORDER_RENDERED_EVIDENCE_KIND: "ia26_acceptance"',
    ] as const;
    for (const token of diagnosticWorkflowTokens) {
      if (!ciWorkflow.includes(token)) {
        violations.push("CI rendered-evidence control missing: " + token);
      }
    }
    const diagnosticIndex = ciWorkflow.indexOf("- name: diagnostic current-state rendered evidence");
    const browserIndex = ciWorkflow.indexOf("- name: browser");
    if (diagnosticIndex < 0 || browserIndex < 0 || diagnosticIndex >= browserIndex) {
      violations.push("current-state diagnostic evidence must run before the ordinary browser gate");
    }
    for (const token of [
      "diagnostic_current_state",
      "evidenceKind: renderedEvidenceKind",
      "rendered evidence kind changed within one evidence run",
      "full application viewport",
      "diagnostic-application-wide-light-account-required",
      "diagnostic-application-settings-wide-light",
      "diagnostic-application-settings-narrow-light",
      "diagnostic-application-workitem-wide-light",
      "diagnostic-application-workitem-medium-light",
      "diagnostic-application-workitem-narrow-light",
    ]) {
      if (!browserSpec.includes(token)) {
        violations.push("browser diagnostic corpus contract missing: " + token);
      }
    }

    const duplicates = (values: readonly string[]): readonly string[] => {
      const seen = new Set<string>();
      const duplicate = new Set<string>();
      for (const value of values) {
        if (seen.has(value)) duplicate.add(value);
        seen.add(value);
      }
      return [...duplicate].sort();
    };
    const exactSet = (
      label: string,
      actual: readonly string[],
      expected: readonly string[],
    ): void => {
      const actualSet = new Set(actual);
      const expectedSet = new Set(expected);
      const missing = [...expectedSet].filter((value) => !actualSet.has(value)).sort();
      const extra = [...actualSet].filter((value) => !expectedSet.has(value)).sort();
      const duplicate = duplicates(actual);
      if (missing.length > 0 || extra.length > 0 || duplicate.length > 0) {
        violations.push(
          label +
            " set mismatch: missing=[" +
            missing.join(",") +
            "] extra=[" +
            extra.join(",") +
            "] duplicate=[" +
            duplicate.join(",") +
            "]",
        );
      }
    };
    const gitBlobSha = (path: string): string => {
      const bytes = readFileSync(join(repositoryRoot, path));
      return createHash("sha1")
        .update("blob " + bytes.length + "\0")
        .update(bytes)
        .digest("hex");
    };
    const demoteHeadings = (source: string): string =>
      source
        .split(/\r?\n/)
        .map((line) => {
          const match = line.match(/^(#{1,6})\s+(.*)$/);
          if (match === null) return line;
          return "#".repeat(Math.min(6, match[1].length + 3)) + " " + match[2];
        })
        .join("\n");

    const stableRequirements = [...requirements.matchAll(
      /^\|\s*(GW-FR-[^|]+?)\s*\|\s*(?:REFERENCE|DELTA|LOCAL)\s*\|/gm,
    )].map((match) => match[1]);
    if (stableRequirements.length !== 112) {
      violations.push(
        "G-F10 stable requirement inventory must contain exactly 112 rows; found " +
          stableRequirements.length,
      );
    }
    if (duplicates(stableRequirements).length > 0) {
      violations.push("G-F10 stable requirement inventory contains duplicates");
    }

    const researchRows = [...research.matchAll(
      /^\| `(GW-FR-[^\`]+)` \| C\d{2} \| `[^\`]+` \| .* \| .* \| `(?:CONFORMS|CONFORMS_WITH_DEPENDENCY|CONFORMS_WITH_VERIFICATION_GAP|MIXED|VIOLATES|VERIFICATION_GAP)` \|/gm,
    )].map((match) => match[1]);
    exactSet("R1 stable evidence", researchRows, stableRequirements);
    for (const line of research.split(/\r?\n/)) {
      if (!/^\| `GW-FR-/.test(line)) continue;
      if (!/`(?:C\d{2}-O\d+|DIRECT-FR\d+)`/.test(line)) {
        violations.push("R1 stable evidence row lacks exact evidence reference: " + line);
      }
    }

    const r2EvidenceRows = [...requirements.matchAll(
      /^\| `(GW-FR-[^\`]+)` \| `(?:CONFORMS|CONFORMS_WITH_DEPENDENCY|CONFORMS_WITH_VERIFICATION_GAP|MIXED|VIOLATES|VERIFICATION_GAP)` \|/gm,
    )].map((match) => match[1]);
    exactSet("R2 evidence linkage", r2EvidenceRows, stableRequirements);

    const designRows = [...design.matchAll(
      /^\| `(GW-FR-[^\`]+)` \| ([^|]+) \| `[^\`]+` \| `(POSITIVE_NO_CHANGE|DEPENDENCY_DELTA|TECHNICAL_DELTA|MIXED_TECHNICAL_DELTA|VERIFICATION_DELTA|MIXED_TECHNICAL_AND_VERIFICATION_DELTA)` \| ([^|]+) \|/gm,
    )].map((match) => ({
      requirement: match[1],
      evidence: match[2].trim(),
      disposition: match[3],
      solutions: match[4].trim(),
    }));
    exactSet(
      "DESIGN stable disposition",
      designRows.map((row) => row.requirement),
      stableRequirements,
    );
    for (const row of designRows) {
      if (!/`(?:C\d{2}-O\d+|DIRECT-FR\d+)`/.test(row.evidence)) {
        violations.push(
          "DESIGN row lacks exact R1 evidence: " + row.requirement,
        );
      }
      if (
        row.disposition === "POSITIVE_NO_CHANGE" &&
        row.solutions !== "—"
      ) {
        violations.push(
          "POSITIVE_NO_CHANGE must not carry an implementation solution: " +
            row.requirement,
        );
      }
      if (
        row.disposition !== "POSITIVE_NO_CHANGE" &&
        !/`SD\d{2}`/.test(row.solutions) && !/\bQA[1-6]\b/.test(row.solutions)
      ) {
        violations.push(
          "DESIGN delta must identify at least one SD or canonical QA solution: " +
            row.requirement,
        );
      }
    }

    for (const qa of ["QA1","QA2","QA3","QA4","QA5","QA6"]) {
      if (!design.includes("### " + qa + " —")) violations.push("missing exact Acceptance solution " + qa);
    }
    const designAtoms = [...design.matchAll(/^\| `(PL-C[^\`]+)` \|/gm)].map(
      (match) => match[1],
    );
    if (designAtoms.length !== 27 || duplicates(designAtoms).length > 0) {
      violations.push(
        "DESIGN package-local atom inventory must be 27 unique rows; found " +
          designAtoms.length,
      );
    }
    if (!designAtoms.includes("PL-C12-02")) {
      violations.push("DESIGN must trace current R2 package-local consequence PL-C12-02");
    }
    for (const atom of ["PL-C19-02", "PL-C20-03"]) {
      if (!designAtoms.includes(atom)) {
        violations.push("DESIGN must trace rendered-reconstruction package atom " + atom);
      }
    }

    const detailedSurfaceContract =
      design.split("##### Detailed SURF contracts")[1]?.split(
        "##### Cross-surface action and placement laws",
      )[0] ?? "";
    const detailedSurfaceIds = [...detailedSurfaceContract.matchAll(
      /^#{5,6} (SURF-[A-Z0-9-]+)(?:\s|$)/gm,
    )].map((match) => match[1]);
    if (
      detailedSurfaceIds.length !== 38 ||
      duplicates(detailedSurfaceIds).length > 0
    ) {
      violations.push(
        "DESIGN detailed information contract must contain 38 unique SURF sections; found " +
          detailedSurfaceIds.length,
      );
    }
    for (const forbidden of [
      "| canonical records |",
      "| exact records |",
      "| package records |",
      "| account/provider records |",
      "| model records |",
    ]) {
      if (detailedSurfaceContract.includes(forbidden)) {
        violations.push(
          "DESIGN detailed information contract retains non-field-exact source cell " +
            forbidden,
        );
      }
    }
    for (const required of [
      "Refresh sources",
      "Settings navigation / Back to queue",
      "resolved repository-relative WorkItem documentation root",
      "WorkItemSourceDiagnostic.path",
      "WorkItemSourceSnapshot.metadata.projectId",
      "upstream-return/staleness consequence before Save",
      "ARTIFACT_PROPOSAL_CREATED.targetPath/baseSha256/authorityLayer",
      "changeSurface forecast",
      "Run.role/attempt/status/startedAt/endedAt",
      "WorkItemDocumentationGitPathStatus.repositoryPath/state",
    ]) {
      if (!detailedSurfaceContract.includes(required)) {
        violations.push(
          "DESIGN detailed information contract missing required field/action closure " +
            required,
        );
      }
    }
    for (const requiredR2 of [
      "resolved repository-relative WorkItem documentation root is default-visible supporting task context",
      "diagnostic's source path is ordinary operator information",
      "current repository path and WorkItem directory are available as Supporting orientation in the one named details disclosure closed by default after the canvas",
      "Each connected-repository entry default-visibly shows project identity",
    ]) {
      if (!requirements.includes(requiredR2)) {
        violations.push(
          "R2 information-visibility correction missing " + requiredR2,
        );
      }
    }

    // Markdown P3 §10 owns Document information availability, not a permanently open facts band.
    const markdownWorkbench = sourceText("docs/requirements/markdown-workbench.md");
    if (!markdownWorkbench.includes("one specifically named details disclosure closed by default after the document")) {
      violations.push("Markdown Workbench P3 document-location disclosure authority must be reconciled before changing the R2 projection");
    }
    if (requirements.includes("current repository path is default-visible supporting document identity")) {
      violations.push("R2 must not reintroduce an always-open document-location facts band");
    }

    for (const forbiddenP3 of [
      "Review owns currentness, summary/body and decisions",
      "WorkbenchToolbar({ start, end })",
      "projectContext?: { label, onSelect? }",
      "WorkbenchMasterDetail({ master, detail, masterLabel })",
    ]) {
      if (p3Workbench.includes(forbiddenP3) || p4Workbench.includes(forbiddenP3)) {
        violations.push(
          "current Workbench authority retains superseded open-ended UI contract: " +
            forbiddenP3,
        );
      }
    }
    for (const requiredP4Toolbar of [
      "value: string",
      "options: readonly string[]",
      "navigation: { label: \"Settings\" | \"Work queue\"",
      "account.readiness",
      "selected WorkItem may provide static Project context",
    ]) {
      if (!p4Workbench.includes(requiredP4Toolbar)) {
        violations.push("P4 closed application-toolbar contract missing: " + requiredP4Toolbar);
      }
    }
    for (const requiredClosedWorld of [
      "A typed field not enumerated for a surface is **not authorized to appear on that surface** merely because the client already has it.",
      "map every rendered datum/action to the corresponding contract row",
      "A missing contract row is not an implementation gap. It is a DESIGN defect and blocks the phase.",
    ]) {
      if (!design.includes(requiredClosedWorld)) {
        violations.push(
          "DESIGN closed-world UI information contract missing: " + requiredClosedWorld,
        );
      }
    }
    for (const required of [
      "visual-language → foundation realization ledger",
      "semantic information hierarchy",
      "interaction-class composition",
      "actions and confirmations",
      "status, notices and states",
      "subordinate expansion and technical inspection",
      "color and theme",
      "typography",
      "spacing, density, geometry and boundaries",
      "responsive composition",
      "accessibility/focus/overlay mechanics",
      "specialized content",
      "may not introduce a recurring color/token",
    ]) {
      if (!design.includes(required)) {
        violations.push(
          "DESIGN SD21 visual-language/foundation contract missing " + required,
        );
      }
    }

    const phaseRequirementRows: { requirement: string; disposition: string }[] = [];
    const phaseAtoms: string[] = [];
    for (const relativePath of semanticPhasePaths) {
      const source = sourceText(workItemRoot + "/" + relativePath);
      for (const match of source.matchAll(
        /^\| `(GW-FR-[^\`]+)` \| [^|]+ \| `([^\`]+)` \|/gm,
      )) {
        phaseRequirementRows.push({
          requirement: match[1],
          disposition: match[2],
        });
      }
      phaseAtoms.push(
        ...[...source.matchAll(/^\| `(PL-C[^\`]+)` \|/gm)].map(
          (match) => match[1],
        ),
      );
      if (source.includes("NO_CODE / IA24")) {
        violations.push(relativePath + " retains prohibited generic no-code disposition");
      }
    }
    exactSet(
      "PLAN phase stable requirement",
      phaseRequirementRows.map((row) => row.requirement),
      stableRequirements,
    );
    if (duplicates(phaseAtoms).length > 0) {
      violations.push("PLAN phase package atom inventory contains duplicates");
    }
    const designDispositionByRequirement = new Map(
      designRows.map((row) => [row.requirement, row.disposition]),
    );
    if (g5Status === "PASS") {
      exactSet("PLAN phase package atom", phaseAtoms, designAtoms);
      for (const row of phaseRequirementRows) {
        if (designDispositionByRequirement.get(row.requirement) !== row.disposition) {
          violations.push(
            "PLAN phase disposition differs from DESIGN for " + row.requirement,
          );
        }
      }
    }

    const actionCatalogPath = workItemRoot + "/implementation-plan/12-action-catalog.md";
    const actionCatalog = sourceText(actionCatalogPath);
    const actionIds = [...actionCatalog.matchAll(/^## (IA\d{2}) —/gm)].map(
      (match) => match[1],
    );
    const expectedActions = Array.from(
      { length: 39 },
      (_, index) => "IA" + String(index + 1).padStart(2, "0"),
    );
    exactSet("PLAN action catalog", actionIds, expectedActions);
    const phaseActionReferences = new Set(
      semanticPhasePaths.flatMap((relativePath) =>
        [...sourceText(workItemRoot + "/" + relativePath).matchAll(/\bIA\d{2}\b/g)].map(
          (match) => match[0],
        ),
      ),
    );
    for (const action of expectedActions.filter(
      (value) => value !== "IA23" && value !== "IA24" && value !== "IA26",
    )) {
      if (!phaseActionReferences.has(action)) {
        violations.push("PLAN action is not referenced by any semantic phase: " + action);
      }
    }
    const closeout = sourceText(
      workItemRoot + "/implementation-plan/13-verification-closeout.md",
    );
    for (const [label, textValue] of [
      ["PLAN action catalog", actionCatalog],
      ["PLAN closeout", closeout],
    ] as const) {
      for (const required of [
        "every rendered datum/action maps to exactly one current DESIGN",
        "missing applicable DESIGN row",
        "returns upstream to DESIGN rather than being inferred",
      ]) {
        if (!textValue.includes(required)) {
          violations.push(label + " does not enforce closed-world rendered schema: " + required);
        }
      }
    }
    for (const action of ["IA23", "IA26", "IA24"]) {
      if (!closeout.includes(action) && !actionCatalog.includes(action)) {
        violations.push("Cross-solution/final action is not governed: " + action);
      }
    }

    const scenarioProofIds = [...closeout.matchAll(/^\| S(\d{2}) \|/gm)].map((match) => match[1]);
    const canonicalScenarioText = p3Workbench.split("## 23. Required certification scenarios")[1]?.split("## 24.")[0] ?? "";
    const canonicalScenarioIds = [...canonicalScenarioText.matchAll(/^(\d+)\. /gm)].map((match) => match[1].padStart(2, "0"));
    exactSet("PLAN P3 certification scenario allocation", scenarioProofIds, canonicalScenarioIds);
    if (duplicates(scenarioProofIds).length > 0) violations.push("PLAN certification scenario allocation contains duplicates");
    const priorityZeroTransitions = [
      "| IA29 | IA16 |",
      "| IA16 | IA31 |",
      "| IA31 | IA30 |",
      "| IA30 | P0.4 HUX-09 / IA20+IA26 targeted fidelity proof |",
      "| P0.4 HUX-09 / IA20+IA26 targeted fidelity proof | IA32 |",
    ] as const;
    let previousPriorityZeroTransition = -1;
    for (const transition of priorityZeroTransitions) {
      const offset = closeout.indexOf(transition);
      if (offset < 0) {
        violations.push("PLAN closeout missing Priority-0 transition: " + transition);
      } else if (offset <= previousPriorityZeroTransition) {
        violations.push("PLAN closeout Priority-0 transition order is stale: " + transition);
      }
      previousPriorityZeroTransition = offset;
    }
    for (const staleTransition of [
      "| IA29 | IA31 |",
      "| IA29 | IA16/IA31 |",
      "| IA29 | IA30 |",
      "| IA30 | IA31 |",
      "| IA31 | IA32 |",
    ]) {
      if (closeout.includes(staleTransition)) {
        violations.push("PLAN closeout retains superseded Priority-0 transition: " + staleTransition);
      }
    }

    const expectedPhasePaths = [...phasePaths].sort();
    const manifestRows = [...plan.matchAll(
      /^\| `(implementation-plan\/[^\`]+)` \| `([0-9a-f]{40})` \|$/gm,
    )].map((match) => ({ path: match[1], sha: match[2] }));
    exactSet(
      "PLAN modular source manifest",
      manifestRows.map((row) => row.path),
      expectedPhasePaths,
    );
    for (const row of manifestRows) {
      const fullPath = workItemRoot + "/" + row.path;
      if (gitBlobSha(fullPath) !== row.sha) {
        violations.push("PLAN modular source blob mismatch: " + row.path);
      }
      const compiledMarker = "### Compiled component: `" + row.path + "`";
      if (!plan.includes(compiledMarker)) {
        violations.push("PLAN root lacks compiled component marker: " + row.path);
      }
      const demoted = demoteHeadings(sourceText(fullPath));
      if (!plan.includes(demoted)) {
        violations.push("PLAN root does not contain exact compiled component: " + row.path);
      }
    }

    const a01Phase = sourceText(
      workItemRoot + "/implementation-plan/01-a01-lifecycle-product.md",
    );
    for (const traceKey of ["A01-NC01", "A01-NC02", "A01-NC03", "A01-NC04", "A01-NC05"]) {
      if (!design.includes("`" + traceKey + "`")) {
        violations.push("DESIGN missing corrected-upstream A01 no-code trace: " + traceKey);
      }
      if (!a01Phase.includes("`" + traceKey + "`")) {
        violations.push("PLAN A01 source missing corrected-upstream no-code trace: " + traceKey);
      }
      if (!plan.includes("`" + traceKey + "`")) {
        violations.push("PLAN root missing compiled corrected-upstream A01 no-code trace: " + traceKey);
      }
    }

    const designSurfaceSection =
      design.split("## Exact implementation surface forecast")[1]?.split(
        "### Explicit retained UI paths outside changeSurface",
      )[0] ?? "";
    const designSurface = [...designSurfaceSection.matchAll(/^- `([^\`]+)`(?:\s+—.*)?$/gm)].map(
      (match) => match[1],
    );
    if (designSurface.length !== 62 || duplicates(designSurface).length > 0) {
      violations.push(
        "DESIGN implementation forecast must contain 62 unique paths; found " +
          designSurface.length,
      );
    }

    // Check each installer proposition in its canonical owner and downstream
    // realization, rather than requiring copied normative prose in DESIGN/PLAN.
    // Exact compiled component bytes and hashes are checked independently above.
    const installerAuthorityP3 = sourceText("docs/requirements/installation-readiness.md");
    const installerAuthorityP4 = sourceText("docs/architecture/technical-architecture.md");
    const installerAuthorityP6 = sourceText("docs/contracts/canonical-contracts.md");
    const installerDesign = design.split("### F7 — productive installer closure (SD19)")[1]?.split("\n### ")[0] ?? "";
    const installerAction = actionCatalog.split("## IA25 — guided productive installer completion")[1]?.split("\n## IA27")[0] ?? "";
    const installerTraces = [
      ["P3 history/readiness", installerAuthorityP3, [
        "Only a complete identified deployment plus an affirmative answer permits established-system recovery",
        "A negative, unknown or blank answer takes the fresh/unproven admission path",
        "explicit committed-but-finalization-incomplete result",
        "Partial installation residue alone never qualifies",
      ]],
      ["P4 classification/transaction", installerAuthorityP4, [
        "Resolve one invocation-local established-installation decision before migration or staging",
        "Do not infer prior completion from liveness, marker, version, timestamps, config, account or database residue",
        "Only explicit y/yes",
        "Remove source-marker publication from staging for all attempts",
        "Before each effect capture the corresponding existing rollback input",
        "systemd inactivity alone cannot establish their absence",
        "exclusive file creation boundary",
        "application and launcher independently",
        "Capture the previous service unit and supported enablement/activity before the first service mutation",
        "Atomically publish the existing source marker at that boundary for fresh and established attempts",
        "Publication failure is pre-commit failure",
        "After successful publication, do not enter the reversible rollback handler",
        "Process interruption before commit is not proof of completion",
        "identify the conflicting canonical paths",
      ]],
      ["P6 authenticated readiness", installerAuthorityP6, [
        "The daemon is the single readiness-policy owner",
        "GET /api/settings/readiness",
        "no other Settings endpoint gains Bearer admission",
        "ready === true",
        "zero blockers",
        "no redirects",
      ]],
      ["SD19 F7 exact realization", installerDesign, [
        "requireFreshInstallerReadiness",
        "GET `/api/settings/readiness`",
        "After `waitForHealthyDaemon`",
        "never the v4 update retain/defer fast path",
        "loginOpenCodeProviderInteractive",
        "relist after login",
        "InstallationReadinessSchema",
        "180 seconds",
        "Remove the staging write in `buildApplication`",
        "same-directory temporary then rename, unchanged source SHA plus newline",
        "Move `retireLegacyGateweftArtifacts`, profile update and backup deletion outside reversible rollback",
        "committed-but-finalization-incomplete and nonzero",
        "confirmed established v3/v4",
        "before live model discovery, login or live root proof",
        "prepareOrderDatabaseForInstall",
        "original error as the first cause",
        "onIncompleteRestore: () => void",
        "do not call the live-root `buildOrderConfig`",
        "For absent config (only ENOENT/null from the strict pathname presence boundary below)",
        "restoreOrderDatabaseAfterFailedInstall",
        "never gates established admission",
        "R3-F01 — fresh/unproven retained recovery",
        "before calling the existing model discovery or login",
        "quiescence unproven",
        "immediately after successful rename and before directory fsync/readback",
        "no callback means no published config effect",
        "REV-F11 — installer-created manifest custody and external-writer boundary",
        "before close or awaited validation",
        "Do not locally delete by pathname or perform a second rollback",
      ]],
      ["IA25 exact execution/proof", installerAction, [
        "one pre-mutation disposition",
        "Remove the staging source-marker write",
        "make the application and launcher moves separately reversible",
        "Capture the unit and service enablement/activity before mutation",
        "reverse only completed legacy namespace moves",
        "separate post-commit cleanup from the rollback handler",
        "invoke the actual `runInstaller` transaction",
        "real filesystem mutations",
        "complete-looking old marker with all files but no affirmative history cannot exempt",
        "available models do not preclude login",
        "inconsistent ready/blockers",
        "Neither fresh nor update publishes during staging/activation",
        "interruption before publish cannot be automatic established proof",
        "no pre-commit rollback, admitted app/launcher/config/service/marker remain",
        "predecessor-conflict rerun stops without mutation",
        "v3→v4 retains exact model/repository/reference fields",
        "primary effect and secondary compensation failure",
        "no sole-copy deletion",
        "no unsafe prior-service restart",
        "exact incomplete-restore callback/flag",
        "confirmed established missing config",
        "failed stop after successful or partial restart",
        "writer failure before rename (no publication; verify original/absence, no restore mutation)",
        "failure after rename before fsync/readback (publication captured)",
        "Present legacy config with external-root ENOENT",
        "in `tests/shell.test.ts` pass the explicit established decision",
        "In `tests/order-migration.test.ts` replace the unconditional-success systemctl stub",
        "`tests/sqlite.test.ts` is not an IA25 mutation owner",
        "partial write/fsync/observation failure before successful return",
        "no deletion of replaced or unproven objects",
        "not universal external-writer detection",
      ]],
    ] as const;
    for (const [owner, source, requiredTokens] of installerTraces) {
      for (const required of requiredTokens) {
        if (!source.includes(required)) {
          violations.push("Installer authority/realization trace missing in " + owner + ": " + required);
        }
      }
    }
    exactSet(
      "IA25 installer transaction proof cases",
      [...installerAction.matchAll(/^\| (INST-\d{2}) /gm)].map((match) => match[1]),
      Array.from({ length: 12 }, (_, index) => "INST-" + String(index + 1).padStart(2, "0")),
    );

    const taskBlocks = [...plan.matchAll(/```order-tasks\n([\s\S]*?)\n```/g)];
    if (taskBlocks.length !== 1) {
      violations.push(
        "PLAN root must contain exactly one order-tasks block; found " +
          taskBlocks.length,
      );
    } else {
      try {
        try {
          admitSignedTaskBlockForSchema("change-v2", parseSignedTaskBlockFromPlan(new TextEncoder().encode(plan)));
        } catch (error) {
          violations.push("PLAN fails canonical signed task admission: " + String(error));
        }
        const parsed = JSON.parse(taskBlocks[0][1]) as {
          tasks?: readonly {
            id?: string;
            objective?: string;
            dependsOn?: readonly string[];
            scope?: readonly string[];
            exclusions?: readonly string[];
            acceptanceRefs?: readonly string[];
            changeSurface?: readonly string[];
            gateIds?: readonly string[];
            authorityRefs?: readonly string[];
            concernIds?: readonly string[];
          }[];
        };
        const tasks = parsed.tasks ?? [];
        if (tasks.length !== 1 || tasks[0]?.id !== "T1") {
          violations.push("PLAN root must define exactly one signed task T1");
        }
        const task = tasks[0];
        if (task !== undefined) {
          exactSet("T1 dependencies", task.dependsOn ?? [], []);
          if ((task.objective ?? "").trim().length === 0) {
            violations.push("T1 objective must be non-empty");
          }
          for (const [field, values] of [
            ["scope", task.scope],
            ["acceptanceRefs", task.acceptanceRefs],
            ["changeSurface", task.changeSurface],
            ["gateIds", task.gateIds],
            ["authorityRefs", task.authorityRefs],
            ["concernIds", task.concernIds],
          ] as const) {
            if ((values ?? []).length === 0) {
              violations.push("T1 " + field + " must be non-empty");
            }
          }
          exactSet(
            "T1 gate union",
            task.gateIds ?? [],
            ["architecture", "browser", "build", "dependency-lock", "test", "typecheck"],
          );
          if ((task.scope ?? []).length !== 62 || duplicates(task.scope ?? []).length > 0) {
            violations.push(
              "T1 hard scope must contain the exact 62 unique forecast paths; found " +
                (task.scope ?? []).length,
            );
          }
          exactSet("T1 hard scope", task.scope ?? [], designSurface);
        }

        const signedSurface = task?.changeSurface ?? [];
        for (const requiredPath of [
          "src/installer.ts",
          "src/shell/setup.ts",
          "src/shell/project.ts",
          "src/shell/sqlite.ts",
          "src/shell/config.ts",
          "tests/shell.test.ts",
          "tests/order-migration.test.ts",
          "src/shell/repository.ts",
          "ui/src/workbench-presentation.ts",
          "tests/e2e-server.ts",
          "docs/references/workbench-ui/reference-atlas.html",
          "docs/references/workbench-ui/reference-manifest.json",
          "docs/references/workbench-ui/README.md",
        ]) {
          if (!signedSurface.includes(requiredPath) || (task?.exclusions ?? []).includes(requiredPath)) {
            violations.push("T1 required semantic/proof owner missing or excluded: " + requiredPath);
          }
        }
        for (const excluded of task?.exclusions ?? []) {
          if ((task?.scope ?? []).includes(excluded)) violations.push("T1 scope overlaps exclusion: " + excluded);
        }
        if (signedSurface.length !== 62 || duplicates(signedSurface).length > 0) {
          violations.push(
            "PLAN signed T1 changeSurface must contain 62 unique paths; found " +
              signedSurface.length,
          );
        }
        exactSet("PLAN signed T1 changeSurface", signedSurface, designSurface);

        const surfaceSection =
          plan.split("## Exact candidate implementation surface")[1]?.split(
            "## Exhaustive traceability invariants",
          )[0] ?? "";
        const documentedSurface = [...surfaceSection.matchAll(/^- \`([^\`]+)\`$/gm)].map(
          (match) => match[1],
        );
        if (documentedSurface.length !== 62 || duplicates(documentedSurface).length > 0) {
          violations.push(
            "PLAN documented candidate surface must contain 62 unique paths; found " +
              documentedSurface.length,
          );
        }
        exactSet("PLAN documented signed surface", documentedSurface, designSurface);

        const retainedAtomicUiPaths = new Set([
          "ui/src/primitives/WorkbenchAction.tsx",
          "ui/src/primitives/WorkbenchDisclosure.tsx",
          "ui/src/primitives/WorkbenchField.tsx",
          "ui/src/primitives/WorkbenchIcon.tsx",
          "ui/src/primitives/WorkbenchNotice.tsx",
          "ui/src/primitives/WorkbenchStatus.tsx",
        ]);
        const retainedUiPaths = new Set([
          "AGENTS.md",
          "pontivus-order.toml",
          "src/shell/file-write.ts",
          "src/shell/opencode.ts",
          "src/shell/process.ts",
          "src/shell/project-config.ts",
          "src/shell/work-item-source.ts",
          "tests/architecture.test.ts",
          "ui/src/ActivityComposer.tsx",
          "ui/src/CreateWorkItem.tsx",
          "ui/src/DocumentChangeView.tsx",
          "ui/src/EvidenceViewer.tsx",
          "ui/src/MarkdownSourceEditor.tsx",
          "ui/src/OpenCodeAccountControl.tsx",
          "ui/src/OpenCodeAccountSettings.tsx",
          "ui/src/ProposalReview.tsx",
          "ui/src/RunEventTimeline.tsx",
          "ui/src/SettingsWorkspace.tsx",
          "ui/src/WorkflowMaterialSelector.tsx",
          "ui/src/WorkflowStepFrame.tsx",
          "ui/src/main.tsx",
          "ui/src/markdown-source-formatting.ts",
          "ui/src/primitives/WorkbenchAction.tsx",
          "ui/src/primitives/WorkbenchAppShell.tsx",
          "ui/src/primitives/WorkbenchAttention.tsx",
          "ui/src/primitives/WorkbenchConfirmation.tsx",
          "ui/src/primitives/WorkbenchContextPanel.tsx",
          "ui/src/primitives/WorkbenchDialogue.tsx",
          "ui/src/primitives/WorkbenchDisclosure.tsx",
          "ui/src/primitives/WorkbenchDocument.tsx",
          "ui/src/primitives/WorkbenchFacts.tsx",
          "ui/src/primitives/WorkbenchField.tsx",
          "ui/src/primitives/WorkbenchForm.tsx",
          "ui/src/primitives/WorkbenchIcon.tsx",
          "ui/src/primitives/WorkbenchIdentity.tsx",
          "ui/src/primitives/WorkbenchLayout.tsx",
          "ui/src/primitives/WorkbenchMasterDetail.tsx",
          "ui/src/primitives/WorkbenchNotice.tsx",
          "ui/src/primitives/WorkbenchRail.tsx",
          "ui/src/primitives/WorkbenchResourceList.tsx",
          "ui/src/primitives/WorkbenchResourceRow.tsx",
          "ui/src/primitives/WorkbenchResult.tsx",
          "ui/src/primitives/WorkbenchReview.tsx",
          "ui/src/primitives/WorkbenchReviewSection.tsx",
          "ui/src/primitives/WorkbenchReviewVerdict.tsx",
          "ui/src/primitives/WorkbenchSection.tsx",
          "ui/src/primitives/WorkbenchSectionHeader.tsx",
          "ui/src/primitives/WorkbenchSelector.tsx",
          "ui/src/primitives/WorkbenchState.tsx",
          "ui/src/primitives/WorkbenchStatus.tsx",
          "ui/src/primitives/WorkbenchSurface.tsx",
          "ui/src/primitives/WorkbenchTable.tsx",
          "ui/src/primitives/WorkbenchTaskPanel.tsx",
          "ui/src/primitives/WorkbenchTimeline.tsx",
          "ui/src/primitives/WorkbenchUtilityLink.tsx",
          "ui/src/primitives/WorkbenchWorkItemShell.tsx",
          "ui/src/primitives/workbench-responsive.ts",
          "ui/src/theme.ts",
        ]);
        exactSet("T1 explicit retained/protected exclusions", task?.exclusions ?? [], [...retainedUiPaths]);
        for (const retained of [...retainedAtomicUiPaths, ...retainedUiPaths]) {
          if (signedSurface.includes(retained) || !(task?.exclusions ?? []).includes(retained)) {
            violations.push("T1 must retain excluded owner outside signed scope: " + retained);
          }
        }
        exactSet("DESIGN corrected residual/proof forecast", designSurface, [
          "src/shell/runtime.ts",
          "src/core/execution.ts",
          "src/daemon/execution.ts",
          "src/daemon/validation.ts",
          "src/daemon/run.ts",
          "src/daemon/work-item-source.ts",
          "src/daemon/work-item-documentation.ts",
          "src/daemon/settings.ts",
          "ui/src/WorkflowRail.tsx",
          "ui/src/WorkItemIdentityRow.tsx",
          "ui/src/WorkItemQueue.tsx",
          "tests/sqlite.test.ts",
          "ui/src/AcceptanceWorkspace.tsx",
          "src/installer.ts",
          "src/shell/setup.ts",
          "src/shell/project.ts",
          "src/shell/sqlite.ts",
          "src/shell/config.ts",
          "README.md",
          "pontivus-order.toml.example",
          "src/core/contracts.ts",
          "src/core/governance.ts",
          "src/core/lifecycle.ts",
          "src/core/work-item-source.ts",
          "src/daemon/authority.ts",
          "src/daemon/coordinator.ts",
          "src/daemon/server.ts",
          "src/daemon/stage.ts",
          "src/shell/repository.ts",
          "ui/src/http.ts",
          "ui/src/query-keys.ts",
          "ui/src/app.tsx",
          "ui/src/WorkItemWorkspace.tsx",
          "ui/src/DocumentWorkspace.tsx",
          "ui/src/PreSignoffStageWorkspace.tsx",
          "ui/src/SignoffReview.tsx",
          "ui/src/ExecutionWorkspace.tsx",
          "ui/src/TerminalResult.tsx",
          "ui/src/WorkItemContext.tsx",
          "ui/src/workbench-presentation.ts",
          "ui/src/MarkdownEditor.tsx",
          "ui/src/primitives/WorkbenchToolbar.tsx",
          "ui/src/primitives/WorkbenchSettingsLayout.tsx",
          "ui/src/styles.css",
          "ui/src/theme.css",
          "ui/src/ReadinessWorkspace.tsx",
          "ui/src/ActivityWorkspace.tsx",
          "tests/browser.spec.ts",
          "tests/certification.test.ts",
          "tests/core.test.ts",
          "tests/daemon.test.ts",
          "tests/e2e-server.ts",
          "tests/installer.test.ts",
          "tests/shell.test.ts",
          "tests/order-migration.test.ts",
          "tests/opencode.test.ts",
          "tests/workbench-presentation.test.ts",
          "docs/references/workbench-ui/reference-atlas.html",
          "docs/references/workbench-ui/reference-manifest.json",
          "docs/references/workbench-ui/README.md",
          ".github/workflows/ci.yml",
          "CHANGELOG.md",
        ]);
        for (const absent of [
          "ui/src/primitives/WorkbenchLayout.tsx",
          "ui/src/primitives/WorkbenchSelector.tsx",
          "ui/src/WorkflowStepFrame.tsx",
          "ui/src/WorkflowMaterialSelector.tsx",
        ]) {
          if (existsSync(join(repositoryRoot, absent))) violations.push("Required-absent owner exists: " + absent);
        }
        for (const required of ["exact authority declarations/dependency closure", "exact signed document membership", "exact current/historical Approval", "all 38 governed surfaces", "47 P3 scenarios", "outstanding HUX", "Out-of-scope discoveries return upstream"]) {
          if (!(task?.objective ?? "").includes(required)) violations.push("T1 residual objective missing " + required);
        }

        const referenceManifest = JSON.parse(
          sourceText("docs/references/workbench-ui/reference-manifest.json"),
        ) as {
          semanticAuthority?: boolean;
          authority?: {
            p3?: { blob?: string };
            p4?: { blob?: string };
            theme?: { blob?: string };
            design?: { blob?: string };
          };
          viewportClasses?: Readonly<Record<string, number>>;
          surfaces?: readonly { id?: string; source?: string; selector?: string; viewports?: readonly string[] }[];
        };
        const designSurfaceIds = [
          ...design.matchAll(/^#{5,6} (SURF-[A-Z0-9-]+)\b/gm),
        ].map((match) => match[1] ?? "");
        if (designSurfaceIds.length !== 38 || duplicates(designSurfaceIds).length > 0) {
          violations.push(
            "DESIGN must contain 38 unique detailed SURF contracts; found " +
              designSurfaceIds.length,
          );
        }
        const referenceSurfaceIds = (referenceManifest.surfaces ?? [])
          .map((row) => row.id ?? "");
        if (referenceManifest.semanticAuthority !== false) {
          violations.push("Workbench reference manifest must explicitly be non-authoritative");
        }
        exactSet("Workbench reference manifest SURF set", referenceSurfaceIds, designSurfaceIds);
        const referenceWidths = referenceManifest.viewportClasses ?? {};
        exactSet("Workbench reference viewport class set", Object.keys(referenceWidths), ["wide", "medium", "narrow"]);
        for (const [name, width] of Object.entries({ wide: 1440, medium: 1000, narrow: 760 })) {
          if (referenceWidths[name] !== width) violations.push("Workbench reference representative viewport mismatch: " + name);
        }
        for (const surface of referenceManifest.surfaces ?? []) {
          const viewports = surface.viewports ?? [];
          exactSet("Workbench reference responsive coverage " + surface.id, [...viewports], ["wide", "medium", "narrow"]);
          if (duplicates([...viewports]).length > 0) violations.push("duplicate reference viewport class: " + surface.id);
        }
        const blobSha = (path: string): string => {
          const bytes = readFileSync(join(repositoryRoot, path));
          return createHash("sha1")
            .update("blob " + bytes.length + "\0")
            .update(bytes)
            .digest("hex");
        };
        const expectedReferenceAuthority = {
          p3: blobSha("docs/requirements/workbench.md"),
          p4: blobSha("docs/architecture/workbench.md"),
          theme: blobSha("docs/architecture/workbench-theme.md"),
          design: blobSha(workItemRoot + "/solution-design.md"),
        } as const;
        for (const [key, expectedBlob] of Object.entries(expectedReferenceAuthority)) {
          const actual = referenceManifest.authority?.[key as keyof typeof expectedReferenceAuthority]?.blob;
          if (actual !== expectedBlob) {
            violations.push(
              "Workbench reference manifest " + key + " blob is stale; expected " +
                expectedBlob + ", found " + (actual ?? "missing"),
            );
          }
        }
        const referenceFiles = readdirSync(
          join(repositoryRoot, "docs/references/workbench-ui"),
        ).sort();
        if (referenceFiles.some((name) => name.endsWith(".svg"))) {
          violations.push("superseded Workbench SVG references must not remain in the live tree");
        }
        exactSet(
          "Workbench active reference files",
          referenceFiles,
          ["README.md", "reference-atlas.html", "reference-manifest.json"],
        );
        const referenceAtlas = sourceText("docs/references/workbench-ui/reference-atlas.html");
        for (const surfId of designSurfaceIds) {
          if (!referenceAtlas.includes('data-surf="' + surfId + '"')) {
            violations.push("Workbench reference atlas missing " + surfId);
          }
        }

        const faceLedgerSection =
          actionCatalog.match(
            /### Exact IA27-IA34 and IA38 rendered face ownership\r?\n([\s\S]*?)(?=\r?\n## IA28)/,
          )?.[1] ?? "";
        const faceLedgerRows = faceLedgerSection
          .split(/\r?\n/)
          .filter((line) => /^\| IA(?:27|28|29|30|31|32|33|34|38) \|/.test(line))
          .map((line) => {
            const cells = line.trim().slice(1, -1).split("|").map((cell) => cell.trim());
            const phaseId = cells[0] ?? "";
            const surfaceIds = [...(cells[1] ?? "").matchAll(/\`(SURF-[^\`]+)\`/g)]
              .map((match) => match[1] ?? "");
            return { phaseId, surfaceIds };
          });
        if (faceLedgerRows.length !== 9) {
          violations.push("PLAN must allocate rendered faces across exactly IA27-IA34 and IA38");
        }
        exactSet(
          "PLAN rendered face phase owners",
          faceLedgerRows.map((row) => row.phaseId),
          ["IA27", "IA28", "IA29", "IA30", "IA31", "IA32", "IA33", "IA34", "IA38"],
        );
        const faceSurfaceUnion = faceLedgerRows.flatMap((row) => row.surfaceIds);
        const duplicateFaceSurfaces = duplicates(faceSurfaceUnion);
        if (duplicateFaceSurfaces.length > 0) {
          violations.push(
            "PLAN rendered face allocation duplicates SURF rows: " +
              duplicateFaceSurfaces.join(", "),
          );
        }
        exactSet("PLAN rendered face allocation", faceSurfaceUnion, designSurfaceIds);
        exactSet("IA38 Acceptance rendered ownership", faceLedgerRows.find((row) => row.phaseId === "IA38")?.surfaceIds ?? [], ["SURF-STEP-ACCEPTANCE-001"]);
        const acceptanceRef = referenceManifest.surfaces?.find((row) => row.id === "SURF-STEP-ACCEPTANCE-001");
        if (!acceptanceRef || acceptanceRef.selector !== '[data-surf="SURF-STEP-ACCEPTANCE-001"]') violations.push("Acceptance reference lacks exact surface binding");
        const acceptanceSpec = referenceAtlas.match(/"SURF-STEP-ACCEPTANCE-001":\{"states":\[([^\]]+)\]/)?.[1] ?? "";
        for (const state of ["awaiting-review","findings-open","correction-queued","retest-required","retest-failed","stale-authority","proof-unavailable","no-op-challenge","report-form","retest-form","historical-correction","historical-accepted","finding-detail","round-detail","submit-form","withdraw-form","accept-form","reanalysis-form","proof-reanalysis-form","reconcile-confirmation","test-copy-form","test-copy-result","test-copy-error","form-error","loading","mutation-conflict","historical-return","retest-confirmed-form","report-unclassified-form","mixed-candidate"]) {
          if (!acceptanceSpec.includes('"' + state + '"')) violations.push("Acceptance atlas missing state " + state);
        }
        if (!referenceAtlas.includes("repeat(10,") || referenceAtlas.includes("repeat(9,")) violations.push("reference rail must project ten stages");
        for (const row of designRows.filter((row) => /\bQA[1-6]\b/.test(row.solutions))) {
          if (!(task?.acceptanceRefs ?? []).includes(row.requirement)) violations.push("QA requirement missing signed acceptance ref " + row.requirement);
          if (designDispositionByRequirement.get(row.requirement) !== phaseRequirementRows.find((phase) => phase.requirement === row.requirement)?.disposition) violations.push("QA requirement disposition differs from PLAN " + row.requirement);
        }

        const ia30Faces = faceLedgerRows.find((row) => row.phaseId === "IA30")?.surfaceIds ?? [];
        const ia31Faces = faceLedgerRows.find((row) => row.phaseId === "IA31")?.surfaceIds ?? [];
        if (ia30Faces.includes("SURF-MAT-PROPOSAL-001")) {
          violations.push("Proposal Review must not cut over in IA30 before the complete WorkbenchReview consumer set");
        }
        if (!ia31Faces.includes("SURF-MAT-PROPOSAL-001")) {
          violations.push("Proposal Review must be owned by IA31 atomic WorkbenchReview cutover");
        }
        const ia30Section =
          actionCatalog.match(/## IA30 —[\s\S]*?(?=\n## IA31 —)/)?.[0] ?? "";
        const ia31Section =
          actionCatalog.match(/## IA31 —[\s\S]*?(?=\n## IA32 —)/)?.[0] ?? "";
        if (!ia30Section.includes("do not change `ProposalReview.tsx`")) {
          violations.push("IA30 must explicitly keep ProposalReview unchanged until the IA31 atomic Review cutover");
        }
        if (/ProposalReview\.tsx`\s*=|DocumentChangeView\.tsx`\s*=/.test(ia30Section)) {
          violations.push("IA30 must not own ProposalReview/DocumentChangeView breaking cutover");
        }
        for (const required of [
          "ProposalReview.tsx",
          "ReadinessWorkspace.tsx",
          "SignoffReview.tsx",
          "WorkbenchReview.tsx",
          "DocumentChangeView.tsx",
        ]) {
          if (!ia31Section.includes(required)) {
            violations.push("IA31 atomic Review cutover missing " + required);
          }
        }

        for (const required of [
          "### Exact IA27-IA34 and IA38 rendered face ownership",
          "No prior phase PASS is inherited",
          "IA27 does not derive either",
          "Do not add compatibility props or temporary old/new paths",
          "DocumentChangeView.tsx",
          "No prior RZ16 PASS is inherited",
          "Reject any feature-local `order-review-*` structural/card/grid systems",
          "WorkbenchResult",
        ]) {
          if (!actionCatalog.includes(required)) {
            violations.push("PLAN canonical UI action catalog missing " + required);
          }
        }

        for (const required of [
          "WorkbenchDialogue({ transcript, activity?, composer?, state? })",
          "-> WorkbenchDialogue(transcript, activity?, composer?, state?)",
          "no outer WorkbenchSurface / WorkbenchAttention wrapper",
          "no generic header/technical-detail slots",
          "WorkbenchReviewVerdict",
          "WorkbenchReviewSection",
          "WorkbenchResourceList",
          "WorkbenchDocument",
          "WorkbenchResult",
          "No structural escape hatch",
        ]) {
          if (!p4Workbench.includes(required)) {
            violations.push("P4 Workbench corrected component contract missing " + required);
          }
        }

        for (const required of ["CONFORMING_NO_EDIT", "REQUIRED_ABSENT", "exact signed ArtifactRef", "proof-only", "Do not add compatibility props or temporary old/new paths"]) {
          if (!actionCatalog.includes(required)) violations.push("PLAN closed-owner/residual contract missing " + required);
        }
        const requiredAbsentRow = actionCatalog.split(/\r?\n/).find((line) => ["`WorkbenchLayout.tsx`", "`WorkbenchSelector.tsx`", "`WorkflowStepFrame.tsx`", "`WorkflowMaterialSelector.tsx`", "`REQUIRED_ABSENT`"].every((value) => line.includes(value)));
        if (requiredAbsentRow === undefined) violations.push("PLAN required-absent owner ledger incomplete");
        if (/\| new `Workbench(?:Section|Facts|ResourceList)\.tsx` \| `REQUIRED_NEW`/.test(actionCatalog) || actionCatalog.includes("existing `WorkbenchReview.tsx` = `DESTRUCTIVE_REPLACEMENT`")) violations.push("PLAN orders obsolete shared-owner creation or replacement");

        for (const [label, textValue] of [
          ["DESIGN", design],
          ["PLAN", plan],
          ["PLAN action catalog", actionCatalog],
          ["PLAN closeout", closeout],
        ] as const) {
          const staleTasks = textValue.match(/\bT(?:2|3|4|5|6|7|8|9|10|11)\b/g) ?? [];
          if (staleTasks.length > 0) {
            violations.push(label + " retains invalid cross-task reconstruction refs: " + staleTasks.join(","));
          }
          if (/purge commit|replacement commits|Git history/i.test(textValue)) {
            violations.push(label + " retains prohibited Git-commit purge semantics");
          }
        }

        const p3Workbench = sourceText("docs/requirements/workbench.md");
        const p3Markdown = sourceText("docs/requirements/markdown-workbench.md");
        const referenceReadme = sourceText("docs/references/workbench-ui/README.md");
        for (const required of [
          "no disclosure accumulation",
          "one semantic owner",
          "primary adjacency",
          "technical inspection",
          "generic **Technical details** accordion",
        ]) {
          if (!p3Workbench.includes(required)) {
            violations.push("P3 Workbench composition contract missing " + required);
          }
        }
        for (const required of [
          "overflow/menu treatment **before** the toolbar is allowed to become multiple independent stacked formatting rows",
          "No generic Technical-details, Supporting-material/history",
          "source / preview / split canvas",
        ]) {
          if (!p3Markdown.includes(required)) {
            violations.push("P3 Markdown composition contract missing " + required);
          }
        }
        for (const required of [
          "WorkbenchTaskPanel({ open, title, description?, onOpenChange, body, feedback?, footer, onSubmit? })",
          "WorkbenchAttention({ title, description?, feedback?, action? })",
          "header → scrollable body → footer",
          "WorkbenchReview",
          "no technical-details slot",
          "WorkbenchDisclosure",
          "same operator task",
          "WorkbenchContextPanel",
          "technical-inspection",
          "WorkbenchSurface({ attention?, material })",
          "outer WorkbenchSurface / WorkbenchAttention = absent",
          "A responsibility is instantiated as a production module only when an authorized current DESIGN has a consumer for it",
          "Release/campaign migration state, current-file dispositions and execution sequencing belong to the governed WorkItem DESIGN/PLAN/campaign artifacts",
        ]) {
          if (!p4Workbench.includes(required)) {
            violations.push("P4 Workbench corrected foundation contract missing " + required);
          }
        }
        for (const forbidden of [
          "WorkbenchTaskPanel({ open, title, onOpenChange, content })",
          "WorkbenchAttention({ title, purpose?, status?, blocker?, action? })",
          "### 16.6 Current destructive-reconstruction ownership boundary",
          "Current foundation remediation",
          "Foundation phasing is mandatory",
          "0.6.0 campaign",
          "current 0.6.0",
          "IA27",
          "IA28",
        ]) {
          if (p4Workbench.includes(forbidden)) {
            violations.push("P4 Workbench must not contain campaign/migration or stale API contract: " + forbidden);
          }
        }
        if (plan.includes("purpose?, status?, blocker?")) {
          violations.push("PLAN must not redefine the canonical Attention API with generic purpose/status/blocker slots");
        }
        for (const required of [
          "**Semantic authority:** none",
          "exact current authority versions",
          "must never fabricate",
          "38-SURF universe is derived from current DESIGN",
        ]) {
          if (!referenceReadme.includes(required)) {
            violations.push("Workbench reference corpus contract missing " + required);
          }
        }
        for (const [label, textValue] of [
          ["P3 Workbench", p3Workbench],
          ["P4 Workbench", p4Workbench],
          ["DESIGN", design],
          ["PLAN", plan],
          ["PLAN action catalog", actionCatalog],
          ["PLAN closeout", closeout],
        ] as const) {
          for (const forbidden of [
            "Review currentness/summary/body/decisions",
            "authorized local Technical details",
            "reviewed SVG composition",
            "reviewed derived SVG pack",
            "derives the 37-surface universe from `docs/references/workbench-ui/README.md`",
          ]) {
            if (textValue.includes(forbidden)) {
              violations.push(label + " retains superseded documentation/reference contract: " + forbidden);
            }
          }
        }

        const concernUnion = [...new Set(task?.concernIds ?? [])];
        exactSet(
          "PLAN concern union",
          concernUnion,
          ["core", "daemon", "foundation", "shell", "ui", "verification"],
        );

        if (g5Status === "PASS" && !actionCatalog.includes("| T1 | SD01-SD30 + QA1–QA6; IA01-IA39 |")) {
          violations.push("PLAN audit ledger missing the one signed task T1");
        }
      } catch {
        violations.push("PLAN order-tasks block must be valid JSON");
      }
    }
    expect(violations).toEqual([]);
  });


});
