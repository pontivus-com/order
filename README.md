<h1 align="center">
  <img src="assets/order-logo-plate-dark.svg" alt="Order — Ideas in. Results out." width="640">
</h1>

<p align="center">
  <strong>Ideas in. Results out.</strong>
</p>

<p align="center">
  From idea to verified result.
</p>

<p align="center">
  Order is an open-source software factory that carries software work from idea to verified result.
</p>

<p align="center">
  <a href="https://github.com/pontivus-com/order/actions/workflows/ci.yml"><img src="https://github.com/pontivus-com/order/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://github.com/pontivus-com/order/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-blue?style=flat-square" alt="Apache-2.0"></a>
  <img src="https://img.shields.io/badge/platform-Linux%20verified-lightgrey?style=flat-square" alt="Linux verified">
  <img src="https://img.shields.io/badge/status-pre--release-orange?style=flat-square" alt="Pre-release">
</p>

<p align="center">
  <a href="#quick-start"><strong>Quick start</strong></a> ·
  <a href="#how-it-works"><strong>How it works</strong></a> ·
  <a href="https://github.com/pontivus-com/order/tree/master/docs"><strong>Docs</strong></a>
</p>

## Turn software work into verified results

Start with something that needs to happen: a feature, defect, change, investigation, audit, documentation update, infrastructure change, UI change, or other repository-governed work.

Order carries that work through the production process. It establishes what is actually true, defines the required outcome, resolves the solution and implementation plan, checks readiness, requires explicit sign-off before productive implementation, runs coding agents against the authorized work, tests and independently reviews the result, performs bounded remediation where appropriate, and produces a verified candidate.

The user manages **what work should happen**. Order manages **how that work is carried through**.

Coding agents operate inside the factory. They do not get to silently redefine the assignment, broaden their own execution scope, or certify their own work as complete.

Some work correctly ends without implementation. An investigation can conclude that no change is required; an idea can be disproven, duplicate, or already satisfied. Order does not manufacture code merely because work entered the system.

## How it works

1. **Start with the work.** Create a WorkItem for the feature, defect, change, investigation, audit, or other governed repository work.
2. **Bring the idea into focus.** Order works through current-state research, requirements, design, planning, and independent readiness review as applicable.
3. **Authorize the exact package.** Productive implementation begins only after explicit sign-off on the resolved package, baseline, tasks, scope, and validation contract.
4. **Run the factory.** Coding agents execute the authorized work. Order owns durable state, dependencies, verification, independent review, and bounded remediation.
5. **Get the result.** Successful implementation terminates as a **verified candidate** with the evidence needed to inspect what was done and why it qualifies.

The agent does the work. It does not redefine the work, and it does not certify its own result.

## Quick start

Order is currently in public pre-release development. Until the first certified release is published, cloning `master` is a contributor/development path:

```bash
git clone https://github.com/pontivus-com/order.git
cd order
./install.sh
```

After setup:

```bash
order status
order open
```

`order open` prints a one-time local connect URL for the local workbench.

## Install

Order is currently in public pre-release development. No certified GitHub Release has been published yet. The supported public installation remains a **one command** flow once the first certified release is available.

The supported public installation channel is being established by the `0.2.0` implementation/release package governed by [the public repository delivery standard](docs/44-public-repository-delivery-and-release.md). Once `0.2.0` is published, normal installation/update will consume the certified GitHub Release asset rather than arbitrary `master`.

Cloning `master` is therefore a **contributor/development path**, not an immutable public release installation.

`install.sh` is only the minimal bootstrap; it verifies the checkout/runtime prerequisites and transfers control to the purpose-built `src/installer.ts` installer.

For repository development, the current bootstrap remains:

```bash
git clone https://github.com/pontivus-com/order.git
cd order
./install.sh
```

The purpose-built installer installs and verifies the exact pinned Bun, Node and OpenCode runtimes under `~/.local/share/pontivus-order`, installs the committed dependency graph, builds production `dist/`, installs `~/.local/bin/order`, guides private OpenCode authentication/model selection when required, persists target-repository/reference configuration, installs/enables the user-level `pontivus-order.service`, and refuses success until `order status` is healthy.

Install-time host prerequisites are Linux, a usable systemd user manager, Git, `curl`, `tar`, `xz`, Bash/POSIX shell support, and ordinary core file utilities. The installer never invokes `sudo` or a distro package manager.

For the immediately preceding supported Gateweft beta only, the installer retains the bounded one-way predecessor migration owned by the canonical technical contracts; it does not create a second productive identity or source model.

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
order --version
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

## Contributing and releases

All public changes are delivered through pull requests. See [CONTRIBUTING.md](CONTRIBUTING.md) and [the canonical public repository delivery and release standard](docs/44-public-repository-delivery-and-release.md).

`CHANGELOG.md` records unreleased and published changes. Version bumps, tags, GitHub Releases and release assets follow the canonical release process; direct-to-`master` delivery is not supported.
