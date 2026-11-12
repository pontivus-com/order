# 14 — External dependency facts and provenance

**Status:** Binding factual reference  
**Canonical concern ID:** `GW-DOC-EXTERNAL-FACTS`  
**Versioned concern ID:** `GW-DOC-EXTERNAL-FACTS-V1-2026-11-12`  
**Verified:** 2026-11-13  
**2026-11-13 CodeMirror toolbar/theme clarification:** CodeMirror does not provide a WYSIWYG Markdown formatting toolbar; Order therefore owns deterministic source-format commands and uses CodeMirror transactions/selection as the edit mechanism. CodeMirror documents `EditorView.theme(...)` as its editor chrome theming mechanism and separate syntax-highlighting extensions for token styling. The `codemirror@6.0.2` package directly depends on the CodeMirror view/language/search/commands packages and exports `EditorView` plus `basicSetup`; if Order imports any scoped CodeMirror package directly for custom syntax highlighting/theme composition, that scoped package must become an explicit pinned direct dependency in P7 rather than an undeclared transitive import. Sources: https://codemirror.net/examples/styling/, https://codemirror.net/examples/basic/, https://www.npmjs.com/package/codemirror.  \n**2026-11-13 CodeMirror Markdown-editor refresh:** verified CodeMirror 6 as an MIT-licensed exact-text editor substrate. The `codemirror` package current published version is `6.0.2` and provides the standard CodeMirror 6 basic setup; `@codemirror/lang-markdown` current published version is `6.5.2` and provides Markdown language support plus Markdown-specific Enter/Backspace key behavior. Order selects exact pins `codemirror@6.0.2` and `@codemirror/lang-markdown@6.5.2` for the governed exact-source Markdown editor. CodeMirror editor state remains browser-local presentation state; the relied-upon current source is the editor document text, not a Markdown AST/serialization. Sources: https://www.npmjs.com/package/codemirror, https://www.npmjs.com/package/@codemirror/lang-markdown.  
**2026-11-12 Astryx workbench refresh:** verified Astryx as an MIT-licensed beta React 19+ design system; the supported Vite consumer path can use the precompiled `@astryxdesign/core` distribution without adding a StyleX build plugin, Babel or PostCSS; Astryx publishes accessible layout, table/list, drawer, chat, Markdown/code, selector/multi-selector, segmented-control, icon and status primitives used by `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V1`. The current stable fixed-group package line observed from the publisher is `0.7.13` for `@astryxdesign/core` and `@astryxdesign/theme-neutral`; `@stylexjs/stylex` is `0.19.1`. Order uses exact stable pins, not canaries. The neutral theme may fall back to the system font stack; Order does not load its optional Google-hosted Figtree font. Sources: https://astryx.atmeta.com/components, https://astryx.atmeta.com/docs/theme, https://github.com/meta/astryx, https://www.npmjs.com/package/@astryxdesign/core, https://www.npmjs.com/package/@stylexjs/stylex.  
**2026-11-12 Astryx integration-detail refresh:** the pinned v0.7.13 source confirms `@astryxdesign/core` peers on React/React DOM >=19 and `@stylexjs/stylex ^0.19.0`; the root `Theme` provider accepts `mode = system | light | dark`, synchronizes root `data-theme` / `data-astryx-theme`, and removes the explicit `data-theme` in system mode. The published Vite/Tailwind consumer guidance requires the layer order to be declared before the existing Tailwind import and consumes reset/astryx/theme CSS without a build plugin. `Drawer` owns Escape/focus-return behavior for inspector detail surfaces. The pinned Markdown implementation has no raw-HTML rendering channel in its supported profile and rejects raw-markup channels in its Remark compatibility boundary; arbitrary evidence still remains escaped text in Order. The neutral theme package 0.7.13 depends on Lucide internally, so Order does not add a direct Lucide dependency merely for Astryx icons. Sources: https://github.com/meta/astryx/blob/v0.7.13/packages/core/README.md, https://github.com/meta/astryx/blob/v0.7.13/packages/core/src/theme/Theme.tsx, https://astryx.atmeta.com/components/Drawer, https://github.com/meta/astryx/blob/v0.7.13/packages/core/src/Markdown/Markdown.tsx, https://github.com/meta/astryx/blob/v0.7.13/packages/core/src/Markdown/remark.ts, https://github.com/meta/astryx/blob/v0.7.13/packages/themes/neutral/package.json.
**2026-11-12 clean-build/update refresh:** verified against the pinned tool families that Vite exposes underlying Rolldown configuration through `build.rolldownOptions`; Rolldown exposes `checks.moduleLevelDirective` as the narrow switch for warnings about non-`use strict` module directives; and Bun SQLite supports read-only, non-creating database opens with `{ readonly: true, create: false }`. Order relies on these capabilities only for the client-SPA build diagnostic policy and installer-side legacy-schema probing. No dependency pin changed. Sources: https://vite.dev/config/build-options, https://rolldown.rs/reference/InputOptions.checks, https://bun.sh/docs/runtime/sqlite.  
**2026-11-12 source-backed Markdown refresh:** verified the Node/Linux guarded-file-replacement facts required by the WorkItem source and lifecycle-Markdown write path. No dependency pin changed. The relied-upon guarantee is deliberately limited to Order's single-process expected-hash/no-yield replacement path plus later reconciliation; it is not cross-process filesystem CAS.  
**P7-12 provider-login correction:** 2026-11-11 — the immutable `anomalyco/opencode@v2.2.6` auth CLI requires a real interactive stdin/stdout TTY for API-key entry and unsupplied form/code fields (`requireInteractive()`), while the auth command supports the global `--standalone` flag. `ServerConnection.resolve` uses that flag to start a command-scoped private standalone server rather than discovering/autostarting the managed background service. Order therefore executes exactly `opencode --standalone auth login <provider>` in the private provider namespace and treats it as the sole operator-facing exception to bounded captured process output; login output is not semantic Order evidence. No new dependency, PTY subsystem, managed provider service or tracked path is authorized.  
**P7-11 embedded-UI correction:** 2026-11-11 — the same immutable `anomalyco/opencode@v2.2.6` audit proves foreground `serve` is explicitly the “v2 API and web server”, the serve command exposes no UI-only disable flag, and `packages/cli/src/server-process.ts` always composes `WebUi.handler()` around the API. Order therefore cannot honestly claim the embedded UI is disabled without adding an unauthorized proxy/network namespace/patched provider. The corrected v1 fact is narrower and enforceable: the OpenCode listener is a private random loopback endpoint, Order never exposes/forwards/links that listener or UI, and only authenticated V2 API calls are consumed. The pinned source also proves `OPENCODE_DISABLE_AUTOUPDATE=1` disables update checks. No dependency pin or tracked implementation surface changes.  
**P7-10 readiness correction:** 2026-11-11 — D2 implementation re-read the immutable `anomalyco/opencode@v2.2.6` source. The released V2 server protocol defines authenticated `GET /api/info` as `server.info`; the promise client exposes it as `client.server.info()`, and the server response includes the exact `version`. The prior `/global/health` wording was not present in the pinned V2 server and is withdrawn. The design intent is unchanged: parse the loopback startup URL, authenticate, and prove exact 2.2.6 readiness/version within 60 seconds. No dependency pin or implementation surface changes.  
**P7-9 pre-R3 refresh:** 2026-11-11 — rechecked after closing the P7-8 provenance-access defect. The complete direct package/runtime inventory remains valid against the current sources already named by this document: OpenCode upstream remains **2.2.7** while the audited Order server/client pin remains **2.2.6**; Bun remains **1.4.4**; TypeScript **7.0.2**; Node **26.13.0 LTS**; React/React DOM **19.3.1**; React declarations **19.3.0**; Zod **4.6.7**. Newer upstream releases remain available for deliberately pinned Vite (**8.3.7** upstream vs **8.3.5** pin), Vitest (**5.1.0** vs **5.0.5**), Playwright Test (**1.65.0** vs **1.64.1**), Tailwind/`@tailwindcss/vite` (**4.3.5** vs **4.3.3**) and TanStack Query (**5.107.1** vs **5.105.0**). The OpenCode 2.2.6 source facts below remain the audited pinned contract. The dependency/runtime inventory was revalidated against the pinned package and upstream sources named by this document. No external fact requires a dependency, P4, P6 or runtime-contract change.
**Prior P7-7 refresh:** 2026-11-11 — historical evidence for the P7-7 R3 baseline only.  
**Prior P7-2 refresh:** 2026-11-11 — historical evidence for the P7-2 R3 baseline only.  
**Prior P7-1 refresh:** 2026-11-10 — historical evidence for the rejected P7-1 baseline only.

