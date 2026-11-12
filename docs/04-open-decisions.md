# 04 — Technical decision register

**Status:** v1 blocking decisions resolved
**Canonical concern ID:** `GW-DOC-TECHNICAL-DECISIONS`  
**Versioned concern ID:** `GW-DOC-TECHNICAL-DECISIONS-V1`  

This register records consequential technical choices that were previously open. Their owning technical contract is [GW-DOC-TECHNICAL-ARCHITECTURE-V1](12-technical-architecture.md).

## D1 — Workspace isolation strategy

**Status:** RESOLVED

v1 uses one fresh isolated checkout directory per execution run under a Order-owned factory root, checked out at the exact approved baseline commit.

The active human/developer working tree is never used for unattended execution.

Candidate/failure workspaces are retained for inspection/handoff. v1 has no automatic workspace-cleanup or retention-policy subsystem; cleanup is an explicit local operator action outside Order's correctness path.

Rationale: this is the smallest mechanism that gives deterministic baseline, human-tree isolation, recoverability, inspectable candidate state, and no dependency on branch/worktree or retention-policy machinery.

## D2 — Exact execution-task physical representation

**Status:** RESOLVED

The signed P7 plan contains exactly one canonical fenced `order-tasks` JSON block.

Order parses this strict machine-readable block deterministically. It never asks an LLM to infer tasks from arbitrary prose.

R3 validates the task block against plan/design/requirements. Sign-off displays the exact parsed tasks. Approved `ExecutionTask` records are deterministic materializations of the signed block.

## D3 — Artifact identity policy

**Status:** RESOLVED

v1 uses SHA-256 over exact artifact bytes.

`ArtifactRef` records one WorkItem-owned repository file snapshot through normalized relative path, layer/role, content SHA-256, and repository baseline where applicable. Repository/project identity is derived through the owning WorkItem; no duplicate repository-id or materiality field exists on ArtifactRef.

Approval identity uses SHA-256 over Order canonical JSON for the exact signed PLAN/R3 semantic snapshots, approved baseline, the exact source-backed WorkItem snapshot hash, and the material semantic source snapshots selected by their transitive ArtifactRef dependency closure. Generated ArtifactRef ids and dependency-row ids are not authority and therefore are not hashed. The closure includes material project governance, manifest and verification references when they affected the signed package. The PLAN bytes themselves bind the exact `order-tasks` block, so Approval does not persist a second task-block hash or project-manifest pointer.

The WorkItem source path itself is not semantic authority and is not hashed; an unchanged source may move while preserving identity. New approvals bind a non-null source hash. Historical approvals created before source binding remain explicitly unbound provenance and are not reinterpreted as if they had approved a later source snapshot.

Any signed closure artifact byte change or approved WorkItem-source byte change invalidates the previous identity. Sign-off requires every repository ArtifactRef in that closure to be byte-identical to the approved Git baseline and the current source snapshot to equal the source hash entering the package identity; material uncommitted repository artifacts cannot be signed.

## D4 — OpenCode V2 server/client boundary

**Status:** RESOLVED

The verified v1 provider baseline is the exact matching OpenCode server/V2-client pair owned by [GW-DOC-EXTERNAL-FACTS-V1-2026-11-12](14-external-version-facts.md). This decision owns the requirement that the pair is exact and matched; it does not duplicate the version values.

Order starts and supervises its own loopback-only `opencode serve` child process. It does not use repeated `opencode run --session` invocations as the interactive control plane and does not attach to an arbitrary user OpenCode background service.

Each Order Run starts with a fresh OpenCode session. Ordinary turns may continue that session only while the resolved Order `contextHash` remains unchanged. A material authority/context change replaces the OpenCode session before the next productive turn, even when the Order Run and lifecycle stage remain the same. Sessions never cross Order Run, lifecycle-stage or work-item boundaries.

