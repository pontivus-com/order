<!-- Order template: delivery-r3-v2; authority: GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-SPECIFICATION-STANDARD-V2, GW-FR-098-READINESS-AUTHORITY-TOPOLOGY-REVIEW -->

# Order 0.6.0 readiness review

## Readiness verdict

`RETURN_TO_R2`.

This is the current adversarial R3 disposition after the post-IA26 Workbench composition correction. The previous `READY_FOR_SIGNOFF` review bound a superseded P3/R2/P4/DESIGN/PLAN package and is no longer a current readiness verdict.

R3 does not repair the reopened package. Under `GW-DOC-LIFECYCLE-CONTEXT-V2` and `GW-FR-098-READINESS-AUTHORITY-TOPOLOGY-REVIEW`, it returns to the earliest owning lifecycle layer whose current conformance has not yet been re-established. That layer is R2/G3.

## Exact current package basis

The current corrected package is:

- R1 `research.md`: `e37ef7d7b54f6c344274d4dfb71a3992f92271a4`;
- canonical P3 Workbench: `d47173839201c68937bdb4c840d0273dec5bcffc`;
- R2 `requirements.md`: `e1e53c493f405610f6f73d3e8b83084b91e7db9e`;
- canonical P4 Workbench: `4c418550eeacaeae08c6bfedf4dd8a0c4f6e0e1d`;
- DESIGN `solution-design.md`: `3091a1dad33b11efb42eab587fc6aadd419d1b67`;
- PLAN `implementation-plan.md`: `f8161c5b85eaec74d00cdf54613ae6669805c5de`;
- reference-pack README: `6aff4233f4f0c9c2a09c6aa2504b7e2cef1708fb`.

The canonical current-state owners remain `0.6.0-design-campaign-plan.md §7/§18`; this R3 artifact does not project or maintain campaign gate state.

## Why the previous READY_FOR_SIGNOFF is stale

The superseded review bound:

- R2 `ff85e33876227ee76f37877252537ab958df4802`;
- DESIGN `7a434216611b87689af139c36e8e1a37f4b777ea`;
- PLAN `3cb3c6c2fe1e7762eee1a75640dd4851ffdf7b6c`;
- P3 Workbench `f38bd9ebf17e0726b51453a7e05dc52175b080fa`;
- P4 Workbench `bbc934cfd1cf987582f331e1b689b54002de174e`.

Subsequent IA26 human review proved blocking composition/acceptance defects and caused material P3/R2/P4/DESIGN/PLAN changes. Under the specification standard, those material changes invalidate the former readiness and Approval basis even though the WorkItem identity is unchanged.

The prior RZ5 rendered evidence and its `READY_FOR_SIGNOFF` conclusion therefore remain historical causal/provenance evidence only. They do not prove the corrected package and do not authorize continued IA29+ execution.

## Earliest defective/current owner

The earliest current lifecycle boundary requiring fresh conformance is **R2/G3**.

The corrected P3 Workbench now closes the interaction grammar that previously permitted generic workflow summary/material-selection composition. The amended R2 must therefore receive fresh R2-A01 through R2-A11 review against those exact current bytes before G3 may return PASS.

G4, G5 and G5A are transitively stale until the corrected package is revalidated in order:

1. fresh R2 pair audits A01-A11 and integrated functional closure -> G3;
2. fresh DESIGN pair audits A01-A11 against current P3/R2/P4 -> G4;
3. fresh PLAN pair audits A01-A11 against current R2/DESIGN/PLAN -> G5;
4. fresh ALIGN-A01-A11 plus ALIGN-H1 on the exact current package -> G5A.

## Foundation realization boundary after G5A

The campaign's bounded pre-sign-off realization exception remains separate from normal signed execution.

After exact G3-G5A PASS, and only under a fresh explicit bounded authorization bound to that exact package, IA27 and IA28 may produce the implementation/rendered evidence required for a meaningful R3:

- **IA27** destructively reconstructs the shared Workbench foundation and removes the now-invalid generic workflow composition responsibilities, including `WorkflowStepFrame`, `WorkflowStepSummary`, `WorkflowStepIndex`, generic `PrimaryMaterialFrame` composition and `WorkflowMaterialSelector`; closes design-bearing primitive APIs; introduces permanent consumer allowlists; and proves zero adapters, aliases, wrappers, hidden legacy DOM, dual paths, feature-flagged superseded topology or CSS shims.
- **IA28** consumes that foundation in the application shell, Queue and Create as the first real consumer acceptance. Any shared-foundation defect found here returns to IA27/DESIGN rather than being patched locally.

That bounded authorization stops before IA29. It is evidence-production authority only and is not G6, Approval or normal T1 continuation.

## Required next readiness path

After fresh IA27/IA28 evidence is complete, R3 is run again against the exact package and exact bounded foundation evidence.

Only a new current `READY_FOR_SIGNOFF` may advance G6. Normal human Approval must then bind that same exact package before IA29 or any later ordinary implementation wave begins.

## Historical evidence retained

The previous RZ5 package, PR Verification `45103316407` and artifact `14787230104` remain useful evidence of the superseded foundation and of the failure mode that motivated the current correction. They are not a preservation target and do not satisfy current G3-G6.

The later IA26 exact-candidate run `45154251119` / artifact `14809860075` remains failure evidence: capture generation succeeded, but human schema/information, UX/interaction and visual/UI acceptance exposed blocking defects and invalid comparison scopes.

## Final R3 disposition

**Verdict:** `RETURN_TO_R2`.

**Next permitted action:** complete fresh R2/G3 revalidation on the exact corrected package. No current R3 sign-off authority exists, and no bounded IA27/IA28 production realization may begin until G3-G5A are freshly PASS and a new exact-package bounded authorization is recorded.
