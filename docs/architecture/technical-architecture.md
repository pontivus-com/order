# Technical architecture and integration contracts

**Status:** Binding technical design standard
**Canonical concern ID:** `GW-DOC-TECHNICAL-ARCHITECTURE`  
**Versioned concern ID:** `GW-DOC-TECHNICAL-ARCHITECTURE-V2`  

## 1. Purpose

This document is the technical counterpart to Order's functional lifecycle and governance standards.

It defines the v1 architecture required for Order to operate as both:

1. an interactive local software-work refinery for IDEA, R1, R2, DESIGN, PLAN, R3 inspection and sign-off; and
2. an unattended execution factory for approved implementation work.

The complete control loop is:

```text
UNDERSTAND
  -> DECIDE
  -> ACT
  -> OBSERVE
  -> REACT
  -> UNDERSTAND AGAIN
```

**Stable P4 authority reference:** `GW-P4-V1-ARCHITECTURE` — the complete binding v1 technical architecture in this document.

### Stable P4 technical requirements

These ids classify the existing material P4 constraints; the detailed contracts remain in the referenced sections.

- **GW-TR-001-FCIS-CANONICAL-OWNERSHIP** — Order-owned application code uses the functional-core/imperative-shell dependency direction and one canonical semantic representation. **Acceptance:** the implementation obeys §§3, 5–8 and contains no Order-owned OOP/service/repository/DTO/mapper architecture.
- **GW-TR-002-LOCAL-LINUX-RUNTIME** — v1 runs as one Linux-local Bun daemon with one SQLite writer and the locked runtime/toolchain. **Acceptance:** §§2–3, 6 and 17 are implemented and the host/runtime capability probes pass without fallback.
- **GW-TR-003-REPRODUCIBLE-AUTHORITY-STATE** — project authority, approval, task and durable state are reproducible from the canonical manifest/artifact/persistence model. **Acceptance:** §§4, 8–12 and 23 plus P6 persistence/freshness contracts pass; no parallel authority/state store exists.
- **GW-TR-004-ISOLATED-BOUNDED-EXECUTION** — unattended execution uses exact-baseline isolated workspaces, the single OpenCode boundary and bounded verification/process cancellation. **Acceptance:** §§15–16 and 20–24 pass; human working trees, hidden provider recovery and task-to-task candidate promotion are not used.
- **GW-TR-005-LOCAL-SECURE-WORKBENCH** — browser and CLI remain clients of the loopback daemon with the fixed local authentication/HTTP/polling/UI-state model, while governed Markdown authoring remains a bounded pre-signoff surface. **Acceptance:** §§17–19, 29 and P6 transport/security contracts pass; no remote hosting, alternate transport, browser-owned workflow state or production-code editor exists.
- **GW-TR-006-CLOSED-INTEGRATION-CERTIFICATION** — the exact direct dependency/runtime set and every relied-upon external behavior are closed by the dated facts/certification contract. **Acceptance:** §§2, 21, 27–28 and [GW-DOC-CANONICAL-CONTRACTS §29](../contracts/canonical-contracts.md) pass with no extra direct dependency or ungrounded external behavior.
- **GW-TR-007-GUIDED-PRODUCTIVE-BOOTSTRAP** — the one-command installer establishes the complete usable local system, including private-provider authentication, exact model binding, persistent access configuration, user-level daemon supervision and health verification. **Acceptance:** §2 productive installation, §19 and P6 §§22–26 pass with no mandatory post-install setup command or model environment variable.
- **GW-TR-008-GOVERNED-FILESYSTEM-ACCESS** — exact target repositories, the portable WorkItem root, Order state and STAGE-only reference roots are distinct least-authority boundaries. **Acceptance:** §§9, 16, 20, 29 and P6 §§22,31 reject alternate source/repository mutation paths, prove root disjointness, and certify that only STAGE receives exact configured external-directory read access.
- **GW-TR-057-PUBLIC-REPOSITORY-RELEASE-AUTOMATION** — public repository delivery is PR-only and releases are version/changelog/tag/asset-bound to one exact master commit. **Acceptance:** §33 and `GW-DOC-PUBLIC-REPOSITORY-DELIVERY` pass; no direct-master release path, mutable release tag or master-clone public distribution remains.

This document does not create a second lifecycle or governance system. Functional ownership remains:

- lifecycle and transitions -> [GW-DOC-WORK-LIFECYCLE-V1](../requirements/work-lifecycle.md);
- validation semantics -> [GW-DOC-VALIDATION-STANDARD-V1](../requirements/validation-standard.md);
- OpenCode semantics -> [GW-DOC-OPENCODE-INTEGRATION-V1](opencode-integration.md);
- project authority -> [GW-DOC-PROJECT-GOVERNANCE-INTEGRATION-V1](../requirements/project-governance-integration.md);
- systems pyramid -> [GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1](../governance/systems-governance.md);
- context resolution/conformance -> [GW-DOC-LIFECYCLE-CONTEXT](../requirements/lifecycle-context.md);
- exact Order P6 data, transport and persistence contracts -> [GW-DOC-CANONICAL-CONTRACTS](../contracts/canonical-contracts.md).

## 2. Locked v1 technology choices

The exact version/provenance baseline for every external dependency is owned exclusively by [GW-DOC-EXTERNAL-FACTS](../references/external-facts.md). This architecture document names required technology families and behavior only; it does not restate dependency version values.

Order v1 uses one TypeScript codebase, with separate production-runtime and development/build/runtime contracts.

### Application runtime

Order v1 productive daemon execution is **Linux-only**. Linux x64 and arm64 are the grounded runtime host families. Windows/macOS support is not implemented opportunistically in P7; either requires a later P4/P6 host-integration contract.

- **TypeScript**, strict mode, command-line compiler/type-checker only; exact pin from `GW-DOC-EXTERNAL-FACTS`;
- **`@types/bun`** for the Bun runtime declarations used by TypeScript; exact pin from `GW-DOC-EXTERNAL-FACTS`;
- **Bun** as Order package manager and production daemon/CLI runtime; exact pin from `GW-DOC-EXTERNAL-FACTS`;
- **Bun.serve** with `development: false` for the loopback Order HTTP server;
- **bun:sqlite** for Order SQLite access;
- **Bun.spawn** with argv arrays, explicit environment/cwd and Order-owned cancellation/process-group handling for Git, OpenCode and verification;
- **Bun.TOML.parse** for `pontivus-order.toml`;
- **Bun.Glob** for canonical repository-pattern expansion;
- **Bun.CryptoHasher("sha256")** for Order SHA-256 identity;
- **`crypto.randomUUID()`** for Order UUIDv4 identifiers and **`crypto.getRandomValues`** for 256-bit Order secrets/tokens;
- **`node:fs statfsSync` under Bun** as one local-filesystem classification input;
- **SQLite**, WAL mode, one local host and one Order writer;
- one re-armed **`setTimeout`** for the daemon-owned periodic coordinator wake-up.

Bun executes/transpiles TypeScript but does not make runtime execution a type-check. The TypeScript build bound by `GW-DOC-EXTERNAL-FACTS` has no supported programmatic compiler API for this contract. Order therefore runs the pinned `tsc` CLI for type checking and does not import a TypeScript compiler API.

The v1 TypeScript compiler contract is exact: `target: "ESNext"`, `lib: ["ESNext", "DOM", "DOM.Iterable"]`, `module: "Preserve"`, `moduleResolution: "bundler"`, `moduleDetection: "force"`, `jsx: "react-jsx"`, `allowImportingTsExtensions: true`, `verbatimModuleSyntax: true`, `isolatedModules: true`, `strict: true`, `noEmit: true`, and `types: ["bun"]`. These are grounded integration requirements in [GW-DOC-EXTERNAL-FACTS](../references/external-facts.md), not P7 choices.

The repository pins exact Bun in `.bun-version`, exact Node in `.node-version`, exact direct package versions with no ranges in `package.json`, and their complete resolution in committed `bun.lock`. Runtime packages and dev/build packages use the exact grouping in [GW-DOC-EXTERNAL-FACTS §2](../references/external-facts.md). CI and verification install through `bun ci`; P7 does not choose a different package manager/install mode. The upstream capability facts for every built-in above are owned by [GW-DOC-EXTERNAL-FACTS](../references/external-facts.md).

### Development/build/browser-test runtime

The Vite, Vitest and Playwright Test builds bound by `GW-DOC-EXTERNAL-FACTS` have Node runtime contracts. Order uses:

- **Node**, pinned in `.node-version` to the exact value owned by `GW-DOC-EXTERNAL-FACTS`;
- Vite build: `node node_modules/vite/bin/vite.js build`;
- Vitest: `node node_modules/vitest/vitest.mjs run`;
- Playwright browser install: `node node_modules/@playwright/test/cli.js install chromium`;
- Playwright tests: `node node_modules/@playwright/test/cli.js test`;
- Bun remains package manager and production Order runtime.

These entry points come from the exact pinned package manifests recorded in [GW-DOC-EXTERNAL-FACTS](../references/external-facts.md). Order does not invoke those CLIs through Bun or an ambient/global binary. Node compatibility is accepted because the pinned tools' documented requirements are satisfied and the build/test certification in [GW-DOC-CANONICAL-CONTRACTS](../contracts/canonical-contracts.md) passes.

### Productive installation, guided setup and launcher

The productive v1 installation surface is one user-invoked command and one continuous Order-owned installer experience. Root `install.sh` is deliberately minimal: after Linux/source-integrity checks it downloads the exact pinned Bun bootstrap runtime into a temporary directory and executes `src/installer.ts` from the verified source commit. It does not install Node/OpenCode/application dependencies, write Order configuration, invoke `order setup`, create launchers/services, or perform daemon health logic.

`src/installer.ts` is the sole productive installer orchestrator. It owns the staged application/runtime installation, guided first-run/update choices, launcher and user-service materialization, activation/rollback, and final health plus fresh productive-readiness proof. After the staged application dependency graph exists it may reuse exactly the canonical guided-setup boundary plus the shell-owned state-path and SQLite installer-upgrade functions required by the P6 update contract; it does not gain a general shell dependency and does not route first-run work through the ordinary CLI. It may ask for operator intent while it is running, but once it reports fresh-install success no additional mandatory configuration or daemon-start action remains. Established update success proves installation and liveness, not productive readiness; existing Settings exposes any remaining productive blockers.

For the normal user-local install it must:

- require Linux plus the grounded host transfer/archive and user-systemd capabilities; it never invokes `sudo` or a distro package manager;
- stage the application/runtime installation before replacement. Re-running the installer is the supported update path: it detects an existing installation, quiesces the existing user service before any persisted-state transition, retains current configuration/provider credentials, upgrades supported previous configuration by preserving existing valid fields and supplying only newly introduced defaultable fields, and applies the P6 beta persisted-state transition policy before starting the new daemon;
- install the exact Bun, Node and OpenCode versions owned by `GW-DOC-EXTERNAL-FACTS` beneath the Order installation root instead of depending on ambient runtime binaries;
- install the committed application dependency graph with pinned Bun, build production `dist/` with the pinned Node/Vite entry point, and refuse completion unless the expected runtime versions and `dist/index.html` are present;
- install one `order` launcher in the user-local bin directory. The launcher prepends only the Order-private Bun/Node runtime paths, fixes `PONTIVUS_ORDER_OPENCODE_BIN` to the installed exact OpenCode binary, fixes the resolved Order state root for installed operation, and executes installed `src/cli.ts` with installed Bun;
- make the default user-local launcher directory available to future login shells idempotently;
- run the installer's own guided configuration phase before daemon activation through the installer-only `runInstallerGuidedSetup` adapter. The ordinary `order setup` adapter remains current-config-only. Both reuse the same internal provider/model/root orchestration, but only the installer adapter may parse a supported immediately preceding config. It preserves the existing model/reference choices. For an already-configured v1 target that proves to be the exact Git top-level root, missing `pontivus-order.toml` is treated as a newly introduced integration artifact rather than changed operator intent: the installer writes a minimal manifest whose `projectId` is derived from the existing root basename and whose P1 authority contains only root `AGENTS.md` when present, validates it through the canonical project-manifest owner, and retains the same target. It does not infer refs, concerns, verification gates or other authority layers. The existing project-manifest shell owner establishes invocation-local creation custody at the exclusive file creation boundary, including failure before validation returns. The installer compensates only a positively proven invocation-owned creation through that owner; an existing, replaced, altered or unprovable object is never treated as a created file merely because of its pathname. Preserve primary and secondary failure, retained material and dependent-restart blocking under the reversible transaction rule below. For a legacy broad target that is not itself an exact Git root, the installer may read the quiesced v1 database only to obtain distinct persisted WorkItem `repositoryRoot` values; each candidate is handled by the same exact-root/manifest rule and must remain contained by an old configured target. This is bounded state-derived migration evidence, not recursive filesystem discovery. Only when no exact Git target can be established does guided update ask for the exact target-repository field before persisting canonical v2; newly introduced defaultable fields still come from P6;
- apply the fresh/unproven versus established-installation admission decision in §34.13; fresh productive setup collects or retains at least one exact validated target Git repository, while established update/recovery retains structurally valid configuration even if no target is currently available. Validate added/changed roots through the existing project owner; broad parent roots are never recursively crawled or treated as a project catalog;
- resolve each target repository's project-local WorkItem documentation root from its validated `pontivus-order.toml`, defaulting to repository-relative `docs/order/work-items`; the installer does not collect an installation-global WorkItem root;
- when upgrading the immediately preceding config/source layout, migrate external WorkItem source Markdown into the deterministic selected-repository location under the P6 v2→v3 migration contract before activating the new daemon; the old external root is migration input only and is never a productive v3 source boundary;
- collect optional read-only STAGE reference roots separately, defaulting to none; choosing `$HOME` or another broad reference root is an explicit operator decision and never a target-project discovery mechanism;
- install/update one user-level `pontivus-order.service` in the standard user-unit configuration location, reload the user manager, enable it, then restart it so both first install and update run the newly activated application; systemd remains limited to process supervision;
- treat predecessor migration, application/launcher replacement, config/state transition and service activation as one reversible transaction until installation commit. Before each effect capture the corresponding existing rollback input; record each successful reversible mutation in the invocation's transient typed state. Failure after any intermediate mutation restores only completed changes in reverse dependency order, including partially moved predecessor install/state/database namespaces, application and launcher independently, config, archived database, installer-created manifests and prior service unit/enablement/activity. Quiesce the newly activated service before restoring its application/state; restart the prior service only after restoration where host supervision permits. Capture the previous service unit and supported enablement/activity before the first service mutation; ambiguous unsupported host state stops before mutation rather than being guessed. A failed rollback reports the original failure and the remaining recovery material, never deletes the only recoverable copy or reports success. No persistent transaction ledger or second owner;
- installer namespace custody relies on the existing sole Order state writer rule: supported installation/update is a maintenance interval with only the admitted installer migration and then the supervised Order daemon writing the Order database/state. Before installation mutation, tell the operator to stop other Order instances, external database clients and concurrent edits to installer-created integration files until completion. Arbitrary concurrent external writers or pathname replacement are outside supported transactional isolation; systemd inactivity alone cannot establish their absence and ordinary SQLite locks do not serialize namespace renames/unlinks. At each admitted effect boundary verify exact expected object identity, bytes where immutable, membership and recovery material; observed interference or unprovable custody blocks dependent effects or compensation, preserves affected objects and recovery copies, and prohibits unsafe prior-service restart. Never promote an unexpected object into invocation custody merely by observing it after startup. Do not assert race-free protection against an independent same-user writer, introduce a second state writer, or change ordinary SQLite access policy;
- refuse installation commit until normal service liveness and the applicable readiness admission in §34.13 pass. Atomically publish the existing source marker at that boundary for fresh and established attempts. Publication failure is pre-commit failure. After successful publication, do not enter the reversible rollback handler: retire only superseded predecessor artifacts/backups and update the shell profile as post-commit finalization. If finalization fails, preserve the committed application, config and service; retain remaining recovery material, identify incomplete cleanup with safe actionable diagnostics and return failure (nonzero), explicitly stating the installation was committed but finalization did not complete. Never print ordinary success in that case. An uninterrupted successful invocation reports fresh/update success only after finalization completes. Reruns resolve history under §34.13 and may clean only positively identified superseded material; do not scan/guess/delete ambiguous backup paths. When retained predecessor material causes the existing migration-conflict guard to block a rerun, identify the conflicting canonical paths and instruct the operator to resolve the conflict before retry; never automatically delete or combine installations. Process interruption before commit is not proof of completion; after commit, cleanup interruption does not authorize destructive rollback.

The default application/runtime installation root is `$HOME/.local/share/pontivus-order`; the default launcher path is `$HOME/.local/bin/order`. `PONTIVUS_ORDER_INSTALL_ROOT` and `PONTIVUS_ORDER_BIN_DIR` may override those packaging locations when supplied as absolute paths. The productive installer resolves the P6 state root and loopback bind once and binds the installed launcher/service to those values; callers are not required to export state/model/bind variables after installation.

Provider credentials remain OpenCode-owned in Order's private namespace. The installer does not import the ambient user's OpenCode database/configuration and does not store provider secrets in Order config.

The user-level systemd unit is a host supervisor only. It starts exactly the installed Order launcher with `daemon`, may restart it on process failure, and owns no workflow, scheduler, retry, provider-session or persistence semantics. `orderd` remains the sole Order state writer and scheduler owner.

### Browser UI

- **React** and **React DOM**, at the exact pins owned by `GW-DOC-EXTERNAL-FACTS`;
- **`@types/react`** and **`@types/react-dom`**, at the exact pins owned by `GW-DOC-EXTERNAL-FACTS`;
- **Vite**, exact pin from `GW-DOC-EXTERNAL-FACTS`;
- **Tailwind CSS** with **`@tailwindcss/vite`**, exact pins from `GW-DOC-EXTERNAL-FACTS`;
- **TanStack Query** for daemon-owned/server state, exact pin from `GW-DOC-EXTERNAL-FACTS`;
- **Zod** for canonical runtime schemas, exact pin from `GW-DOC-EXTERNAL-FACTS`;
- **Vitest** and **`@playwright/test`** for UI/integration validation, exact pins from `GW-DOC-EXTERNAL-FACTS`.