Order does not subscribe to OpenCode's live event stream in v1 and does not depend on experimental event/wait APIs for correctness. It uses the pinned released V2 durable-session contract and a deterministic prompt admission id. Post-signoff provider loss is governed by Order's bounded same-role/same-trigger operational replacement policy: at most one automatic replacement Run, always with a fresh D1 checkout/session, then block. The exact admission, completion and provider-loss semantics are owned by [GW-DOC-OPENCODE-INTEGRATION-V1](07-opencode-integration-standard.md) and [GW-DOC-CANONICAL-CONTRACTS-V1](13-canonical-contracts.md). Plain foreground `opencode serve` remains part of this resolved decision; switching to OpenCode service mode is a material integration change.

The provider process runs in a Order-private HOME/XDG/database namespace and fails closed on the pinned Linux system-config source that the OpenCode build bound by `GW-DOC-EXTERNAL-FACTS-V1-2026-11-12` cannot disable. Ordinary project/Claude compatibility discovery is disabled through the pinned foreground-server controls. Because the bound OpenCode build's `read` tool can still inject nested `AGENTS.md`, Order pre-resolves every such file as material P1 authority before productive use; that provider behavior is therefore a rendering of already-resolved authority, not an alternate discovery mechanism. External plugin/skill sources are kept off Order's correctness path by the isolated namespace and deny-first session capability profile; `OPENCODE_PURE`/external-skill flags are defense in depth unless independently certified. Order never delegates Order HITL decisions to OpenCode `ask` permissions.

The current released V2 client contract does not provide a verified equivalent of the legacy SDK's JSON-schema output mechanism. Order therefore uses final assistant JSON text plus its canonical Zod parser, with at most one tool-disabled format-repair turn. A future native structured-output path may replace this rendering only after a pinned-version capability audit.

A provider upgrade is material integration work: server/client versions must match and the capability certification in docs/13 must pass before use.

## D5 — Project verification binding representation

**Status:** RESOLVED

v1 uses project-root `pontivus-order.toml`.

Logical gate ids map to exact argv arrays, workspace-relative cwd, timeout, optional environment-name allowlist, and material repository references that define the gate's behavior (for example wrapper scripts or lockfiles).

Commands are not shell-interpolated. Complex environments are represented by project-owned wrapper scripts rather than copied policy inside Order.

The same manifest carries an exact stable-authority-reference-to-source-path map plus project concern mappings without copying their semantic contents. Signed task references resolve only through that map; no implementation-time prose scan or alias inference is permitted.

## D6 — Human interaction, sign-off and re-entry

**Status:** RESOLVED

v1 is local-UI-first with a thin CLI using the same daemon commands.

The browser workbench supports interactive R1/R2/DESIGN/PLAN work, evidence/authority inspection, artifact proposals, R3 inspection, sign-off and candidate review.

v1 sign-off is a browser-workbench action. The UI supplies the exact displayed package hash and requires explicit affirmative action before the daemon writes immutable `Approval`. The thin CLI has no lifecycle sign-off command.

When missing/upstream authority is supplied through an interactive Run, Order records it only through an explicitly adopted canonical project artifact. Free-form conversation does not become authority merely because it was said.

The Markdown workbench adds a distinct direct-human-authoring path for the exact WorkItem/R1/R2/DESIGN/PLAN Markdown surfaces governed by `GW-DOC-MARKDOWN-WORKBENCH-V1`. Pressing Save against the current expected hash is the explicit mutation action; it does not create a synthetic agent proposal. The save invalidates downstream conformance/readiness and returns ownership to the edited stage. R3 remains an independent read-only judgment, and execution/candidate/runtime outputs remain inspection-only.

## D7 — Integration with Span

**Status:** RESOLVED

No direct Span integration exists in v1.

Span may be available through target-project/OpenCode tooling, but Order has no Span-specific dependency and Span owns none of Order lifecycle, approval, artifact identity or conformance state.

## D8 — Stage-agent invocation

**Status:** RESOLVED

All agentic lifecycle stages use one OpenCode provider-shell invocation contract parameterized by stage, resolved context, workspace, permissions and expected output.

