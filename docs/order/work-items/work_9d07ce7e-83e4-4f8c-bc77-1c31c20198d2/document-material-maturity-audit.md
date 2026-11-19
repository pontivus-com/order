# Phase 1 document/material maturity audit

**Status:** P1-T08 complete  
**WorkItem:** `work_9d07ce7e-83e4-4f8c-bc77-1c31c20198d2`  
**Branch:** `version/0.5.0`  
**Consumes:** `application-interaction-map.md`, `workflow-state-audit.md`  
**Governing authority:** `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1`, `GW-DOC-LIFECYCLE-CONTEXT-V1`, `GW-DOC-MARKDOWN-WORKBENCH-V1`, `GW-DOC-WORK-LIFECYCLE-V1`

## 1. Purpose and overall verdict

This audit separates **material condition** from **WorkItem lifecycle position**.

Current Order already has enough canonical facts to derive the important material conditions without creating another persisted document-state machine:

- deterministic repository file existence and bytes;
- WorkItem source snapshot/hash;
- ArtifactRef snapshot identity;
- STAGE Run history;
- proposal/adoption RunEvents;
- CONFORMANCE_PASSED with contextHash and output ArtifactRefs;
- current upstream context resolution;
- Git commit/baseline identity;
- Approval closure and freshness;
- execution task/sign-off facts.

The principal problem is not missing persistence. It is that the product does not yet expose these derived conditions coherently, and one implementation path fails to surface rediscovered repository drafts at all.

## 2. Material condition vocabulary derived from existing facts

The following are **derived analytical conditions**, not proposed new persisted states.

| MAT | Condition | Derivation from existing canonical facts |
|---|---|---|
| MAT-001 ABSENT | deterministic repository path does not contain valid material | filesystem/source boundary |
| MAT-002 REPOSITORY_DRAFT | deterministic lifecycle Markdown exists/current bytes can be materialized as ArtifactRef, but no matching current conformance proves it as stage authority | repository bytes + ArtifactRef, no matching CONFORMANCE_PASSED |
| MAT-003 PROPOSAL_PENDING | current STAGE Run owns unresolved ARTIFACT_PROPOSAL_CREATED | RunEvents / ProposalDecision |
| MAT-004 ADOPTION_IN_PROGRESS | durable adoption request exists without disposition | RunEvents / ProposalDecision |
| MAT-005 CURRENT_UNCONFORMED | current canonical bytes exist for owning role, but latest matching conformance is absent/stale | current ArtifactRef bytes + conformance resolution |
| MAT-006 CURRENT_CONFORMED | CONFORMANCE_PASSED contextHash matches current resolved context and output ArtifactRef bytes/role match | `resolveStageConformanceState` |
| MAT-007 STALE | previously conformed/signed material no longer matches current source/upstream/current bytes | conformance resolution / approval freshness |
| MAT-008 HISTORICAL | immutable prior ArtifactRef/Run/Approval evidence exists but is no longer current material | historical persisted facts vs current snapshot |
| MAT-009 COMMITTED_SIGNOFF_CLOSURE | exact current source + conformed R3 dependency closure are committed at one baseline and rematerialized into sign-off package | `computeSignoffPackage` |
| MAT-010 SIGNED_LOCKED | Approval exists for exact committed closure; lifecycle is EXECUTION or later | Approval + WorkItem lifecycle |
| MAT-011 TERMINAL_RESULT | terminal AUDIT/INVESTIGATION result artifact/evidence or candidate result is final historical outcome | WorkItem COMPLETE/outcome + artifacts/evidence |

These conditions can overlap in controlled ways only where their semantic plane differs; for example a repository file may be Git-uncommitted while still CURRENT_UNCONFORMED. Git recording is not conformance.

## 3. Work request maturity

| Question | Current fact |
|---|---|
| canonical creation | deterministic `work-request.md` is created/read first; WorkItem runtime projection records source path/hash |
| editable | yes in IDEA/pre-signoff when no active Run; not in EXECUTION/COMPLETE |
| save semantics | expected source SHA; complete source revalidated before and at commit |
| proposal model | STAGE conversation does not directly mutate source; material clarification must be explicitly written/adopted into canonical source |
| currentness | `WorkItem.sourceSha256` + validated current repository source |
| changed after progression | SOURCE_AUTHORITY_CHANGED returns progressed work to R1 and invalidates downstream authority |
| changed after sign-off | execution tasks for current Approval are blocked; source freshness fails |
| COMPLETE mutation | does not reinterpret historical completion; source-integrity diagnostic only |
| Git maturity | Unsaved edits / Saved to project, not Git / Saved to Git is independent from lifecycle conformance |
| lifecycle consumption | root input for R1 and conformance identity throughout downstream work |

