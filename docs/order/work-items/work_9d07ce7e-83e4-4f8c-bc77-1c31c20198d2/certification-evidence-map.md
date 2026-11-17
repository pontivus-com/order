# Phase 1 certification and evidence map

**Status:** P1-T09 complete  
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

## 3. Invariant-to-test matrix — P1-T09

| CERT | Proposition / finding | Current permanent proof | What it actually proves | Coverage verdict |
|---|---|---|---|---|
| CERT-001 | typed browser/API boundary is canonical-schema parsed | architecture + certification + browser transport tests | one centralized typed HTTP boundary, canonical schema parsing, no browser DB/provider bypass | **PROVEN** |
| CERT-002 | lifecycle transition relation rejects unlisted stage/status causes | `tests/core.test.ts` lifecycle kernel | pure consumer transition algebra including negative combinations | **PROVEN** |
| CERT-003 | STAGE interaction PROCESSING/OPEN/REQUIRED_INPUT/CLOSED | core + daemon + browser | pure derivation, exact input admission and browser composer behavior | **PROVEN** |
| CERT-004 | STAGE provider batch consumer rejects contradictory controls/proposal | core test around `validateStageProviderTurn` | consumer rejects request+completion and request+proposal; role mismatch rejected | **PROVEN CONSUMER ONLY** |
| CERT-005 | productive STAGE provider is instructed to emit only consumer-valid batch combinations | no permanent producer-contract test | current provider contract tests validate individual payload/repair/admission, not closed cross-event grammar | **ABSENT — STATE-F03/OC-F07** |
| CERT-006 | pending proposal cannot become terminal Run while unresolved | no test found | core separately proves CLOSED for CANCELLED and PENDING proposal derivation, but never combines them; daemon has no cancel-with-pending-proposal negative test | **ABSENT — STATE-F01** |
| CERT-007 | proposal adopt/reject requires exact current OPEN owner | daemon proposal tests + pure proposal derivation | daemon rejects wrong owner/role/state and supports normal disposition/adoption | **PROVEN CONSUMER; dead-state prevention absent** |
| CERT-008 | source direct Save uses expected hash and invalidates downstream authority | daemon + browser | stale writes rejected; active Run exclusion; source change lifecycle/freshness visible | **PROVEN** |
| CERT-009 | lifecycle document Save uses expected hash, editability and owning-stage return | daemon + browser | canonical bytes only; direct edit role/stage restriction; downstream sign-off removed | **PROVEN** |
| CERT-010 | documentation Git save commits only reviewed governed paths | shell + daemon + browser | exact expected HEAD/path/hash set and repository blockers | **PROVEN** |
| CERT-011 | sign-off cannot authorize stale/different package | core/daemon/browser | exact package recomputation, baseline/source/artifact byte checks, expected package hash | **PROVEN** |
| CERT-012 | execution current-owner derivation is WorkItem-local | core + workbench-presentation tests | selected historical task does not become execution authority; blocked/running/TODO owner selection closed | **PROVEN** |
| CERT-013 | task-local manual “Run next implementation step” starts the selected WorkItem/task | browser test only checks button sends `POST /api/tick` and, in a one-runnable fixture, resulting Run appears | does not carry selected WorkItem/task id; no competing runnable WorkItem/task scenario proves semantic scope | **MISLEADING/PARTIAL — STATE-F02/ACT-F01** |
| CERT-014 | coordinator global tick remains bounded to some approved runnable task | daemon execution tests | scheduler chooses admissible approved work and validates freshness | **PROVEN**, but this is not proof of CERT-013 |
| CERT-015 | validation boundary belongs to current candidate/task | core + daemon | reviewer/remediator trigger ownership and current candidate validation derivation | **PROVEN** |
| CERT-016 | daemon restart does not pretend provider continuation | daemon/certification | RUNNING work becomes COORDINATOR_INTERRUPTED except exact candidate reconciliation | **PROVEN** |
| CERT-017 | STAGE session reuse is bounded by current Run/context/material identity | daemon + opencode/certification | provider session reuse/replacement constraints and strict material identity | **PROVEN** |
| CERT-018 | current UI exposes meaningful canonical agent messages/questions/proposals/failures | browser + workbench-presentation | RunEvent presentation and activity/composer current action | **PROVEN** |
| CERT-019 | current UI exposes provider tool/action activity while processing | no permanent test because product does not implement it | only Order processing state/final semantic events are shown | **ABSENT BY CURRENT DESIGN — OC-F01** |
| CERT-020 | provider diagnostic can reconstruct exact invalid returned STAGE batch | diagnostics tests prove bounded/redacted diagnostic fields/evidence, not returned event-tag summary | diagnostic may say provider SUCCEEDED before later Order batch rejection | **ABSENT — OC-F03** |
| CERT-021 | rediscovered deterministic lifecycle draft without Run history appears through normal lifecycle-artifact query | certification only asserts `materializeLifecycleDrafts` exists; daemon tests exercise current artifacts after Run-derived candidates | no test seeds valid lifecycle Markdown with no Run then proves `listCurrentLifecycleArtifacts` returns it | **ABSENT — MAT-F01** |
| CERT-022 | repository draft existence does not fabricate conformance/lifecycle history | source reconciliation architecture/daemon behavior | materialization stores ArtifactRef only; no Run/completion/conformance generated | **PROVEN** |
| CERT-023 | conformance requires current contextHash + correct output role + matching current bytes | daemon authority tests + source implementation | file existence alone is insufficient | **PROVEN** |
| CERT-024 | R3 is read-only | core editability + browser | no direct edit path for R3 | **PROVEN** |
| CERT-025 | execution/complete lifecycle Markdown is read-only | core + daemon + browser | direct save rejected/suppressed | **PROVEN** |
| CERT-026 | source/material mutation after sign-off invalidates execution authority | daemon + authority tests | source change blocks tasks; approval freshness routes upstream | **PROVEN** |
| CERT-027 | raw technical identity is secondary/on-demand throughout Workbench | architecture/presentation tests assert technical ownership patterns, but browser tests also explicitly expect raw document paths in Context and some primary document/package locations | tests do not catch INFO-F01/F02/F03/F04 and in places encode existing leakage | **PARTIAL/MISLEADING** |
| CERT-028 | all workflow surfaces/overlays have rendered-state evidence for current implementation | Phase-1 P1-T03 evidence corpus | actual current composition, density/theme/responsive/overlays against fixed implementation SHA | **PROVEN AS AUDIT EVIDENCE**, not permanent regression certification |
| CERT-029 | current browser mutation convergence suppresses duplicate/stale actions | browser + lifecycle observation-coherence tests | current-state conflict stays primary until refetch; asynchronous dependent owners converge | **PROVEN** |
| CERT-030 | linked remediation from completed audit/investigation preserves parent and starts new CHANGE/DEFECT | core + browser | lineage constraints and terminal parent immutability | **PROVEN** |

