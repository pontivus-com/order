<!-- Order template: delivery-r3-v2; authority: GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-SPECIFICATION-STANDARD-V2, GW-FR-098-READINESS-AUTHORITY-TOPOLOGY-REVIEW -->

# External-facts lineage correction readiness review

## Readiness verdict

`READY_FOR_SIGNOFF`.

This verdict applies only to foundation WorkItem `work_8d2e1f0a-3d8c-4f59-a20a-9b7a6f5c1e43`. It is not Approval for the main 0.6.0 implementation package and does not restore campaign G0 by itself.

The substantive correction is pre-signoff authority/verification material. The later signed T1 has zero mutation scope and may succeed only through the canonical already-satisfied path.

## Exact reviewed package

- Work request: blob `daee1a3d3c5abd43f5196ee4d780dee37065d277`;
- R1: blob `3d7ae664c75c57905c497742f1c6949d1297e9ac`;
- R2: blob `1fe70c9345cfed40323ca77897580602071f62d4`;
- DESIGN: blob `9c9d2b28426b2756f3156e4dddf6444149116d57`;
- PLAN: blob `baef70d1038977f4bac5395cd5975b6698a56e63`;
- exact retained 2026-11-12 external-facts source: `docs/references/external-facts.v1-2026-11-12.md`, blob `da866ffe75c54e16d9a98b64db880fd64a7b07d6`;
- live external-facts owner: blob `ac97d3897edc0845e968df967283321f08ce442d`;
- authority/ref registry: `pontivus-order.toml`, blob `8250e5f79d06862bdb92ffcd2fd98e3da9f44237`;
- permanent documentation fitness: `tests/architecture.test.ts`, blob `3868eef72dfc998f17b9f059cff7dcfbda940c42`;
- campaign control after G-F11 reopening: blob `c2097bc6ff4b6d2dbede23e9a49402fa8a1c6969`;
- delivery record: `CHANGELOG.md`, blob `b38ff91ad888ec99b7f0ca10d78af2752ab31781`.

## R1 challenge

PASS.

The failure mechanism is directly evidenced by repository history and exact source bytes. The recovered 2026-11-12 source blob is not reconstructed or inferred. Commit comparison proves `60e250ea1b41b92457df6ec427a421573e4f0c95` is one commit after `f5be1ee9e4f2a003d030a0f019b90acaf41e6a33` and changes the external-facts source for the 2026-11-13 refresh.

## R2 challenge

PASS.

No product behavior is introduced. G-F11-R01/R02/R03 are local documentation-foundation/conformance consequences of existing P1 canonicality rules.

The package does not redefine dependency pins, vendor behavior, runtime contracts or product semantics.

## DESIGN challenge

PASS.

The design uses the existing owners only:

- the external-facts concern remains owned by `GW-DOC-EXTERNAL-FACTS`;
- exact historical bytes are retained as the historical version source;
- `pontivus-order.toml` remains the only ref resolver;
- `tests/architecture.test.ts` remains the existing permanent documentation-fitness owner.

No parallel provenance registry, checker, snapshot format or semantic owner is introduced.

## Exact correction verification

PASS by direct repository inspection:

- retained historical blob equals the recovered pre-refresh blob exactly: `da866ffe75c54e16d9a98b64db880fd64a7b07d6`;
- live owner declares `GW-DOC-EXTERNAL-FACTS-V1-2026-11-16` and `Verified: 2026-11-16`;
- manifest resolves stable `GW-DOC-EXTERNAL-FACTS` and current dated identity to the live owner and resolves `GW-DOC-EXTERNAL-FACTS-V1-2026-11-12` to the retained source;
- current permanent consumers audited in R1 contain no 2026-11-12 version pin and use stable `GW-DOC-EXTERNAL-FACTS`;
- retained `technical-architecture.v1.md` remains blob `6e362164dcc6d61c7242cac430ae8d114f56016c`;
- retained `canonical-contracts.v1.md` remains blob `44db773f1e2b5417eba730c2a8c57ec44b11942f`;
- permanent fitness now recognizes `.vN-YYYY-MM-DD.md`, binds filename/version/date, checks dated version IDs against `Verified`, and preserves historical navigation references without weakening current-consumer stable-ID enforcement.

## PLAN legality

PASS.

The post-signoff task has zero mutation scope. It cannot rewrite authority or verification material already bound by Approval. If the approved baseline does not already contain G-F11-R01/R02/R03, execution must return upstream rather than mutate around the failure.

## Minimum-change review

PASS.

No production code, dependency, package pin, runtime contract, persistence, transport, provider behavior, UI behavior or product requirement changed. The retained historical source is byte-identical. The broad documentation cleanup considered during audit was explicitly rejected and was not applied.

## Verification ownership

The complete repository gate still must pass on an exact candidate containing this R3 record before campaign G0 can be restored. A green earlier head is not reused as final evidence.

Required gates:
- dependency-lock;
- typecheck;
- architecture;
- test;
- build;
- browser.

## Open decision/conflict ledger

| Item | State |
|---|---|
| unresolved factual question | NONE |
| unresolved product decision | NONE |
| unresolved authority conflict | NONE |
| unresolved architecture decision | NONE |
| unowned finding | NONE |
| mutation required after sign-off | NONE |
| campaign G0 restored | NO — exact corrected candidate verification remains required |

## Final R3 disposition

`READY_FOR_SIGNOFF`.

Campaign G0 remains blocked until the exact corrected candidate is integrated by ancestry and the required foundation verification is green.