**Verdict:** source maturity/currentness semantics are substantially closed and correctly derived.

## 4. R1/R2/DESIGN/PLAN lifecycle document maturity

### 4.1 Creation and repository drafts

The canonical deterministic paths are:

- `research.md`;
- `requirements.md`;
- `solution-design.md`;
- `implementation-plan.md`.

On source reconciliation, `materializeLifecycleDrafts`:

1. checks each deterministic file;
2. hashes working-tree bytes;
3. detects whether those exact bytes exist at HEAD;
4. stores an ArtifactRef snapshot with role/authority layer and optional `gitCommit`.

This intentionally does **not** fabricate a Run, completion or conformance event.

That is correct repository-draft semantics.

### 4.2 Human editing

`artifactDirectEditIsAllowed` permits only R1/R2/DESIGN/PLAN roles, only before EXECUTION/COMPLETE, and only after the WorkItem has reached that owning stage.

Saving:

- requires expected ArtifactRef SHA;
- forbids active Runs;
- writes exact Markdown;
- creates a new ArtifactRef;
- transitions the WorkItem back to the artifact's owner via LIFECYCLE_ARTIFACT_CHANGED;
- does not create conformance.

This correctly separates **canonical bytes changed** from **bytes conformant/ready**.

### 4.3 Agent proposal/adoption

A pre-signoff STAGE Run may create a lifecycle artifact proposal.

- proposal pending is not authority;
- adoption request is durable but not yet disposition;
- successful adoption writes exact bytes/ArtifactRef and transitions to artifact owner;
- adoption does not itself imply downstream conformance;
- subsequent current context must be re-resolved.

STATE-F01 remains relevant: Cancel can currently strand a pending proposal in a closed Run.

### 4.4 Conformance

`resolveStageConformanceState` requires all of:

1. current upstream context resolves with no stale prior stage;
2. latest STAGE Run for stage has CONFORMANCE_PASSED;
3. event contextHash equals the current resolved context hash;
4. output ArtifactRefs belong to the WorkItem and exact stage role;
5. current repository bytes still match every output ArtifactRef.

Only then is the stage CURRENT_CONFORMED.

This correctly prevents “file exists” or “agent completed” from becoming conformance.

## 5. MAT-F01 — rediscovered lifecycle drafts are materialized but not surfaced

**Authority requirement:** `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1` §10 requires a present deterministic lifecycle file on a fresh installation to be rediscovered as a **repository draft for its canonical role**, visible/editable under normal stage rules, without fabricating Run/conformance/lifecycle history.

**Producer:** `materializeLifecycleDrafts` correctly stores ArtifactRefs for deterministic R1/R2/DESIGN/PLAN/R3 files found during source reconciliation, even with no Run history.

**Consumer:** `currentLifecycleArtifacts` does not enumerate these materialized repository drafts directly. For each lifecycle role it calls `latestRunCandidateArtifacts`, which begins from STAGE Runs for that role and returns no candidate when there is no Run.

Therefore:

~~~text
fresh installation
  + valid work-request.md
  + existing requirements.md
  + no historical Order Runs
        |
        v
reconciliation stores requirements.md ArtifactRef
        |
        v
currentLifecycleArtifacts()
        |
        +--> no R2 STAGE Run
        +--> latestRunCandidateArtifacts = []
        |
        v
draft omitted from normal lifecycle-artifact projection
~~~

No fabricated Run is desired; the missing behavior is the repository-draft consumer path.

**Verdict:** `CONTRADICTORY IMPLEMENTATION`, release blocker for portable document rediscovery.  
**Classification:** P3 requirement is explicit; P4/P6 implementation/query ownership is incomplete.  
**Phase 2 implication:** preserve the no-fabricated-history rule while defining the correct current-material projection. Do not add a persisted document-status database merely to solve discovery.

## 6. Current lifecycle artifact projection

For lifecycle material with Run history, `latestRunCandidateArtifacts` chooses in this order:

1. latest Run matching CONFORMANCE_PASSED outputs;
2. latest Run STAGE_COMPLETED artifact ids;
3. adopted proposal ArtifactRefs;
4. older conformed Run fallback.

`currentLifecycleArtifacts` then replaces each candidate with the current repository-file snapshot if the deterministic bytes still exist.

This means the UI can inspect the **current file bytes** even when the historical candidate ArtifactRef is no longer byte-current.

That is useful for document authoring, but it must not be mistaken for conformance. The separate `resolveStageConformanceState` is the actual conformance owner.

**Verdict:** structurally correct separation, subject to MAT-F01's missing no-Run draft path.

## 7. R3 readiness material