## 4. Producer/consumer coverage

| Producer → carrier → consumer | Producer proof | Consumer proof | End-to-end verdict |
|---|---|---|---|
| browser human input → HTTP → daemon `submitRunInput` → RunEvent/provider turn | browser composer + typed request | daemon repeats exact `stageInputIsAdmitted` / proposal/current lifecycle checks | **CLOSED** |
| browser source Save → expected-hash command → repository/source owner | typed editor command | daemon/source shell expected hash + active Run + lifecycle rechecks | **CLOSED** |
| browser artifact Save → expected-hash command → artifact owner | typed editor command | daemon artifact editability/hash/lifecycle recheck | **CLOSED** |
| provider STAGE output → shell parse/admission → `validateStageProviderTurn` | individual event schema/tag/repair tests only | strong closed batch validator tests | **NOT CLOSED — STATE-F03** |
| proposal UI → disposition HTTP → daemon current proposal | normal proposal browser path | strong daemon current-owner checks | **NOT CLOSED across Cancel — STATE-F01** |
| Approval UI → package hash → sign-off recomputation | browser exact package action | daemon recomputes source/material/baseline/package | **CLOSED** |
| Implementation current owner → manual action → scheduler | WorkItem-local UI derivation | global scheduler chooses some runnable task | **NOT CLOSED — STATE-F02** |
| source reconciliation → lifecycle-draft ArtifactRefs → lifecycle-artifact UI query | `materializeLifecycleDrafts` proven | query consumes Run-derived candidates | **NOT CLOSED — MAT-F01** |
| provider turn → diagnostics evidence → failure diagnosis | bounded diagnostic record | diagnostics persisted and linked | **PARTIAL: rejected batch shape absent — OC-F03** |