The refresh re-confirmed the P7 pins and current upstream version facts: Bun 1.4.4, TypeScript 7.0.2, Node 26.13.0 LTS, React/React DOM 19.3.1, the 19.3.0 React declaration packages and Zod 4.6.7 remain at the recorded pins/current releases; newer upstream releases continue to exist for deliberately pinned Vite, Vitest, Playwright Test, Tailwind and TanStack Query. Newer availability does not authorize an upgrade. Primary refresh sources: https://opencode.ai/changelog, https://www.npmjs.com/, https://bun.sh/docs/, https://nodejs.org/en/download/archive/v26.13.0, plus the pinned-source/vendor references already enumerated in §§3–13.

## 1. Purpose

This document records the external facts Order v1 is allowed to rely on for every direct runtime, package, host-tool and copied-source dependency in the locked design.

It distinguishes five things that must not be conflated:

1. **Order v1 pin** — the exact version Order is designed and certified to use;
2. **upstream verified snapshot** — the release/package fact verified on the date above;
3. **relied-upon upstream capability** — behavior explicitly documented by the upstream owner and used by Order;
4. **runtime actual** — the version/capability Order must prove from the machine that actually executes the integration.

A package existing, a runtime being broadly compatible, or a behavior being familiar from another version is not evidence.

An upstream release becoming newer does **not** silently change the Order pin. Changing a Order pin or relying on a materially different vendor behavior is a P4/P6 design change and requires the integration certification in [GW-DOC-TECHNICAL-ARCHITECTURE-V1](12-technical-architecture.md) and [GW-DOC-CANONICAL-CONTRACTS-V1](13-canonical-contracts.md) to be rerun.

This document owns external facts and provenance. [GW-DOC-TECHNICAL-ARCHITECTURE-V1](12-technical-architecture.md) owns the decision to use each dependency and the permitted direct-dependency surface. [GW-DOC-CANONICAL-CONTRACTS-V1](13-canonical-contracts.md) owns the exact Order-side use contracts and certification. OpenCode behavioral semantics remain owned by [GW-DOC-OPENCODE-INTEGRATION-V1](07-opencode-integration-standard.md).

No Order document or implementation may infer an external dependency behavior from memory, generic ecosystem knowledge, a newer release, or a transitive package. If a relied-upon behavior is not grounded here or in [GW-DOC-OPENCODE-INTEGRATION-V1](07-opencode-integration-standard.md) for OpenCode, the implementation must fail closed and return to P4/P6.

## 2. Direct v1 dependency inventory

The following is the complete **designed direct dependency set** authorized for Order v1. The existing package set is materialized in `package.json` and `bun.lock`; the CodeMirror rows are the approved next implementation pins for the Markdown-editor extension and remain design authority until P7 materializes them together with the lockfile. Transitive packages are lockfile facts, not additional Order design dependencies.

| Integration | Order v1 pin | Upstream fact verified 2026-11-11 | Primary version evidence |
|---|---:|---:|---|
| OpenCode server | 2.2.6 | 2.2.7 current upstream release; 2.2.6 remains the audited Order pin | https://opencode.ai/changelog |
| `@opencode/client` | 2.2.6 | 2.2.6 published package | https://www.npmjs.com/package/@opencode/client |
| Bun runtime/package manager | 1.4.4 | 1.4.4 published/released | https://www.npmjs.com/package/bun |
| TypeScript | 7.0.2 | 7.0.2 npm `latest`; 7.1 beta/dev exists | https://www.npmjs.com/package/typescript |
| `@types/bun` | 1.4.4 | 1.4.4 published package | https://www.npmjs.com/package/@types/bun |
| Node.js build/test runtime | 26.13.0 | 26.13.0 LTS (`Lithium`) | https://nodejs.org/en/blog/release/v26.13.0 |
| React | 19.3.1 | 19.3.1 npm `latest` | https://www.npmjs.com/package/react |
| React DOM | 19.3.1 | 19.3.1 npm `latest` | https://www.npmjs.com/package/react-dom |
| `@types/react` | 19.3.0 | 19.3.0 published with TS 7.0 tag support | https://www.npmjs.com/package/@types/react |
| `@types/react-dom` | 19.3.0 | 19.3.0 published; peer `@types/react` | https://www.npmjs.com/package/@types/react-dom |
| Vite | 8.3.5 | 8.3.7 npm `latest` | https://www.npmjs.com/package/vite |
| Vitest | 5.0.5 | 5.1.0 npm package release | https://www.npmjs.com/package/vitest |
| `@playwright/test` | 1.64.1 | 1.65.0 current release; 1.64.1 remains the Order pin | https://github.com/microsoft/playwright/releases/tag/v1.64.1 |
| Tailwind CSS | 4.3.3 | 4.3.5 npm `latest` | https://www.npmjs.com/package/tailwindcss |
| `@tailwindcss/vite` | 4.3.3 | 4.3.5 npm `latest` | https://www.npmjs.com/package/@tailwindcss/vite |
| TanStack Query (`@tanstack/react-query`) | 5.105.0 | 5.107.1 npm `latest` | https://www.npmjs.com/package/@tanstack/react-query |
| Zod | 4.6.7 | 4.6.7 npm `latest` | https://www.npmjs.com/package/zod |
| `@astryxdesign/core` | 0.7.13 | 0.7.13 stable published package; upstream project currently beta | https://www.npmjs.com/package/@astryxdesign/core |
| `@astryxdesign/theme-neutral` | 0.7.13 | Astryx published packages use the same fixed release group | https://github.com/meta/astryx |
| `@stylexjs/stylex` | 0.19.1 | 0.19.1 published package | https://www.npmjs.com/package/@stylexjs/stylex |
| `codemirror` | 6.0.2 | 6.0.2 npm `latest`; standard CodeMirror 6 basic setup package | https://www.npmjs.com/package/codemirror |
| `@codemirror/lang-markdown` | 6.5.2 | 6.5.2 npm `latest`; Markdown language support package | https://www.npmjs.com/package/@codemirror/lang-markdown |

The direct browser-test dependency is **`@playwright/test`**, not `playwright`. The former is the Playwright Test runner and declares `playwright` as its dependency. Order does not add a second direct `playwright` dependency unless a later approved requirement directly imports the automation library outside Playwright Test.

P7 must materialize the package groups exactly:

```text
dependencies
  @astryxdesign/core          0.7.13
  @astryxdesign/theme-neutral 0.7.13
  @opencode/client            2.2.6
  @stylexjs/stylex            0.19.1
  @tanstack/react-query       5.105.0
  react                       19.3.1
  react-dom                   19.3.1
  zod                         4.6.7
  codemirror                  6.0.2
  @codemirror/lang-markdown  6.5.2

devDependencies
  @playwright/test       1.64.1
  @tailwindcss/vite      4.3.3
  @types/bun             1.4.4
  @types/react           19.3.0
  @types/react-dom       19.3.0
  tailwindcss            4.3.3
  typescript             7.0.2
  vite                   8.3.5
  vitest                 5.0.5
```

Every version string is exact: no `^`, `~`, wildcard, tag or range. Bun itself is pinned by `.bun-version`, Node by `.node-version`, and OpenCode server by the runtime preflight rather than by `package.json`.

Bun's package manager creates `bun.lock`; its documentation requires committing the lockfile for reproducible installs. `bun ci` is equivalent to `bun install --frozen-lockfile`: it installs the exact lockfile versions and fails when `package.json` and `bun.lock` disagree.

Sources:

- https://bun.sh/docs/pm/cli/install
- https://bun.sh/docs/pm/lockfile

Order CI and the P7/P8 verification path therefore use `bun ci`. A normal dependency change is made deliberately with Bun 1.4.4, then the resulting `package.json` and `bun.lock` are reviewed and committed together.