Pre-signoff Order Runs may be interactive and may continue one provider session across turns inside that same Run. Post-signoff builder, reviewer and remediator Runs each start a separate fresh session; operational replacements are new Runs/sessions and never resume provider state.

No separate domain agent classes are introduced for research, requirements, design, planning, frontend, backend, infrastructure or similar concerns.

## D9 — Engineering-concern resolution

**Status:** RESOLVED

Concern ids are project-defined applicability metadata.

The applicable set is derived deterministically from WorkItem concerns, validated upstream classification, project surface mappings, and signed task concerns. Concern mappings in `pontivus-order.toml` resolve authority and logical gates into the existing context mechanism.

Concerns do not create separate workflows, states or domain types.

## D10 — Semantic reaction/event contract

**Status:** RESOLVED

`RunEvent` is the normalized semantic event boundary.

Pure reaction policy maps current state + semantic event + governing policy to promotion, invalidation, remediation, retry, upstream return, linked IDEA creation or block.

No message broker/event-bus architecture is introduced.

## D11 — Runtime and UI technology

**Status:** RESOLVED

v1 uses the exact dependency set and pins owned by [GW-DOC-EXTERNAL-FACTS-V1-2026-11-12](14-external-version-facts.md). This decision owns the closed technology/dependency choice and exact-pin posture; the version values remain solely in that canonical factual snapshot.

These are Order v1 pins, not claims that every pin is the newest upstream package. The factual upstream-versus-pin snapshot, exact runtime/dev dependency grouping, lockfile/install contract and Pontivus reuse baseline are documented in [GW-DOC-EXTERNAL-FACTS-V1-2026-11-12](14-external-version-facts.md). Productive v1 daemon execution is Linux-only; Windows/macOS are later P4/P6 host integrations rather than P7 branches.

TypeScript 7.0 has no stable programmatic compiler API, so Order does not import the TypeScript compiler API. The complete TypeScript/Bun/Vite compiler options are fixed by [GW-DOC-TECHNICAL-ARCHITECTURE-V1](12-technical-architecture.md) and certified by [GW-DOC-CANONICAL-CONTRACTS-V1](13-canonical-contracts.md), rather than left to P7. Vite/Vitest/`@playwright/test` run under the pinned Node runtime rather than relying on Bun's Node compatibility.

The automated v1 browser compatibility target is the exact Playwright-owned Chromium build identified by `GW-DOC-EXTERNAL-FACTS-V1-2026-11-12`; Firefox/WebKit compatibility is not implied. TanStack Query owns daemon/server state in the UI; ordinary React component/URL state owns presentation-local state; no global client-state store is introduced. Zod owns canonical runtime schemas.

The local SPA is served by the persistent Bun daemon. No SSR framework, ORM, Electron/Tauri runtime, Radix, Tremor or replacement application framework is introduced in v1. D16 authorizes a selective pinned Astryx component dependency beneath Order's existing local semantic UI boundary; that does not transfer workbench information architecture or state ownership to Astryx.

The governed Markdown editor uses a controlled semantic textarea path and existing React/TanStack Query state boundaries. Under D16, Astryx `TextArea` may implement that semantic control, but Astryx `RichTextEditor` and any Lexical/rich-text/AST document authority remain prohibited. Source-backed Markdown authoring introduces no CodeMirror, Monaco, ProseMirror/TipTap, Milkdown, EasyMDE, YAML/frontmatter, file-watcher, ORM, Git-library, generated-client, or additional browser-state dependency. Exact source text remains the authority; optional read-only Markdown rendering never becomes mutation authority.

Order uses only project-neutral UI contracts/patterns/primitives permitted by its current technical architecture and pinned dependency boundary.

## D12 — Local daemon transport

**Status:** RESOLVED

`orderd` is the sole state-mutating process.

Browser and CLI use the same loopback HTTP command/query boundary. The browser observes active Runs by polling the canonical Run/RunEvent queries and invalidating/refetching after mutations. `order open` emits the one-time authenticated connect URL; automatic host-browser launching is not a v1 correctness dependency. v1 has no browser WebSocket/SSE transport and no provider-token forwarding.