## 5. Positive/negative coverage

### Strong negative coverage already present

Permanent tests correctly reject or cover:

- invalid WorkItem lifecycle causes/stages;
- duplicate/mismatched input requests;
- contradictory provider control batches at the consumer;
- multiple unresolved proposals and duplicate/invalid disposition history;
- stale source/artifact expected hashes;
- active-Run document/source mutation;
- stale sign-off package/material;
- changed source/material during execution;
- out-of-change-surface provider edits;
- reviewer/remediator trigger mismatches;
- settings expected-state/config conflicts;
- OpenCode permission/model/account admission failures;
- duplicate execution retries/repair exhaustion;
- browser mutation convergence/current-state conflict.

### Missing negative combinations that matter

1. **Cancel active STAGE Run with unresolved proposal** -> must not produce unrecoverable CLOSED+PENDING.
2. **Two runnable WorkItems/tasks + click task-local Implementation action on the non-global-selected task** -> must prove exact user intent/control scope.
3. **Provider output containing individually valid proposal + completion/block/input** -> producer contract must prove such combination is not requested/admitted before consumer rejection.
4. **Fresh runtime projection + deterministic lifecycle Markdown + zero Runs** -> lifecycle-document query/UI must surface repository draft without fabricated history.
5. **Successful provider diagnostic followed by batch-consumer rejection** -> evidence must identify the bounded rejected event shape/class sufficiently to diagnose the contract violation.
6. **technical-detail hierarchy assertions** -> permanent browser/presentation proof should reject raw package hashes/paths/ids in primary workflow regions when current authority says on-demand.

## 6. Browser/integration coverage

P1-T03 established direct rendered evidence for the current application composition at audit SHA `54e0a204bf35be1ee7d6118e798531015475baa0`.

Retained artifact set:

| Run | Artifact | Digest | Result relevant to evidence |
|---|---:|---|---|
| `43785880126` | `14190501955` | `sha256:78831b19f5d716ebee5d8b88c0b6362e7590b6570c0844621ef01405e6968917` | 29 valid production-runtime captures; late harness timeout does not invalidate flushed evidence |
| `43786952469` | `14190488690` | `sha256:9bd00bfcba627c7d104015cf7cb329240e9d887185f89660e5dcc92f93b0b3e8` | settings/OpenCode UI-contract captures |
| `43787594359` | `14190659108` | `sha256:1e0e4558f14d452a15dc99c80962893bb529902632688679e79de686ed01ce70` | confirmation/OpenCode UI-contract captures |
| `43787807267` | `14190539793` | `sha256:3246ad293387df3dc866f6f01c9423dcf72700799c95bea47019197ffcb406e3` | final residual capture; workflow passed |

The exact file→`SURF-` mapping is owned by `application-interaction-map.md` §11.

The browser suite has good semantic interaction coverage, but it is not currently a visual-regression suite. P1-T03 evidence is therefore audit evidence, not a claim that all future visual behavior is permanently certified.

## 7. Runtime-evidence coverage

### CERT-BASE-004 — temporary screenshot scaffolding is absent

The temporary screenshot workflow was removed after evidence collection. Current permanent workflows remain `ci.yml` and `release.yml`.

**Verdict:** PROVEN.

### CERT-BASE-005 — captured evidence targets one production implementation

Every retained Phase-1 screenshot manifest records audit SHA `54e0a204bf35be1ee7d6118e798531015475baa0`; the screenshot workflow only added audit scaffolding and did not alter production implementation.

**Verdict:** PROVEN.

### CERT-BASE-006 — deterministic OpenCode screenshots are UI-contract evidence only

The fake provider exercises the real Order daemon/API/UI path but does not establish external provider capability. P1-T07 independently verified the exact pinned provider source/capabilities.

**Verdict:** CORRECTLY BOUNDED.

## 8. Misleading or insufficient current sensors

### CERT-GAP-01 — consumer-only STAGE grammar proof

`tests/core.test.ts` proves `validateStageProviderTurn` rejects contradictory batches. It does not prove `stagePrompt` / `providerOutputContract` tells the productive provider the same grammar.

**Effect:** green consumer test coexists with real provider failure STATE-F03.

### CERT-GAP-02 — single-runnable-task browser fixture hides command-scope mismatch

The browser test clicks “Run next implementation step”, observes `POST /api/tick`, and sees an Implementation Run in a fixture where the intended task is the runnable task.

