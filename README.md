# Order

**Pontivus Order**

**Governed software delivery for coding agents.**

> **Give agents the work. Keep authority over what counts as done.**

Order turns engineering intent into explicitly approved work, runs coding agents within that authority, and independently verifies the resulting change. The canonical design set starts at `docs/README.md`.

## Install

Order v1 is Linux-only. Productive installation is **one command** from the public repository:

```bash
sh -c 'd=$(mktemp -d); git clone --depth 1 https://github.com/pontivus-com/order.git "$d/order" && "$d/order/install.sh"; rc=$?; rm -rf "$d"; exit $rc'
```

`install.sh` is only the minimal bootstrap. It verifies the source checkout, obtains exact Bun 1.4.4 in a temporary bootstrap root, and transfers control to Order's purpose-built `src/installer.ts`; it does not perform the product setup workflow itself.

The purpose-built installer then installs and verifies the exact pinned Bun, Node and OpenCode runtimes under `~/.local/share/pontivus-order`, installs the committed dependency graph, builds production `dist/`, installs `~/.local/bin/order`, guides private OpenCode provider authentication and exact model selection when required, persists target-repository and optional STAGE reference roots, installs/enables the user-level `pontivus-order.service`, and refuses success until `order status` is healthy. Re-running the same command is also the supported update path.

For the immediately preceding supported Gateweft beta only, the installer performs a bounded one-way predecessor migration: it stops the old service, moves the previous default install/state/provider namespace when the Order destination is absent, renames the database while quiesced, preserves valid configuration/credentials, proves the Order service healthy, and only then removes old launcher/service/install artifacts. Mixed old/new productive roots fail before mutation. A configured target repository that still has only `gateweft.toml` is blocked with an actionable instruction to adopt `pontivus-order.toml` under that repository's own authority; Order does not silently rename or rewrite target governance.

Install-time host prerequisites are Linux, a usable systemd user manager, Git, `curl`, `tar`, `xz`, Bash/POSIX shell support, and ordinary core file utilities. The installer never invokes `sudo` or a distro package manager.

Advanced packaging overrides are `PONTIVUS_ORDER_INSTALL_ROOT` and `PONTIVUS_ORDER_BIN_DIR`; both must be absolute when supplied. `PONTIVUS_ORDER_STATE_ROOT` and loopback-only `PONTIVUS_ORDER_BIND` may be supplied to the installer and are then fixed into the installed launcher/service.

## Setup and run

The installer performs all mandatory first-run setup. When it reports success, the daemon is already supervised by the user-level `pontivus-order.service` and `order status` is healthy. There is no required post-install model export, provider-login command, or foreground daemon start.

During first setup, Order keeps provider credentials in its private OpenCode namespace, presents enabled exact `provider/model` choices, and asks for target repository roots. Target roots determine which local Git repositories may become WorkItems; they do not grant agents arbitrary sibling-repository reads. Optional STAGE reference roots are configured separately and are read-only/non-authoritative.

To deliberately change the selected model or filesystem roots later:

```bash
order setup --reconfigure
```

`order provider login <provider>` remains a maintenance/recovery command for Order's private OpenCode credential namespace.

Normal operation:

```bash
order status
order open
```

`order open` prints a one-time local connect URL. Open that URL to establish the HttpOnly browser session and use the local React workbench. The browser never owns lifecycle state and never receives the daemon Bearer token.

A target engineering repository must be a configured exact local Git repository with a resolvable `HEAD` and a valid root `pontivus-order.toml`. `pontivus-order.toml.example` shows the project-integration grammar.

In the workbench:

1. Create a work item with the absolute repository root, title, origin, and any project-defined concern IDs.
2. Progress the item through R1 → R2 → DESIGN → PLAN → R3. Review persisted dialogue/evidence and explicitly adopt or reject repository artifact proposals. An active STAGE Run remains continuable from the same inspector even when the last turn produced a proposal without a blocking question.
3. At `AWAITING_SIGNOFF`, review the exact package hash, baseline and signed tasks, enter the approving local identity, and sign off that exact package.
4. Execution runs from the signed baseline through BUILDER, verification, independent REVIEWER and bounded remediation where permitted. The daemon performs one coordinator tick on startup and then hourly; `order tick` invokes the same coordinator operation manually.
5. Inspect task state, V0–V7 events, evidence bytes and the final candidate patch in the workbench.

Order stops at a **verified candidate**. It does not commit, push, merge, deploy, or mutate production as part of v1.

## Operational commands

```text
order daemon
order setup
order setup --reconfigure
order open
order status
order tick
order provider login <provider>
```

`order daemon` is the foreground daemon entry point used by the installed user service and for explicit diagnostics; normal installed operation does not require the operator to keep a terminal open.

## Verification for repository development

The root manifest owns six logical gates:

- `dependency-lock`
- `typecheck`
- `architecture`
- `test`
- `build`
- `browser`

Their canonical commands are in `pontivus-order.toml`. Browser certification additionally requires the Playwright Chromium build owned by the external-facts snapshot:

```bash
node node_modules/@playwright/test/cli.js install chromium
```

Browser/e2e verification must use a dedicated absolute `PONTIVUS_ORDER_TEST_STATE_ROOT`. It must never point at the operator daemon state root.
