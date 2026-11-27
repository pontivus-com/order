<!-- Order template: delivery-r3-v2; authority: GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-SPECIFICATION-STANDARD-V2, GW-FR-098-READINESS-AUTHORITY-TOPOLOGY-REVIEW -->

# Order 0.6.0 readiness review

## Prior review invalidated by upstream return

The previous exact R3 blob `719a542e5364e4f552b680d48bebe589b40916ca` and its sign-off provenance remain historical at the original authorized baseline `79f9d77da12b899a64e2713631e4d98eafaaea00`. REV-F10 discovered that two required IA25 proof owners were outside signed T1. The former READY_FOR_SIGNOFF verdict does not apply to the corrected package. This record is a pending review boundary, not a fresh R3 verdict or native Run.

## Exact correction candidate awaiting review

**R1 blob:** `4d74d42bc817db51d06648174698b07175be193b`
**R2 blob:** `75e2108d786a2b9657c8d738d22de3e31643247c`
**DESIGN blob:** `92fffd59364e825f72b6b41c59b6a4479fd85a8c`
**PLAN blob:** `e51a5cc1fd0f180ab15e5f36f903ed4f956e8c74`
**P3 Workbench blob:** `64184232833b59a9e6db5e1a28b841f48b3217cd`
**P4 Workbench blob:** `8fccbe031436a9eb54da8ae493b614e94cc957b1`
**P4 Workbench Theme blob:** `03dfc6be3600a1128b5639d011f4c0159d3497dd`

Protected pre-signoff sensor `a38197bec3f1f1e84ff4bc0036abe322e4c5e1e1`; exact candidate input digest `62bbac6f6c65832d43a1997398aa0cc8fe5251a5`. One T1, 47 exact scope/changeSurface paths, same 68 exclusions. The correction adds only tests/shell.test.ts and tests/order-migration.test.ts. All IA25 INST-01–12 propositions, six gates, 37 SURF, 46 scenarios and final V0–V7 remain binding.

## Required fresh review

After the affected DESIGN/PLAN pair and horizontal revalidation and G5A ALIGN closure, perform a separate read-only R3 evaluation under GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1, GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-SPECIFICATION-STANDARD-V2 and GW-FR-098-READINESS-AUTHORITY-TOPOLOGY-REVIEW. Challenge exact scope, fixture ownership, original authority and evidence reuse, prior implementation delta, exact new baseline and both authorization paths. Do not infer acceptance from the existence of current source or passing structural checks. Do not authorize implementation from this pending review record. The campaign §18 register is the sole current gate-state owner.

## Readiness verdict

Pending fresh independent R3 after upstream revalidation. No current readiness verdict or operator authorization.