R3 differs deliberately:

- R3 is read-only in the Markdown workbench;
- `currentStageDraftArtifacts` returns no editable R3 draft;
- R3 conformance requires one current R3 root;
- sign-off requires current R3 conformance and its complete dependency closure;
- R3 can return the lifecycle to R1/R2/DESIGN/PLAN.

A deterministic `readiness-review.md` can be rediscovered as an ArtifactRef draft, but it must not fabricate readiness history or become editable merely because the file exists.

**Verdict:** authority semantics are correct; MAT-F01 affects visibility of no-Run rediscovered R3 material as inspection draft.

## 8. Approval package maturity

The sign-off package is not another persisted mutable document. It is a derived exact closure.

`computeSignoffPackage` requires:

1. WorkItem exactly AWAITING_SIGNOFF / ACTIVE;
2. current conformed R3 root;
3. R3 dependency closure equals current resolved material set;
4. current WorkItem source is valid;
5. source is committed at selected baseline and matches source hash;
6. all Plan/R3/material artifacts are committed at that same baseline;
7. working-tree bytes still equal those artifacts;
8. signed task block validates;
9. deterministic packageHash over exact source/baseline/material.

This yields MAT-009 COMMITTED_SIGNOFF_CLOSURE.

Sign-off then rechecks package hash, baseline, source bytes and every material byte before atomically storing Approval/ExecutionTasks and transitioning to EXECUTION.

**Verdict:** Approval package maturity/currentness is strongly closed.

## 9. Signed execution material

After sign-off:

- Approval binds baselineCommit/packageHash/sourceSha256/Plan/R3;
- committed closure ArtifactRefs are immutable evidence;
- ExecutionTasks materialize from the signed task block;
- lifecycle Markdown becomes read-only;
- post-signoff preflight checks Approval/source/material freshness;
- changed source or signed material makes Approval stale / blocks execution and routes ownership upstream;
- candidate code/evidence is not lifecycle-document editor material.

This is MAT-010 SIGNED_LOCKED.

**Verdict:** correct separation between signed authority and mutable implementation workspace.

## 10. Approval freshness / stale ownership

`approvalFreshness` compares:

- current WorkItem source SHA to Approval sourceSha256;
- signed approval closure to a newly resolved current material set.

Changed semantic identities/hashes are routed through `changedMaterialOwners` and earliest upstream return ownership.

This provides a typed owner for stale authority rather than a generic “document stale” flag.

**Verdict:** correct and should remain derived, not re-persisted as document state.

## 11. Terminal material

### 11.1 AUDIT / INVESTIGATION

An `AUDIT_COMPLETE` or `INVESTIGATION_COMPLETE` R1 artifact/evidence is terminal result authority. It does not manufacture requirements/design/plan/execution.

A later remediation is a separately governed linked WorkItem.

### 11.2 Candidate delivery

A CANDIDATE_DONE result is represented by final outcome plus Run/evidence history. Candidate code/evidence is not made editable through lifecycle Markdown controls.

**Verdict:** correct.

## 12. Material-to-UI/action matrix

| Material condition | Current UI representation | Valid action | Current gap |
|---|---|---|---|
| Work request current editable | source document editor | Edit/Save/Git-save/Start Research | coherent |
| source stale/conflict | owning document/current-attention notice | reload/reconcile/re-edit | coherent |
| no lifecycle document | stage activity/empty state | Start/Retry stage | coherent |
| repository draft with historical Run candidate | current document material | direct edit/save when allowed | coherent |
| repository draft with **no Run history** | should be lifecycle document material | direct edit only after owning stage reached; inspect otherwise | **MAT-F01 omitted projection** |
| proposal pending | proposal Review surface | Adopt/Reject | STATE-F01 can create dead proposal |
| adoption in progress | proposal Review/current attention | wait/reconcile | coherent except STATE-F01 algebra |
| current unconformed lifecycle bytes | current document + owning stage | edit/save/run/conformance workflow | semantics exist but UI does not explicitly name maturity |
| current conformed bytes | document + reached/current lifecycle | inspect/progress | semantics exist; UI mostly infers via stage/history |
| stale downstream authority | current attention + stale owner | Reconcile authority / upstream work | coherent |
| R3 current/conformed | read-only review material | inspect / readiness outcome | coherent |
| committed sign-off closure | Approval | inspect/sign off | coherent; INFO-F03 presentation leak |
| signed locked package | Implementation/Approval history | inspect only | coherent |
| terminal audit/result | Complete | inspect evidence/create linked remediation | coherent |

## 13. MAT-F02 — material maturity exists in facts but is not one explicit product vocabulary