The automated v1 browser compatibility target is the exact Playwright-owned Chromium build bound by `GW-DOC-EXTERNAL-FACTS`. P7/CI explicitly installs that browser through the local Playwright CLI; package installation alone is not treated as browser installation. Order does not claim Firefox/WebKit compatibility in v1 without an explicit later certification change.

The UI is a static client SPA built by Vite and mounted with `react-dom/client.createRoot`; there is no SSR/hydration framework. Limited URL/search state uses the platform `URL`, `URLSearchParams` and History APIs; there is no router dependency.

Vite already transforms TSX; Order does not add `@vitejs/plugin-react` merely for TSX compilation because its additional React Fast Refresh capability is not a v1 requirement. Tailwind integration is exactly one `@tailwindcss/vite` plugin in `vite.config.ts` plus one application stylesheet `@import "tailwindcss";`; no parallel PostCSS/Tailwind build path exists. Order's client-only SPA has no React Server Component consumer for dependency `"use client"` directives. The production build therefore disables only Rolldown's `moduleLevelDirective` diagnostic through Vite's supported `build.rolldownOptions.checks` surface; it does not install a generic warning filter or suppress unrelated build diagnostics.

Vitest is explicitly Node-environment-only for functional-core, shell-unit and non-browser integration tests. DOM/browser behavior is validated by the pinned Playwright Chromium suite, so P7 does not add jsdom, happy-dom, React Testing Library or a Vitest browser package.

The complete permitted direct package set is closed by [GW-DOC-EXTERNAL-FACTS §8](../references/external-facts.md). P7 may not add convenience packages for TOML, UUIDs, hashing, globbing, SQLite, HTTP, scheduling, browser state, routing, DOM emulation/testing or other already-covered facilities.

No Node-only server framework, ORM, workflow engine, message broker, DI framework or RPC framework is introduced.


### UI primitive ownership

Order owns its local Workbench semantic UI boundary through two P4 owners: `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2` owns primitive/composition responsibilities, while `GW-DOC-WORKBENCH-THEME-V1` owns exact theme tokens, component visual parity and stylesheet governance.

v1 has no runtime or source dependency on a private Pontivus code repository. Reusable Order-local primitives live under `ui/src/primitives/`; interaction primitives may use the public Astryx dependencies authorized by `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2`.

No private-source vendoring contract is part of the current architecture. Local primitives must remain target-project/domain neutral, vendor-clean, free of deprecated Radix/Tremor imports, and must not acquire WorkItem/Run/lifecycle/query semantics that belong to higher composition layers.

The Workbench structural primitive vocabulary is closed by `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 §8.12-§8.16`. In particular:

- persistent Workbench topology is created only by the local structural primitives;
- feature/workflow surfaces map canonical domain data into primitive slots rather than importing structural Astryx Layout/Drawer APIs directly;
- structural primitives own responsive mechanics and fixed geometry tokens but no lifecycle policy or server state;
- primitive APIs are deliberately constrained and do not expose arbitrary sidebar/column/width/breakpoint configuration;
- content count may change rows/items but cannot select another persistent topology;
- the primitive layer is therefore the mechanical enforcement boundary for the Workbench's interaction-space classes, not merely a visual convenience wrapper.

The visual enforcement boundary is closed by `GW-DOC-WORKBENCH-THEME-V1`: one root theme preference/substrate, the pinned public Astryx token language plus only genuinely Order-specific structural/readability tokens, and one Order-authored presentation stylesheet. Primitives/specialists consume that theme language; feature modules cannot define local palettes, type/spacing systems, theme islands or alternate component chrome.

Order does not introduce a replacement primitive framework merely to recreate behavior the pinned design system already owns. Under `GW-TR-103-ASTRYX-FOUNDATION-CONFORMANCE` and `GW-DOC-EXTERNAL-FACTS`, a local semantic primitive composes the suitable Astryx component for low-level interaction/accessibility/state mechanics, exhausts supported props/layout/density/public theme tokens before custom CSS, and never targets private `--_` variables or generated/internal selectors. The local primitive continues to own the narrower Order semantic API and composition rule; Astryx does not own Order information architecture, domain semantics, browser/server state or lifecycle behavior.

Generic foundation guidance remains subordinate to the P3 product contract. The canonical ten-stage rail (including Acceptance) therefore is not forced into Astryx Stepper (whose pinned guidance recommends another pattern above seven steps), no AppShell SideNav is added to Order's single-navigation-axis Workbench, and a wide docked Context does not become a floating Drawer merely because Drawer exists.

### Workbench technical boundary

`GW-DOC-WORKBENCH-UX-V2` is the current functional authority for Workbench behavior. The exact component/state-machine realization is owned by `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2`; exact theme/styling realization is owned by `GW-DOC-WORKBENCH-THEME-V1`. Both are derived from the functional authority rather than from the superseded presentation implementation.

The current binding Workbench realization is closed by `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2` together with `GW-DOC-WORKBENCH-THEME-V1`.

Implementation therefore preserves these exact boundaries:

1. reusable project-neutral UI behavior remains under `ui/src/primitives/`;
2. Astryx remains the interaction/theme substrate beneath Order's semantic boundary and never owns lifecycle, information architecture, browser/server state or independent feature theming;
3. the browser does not own a parallel workflow state machine or canonical mutation policy;
4. Workbench actions and attention state derive from the canonical workflow observation/state language owned by the current Workbench P4 design;
5. presentation changes preserve FCIS/SoC and do not introduce DTO/view-model families for canonical domain state;
6. spatial composition, primitive ownership, renderer coverage, responsive behavior and theme/styling are implemented exactly from the current Workbench P4 owners; superseded implementation shapes have no authority.

### Live technical identity and predecessor migration

Order has one productive technical identity. Runtime/productive aliases for the predecessor Gateweft identity are prohibited.

The installer is the sole bounded predecessor-migration boundary. It may recognize the immediately preceding Gateweft beta installation only to migrate it one way into Order. It must stop/prove quiescence of the predecessor service before moving state, reject coexistence of predecessor and Order productive roots, preserve valid provider/configuration state without fabricating semantics, rename database/service/install artifacts only inside the installer transaction, roll back consistently on activation failure, and retire predecessor artifacts only after the Order installation is healthy.

Target-project loading accepts only `pontivus-order.toml`. A repository that still has only `gateweft.toml` is blocked with an actionable migration message; Order does not rewrite that governed target repository automatically.

Historical predecessor task-fence/publication sequencing is not current product authority and is retained only in Git history.

## 3. System topology

```text
                         LOCAL MACHINE

+------------------------------------------------------------+
|                      Browser UI                            |
| React/Vite SPA                                             |
|                                                            |
| investigation / requirements / design / planning           |
| evidence / authority / decisions / sign-off / candidate    |
+------------------------------+-----------------------------+
                               |
                              HTTP
                               |
                               v
+------------------------------------------------------------+
|                        orderd                           |
| TypeScript / Bun                                            |
|                                                            |
|   +---------------- FUNCTIONAL CORE --------------------+   |
|   | lifecycle                                           |   |
|   | authority + concern resolution                      |   |
|   | context + conformance                               |   |
|   | approval + task eligibility                         |   |
|   | validation + reaction + invalidation                |   |
|   +------------------------------------------------------+   |
|                               |                            |
|   +---------------- IMPERATIVE SHELL -------------------+   |
|   | SQLite | filesystem | Git | workspace | OpenCode V2 |   |
|   | project verification | HTTP | scheduler/CLI edge   |   |
|   +------------------------------------------------------+   |
+----------+--------------------+-------------------+----------+
           |                    |                   |
        SQLite          local repository        OpenCode
                                                    |
                                             project gates
```

The browser and CLI are clients of the daemon. Neither owns workflow state.

The daemon remains operational when the browser is closed.

## 4. Local repository model

The user's local repository is the engineering authority during pre-signoff work.

### Pre-signoff

R1, R2, DESIGN, PLAN and R3 may inspect the current local repository and Git state through Order's governed shell.

Interactive work may propose changes to canonical repository artifacts. A proposal becomes authority only after explicit adoption into the local repository.

Uncommitted repository state may be evidence during investigation/design/planning. It is not signable execution authority.

### Sign-off boundary

Before sign-off, every material artifact must be committed and byte-identical to the selected approval baseline commit.

```text
interactive working state
        |
        v
material canonical artifacts
        |
        v
committed Git baseline
        |
        v
R3 READY_FOR_SIGNOFF
        |
        v
explicit human approval
```

### Post-signoff

Implementation never uses the human working tree.

Each execution run creates a fresh Order-owned isolated checkout at the exact approved baseline commit.

## 5. Functional core

The functional core contains data and pure/effect-free functions only.

It owns:

- lifecycle eligibility and transitions;
- authority/default/override resolution;
- engineering-concern applicability;
- stage-context resolution;
- context completeness;
- conformance/promotion;
- artifact/package hashing inputs and comparison;
- approval validity;
- execution-task materialization and eligibility;
- dependency evaluation;
- validation requirements and classification;
- semantic event -> reaction decisions;
- remediation/retry policy;
- dependency invalidation.

Conceptually:

```text
resolveAuthority(...)
resolveConcerns(...)
resolveStageContext(...)
evaluateTransition(...)
evaluateConformance(...)
materializeExecutionTasks(...)
classifyValidation(...)
decideReaction(...)
```

These are functions over canonical typed data. They are not services or classes.

## 6. No-OOP / no-DTO implementation rule

Order-owned application code defines **no classes**.

Specifically prohibited:

- domain classes;
- service classes;
- repository classes;
- controller classes;
- inheritance-based behavior;
- mutable behavior-bearing object graphs;
- dependency-injection containers;
- DTO/request/response model families that duplicate canonical semantic types;
- persistence models that recreate domain meaning;
- mapper layers between equivalent shapes.

React uses function components.

Third-party runtime APIs may internally require object construction, for example opening a Bun SQLite database. Such vendor objects remain confined to the imperative shell and never become Order semantic owners.

Transport and persistence either:

1. encode/decode the canonical P6 type directly; or
2. carry minimal command arguments or ephemeral provider-stream frames that are not alternate representations of a domain concept.

The exact canonical types are owned by [GW-DOC-CANONICAL-CONTRACTS](../contracts/canonical-contracts.md).

## 7. Minimum physical implementation shape

The architectural boundaries are fixed; a directory/file per concept is **not** required.

The smallest permitted v1 repository shape is:

```text
order/
├── src/
│   ├── core/       # canonical schemas + pure lifecycle/governance/reaction functions
│   ├── shell/      # SQLite, Git/files, OpenCode, verification
│   ├── daemon/     # functional control-plane orchestration + HTTP/startup
│   └── cli.ts      # thin operational commands
├── ui/
│   └── src/        # React application + copied approved primitives
├── tests/          # only tests required to prove the implementation
├── pontivus-order.toml.example
├── package.json
├── tsconfig.json
├── .bun-version
├── .node-version
└── bun.lock
```

Implementation uses the **fewest physical modules that preserve the dependency boundaries below**. Physical module count is subordinate to semantic cohesion: a smaller file set is not preferred when it couples distinct present responsibilities.

It must not create:

- empty architectural directories;
- one-file directories solely to mirror documentation headings;
- barrel/index modules that only re-export names;
- generic `services/`, `repositories/`, `adapters/`, `providers/`, `interfaces/`, or `use-cases/` layers;
- a generic provider interface/registry while OpenCode is the only provider;
- a persistence/repository abstraction over the single SQLite implementation;
- a scheduler abstraction over the single daemon timer;
- a command/event bus around direct function calls;
- generated HTTP clients or transport models for this same-process repository;
- a database migration/legacy-compatibility framework; the current implementation supports only the current productive schema.

A boundary may start as a small number of functions in one module. Split it when a present semantic responsibility, effect boundary, or independently testable invariant requires the split.

### Module cohesion and required decomposition

The physical module surface follows the semantic/effect boundaries above; it is not a license to accumulate unrelated responsibilities in one authorized file.

- each production module owns one current architectural responsibility within its layer;
- `src/daemon/coordinator.ts` owns only top-level control-plane composition: task/run scheduling, recovery, operator commands and scheduler decisions. Pre-signoff stage, authority/sign-off, validation and post-signoff execution orchestration are owned by their exact daemon modules below. The coordinator does not own lifecycle/governance policy, SQLite mechanics, filesystem/workspace mechanics, provider/process mechanics or HTTP transport semantics;
- `src/daemon/server.ts` owns loopback HTTP/startup transport behavior and does not become a second workflow/policy owner;
- `src/core/*` owns canonical typed meaning and pure policy/transformation only;
- `src/shell/sqlite.ts`, `repository.ts`, `runtime.ts`, `config.ts`, `process.ts`, `project.ts` and `opencode.ts` own their concrete effect mechanics and do not decide lifecycle/governance policy.

A same-layer split is **required** when current implementation evidence shows that one module contains two or more present responsibilities that can be tested or changed independently, or when preserving an existing semantic/effect boundary would otherwise require the module to own another boundary's mechanics. The required split remains functions over canonical typed data and does not introduce a service/repository/controller object, DTO family, mapper layer, provider registry or speculative abstraction.

A minimal same-layer physical split required to preserve an already-binding responsibility/effect boundary is an architecture-preserving implementation necessity. It may be performed in the current implementation when it only moves or groups existing behavior inside the declared layer, preserves canonical semantic ownership, public contracts, state meaning and dependency direction, and introduces no unrelated behavior or abstraction. The final change evidence records the actual files.

If a split requires a new semantic owner, public contract, state model, effect boundary, dependency direction, external dependency, or behavior outside the approved task, that is an architecture change and returns to DESIGN/PLAN. It is not compliant to keep adding functions to a catch-all module merely to avoid a physical split.

When an architecture-preserving split introduces a new production module, the same implementation change must register the module's explicit same-layer dependency allowance and any mechanically checkable owner constraint in permanent architecture fitness. Ordinarily this extends `tests/architecture.test.ts`. When that file is part of the signed Approval's `VERIFICATION_MATERIAL` closure and is therefore immutable under `GW-DOC-CANONICAL-CONTRACTS`, the Workbench V2 change instead adds its new module/owner/primitive/renderer/forbidden-mechanic assertions to the existing `tests/certification.test.ts`, executed by the signed `test` gate. This is a physical sensor-placement rule, not permission to alter `tests/architecture.test.ts`, bypass the `architecture` gate, reduce the baseline dependency DAG, omit required assertions or weaken the architecture fitness standard. The candidate must pass both gates, and any future change requiring alteration of immutable verification material returns to the owning authority before sign-off.

Raw file length, LOC and function count are diagnostic review signals only. They may trigger investigation, but architecture compliance is decided by responsibility ownership and boundary preservation rather than a numeric size limit.

### v1 canonical module-responsibility map

The P7-14 decomposition is now the canonical v1 physical ownership map. These are functional modules, not objects or service layers. Continuous implementation extends these owners according to the cohesion/extension law above rather than re-aggregating responsibilities into generic or orchestration modules.

```text
src/core/
  contracts.ts    # canonical strict schemas/types only
  canonical.ts    # canonical deterministic representations/transforms
  governance.ts   # authority/context applicability, concern/material resolution, freshness/invalidation
  lifecycle.ts    # WorkItem transition policy + closed browser-safe workflow-state/attention/recovery/rail derivation
  execution.ts    # signed-task parsing/materialization, eligibility/completion, provider admission, repair/recovery policy

src/shell/
  config.ts     # canonical OrderConfig file materialization/canonical root normalization

src/daemon/
  runtime.ts      # ephemeral daemon runtime data + constructor + process-local synchronization guards
  run.ts          # common Run/RunEvent/evidence/provider-session mechanics
  authority.ts    # resolved stage/approval context, signed authority closure, sign-off package/materialization
  stage.ts        # pre-signoff R1/R2/DESIGN/PLAN/R3 orchestration and proposal disposition
  validation.ts   # V0-V7 validation/evidence/gate orchestration
  execution.ts    # post-signoff BUILDER/REVIEWER/REMEDIATOR and candidate orchestration
  coordinator.ts  # top-level work/task scheduling, recovery, cancel/resume and public control-plane commands
  server.ts       # loopback HTTP/startup transport
```

`src/core/policy.ts` has no canonical owner and must remain absent rather than return as a compatibility/barrel module. No new `index.ts`, façade-only module, service/repository/controller object, DTO/model family or mapper layer is introduced.

The daemon same-layer dependency direction is:

```text
runtime
  ↑
run
  ↑
authority
  ↑        ↖
stage    validation
           ↑
        execution

coordinator -> runtime + run + authority + stage + validation + execution
server      -> runtime + coordinator
```

More exactly:

- `runtime.ts` imports no other daemon module and owns only ephemeral process state/synchronization such as active provider/turn tracking and the per-WorkItem operator-mutation guard; none of that state is canonical workflow authority;
- `run.ts` may depend on `runtime.ts`;
- `authority.ts` may depend on `runtime.ts` and `run.ts`;
- `stage.ts` may depend on `runtime.ts`, `run.ts` and `authority.ts`;
- `validation.ts` may depend on `runtime.ts`, `run.ts` and `authority.ts`;
- `execution.ts` may depend on `runtime.ts`, `run.ts`, `authority.ts` and `validation.ts`;
- `coordinator.ts` may compose all lower daemon modules but none of those modules imports `coordinator.ts`;
- `server.ts` may depend on `runtime.ts` and `coordinator.ts`; no lower daemon module imports `server.ts`;
- `stage.ts` and `execution.ts` do not depend on each other.

The core policy modules depend only on `contracts.ts` and `canonical.ts` where required. They do not depend on each other merely to share helpers; shared semantic meaning stays with its canonical owner and callers compose the exported pure functions.

The existing large files `src/shell/sqlite.ts`, `src/shell/opencode.ts`, `src/daemon/server.ts` and `src/core/contracts.ts` remain centered on one concrete integration/transport/schema owner. Size alone is not sufficient reason to split them. Their current boundary contracts include:

- signed `order-tasks` Markdown extraction/validation is pure execution-contract parsing owned by `core/execution.ts`; SQLite owns only concrete persistence/reconstruction mechanics;
- byte equality is owned by the runtime utility boundary and is not duplicated in coordinator orchestration.

Additional same-layer physical splits are permitted only by the architecture-preserving extension law above. Opportunistic fragmentation remains prohibited, but a cohesive split needed to prevent a second present responsibility from accumulating is required and does not by itself trigger another governance cycle.

Dependency direction:

```text
ui -------------> browser-safe core schemas + pure lifecycle policy + exact PLAN inspection parser exception below
ui -------------> daemon HTTP

cli ------------> daemon startup/HTTP transport
cli ------------> shell/runtime for local state-root/token bootstrap
cli ------------> shell/config for guided operator configuration
cli ------------> shell/opencode for guided setup and operator provider login

daemon ---------> core
daemon ---------> shell
shell ----------> core schemas where needed

core -----------> no effectful Order module
```

The browser-safe UI/core boundary is exact: UI may import canonical schemas/types from `src/core/contracts.ts` and the pure lifecycle policy owner `src/core/lifecycle.ts`. UI consumes that lifecycle owner for WorkItem transition/editability policy and the closed `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2` workflow-state language: STAGE interaction/input, reached state, proposal decision/adoption, currentness normalization, execution owner/validation boundary, recovery, coherence, current attention and workflow-rail projection. These are pure in-process decisions over canonical facts only; they are not persistence/transport/browser-state models. No other core policy module becomes a UI workflow-semantics dependency through this exception. For inspection of exact governed PLAN bytes only, `ui/src/DocumentWorkspace.tsx` may directly import the two named pure functions `parseSignedTaskBlockFromPlan` and `admitSignedTaskBlockForSchema` from the existing canonical `src/core/execution.ts` parser owner. This is a closed, consumer-and-symbol-specific exception, not a general UI dependency on execution policy: no namespace/default/dynamic/re-export import, other execution symbols, other UI consumer, task creation, execution admission, sign-off, new parser or effect boundary. The functions consume exact bytes and schema identity, return the existing canonical task block or reject, and remain shared with daemon execution admission. The architecture fitness sensor enforces the exact named-import edge; PLAN inspection grants no execution authority.

Forbidden dependency directions:

- core -> shell;
- core -> daemon;
- core -> UI;
- UI -> SQLite/Git/OpenCode;
- shell -> UI;
- shell deciding lifecycle/governance policy;
- CLI -> shell modules other than the explicit `runtime`, `config` and `opencode` bootstrap/setup boundaries.

## 8. Canonical P6 model ownership

The canonical P6 data model is defined in [GW-DOC-CANONICAL-CONTRACTS](../contracts/canonical-contracts.md).

The initial top-level semantic concepts are:

- `WorkItem`;
- `ArtifactRef`;
- `Approval`;
- `ExecutionTask`;
- `Run`;
- `RunEvent`.

Nested value types may exist where they represent part of one of those concepts, but they do not create parallel owners.

One Zod schema is canonical for each semantic type; the TypeScript type is inferred from that schema. Daemon, CLI and browser import the same schema/type source where the environment permits.

## 9. Project integration manifest

v1 uses one project-owned root manifest:

```text
pontivus-order.toml
```

The manifest stores references and operational bindings only. It must not copy project requirements, architecture, ADR text, contracts or other semantic authority.

It owns:

- project id;
- P1-P6 authority source patterns plus explicit same-layer precedence references;
- stable `AuthorityRef` -> canonical source-file mappings used by signed tasks and context resolution;
- explicit references for Order P1 overrides/extensions and their fitness gates;
- project concern ids;
- deterministic repository-surface -> concern mappings;
- concern-specific authority references;
- concern-required logical gates;
- logical verification gate -> exact argv/cwd/timeout/environment/material-reference binding.

The exact manifest grammar is owned by [GW-DOC-CANONICAL-CONTRACTS](../contracts/canonical-contracts.md).

Verification commands are argv arrays, never interpolated shell strings.

## 10. Engineering-concern applicability

Engineering concerns are project-defined applicability metadata, not lifecycle stages or agent classes.

Examples may include `ui`, `accessibility`, `backend`, `api`, `data`, `migration`, `infrastructure`, `security`, `performance`, `observability` and `ci`.

Order does not assign product semantics to the names.

The applicable set is resolved from:

1. concern ids already on the `WorkItem`;
2. validated upstream classification;
3. deterministic surface mappings in `pontivus-order.toml`;
4. signed P7 task concern ids.

Concern resolution feeds the existing context resolver.

## 11. P7 execution-task representation

The P7 plan remains project authority.

v1 requires exactly one machine-readable fenced block in the signed plan:

````text
```order-tasks
{
  "version": 1,
  "tasks": [
    {
      "id": "T1",
      "objective": "Implement the approved outcome",
      "dependsOn": [],
      "scope": ["src/example/**"],
      "exclusions": [],
      "acceptanceRefs": ["FR-1"],
      "changeSurface": ["src/example/**"],
      "gateIds": ["backend-regression"],
      "authorityRefs": ["FR-1", "ADR-2", "SPEC-3"],
      "concernIds": ["backend"]
    }
  ]
}
```
````

The exact task-block schema is defined in [GW-DOC-CANONICAL-CONTRACTS](../contracts/canonical-contracts.md).

Rules:

- the block is the only machine-readable P7 task authority;
- runtime never asks an LLM to infer tasks from arbitrary plan prose;
- R3 validates the block against the surrounding plan/design/requirements;
- sign-off displays the exact parsed task records;
- `ExecutionTask` values are deterministic post-approval materializations;
- task dependencies govern eligibility only; v1 does not merge, commit, rebase, or otherwise compose one task's candidate workspace into another task;
- because every post-signoff Run starts from the same approved baseline, two tasks may be dependency-linked only when the downstream task does not require the upstream candidate bytes; cumulative implementation that must be validated as one repository state is one signed task with ordered internal steps;
- prose/block mismatch is a readiness failure.

## 12. Artifact identity and reproducible approval

v1 uses SHA-256 over exact bytes.

Each material `ArtifactRef` identifies an exact repository file at an exact baseline.

Approval package hashing uses Order canonical JSON defined in [GW-DOC-CANONICAL-CONTRACTS](../contracts/canonical-contracts.md).

Before sign-off:

- one Git commit is selected as approval baseline;
- every material artifact is reachable at that commit;
- the working-tree version of each material artifact is byte-identical to that commit;
- `pontivus-order.toml` and material verification scripts/config/lockfiles are included where applicable.

Material uncommitted authority blocks sign-off.

## 13. Interactive stage runs

IDEA, R1, R2, DESIGN and PLAN may be interactive. R3 may also accept human navigation/inspection, but its readiness judgment remains independent.

Interactive execution does not create a second workflow.

`Run.mode` is either `INTERACTIVE` or `UNATTENDED`.

An interactive run may enter `WAITING_FOR_INPUT` without changing the `WorkItem` lifecycle stage.

Conversation is evidence and collaboration, not hidden authority.

A human statement may be an investigation lead, evidence, a stage-local preference allowed by the current stage, or a higher-layer authority decision.

Where an interactive Run statement changes canonical authority, Order creates an explicit artifact proposal and requires adoption before treating it as authority. The governed Markdown workbench is the separate explicit human-authoring ingress defined by `GW-DOC-MARKDOWN-WORKBENCH-V1`: direct Save of an authorized WorkItem/R1/R2/DESIGN/PLAN Markdown document writes canonical bytes through the guarded mutation path, invalidates downstream conformance and returns ownership to the edited stage without creating a synthetic proposal.

## 14. Artifact proposals

An agent may propose a change to a repository-owned canonical artifact during an interactive pre-signoff run.

The proposal is an `ARTIFACT_PROPOSAL_CREATED` `RunEvent` containing:

- target repository path;
- base artifact hash, or null for a new file;
- governing authority layer;
- exact unified diff;
- concise rationale.

The event id is the proposal identity.

The UI exposes only **Adopt** and **Reject** in v1. Editing a proposal is not a second mutation path: the user rejects the old proposal and a different patch is produced as a new proposal event.

Adoption:

1. loads the exact persisted proposal event;
2. verifies its persisted base hash still matches;
3. applies that exact persisted patch to the user's local repository;
4. records a new `ArtifactRef`;
5. emits `ARTIFACT_PROPOSAL_DISPOSITIONED`;
6. invalidates affected downstream conformance;
7. re-resolves context before the next productive agent turn.

Conversation text alone never mutates an authoritative artifact.

## 15. OpenCode stage-session boundary

The verified v1 integration uses the exact OpenCode server/client pair bound by `GW-DOC-EXTERNAL-FACTS`.

A new Order Run starts a fresh OpenCode session. Ordinary turns may continue it only while `contextHash`, provider/model and effective permissions are unchanged.

A material authority/context change requires persist/adopt -> re-resolve context -> update the Run's current `contextHash` -> replace the OpenCode session -> render the next turn from current canonical context. The prior provider session is evidence only.

If continuity cannot be proven during a pre-signoff read-only `STAGE` Run, Order may replace that Run's provider session from current canonical context. Post-signoff provider loss never replaces a session in place: the current `BUILDER`, `REVIEWER` or `REMEDIATOR` Run terminates under the bounded operational-loss policy, and any permitted automatic replacement is a new same-role/same-trigger Run with a fresh D1 checkout and fresh OpenCode session.

Sessions never cross Runs, lifecycle stages or work items.

## 16. OpenCode V2 server/client contract

Order owns one foreground OpenCode provider process and its matching V2 client at the exact pins bound by `GW-DOC-EXTERNAL-FACTS`. OpenCode remains an execution provider, never lifecycle/retry/context/completion authority.

The exact provider isolation/bootstrap contract is owned by [GW-DOC-OPENCODE-INTEGRATION-V1 §§2-8](opencode-integration.md) and mechanically closed by [GW-DOC-CANONICAL-CONTRACTS §§25-26,29](../contracts/canonical-contracts.md):

- launch `opencode serve --hostname 127.0.0.1 --port 0`;
- derive the actual private loopback endpoint only from the pinned bounded startup report, then authenticate and prove exact server-info readiness/version within 60 seconds;
- use a Order-private `HOME`, XDG config/data/state/cache roots and `OPENCODE_DB`;
- fail closed when Linux `/etc/opencode` exists because pinned foreground `serve` cannot disable that system-config source;
- disable project/Claude compatibility discovery with the pinned flags certified for the bound OpenCode build;
- treat pinned read-triggered nested `AGENTS.md` injection only as a rendering of Order-pre-resolved, material P1 authority; unresolved repository instruction files block productive invocation;
- install deny-first, exact role-specific permissions; STAGE may receive only the configured P6 reference-root `external_directory` read boundary and its prompt lists those roots as non-authoritative read-only locations, while every post-signoff role remains external-directory denied; BUILDER/REMEDIATOR native edit capability is a transient signed-scope envelope with immutable authority/instruction/Git/symlink hard denies, while exact scope/exclusion semantics remain coordinator-owned and `ExecutionTask.changeSurface` is only the immutable forecast;
- bind and read back the exact provider/model from the canonical persisted Order configuration; silent fallback is rejected;
- derive one deterministic prompt id from persisted Order identity; no event stream or experimental wait endpoint is correctness authority; the event stream may be consumed best-effort only for bounded/redacted operator-visible activity under `GW-DOC-OPENCODE-INTEGRATION-V1`;
- prove terminal completion through advancing `time.idle` + outcome + final context;
- bound every productive turn to 3600 seconds and interrupt/fail if terminal success cannot be proved;
- allow at most one tool-disabled format-repair turn.

OpenCode session state never crosses a Order Run. Every post-signoff builder, reviewer or remediator replacement is a new Run with a fresh P5-D1 checkout and fresh OpenCode session. Exact candidate bytes cross those Runs only through Order evidence as defined in §24/P6.

The released client contract is the integration authority. Order does not add a provider abstraction or mix in the legacy SDK to recover removed capabilities.

## 17. Daemon and transport

`orderd` is the sole state-mutating process.

It serves:

- the built Vite SPA from the fixed repository-root `dist/` output owned by the Vite contract;
- one same-origin loopback HTTP API.

`src/daemon/server.ts` locates that static tree relative to its own module, not `process.cwd()`: the canonical static-root URL is `new URL("../../dist/", import.meta.url)`. Startup requires a regular `dist/index.html`; missing built assets are a startup/precondition failure, not a fallback to Vite development serving or another static root.

v1 binds to loopback only. Remote/multi-user hosting is out of scope.

The exact HTTP contracts are owned by [GW-DOC-CANONICAL-CONTRACTS](../contracts/canonical-contracts.md).

Important rules:

- all browser API calls use relative same-origin URLs; browser `fetch` sets `credentials: "same-origin"` explicitly and retains the standard `cors` mode so non-GET/HEAD mutations carry the real `Origin` header under the daemon's `no-referrer` policy;
- CLI authentication uses only `Authorization: Bearer <daemon-token>`; credentials are never accepted in CLI query parameters or request bodies;
- all mutations are explicit HTTP commands;
- canonical server state is read through ordinary HTTP queries;
- one TanStack Query `QueryClient` owns daemon query caching with query `retry: false`, mutation `retry: false`, `refetchOnWindowFocus: false`, `refetchOnReconnect: false`, and `staleTime: 0`; while a selected WorkItem has an active Run, its single-WorkItem query, Run list and active RunEvent queries poll every 1000 ms; when a Run terminalizes the browser performs the final event drain and affected WorkItem/task/artifact/package refetch required by `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2` before exposing a next workflow action; successful mutations explicitly invalidate/refetch only affected keys;
- no browser WebSocket/SSE protocol exists in v1;
- no OpenCode token/progress stream is forwarded to the browser;
- browser code never talks directly to Git, SQLite or OpenCode;
- no CORS wildcard;
- browser mutations require exact daemon Origin plus authenticated local session;
- a daemon-local secret protects CLI/browser bootstrap.

The absence of streaming is deliberate: Order interaction occurs at durable agent-turn/question/proposal boundaries, so a second transport and ephemeral token stream do not justify their code surface.

## 18. Human interaction and sign-off

The local UI is the primary interactive interface.

The CLI remains a thin operational client for scripting and terminal users.

The UI supports:

- creating an IDEA;
- listing/inspecting work;
- starting/resuming interactive stage runs;
- agent/user investigation dialogue;
- evidence and authority inspection;
- reviewing/adopting/rejecting artifact proposals;
- continuing an active interactive STAGE Run after a non-blocking turn/proposal boundary, including a proposal disposition that did not also emit `HUMAN_INPUT_REQUESTED`; the same input surface shows the exact blocking question when the Run is `WAITING_FOR_INPUT`;
- viewing blockers/open questions;
- reviewing R3;
- explicit sign-off;
- candidate/evidence inspection;
- selecting `System | Light | Dark` appearance, with System as the default and live system-following mode.

The appearance choice is presentation-local browser state. An explicit Light or Dark override may be retained in browser storage; System is represented by the absence of that override. Theme changes never call a daemon mutation, alter workflow state, or change canonical work material. Exact root-theme activation, persistence key, token values, specialist coverage and stylesheet governance are owned by `GW-DOC-WORKBENCH-THEME-V1`.

Sign-off is performed through the local UI using the daemon sign-off command and the exact currently displayed package hash.

## 19. CLI and daemon-owned scheduler topology

The v1 CLI is a thin client/host edge. Its fixed command surface is:

```text
order daemon
order setup [--reconfigure]
order open
order status
order tick
order provider login <provider>
```

- `daemon` runs `orderd` in the foreground for the installed user service and explicit diagnostics; ordinary installed operation is supervised by the user-level `pontivus-order.service`;
- `setup` is the explicit post-install reconfiguration/recovery surface for the same canonical P6 configuration. Bare `order setup` reuses an already-valid configuration/credential binding without prompting; `order setup --reconfigure` explicitly reopens model/root choices. The productive installer does not invoke either CLI form; both the installer and CLI reuse one canonical guided-configuration functional boundary;
- `provider login <provider>` remains a narrow maintenance/recovery command for the same private OpenCode credential namespace; normal first-run authentication is driven directly by the custom installer through the same canonical provider shell functions;
- `open` performs the one-time browser-session bootstrap in [GW-DOC-CANONICAL-CONTRACTS](../contracts/canonical-contracts.md) and emits the authenticated connect URL; core v1 does not depend on a host default-browser opener;
- `status` uses the public liveness/version query; the installer separately uses the authenticated readiness query under P6 §35.3 for fresh completion. `tick` uses daemon/CLI Bearer authentication. `tick` is an operational/global coordinator command and is not the Workbench task-local Start action. Lifecycle resume, exact current-task start and sign-off remain Workbench actions rather than duplicate CLI workflows.

`orderd` owns periodic scheduling directly:

1. start daemon;
2. complete startup/database/provider preflight and interruption recovery;
3. run one coordinator tick immediately;
4. arm one 3600-second `setTimeout`;
5. on each timer firing, start a coordinator tick only when no coordinator tick is already active;
6. after each completed/failed tick, preserve the normal durable task/Run reaction semantics and wait for the next interval.

Manual `order tick` invokes the same global coordinator operation. It does not create another scheduler, queue or mutation path.

The Workbench's manual **Start current task** command is not a scheduler scan. It identifies the exact current approved WorkItem/task, proves final eligibility under the same global single-running-task exclusion, atomically creates that task's BUILDER Run, and then enters the same coordinator execution loop asynchronously. Automatic ticks retain the existing global eligible-task ordering and are mandatory for signed tasks and queued QA; manual start is never a serial approval.

No model call occurs merely because the timer fires: a tick with no eligible approved task is `NO_WORK`.

Productive installation defines one user-level systemd service as the host process supervisor. The unit is enabled and started by the installer and starts only `order daemon`; it owns no scheduler semantics. If the supervised daemon is stopped, no periodic work occurs until the same daemon is restarted.

## 20. Workspace isolation

Unattended implementation uses one fresh isolated checkout directory per execution run under a Order-owned factory root.

