# Order

**Pontivus Order**

**Governed software delivery for coding agents.**

> **Give agents the work. Keep authority over what counts as done.**

Order turns engineering intent into explicitly approved work, runs coding agents within that authority, and independently verifies the resulting change. The canonical design set starts at `docs/README.md`.

## Install

Order `0.2.0` is the first certified public release. Normal installation and update consume the Order-owned GitHub Release bundle rather than arbitrary `master`.

Latest certified release (**one command**):

```bash
tmp="$(mktemp -d)" && cd "$tmp" && \
curl -fsSLO https://github.com/pontivus-com/order/releases/latest/download/pontivus-order.tar.gz && \
curl -fsSLO https://github.com/pontivus-com/order/releases/latest/download/pontivus-order.tar.gz.sha256 && \
sha256sum -c pontivus-order.tar.gz.sha256 && \
tar -xzf pontivus-order.tar.gz && \
./order/install.sh
```

Version-pinned `0.2.0` installation uses the same flow with `/releases/download/v0.2.0/` in place of `/releases/latest/download/`.

The supported installation channel and release assets are governed by [the public repository delivery standard](docs/44-public-repository-delivery-and-release.md). Cloning `master` is a **contributor/development path**, not an immutable public release installation.

`install.sh` is only the minimal bootstrap; it verifies the checkout or certified release-bundle provenance/runtime prerequisites and transfers control to the purpose-built `src/installer.ts` installer.

For repository development, the bootstrap remains:

```bash
git clone https://github.com/pontivus-com/order.git
cd order
./install.sh
```

The purpose-built installer installs and verifies the exact pinned Bun, Node and OpenCode runtimes under `~/.local/share/pontivus-order`, installs the committed dependency graph, preserves the certified production `dist/` from a release bundle (or builds it for a development checkout), installs `~/.local/bin/order`, guides private OpenCode authentication/model selection when required, persists target-repository/reference configuration, installs/enables the user-level `pontivus-order.service`, and refuses success until `order status` is healthy.

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