`@types/bun` may pull declaration packages such as `@types/node` and `undici-types` transitively. Those exact resolved versions are lockfile evidence, not additional direct Order design dependencies.

### OpenCode 2.2.6 pinned-source facts used by P7-7

The P7-7 provider-isolation/candidate review re-audited the immutable upstream tag `anomalyco/opencode@v2.2.6`. The following are external facts, not Order design decisions:

- `packages/cli/src/commands/handlers/serve.ts` forwards the parsed `--hostname`/integer `--port` into `ServerProcess.run`; `packages/cli/src/server-process.ts` passes port `0` through to the server start and, after the listener exists, prints `server listening on <formatted-bound-url>` through `console.log`. Port `0` is therefore usable for OS-assigned loopback binding and the emitted bound URL is the post-listen endpoint Order parses.
- `packages/core/src/config/discovery.ts` defines Linux system configuration at `/etc/opencode`; `packages/cli/src/server-process.ts` supplies foreground server config options for directory/project/Claude/file/content but no `system: false` override, so the foreground CLI path cannot disable that system source.
- `packages/cli/src/server-process.ts` maps `OPENCODE_DISABLE_PROJECT_CONFIG`, `OPENCODE_DISABLE_CLAUDE_CODE` and `OPENCODE_DISABLE_CLAUDE_CODE_SKILLS` into foreground server configuration/discovery behavior.
- compatibility roots include `.claude` and `.agents`; a private HOME prevents user-home compatibility material from entering Order's provider namespace.
- `packages/core/src/tool/plugin/read.ts` performs post-read discovery of nearby `AGENTS.md` and calls `SessionInstructions.load`, so disabling ordinary project-config/instruction discovery does not by itself eliminate read-triggered instruction injection.
- `packages/core/src/permission.ts` evaluates ordered permission rules with last matching rule winning.
- `packages/core/src/tool/plugin/write.ts` and `edit.ts` use the `edit` permission action; `packages/core/src/tool/plugin/patch.ts` asserts `edit` permission over the complete distinct source/destination resource set before applying a multi-file patch.

Order therefore relies on private HOME/XDG state, explicit system-config absence, the pinned discovery flags, pre-resolution of repository `AGENTS.md`, deny-first exact-path permissions and certified patch authorization. `OPENCODE_PURE`/`OPENCODE_DISABLE_EXTERNAL_SKILLS` may be supplied as defense in depth but are not the sole correctness boundary.

These facts are certified against the exact 2.2.6 pin. A provider upgrade requires re-audit under §10.

### OpenCode 2.2.6 setup/model/external-directory facts

The same immutable `anomalyco/opencode@v2.2.6` source additionally establishes the capabilities required by guided bootstrap and configured STAGE reference roots:

- the auth CLI accepts no provider argument and then opens its interactive provider picker; key/form/code methods require a real interactive terminal;
- the global `--standalone` mode makes auth/model CLI operations use a command-scoped local server rather than attaching to the managed background service;
- V2 `client.model.list` returns model entries carrying `providerID`, `id` and `enabled`; Order's existing provider preflight already relies on `enabled === true` for exact model availability, so guided setup can reuse the same released V2 catalog rather than parsing the convenience `opencode models` CLI output;
- `packages/core/src/file-access.ts` classifies paths outside the active Location/worktree through the separate `external_directory` permission action and requests resources in `<absolute-directory>/*` form before read/search access;
- `packages/core/src/tool/plugin/read.ts`, `glob.ts` and `grep.ts` all pass external targets through that authorization boundary; external `read` explicitly skips its nearby-`AGENTS.md` instruction-injection walk;
- `packages/core/src/util/wildcard.ts` implements `*` as `.*`, so an allow for `/root/*` matches descendant external-directory resources beneath that exact root.

Order therefore can expose configured external reference roots without opening arbitrary external access and can keep post-signoff roles external-directory denied. These are pinned-provider facts; the decision to grant them only to STAGE is owned by `GW-DOC-OPENCODE-INTEGRATION-V1`/P4/P6.
## 3. Bun 1.4.4 capability facts used by Order

Order uses Bun as a concrete runtime, not as a generic Node replacement. The following are the specific upstream facts relied upon.

### 3.1 TypeScript execution and declarations

Bun executes TypeScript by transpiling it and does **not** type-check it as part of normal execution. Bun's TypeScript documentation requires `@types/bun` for Bun API declarations and, for TypeScript 6/7, explicitly requires the Bun types to be selected in compiler configuration.

Sources:

- https://bun.sh/docs/typescript
- https://bun.sh/docs/typescript-6

Order therefore keeps TypeScript 7.0.2 as the independent type checker and pins `@types/bun@1.4.4`. Runtime execution is never treated as type-check evidence.

Bun documents that `bun run <executable>` resolves a locally installed executable from `node_modules/.bin`. Order's project type-check gate therefore invokes the pinned local compiler exactly as:

```text
bun run tsc --noEmit
```

Source:

- https://bun.sh/guides/install/from-npm-install-to-bun-install

Bun exposes `import.meta.dir` as the absolute directory containing the current module, and `Bun.file` accepts `file://` URL values. Order uses these only to locate its own built static assets relative to `src/daemon/server.ts`; it does not derive that path from the operator's current working directory.

Sources:

- https://bun.sh/docs/runtime/module-resolution
- https://bun.sh/reference/globals/bun/file

### 3.2 HTTP server

`Bun.serve` supplies the HTTP server used by `orderd`. Bun supports explicit hostname/port binding.

Bun's server runs in development mode by default unless `NODE_ENV=production` or `development: false` is supplied. In development mode an uncaught handler error can expose the error message, stack trace, source code and file paths.

Sources:

- https://bun.sh/docs/runtime/http/server
- https://bun.sh/docs/runtime/http/error-handling

Order must therefore pass `development: false` explicitly. Loopback binding and Order authentication remain Order design contracts, not Bun guarantees.

### 3.3 Child processes

`Bun.spawn` accepts explicit argv, cwd and environment and supports AbortSignal/timeout termination. `detached: true` starts the child in a separate process group: on POSIX Bun calls `setsid()`; on Windows it uses `UV_PROCESS_DETACHED`.

Bun documents timeout/AbortSignal as terminating the **spawned subprocess**. That is not evidence that Bun terminates every descendant of that subprocess.

Sources:

- https://bun.sh/docs/runtime/child-process
- https://bun.sh/reference/bun/Spawn/SpawnOptions/detached

Order therefore does not use Bun's child-only timeout/AbortSignal termination as its cancellation mechanism. On the Linux v1 host it starts the child detached, treats the child pid as the process-group id, and owns group termination through `process.kill(-pgid, signal)` under the Linux/POSIX semantics in §7.0. Descendant-kill certification remains mandatory in [GW-DOC-CANONICAL-CONTRACTS-V1](13-canonical-contracts.md).

Bun's spawn environment defaults to the process environment captured when Bun started. Order consequently supplies the complete permitted child environment explicitly instead of relying on that default.

### 3.4 SQLite

`bun:sqlite` is Bun's built-in SQLite binding. Bun documents WAL activation through `PRAGMA journal_mode = WAL`.

Source:

- https://bun.sh/docs/runtime/sqlite

Order does not infer the embedded SQLite engine version from Bun or upstream SQLite release numbers. It queries `SELECT sqlite_version()` from the actual `bun:sqlite` connection and applies the SQLite capability contract in §7.

### 3.5 TOML

`Bun.TOML.parse` parses TOML v1.1.0 into a JavaScript object. A file-backed `Blob` must not be passed directly; Bun documents reading the file text first.

Source:

- https://bun.sh/reference/bun/TOML/parse

Order therefore reads `pontivus-order.toml` as UTF-8 text and passes that text to `Bun.TOML.parse`, then validates the returned unknown object against the canonical manifest schema. No TOML package is a v1 dependency.

### 3.6 Glob

`Bun.Glob` supports scan options including `cwd`, `dot`, `absolute`, `followSymlinks`, `throwErrorOnBrokenSymlink` and `onlyFiles`.

Source:

- https://bun.sh/docs/runtime/glob

Order's exact fixed options and deterministic post-scan sorting are design contracts in [GW-DOC-CANONICAL-CONTRACTS-V1](13-canonical-contracts.md); they are not inferred from Bun defaults.