Rules:

- one WorkItem belongs to exactly one Git top-level repository;
- never execute unattended work in the human working tree;
- provision with `git clone --no-local --no-checkout -- <source-root> <workspace>`;
- prove the approved revision with `git rev-parse --verify --end-of-options <sha>^{commit}`;
- checkout that exact commit detached;
- verify workspace HEAD equals the approved commit;
- require `git status --porcelain=v1 -z` to be empty before builder invocation;
- invoke Order Git commands with system/global Git config disabled and terminal prompting disabled;
- one repository writer at a time;
- OpenCode is scoped to the run workspace;
- submodules/gitlinks are not initialized/fetched automatically; work inside a gitlink is unsupported in v1;
- Order artifact/proposal writes never follow a symlink outside repository root;
- candidate/failure workspaces remain inspectable; v1 has no automatic workspace cleanup/retention subsystem, and local operator cleanup is outside Order's correctness path.

Local clone can race with a concurrently changing source repository, so exact post-clone commit and cleanliness verification are mandatory.

Order does not promote a candidate workspace into a new execution baseline and does not share a workspace across post-signoff Runs. Every builder, reviewer and remediator Run starts from a fresh isolated checkout at the Approval baseline. Candidate bytes cross Run boundaries only as the hash-addressed candidate patch evidence defined in §24/P6; the receiving Run replays and verifies that exact patch in its own fresh checkout. No later ExecutionTask automatically sees candidate bytes. This is why cumulative changes belong in one signed task rather than a chain of dependent candidate workspaces.

Interactive pre-signoff Runs no longer use the user's physical repository directory as the OpenCode Location. `GW-DOC-OPENCODE-INTEGRATION-V1` requires an Order-materialized inspection workspace containing the exact admitted current project state and complete resolved repository-instruction closure. The configured repository remains canonical: source/context resolution and artifact proposal/adoption operate through the existing repository shell, while the STAGE provider receives only the isolated read-only execution projection.

## 21. Verification execution

A signed `ExecutionTask` names logical gate ids.

Order resolves each gate through `pontivus-order.toml` and executes the exact argv in the isolated workspace.

Every unattended/correctness-bearing external process uses argv, explicit cwd, an explicit allowlisted environment, bounded output and `Bun.spawn({ detached: true, ... })` so the child owns a separate Linux process group. The sole v1 exception is operator-invoked `order provider login <provider>`: the OpenCode build bound by `GW-DOC-EXTERNAL-FACTS` requires an interactive stdin/stdout TTY for authentication for legitimate key/form/code flows, so the process shell passes through the current terminal while still owning the explicit argv/cwd/private provider environment and detached process-group lifecycle. Order does not parse that interactive output as semantic evidence.

Order does not pass Bun's child-only `timeout`/AbortSignal as the cancellation authority. One shell helper owns timeout and explicit cancellation: it sends `SIGTERM` to the whole group with `process.kill(-pgid, "SIGTERM")`, waits at most 5 seconds for group disappearance, then sends `SIGKILL` to the same group if it still exists. Group existence is checked with signal `0`. The operation is not considered cancelled until the child has settled and the group no longer exists. The exact Linux semantics and descendant fixture are owned by [GW-DOC-EXTERNAL-FACTS](../references/external-facts.md) and [GW-DOC-CANONICAL-CONTRACTS](../contracts/canonical-contracts.md).

The builder cannot invent, weaken, replace or omit a required gate.

Gate results become typed evidence for [GW-DOC-VALIDATION-STANDARD-V1](../requirements/validation-standard.md).

## 22. Semantic events and reactions

Order does not use an event bus.

`RunEvent` is the canonical persisted semantic event boundary.

Pure reaction policy maps current state + admitted RunEvent/turn batch + governing policy to promotion, return, invalidation, bounded remediation, operational retry, linked IDEA creation or block. For STAGE Runs, the complete provider-result batch is validated before persistence and the provider batch plus coordinator reaction is committed atomically when no filesystem effect intervenes.

The exact event union is defined in [GW-DOC-CANONICAL-CONTRACTS](../contracts/canonical-contracts.md).

## 23. Dependency invalidation

Artifact dependencies are explicit and machine-resolvable.

When a material artifact changes, Order invalidates only its recorded downstream dependents.

Pre-signoff, work returns to the earliest owning stage whose conformance is stale.

Post-signoff, material authority drift yields `APPROVAL_STALE`.

## 24. Candidate handoff

Candidate state has no independent table/entity. It is an evidence-backed semantic boundary carried by canonical RunEvents.

After a mutating `BUILDER` or `REMEDIATOR` Run settles, Order deterministically derives the changed-path set from stable NUL-delimited Git status with rename detection disabled and untracked files expanded. It then builds one exact binary/full-index/no-renames patch against `Approval.baselineCommit` using a temporary Order-owned Git index so untracked/new files are included without mutating the workspace index.

The patch bytes are persisted under the producing Run evidence directory, read back and SHA-256 verified before `CANDIDATE_STATE_RECORDED` is committed. The event carries only the EvidenceRef and canonical exact changed-path array; its parent lineage is derived from the producing Run's trigger.

A `REVIEWER` or `REMEDIATOR` always starts from its own fresh baseline checkout, replays the exact referenced binary patch, regenerates the candidate patch/changed-path projection and requires exact hash/path equality before provider work. A mismatch blocks the control plane; it is never delegated to the model.

Final success is one `CANDIDATE_RECORDED` RunEvent emitted by the final `REVIEWER` Run. That Run owns the complete current coordinator-generated `VALIDATION_PASSED` set for V0–V7; no pass event from an earlier candidate/Run is reusable. Under P6 §§8/10/38, its trigger is the exact final `CANDIDATE_STATE_RECORDED` for ordinary review, or the exact prior `CANDIDATE_RECORDED` linked to the admitted QA submission for direct QA replay. In the latter case resolve and verify that prior event's exact `candidateStateEventId`; the newly emitted `CANDIDATE_RECORDED` binds that same replayed state event and only the new reviewer's own V0–V7 pass set. A remediated successor binds the actual new candidate-state event; never synthesize a candidate-state event for a read-only replay. That linkage supplies:

- work item/task through the Run/ExecutionTask;
- approved baseline through the Run/Approval;
- retained final reviewer workspace;
- final diff hash through the patch EvidenceRef SHA-256;
- exact changed surfaces through `changedPaths`;
- verification/reviewer/governance/minimum-change evidence through V0-V7 events.

After technical success Order does not mutate the retained final reviewer workspace. Final human QA/QC inspects its exact evidence and, if testing requires mutable execution, uses a separate explicit exact-patch replay test copy (never the retained evidence workspace, baseline or a delivery checkout). User-run tests are human observations, not automatic gate PASS. Candidate correction uses only the existing fresh replay reviewer/remediator boundary under still-current Approval. A new verified candidate is recorded before human retest; explicit acceptance is recorded against the exact set, not the workspace path. No automatic application, merge or integration of independent task patches.

Commit, push, pull request, merge and deployment remain outside v1.

## 25. Span

v1 has no direct Span integration.

Span may be available to the target project's agent tooling, but Order does not depend on Span APIs and Span owns none of Order lifecycle, approval, artifact identity or conformance state.

## 26. End-to-end control loop

```text
project authority / human input / repository evidence
                        |
                        v
                authority resolution
                        |
                 concern resolution
                        |
                context resolution
                        |
                lifecycle decision
                        |
                        v
              governed action boundary
        /                |                 \
 interactive agent   repository          verification
        \                |                 /
                        v
                 evidence / RunEvent
                        |
                        v
                  reaction policy
                        |
          +-------------+-------------+
          |             |             |
       promote        repair      return/block
          |             |             |
          +-------------+-------------+
                        |
                        v
               durable canonical state
                        |
                        +------> next understanding cycle
```

This is the only Order act-react-understand loop.

## 27. External integration verification baseline

External integrations are correctness boundaries, not assumed utilities.

P7/CI/startup certification covers:

| Integration | Verified v1 contract | Required proof |
|---|---|---|
| OpenCode | exact server/client pins in `GW-DOC-EXTERNAL-FACTS`; productive workspace/instruction boundary in `GW-DOC-OPENCODE-INTEGRATION-V1` | authenticated server-info readiness/version, sessions, exact model, permissions, deterministic prompt-id idempotency, monotonic `time.idle` + outcome completion proof, final context retrieval, foreground-`serve` restart behavior, interrupt, isolated STAGE materialization, all-role instruction closure, direct-read containment, external-reference isolation and correct local-vs-provider failure classification |
| Bun/Linux host | exact Bun/declaration pins in `GW-DOC-EXTERNAL-FACTS`; productive host Linux | explicit-env detached spawn + negative-pgid TERM/KILL cancellation, `Bun.serve` production mode/loopback, TOML parse, Glob options, CSPRNG/SHA-256/UUID, Linux filesystem allowlist + SQLite binding, timer non-overlap |
| Node/Linux guarded Markdown replacement | `GW-DOC-EXTERNAL-FACTS §14` | exclusive create/symlink refusal, stale-hash no-write, same-directory temp + file fsync + atomic rename + parent-directory fsync + exact read-back/hash; two Order mutations with one old hash cannot both succeed |
| SQLite | embedded, required >=3.37 features | WAL, FULL sync, FK, JSON, STRICT |
| Git | local CLI | top-level, revision verify, isolated clone, detached checkout, porcelain-v1 |
| Browser | host-provided UI runtime; exact automated Chromium baseline in `GW-DOC-EXTERNAL-FACTS` | same-origin fetch/cookie semantics, token bootstrap, exact Origin enforcement, active-Run polling/catch-up |
| Node/frontend | exact Node/frontend pins in [GW-DOC-EXTERNAL-FACTS §2](../references/external-facts.md) | `tsc` typecheck, React `createRoot`, Vite TSX build, Tailwind Vite plugin, TanStack Query invalidation/refetch, Zod ingress parsing, Vitest and `@playwright/test` under Node |
| Local UI primitive boundary | Order-owned local primitives plus authorized public Astryx dependencies | no private-source dependency + project-neutral/vendor-clean + forbidden-import scan |

The exact Order pins, public upstream snapshot and host/runtime version policy are defined in [GW-DOC-EXTERNAL-FACTS](../references/external-facts.md).

A failed capability probe blocks the integration; Order does not silently select a weaker fallback. A vendor/source upgrade that changes relied-on behavior is P4/P6 material and must be re-audited.

## 28. Explicit exclusions

v1 does not add:

- Radix;
- Tremor;
- another UI primitive framework;
- Electron;
- Tauri as a runtime dependency;
- Next.js or another SSR framework;
- ORM;
- object/service architecture;
- DTO layer;
- message broker;
- generic event bus;
- workflow engine;
- plugin framework;
- service mesh;
- agent registry;
- domain-specific agent classes;
- parallel context stores;
- automatic commit/push/PR/merge/deploy;
- distributed workers;
- worker leases/claim subsystem;
- browser WebSocket/SSE transport or provider-token forwarding;
- global client-state store;
- generic provider/persistence/scheduler/transport abstraction for a single implementation;
- generic Markdown/document platform or arbitrary repository file editor;
- direct R3 rewriting or code/test/config/candidate/evidence/runtime-state editing;
- semantic-diff materiality heuristics, automatic Markdown merge/rebase or filesystem watcher;
- Markdown AST/rendering/editor, YAML/frontmatter, diff or Git-library dependency for this feature;
- database migration or legacy-compatibility path for this feature; the source-backed implementation materializes only the current productive schema.

A later requirement may change an exclusion only through the normal Order governance lifecycle.


## 29. Source-backed WorkItem and Markdown-workbench architecture

This section is the P4 owner for the source-backed WorkItem/Markdown-workbench extension governed functionally by `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` and `GW-DOC-MARKDOWN-WORKBENCH-V1`. Exact schemas, persistence and HTTP shapes remain solely P6-owned by `GW-DOC-CANONICAL-CONTRACTS`.

#### Dependency decision

No new direct runtime or development dependency is authorized by this feature.

The implementation reuses the existing pinned stack owned by `GW-DOC-EXTERNAL-FACTS`:

- React/React DOM for function-component presentation;
- TanStack Query for daemon/server state;
- Zod for canonical runtime schemas;
- Bun/Node filesystem and crypto capabilities already on the correctness path;
- Bun SQLite for durable runtime projection;
- existing Vite/Vitest/Playwright/Tailwind tooling.

This extension adds a new correctness-bearing use of synchronous file replacement/durability mechanics. The refreshed `GW-DOC-EXTERNAL-FACTS` snapshot records the exact relied-upon contracts for Node `fs.openSync`/`O_EXCL`/`O_NOFOLLOW`, `fs.fsyncSync`, `fs.renameSync`, Linux `rename(2)` atomic replacement on the same filesystem, and the requirement to fsync the containing directory for durable directory-entry persistence. This architecture relies on that factual owner and does not own those vendor/host facts itself.

The governed Markdown editor remains a controlled native `<textarea>` interaction with local React presentation state. The source-backed WorkItem feature itself does not authorize CodeMirror, Monaco, ProseMirror/TipTap, Milkdown, EasyMDE, YAML/frontmatter tooling, a diff package, file watcher, ORM, Git library, generated API client, rich-text/AST authority or a second client-state store.

The later workbench-component decision `D16` and `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2` authorize Astryx as the current UI implementation substrate. Under that later authority, Astryx `TextArea` may implement the controlled native textarea path and Astryx `Markdown` may render **known canonical Markdown read-only**. That renderer is presentation only: exact Markdown bytes remain canonical and editable authority, arbitrary evidence/log/patch bytes remain escaped text, and no separate Markdown document model/parser/editor platform is introduced.

#### P4 module ownership

#### Functional core

Add one cohesive pure module:

```text
src/core/work-item-source.ts
```

It owns only deterministic WorkItem-source semantics and the built-in schema catalog:

- `workItemSchemaCatalog` immutable typed data;
- `workItemKindForSchema(schemaId)`;
- `defaultSchemaForKind(kind)`;
- `parseWorkItemSource(text, path)`;
- `renderNewWorkItemSource(input)`;
- source metadata validation;
- H1/title extraction;
- schema/project/concern consistency checks that require only supplied typed data;
- deterministic reconciliation classification over already-read source snapshots;

It performs no filesystem, SQLite, Git, HTTP, OpenCode or React effects.

It imports only canonical contracts and deterministic canonical helpers.

#### Shared guarded file-write primitive

Add one small shell module because two distinct path-policy owners require the same correctness-bearing expected-hash replacement effect:

```text
src/shell/file-write.ts
```

It owns only regular-file create/replace mechanics after the caller has already resolved and authorized the absolute target path:

- exact current-byte SHA-256 comparison against an expected hash;
- one synchronous no-yield expected-hash-check -> same-directory non-`.md` exclusive temp write -> file fsync -> rename -> parent-directory fsync -> read-back/hash sequence;
- preservation of existing target permission bits on replacement;
- exclusive new-file creation/read-back proof.

It owns no root/path-containment policy, WorkItem semantics, Git semantics or lifecycle policy. `src/shell/work-item-source.ts` and `src/shell/repository.ts` are its two feature consumers and remain responsible for authorizing their different roots/paths before invoking it. Existing config/evidence writers are not refactored merely for textual reuse because they have different immutability/private-mode contracts and are outside this feature's change necessity.

#### Portable-source filesystem shell

Add one cohesive shell module:

```text
src/shell/work-item-source.ts
```

It owns only WorkItem-source filesystem mechanics beneath the selected repository's resolved project documentation root:

- recursive discovery of regular `.md` files;
- relative source-path normalization and root containment;
- rejection of symlink escapes/non-regular files;
- exact byte reads;
- exact SHA-256 over source bytes through the existing canonical hash owner;
- invocation of the canonical `file-write.ts` expected-hash/create primitive only after source-root/path authorization;
- source-specific creation policy, including a temp/target naming choice that never exposes a temporary file as a discoverable `.md` WorkItem.

It does not parse WorkItem meaning or decide lifecycle reactions.

Portable WorkItem source mechanics do not belong in `src/shell/repository.ts`: the WorkItem queue is not a target Git repository and has different identity/mutation semantics.

#### Daemon source orchestration

Add one daemon module:

```text
src/daemon/work-item-source.ts
```

It owns source reconciliation/orchestration only:

- resolve the selected exact repository and its validated project WorkItem documentation root;
- scan/read through the shell owner;
- parse through the core owner;
- resolve `projectId` to exactly one configured validated target repository; v2 configuration itself guarantees one exact repository root per entry and unique project ids;
- validate source concern ids against that project's manifest;
- register/update the SQLite WorkItem projection;
- expose current validated source snapshot for authority/stage/sign-off consumers;
- execute UI source create/update/reconcile commands;
- produce canonical source diagnostics.

It does not own lifecycle return-stage policy, sign-off semantics, stage prompt policy, SQLite mechanics, HTTP routing or browser presentation.

#### Daemon dependency DAG

The daemon graph becomes:

```text
runtime
  ↑       ↑
run    work-item-source
  \       /
   \     /
   authority
   ↑      ↖
 stage   validation
          ↑
       execution

coordinator -> runtime + run + work-item-source + authority + stage + validation + execution
server      -> runtime + coordinator
```

Exact same-layer rules:

- `work-item-source.ts` may depend on `runtime.ts` but not `run.ts`, `authority.ts`, `stage.ts`, `validation.ts`, `execution.ts` or `coordinator.ts`;
- `authority.ts` may additionally depend on daemon `work-item-source.ts`;
- `coordinator.ts` composes public source commands/queries with existing lifecycle commands;
- `server.ts` continues to call coordinator-owned public commands and does not become a source-policy owner.

`tests/architecture.test.ts` must be extended in the same implementation to encode this exact owner/dependency addition without weakening existing rules. The permanent shell effect-owner sensor must additionally permit expected-hash/temp-rename/fsync mechanics only in `src/shell/file-write.ts` for this feature, while source-root discovery remains owned by `src/shell/work-item-source.ts` and repository containment remains owned by `src/shell/repository.ts`.

#### UI decomposition

