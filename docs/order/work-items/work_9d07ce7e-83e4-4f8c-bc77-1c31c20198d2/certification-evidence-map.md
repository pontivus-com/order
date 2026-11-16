# Phase 1 certification and evidence map

**Status:** P1-T01 and P1-T03 evidence registries complete; P1-T09 invariant proof mapping pending  
**WorkItem:** `work_9d07ce7e-83e4-4f8c-bc77-1c31c20198d2`  
**Production implementation baseline under audit:** `a4fca0d5771ecbf3af6f932649d3811bed750cd5`  
**Owner inside Phase 1:** proof/evidence status only  
**Execution plan:** [phase-1-investigation-plan.md](phase-1-investigation-plan.md)

## 1. Evidence-source registry

### 1.1 Canonical verification commands

The current project manifest owns these permanent verification commands:

| Gate | Command family | Primary evidence role |
|---|---|---|
| dependency lock | `bun ci` | dependency-lock integrity |
| typecheck | `bun run tsc --noEmit` | strict TypeScript surface |
| architecture | Vitest `tests/architecture.test.ts` | module/ownership/architecture fitness |
| test | full Vitest suite | core/daemon/shell/contracts/semantic behavior |
| build | Vite production build | browser production-build viability |
| browser | Playwright suite | browser-visible integrated behavior |

A green gate is not automatically evidence for an unrelated interaction proposition. P1-T09 maps exact propositions to exact tests.

### 1.2 Permanent test-family registry

| Test owner | Current permanent scope evidenced by test titles/source | Phase 1 propositions expected to consume it |
|---|---|---|
| `tests/architecture.test.ts` | P4 dependency direction; FCIS effect boundaries; no OOP/DTO/service architecture; canonical Zod ownership; core/daemon module graph; typed/acylcic UI presentation ownership; Settings/source/workbench boundaries; canonical documentation ownership | `STATE-`, `OC-`, `MAT-`, structural `CERT-` |
| `tests/browser.spec.ts` | browser bootstrap/auth; theme; Settings/readiness; OpenCode account utility; Markdown editor; typed API failures; Approval/currentness; queue/context/create; repository-native management; responsive geometry; workflow dialogue/history; current feedback; mutation pending/conflict/convergence; all nine steps; proposal decisions; source conflicts; terminal results/evidence | `SURF-`, `INFO-`, `ACT-`, `FLOW-`, browser `CERT-` |
| `tests/certification.test.ts` | package/runtime pins; compiler/build boundary; UI boundary; browser transport; canonical Workbench state ownership; productive OpenCode context/failure contract; diagnostics; cross-boundary ownership; browser harness; temporary-scaffolding exclusion | cross-boundary `CERT-`, `OC-`, `STATE-` |
| `tests/core.test.ts` | strict canonical schemas; WorkItem/Run/RunEvent invariants; lifecycle/execution policy; source-backed WorkItems; closed Workbench transition kernel; STAGE interaction derivation; contradictory provider batches; proposal decision; reached history; execution/validation/current attention/recovery derivations | `STATE-`, `MAT-`, typed-source `INFO-`, negative `CERT-` |
| `tests/daemon.test.ts` | HTTP failure classification; Settings/readiness; source reconciliation/save/currentness; stage start/input/resume; sign-off; execution; concurrency/serialization; provider-origin classification; proposal adoption; lifecycle transitions | `ACT-`, `FLOW-`, `STATE-`, `MAT-`, `OC-`, daemon `CERT-` |
| `tests/markdown-source-formatting.test.ts` | exact Markdown source formatting commands | editor-specific `ACT-`/`CERT-` |
| `tests/opencode.test.ts` | private provider environment; instruction closure; permissions; model/account projection; exact 2.2.6 provider turn; one repair; bounded/redacted diagnostics; login/setup | `OC-`, provider `CERT-` |
| `tests/order-migration.test.ts` | predecessor migration/cutover | Settings/migration `FLOW-`/`CERT-` where surfaced |
| `tests/process.test.ts` | process timeout/cancellation cleanup | provider/process failure `OC-`/`CERT-` |
| `tests/shell.test.ts` | runtime/config/project/repository shell; STAGE workspace materialization; documentation Git; guarded Markdown/source effects | `MAT-`, `OC-`, source/Git `ACT-`, effect `CERT-` |
| `tests/sqlite.test.ts` | persisted schema/migration; execution-task reconstruction | state/persistence `STATE-`/`MAT-`/`CERT-` |
| `tests/workbench-presentation.test.ts` | workflow-step projection/material priority; transport convergence; explicit selection; proposals/history; Run status/event projection | presentation-derived `SURF-`/`INFO-`/`STATE-`/`CERT-` |

### 1.3 Runtime/rendered evidence sources

Existing permanent browser tests exercise many viewport/state combinations, but the suite contains no `toHaveScreenshot` visual-regression evidence. Therefore Phase 1 must separately capture rendered-state evidence in P1-T03 for the scenario matrix established by P1-T02.

