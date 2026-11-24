<!-- Order template: delivery-r3-v2; authority: GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-SPECIFICATION-STANDARD-V2, GW-FR-098-READINESS-AUTHORITY-TOPOLOGY-REVIEW -->

# Order 0.6.0 readiness review

## Readiness verdict

`RETURN_TO_DESIGN` — **historical return disposition; not a current G6 pass**.

The previous `READY_FOR_SIGNOFF` review is superseded. It bound a package that was later invalidated by IA26 human rendered review. During the corrected bounded foundation work, a further stale P4 §8.17 permission was found: Readiness still appeared to admit an optional primitive Selector even though the governing direct-Review contract forbids a generic Readiness material selector. That finding returned ownership to DESIGN.

The P4 cell has since been corrected and G4, G5 and G5A have been freshly revalidated. This file does **not** convert that revalidation into a new R3 verdict. The next fresh R3 is intentionally deferred until the active bounded IA27 → IA28 realization/evidence tranche completes.

## Exact current package basis

The current corrected package is:

- R1 `research.md`: `e37ef7d7b54f6c344274d4dfb71a3992f92271a4`;
- canonical P3 Workbench: `d47173839201c68937bdb4c840d0273dec5bcffc`;
- R2 `requirements.md`: `e1e53c493f405610f6f73d3e8b83084b91e7db9e`;
- canonical P4 Workbench: `372c7a3380dc200d5ec0b425f2d6cac781f2e6bc`;
- DESIGN `solution-design.md`: `a6dc89a0ce2fcdcb986d6c3fdb3414766562c95f`;
- PLAN `implementation-plan.md`: `9009f2f9c3f938d34f3263dbfa1ed88fbe2973c2`;
- reference-pack README: `6aff4233f4f0c9c2a09c6aa2504b7e2cef1708fb`.

The sole current campaign/gate authority remains `0.6.0-design-campaign-plan.md §7/§18`. Current campaign state is not projected from this R3 artifact.

## Superseded readiness evidence

The old `READY_FOR_SIGNOFF` review bound superseded R2/DESIGN/PLAN/P3/P4 identities and the pre-correction RZ5 foundation evidence. Those records remain causal/provenance evidence only.

The later IA26 exact-candidate run `45154251119` / artifact `14809860075` likewise remains failure evidence: capture generation succeeded, but human schema/information, UX/interaction and visual/UI review exposed blocking composition defects and invalid comparison scopes.

## Corrected design consequence

The current authority package now requires:

- `WorkflowStepFrame`, `WorkflowStepSummary`, `WorkflowStepIndex`, generic `PrimaryMaterialFrame` and `WorkflowMaterialSelector` responsibilities to be absent;
- `WorkbenchSurface` to own one primary material plus optional genuine attention only;
- `WorkbenchAttention` to express a real current human-action cause, optional explanation/feedback and at most one action, with no generic status tuple;
- `WorkbenchReview` to own currentness + summary + body + decisions only, with no selector slot;
- Readiness and Approval to compose directly as Review, with Readiness REQUIRED_INPUT replacing Review with Dialogue for that turn;
- subordinate history/support access to use the owning interaction's ResourceRow/Action/Timeline semantics rather than a generic workflow selector;
- closed primitive APIs and explicit consumer allowlists, with no alias, compatibility wrapper, prop translator, hidden legacy DOM, dual path, feature flag or CSS shim.

## Current bounded realization boundary

Campaign §17A currently owns authorization `IA28-RZ11`.

That grant permits only:

1. **IA27** — complete the authority-first foundation cutover, required-absence proof, exact consumer migration and permanent primitive consumer allowlists;
2. **IA28** — exercise the corrected foundation through application shell, Queue and Create as the first real consumers and produce bounded rendered evidence.

The grant stops before IA29. Any IA28-discovered shared-foundation defect returns to IA27/DESIGN rather than being patched locally.

## Required next readiness path

After IA27/IA28 evidence is complete:

1. terminate RZ11;
2. run a fresh adversarial R3 against the exact current authority package and exact bounded foundation evidence;
3. only a new `READY_FOR_SIGNOFF` may advance G6;
4. normal human Approval must bind that same exact package;
5. only then may IA29+ ordinary implementation resume.

## Final disposition

**Recorded return:** `RETURN_TO_DESIGN` for the now-corrected P4 consumer-permission defect.

**Current next permitted action:** continue the active bounded `IA28-RZ11` IA27 → IA28 realization/evidence sequence. No current `READY_FOR_SIGNOFF` or Approval authority exists, and IA29+ remains forbidden until fresh R3/G6 and human Approval.