The source-backed WorkItem architecture owns the durable UI boundaries, not a permanently frozen filename split. The current workbench presentation decomposition is owned by `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2`, which may perform the minimum same-layer presentation split required by `GW-P1-SOC`.

The durable boundaries are:

```text
ui/src/app.tsx
  top-level queue/search/selected-work-item composition and browser-local global presentation controls only,
  including the single ThemePreference/root-theme owner governed by GW-DOC-WORKBENCH-THEME-V1

ui/src/WorkItemWorkspace.tsx
  selected WorkItem presentation shell/navigation only

ui/src/MarkdownEditor.tsx
  controlled exact-Markdown editing interaction only

current mode-specific workspace modules
  cohesive read/review/dialogue/execution/evidence/result presentation only,
  as owned by GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2

ui/src/http.ts
  same-origin HTTP mechanics only
```

The former `ExecutionInspector.tsx` split was an implementation shape for the original source-backed workbench and is **not** a standing canonical filename/module requirement. The current P4 workbench owner may replace it with cohesive same-layer presentation modules without changing domain semantics, state ownership, effect boundaries or dependency direction.

All UI production modules are React function modules, not classes/services. They consume canonical P6 types from `src/core/contracts.ts`; no UI domain models/DTOs/mappers are introduced.

Presentation-local selection/editor/dirty state remains React component state. TanStack Query remains the sole browser owner of daemon/server state.

#### Portable source location and discovery

Productive `OrderConfig` v3 contains exact target `repositoryRoots` and STAGE `referenceRoots` only. WorkItem source location is project-owned inside the selected target repository under the resolved `pontivus-order.toml [workItems].root`, defaulting to `docs/order/work-items`. The exact contract is owned by [GW-DOC-CANONICAL-CONTRACTS §32](../contracts/canonical-contracts.md).

The daemon reconciles only deterministic `<workItems.root>/<WorkItemId>/work-request.md` candidates for each exact configured repository. It does not recursively inspect unrelated Markdown and does not adopt a moved source path. Symlinks are not followed as source files or traversal boundaries.

#### Exact WorkItem source grammar (P6)

### Source-to-context flow

#### Source-backed stage/context flow

Before every productive stage start/resume/promotion boundary:

```text
revalidate current WorkItem source
  -> WorkItemSourceSnapshot
  -> resolve stage authority/upstream artifacts
  -> contextHash includes sourceSha256 as material root identity
  -> prompt projection
```

Prompt projection:

- R1: exact current WorkItem Markdown is included;
- R2: exact current WorkItem Markdown is included where source-backed P2 intent is required by `GW-DOC-LIFECYCLE-CONTEXT`;
- DESIGN/PLAN/R3: validated upstream artifacts remain the normal semantic carriers; raw source text is omitted unless the lifecycle context resolver says it is materially required;
- every pre-signoff source-backed stage context hash includes the exact source SHA-256 even when the source body is not rendered.

No prompt builder independently opens/scans a WorkItem source path.

`stage.ts` also obtains the current schema's stage template and allowed R1 completion set from the same `src/core/work-item-source.ts` catalog. It renders that template/instruction into the STAGE prompt alongside the stage decision boundary. INVESTIGATION/AUDIT therefore receive only their R1 template/terminal contract; CHANGE/DEFECT receive the delivery templates as they progress. `stage.ts` does not hard-code a second kind/outcome/template table.

#### Approval/source binding

### Exact target-project and WorkItem-root architecture

Configuration v2 uses a finite set of exact validated target repositories rather than broad parent-root discovery. Each target entry is one canonical Git top-level realpath with a valid root manifest and a unique `ProjectManifest.projectId`. The WorkItem project picker is derived from those manifests; Order does not recursively crawl parent directories and does not create a second project registry.

There is no productive external WorkItem root. Each target repository resolves one repository-contained WorkItem documentation root; reference roots remain separate STAGE-only read boundaries and Order state remains outside target repositories. The exact config/project-manifest contracts and v2→v3 migration are P6-owned.

### Workbench query/mutation and presentation ownership

#### UI query/mutation ownership

TanStack Query keys remain direct projections of daemon state. Add only keys required by the new queries:

```text
["workItemSchemas"]
["projects"]
["sourceDiagnostics"]
["workItemSource", workItemId]
["lifecycleArtifacts", workItemId]
```

Existing WorkItem/artifact/run/task/signoff keys remain canonical.

Successful mutations invalidate only affected keys:

- source reconcile -> workItems + selected WorkItem + sourceDiagnostics + affected source/lifecycle-artifact keys; exact Acceptance return also reobserves affected Approval/tasks/Runs/events and QA history/current-proof keys as required by P6 §38.3;
- Approval authority reconcile -> workItems + selected WorkItem + runs/tasks/lifecycleArtifacts/artifacts/source/signoff/sourceDiagnostics observation keys for that WorkItem; this command changes lifecycle ownership only and never routes through source reconciliation;
- create -> workItems + sourceDiagnostics; select created item/source;
- WorkItem source save -> workItems + selected WorkItem + selected source + lifecycleArtifacts + runs/artifacts/signoff package for that WorkItem;
- lifecycle Markdown save -> workItems + selected WorkItem + lifecycleArtifacts + artifacts + runs/signoff package for that WorkItem;
- Run controlling transition -> selected WorkItem + runs + terminal RunEvents + affected tasks/artifacts/signoff/source diagnostics.

While a Run is active, the selected single-WorkItem query participates in polling. On terminalization the browser performs a final RunEvent drain and affected refetch before presenting a resulting next action. A pure coherence check suppresses mutations when canonical values have not yet observed the same committed reaction.

No browser cache entry becomes an authority; daemon responses remain canonical.

#### Workbench interaction implementation

##### Queue

`app.tsx` owns queue selection/search and composes source diagnostics/refresh controls from daemon queries.

Rows display kind by resolving `schemaId` through the catalog response.

##### Workspace

`WorkItemWorkspace.tsx` is the selected-WorkItem presentation shell. It composes canonical source/artifact/Run/task/sign-off values into the presentation modes owned by `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2`; it does not own a second document/run/task model and does not create a parallel `WorkItemDocument` representation.

Mode-specific document, dialogue, review, execution, evidence and result modules are same-layer presentation decomposition only. They receive canonical values and explicit callbacks from the existing UI/query boundary; they do not become domain/state owners.

##### Editor

`MarkdownEditor.tsx` owns only:

- loaded Markdown text;
- local edit buffer;
- dirty flag derived from loaded vs current buffer;
- Save/Cancel UI;
- read-only flag;
- conflict/validation error presentation from the mutation.

It receives canonical `expectedSha256` and a save callback. It does not parse WorkItem metadata or decide lifecycle invalidation.

##### Execution/evidence presentation

Execution task/Run/validation/candidate/evidence presentation remains read-only with respect to candidate/production output and is implemented by the current cohesive workspace modules owned by `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2`.

No execution/evidence presentation module owns an editor/mutation callback for candidate or production bytes.

#### Source freshness and live edits

Startup/manual reconcile is not the only freshness **inspection**, but only explicit reconcile/save paths apply source projection/lifecycle mutation.

Before:

- start/resume pre-signoff stage Run;
- stage promotion;
- sign-off mutation;
- V0/V1 post-signoff execution preflight;
- current Approval QA-review admission and final candidate acceptance under P6 §38;

the daemon performs targeted read-only inspection of the affected source. If the recorded source requires reconciliation, the productive command is rejected with the owning reconciliation/precondition reason; it does not apply the reconciliation and then fail the requested command.

GET source, lifecycle-artifact and sign-off-package paths are observational and never apply source plans, create ArtifactRefs or return the WorkItem upstream.

The inspection reads only the affected source; it does not rescan the full queue and requires no filesystem watcher. If the recorded path is missing, the productive action is blocked and explicit/full reconciliation is required to discover a moved path rather than recursively searching the queue from inside a lifecycle command.

External source edits while the daemon is running are therefore observed by diagnostics/read-only productive inspection and become canonical workflow transitions only through explicit reconcile/save.

During `EXECUTION`, reconciliation may update the current source projection but cannot authorize continued work: the approval/source comparison yields `APPROVAL_STALE` and returns to the earliest changed-material owner before another productive execution Run. Direct browser source/artifact editing remains disabled in EXECUTION. In AWAITING_ACCEPTANCE it likewise remains disabled; current source/authority inspection is observational and a stale source blocks QA-review admission and final acceptance. Only the explicit selected source reconciliation command with the exact current Approval/sequence returns to R1 under P6 §38.3; ordinary bulk/startup/configuration use its no-implicit-return boundary. A valid source change adopts only its admitted projection; invalid-source invalidation does not adopt invalid bytes or alter the rejected classification. No implicit write, continuing signed work, or acceptance on drift.

For a WorkItem already in `COMPLETE`, inspection/reconciliation does not reinterpret or reopen the historical lifecycle result. If source bytes change or disappear, Order preserves the completed runtime projection and reports `COMPLETED_SOURCE_CHANGED` or `COMPLETED_SOURCE_MISSING`. The operator must create a new WorkItem for new/changed intent rather than repurpose the completed stable id.

#### Direct operator Markdown save versus artifact proposal

Agent-proposed repository-authority mutations remain governed by the existing `ARTIFACT_PROPOSAL_CREATED` -> explicit adopt/reject flow. For lifecycle proposals, the proposal role must equal the current STAGE Run stage, the proposal is admitted only from an OPEN turn, and adoption keeps lifecycle ownership at that same stage while invalidating/re-resolving conformance/context.

A direct human edit made through the Markdown workspace is a different ingress: the operator is explicitly authoring the canonical lifecycle Markdown and presses Save against an exact expected hash. That Save is the explicit human mutation action; no synthetic agent proposal RunEvent is created.

The save does not confer conformance. It returns the WorkItem to the document's owning stage and requires the normal stage conformance path before progression.

Interactive chat text still cannot mutate authority directly. If a chat clarification changes durable intent, the operator must make the corresponding explicit Markdown/authority edit before progression.

#### Sign-off and execution UI boundary

The sign-off view is a read-only composition of canonical source/package state plus the existing explicit sign-off command.

Opening an editable pre-signoff document from sign-off exits the ready package state through normal save/invalidation semantics; the old package hash cannot be reused.

EXECUTION/AWAITING_ACCEPTANCE/COMPLETE views expose no Markdown mutation action for signed package artifacts or production outcomes. Existing signed material remains inspectable, but editing it requires returning through the canonical upstream lifecycle rather than changing bytes under active approval.

#### Verification obligations

Permanent tests must prove at least:

##### Core

- exact source grammar and strict metadata rejection;
- schemaId -> kind is single canonical mapping;
- no persisted/source `kind` field;
- template render/parse round trip;
- duplicate-id reconciliation classification;
- investigation/audit terminal outcome eligibility and deterministic rejection of a structurally valid but kind-invalid R1 completion.

##### Shell

- source root containment and target-repository/reference-root/state-root disjointness;
- symlink/non-regular rejection at the path-specific owners;
- exact hash reads;
- one shared file-write primitive proves expected-hash stale-write refusal, including two Order mutation attempts using the same old hash;
- same-directory replacement/read-back/directory-fsync behavior and non-`.md` source temporary-file invisibility to the scanner;
- existing target permission-bit preservation on update;
- no source write outside the selected repository's resolved WorkItem documentation root and no lifecycle-document write outside the validated repository target.

##### Daemon/integration

- fresh install discovers an existing queue;
- moved unchanged source preserves identity;
- invalid/duplicate/missing source diagnostics preserve lifecycle state while blocking source-dependent actions;
- browser creation materializes Markdown before WorkItem projection;
- R1 receives exact current source Markdown;
- source hash participates in context identity;
- source edit during active daemon invalidates promotion/approval as required;
- source-bound sign-off/V0/V1 freshness with required non-null Approval source binding;
- fresh SQLite initialization creates the complete current schema with `user_version = 4`;
- ordinary startup rejects unsupported versions; only stopped-daemon installer migrates supported predecessors under P6 §§32/38;
- current lifecycle-artifact query selects only canonical current role snapshots and excludes superseded history;
- direct R1/R2/DESIGN/PLAN Markdown save is hash-guarded and returns to owner;
- R3 direct write rejected;
- arbitrary repository artifact direct write rejected;
- downstream historical lifecycle artifact edit rejected while an earlier stage owns the WorkItem;
- human-edited current stage draft is supplied for reconformance.
- every promotable R1/R2/DESIGN/PLAN/R3 completion passes the functional-core `evaluateStageConformance` decision for exactly one current deterministic output before coordinator-owned `CONFORMANCE_PASSED` and lifecycle transition;
- PLAN completion additionally parses exactly one canonical `order-tasks` block from those exact current PLAN bytes before promotion; prompt wording or a section heading alone is not task-contract conformance;
- R3 `READY_FOR_SIGNOFF` additionally validates that the current PLAN task definitions resolve every signed gate, concern and authority/acceptance ref, include concern-required gates, keep each change-surface path inside signed scope/outside exclusions, and do not mutate the current material authority closure; a return-to-* R3 outcome remains available when PLAN is defective;
- delivery-schema v2 stage Markdown satisfies its pinned ordered structural template before promotion; v2 R2 additionally has a non-empty `REFERENCE | DELTA | LOCAL` authority-disposition ledger with canonical `GW-*` owners where required; historical v1 schema pins retain their original structural semantics.
- the permanent architecture fitness sensor scans repository v2 WorkItem documents for shadow-authority hygiene: they cannot declare canonical concern ownership, cannot introduce the retired `WF-FR-*` namespace, and their R2 authority ledger cannot be absent or structurally empty.

##### Browser

- controlled project/kind/concern creation without repository/id/schema free text;
- source diagnostics/refresh visible;
- lifecycle document navigation in order;
- exact Markdown source editor Save/Cancel/dirty behavior;
- stale save conflict does not overwrite;
- source/lifecycle edit visibly changes owning lifecycle state;
- R3 is read-only;
- sign-off shows source freshness/package/task/hash and becomes unavailable after edit;
- investigation/audit terminal view and same-project linked-remediation creation;
- execution candidate/code/evidence surfaces have no editing action;
- no WebSocket/SSE or new global state store.

##### Architecture

The exact open/rename/fsync semantics used by Markdown writes must remain grounded by the current external-facts snapshot and deterministic filesystem integration tests.

`tests/architecture.test.ts` must:

- register the new core, shared file-write shell, source shell and daemon modules in the explicit ownership/dependency sensors;
- keep UI imports within the exact browser-safe core dependency boundary in §7;
- preserve filesystem effect ownership at shell boundaries;
- detect forbidden alternative source parsers/catalogs where mechanically practical;
- preserve current no-class/no-DTO/no-service/repository/controller constraints.

#### Explicit exclusions

The architecture above does not authorize implementation by itself. It is the binding P4 target that the subsequent P7 plan must realize without adding a second source parser/catalog, filesystem writer, lifecycle, transport, browser state store, DTO family, OOP service layer or generic document/IDE subsystem.

## 30. Repository-native WorkItem documentation architecture

This section is the current P4 architecture for the repository-native WorkItem/documentation requirements owned by `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` and `GW-DOC-MARKDOWN-WORKBENCH-V1`. It supersedes earlier architecture passages that describe one productive installation-global `workItemRoot`.

### 30.1 Boundary model

The target Git repository is the durable documentation boundary for a WorkItem.

```text
OrderConfig
  exact target repositories
          |
          v
project pontivus-order.toml
  resolved WorkItem documentation root
          |
          v
<repository>/<documents-root>/<WorkItemId>/
  work-request.md
  research.md
  requirements.md
  solution-design.md
  implementation-plan.md
  readiness-review.md
```

Order runtime state remains outside the project repository under the existing Order state root. Runs, RunEvents, provider sessions, execution workspaces and transient diagnostics do not become Git documents merely because WorkItem Markdown is repository-native.

### 30.2 Productive configuration

> Historical v3 cutover contract. The current configuration contract is v4 under §34.13; v3 remains migration input only.

The v3 cutover advanced `OrderConfig` to contain only:

- model;
- exact target repository roots;
- optional STAGE reference roots.

It has no `workItemRoot`.

Repository selection remains finite and explicit. Order never scans a parent directory looking for projects.

The project manifest resolves the repository-relative WorkItem documentation root. Absence of a project override means the canonical default `docs/order/work-items`.

### 30.3 Deterministic document-path owner

One pure core owner computes WorkItem documentation paths from:

- validated project manifest;
- WorkItem id;
- lifecycle document role.

The path mapping is deterministic and shared by source creation, source reconciliation, stage prompting, proposal admission, document navigation and Git persistence.

The stage provider receives the exact canonical target path in its prompt. A provider-emitted proposal whose `targetPath` or unified-diff path differs from the computed path is rejected as invalid provider output before repository mutation. The provider therefore supplies content/diff, not placement policy.

Existing pre-v3 lifecycle ArtifactRefs remain immutable historical records at their already-governed repository paths. Migration materializes the current bytes for each lifecycle role at the deterministic v3 path and treats those deterministic copies as drafts requiring normal revalidation. Productive v3 therefore has one current placement policy for both migrated and new WorkItems. The external pre-v3 WorkItem source is likewise copied to the deterministic repository path because v3 has no productive external source root.

### 30.4 Source discovery and mutation

`src/shell/work-item-source.ts` remains the dedicated source filesystem boundary, but its root input becomes the selected repository plus resolved project documentation root.

It:

- inspects only direct `<WorkItemId>/work-request.md` candidates beneath the resolved documentation root;
- rejects symlink escape/non-regular source files;
- reads/writes through the shared exact-hash atomic file writer;
- never recursively scans unrelated repository Markdown;
- never accepts an alternate installation-local root.

`src/daemon/work-item-source.ts` aggregates reconciliation across the exact configured repositories. It resolves each validated project manifest first, then invokes the shell boundary for that project. Source diagnostics therefore carry project identity in addition to repository-relative path.

### 30.5 Documentation Git-state owner

Add one cohesive daemon documentation owner for the current WorkItem document set.

Its inputs are canonical state only:

- current WorkItem source path;
- current lifecycle ArtifactRefs;
- selected repository/head.

