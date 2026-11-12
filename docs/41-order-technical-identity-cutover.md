# 41 — Order technical identity and origin-repository cutover

**Status:** Binding technical design  
**Canonical concern ID:** `GW-DOC-ORDER-TECHNICAL-IDENTITY`  
**Versioned concern ID:** `GW-DOC-ORDER-TECHNICAL-IDENTITY-V1`  
**Pyramid layer:** P4 technical architecture

## 1. Purpose

This document owns the technical realization of `GW-DOC-PRODUCT-IDENTITY-V1` for the live product/technical namespace and the bounded predecessor cutover from Gateweft to Order.

It does not change lifecycle, WorkItem, execution, validation, provider, persistence-schema meaning, or project-authority semantics.

Stable `GW-*` canonical authority identifiers are intentionally retained. They are machine identity/provenance and are not public product naming.

## 2. Sequencing invariant

The public repository represents the **completed post-cutover state**. The implementation packages that performed the UX/Astryx work and the final identity cutover remain private-origin provenance records and are not part of the public authority graph.

The cutover sequence was:

```text
1. complete and independently verify the UX/Astryx implementation package
2. sign and execute the Order identity-cutover package
3. prove the origin-repository Order candidate complete
4. publish the verified, public-safe Order source snapshot into the existing `pontivus-com/order` repository without importing the private origin history
5. run post-publication repository/install certification from the public repository
```

That sequencing remains a provenance invariant: the identity cutover was not merged into the UX/Astryx candidate, and publication occurred only after the origin-repository Order candidate was complete.

The identity-cutover task was the last productive task interpreted by the Gateweft-named runtime in the origin repository. Repository publication was an external administration/rollout action, not application implementation and not part of that ExecutionTask.

## 3. Live product and technical namespace after cutover

| Concern | Canonical live identity |
|---|---|
| Product name | `Order` |
| Endorsed/full name | `Pontivus Order` |
| Target public repository | `pontivus-com/order` |
| package name | `pontivus-order` |
| CLI executable | `order` |
| user service | `pontivus-order.service` |
| systemd description | `Pontivus Order local daemon` |
| install root | `$HOME/.local/share/pontivus-order` |
| state root | `$XDG_STATE_HOME/pontivus-order` or `$HOME/.local/state/pontivus-order` |
| default project WorkItem documentation root | `docs/order/work-items` (repository-relative) |
| project manifest | `pontivus-order.toml` |
| project-manifest example | `pontivus-order.toml.example` |
| executable task fence after cutover | `order-tasks` |
| database filename | `order.sqlite3` |
| browser theme key | `pontivus-order-theme` |
| browser session cookie | `pontivus_order_session` |
| environment prefix | `PONTIVUS_ORDER_*` |
| browser document title | `Order — Pontivus` |
| primary UI product label | `Order` |

Where the current equivalent exists, environment names become:

- `PONTIVUS_ORDER_INSTALL_ROOT`;
- `PONTIVUS_ORDER_BIN_DIR`;
- `PONTIVUS_ORDER_STATE_ROOT`;
- `PONTIVUS_ORDER_BIND`;
- `PONTIVUS_ORDER_OPENCODE_BIN`;
- `PONTIVUS_ORDER_TEST_STATE_ROOT`;
- `PONTIVUS_ORDER_OPENCODE_MODEL` for the retained test-only model override.

Generic `ORDER_*` environment variables are prohibited.

## 4. No dual live identity

After successful cutover there is one productive identity.

Do not retain a `gateweft` CLI alias, both project-manifest filenames, both environment-variable families, both productive task-fence grammars, two service units, two productive install/state roots, two config/domain types for the same state, or runtime fallback/probing of Gateweft paths.

The only legacy recognition is installer-owned one-way predecessor migration described in §6 and the pre-cutover plan-fence bootstrap in §5.

## 5. Self-hosted task-fence transition

Because the identity task is executed by the **pre-cutover Gateweft runtime**, its own signed PLAN remains encoded using the existing `gateweft-tasks` fence.

That is not a productive alias after cutover. It is the final predecessor contract consumed before the task changes the runtime.

Rules:

1. `docs/39` and the identity-cutover `docs/36` remain valid pre-cutover signed plans using `gateweft-tasks`.
2. The identity-cutover implementation changes the productive parser/authoring contract to `order-tasks`.
3. After successful cutover, newly authored productive plans use only `order-tasks`.
4. The Order runtime does not parse `gateweft-tasks` as a fallback merely because historical documents retain those blocks.
5. Historical/provenance documents keep their original bytes/terminology unless a status annotation is needed to avoid authority ambiguity.

## 6. Installer-owned one-way predecessor migration

The productive installer is the sole technical migration boundary.

It must:

1. stop/prove quiescence of the prior Gateweft service before moving productive state;
2. recognize only the immediately preceding supported Gateweft beta identity;
3. move the canonical previous default state/config/provider namespace only when the new Order destination is absent;
4. fail before mutation when old and new productive roots both exist;
5. require explicit new `PONTIVUS_ORDER_*` overrides for custom legacy locations rather than guessing;
6. preserve valid provider credentials/configuration without fabricating semantics;
7. rename/move database and sidecars only while the prior daemon is stopped;
8. install `order` and `pontivus-order.service`, start it and prove the normal health path;
9. remove old launcher/service/install artifacts only after the Order installation is healthy;
10. restore the prior supported state consistently with the existing installer rollback contract if activation fails.

Migration code is bounded predecessor support, not a permanent compatibility subsystem.

## 7. Target-project integration cutover

Order must not silently mutate governed target repositories.

After cutover, productive project loading accepts only `pontivus-order.toml`.

If a configured target has only `gateweft.toml`, setup/installer may detect that fact only to produce an actionable blocker. The target repository must rename/adopt its manifest under its own authority before Order may use it.

## 8. Internal symbol identity

Live implementation symbols named only for the old product should be mechanically renamed, including config, daemon, database, installer/setup and test-fixture symbols.

The rename must not introduce wrappers, compatibility exports, mapper layers, DTO copies or parallel config types.

Canonical semantic types whose identity is not product branding are unchanged.

## 9. Repository publication boundary

The origin-repository identity task does **not** publish private origin history.

The public target `pontivus-com/order` already exists and contains the public Order identity/migration baseline. A pre-cutover audit established that the private origin history contains internal implementation provenance and non-public author metadata. A direct repository transfer or history import is therefore prohibited.

After the private-origin candidate is complete:

- retain the private origin repository as the provenance archive;
- publish the verified current Order source as a new snapshot commit on top of the existing public `pontivus-com/order` history;
- do not import private origin commits, tags, branches, issues, actions logs or other origin-only GitHub metadata;
- exclude historical/private provenance records whose only purpose is to document private source repositories or origin-only implementation history;
- update repository-location-dependent bootstrap/metadata to `pontivus-com/order`;
- run the public leak scan and the complete installation/certification set from the public repository;
- do not rely on GitHub redirect behavior as correctness evidence.

The public snapshot must contain all current P1-P6 authority, productive source, tests and public-safe documentation required to build, operate and govern Order. Historical P7/R3 provenance may remain in the private origin archive when it is not required by the live public authority graph.

No additional product/lifecycle redesign occurs during repository publication.

## 10. Verification obligations

The identity candidate must prove before repository transfer:

- no live public product surface presents Gateweft as the current product name;
- stable `GW-*` authority identifiers remain unchanged and unique;
- productive technical names match §3 except repository-location values explicitly deferred to §9;
- runtime accepts only the Order productive namespace after cutover;
- bounded predecessor installer migration succeeds and rollback is deterministic;
- target repositories with only `gateweft.toml` are blocked rather than silently rewritten;
- new plan parsing/authoring uses only `order-tasks`;
- no Gateweft/Order duplicate semantic owner or DTO/config family exists;
- dependency-lock, typecheck, architecture, test, build and browser gates pass;
- the live-identity scan has no non-allowlisted old-product occurrences outside stable `GW-*` identifiers, historical provenance and bounded installer predecessor constants.

Post-publication certification additionally proves the final repository/bootstrap URL, public repository metadata, absence of private-origin history, and absence of non-allowlisted internal/private-origin material in the published tree.