Permitted evidence path:

1. existing e2e/browser fixture and production app startup path;
2. exact `version/0.5.0` commit under capture;
3. temporary GitHub Actions workflow only when necessary to execute browser capture;
4. retained screenshot/evidence artifact keyed to `SURF-`/scenario;
5. temporary workflow YAML removed immediately after evidence collection.

## 2. Initial evidence facts

### CERT-BASE-001 — production implementation baseline is stable

**Fact:** the Phase 1 branch differs from released `master` only in changelog/WorkItem documentation at P1-T01 completion.

**Evidence:** repository compare `master...version/0.5.0`; production implementation base `a4fca0d5771ecbf3af6f932649d3811bed750cd5`.

**Verdict:** PROVEN for P1-T01 baseline identity.

**Consequence:** later screenshot/source evidence can target one stable implementation until a production file changes.

### CERT-BASE-002 — browser transport is centralized and typed

**Fact:** `ui/src/http.ts` centralizes browser `/api/**` calls and parses responses with canonical schemas imported from `src/core/contracts.ts`.

**Evidence:** `ui/src/http.ts`; direct daemon adapter `src/daemon/server.ts::routeApi`.

**Verdict:** PROVEN as a source-boundary fact. Individual endpoint correctness remains to be mapped in P1-T05/P1-T09.

### CERT-BASE-003 — rendered screenshots are not currently permanent certification

**Fact:** current `tests/browser.spec.ts` exercises browser state/layout/theme behavior but has no `toHaveScreenshot` assertions.

**Evidence:** current Playwright test source.

**Verdict:** PROVEN.

**Consequence:** P1-T03 must capture rendered evidence independently; this does not imply screenshot regression tests must become a future permanent requirement.

## 3. Invariant-to-test matrix

**Pending P1-T09.**

## 4. Producer/consumer coverage

**Pending P1-T09.**

## 5. Positive/negative coverage

**Pending P1-T09.**

## 6. Browser/integration coverage

P1-T03 established direct rendered evidence for the current application composition at audit SHA `54e0a204bf35be1ee7d6118e798531015475baa0`.

Retained artifact set:

| Run | Artifact | Digest | Result relevant to evidence |
|---|---:|---|---|
| `43785880126` | `14190501955` | `sha256:78831b19f5d716ebee5d8b88c0b6362e7590b6570c0844621ef01405e6968917` | 29 valid production-runtime captures; late harness timeout does not invalidate flushed evidence |
| `43786952469` | `14190488690` | `sha256:9bd00bfcba627c7d104015cf7cb329240e9d887185f89660e5dcc92f93b0b3e8` | 3 production-runtime settings captures + 1 deterministic OpenCode UI contract capture |
| `43787594359` | `14190659108` | `sha256:1e0e4558f14d452a15dc99c80962893bb529902632688679e79de686ed01ce70` | 2 production-runtime confirmations + 4 deterministic OpenCode UI contract captures |
| `43787807267` | `14190539793` | `sha256:3246ad293387df3dc866f6f01c9423dcf72700799c95bea47019197ffcb406e3` | 5 production-runtime captures; workflow passed |

The exact file→`SURF-` mapping is owned by `application-interaction-map.md` §11.

The screenshot corpus proves rendered composition only. It does not by itself prove canonical state ownership, provider capability, mutation admission or semantic correctness. Those require the corresponding source/test evidence in P1-T04–P1-T09.

## 7. Runtime-evidence coverage

### CERT-BASE-004 — temporary screenshot scaffolding is absent from the current branch tree

**Fact:** the temporary `.github/workflows/phase1-rendered-evidence.yml` used only to collect evidence has been deleted. Current `.github/workflows` contains only the permanent `ci.yml` and `release.yml`.

**Verdict:** PROVEN.

### CERT-BASE-005 — captured evidence targets one stable implementation SHA

**Fact:** every retained Phase-1 screenshot manifest records audit SHA `54e0a204bf35be1ee7d6118e798531015475baa0`, whose production implementation remains the released 0.4.0 code baseline.

**Verdict:** PROVEN.

### CERT-BASE-006 — deterministic OpenCode screenshots are UI-contract evidence only

**Fact:** populated-account, rename/remove/add/login screenshots use the repository's existing deterministic fake provider through the real Order daemon/API/UI path.

**Verdict:** PROVEN as current Order UI-contract evidence; **not evidence** of external/pinned OpenCode capability.

**P1-T07 obligation:** independently prove real pinned-integration observability/account/session capabilities before Phase 2 uses them as provider facts.

Detailed invariant-to-runtime proof mapping remains P1-T09.

## 8. Misleading or insufficient current sensors

**Pending P1-T09.** Initial known caution: consumer-only tests must not be treated as proof that productive provider producers satisfy the same contract.

## 9. Missing certification obligations for Phase 2B

**Pending P1-T09.**
