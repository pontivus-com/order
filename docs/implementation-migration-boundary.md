# Order implementation migration boundary

**Status:** Pre-implementation migration boundary.  
**Source implementation:** existing Gateweft codebase, to be migrated in a later governed repository transition.  
**Target repository:** `pontivus-com/order`  
**Purpose:** establish what the later implementation transfer must preserve and what identity must change, without copying code or redefining runtime semantics now.

## 1. Current repository state

This repository currently owns the Order product identity and migration target only.

It does **not** yet contain:

- the productive runtime;
- the local daemon or workbench implementation;
- the project manifest contract;
- the execution-task parser;
- installer/runtime state;
- canonical lifecycle/architecture/contracts migrated from the source implementation.

No installation or execution claim should be made from this repository until those assets are deliberately migrated and verified.

## 2. Migration principle

The later migration is an **identity and repository transition**, not an opportunity to redesign the product.

The source implementation's governed software-work semantics are expected to remain intact unless the governing source authority is deliberately changed before or during the migration.

In particular, the migration should preserve the existing concepts of:

- explicit work progression before implementation;
- distinct research, requirements, design, planning, and readiness stages;
- explicit execution sign-off;
- bounded implementation scope;
- external verification;
- independent review;
- bounded remediation;
- durable execution state;
- verified-candidate completion;
- project-owned product, architecture, contract, test, merge, deployment, and production authority.

## 3. Stable authority identity

The source implementation uses stable `GW-*` concern identifiers.

Those identifiers must **not** be mechanically renamed solely because the public product changes from Gateweft to Order.

A stable identifier identifies a governed concern, not a marketing label. If the underlying concern is unchanged, the identifier should remain stable through migration unless its owning governance contract explicitly decides otherwise.

Do not introduce a parallel `ORDER-*`, `ORD-*`, or similar alias namespace merely to make the naming look cleaner.

Historical Gateweft-era implementation plans, review records, and other provenance should also retain the terminology that was true when they were authored.

## 4. Target live technical identity

When the productive implementation is migrated, the live Order namespace should converge on:

| Concern | Target |
|---|---|
| Repository | `pontivus-com/order` |
| Package identity | `pontivus-order` |
| CLI | `order` |
| User service | `pontivus-order.service` |
| Install root | `$HOME/.local/share/pontivus-order` |
| State root | `$XDG_STATE_HOME/pontivus-order` or `$HOME/.local/state/pontivus-order` |
| Default WorkItem root | `$HOME/.local/share/pontivus-order-work-items` |
| Project manifest | `pontivus-order.toml` |
| Manifest example | `pontivus-order.toml.example` |
| Executable task fence | `order-tasks` |
| Database filename | `order.sqlite3` |
| Browser theme key | `pontivus-order-theme` |
| Environment prefix | `PONTIVUS_ORDER_*` |
| Browser title | `Order — Pontivus` |
| Primary UI label | `Order` |

The short human-facing name remains **Order**. Machine-level environment variables use the full Pontivus namespace to avoid collisions with the ordinary English word “order”.

## 5. No dual productive identity

The migrated runtime should have one current identity.

Do not retain permanent live compatibility such as:

- a `gateweft` CLI alias;
- both old and new project-manifest filenames;
- both `GATEWEFT_*` and `PONTIVUS_ORDER_*` runtime configuration;
- both old and new task-fence grammars;
- two productive services;
- two productive state roots;
- duplicate old/new config carriers;
- runtime fallback from Order names to Gateweft names.

If an installed beta needs migration support, that support belongs at the installer/update boundary and should be one-way into the current Order contract rather than a permanent dual runtime.

## 6. Internal implementation names

Product-named implementation symbols should be renamed when the code migrates if they identify the live product rather than historical migration input.

Examples include config schema/type names, daemon start functions, database open functions, installer/setup symbols, user-facing messages, and test-fixture names.

The rename must remain semantic-preserving. Do not create wrapper exports, DTOs, mappers, adapters, or parallel old/new representations simply to preserve obsolete internal names.

## 7. Migration sequence

The later implementation transition should proceed in this order:

1. Read and establish the exact source-repository authority and current implementation baseline.
2. Reconcile any active source-repository work so the migration does not cut across a partially authorized execution package.
3. Adopt the Order identity into the source canonical product/architecture/contracts where those documents own live names.
4. Produce one cumulative implementation plan for the repository move and live namespace cutover.
5. Move/copy the governed source tree into this repository while preserving source history/provenance as deliberately chosen.
6. Perform the live Gateweft → Order technical identity cutover in the migrated implementation.
7. Verify clean install, supported update migration if still required, runtime behavior, architecture gates, tests, build, browser behavior, and absence of non-historical live Gateweft identity.
8. Only then publish installation instructions and treat this repository as the productive Order source.

The migration should not be split into separately releasable states that leave, for example, an Order UI on top of a Gateweft runtime contract.

## 8. External product surfaces

After implementation migration is complete, Pontivus public/marketing surfaces should derive their wording from [the canonical product identity](product-identity.md).

The acquisition or commercial motion is a separate decision. This repository establishes the product identity; it does not infer pricing, packaging, buyer segment, or go-to-market claims that have not yet been decided.