It does not search for semantically similar Markdown.

It calls the existing Git shell boundary to obtain exact path-scoped Git status and to create an explicit documentation commit. UI modules never invoke Git directly.

### 30.6 Exact path-scoped documentation commit

The Git shell implements one explicit documentation-commit operation.

Preconditions:

- `HEAD` equals the operator-confirmed expected commit;
- every included document still has the expected working-tree SHA-256;
- every path is a canonical current document of that WorkItem;
- no included path is unmerged or ignored;
- the repository remains the exact WorkItem target.

The effect is path-scoped. Unrelated staged and unstaged paths are legal and must remain excluded.

For already tracked documents, `git commit --only -- <exact paths>` records current working-tree content while disregarding other staged paths.

For a governed new/untracked document, the shell may first use `git add --intent-to-add -- <exact new paths>` so Git recognizes those paths, then executes the same path-scoped commit. If the commit fails, the shell removes only intent-to-add entries that it introduced for paths that were untracked before the operation; it must not reset or rewrite unrelated index entries.

The commit uses the repository's normal hooks. Order never supplies `--no-verify`.

The operation never performs push, pull, fetch, rebase, merge, branch checkout, branch creation or remote mutation.

### 30.7 Git status semantics

Documentation Git state compares current governed document bytes with the selected repository `HEAD`, independently of the browser editor dirty flag.

The daemon reports enough canonical information for the UI to distinguish:

- working-tree bytes equal `HEAD`;
- tracked working-tree bytes differ from `HEAD`;
- governed document is not yet tracked by `HEAD`;
- governed path is missing/ignored/unmerged and therefore not committable.

Unrelated repository changes are not part of this status result.

### 30.8 Sign-off consequence

The source no longer needs a separate filesystem authority boundary.

At sign-off:

- current `work-request.md` must exist at its deterministic repository path;
- its working-tree bytes must equal the selected Git baseline bytes;
- `sourceSha256` remains the exact source-byte binding in the Approval package;
- current lifecycle ArtifactRefs retain their existing committed-baseline requirement.

A package with WorkItem documentation that differs from `HEAD` is not signable.

This preserves the existing Approval/domain shape while making its originating source provably project-Git-backed.

### 30.9 v2 → v3 bounded migration

The productive installer is the only migration boundary.

Before activating v3 it:

1. quiesces the old daemon;
2. reads the exact v2 config and external `workItemRoot`;
3. scans/validates every v2 source through the existing canonical source parser;
4. resolves each source `projectId` to exactly one configured target repository;
5. computes `<project-doc-root>/<WorkItemId>/work-request.md`;
6. fails before file mutation if any project is unresolved, any source id is duplicated, or a destination contains different bytes;
7. writes/copies the exact source bytes atomically to the project repository and verifies the resulting hash;
8. transactionally migrates persisted source paths to repository-relative v3 paths and advances SQLite `user_version`;
9. writes config v3 without `workItemRoot`;
10. starts v3 and requires normal health/source reconciliation before declaring success.

The former external directory is retained as non-productive migration backup; v3 never reads it during ordinary operation. No dual source path exists after activation.

Existing repository lifecycle ArtifactRefs are not moved by this migration.

### 30.10 Architecture ownership

The change preserves FCIS/SoC/DRY:

- core source/document path policy remains pure;
- `src/shell/work-item-source.ts` owns source filesystem effects;
- `src/shell/repository.ts` owns Git effects;
- the daemon source owner resolves/reconciles project-local sources;
- a cohesive daemon documentation owner composes current source/lifecycle document identity with Git status/commit;
- `server.ts` remains transport only;
- `ui/src/http.ts` remains HTTP only;
- UI consumes canonical typed state and never reconstructs repository paths or Git eligibility.

No repository/document DTO family, Git service object, browser Git state store or second source scanner is introduced.

### 30.11 Technical requirements

#### GW-TR-036-REPOSITORY-NATIVE-WORKITEM-DOCUMENTS

**Required behavior:** the selected target repository is the sole productive filesystem boundary for WorkItem source/lifecycle Markdown, with paths derived from one project-local documentation-root policy.

**Acceptance criterion:** no productive `workItemRoot` exists outside target repositories; new Work requests and lifecycle roles resolve to deterministic repository-relative paths.

**Failure/negative behavior:** an installation-local queue must not remain an alternate source reader/writer after v3 activation.

#### GW-TR-037-PATH-SCOPED-DOCUMENTATION-GIT-PERSISTENCE

**Required behavior:** explicit documentation Git save commits only the current WorkItem's canonical document paths using exact expected HEAD/document preconditions.

**Acceptance criterion:** unrelated staged/unstaged repository changes remain unchanged and absent from the documentation commit; normal Git hooks execute.

**Failure/negative behavior:** Order must not use `git add -A`, `git add .`, `git commit -a`, an unrestricted index commit, `--no-verify`, or any command that can sweep unrelated repository changes into the commit.

#### GW-TR-038-PROJECT-SCOPED-SOURCE-DISCOVERY

**Required behavior:** startup/refresh source discovery iterates exact configured repositories and only their resolved deterministic WorkItem source locations.

**Acceptance criterion:** source discovery requires no parent-directory crawl, global source root or arbitrary repository Markdown scan.

**Failure/negative behavior:** path search/inference must not substitute for the project manifest + deterministic WorkItem path owner.

### 30.12 Deterministic lifecycle-draft rediscovery

Repository-native portability includes the deterministic lifecycle Markdown, not only `work-request.md`.

After the daemon establishes one valid WorkItem source, the same project-document path owner resolves the five lifecycle paths for that WorkItem. The source shell inspects those exact paths only; it does not glob/scan arbitrary Markdown.

For each present regular lifecycle file:

- hash the exact working-tree bytes;
- resolve whether those exact bytes exist at current `HEAD`;
- materialize/reuse one ArtifactRef for the role/path/hash snapshot, with `gitCommit = HEAD` only when the bytes exactly match the `HEAD` blob and otherwise `null`;
- classify that ArtifactRef as a repository **draft**, with no conformance event/dependency closure implied by discovery.

A fresh runtime projection still starts the WorkItem at IDEA. Repository-draft ArtifactRefs become available to Documents and, when their owning stage is actually reached, to `currentStageDraftArtifacts`/stage prompting. They never cause lifecycle promotion by themselves.

This uses the existing ArtifactRef owner rather than introducing a document DTO/index.

### 30.13 Documentation-commit eligibility and repository state

The daemon computes documentation-commit eligibility before the Git shell effect.

Eligibility requires:

- WorkItem stage is one of `IDEA`, `R1`, `R2`, `DESIGN`, `PLAN`, `R3` or `AWAITING_SIGNOFF`;
- WorkItem has no active Run;
- current canonical documentation status has at least one `MODIFIED` or `UNTRACKED` path and no `MISSING`, `IGNORED` or `UNMERGED` path;
- `HEAD` is attached to one local branch, proven by `git symbolic-ref -q HEAD` returning a ref under `refs/heads/`;
- no Git operation is in progress.

The Git shell proves the operation-state condition by resolving Git-internal paths through `git rev-parse --git-path` and rejecting presence of merge/cherry-pick/revert/rebase/sequencer/bisect state, including `MERGE_HEAD`, `CHERRY_PICK_HEAD`, `REVERT_HEAD`, `REBASE_HEAD`, `rebase-merge`, `rebase-apply`, `sequencer` and `BISECT_LOG`.

Detached HEAD and in-progress Git operations are ordinary typed blockers. Order does not attempt to finish, abort or otherwise manipulate the external Git operation.

Implementation/Acceptance/Complete are always ineligible even if WorkItem Markdown happens to differ in the working tree.

### 30.14 Repository-local Git identity

Order deliberately keeps Git system/global configuration disabled on its correctness path.

Documentation commits therefore require both non-empty repository-local:

- `user.name`;
- `user.email`.

The Git shell reads them with `git config --local --get ...` under the same explicit Git environment used for the commit. Order does not synthesize author/committer values from login name, hostname, `EMAIL` or ambient global/system config.

The same resolved repository-local identity supplies author and committer identity for the documentation commit. Missing identity is returned as a typed, actionable blocker before any index/commit mutation.

Order v3 does not add a second Git-identity store or silently edit `.git/config`. Repository-local Git identity remains repository-local operator setup.

### 30.15 v2 approval/execution migration boundary

The v2→v3 migration must not reinterpret a v2 Approval as if its baseline had already contained repository-local `work-request.md`.

Migration therefore fails before repository/config/database mutation when any WorkItem is currently in `EXECUTION` or has an active post-signoff Run/task. The operator must finish/resolve that execution under the existing v2 installation before upgrading.

For pre-signoff/Awaiting-signoff WorkItems, migration may proceed but their previous stage conformance/readiness cannot be used as v3 authority after document-path materialization. The installer:

- copies the external Work request byte-identically to its deterministic v3 path;
- for each current lifecycle role ArtifactRef, copies the exact current bytes to the corresponding deterministic v3 path when that differs, requiring destination absence or exact-identical bytes;
- preserves all old ArtifactRefs/RunEvents as immutable history;
- does not copy their conformance events/dependency closure onto the new deterministic-path ArtifactRefs;
- after v3 startup/reconciliation, returns any non-IDE/non-COMPLETE pre-signoff WorkItem to `R1 / ACTIVE` for governed revalidation, with the deterministic lifecycle files available as drafts.

A `COMPLETE` WorkItem remains terminal. Its historical Approval/Run state is preserved as provenance and is not rebound to the new repository source path. Deterministic document copies may be rediscovered on a future fresh installation as drafts, but that still does not reconstruct historical completion.

This avoids a dual approval semantic and ensures every new v3 Approval is formed only after the complete deterministic WorkItem package has been committed to the selected Git baseline.

### 30.16 Additional technical requirements

#### GW-TR-045-REPOSITORY-LIFECYCLE-DRAFT-REDISCOVERY

**Required behavior:** deterministic lifecycle Markdown is rediscovered through one project-path owner into existing ArtifactRef snapshots without fabricating lifecycle/conformance state.

**Acceptance criterion:** fresh installation can display and reuse repository lifecycle drafts while the WorkItem still starts at IDEA and must traverse normal stage admission/completion.

**Failure/negative behavior:** discovery must not scan arbitrary Markdown, synthesize RunEvents or infer stage completion from file presence.

#### GW-TR-046-DOCUMENTATION-GIT-ELIGIBILITY

**Required behavior:** daemon eligibility plus Git-shell repository-state probes reject documentation commits outside the permitted pre-signoff/no-active-Run/attached-clean-operation-state boundary.

**Acceptance criterion:** detached HEAD, in-progress Git operations, active Run, Implementation/Acceptance/Complete and noncommittable document states cause no Git mutation and return a specific blocker.

**Failure/negative behavior:** `git commit` process failure must not be used as the primary eligibility check.

#### GW-TR-047-REPOSITORY-LOCAL-GIT-IDENTITY

**Required behavior:** documentation commits use only explicit repository-local Git identity under Order's global/system-config-disabled environment.

**Acceptance criterion:** missing `user.name` or `user.email` is detected before mutation; successful commits carry that exact repository-local identity for author and committer.

**Failure/negative behavior:** Order must not fabricate identity or fall back to ambient host/global Git configuration.

#### GW-TR-048-V2-V3-APPROVAL-MIGRATION-SAFETY

**Required behavior:** v2→v3 migration never allows an old Approval to authorize v3 execution under a baseline that lacked the deterministic repository-local Work request.

**Acceptance criterion:** active execution blocks migration; pre-signoff material is copied to deterministic paths as drafts and revalidated; completed history remains terminal provenance.

**Failure/negative behavior:** migration must not rebind a v2 Approval, preserve pre-signoff readiness as if paths/baseline were unchanged, or maintain dual v2/v3 approval semantics.

## 31. OpenCode saved-account management architecture

This section is the P4 realization of the OpenCode account-management requirements owned by `GW-DOC-INSTALLATION-READINESS-V1`. It governs switching among multiple saved OpenCode login accounts in Order's private OpenCode namespace. It does **not** introduce provider/model routing.

### 31.1 Ownership boundary

OpenCode remains the sole credential owner.

```text
Order browser
    |
    v
Order daemon account-control boundary
    |
    v
private pinned OpenCode v2.2.6 control process
    |
    v
OpenCode private credential database
```

Order SQLite/configuration stores neither credential secrets nor a duplicate active-account selection.

The active account is read from OpenCode each time account state is queried. The configured Order model remains owned by `OrderConfig.model` and is not rewritten by account activation.

### 31.2 Account-control process

Account management uses the same pinned OpenCode binary and the same private HOME/XDG/DB environment as productive provider execution, including the same system-config refusal and exact-version readiness checks.

It uses a dedicated Order-owned account-control working directory below the Order state root rather than a project repository. Project configuration is disabled exactly as for productive OpenCode processes.

Read-only account queries and bounded Switch/Rename mutations use a short-lived private foreground OpenCode server:

```text
opencode serve --hostname 127.0.0.1 --port 0
```

The listener remains private/random-loopback/password-authenticated and is never forwarded to the browser.

An Add-account OAuth flow must keep its control process alive for the lifetime of the OpenCode OAuth attempt because the pinned attempt state is process-local. The daemon owns at most one transient account-login attempt:

```ts
type OpenCodeAccountLoginControl = Readonly<{
  id: OpenCodeAccountLoginAttemptId;
  providerAttemptId: string;
  process: OpenCodeProviderProcess;
  expiresAt: IsoDateTime;
}>;
```

This is transient imperative-shell state, not durable workflow/domain state. Daemon restart cancels/loses an unfinished login attempt; already completed/saved OpenCode accounts remain durable in OpenCode's own database.

### 31.3 Safe account projection

The shell queries only OpenCode integration `opencode` through `integration.get` / the equivalent released client operation.

It projects only credential connections:

- credential id;
- user-facing label;
- method;
- connection authentication status.

The shell never calls `credential.list` for account presentation because the pinned endpoint returns complete secret credential values.

The pinned OpenCode credential ordering + integration projection put the active stored credential first. The shell maps the first credential connection to `active = true` and all remaining credential connections to `false`. Startup/CI capability certification proves that exact ordering before this feature is productive.

The canonical Order account projection contains no access token, refresh token, API key, OpenCode credential value/metadata, organization secret or provider configuration.

### 31.4 Account identity/labels

The safe OpenCode connection projection does not expose the authenticated email even though the underlying OpenCode OAuth credential records it internally.

Order therefore treats the OpenCode-owned credential label as the account's human identity.

For Add account:

1. the operator supplies a non-empty account label that is unique among the current OAuth account labels; the UI recommends the exact OpenCode login email;
2. Order starts the OpenCode Console `device` OAuth method for integration `opencode` and supplies that label;
3. OpenCode persists the resulting credential under that label and makes the new credential active.

Rename uses only OpenCode's credential-label update operation and rejects a label already used by another current OAuth account. The credential id remains the stable account reference regardless of label changes.

Order does not read secret-bearing credential metadata merely to auto-discover email.

### 31.5 OAuth flow

The daemon invokes the released pinned integration OAuth operations, fixed to:

- integration: `opencode`;
- method: `device`;
- no caller-provided custom Console server/form override;
- operator-provided account label.

The shell validates the returned authorization URL as HTTPS and same-origin with the pinned default OpenCode Console endpoint before returning it through the Order API.

The browser receives only:

- Order login-attempt id;
- external authorization URL;
- OpenCode instructions/device code;
- expiry;
- normalized attempt status/failure detail.

It never receives the private OpenCode loopback endpoint/password or any credential material.

The daemon polls OpenCode attempt status through the retained control process. On complete/failed/expired/cancelled it releases the attempt process. Successful completion is followed by a fresh safe account projection; the new account must appear active before Order reports success.

### 31.6 Global mutation serialization

Account mutations are installation-global because every productive OpenCode process uses the same private credential database.

The daemon permits Add/Switch/Rename only when:

- no Run anywhere in Order has status `RUNNING` or `WAITING_FOR_INPUT`;
- no other account mutation is executing;
- no account-login attempt is pending.

The daemon performs the eligibility check before starting the OpenCode control process and repeats it immediately before the credential mutation/OAuth-start admission.

Read-only account queries are not blocked.

No provider session can therefore straddle a successful account identity mutation.

### 31.7 Switch behavior

Switch receives an opaque canonical account id from the current safe account projection.

Before passing the id to OpenCode, the daemon refreshes the projection and proves:

- the id still exists;
- it refers to a stored credential connection for integration `opencode`;
- it is not already active unless the operation is treated as idempotent no-op.

The shell calls only the pinned credential-activation operation. It then refreshes the integration projection and proves that the target id is now the first/active stored credential.

The operation does not change `OrderConfig.model`.

A future productive Run starts a fresh provider process/session and performs the ordinary configured-model authentication/availability proof. Account switching does not bypass that preflight.

### 31.8 Rename behavior

Rename is a label-only OpenCode credential mutation.

The daemon proves the account id belongs to the current safe `opencode` projection and passes a validated non-empty label to the pinned credential-label update operation. It then refreshes the projection and proves the new label.

No account secret is read or rewritten by Order.

### 31.9 UI data flow

TanStack Query remains the sole browser server-state owner.

The global account control reads one account-state query. Add/Switch/Rename mutations invalidate/refetch that query after success. No global client store is introduced.

An account switch does not invalidate WorkItem domain queries because it mutates no WorkItem/lifecycle state. It may invalidate provider/model availability presentation if that presentation is currently visible.

### 31.10 Technical requirements

#### GW-TR-049-OPENCODE-SAFE-ACCOUNT-PROJECTION

**Required behavior:** Order projects saved OpenCode accounts only from the pinned safe integration/connection surface and never exposes or consumes secret-bearing credential values for account presentation.

**Acceptance criterion:** account query returns opaque id, label, active flag and safe connection status only; no credential token/key/value crosses the shell boundary.

**Failure/negative behavior:** `credential.list`, OpenCode DB reads or browser-visible credential metadata must not become the account-list implementation.

#### GW-TR-050-OPENCODE-ACCOUNT-CONTROL-PROCESS