### 3.7 Filesystem classification

Bun documents `node:fs` as supported and exposes `statfsSync`, whose returned filesystem information includes a filesystem `type`.

Sources:

- https://bun.sh/reference/node/fs
- https://bun.sh/reference/node/fs/statfsSync
- https://bun.sh/reference/node/fs/StatsFs

On the Linux-only productive v1 host, Order accepts only these Linux `statfs(2)` local filesystem types for the state root:

| Filesystem | Linux magic |
|---|---:|
| ext2/ext3/ext4 | `0x0000ef53` |
| XFS | `0x58465342` |
| Btrfs | `0x9123683e` |
| F2FS | `0xf2f52010` |

These values are defined by Linux `statfs(2)` / `linux/magic.h`.

Sources:

- https://man7.org/linux/man-pages/man2/statfs.2.html
- https://github.com/torvalds/linux/blob/master/include/uapi/linux/magic.h

Every other filesystem type — including NFS, CIFS/SMB, 9P, FUSE, overlayfs, tmpfs and unknown values — is unsupported for the v1 Order state database. This is intentionally an allowlist, not a guessed remote-filesystem denylist. A later filesystem type requires P4/P6 evidence before admission.

The filesystem-type check remains only one input: Order still requires the two-connection SQLite WAL smoke test. Passing either check alone is insufficient.

### 3.8 UUID, CSPRNG and SHA-256

Bun supports the Web/Node `crypto.randomUUID()` API for UUIDv4 generation and the Web Crypto `crypto.getRandomValues(...)` API for cryptographically strong random bytes.

Sources:

- https://bun.sh/guides/util/javascript-uuid
- https://bun.sh/reference/node/crypto/Crypto/getRandomValues
- https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues

`Bun.CryptoHasher` supports cryptographic `sha256` and hexadecimal output. By contrast, `Bun.hash` is explicitly documented as **non-cryptographic**.

Source:

- https://bun.sh/docs/runtime/hashing

Order canonical UUID identifiers use `crypto.randomUUID()`. Every Order authentication/provider secret or one-time connect token is exactly 32 bytes from `crypto.getRandomValues(new Uint8Array(32))`, encoded as 64 lowercase hexadecimal characters without another crypto/token package.

The Web Encoding `TextEncoder` API always encodes strings as UTF-8 and returns a `Uint8Array`.

Sources:

- https://encoding.spec.whatwg.org/#interface-textencoder
- https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder

Every Order SHA-256 identity therefore hashes bytes only: repository identity hashes the exact file bytes; textual/canonical JSON identity first uses one `TextEncoder().encode(text)` UTF-8 conversion and then hashes those bytes with `Bun.CryptoHasher("sha256")`. Order never relies on an implicit string-to-bytes convention of the hashing API. `Math.random` is forbidden for secrets/tokens and `Bun.hash` is forbidden for canonical identity.

### 3.9 Timers

Bun implements standard JavaScript timers including `setTimeout`.

Source:

- https://bun.sh/docs/test/runtime-behavior#timers

Order uses one re-armed `setTimeout` for the periodic coordinator rather than introducing a scheduler package. Non-overlap and the 3600-second schedule are Order contracts certified by [GW-DOC-CANONICAL-CONTRACTS-V1](13-canonical-contracts.md).

## 4. TypeScript, Node and build/test tooling facts

### 4.1 TypeScript 7.0.2

TypeScript 7.0 is the native Go port. The TypeScript 7.0 release explicitly states that 7.0 does not ship a programmatic API; a new API is expected later.

Bun's TypeScript 6/7 guidance states that automatic `@types/*` discovery changed and Bun projects must explicitly include `"types": ["bun"]`. Bun's recommended compiler contract also uses `module: "Preserve"`, `moduleResolution: "bundler"`, `jsx: "react-jsx"` and `noEmit: true`. Vite's TypeScript guidance requires `isolatedModules: true` because its transformer works file-by-file without type information.

Sources:

- https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/
- https://www.npmjs.com/package/typescript
- https://bun.sh/docs/typescript
- https://bun.sh/docs/typescript-6
- https://vite.dev/guide/features