It does not prove selected-task identity is carried or honored.

**Effect:** green browser test coexists with STATE-F02.

### CERT-GAP-03 — proposal tests omit terminalization with unresolved proposal

Tests separately prove proposal state and Cancel/CLOSED semantics, but no integrated negative test combines them.

**Effect:** STATE-F01 is reachable despite strong local tests.

### CERT-GAP-04 — lifecycle-draft certification checks producer, not consumer

Certification asserts source reconciliation contains `materializeLifecycleDrafts`, but does not prove a no-Run repository draft is returned by `currentLifecycleArtifacts` and shown in the Workbench.

**Effect:** MAT-F01 survives.

### CERT-GAP-05 — technical hierarchy tests do not reject current leakage

Current browser tests sometimes assert raw paths in Context correctly, but no permanent sensor comprehensively enforces primary-vs-technical placement. Approval hashes and persistent selector paths can therefore remain green.

**Effect:** INFO-F01–F04 survive.

### CERT-GAP-06 — diagnostics prove boundedness, not causal sufficiency

Current OpenCode tests prove diagnostics are bounded/redacted and persisted. They do not require enough returned-event shape to distinguish a post-provider Order admission failure.

**Effect:** OC-F03 survives.

## 9. Missing certification obligations for Phase 2B

Phase 2B must design permanent certification for the accepted Phase 2A behavior. At minimum the technical design must close:

1. **provider-turn producer/consumer agreement** — the same closed STAGE batch grammar must be present/provable at producer contract and consumer validator;
2. **proposal/cancel state closure** — every admitted terminalization path must leave no unresolved proposal, or the accepted functional behavior must define one explicit recoverable alternative;
3. **manual execution command scope** — browser-visible owner and daemon command owner must be the same semantic action under multiple runnable WorkItems/tasks;
4. **repository-draft portability** — no-Run deterministic lifecycle drafts must be visible/inspectable/editable according to accepted stage rules without fabricating runtime history;
5. **OpenCode operational activity** — if Phase 2A requires it, prove data-source reliability, bounded/redacted projection, persistence/restart semantics and primary-vs-technical presentation;
6. **provider admission diagnostics** — bounded evidence must distinguish provider success from later Order contract rejection and identify the rejected event class/shape without storing raw unbounded model output;
7. **information hierarchy** — permanent browser/presentation tests must enforce the accepted primary/current/supporting/technical/debug placement contract, including Approval;
8. **document maturity presentation** — accepted derived maturity semantics must be proved from canonical facts without a duplicate persisted status owner;
9. **responsive/accessibility continuity** — accepted screen contracts must preserve current task/action, focus and semantic status across wide/medium/narrow and theme changes;
10. **full producer→carrier→consumer negative matrix** for every materially changed interaction boundary.

## 10. P1-T09 proof-status synthesis

| Domain | Proven enough for Phase 2 facts? | Material gaps |
|---|---|---|
| application surface/rendering inventory | yes | permanent visual certification not yet a requirement |
| typed information lineage | yes | INFO-F01–F04 are confirmed defects |
| interaction/business rules | yes | STATE-F01/F02 are confirmed closure defects |
| lifecycle/state kernel | yes | proposal terminalization contradiction |
| STAGE provider consumer grammar | yes | producer contract not closed |
| OpenCode current capability | yes | operational transparency not integrated; diagnostics insufficient |
| document/material maturity | yes | no-Run draft projection defect; product maturity vocabulary incomplete |
| current permanent certification | yes as an audit fact | six named sensor gaps above |

**P1-T09 verdict:** COMPLETE.

The certification audit does not claim the current product is correct. It establishes exactly what is proved, what is only locally proved, what is misleading, and what permanent proof Phase 2B must design.

## 11. Explicit unresolved-fact list

There are **no remaining material factual unknowns** identified by P1-T09 that require reopening the 0.4.0 implementation before product/design decisions can begin.

Remaining questions are decision questions:

- what bounded OpenCode activity the operator should see;
- what the manual Implementation action should semantically mean;
- how proposal cancellation/terminalization should behave;
- what operator-facing document maturity vocabulary is required;
- how the accepted hierarchy should place technical identities;
- the exact technical realization/certification for those accepted behaviors.

These belong to Phase 2A/2B, not further Phase 1 fact discovery.
