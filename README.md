<h1 align="center">
  <img src="assets/order-logo-plate-dark.svg" alt="Order" width="360">
</h1>

<p align="center">
  <strong>Ideas in. Results out.</strong>
</p>

<p align="center">
  From idea to verified result. Order carries software work through definition,
  implementation, testing, review, remediation, and independent verification.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/software-factory-111A29?style=flat-square" alt="Software factory">
  <a href="https://github.com/pontivus-com/order/actions/workflows/ci.yml"><img src="https://github.com/pontivus-com/order/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://github.com/pontivus-com/order/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-blue?style=flat-square" alt="Apache-2.0"></a>
  <img src="https://img.shields.io/badge/Bun-1.4.4-blue?style=flat-square" alt="Bun 1.4.4">
  <img src="https://img.shields.io/badge/platform-Linux%20verified-lightgrey?style=flat-square" alt="Linux verified">
  <img src="https://img.shields.io/badge/status-pre--release-orange?style=flat-square" alt="Pre-release">
  <a href="https://github.com/pontivus-com/order/stargazers"><img src="https://img.shields.io/github/stars/pontivus-com/order?style=flat-square" alt="GitHub stars"></a>
</p>

<p align="center">
  <a href="#quick-start"><strong>Quick start</strong></a> ·
  <a href="#how-it-works"><strong>How it works</strong></a> ·
  <a href="https://github.com/pontivus-com/order/tree/master/docs"><strong>Docs</strong></a>
</p>

## Turn ideas into verified results

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

## See the factory

The lifecycle is intentionally more rigorous before implementation than during execution.

```text
IDEA
  |
  v
R1 RESEARCH
  |
  v
R2 REQUIREMENTS
  |
  v
DESIGN
  |
  v
PLAN
  |
  v
R3 READINESS REVIEW
  |
  v
AWAITING SIGN-OFF
  |
  | explicit authorization
  v
=============================
 EXECUTION AUTHORITY BOUNDARY
=============================
  |
  v
TODO
  |
  v
IMPLEMENT
  |
  v
MECHANICAL VERIFY
  |
  v
INDEPENDENT REVIEW
  |
  v
BOUNDED REMEDIATION
  |
  v
MECHANICAL VERIFY
  |
  v
VERIFIED CANDIDATE
```

Not every WorkItem traverses the entire implementation path. Investigations, audits, disproven work, duplicates, already-satisfied work, and blocked work can terminate earlier without manufacturing implementation.

See the [work lifecycle](docs/01-work-lifecycle.md) and [validation standard](docs/06-validation-standard.md) for the canonical transition and evidence rules.

## Know what the result means

A successful run is not “the agent produced a patch.”

A verified candidate means the exact authorized task was still valid against the current repository, implementation stayed inside its authorized boundary, prescribed deterministic verification passed, and independent semantic review accepted the result.

| Outcome | Meaning |
| --- | --- |
| **Verified candidate** | Authorized work was implemented and independently verified. |
| **Already satisfied / duplicate / disproven** | The work did not justify new implementation. |
| **Investigation / audit complete** | The requested analysis completed without manufacturing remediation work. |
| **Blocked / returned upstream** | A material requirement, design, authority, readiness, or validation issue must be resolved at its owning stage. |

Order stops at the verified candidate boundary. It does not commit, push, merge, deploy, or mutate production as part of v1.

## Quick start

The repository is currently versioned at `0.2.0`, but there is no published GitHub Release yet. Until a certified release is published, cloning `master` is the contributor/development installation path rather than an immutable public release channel.

```bash
git clone https://github.com/pontivus-com/order.git
cd order
./install.sh
```

The guided installer provisions the pinned runtime, Order's private OpenCode environment, target repository configuration, the local daemon, and the user-level service. It refuses success until `order status` is healthy.

Then:

```bash
order status
order open
```

`order open` prints a one-time local connect URL for the browser workbench.