The implementation can derive key distinctions such as draft/current bytes, conformance and stale authority, but the Workbench currently communicates them indirectly through lifecycle state, selector labels and notices rather than one explicit user-facing maturity vocabulary.

This is **not evidence that another persisted state machine is needed**.

It is a Phase 2A product-design question:

- which derived distinctions must be visible to the operator;
- which can remain implicit;
- how document maturity should be named without duplicating lifecycle status.

**Verdict:** `INCOMPLETE PRODUCT SEMANTICS`, not yet an implementation defect by itself.

## 14. MAT-F03 — Git maturity is correctly orthogonal to conformance

Current UI distinguishes:

- Unsaved edits;
- Saved to project, not Git;
- Saved to Git.

Git-save does not confer conformance, readiness or Approval.

This is the correct orthogonal model and should not be collapsed into future document-maturity design.

**Verdict:** `CORRECT`.

## 15. MAT-F04 — source mutation correctly invalidates signed execution authority

A progressed source change transitions ownership to R1 and, if a current Approval exists, blocks its ExecutionTasks. Execution freshness then fails until authority is re-resolved/re-approved.

**Verdict:** `CORRECT`.

## 16. Fact-source matrix

| Material | Exists/current from | Conformance/readiness from | Stale/historical from | Editable from |
|---|---|---|---|---|
| Work request | validated source file + source SHA | source/context inclusion; no standalone conformance status | source hash change/missing/completed diagnostic | lifecycle + active-Run exclusion |
| R1 | ArtifactRef/current file bytes | R1 CONFORMANCE_PASSED + contextHash + bytes | changed source/upstream/current bytes or prior snapshot | direct role + reached owner + pre-signoff |
| R2 | ArtifactRef/current file bytes | R2 conformance + current R1/source context | same | same |
| DESIGN | ArtifactRef/current file bytes | DESIGN conformance + current upstream | same | same |
| PLAN | ArtifactRef/current file bytes | PLAN conformance + current upstream | same | same |
| R3 | ArtifactRef/current file bytes | R3 conformance + current complete dependency closure | changed closure/current bytes | read-only |
| Approval package | derived current sign-off package | current R3 closure + committed source/material + task validation | package recomputation/freshness | not an editable document |
| signed execution package | Approval + committed ArtifactRefs + ExecutionTasks | explicit sign-off of exact package | approval freshness/source/material change | read-only |
| terminal result | WorkItem outcome + final artifact/evidence | terminal lifecycle outcome | immutable history; later source change diagnostic only | read-only |

## 17. Findings

### MAT-F01 — rediscovered no-Run lifecycle drafts are not surfaced

- **Severity:** release blocker.
- **Root:** lifecycle-artifact query consumes Run-derived candidates only.
- **Authority:** P3 explicitly requires repository-draft visibility without fabricated Run history.
- **Classification:** implementation/query projection defect; P4/P6 may need explicit projection ownership clarification.
- **Affected:** portability/fresh install, R1/R2/DESIGN/PLAN/R3 document surfaces.

### MAT-F02 — document maturity presentation is under-specified

- **Severity:** material Phase 2 functional-design input.
- **Root:** existing canonical facts support distinctions, but current Workbench does not define a complete operator-facing maturity vocabulary.
- **Classification:** missing/incomplete P3 product semantics.
- **Affected:** all lifecycle-document steps.

### MAT-F03 — Git recording is correctly orthogonal

- **Verdict:** CORRECT.
- **Preserve:** do not make Git save equal conformance/approval.

### MAT-F04 — signed-package invalidation is correctly closed

- **Verdict:** CORRECT.
- **Preserve:** source/material mutation cannot silently retain execution authority.

### MAT-F05 — proposal maturity inherits STATE-F01

A proposal is a material-change intent, not document authority. Current proposal/adoption derivation is sound until Cancel creates CLOSED + PENDING.

- **Verdict:** CONTRADICTORY through STATE-F01.
- **Affected:** R1/R2/DESIGN/PLAN/R3 proposed document changes.

## 18. P1-T08 completion verdict

**P1-T08: COMPLETE.**

Phase 1 now knows:

- which canonical facts create each material;
- what makes it editable/read-only;
- proposal/adoption ownership;
- what proves conformance/currentness;
- what makes it stale/historical;
- what creates the committed/signed execution lock;
- which lifecycle stage can consume each material;
- how current UI represents those conditions;
- where the current implementation or P3 semantics are incomplete.

The evidence does **not** justify a new persisted document-state machine. Phase 2A must define the operator-facing maturity semantics; Phase 2B must derive them from existing canonical facts unless a genuinely missing fact is proven.

P1-T09 can now close certification and cross-artifact evidence coverage.