**Required behavior:** account management uses a private exact-version OpenCode control process in the existing isolated credential namespace, with transient process retention only for an active OAuth attempt.

**Acceptance criterion:** browser account management works without exposing the OpenCode listener/UI and without a second credential store/service.

**Failure/negative behavior:** Order must not use ambient OpenCode state, the managed background service, a public provider listener or a project working tree as account-management authority.

#### GW-TR-051-OPENCODE-ACCOUNT-MUTATION-SERIALIZATION

**Required behavior:** Add/Switch/Rename is serialized globally and admitted only when no Order Run is RUNNING/WAITING_FOR_INPUT and no other account mutation/login attempt is active.

**Acceptance criterion:** a successful account mutation cannot overlap a productive OpenCode session.

**Failure/negative behavior:** account identity changes must not be permitted concurrently with active provider work or reconciled after the fact.

#### GW-TR-052-OPENCODE-BROWSER-OAUTH-ACCOUNT-LOGIN

**Required behavior:** Add account drives the pinned `opencode`/`device` OAuth attempt through the Order daemon, retains the private control process until terminal attempt state, and persists only through OpenCode's credential store.

**Acceptance criterion:** the browser receives external authorization instructions/status but no credential secrets/private OpenCode endpoint; successful completion yields a new active saved account in the safe projection.

**Failure/negative behavior:** normal browser login must not require a terminal, secret-bearing provider API response or Order-owned OAuth token persistence.

## 32. WorkItem management, API-error and provider-diagnostic architecture

This section closes the former P7 prerequisite placeholders for title/archive semantics, typed API failure classification and provider diagnostic evidence.

### 32.1 Direct title edit realization

Title edit reuses the canonical source path rather than creating a management store.

`src/core/work-item-source.ts` owns one pure helper:

```text
rewriteWorkItemTitle(markdown, title) -> exact Markdown
```

It parses through the existing source grammar, replaces only the first canonical H1 line, preserves every other byte/line exactly, and returns bytes that reparse to the same WorkItem id/project/schema/concerns except for title.

The daemon title command reuses the existing expected-source-hash write/reconciliation path. Browser code never parses/rebuilds front matter or Markdown to perform a rename.

### 32.2 Portable archive owner

One pure path owner computes:

```text
<workItems.root>/<WorkItemId>/.order-archived
```

The marker bytes are exactly `archived\n`.

The source filesystem shell owns marker existence/create/remove under the same repository containment/symlink rules as WorkItem source files. Reconciliation derives `WorkItem.archived` from marker existence.

Archive state is therefore a portable projection, not independent SQLite authority. SQLite may persist the projection for query efficiency but startup/refresh reconciliation corrects it from repository facts.

Default WorkItem listing excludes archived items; an explicit include-archived query exposes them for restore.

### 32.3 Archive and Git status composition

The existing WorkItem documentation Git-status owner expands its governed path set to include the deterministic archive marker.

The status model must distinguish:

- marker absent both in working tree and HEAD: no archive Git change;
- marker present in working tree but absent at HEAD: `UNTRACKED`;
- marker present and equal at HEAD: `MATCHES_HEAD`;
- marker absent in working tree but present at HEAD: `DELETED`.

`DELETED` is a committable WorkItem-management/documentation change. The path-scoped documentation commit operation may therefore contain expected paths whose working-tree hash is null only for an exact tracked deletion.

This keeps archive/restore inside the same explicit **Save documentation to Git** mechanism and preserves unrelated index/working-tree state.

### 32.4 HTTP error classification owner

Add one canonical daemon error classification boundary; route handlers do not decide status ad hoc.

The classifier maps:

- malformed JSON/schema/path/query input -> HTTP 400;
- canonical entity absent -> HTTP 404;
- source-boundary, lifecycle, optimistic-concurrency and current-state conflicts -> HTTP 409;
- unexpected daemon defect -> HTTP 500.

A source-boundary conflict carries the exact canonical `WorkItemSourceDiagnostic` that caused the rejection.

The server's outer API catch uses this classifier. It must not collapse unexpected defects to 400 and must not discard a known source diagnostic.

The browser HTTP helper parses the canonical error response once. Feature components receive the typed canonical error and render the human message/diagnostic; they do not parse status-specific ad hoc JSON.

### 32.5 Provider diagnostic evidence owner

Provider diagnostics reuse existing immutable Run evidence plus RunEvent references. No logging database, telemetry model or second Run history is introduced.

For every provider turn, the OpenCode shell/daemon may persist one bounded diagnostic JSON evidence file containing only observable execution metadata required for debugging:

- configured provider id/model id;
- provider session id;
- deterministic prompt/admission id;
- turn start/end timestamps and terminal provider outcome;
- format-repair attempted/result;
- parse/admission/transport failure classification and safe exception text;
- public provider-session/tool/action/result metadata already observable through the pinned OpenCode API.

Provider stderr is captured into a separate bounded text EvidenceRef when non-empty.

Before evidence persistence, Order removes/replaces any occurrence of secrets known to Order, including the private OpenCode password, daemon/browser tokens and credential values available to the shell. A line containing a known secret is replaced rather than partially echoed. Hidden chain-of-thought/reasoning is never requested, inferred or persisted.

The coordinator emits one coordinator-owned `PROVIDER_DIAGNOSTICS_RECORDED` RunEvent referencing those EvidenceRefs. A later `PROVIDER_FAILED` event references the same diagnostic evidence when the diagnostics explain that failure.

Evidence size is bounded by the existing Run-evidence policy; stderr capture uses a fixed tail/head bound rather than unbounded process logging.

### 32.6 Technical requirements

#### GW-TR-054-WORKITEM-MANAGEMENT-CANONICALITY

**Required behavior:** direct title edit rewrites only the canonical source H1 and archive/restore derives from the deterministic repository marker.

**Acceptance criterion:** no second title/archive semantic owner exists and clone/reconciliation restores archive state.

**Failure/negative behavior:** browser Markdown reconstruction, DB-only archive flags, source deletion and signed-Markdown archive mutation are prohibited.

#### GW-TR-055-TYPED-API-FAILURE-CLASSIFICATION

**Required behavior:** one daemon classifier preserves 400/404/409/500 meaning and source diagnostics through the HTTP/browser boundary.

**Acceptance criterion:** known source/current-state conflicts are actionable 409 responses and unexpected defects are 500 rather than generic 400.

**Failure/negative behavior:** feature routes/components must not invent competing error taxonomies or discard canonical diagnostics.

#### GW-TR-056-RUN-SCOPED-PROVIDER-DIAGNOSTIC-EVIDENCE

**Required behavior:** observable provider diagnostic material is persisted only through existing Run evidence and referenced by coordinator-owned RunEvents.

**Acceptance criterion:** Activity/Evidence can inspect provider/session/timing/outcome/format-repair/parse/transport/stderr evidence without a second log store.

**Failure/negative behavior:** hidden reasoning, credential secrets, unbounded stderr capture or an independent observability database is prohibited.

## 33. Public repository delivery and release architecture

This section is the P4 realization of `GW-DOC-PUBLIC-REPOSITORY-DELIVERY`.

### 33.1 Version owner

`package.json.version` is the only hand-edited release version.

Runtime code must not retain a second literal such as `orderVersion = "0.x.y"`. One tiny version adapter reads/imports the package version and supplies it to:

- `order --version`;
- daemon `GET /api/health`;
- release bundle manifest generation;
- installer/version reporting where required.

Permanent tests prove these surfaces equal the package version.

### 33.2 PR verification workflow

Retain one permanent workflow:

```text
.github/workflows/ci.yml
```

It runs for the PR targets admitted by `GW-DOC-PUBLIC-REPOSITORY-DELIVERY` §10, using the same exact-base/head/merge-candidate checkout and verification job for each target. It may also run on `master` for post-merge signal.

PR execution must be secret-free. It:

1. checks out the candidate;
2. establishes the exact locked toolchain/dependencies through immutable-pinned/certified Actions or repository-owned bootstrap;
3. validates PR release metadata/changelog rules;
4. runs the logical verification gates owned by `pontivus-order.toml`:
   - dependency-lock;
   - typecheck;
   - architecture;
   - test;
   - build;
   - browser.

One stable required status/check name is used by the repository ruleset.

The workflow does not publish a release or mutate tags.

### 33.3 Release metadata verifier

Add one repository-owned deterministic verifier under `scripts/`.

For an ordinary work PR it proves:

- `CHANGELOG.md` contains an `[Unreleased]` change compared with base;
- PR metadata supplies release impact/target release;
- `package.json.version` is unchanged.

For a release PR it proves:

- branch/declared target is `release/vX.Y.Z`;
- package version is exactly `X.Y.Z`;
- changelog contains `[X.Y.Z] - YYYY-MM-DD`;
- `[Unreleased]` remains present;
- candidate version is greater than the prior published version;
- no production behavior is changed by the release PR.

The verifier has no GitHub-token dependency for local use; workflow-only checks may additionally inspect PR event metadata. For an unpublished same-version replacement, the verifier fails closed unless the matching remote tag is absent and the candidate moves a non-empty base `[Unreleased]` section into the existing matching release section.

### 33.4 Release workflow

Retain one permanent workflow:

```text
.github/workflows/release.yml
```

Normal trigger is a `master` push whose merged candidate changes the canonical package version. An exact retry may accept the same immutable commit/version after a failed publication; it must not target a different commit for an existing version. Retry admission is either `workflow_dispatch` with the exact commit or a merged governed PR adding exactly one `.github/release-retries/*.txt` request containing that commit. Both enter the same permanent release job and validation chain.

Before any tag/publication effect it:

1. proves the checkout commit equals the intended `master` release commit and is still reachable from `master`, without requiring it to remain the moving branch tip;
2. validates package/changelog version agreement;
3. proves the release tag is absent or already points to this exact commit for retry;
4. establishes the exact locked toolchain;
5. runs all configured verification gates;
6. builds production `dist/`;
7. creates the release bundle;
8. verifies its internal version/commit manifest;
9. computes SHA-256.

Only then may it create annotated tag `vX.Y.Z`.

Publication sequence:

1. create/reuse draft GitHub Release for exact tag;
2. upload `pontivus-order.tar.gz`;
3. upload `pontivus-order.tar.gz.sha256`;
4. set notes from the committed changelog version section;
5. publish.

The workflow uses minimum `contents: write` permission only for tag/release publication. PR CI remains read-only.

### 33.5 Release bundle

A repository-owned packaging script creates deterministic release content from the verified checkout.

The archive top level is `order/` and contains the supported installation/runtime source plus production `dist/`, package/lock/config material, installer, documentation required by the installed product, and:

```text
order/RELEASE.json
```

with exact:

```json
{
  "version": "X.Y.Z",
  "gitCommit": "<40-lowercase-hex>"
}
```

Test/e2e fixtures and `.git` are not required in the public install bundle unless the installer explicitly consumes them.

The packaging implementation sorts paths and normalizes archive ownership/timestamps from the release commit so rebuilding the same release candidate produces the same archive bytes where the host toolchain permits. The checksum is computed after archive construction.

### 33.6 Public install/update path

The supported README/install path consumes the GitHub Release asset rather than cloning `master`.

Normal latest installation uses the stable latest-release asset URL. A version-pinned installation substitutes the immutable `vX.Y.Z` release URL.

The installer verifies `RELEASE.json`/package-version agreement before activation. When the checksum file is used by the bootstrap, the archive checksum is verified before executing `install.sh`.

Contributor instructions may still clone `master` for development; that path is clearly distinct from public installation/update.

### 33.7 Repository protection

A repository ruleset targeting `master` must require:

- pull request before merge;
- canonical PR verification status;
- conversation resolution;
- no force push;
- no branch deletion;
- linear/squash history.

A tag ruleset protects `v*` against ordinary update/deletion.

Repository-administration configuration is an external GitHub setting rather than repository source. The implementation task records evidence that it was applied. If the current integration cannot mutate admin rules, a repository administrator performs that one administrative step; source implementation does not emulate branch protection.

### 33.8 Dependency/certification rule

Permanent workflows may depend on GitHub-hosted Actions, but every referenced action is pinned to an immutable commit SHA and recorded in the external-facts/certification owner.

Floating `@main`, `@master` and mutable major-only action tags are not accepted correctness dependencies.

### GW-TR-057-PUBLIC-REPOSITORY-RELEASE-AUTOMATION

**Required behavior:** permanent PR/release automation binds verification, package version, changelog, exact master commit, immutable tag and published release assets into one release chain.

**Acceptance criterion:** ordinary PRs cannot mutate version; release publication occurs only after a release PR merge and full re-verification; public install uses the release asset; package/runtime/tag/release versions agree.

**Failure/negative behavior:** direct-master delivery, master-clone release distribution, unverified tag creation, tag movement, mutable-version rebuild, unpinned workflow dependency or release notes that diverge from the committed changelog are prohibited.



## 34. Settings/configuration architecture

This section is the P4 realization of the installation/configuration requirements owned by `GW-DOC-INSTALLATION-READINESS-V1` and the P6 contracts in `GW-DOC-CANONICAL-CONTRACTS §35`.

The design preserves one canonical configuration/runtime ownership path rather than layering Settings behavior over independent state or file writes.

### 34.1 Ownership requirements

The Settings/configuration path has four architectural ownership requirements:

1. `config.json` is changed only through the canonical shell configuration owner and activated as one coherent daemon runtime snapshot.
2. repository identity/document-root information is exposed through one canonical installation-level projection rather than a second registry.
3. OpenCode account mechanics remain owned by the existing OpenCode account boundary while Settings provides the complete management surface.
4. WorkItem Source authoring preserves the human/system metadata boundary and complete-file conflict protection.

These are owner-boundary requirements. UI composition must not introduce independent state or file-write paths.

### 34.2 Configuration owner and immutable runtime handoff

`src/core/contracts.ts` remains the only `OrderConfig` shape owner.

`src/shell/config.ts` remains the sole productive `config.json` read/write effect owner and gains only the atomic expected-hash operations required by §35. It must not become a daemon/service object.

A new cohesive daemon settings owner (for example `src/daemon/settings.ts`) composes:

- current config identity;
- readiness;
- connected-repository projection;
- focused repository/model/reference-root commands;
- runtime reconfiguration admission.

The daemon does **not** mutate `CoordinatorRuntime.config`. Instead, the process-level daemon composition owns one replaceable reference to an otherwise immutable `CoordinatorRuntime`.

All request handlers obtain the current runtime through that process-level owner. Configuration activation builds a candidate runtime, proves/reconciles it, persists the config and swaps the runtime reference only after the candidate is trustworthy.

The swap is serialized with all settings mutations and scheduler ownership. No request may observe a half-updated config/runtime pair.

This is the only new mutability introduced by Settings: one process-level pointer to the current immutable runtime snapshot. It is not domain state and is not persisted.

### 34.3 Reconfiguration admission

Config/repository mutations are admitted only when they cannot invalidate active productive work.

At minimum, reconfiguration is blocked while:

- the coordinator tick is active/admitting work;
- any Run is `RUNNING` or `WAITING_FOR_INPUT`;
- an OpenCode account login attempt is active;
- an OpenCode account mutation is active;
- another settings activation/document-root migration is active.

The blocker computation is owned once in the daemon and reused by readiness/settings responses. UI must not reimplement it.

### 34.4 Connected repository owner

`src/shell/project.ts` continues to prove exact Git roots and validated project manifests.

The daemon settings owner derives `ConnectedRepositoryState` directly from:

```text
OrderConfig.repositoryRoots
  -> loadConfiguredProjects()
  -> exact repository root + validated ProjectManifest
  -> effective workItems.root
```

No repository registry/database table is added.

Reference-root changes remain ordinary `OrderConfig.referenceRoots` mutations through the same expected-hash activation boundary. They are validated as canonical directories and retain STAGE-only read semantics; they never become target repositories or WorkItem source roots.

Connect repository:

- prove exact canonical Git root;
- prepare/validate the repository manifest through the existing project owner;
- append the exact root to a proposed `OrderConfig`;
- run the canonical activation boundary.

Disconnect repository:

- resolve the exact configured root directly from `OrderConfig.repositoryRoots`, even when its current project manifest is invalid;
- block if productive work is active there;
- remove only that root from proposed config;
- activate through the same boundary;
- retain repository files and historical SQLite records.

Ordinary queue/source projection uses current configured roots as its visibility/admission boundary so disconnected repository records do not remain falsely productive.

### 34.5 Repository-owned document-root migration owner

The document-root change is not a config mutation.

A cohesive shell effect owner in the project/document boundary owns the bounded repository mutation. It may be implemented in `src/shell/project.ts` or one narrowly named sibling if the operation would otherwise give `project.ts` two independent responsibilities.

It owns:

- exact manifest byte read/hash;
- current/target root proof;
- governed-document move staging;
- byte/hash verification;
- minimal manifest `[workItems].root` mutation;
- atomic activation/rollback.

`src/shell/work-item-source.ts` remains the WorkItem source/path effect owner and supplies deterministic governed paths; it does not become a TOML writer.

`src/shell/repository.ts` remains Git effect owner and supplies operation-state/repository facts where migration admission needs them.

The daemon settings owner composes these existing/new shell effects and invokes normal source reconciliation afterward.

Because current WorkItem source paths are persisted, the migration also uses the existing SQLite effect owner for one transaction that updates only the affected `workItemSources.sourcePath` values to the new deterministic paths. This happens as part of the migration activation boundary before normal reconciliation. Historical ArtifactRefs are not rewritten; new-path lifecycle files are rediscovered as current drafts through the existing ArtifactRef owner.

### 34.6 Readiness architecture

Readiness is a pure daemon projection, not persisted state.

Inputs are:

- current `OrderConfig`;
- validated connected repository states;
- configured model preflight facts;
- current safe `OpenCodeAccountState`;
- exact installed-provider effective-instruction isolation capability required by `GW-DOC-OPENCODE-INTEGRATION-V1`.

Output is the canonical `InstallationReadiness`. A usable account does not imply productive readiness when the active provider/account path can inject semantic instructions that Order cannot disable or completely preflight before inference.