To deliberately change the selected model or filesystem roots later:

```bash
order setup --reconfigure
```

`install.sh` is the minimal bootstrap. It transfers installation work to the purpose-built installer in `src/installer.ts`, which installs Order under `~/.local/share/pontivus-order` and exposes the launcher at `~/.local/bin/order`. The default state root may be overridden with `PONTIVUS_ORDER_STATE_ROOT`.

Useful operator commands include:

```bash
order daemon
order tick
order provider login <provider>
```

The guided installation manages the user-level `pontivus-order.service`; `order status` remains the supported health check.

Once a certified GitHub Release is published, normal installation and update will consume the Order-owned release bundle rather than arbitrary `master`. See the [public repository delivery and release standard](docs/44-public-repository-delivery-and-release.md).

## Work from one place

The local browser workbench is the operating surface for the factory.

It provides one place to inspect and manage:

- proposed and active WorkItems;
- source and lifecycle documents;
- current stage and blockers;
- evidence and authority;
- readiness and sign-off;
- execution tasks and Runs;
- verification and review state;
- remediation;
- the final candidate patch and evidence.

The browser does not become a second source of workflow truth. Durable state remains daemon-owned, while project repositories retain authority for their own product intent, requirements, architecture, contracts, ADRs, tests, plans, and domain semantics.

See the [workbench UX](docs/37-workbench-ux-information-architecture.md), [technical architecture](docs/12-technical-architecture.md), and [project governance integration](docs/09-project-governance-integration.md).

## Fits around your repositories and agents

Order is project-neutral. A target repository remains the engineering authority.

Order references and verifies that project's own governing artifacts rather than replacing them. Coding agents run inside the work Order has authorized; discoveries outside the active task become new ideas rather than silently expanding the current assignment.

Order currently uses OpenCode as the execution provider, but provider sessions do not own Order lifecycle state, approval state, or completion semantics.

The intended benefit is a software-production system that can carry recurring engineering work without requiring the user to manually shepherd every agent turn, retry, review, and verification step. Quantified productivity, time-saving, defect-reduction, or supervision-reduction claims are not yet established.

## Status and documentation

This checkout is version `0.2.0`. No GitHub Release has been published yet.

The canonical design set begins at [docs/README.md](docs/README.md).

- [Product identity](docs/40-order-product-identity.md)
- [System brief](docs/00-system-brief.md)
- [Work lifecycle](docs/01-work-lifecycle.md)
- [Validation standard](docs/06-validation-standard.md)
- [Minimum-change standard](docs/08-minimum-change-standard.md)
- [Project governance integration](docs/09-project-governance-integration.md)
- [Technical architecture](docs/12-technical-architecture.md)
- [Canonical contracts](docs/13-canonical-contracts.md)
- [WorkItem document system](docs/31-work-item-document-system.md)
- [Workbench UX](docs/37-workbench-ux-information-architecture.md)
- [Public repository delivery and release](docs/44-public-repository-delivery-and-release.md)
- [Changelog](CHANGELOG.md)

## Repository development

The root project manifest owns the canonical verification gates:

- `dependency-lock`
- `typecheck`
- `architecture`
- `test`
- `build`
- `browser`

The exact commands are defined in `pontivus-order.toml`.

Browser/e2e certification requires the Playwright-owned Chromium build and a dedicated absolute `PONTIVUS_ORDER_TEST_STATE_ROOT`; development verification must never point browser tests at the operator daemon state root.

## Contributing

See [contributing](CONTRIBUTING.md). All public repository changes are delivered through pull requests to `master`, with the required changelog and release-impact metadata.

Preserve the central contract: the work must be resolved before productive execution, implementation must stay inside the authorized task, and completion must be established by independent verification rather than builder self-attestation.

## License

Order is licensed under **Apache License 2.0** (`Apache-2.0`). See [LICENSE](LICENSE).