The exact contract is owned by [GW-DOC-CANONICAL-CONTRACTS-V1](13-canonical-contracts.md).

## D13 — P6 contract and persistence ownership

**Status:** RESOLVED

[GW-DOC-CANONICAL-CONTRACTS-V1](13-canonical-contracts.md) is the single owner of v1 semantic schemas, `pontivus-order.toml`, the signed task-block grammar, SQLite schema and HTTP contracts.

One Zod schema/type owns each semantic concept. There are no DTO/domain/persistence/UI copies.

## D14 — External integration certification

**Status:** RESOLVED

Every external capability on Order's correctness path requires both a pinned/versioned contract supported by current authoritative vendor documentation and a deterministic capability probe or integration test proving the behavior Order actually relies on.

This applies to OpenCode, Linux host/process/filesystem semantics, Bun subprocess/HTTP/TOML/Glob/crypto/timer behavior, embedded SQLite features/pragmas, Git checkout/status semantics, package/lockfile materialization, Node/frontend tooling, browser loopback security/protocol behavior, timestamp/canonical-JSON standards and the selected generic UI component substrate.

Vendor documentation alone is not runtime proof. The dated version/provenance snapshot is owned by [GW-DOC-EXTERNAL-FACTS-V1-2026-11-12](14-external-version-facts.md). An upgrade or failed capability probe blocks execution rather than silently selecting a fallback.

## D15 — Productive bootstrap, private provider state and repository access

**Status:** RESOLVED

The productive v1 installation is a complete purpose-built guided bootstrap, not a package copy followed by a second setup program. Root `install.sh` remains the single user-invoked surface but is only a minimal bootstrap: it obtains the exact pinned Bun runtime and transfers control to `src/installer.ts`. The custom installer then owns the complete runtime/application installation, private-provider authentication, exact model selection, exact target-repository/reference-root choices, launcher/service materialization, activation and health proof in one continuous flow. `order setup` remains only an explicit later reconfiguration/recovery surface and is not part of normal installation. OpenCode credentials remain in Order's existing private HOME/XDG/SQLite namespace. Ambient/user OpenCode credentials and configuration are not imported merely to reduce onboarding friction.

Order separately persists exact target-repository roots and optional STAGE reference roots. Each target entry is one exact validated Git repository with a root `pontivus-order.toml`; broad parent roots are never recursively interpreted as a project catalog. The configured target set therefore supplies the finite project picker without filesystem guessing or a second registry.

WorkItem documentation is repository-native. Each selected project resolves one repository-relative Order documentation root through its validated project manifest, defaulting to `docs/order/work-items`. The originating Work request and newly created lifecycle Markdown live inside that repository. There is no productive installation-global WorkItem-source root.

Order may create a Git commit for governed WorkItem documentation only through an explicit human documentation-save action. That commit is path-scoped to the current WorkItem's canonical document set and cannot include unrelated staged or unstaged repository paths. It never pushes, opens a pull request, merges, changes branches or creates implementation authority. Reference roots remain an explicit opt-in read boundary for pre-signoff STAGE research only.

The productive daemon is supervised by one user-level systemd service installed and started by the installer. systemd owns only host process supervision; `orderd` remains the sole Order state writer and sole scheduler owner. The installer reports success only after the service is active and the canonical health probe succeeds.

This decision introduces no provider abstraction, credential copy/import layer, background queue, second daemon state machine, DTO family or OOP service layer.


## D16 — Selective Astryx workbench component substrate

**Status:** RESOLVED

Order uses the exact pinned Astryx dependency set owned by `GW-DOC-EXTERNAL-FACTS-V1-2026-11-12` to implement generic accessible workbench interactions defined by `GW-DOC-WORKBENCH-UX-V1` and technically constrained by `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V1`.