The work queue/workbench may render while readiness is incomplete, but productive actions that require a missing concern are blocked by the owning daemon command as well as reflected in readiness UI.

This avoids turning readiness into a second lifecycle state or a browser-only gate.

### 34.7 OpenCode account architecture after Settings centralization

The existing shell/daemon OpenCode account owner remains authoritative:

```text
src/shell/opencode.ts
  -> safe pinned OpenCode integration effects
src/daemon/opencode-account.ts
  -> canonical account query/mutations/login admission
```

No account-management backend refactor is required beyond:

- account-control readiness correction;
- adding the pinned safe credential-remove effect to the existing account owner;
- readiness composition using the canonical account projection;
- exposing full manager UI in Settings.

The account-control process has a stronger readiness predicate than the generic OpenCode provider process. Generic server readiness (including a successful `/api/info`) is insufficient. Account control is ready only after the pinned OpenCode integration list contains integration id `opencode`; only then may Order call the account projection/mutation operations. A bounded timeout terminates the private control process and returns a typed failure rather than surfacing the transient upstream 404 as an internal daemon error.

The shell utility becomes a concise active-account/status shortcut that navigates to Settings. It must not maintain a second full manager implementation.

### 34.8 Model configuration architecture

The configured model remains `OrderConfig.model`.

Settings model changes use the same canonical OpenCode model listing/preflight capability already used by guided setup; they do not introduce a browser-maintained provider catalog.

A proposed model is preflighted before runtime activation. Account selection remains semantically separate from model selection.

### 34.9 WorkItem source authoring architecture

The exact source parser in `src/core/work-item-source.ts` gains pure operations for:

- locating/projecting the exact body region from a validated complete source;
- validating a proposed body;
- recomposing the complete source from the unchanged exact metadata envelope plus proposed body.

The shell source writer remains unchanged in authority: it writes exact complete source bytes under expected-hash protection.

The daemon source command adds a body-write operation that:

1. reloads the current exact source snapshot;
2. proves `expectedSha256`;
3. delegates body validation/recomposition to the core owner;
4. writes the recomposed complete source through the existing shell effect;
5. re-reads/reconciles the canonical source.

The browser never parses/reassembles the metadata envelope itself.

### 34.10 Daemon/server decomposition

Durable ownership target:

```text
src/core/contracts.ts
  canonical Settings/readiness/source-authoring schemas

src/core/work-item-source.ts
  pure source body projection/recomposition

src/shell/config.ts
  config read/hash/atomic write effects

src/shell/project*.ts
  exact repository/project-manifest and document-root migration effects

src/shell/opencode.ts
  OpenCode provider/account effects

src/daemon/settings.ts
  settings/readiness/reconfiguration composition

src/daemon/opencode-account.ts
  account composition

src/daemon/work-item-source.ts
  source query/body-save composition

src/daemon/server.ts
  authenticated HTTP transport only
```

Do not create configuration/repository/account service classes, repositories, mappers, DTO layers or event buses.

### 34.11 Verification consequences

Permanent tests must cover:

- config expected-hash stale rejection;
- candidate-runtime activation succeeds and requests thereafter observe the new config snapshot;
- activation failure resumes/reconciles the old runtime;
- connect/disconnect repository visibility with historical DB retention;
- active-run/account-login blockers;
- model preflight failure leaves config/runtime unchanged;
- document-root migration success, conflict, rollback and unrelated-manifest preservation;
- readiness blocker combinations;
- full-source body projection/recomposition preserving metadata bytes exactly;
- stale body-save conflict after external metadata/body edit;
- retained account upgrade and missing-account readiness;
- no second config writer/repository registry/source parser.

### 34.12 Technical requirements

#### GW-TR-058-IMMUTABLE-CONFIG-RUNTIME-ACTIVATION

**Required behavior:** Settings changes productive config through one serialized candidate-runtime activation boundary while each `CoordinatorRuntime.config` remains immutable.

**Acceptance criterion:** after successful mutation every daemon request observes one coherent new config/runtime snapshot; failed activation leaves/resumes the old snapshot.

**Failure/negative behavior:** in-place config mutation, partially refreshed consumers, restart-required manual recovery or independent config writers are prohibited.

#### GW-TR-059-CANONICAL-SETTINGS-READINESS-PROJECTION

**Required behavior:** connected repositories and productive readiness are canonical daemon projections derived from config/project/account/model owners. Productive OpenCode trust/admission follows `GW-DOC-OPENCODE-INTEGRATION-V1`: exact Order authority is closed separately from explicitly selected trusted integration context.

**Acceptance criterion:** browser Settings can render repository/document-root/account/model/readiness state without reconstructing it from unrelated APIs. A selected usable OpenCode Console account is a valid trusted integration input; its provider-native Library/MCP semantics are not a separate readiness blocker.

**Failure/negative behavior:** no settings database, browser readiness policy, duplicate repository registry or browser-owned provider-instruction inference is permitted.

#### GW-TR-060-FOCUSED-REPOSITORY-CONFIG-MUTATION

**Required behavior:** connect/disconnect repository, model and STAGE reference-root changes are focused expected-hash commands over canonical `OrderConfig`.

**Acceptance criterion:** successful commands produce one validated new config snapshot; stale/blocked/invalid commands mutate nothing.

**Failure/negative behavior:** arbitrary replacement-config POSTs or UI writes to config files are prohibited.

#### GW-TR-061-ATOMIC-DOCUMENT-ROOT-MIGRATION

**Required behavior:** repository document-root changes preserve governed bytes/identities and manifest authority through one bounded atomic/rollback-capable shell operation.

**Acceptance criterion:** success leaves one productive root, matching validated manifest, matching persisted current source paths and rediscovered current lifecycle drafts; failure leaves the old root authoritative.

**Failure/negative behavior:** path-only edits, dual productive roots, whole-manifest semantic rewrites or orphaned WorkItems are prohibited.

#### GW-TR-062-WORKITEM-BODY-AUTHORING-CORE

**Required behavior:** core source parsing owns body projection/recomposition while the shell continues to persist complete exact source bytes.

**Acceptance criterion:** normal Source editing can save body-only changes with complete-file expected-hash protection and unchanged metadata bytes.

**Failure/negative behavior:** browser metadata parsing/recomposition or a second body/source persistence path is prohibited.


### 34.13 Configuration-capable daemon startup and installer continuity

The daemon must be able to serve authenticated Settings while configuration is valid but not productively ready.

Config loading therefore does not fail merely because a previously proven external repository/reference path is currently missing or no longer proves the same Git/project identity. Stored v4 path identities remain readable; the settings/readiness owner performs live proof and classifies unavailable/invalid repositories/reference roots as attention/blocker state. Only malformed config bytes, invalid stored path syntax/duplication or state-root security violations are config-load failures.

For `OrderConfig v4`:

- zero configured repositories is valid configuration state;
- `model = null` is valid configuration state;
- repository/source reconciliation runs only for currently READY repositories;
- provider/model preflight runs only when a model exists and a repository context required by that preflight can be resolved;
- productive Run start/tick commands enforce readiness and return a canonical configuration blocker instead of crashing startup.

The installer/update path reuses the same config owner.

Update from 0.2.0/v3:

1. preserve existing repository/model/reference choices exactly;
2. convert config version 3 -> 4 deterministically;
3. preserve the installation-owned OpenCode private state directory as part of state-root continuity;
4. never import ambient/global OpenCode secrets;
5. retain the existing v2 repository-document migration before final v4 activation where applicable;
6. start the daemon even when post-update account readiness requires operator action;
7. expose unresolved readiness through Settings instead of treating it as installation corruption.

Fresh installer admission consumes `GW-FR-007-GUIDED-PRODUCTIVE-BOOTSTRAP` and `GW-FR-079-PRODUCTIVE-INSTALLATION-READINESS` (including §2 historical ambiguity). Resolve one invocation-local established-installation decision before migration or staging. Inspect only the exact current or supported predecessor install root and its corresponding launcher/unit: regular readable `SOURCE_COMMIT` containing one lowercase 40-hex commit plus newline, `app/src/cli.ts`, `app/dist/index.html`, executable `runtime/bun/bin/bun`, executable launcher and regular user-service unit. Do not follow symlinks as proof or combine parts across roots; existing conflict checks remain authoritative. A complete footprint identifies a candidate deployment, not completed installation history: v0.2.0–v0.5.0 publish the identical marker before completion and its bytes cannot distinguish historical or newer publication semantics. Use the existing terminal-question boundary for every otherwise complete footprint, identifying its exact install root and asking whether installation admission previously completed (ordinary successful installation/update or explicitly reported committed with finalization incomplete) [y/N]. Only explicit y/yes, case-insensitive after trimming, confirms the established exemption; n/no, blank or unknown means fresh/unproven, other input is rejected and re-prompted, and cancellation/EOF/unavailable input stops before mutation. This consumes the history disposition owned by P3 §2, not a new current readiness test. Do not infer prior completion from liveness, marker, version, timestamps, config, account or database residue. Missing/malformed/partial footprint takes fresh/unproven admission or explicit recovery if existing conflict prevents safe continuation. Preserve valid retained configuration and private provider state; keep legacy migration permission independent of this decision. Use the resolved decision consistently for guided setup, readiness gating and operator-facing start/completion classification; broad footprint detection is restricted to migration/conflict/rollback. Fresh/unproven attempts consume the existing daemon-owned readiness query (P6 §35.3) after service activation and liveness; blocked or unproven observation fails the reversible transaction. Established update/recovery does not require productive readiness. Remove source-marker publication from staging for all attempts; the unchanged marker bytes are published only at the §2 installation commit boundary, not as retrospective proof of previous completion. No new persisted state, marker file, schema, alternate setup flow, CLI command or readiness owner.

Permanent migration tests must prove v3 choices survive byte-for-semantic-value conversion, retained private OpenCode state remains in place, and missing account/repository/model conditions reach Settings rather than daemon startup failure.

#### GW-TR-070-CONFIGURATION-CAPABLE-DAEMON-BOOT

**Required behavior:** the daemon starts from structurally valid OrderConfig v4 even when repository/model productive prerequisites are absent, and exposes canonical readiness/Settings while blocking only affected productive commands.

**Acceptance criterion:** already-installed or upgraded systems can reach authenticated Settings with zero repositories and/or no configured model; fresh installer success is forbidden in that state. Existing valid v3 choices migrate unchanged.

**Failure/negative behavior:** daemon startup must not require fake/default repository/model values, silently reset existing config, or force already-installed recovery exclusively through installer prompts.

#### GW-TR-071-OPENCODE-ACCOUNT-INTEGRATION-READINESS

**Required behavior:** the private OpenCode account-control process waits for registration of integration id `opencode` before account queries/mutations.

**Acceptance criterion:** clean-start account listing succeeds when generic OpenCode HTTP readiness precedes integration registration; the process remains bounded by the existing startup deadline.

**Failure/negative behavior:** generic `/api/info` readiness must not authorize an immediate account integration query that can return a transient upstream 404/internal daemon error.

#### GW-TR-072-OPENCODE-ACCOUNT-REMOVAL

**Required behavior:** the existing OpenCode account owner exposes safe credential removal using only credential ids proven by the canonical safe OAuth-account projection and the existing installation-global mutation guard.

**Acceptance criterion:** Settings can remove saved accounts, including the active/final account, and the returned refreshed `OpenCodeAccountState` plus readiness accurately reflect the resulting OpenCode-owned state without changing model configuration.

**Failure/negative behavior:** Order must not use secret-bearing credential listing, infer a replacement active account, remove an unproven credential id, or permit removal to straddle active productive Runs.


## 35. Authority-driven 0.6.0 technical closure

This section closes only the technical realization decisions exposed by the 0.6.0 exhaustive authority-first campaign. It does not restate P2/P3 semantics and does not make current implementation shape a preservation target.

### 35.1 Resolved project authority remains a pure core concern

`src/core/governance.ts` owns one pure resolution operation over the already-validated `ProjectManifest` plus repository-pattern expansion results supplied by the shell. The operation resolves, without filesystem I/O or persistence:

- the selected P1-P6 source paths per layer;
- explicit same-layer precedence relations exactly as declared by `precedence.p1` through `precedence.p6`; unlisted same-layer sources gain no implied precedence;
- inherited P1 defaults, explicit overrides and compatible extensions by stable rule/reference identity;
- the union of direct fitness gates and override/extension gates;
- the exact authority references that must remain material to stage context and sign-off.

Authority-array order and filesystem order remain processing order only. They never become semantic precedence.

The selected `authority.p1`–`authority.p6` sources are a **reachable authority set**, not an instruction to materialize every selected source into every stage. Stage materiality remains owned by `GW-DOC-LIFECYCLE-CONTEXT`: the current pinned WorkItem schema/template, mandatory stage policy, explicit upstream/signed authority references and their dependencies select the applicable subset. A stable `GW-DOC-*` ref resolves the current canonical owner; an explicit versioned ref resolves that exact retained semantic snapshot. A retained older semantic source may therefore remain selected/reachable so its versioned ref is live under P6 without entering a current-schema context merely because it shares the same authority layer.

The pure resolved projection must preserve enough ref/source identity to make that applicability deterministic. The daemon materializes only the applicable authority sources for the current stage and schema pin, then applies explicit same-layer precedence among sources that are simultaneously applicable. It must not turn `projectAuthorityForLayers(...)` or raw layer membership into an "include every selected file" context policy. Historical schema pins remain resolvable under their exact versioned authority while current v2 work consumes current stable owners unless a governing template/task explicitly names an older versioned ref.

`src/shell/project.ts` remains the repository-pattern/I/O owner. It expands authority and precedence selections against normalized repository-relative paths and validates that every referenced/precedence/override/extension source is reachable. It does not decide semantic authority.

`src/daemon/authority.ts` consumes the pure resolved result before constructing stage context. The provider receives the exact current manifest plus material authority artifacts in the resolved layer/precedence order; the daemon never asks the provider to invent precedence/default/override semantics. A same-layer semantic contradiction for which the resolved relation supplies no winner remains `CONTRADICTORY_AUTHORITY` and blocks through the existing stage/conformance path.

The resolved projection is transient functional-core output only. No new DTO, persisted table, HTTP model, ArtifactRole, lifecycle state or shadow authority document is introduced.

### 35.2 Permanent authority mutation uses the existing proposal/adoption owner

The existing `ARTIFACT_PROPOSAL_CREATED` / adoption path is extended rather than duplicated.

- During R2, a non-lifecycle proposal may target only an existing manifest-resolved P2 or P3 authority path and must declare `role = GOVERNANCE` plus the exact matching authority layer.
- During DESIGN, a non-lifecycle proposal may target only an existing manifest-resolved P4, P5 or P6 authority path and must declare `role = GOVERNANCE` plus the exact matching authority layer.
- The target path must already be selected by the current resolved authority graph for that exact layer; this 0.6.0 design does not authorize creation of a new permanent authority owner.
- The proposal `baseSha256` must match the current target bytes. Adoption re-resolves the project manifest/authority immediately before mutation and again before disposition.
- Lifecycle-document proposals retain their current stage-role/path semantics.
- Lifecycle and permanent-authority proposals share the same one-pending-proposal interaction grammar and disposition state. There is no second proposal queue/state machine.

An adopted permanent-authority proposal creates the ordinary immutable `GOVERNANCE` ArtifactRef for the changed bytes and uses existing dependency/freshness invalidation. The WorkItem lifecycle document records only the package consequence; it does not become a second permanent owner.

### 35.3 Durable-decision human input remains input, never authority

The existing HumanInput categories remain the only input taxonomy.

`INFORMATION` and `EVIDENCE` may be consumed as ordinary conversational facts.

`STAGE_CHOICE`, `AUTHORITY_DECISION` and `AUTHORITY_CONFLICT` are durable-decision categories. A human reply may supply the decision input, but the reply event itself never becomes durable product/technical authority. Before a STAGE Run can complete after the most recent answered durable-decision request, a later adopted artifact proposal must exist in that Run history (current lifecycle output or an admitted permanent-authority proposal as applicable). Otherwise completion admission fails and the stage remains with its current owner.

This is enforced by pure Run-event-history admission logic plus the existing daemon stage owner. No decision database or conversational-authority record is added.

### 35.4 Existing source, queue and Workbench owners are corrected in place

The following are realization corrections under already-binding P3/P4 ownership, not new architecture:

- `src/daemon/work-item-source.ts` factors one daemon-local planner for a newly validated source snapshot. Both browser creation and repository discovery produce the existing REGISTERED `QueuePlan` and persist only through the existing `applyPlan` boundary.
- `ui/src/app.tsx` owns active/include-archived query selection plus project/search derivation; `WorkItemQueue.tsx` receives the already-filtered rows and archive-toggle state while retaining row-local restore mutation presentation.
- `DocumentWorkspace.tsx` reuses its existing canonical Git-status path set and renders the exact changed governed paths in the confirmation before commit.
- Workbench current-attention derivation remains pure/canonical and independent of explicit historical/supporting material selection.
- Readiness, Approval, Settings and terminal-result corrections remain projections of existing canonical state; no readiness, settings or result field is added.

### 35.5 Module-boundary consequences

No new production module is required.

- `src/core/governance.ts`: pure authority/default/override/precedence resolution.
- `src/core/lifecycle.ts`: pure stage/input/proposal/completion admission policy where lifecycle semantics are involved.
- `src/core/contracts.ts`: canonical schemas/events only.
- `src/core/execution.ts`: role/event admission for the one new checkpoint-request event.
- `src/shell/project.ts`: deterministic repository-pattern expansion/manifest source proof only.
- `src/daemon/authority.ts`: compose resolved authority material into stage/sign-off context.
- `src/daemon/stage.ts`: stage interaction, proposal adoption and durable-decision completion admission.
- `src/daemon/work-item-source.ts`: singular source-admission/reconciliation orchestration.
- `src/daemon/execution.ts` + `src/daemon/validation.ts`: signed checkpoint request/reaction using the existing verification effect owner.
- existing Workbench feature renderers remain presentation adapters over canonical values.

If implementation would require another state model, transport shape, persistence table, service/class abstraction, new production module or dependency, it returns to DESIGN before such a change is made.