Order therefore invokes the pinned `tsc` CLI and does not import a TypeScript compiler API. The v1 compiler contract is exact:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "module": "Preserve",
    "moduleResolution": "bundler",
    "moduleDetection": "force",
    "jsx": "react-jsx",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "strict": true,
    "noEmit": true,
    "types": ["bun"]
  }
}
```

P7 may add only path/include/exclude settings required by the approved repository layout; it may not alter these compiler-option values. Imported React/Vitest/Playwright modules carry their own module declarations; Order does not rely on TypeScript's removed ambient auto-discovery behavior.

### 4.2 Node 26.13.0

Node 26.13.0 is the `Lithium` LTS release.

Source:

- https://nodejs.org/en/blog/release/v26.13.0

The pinned Node runtime is used only for the frontend/build/test tools that require Node. Bun remains Order's package manager and production daemon/CLI runtime.

### 4.3 Vite 8.3.5

Vite 8 requires Node 20.19+ or 22.12+; Node 26.13.0 satisfies that constraint. Vite supports `.tsx`/JSX transformation as a built-in feature and transpiles TypeScript without type-checking it.

Sources:

- https://vite.dev/blog/announcing-vite8
- https://vite.dev/guide/features

The official `@vitejs/plugin-react` provides React Fast Refresh. Order v1 has no Fast Refresh requirement and therefore does not add that plugin merely to compile React/TSX.

Source:

- https://vite.dev/plugins/

The exact pinned package declares its CLI as `vite -> bin/vite.js`.

Pinned source:

- https://github.com/vitejs/vite/blob/v8.3.5/packages/vite/package.json

Order's Node-run build command is therefore exactly:

```text
node node_modules/vite/bin/vite.js build
```

For the pinned Vite 8 build contract, `build.outDir` defaults to `dist` relative to the Vite project root, and the default HTML build entry is the root `index.html`. Order intentionally does not override `build.outDir`; the production SPA output is therefore the repository-root `dist/` tree.

Sources:

- https://v8.vite.dev/config/build-options
- https://vite.dev/guide/build

Type checking remains the separate pinned TypeScript CLI gate.

### 4.4 Vitest 5.0.5

Vitest 5 requires Node >=22.12 and Vite >=6.4.

Sources:

- https://vitest.dev/guide/
- https://vitest.dev/blog/vitest-5

The exact pinned package declares its CLI as `vitest -> ./vitest.mjs`.

Pinned source:

- https://github.com/vitest-dev/vitest/blob/v5.0.5/packages/vitest/package.json

The Order Node 26.13.0 / Vite 8.3.5 pins satisfy those upstream requirements. The Node-run test command is exactly:

```text
node node_modules/vitest/vitest.mjs run
```

Vitest's default test environment is `node`; browser emulation through `jsdom` or `happy-dom` requires those additional packages.

Sources:

- https://vitest.dev/config/environment
- https://vitest.dev/guide/environment.html

Order keeps Vitest explicitly in `environment: "node"` and uses it for functional-core, shell-unit and non-browser integration tests only. Browser/DOM behavior is owned by the pinned Playwright Chromium suite; P7 therefore does not add `jsdom`, `happy-dom`, `@testing-library/react` or a Vitest browser package.

### 4.5 Playwright Test 1.64.1

`@playwright/test` is the direct end-to-end test-runner package. In the exact upstream `v1.64.1` tag its package declares Node `>=20` and depends on `playwright@1.64.1`; `playwright` in turn depends on `playwright-core@1.64.1`.

The exact `v1.64.1` browser manifest maps the test stack to:

- Chromium / Chrome for Testing **156.0.8078.4**, revision 1248;
- Firefox **157.0**, revision 1555;
- WebKit **27.2**, revision 2370.

Playwright packages do not install browser binaries merely because the npm package was installed. The Playwright CLI must explicitly install the browser used by the test contract.

Sources:

- https://github.com/microsoft/playwright/blob/v1.64.1/packages/playwright-test/package.json
- https://github.com/microsoft/playwright/blob/v1.64.1/packages/playwright/package.json
- https://github.com/microsoft/playwright/blob/v1.64.1/packages/playwright-core/browsers.json
- https://playwright.dev/docs/browsers
- https://github.com/microsoft/playwright/releases/tag/v1.64.1

The exact pinned package declares `playwright -> cli.js`.

Pinned source:

- https://github.com/microsoft/playwright/blob/v1.64.1/packages/playwright-test/package.json

Order executes that locally installed CLI under pinned Node 26.13.0. The commands are exactly:

```text
node node_modules/@playwright/test/cli.js install chromium
node node_modules/@playwright/test/cli.js test
```

Its v1 automated browser compatibility baseline is the pinned Playwright Chromium **156.0.8078.4** build. Firefox/WebKit support is not claimed by v1 merely because Playwright can drive them.

Playwright Test's `webServer` configuration launches a local server command before tests, waits for the configured URL to become available, and can terminate the launched process group after the suite. Order uses this only in its browser-test harness to start the real local daemon; it is not a production process supervisor.

Source:

- https://playwright.dev/docs/test-webserver

### 4.6 Productive installer delivery facts

The v1 one-command installer relies on these distribution mechanisms without adding another Order runtime package dependency:

- Bun's official Linux installer accepts an explicit historical git tag; Order supplies `bun-v1.4.4` and an installation root beneath the Order-private application/runtime tree. Bun documents `unzip` as a Linux installer prerequisite.
- Node publishes exact-version Linux `x64` and `arm64` `.tar.xz` archives plus `SHASUMS256.txt` under the v26.13.0 release directory. Order selects the archive from host architecture, verifies its SHA-256 against that release manifest, and uses the installed Node for the pinned Vite build entry point.
- OpenCode v2 documents `bun install -g --trust @opencode/cli` as a supported CLI installation path. The exact `@opencode/cli@2.2.6` package is published and uses its trusted postinstall to select/materialize the native platform binary; Order copies the resulting runnable binary into the private runtime tree and still enforces the existing `opencode v2.2.6` runtime preflight.
- Git, `curl`, `tar`, `unzip`, `xz`, `sha256sum` and ordinary POSIX shell/core file utilities are install-time host tools only. They are not Order runtime libraries and do not change the closed direct npm dependency set in §8.

Primary sources:

- https://bun.com/docs/installation
- https://nodejs.org/en/download/archive/v26.13.0
- https://opencode.ai/docs
- https://www.npmjs.com/package/@opencode/cli

### 4.7 User-level systemd supervision facts

The Linux productive bootstrap also relies on the host systemd user manager rather than adding a Order process-supervisor dependency:

- systemd loads per-user unit configuration from `$XDG_CONFIG_HOME/systemd/user` or, when that variable is unset, `$HOME/.config/systemd/user`;
- `systemctl --user enable UNIT` enables the unit for the calling user; enablement and process start are distinct operations;
- `systemctl --user restart UNIT` starts the service when it is not already running and otherwise replaces the running process, which is the required reinstall behavior after activating new application bytes;
- changing user-unit files is made visible to the manager through the normal daemon reload semantics;
- starting a service spawns the daemon process; this is host process supervision and does not introduce application workflow/scheduler semantics.

Order must capability-probe `systemctl --user` during productive installation and fail clearly if a usable user manager is unavailable; it does not invoke `sudo`, create a system-wide unit, or install a supervisor package.

Primary sources:

- https://www.freedesktop.org/software/systemd/man/latest/systemd.unit
- https://www.freedesktop.org/software/systemd/man/latest/systemctl

## 5. Browser/UI dependency facts

### 5.1 React and React DOM

`react-dom` is intended to be paired with `react`. For a browser-rendered client application, `react-dom/client` exposes `createRoot`.

Sources:

- https://www.npmjs.com/package/react
- https://www.npmjs.com/package/react-dom
- https://react.dev/reference/react-dom/client/createRoot

Order's SPA uses function components and one browser root created with `createRoot`; it does not introduce server rendering/hydration.

The runtime packages are paired with the pinned `@types/react` and `@types/react-dom` declaration packages for the TypeScript build.

### 5.2 Tailwind CSS

Tailwind 4's official Vite integration is `tailwindcss` plus `@tailwindcss/vite`, configured as a Vite plugin, with `@import "tailwindcss"` in CSS. Tailwind generates static CSS and has no browser runtime.

Sources:

- https://tailwindcss.com/docs/installation/using-vite
- https://tailwindcss.com/blog/tailwindcss-v4

Order's Vite integration is exact:

```ts
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
});
```

and the application stylesheet imports Tailwind exactly once with:

```css
@import "tailwindcss";
```

Order does not add a separate PostCSS integration, `autoprefixer`, a second Tailwind build path or a Tailwind configuration package.

### 5.3 TanStack Query

TanStack Query v5 is explicitly a server-state/async-state cache with fetching, refetching, mutation and observation. `invalidateQueries` marks matching queries stale and actively rendered matching queries are refetched in the background.

Sources:

- https://tanstack.com/query/v5
- https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation

TanStack Query's client-side query observers retry failed queries by default and refetch stale queries on window focus unless configured otherwise.

Sources:

- https://tanstack.com/query/latest/docs/framework/react/reference/interfaces/UseQueryOptions
- https://tanstack.com/query/latest/docs/framework/react/guides/window-focus-refetching
- https://tanstack.com/query/latest/docs/framework/react/reference/classes/QueryClient

Order therefore does not rely on those defaults. It owns one `QueryClient` configured with query `retry: false`, mutation `retry: false`, `refetchOnWindowFocus: false`, `refetchOnReconnect: false` and `staleTime: 0`. Active Run/RunEvent observers use an explicit 1000 ms `refetchInterval` while active and `false` otherwise. This keeps server-state refresh behavior visible in Order rather than inherited from library defaults.

This supports Order's use of TanStack Query as the browser projection/cache for daemon-owned state. It does not make TanStack Query workflow authority or a second state machine.

### 5.4 Zod

Zod 4 defines runtime schemas that map to TypeScript types and validates untrusted data with schema parsing.

Sources:

- https://zod.dev/packages/zod
- https://www.npmjs.com/package/zod

Order uses one canonical Zod schema per semantic type and infers the TypeScript type from that schema. Canonical object schemas are strict: unknown keys are rejected rather than stripped or passed through. External ingress uses `safeParse`/the owning schema and only the parsed value crosses into the functional core. No parallel DTO/domain/persistence shape is introduced.

### 5.5 Browser transport/runtime facts

Order's production browser is host-provided rather than an npm dependency. v1 does not infer compatibility from a browser brand/version string.

The web-platform behaviors Order relies upon are:

- same-origin `fetch()` includes credentials/cookies by default;
- same-origin non-GET/HEAD fetches include the requesting origin in the `Origin` header;
- `HttpOnly` prevents JavaScript from reading the session cookie;
- `SameSite=Strict` restricts cross-site cookie transmission.

Sources:

- https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Origin
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie
- https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/Cookies

The automated v1 browser baseline is the exact Chromium build owned by pinned Playwright Test in §4.5. A different user browser may run Order, but v1 makes no compatibility claim for that engine/version until the same browser-security and workflow suite is added to certification. This avoids silently treating “modern browser” as an external contract.

## 6. Intentional Order-versus-upstream drift

The following Order UI/test pins are deliberately fixed at the already-certified Order baseline rather than automatically following the newest upstream package:

| Package | Order pin | Upstream verified snapshot |
|---|---:|---:|
| Vite | 8.3.5 | 8.3.7 |
| Vitest | 5.0.5 | 5.1.0 |
| `@playwright/test` | 1.64.1 | 1.65.0 |
| Tailwind CSS | 4.3.3 | 4.3.5 |
| `@tailwindcss/vite` | 4.3.3 | 4.3.5 |
| TanStack Query | 5.105.0 | 5.107.1 |

This is not version ignorance or an automatic upgrade backlog.

The v1 decision is to keep the certified Order dependency baseline fixed until an explicit P4/P6 upgrade is approved. P7 must use the Order pin, not the upstream snapshot.

A proposed upgrade is a P4/P6 change and must prove that the Order UI boundary and test/build toolchain still conform.

## 7. Host-provided Git, Linux and embedded SQLite facts

These dependencies are not truthfully represented by an npm-style Order package pin. Productive v1 additionally relies on the host user-level systemd capabilities grounded in §4.7; systemd is host process supervision, not a Order runtime package or application scheduler.

### 7.0 Productive host boundary

Order v1 productive daemon execution is supported on **Linux only**. This is a correctness boundary, not a claim about where Bun, Node, Git or browsers can generally run.

The existing v1 execution contract depends on Linux/POSIX process-group signaling and Linux `statfs(2)` filesystem type identifiers. Windows and macOS require different process-tree/filesystem contracts and are therefore later P4/P6 integrations rather than P7 branches.

Grounded facts:

- Bun 1.4.4 publishes Linux x64 and Linux arm64 runtimes;
- Node 26.13.0 publishes Linux x64 and Linux arm64 binaries;
- Linux `kill(2)` sends a signal to a process group when the pid argument is less than `-1`;
- Node 26 `process.kill()` delegates to the platform signal mechanism and explicitly notes that Windows rejects process-group pid usage;
- Linux `statfs(2)` exposes `f_type` filesystem magic values.

Sources:

- https://www.npmjs.com/package/bun
- https://nodejs.org/en/blog/release/v26.13.0
- https://man7.org/linux/man-pages/man2/kill.2.html
- https://nodejs.org/api/process.html#processkillpid-signal
- https://man7.org/linux/man-pages/man2/statfs.2.html

Order startup requires `process.platform === "linux"`. A different host fails startup preflight with an explicit unsupported-host prerequisite error; it does not create a new domain classification or select alternate process-kill, filesystem or state-path behavior.


### 7.1 Git

Order treats Git as a host-provided CLI and does not assert a numeric minimum. The runtime records `git --version` and accepts the host only when the required capability probes pass.

Relied-upon official facts:

- local-path `git clone` normally uses local optimizations/hardlinks; `--no-local` disables that behavior and uses regular Git transport;
- `--no-checkout` prevents checkout during clone;
- `git rev-parse --verify --end-of-options <rev>^{commit}` verifies exactly one revision and requires it to resolve to a commit-ish while protecting an untrusted revision from option parsing;
- `git status -z` implies porcelain v1 when no other format is selected, and porcelain v1 is stable for scripts;
- `GIT_CONFIG_NOSYSTEM` skips system Git config and `GIT_CONFIG_GLOBAL` selects the global config file.

Sources:

- https://git-scm.com/docs/git-clone
- https://git-scm.com/docs/git-rev-parse
- https://git-scm.com/docs/git-status
- https://git-scm.com/docs/git-config
- https://git-scm.com/docs/git

Order additionally sets `GIT_TERMINAL_PROMPT=0` and certifies that required commands cannot block on interactive credential prompting.

### 7.2 SQLite

Order uses the SQLite engine embedded in the pinned Bun runtime. It requires SQLite >=3.37 because STRICT tables were introduced in 3.37.0.

Relied-upon official facts:

- WAL requires all processes using the database to be on the same host and is not supported over a network filesystem;
- `STRICT` tables were introduced in SQLite 3.37.0;
- `PRAGMA synchronous = FULL` is ACID/durable in WAL mode;
- foreign-key enforcement must be explicitly enabled and checked rather than relying on a default;
- `PRAGMA busy_timeout` sets the connection's busy handler timeout;
- `PRAGMA user_version` is an application-owned integer that SQLite itself does not interpret;
- `json_valid(...)` validates JSON input.

Sources:

- https://www.sqlite.org/wal.html
- https://www.sqlite.org/stricttables.html
- https://www.sqlite.org/pragma.html
- https://www.sqlite.org/foreignkeys.html
- https://www.sqlite.org/json1.html

Order never infers Bun's embedded SQLite version from the current upstream SQLite release. The actual engine version is read from the running `bun:sqlite` connection.

### 7.3 XDG state-root convention

Order uses the XDG Base Directory Specification only as a state-location convention, not through an XDG library.

The specification states that XDG base-directory environment values must be absolute; a relative value is invalid and should be ignored. `XDG_STATE_HOME` defaults to `$HOME/.local/state` when unset or empty.

Source:

- https://specifications.freedesktop.org/basedir/

Order therefore resolves its state root in this exact order:

1. absolute non-empty `PONTIVUS_ORDER_STATE_ROOT`;
2. absolute non-empty `XDG_STATE_HOME` + `/pontivus-order`;
3. absolute non-empty `HOME` + `/.local/state/pontivus-order`;
4. otherwise startup fails and requires `PONTIVUS_ORDER_STATE_ROOT`.

A relative override/base variable is rejected rather than silently resolved against cwd.

### 7.4 Host browser launch

Order's browser transport does not require a platform-specific “open default browser” command or npm opener package. The correctness boundary is the authenticated one-time connect URL plus the browser HTTP contract in [GW-DOC-CANONICAL-CONTRACTS-V1](13-canonical-contracts.md).

Core v1 therefore emits that connect URL to stdout. Host-native automatic browser launching is optional packaging/convenience work outside the v1 correctness path and may not be introduced as a hidden direct dependency.

## 8. Direct-dependency closure

P7 may materialize only the direct package dependencies listed in §2 plus package-manager-created transitive dependencies.

The following are specifically **not** separate Order v1 direct dependencies because the locked design already has a verified narrower facility:

| Potential extra dependency | v1 facility |
|---|---|
| TOML parser | `Bun.TOML.parse` |
| UUID library | `crypto.randomUUID()` |
| random secret/token library | 32 CSPRNG bytes from `crypto.getRandomValues`, encoded as lowercase hex |
| SHA/hash library | `Bun.CryptoHasher("sha256")` |
| glob library | `Bun.Glob` |
| SQLite npm driver / ORM | `bun:sqlite` |
| Node/Bun HTTP framework | `Bun.serve` |
| scheduler library | one re-armed `setTimeout` |
| global browser state store | React local state + TanStack Query server state |
| React router package | native URL, URLSearchParams and History APIs for the limited v1 URL/search state |
| React Vite plugin | Vite's built-in TSX transform; no v1 Fast Refresh requirement |
| jsdom / happy-dom / React Testing Library / Vitest browser package | Vitest stays in Node environment; DOM/browser behavior is tested by Playwright Chromium |
| `playwright` direct package | transitive implementation dependency of direct `@playwright/test` |
| Private package/runtime import | none; only declared public dependencies and repository-local source are permitted |
| default-browser opener package/host command | none; `order open` emits the authenticated connect URL and browser launching is outside the v1 correctness path |

This is a closed v1 dependency surface, not a suggestion. A new direct dependency requires evidence that the current approved requirement cannot be satisfied by this set and must return through P4/P6 before P7 changes the manifest.

## 9. Runtime/version certification

Before productive use, Order/CI must prove the versions it actually executes.

Required exact checks for pinned binary/runtime dependencies:

```text
opencode --version                == opencode v2.2.6
OpenCode authenticated /api/info version == 2.2.6
@opencode/client package          == 2.2.6
bun --version                     == 1.4.4
node --version                    == v26.13.0
tsc --version                     == 7.0.2
```

The lockfile/package manifest must resolve exactly:

```text
@types/bun                 1.4.4
react                      19.3.1
react-dom                  19.3.1
@types/react               19.3.0
@types/react-dom           19.3.0
vite                       8.3.5
vitest                     5.0.5
@playwright/test           1.64.1
Playwright Chromium         156.0.8078.4
tailwindcss                4.3.3
@tailwindcss/vite          4.3.3
@tanstack/react-query      5.105.0
zod                        4.6.7
```

Host/embedded versions are recorded, not guessed:

```text
git --version
SELECT sqlite_version()
```

A version mismatch in an exactly pinned dependency is an integration preflight failure.

A host-provided or built-in capability is accepted only when its exact [GW-DOC-CANONICAL-CONTRACTS-V1](13-canonical-contracts.md) certification passes. A successful version string does not substitute for a behavior probe.

## 10. Freshness rule

The upstream snapshots and capability references in this document are date-bound factual evidence.

They must be refreshed:

- immediately before Order's P7 implementation plan enters independent R3;
- whenever a Order dependency pin or direct-dependency set is proposed to change;
- whenever an external integration capability test starts failing against an unchanged Order implementation;
- whenever vendor documentation indicates that a relied-upon API/version has been superseded, withdrawn or behaviorally changed.

Refreshing factual evidence alone does not authorize an upgrade or architecture change.

## 11. Fact ownership rule

This document owns **external dependency facts and their provenance**.

It does not own:

- the architectural decision to use a technology or exclude an unnecessary one -> [GW-DOC-TECHNICAL-ARCHITECTURE-V1](12-technical-architecture.md);
- OpenCode behavioral integration semantics -> [GW-DOC-OPENCODE-INTEGRATION-V1](07-opencode-integration-standard.md);
- Order-side runtime/data/transport/persistence/use contracts and capability tests -> [GW-DOC-CANONICAL-CONTRACTS-V1](13-canonical-contracts.md).

Those documents reference this factual baseline rather than re-infer dependency behavior independently.

## 12. Standard-library and protocol facts

These are material external contracts even though they do not add packages.

### 12.1 Time representation

RFC 3339 defines an Internet timestamp profile and `Z` denotes UTC offset 00:00. JavaScript `Date.prototype.toISOString()` emits UTC in the fixed millisecond form `YYYY-MM-DDTHH:mm:ss.sssZ` for four-digit years.

Sources:

- https://www.rfc-editor.org/rfc/rfc3339.html
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString

Order intentionally uses the narrower 24-character `toISOString()` representation rather than accepting every RFC 3339 spelling. The exact parser/generator is owned by [GW-DOC-CANONICAL-CONTRACTS-V1 §3](13-canonical-contracts.md).

### 12.2 JSON primitive serialization

JavaScript `JSON.stringify()` has stable, specified traversal behavior for JSON-serializable primitives and arrays/objects, but ordinary object property order is not Order's canonical key order.

Source:

- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify

Order therefore owns a small recursive canonical serializer in [GW-DOC-CANONICAL-CONTRACTS-V1 §6](13-canonical-contracts.md): it sorts object keys itself and uses `JSON.stringify()` only for primitive/string escaping, never by rebuilding a supposedly sorted object and relying on insertion/property-order behavior.

### 12.3 CLI bearer authentication

RFC 6750 defines the Bearer authorization scheme and the `Authorization: Bearer <token>` header form.

Source:

- https://www.rfc-editor.org/rfc/rfc6750.html

Order CLI authentication uses only that header form. Daemon credentials are never accepted in a query parameter or request body.

### 12.4 Browser fetch, Origin and cookies

The Fetch API defaults credentials to `same-origin`; fetch mode defaults to `cors`. User agents generally add the real `Origin` header to same-origin non-GET/HEAD requests. `Referrer-Policy: no-referrer` does not null that Origin for default-`cors` fetch requests. `HttpOnly`, `Path` and `SameSite=Strict` have the browser behaviors relied upon by Order.

Sources:

- https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
- https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Origin
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie

Order uses relative same-origin `fetch()` calls with explicit `credentials: "same-origin"` and leaves the request mode at its standard `cors` default so mutation requests carry their real Origin under the daemon's `no-referrer` policy.

## 13. Dependency evidence closure matrix

This matrix is a cross-reference only. It does not duplicate the semantic owners named in the final two columns.

| Dependency/capability | Grounded facts/provenance | Order use/governance owner | Executable proof owner |
|---|---|---|---|
| OpenCode 2.2.6 + `@opencode/client@2.2.6` | §2 plus pinned-source audit in [GW-DOC-OPENCODE-INTEGRATION-V1](07-opencode-integration-standard.md) | [GW-DOC-OPENCODE-INTEGRATION-V1](07-opencode-integration-standard.md) | [GW-DOC-CANONICAL-CONTRACTS-V1 §29](13-canonical-contracts.md) |
| Bun 1.4.4 runtime + `@types/bun@1.4.4` | §§2–3 | [GW-DOC-TECHNICAL-ARCHITECTURE-V1 §2](12-technical-architecture.md) | [GW-DOC-CANONICAL-CONTRACTS-V1 §29](13-canonical-contracts.md) |
| `Bun.serve` | §3.2 | [GW-DOC-TECHNICAL-ARCHITECTURE-V1 §§2,17](12-technical-architecture.md) | [GW-DOC-CANONICAL-CONTRACTS-V1 §§18,29](13-canonical-contracts.md) |
| Linux productive-host + `Bun.spawn`/process-group capability | §§3.3, 7.0 | [GW-DOC-TECHNICAL-ARCHITECTURE-V1 §§2,21](12-technical-architecture.md) | [GW-DOC-CANONICAL-CONTRACTS-V1 §§15,21,29](13-canonical-contracts.md) |
| `bun:sqlite` + embedded SQLite | §§3.4, 7.2 | [GW-DOC-TECHNICAL-ARCHITECTURE-V1 §§2,6](12-technical-architecture.md) | [GW-DOC-CANONICAL-CONTRACTS-V1 §§15–17,29](13-canonical-contracts.md) |
| `Bun.TOML.parse` | §3.5 | [GW-DOC-TECHNICAL-ARCHITECTURE-V1 §9](12-technical-architecture.md) | [GW-DOC-CANONICAL-CONTRACTS-V1 §§14,29](13-canonical-contracts.md) |
| `Bun.Glob` | §3.6 | [GW-DOC-TECHNICAL-ARCHITECTURE-V1 §§5,9](12-technical-architecture.md) | [GW-DOC-CANONICAL-CONTRACTS-V1 §§14,29](13-canonical-contracts.md) |
| `node:fs statfsSync` | §3.7 | [GW-DOC-TECHNICAL-ARCHITECTURE-V1 §6](12-technical-architecture.md) | [GW-DOC-CANONICAL-CONTRACTS-V1 §§15,29](13-canonical-contracts.md) |
| UUIDv4 + CSPRNG secret/token + SHA-256 built-ins | §3.8 | [GW-DOC-TECHNICAL-ARCHITECTURE-V1 §2](12-technical-architecture.md) | [GW-DOC-CANONICAL-CONTRACTS-V1 §§3,20,24,29](13-canonical-contracts.md) |
| `setTimeout` scheduler | §3.9 | [GW-DOC-TECHNICAL-ARCHITECTURE-V1 §19](12-technical-architecture.md) | [GW-DOC-CANONICAL-CONTRACTS-V1 §§23,29](13-canonical-contracts.md) |
| TypeScript 7.0.2 | §§2, 4.1 | [GW-DOC-TECHNICAL-ARCHITECTURE-V1 §2](12-technical-architecture.md) | [GW-DOC-CANONICAL-CONTRACTS-V1 §29](13-canonical-contracts.md) |
| Node 26.13.0 | §§2, 4.2 | [GW-DOC-TECHNICAL-ARCHITECTURE-V1 §2](12-technical-architecture.md) | [GW-DOC-CANONICAL-CONTRACTS-V1 §29](13-canonical-contracts.md) |
| Vite 8.3.5 | §§2, 4.3 | [GW-DOC-TECHNICAL-ARCHITECTURE-V1 §2](12-technical-architecture.md) | [GW-DOC-CANONICAL-CONTRACTS-V1 §29](13-canonical-contracts.md) |
| Vitest 5.0.5 Node-only test environment | §§2, 4.4 | [GW-DOC-TECHNICAL-ARCHITECTURE-V1 §2](12-technical-architecture.md) | [GW-DOC-CANONICAL-CONTRACTS-V1 §29](13-canonical-contracts.md) |
| `@playwright/test@1.64.1` + Chromium 156.0.8078.4 | §§2, 4.5, 5.5 | [GW-DOC-TECHNICAL-ARCHITECTURE-V1 §§2,27](12-technical-architecture.md) | [GW-DOC-CANONICAL-CONTRACTS-V1 §29](13-canonical-contracts.md) |
| React/React DOM 19.3.1 + declaration packages | §§2, 5.1 | [GW-DOC-TECHNICAL-ARCHITECTURE-V1 §2](12-technical-architecture.md) | [GW-DOC-CANONICAL-CONTRACTS-V1 §29](13-canonical-contracts.md) |
| Tailwind 4.3.3 + `@tailwindcss/vite@4.3.3` exact Vite/CSS wiring | §§2, 5.2 | [GW-DOC-TECHNICAL-ARCHITECTURE-V1 §2](12-technical-architecture.md) | [GW-DOC-CANONICAL-CONTRACTS-V1 §29](13-canonical-contracts.md) |
| TanStack Query 5.105.0 + explicit QueryClient/polling policy | §§2, 5.3 | [GW-DOC-TECHNICAL-ARCHITECTURE-V1 §§2,17](12-technical-architecture.md) and [GW-DOC-CANONICAL-CONTRACTS-V1 §27](13-canonical-contracts.md) | [GW-DOC-CANONICAL-CONTRACTS-V1 §29](13-canonical-contracts.md) |
| Zod 4.6.7 strict canonical ingress | §§2, 5.4 | [GW-DOC-TECHNICAL-ARCHITECTURE-V1 §8](12-technical-architecture.md) | [GW-DOC-CANONICAL-CONTRACTS-V1 §§2–14,29](13-canonical-contracts.md) |
| Host browser HTTP/cookie semantics | §§5.5, 7.4 | [GW-DOC-TECHNICAL-ARCHITECTURE-V1 §17](12-technical-architecture.md) and [GW-DOC-CANONICAL-CONTRACTS-V1 §24](13-canonical-contracts.md) | [GW-DOC-CANONICAL-CONTRACTS-V1 §29](13-canonical-contracts.md) |
| Host Git CLI | §7.1 | [GW-DOC-TECHNICAL-ARCHITECTURE-V1 §§4,20–21](12-technical-architecture.md) | [GW-DOC-CANONICAL-CONTRACTS-V1 §29](13-canonical-contracts.md) |
| XDG/HOME state convention | §7.3 | [GW-DOC-CANONICAL-CONTRACTS-V1 §§15,22](13-canonical-contracts.md) | [GW-DOC-CANONICAL-CONTRACTS-V1 §29](13-canonical-contracts.md) |
| OpenCode private auth/model listing + external-directory authorization | OpenCode 2.2.6 setup/model/external-directory facts | [GW-DOC-OPENCODE-INTEGRATION-V1 §§3,5–6](07-opencode-integration-standard.md) and [GW-DOC-TECHNICAL-ARCHITECTURE-V1 §§2,16](12-technical-architecture.md) | [GW-DOC-CANONICAL-CONTRACTS-V1 §§22,26,29](13-canonical-contracts.md) |
| user-level systemd unit discovery/enable/start | §4.7 | [GW-DOC-TECHNICAL-ARCHITECTURE-V1 §§2,19](12-technical-architecture.md) | [GW-DOC-CANONICAL-CONTRACTS-V1 §§22–23,29](13-canonical-contracts.md) |
| RFC3339/`Date.toISOString()` timestamp contract | §12.1 | [GW-DOC-CANONICAL-CONTRACTS-V1 §3](13-canonical-contracts.md) | [GW-DOC-CANONICAL-CONTRACTS-V1 §29](13-canonical-contracts.md) |
| canonical JSON/`JSON.stringify` primitive escaping | §12.2 | [GW-DOC-CANONICAL-CONTRACTS-V1 §6](13-canonical-contracts.md) | [GW-DOC-CANONICAL-CONTRACTS-V1 §29](13-canonical-contracts.md) |
| Bearer + browser Fetch/Origin/cookie protocol behavior | §§12.3–12.4 | [GW-DOC-CANONICAL-CONTRACTS-V1 §§18–20,24](13-canonical-contracts.md) | [GW-DOC-CANONICAL-CONTRACTS-V1 §29](13-canonical-contracts.md) |
| Node/Linux guarded Markdown replacement (`openSync`/`O_EXCL`/`O_NOFOLLOW`, `fsyncSync`, same-filesystem `rename`, directory fsync) | §14 | [GW-DOC-TECHNICAL-ARCHITECTURE-V1 §29](12-technical-architecture.md) and [GW-DOC-CANONICAL-CONTRACTS-V1 §31](13-canonical-contracts.md) | deterministic source/file-write integration tests required by P4/P6 |

If an implementation dependency or relied-upon behavior has no applicable row in this matrix (and is not an explicitly excluded convenience in §8), or if two rows assign contradictory owners/contracts to the same behavior, the dependency surface is not closed and P7 must return to P4/P6 instead of choosing a library or behavior.



## 14. Guarded Markdown file replacement facts

This section records the external API/host facts relied upon by the source-backed WorkItem and governed lifecycle-Markdown write path. Product behavior, path authorization, expected-hash policy and lifecycle reactions remain owned by P3/P4/P6. No new library/package dependency is introduced.

#### Official references

Pinned Node runtime documentation:

- Node.js v26.13.0 filesystem API: https://r2.nodejs.org/docs/latest/api/fs.html
- Node.js filesystem API canonical documentation: https://nodejs.org/api/fs.html

Linux userspace/kernel-interface documentation:

- Linux `rename(2)`: https://man7.org/linux/man-pages/man2/rename.2.html
- Linux `fsync(2)`: https://man7.org/linux/man-pages/man2/fsync.2.html
- Linux man-pages project provenance: https://www.kernel.org/doc/man-pages/

#### Relied-upon facts

#### Node `node:fs` synchronous operations

The pinned Node filesystem API exposes:

- `fs.openSync(path, flags, mode)` returning a file descriptor;
- `fs.constants.O_CREAT` for creation;
- `fs.constants.O_EXCL`, which makes an `O_CREAT` open fail if the target already exists;
- `fs.constants.O_NOFOLLOW`, which makes the open fail when the final path is a symbolic link on supported POSIX/Linux hosts;
- `fs.fsyncSync(fd)`, which requests that file data/metadata for the open descriptor be flushed to the storage device according to the underlying operating-system/device semantics;
- `fs.renameSync(oldPath, newPath)`, which invokes the platform rename operation;
- synchronous file/stat/realpath operations already used elsewhere in Order's Linux runtime.

Order uses the synchronous APIs deliberately for the short guarded replacement critical section so no JavaScript event-loop yield occurs between the expected-hash check and replacement effect inside the sole Order daemon process.

#### Linux rename semantics

Linux `rename(2)` documents that when `newpath` already exists, successful rename atomically replaces it: another process does not observe a point at which `newpath` is absent. It also documents `EXDEV` when old and new paths are on different mounted filesystems.

Order therefore creates the temporary replacement file in the target's own directory before rename. It does not rely on cross-filesystem rename behavior.

The atomic-replacement fact does not provide transactional coordination with an unrelated external process performing its own concurrent write. Order's product contract is consequently limited to expected-hash protection against state observable before Order enters its no-yield replacement operation, plus subsequent reconciliation/freshness detection of external edits.

#### Linux fsync and directory durability

Linux `fsync(2)` documents that `fsync()` flushes modified file data and associated file metadata and blocks until the device reports completion. The same documentation explicitly states that fsyncing a file does not necessarily make the containing directory entry durable; an explicit `fsync()` on a descriptor for the containing directory is needed for that directory-entry persistence.

The guarded replacement sequence therefore requires:

1. write the same-directory temporary regular file;
2. fsync the temporary file descriptor;
3. close it;
4. rename it over the authorized target;
5. fsync the containing directory descriptor;
6. read back and SHA-256 verify the resulting target bytes.

#### Explicit limits

These facts do not authorize:

- a filesystem watcher;
- network/distributed locking;
- claiming atomic compare-and-swap against arbitrary external editors;
- cross-filesystem replacement;
- a new filesystem abstraction layer outside the P4 module design;
- changing Order's Linux-only v1 host posture;
- adding a package dependency for filesystem operations.

#### Required capability evidence

The implementation/certification suite must exercise the exact pinned runtime and supported Linux host with deterministic fixtures proving at minimum:

- exclusive create fails when the target already exists;
- final-component symlink write targets are rejected by the owning path boundary/open mode;
- expected-hash mismatch produces no target replacement;
- two Order mutation attempts using the same old hash cannot both succeed through the synchronous guarded writer;
- same-directory replacement yields the exact requested bytes and read-back SHA-256;
- parent-directory fsync is executed after successful rename;
- source temporary files do not match WorkItem `.md` discovery.

The tests prove Order's use of the documented primitives; they do not claim to simulate power-loss durability beyond the documented host/filesystem contract.
