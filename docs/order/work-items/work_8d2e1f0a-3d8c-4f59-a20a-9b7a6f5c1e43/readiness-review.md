<!-- Order template: delivery-r3-v2; authority: GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-SPECIFICATION-STANDARD-V2, GW-FR-098-READINESS-AUTHORITY-TOPOLOGY-REVIEW -->

# External-facts lineage correction readiness review

## Readiness verdict

`READY_FOR_SIGNOFF`.

This verdict applies only to foundation WorkItem `work_8d2e1f0a-3d8c-4f59-a20a-9b7a6f5c1e43`. It is not Approval for the main 0.6.0 implementation package and does not restore campaign G0 by itself.

The substantive correction is pre-signoff authority/verification material. The later signed T1 has zero mutation scope and may succeed only through the canonical already-satisfied path.

## Exact reviewed package

- Work request: blob `daee1a3d3c5abd43f5196ee4d780dee37065d277`;
- R1: blob `73ed2c7e5a2eccc8d8265679ee4d0e68be74f935`;
- R2: blob `1fe70c9345cfed40323ca77897580602071f62d4`;
- DESIGN: blob `ec58db86a1d9140e76e23b1eefc91d6379dd965e`;
- PLAN: blob `0e68a4853267e41837dedd2c686ac67b35d84728`;
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
- the complete current permanent consumer set audited by the strengthened architecture fitness rule contains no 2026-11-12 version pin and uses stable `GW-DOC-EXTERNAL-FACTS`; the initially missed Workbench/theme references are corrected at blobs `36b5628f5d54d168aed25f0af71226114266068a` and `ec4c59408485d86e7c64802fed983e2072d063b9`;
- retained `technical-architecture.v1.md` remains blob `6e362164dcc6d61c7242cac430ae8d114f56016c`;
- retained `canonical-contracts.v1.md` remains blob `44db773f1e2b5417eba730c2a8c57ec44b11942f`;
- permanent fitness now recognizes `.vN-YYYY-MM-DD.md`, binds filename/version/date, checks dated version IDs against `Verified`, and preserves historical navigation references without weakening current-consumer stable-ID enforcement.

## Exact-head verification feedback

The first exact-head PR Verification #1426 / run `44479533124` passed release metadata, dependency-lock and typecheck, then failed the architecture gate because the newly strengthened current-consumer rule found three remaining dated pins: `workbench-theme.md` line 44 and `workbench.md` lines 865/1679. This was a valid detection by the new invariant, not a reason to weaken it.

Those three current references were rebound to stable `GW-DOC-EXTERNAL-FACTS`; R1, DESIGN and PLAN were then refreshed to include the complete consumer surface. Fresh exact-head PR Verification #1431 / run `44480111804` then passed release metadata, dependency-lock, typecheck, architecture, full test, build, release-packager and browser on correction candidate `24ac08bee5454fd50c6b7dc071bb9270c9f6ac45`.

## PLAN legality

PASS.

The post-signoff task has zero mutation scope. It cannot rewrite authority or verification material already bound by Approval. If the approved baseline does not already contain G-F11-R01/R02/R03, execution must return upstream rather than mutate around the failure.

## Minimum-change review

PASS.

No production code, dependency, package pin, runtime contract, persistence, transport, provider behavior, UI behavior or product requirement changed. The retained historical source is byte-identical. The broad documentation cleanup considered during audit was explicitly rejected and was not applied.

## Verification ownership

PASS on exact correction candidate `24ac08bee5454fd50c6b7dc071bb9270c9f6ac45` through PR Verification #1431 / run `44480111804`.

Passed gates:
- dependency-lock;
- typecheck;
- architecture;
- test;
- build;
- release-packager;
- browser.

The verified candidate contains this R3 record and the complete corrected authority/reference/sensor package. Later campaign-register evidence commits may descend from this candidate; they do not substitute another unverified correction baseline.

## Open decision/conflict ledger

| Item | State |
|---|---|
| unresolved factual question | NONE |
| unresolved product decision | NONE |
| unresolved authority conflict | NONE |
| unresolved architecture decision | NONE |
| unowned finding | NONE |
| mutation required after sign-off | NONE |
| campaign G0 restored | NOT OWNED HERE — correction candidate is fully verified; campaign §18 remains the sole current-state owner |

## Final R3 disposition

`READY_FOR_SIGNOFF`.

The G-F11 correction candidate is integrated by ancestry and fully verified. Campaign §18 may now close G-F11/G0 after rebinding its supporting coverage evidence; this readiness review does not itself project campaign state.