Astryx remains below Order's local semantic UI boundary. Order continues to own information architecture, lifecycle/domain state, action semantics, responsive space allocation, canonical types, TanStack Query server state and browser presentation state. Astryx may supply layout, drawer, table/list, selector, segmented-control, icon, chat, status, code/evidence and related generic interaction primitives.

Order consumes Astryx's precompiled distribution. It does not add the Astryx source-build/StyleX compiler path merely for component consumption. Astryx templates do not become Order page authority.

The exact Markdown source remains the human-editable authority. Astryx `RichTextEditor` is prohibited; the controlled textarea path remains canonical. Astryx chat/streaming-capable presentation does not authorize provider-token forwarding, WebSocket/SSE, or another Run/event state model.

Astryx is beta and therefore follows Order's exact-pin and external-integration certification discipline. Upgrades are deliberate P4/factual changes rather than ambient dependency movement.

The root Astryx Theme is the single mounted component owner of ongoing root theme-attribute synchronization and receives Order's existing System/Light/Dark browser-local preference. The precompiled CSS path and Order-over-Astryx token cascade are owned by `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V1`. Arbitrary evidence remains escaped text; only known canonical Markdown may use Astryx Markdown rendering.


## D17 — Order product/technical identity cutover

**Status:** RESOLVED

Public product identity is owned by `GW-DOC-PRODUCT-IDENTITY-V1`. The exact live technical namespace and bounded predecessor migration are owned by `GW-DOC-ORDER-TECHNICAL-IDENTITY-V1`.

The identity change is a semantic-preserving product/technical rename, not a lifecycle or domain redesign. Stable `GW-*` authority identifiers remain unchanged. The productive runtime has one live identity after cutover; Gateweft recognition is limited to historical provenance, the final pre-cutover task-fence bootstrap, and bounded installer-owned predecessor migration.

The workbench UX/Astryx package completed before the Order identity cutover. The verified public-safe Order source is published to the existing `pontivus-com/order` repository as a sanitized snapshot without importing private-origin history.



## D18 — Repository-native WorkItem documentation and explicit Git persistence

**Status:** RESOLVED

Project selection is the durable documentation boundary. New Work requests and Order-owned lifecycle Markdown live under one deterministic WorkItem directory inside the selected target Git repository, with the repository-relative root resolved from `pontivus-order.toml` and defaulting to `docs/order/work-items`.

Order may automate the mechanical Git commit for those governed documents only after explicit human action. The commit is path-scoped to the current WorkItem document set, requires an attached branch, no in-progress Git operation, no active WorkItem Run and pre-signoff lifecycle eligibility, and uses only repository-local `user.name`/`user.email` for attribution under Order's system/global-Git-config-disabled environment. It never pushes, changes branches, merges, rebases or absorbs unrelated repository changes.

Repository lifecycle files are portable content, not portable runtime history. A fresh installation may rediscover deterministic lifecycle Markdown as drafts, but file presence never fabricates RunEvents, conformance, readiness, Approval or execution history.

The bounded v2→v3 migration cannot rebind an old Approval to a repository baseline that did not contain the Work request. Active execution blocks migration; pre-signoff material is copied to deterministic paths and revalidated; completed history remains terminal provenance.

CodeMirror remains the already-adopted exact-source Markdown editor implementation. Repository-native storage/Git persistence changes its backing path/status/mutation environment only; they do not replace its source-buffer, preview, formatting, theme or editor-state contracts.

## Implementation state

The CodeMirror Markdown editor extension and earlier v1 workbench/runtime baseline are materialized in the current Order implementation.

The repository-native WorkItem v3 design, explicit documentation-Git persistence and the user-facing workflow/Activity remediation are **binding design ahead of implementation**. The current implementation must not be described as conformant to those later contracts until the refreshed P7 package is executed and independently verified. The stale earlier remediation plan remains non-authoritative for execution until regenerated against current P3-P6 authority.

P7/R3 task records remain implementation provenance rather than standing semantic authority. Future changes continue to follow the lifecycle and authority model owned by the canonical P1-P6 documents; this register does not independently authorize or broaden any later implementation scope.
