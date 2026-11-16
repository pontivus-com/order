# Phase 1 certification and evidence map

**Status:** P1-T01 evidence registry complete; P1-T03/P1-T09 proof mapping pending  
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

**Pending P1-T03 and P1-T09.**

## 7. Runtime-evidence coverage

**Pending P1-T03 and P1-T09.**

## 8. Misleading or insufficient current sensors

**Pending P1-T09.** Initial known caution: consumer-only tests must not be treated as proof that productive provider producers satisfy the same contract.

## 9. Missing certification obligations for Phase 2B

**Pending P1-T09.**
