<!-- Order template: change-r2-v2; authority: GW-DOC-WORK-LIFECYCLE-V1, GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-SPECIFICATION-STANDARD-V2, GW-FR-096-LIFECYCLE-AUTHORITY-DISPOSITION -->

## P2 intent and R1 factual basis

This R2 artifact is rebuilt from the fresh post-corrective-foundation R1 record in `research.md`, the current P2/P3 authority graph resolved through `pontivus-order.toml`, and no other normative source.

Current implementation, UI, tests, 0.5.0 behavior, historical design and prior R2/DESIGN/PLAN text are evidence only. They do not define 0.6.0 behavior, preservation scope, compatibility fallback or regression semantics.

The current R1 basis is `research.md` blob `e37ef7d7b54f6c344274d4dfb71a3992f92271a4`. It retains the G-F12 reconstruction, C19-F03/C20-F06 and post-IA28 C19-F04/C19-F05/C20-F07 findings, and now records C19-F06/C19-F07/C19-F08/C20-F08/C20-F09/C20-F10 with zero material `UNPROVEN`: a mandatory semantic attention slot contradicted the closed interaction grammar, Evidence could nest one primary surface inside another, terminal rendering duplicated outcome semantics and leaked specification/container terminology, and rendered/certification evidence could positively protect those defects. Current canonical Workbench P3 is `GW-DOC-WORKBENCH-UX-V2` blob `f38bd9ebf17e0726b51453a7e05dc52175b080fa`; current Markdown Workbench P3 is `GW-DOC-MARKDOWN-WORKBENCH-V1` blob `1cc5a28eff8d180f88106d89990f7b89aa27a132`. P3 owns the permanent semantic classes and composition invariants, including semantic-region ownership, exactly one selected primary interaction composition, terminal-result primacy without a duplicate attention band, one semantic material/history owner, one explicit technical-inspection boundary per scope, no generic local Technical-details bars, no disclosure accumulation, task-modal header/body/footer anatomy and Markdown editor-control→canvas adjacency. R2 owns the complete 0.6.0 package-specific functional consequences. Technical primitive ownership and implementation scope remain DESIGN/PLAN decisions.

## Functional authority disposition ledger

The v2 disposition ledger is obligation-complete against current canonical P3 authority. It contains exactly one row for each of the **112 unique manifest-canonical stable `GW-FR-*` requirements** selected by `authority.p3`. Of those stable requirements, **111 are `REFERENCE`** and retain their existing P3 semantics; **`GW-FR-079-PRODUCTIVE-INSTALLATION-READINESS` is `DELTA`** because R1 `C16-F04` proved its current successful-install semantics collide with `GW-FR-007-GUIDED-PRODUCTIVE-BOOTSTRAP` at the same P3 layer. `REFERENCE` is not shorthand for "no behavior"; it preserves ownership while this package makes the required behavior explicit.

Two additional non-stable normative-clause rows record P3 corrections that do not have dedicated stable requirement identities: the C01 Work Lifecycle cross-reference correction and the C16 Installation Readiness §§2/4.2 fresh-install/recovery boundary correction. Both are `DELTA` to existing P3 document owners, not new requirement namespaces.

No `LOCAL` requirement is needed because every 0.6.0 functional obligation is already owned by canonical P2/P3 authority.

| Requirement | Disposition | Canonical P3 owner | Primary campaign concern |
|---|---|---|---|
| GW-FR-001-GOVERNED-LIFECYCLE | REFERENCE | GW-DOC-WORK-LIFECYCLE | C01 |
| GW-FR-002-REPRODUCIBLE-AUTHORITY | REFERENCE | GW-DOC-WORK-LIFECYCLE | C01 |
| GW-FR-003-DURABLE-BOUNDED-EXECUTION | REFERENCE | GW-DOC-WORK-LIFECYCLE | C12 |
| GW-FR-004-INDEPENDENT-VALIDATION | REFERENCE | GW-DOC-WORK-LIFECYCLE | C20 |
| GW-FR-005-LOCAL-WORKBENCH | REFERENCE | GW-DOC-WORK-LIFECYCLE | C05 |
| GW-FR-006-MINIMUM-VERIFIED-CANDIDATE | REFERENCE | GW-DOC-WORK-LIFECYCLE | C12 |
| GW-FR-007-GUIDED-PRODUCTIVE-BOOTSTRAP | REFERENCE | GW-DOC-WORK-LIFECYCLE | C16 |
| GW-FR-008-GOVERNED-REPOSITORY-ACCESS | REFERENCE | GW-DOC-WORK-LIFECYCLE | C22 |
| GW-FR-009-PORTABLE-WORK-ITEM-SOURCE | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM | C04 |
| GW-FR-010-GOVERNED-WORK-KIND-CATALOG | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM | C02 |
| GW-FR-011-VERSIONED-AUTHORING-SCHEMAS | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM | C02 |
| GW-FR-012-CATALOG-DRIVEN-AUTHORING | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM | C02 |
| GW-FR-013-PORTABLE-QUEUE-RECONCILIATION | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM | C03 |
| GW-FR-014-SOURCE-FRESHNESS | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM | C04 |
| GW-FR-015-SOURCE-CONTEXT-PROJECTION | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM | C06 |
| GW-FR-016-SOURCE-CONFORMANCE-IDENTITY | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM | C17 |
| GW-FR-017-SOURCE-SIGNOFF-BINDING | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM | C11 |
| GW-FR-018-SOURCE-CONSUMER-CLOSURE | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM | C04 |
| GW-FR-019-SOURCE-CLARIFICATION-DURABILITY | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM | C06 |
| GW-FR-020-WORKBENCH-SOURCE-OPERATIONS | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C04 |
| GW-FR-021-MARKDOWN-WORKSPACE | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C05 |
| GW-FR-022-GOVERNED-MARKDOWN-EDITING | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C04 |
| GW-FR-023-MARKDOWN-SOURCE-FIDELITY | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C04 |
| GW-FR-024-LIFECYCLE-FRESHNESS-VISIBILITY | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C17 |
| GW-FR-025-DURABLE-INTENT-INTERACTION | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C06 |
| GW-FR-026-SOURCE-BOUND-SIGNOFF-INTEGRATION | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C11 |
| GW-FR-027-READONLY-EXECUTION-EDITOR-BOUNDARY | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C12 |
| GW-FR-028-NONDELIVERY-TERMINAL-VIEW | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C13 |
| GW-FR-029-NO-IDE-SCOPE | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C02 |
| GW-FR-060-PROJECT-LOCAL-WORKITEM-DOCUMENTATION | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM | C04 |
| GW-FR-061-DETERMINISTIC-WORKITEM-DOCUMENT-LAYOUT | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM | C04 |
| GW-FR-062-EXPLICIT-DOCUMENTATION-GIT-SAVE | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C04 |
| GW-FR-063-DOCUMENTATION-GIT-STATUS | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C04 |
| GW-FR-065-EXACT-SOURCE-MARKDOWN-EDITOR | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C04 |
| GW-FR-066-DOCUMENT-EDIT-PREVIEW-MODES | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C04 |
| GW-FR-067-MARKDOWN-AUTHORING-ERGONOMICS | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C04 |
| GW-FR-068-LIVE-SAFE-MARKDOWN-PREVIEW | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C04 |
| GW-FR-069-EDITOR-STATE-CONTINUITY | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C04 |
| GW-FR-070-REPOSITORY-LIFECYCLE-DRAFT-REDISCOVERY | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM | C03 |
| GW-FR-071-DOCUMENTATION-GIT-ELIGIBILITY | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C04 |
| GW-FR-072-REPOSITORY-LOCAL-GIT-IDENTITY | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C03 |
| GW-FR-073-OPENCODE-ACCOUNT-VISIBILITY | REFERENCE | GW-DOC-INSTALLATION-READINESS | C16 |
| GW-FR-074-OPENCODE-SAVED-ACCOUNT-SWITCHING | REFERENCE | GW-DOC-INSTALLATION-READINESS | C16 |
| GW-FR-075-OPENCODE-ACCOUNT-LOGIN | REFERENCE | GW-DOC-INSTALLATION-READINESS | C16 |
| GW-FR-076-OPENCODE-ACCOUNT-MUTATION-SAFETY | REFERENCE | GW-DOC-INSTALLATION-READINESS | C16 |
| GW-FR-077-DIRECT-WORKITEM-TITLE-EDIT | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM | C04 |
| GW-FR-078-PORTABLE-WORKITEM-ARCHIVE | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM | C03 |
| GW-FR-079-PRODUCTIVE-INSTALLATION-READINESS | DELTA | GW-DOC-INSTALLATION-READINESS | C16 |
| GW-FR-080-CONFIGURATION-CONTINUITY | REFERENCE | GW-DOC-INSTALLATION-READINESS | C16 |
| GW-FR-081-OPENCODE-ACCOUNT-CONTINUITY | REFERENCE | GW-DOC-INSTALLATION-READINESS | C16 |
| GW-FR-082-REPOSITORY-AND-DOCUMENT-CONTINUITY | REFERENCE | GW-DOC-INSTALLATION-READINESS | C16 |
| GW-FR-087-WORKITEM-AUTHORING-OWNERSHIP | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM | C02 |
| GW-FR-088-WORKITEM-METADATA-PRESERVATION | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM | C04 |
| GW-FR-089-HUMAN-FIRST-WORKITEM-SOURCE-EDITOR | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C04 |
| GW-FR-090-WORKITEM-BODY-CONFLICT-SAFETY | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C04 |
| GW-FR-091-FIRST-CLASS-INSTALLATION-CONFIGURATION | REFERENCE | GW-DOC-INSTALLATION-READINESS | C16 |
| GW-FR-092-CONNECTED-REPOSITORY-CONFIGURATION | REFERENCE | GW-DOC-INSTALLATION-READINESS | C16 |
| GW-FR-093-DOCUMENT-ROOT-MIGRATION-SAFETY | REFERENCE | GW-DOC-INSTALLATION-READINESS | C16 |
| GW-FR-095-CENTRALIZED-APPLICATION-SETTINGS | REFERENCE | GW-DOC-INSTALLATION-READINESS | C16 |
| GW-FR-096-LIFECYCLE-AUTHORITY-DISPOSITION | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM | C07 |
| GW-FR-097-STAGE-CONFORMANCE-OUTPUT-CLOSURE | REFERENCE | GW-DOC-LIFECYCLE-CONTEXT | C20 |
| GW-FR-098-READINESS-AUTHORITY-TOPOLOGY-REVIEW | REFERENCE | GW-DOC-SPECIFICATION-STANDARD | C10 |
| GW-FR-099-PRODUCTIVE-PROVIDER-WORKSPACE-CONTAINMENT | REFERENCE | GW-DOC-PROJECT-GOVERNANCE-INTEGRATION | C15 |
| GW-FR-100-COMPLETE-REPOSITORY-INSTRUCTION-CLOSURE | REFERENCE | GW-DOC-PROJECT-GOVERNANCE-INTEGRATION | C22 |
| GW-FR-101-PRODUCTIVE-OPENCODE-PATH-CONSISTENCY | REFERENCE | GW-DOC-PROJECT-GOVERNANCE-INTEGRATION | C15 |
| GW-FR-102-FAILURE-ORIGIN-CLASSIFICATION | REFERENCE | GW-DOC-PROJECT-GOVERNANCE-INTEGRATION | C15 |
| GW-FR-103-OPENCODE-INTEGRATION-CERTIFICATION-COVERAGE | REFERENCE | GW-DOC-PROJECT-GOVERNANCE-INTEGRATION | C20 |
| GW-FR-104-STAGE-WORKSPACE-FRESHNESS | REFERENCE | GW-DOC-PROJECT-GOVERNANCE-INTEGRATION | C15 |
| GW-FR-105-PRODUCTIVE-MODEL-CONTEXT-AUTHORITY-CLOSURE | REFERENCE | GW-DOC-PROJECT-GOVERNANCE-INTEGRATION | C22 |
| GW-FR-200-CANONICAL-WORKFLOW-OBSERVATION | REFERENCE | GW-DOC-WORKBENCH-UX | C05 |
| GW-FR-201-OBSERVATIONAL-READS | REFERENCE | GW-DOC-WORKBENCH-UX | C05 |
| GW-FR-202-ATOMIC-COMMAND-OUTCOME | REFERENCE | GW-DOC-WORKBENCH-UX | C17 |
| GW-FR-203-SERIALIZED-RUN-TURNS | REFERENCE | GW-DOC-WORKBENCH-UX | C15 |
| GW-FR-204-EXACT-HUMAN-INPUT-OWNERSHIP | REFERENCE | GW-DOC-WORKBENCH-UX | C06 |
| GW-FR-205-MONOTONIC-REACH-HISTORY | REFERENCE | GW-DOC-WORKBENCH-UX | C01 |
| GW-FR-206-CURRENT-ATTENTION-PRECEDENCE | REFERENCE | GW-DOC-WORKBENCH-UX | C17 |
| GW-FR-207-PROPOSAL-AUTHORITY-BOUNDARY | REFERENCE | GW-DOC-WORKBENCH-UX | C14 |
| GW-FR-208-ACTIVE-RUN-AUTHORITY-EXCLUSION | REFERENCE | GW-DOC-WORKBENCH-UX | C14 |
| GW-FR-209-SOURCE-BLOCKER-ADMISSION | REFERENCE | GW-DOC-WORKBENCH-UX | C04 |
| GW-FR-210-ASYNC-WORKFLOW-CONVERGENCE | REFERENCE | GW-DOC-WORKBENCH-UX | C17 |
| GW-FR-211-READINESS-RETURN-CONTINUITY | REFERENCE | GW-DOC-WORKBENCH-UX | C10 |
| GW-FR-212-APPROVAL-PURITY-AND-CURRENTNESS | REFERENCE | GW-DOC-WORKBENCH-UX | C11 |
| GW-FR-213-EXECUTION-BLOCKER-PRECEDENCE | REFERENCE | GW-DOC-WORKBENCH-UX | C12 |
| GW-FR-214-STABLE-WORKBENCH-GEOMETRY | REFERENCE | GW-DOC-WORKBENCH-UX | C05 |
| GW-FR-215-STABLE-WORKFLOW-RAIL | REFERENCE | GW-DOC-WORKBENCH-UX | C05 |
| GW-FR-216-NO-CONDITIONAL-PRESIGNOFF-RAIL | REFERENCE | GW-DOC-WORKBENCH-UX | C05 |
| GW-FR-217-PRIMARY-INFORMATION-ECONOMY | REFERENCE | GW-DOC-WORKBENCH-UX | C05 |
| GW-FR-218-SPACE-CLASS-CONSISTENCY | REFERENCE | GW-DOC-WORKBENCH-UX | C05 |
| GW-FR-219-EXPLICIT-CONTEXT | REFERENCE | GW-DOC-WORKBENCH-UX | C05 |
| GW-FR-220-PRESIGNOFF-CONTINUITY | REFERENCE | GW-DOC-WORKBENCH-UX | C05 |
| GW-FR-221-READINESS-REVIEW-HIERARCHY | REFERENCE | GW-DOC-WORKBENCH-UX | C10 |
| GW-FR-222-APPROVAL-REVIEW-HIERARCHY | REFERENCE | GW-DOC-WORKBENCH-UX | C11 |
| GW-FR-223-IMPLEMENTATION-MASTER-DETAIL | REFERENCE | GW-DOC-WORKBENCH-UX | C12 |
| GW-FR-224-TERMINAL-RESULT-PRIMACY | REFERENCE | GW-DOC-WORKBENCH-UX | C13 |
| GW-FR-225-RESPONSIVE-SEMANTIC-CONTINUITY | REFERENCE | GW-DOC-WORKBENCH-UX | C18 |
| GW-FR-226-WORKFLOW-CRITICAL-FEEDBACK | REFERENCE | GW-DOC-WORKBENCH-UX | C17 |
| GW-FR-227-CERTIFICATION-MATRIX | REFERENCE | GW-DOC-WORKBENCH-UX | C20 |
| GW-FR-228-FUNCTIONAL-STATE-TRANSITION-CLOSURE | REFERENCE | GW-DOC-WORKBENCH-UX | C01 |
| GW-FR-229-PROVIDER-TURN-CONTROL-EXCLUSIVITY | REFERENCE | GW-DOC-WORKBENCH-UX | C15 |
| GW-FR-230-CLOSED-WORKBENCH-INTERACTION-GRAMMAR | REFERENCE | GW-DOC-WORKBENCH-UX | C05 |
| GW-FR-231-CANONICAL-WORKBENCH-VISUAL-LANGUAGE | REFERENCE | GW-DOC-WORKBENCH-UX | C19 |
| GW-FR-232-CLOSED-WORKFLOW-STATE-LANGUAGE | REFERENCE | GW-DOC-WORKBENCH-UX | C01 |
| GW-FR-233-CANONICAL-WORKFLOW-RAIL-PROJECTION | REFERENCE | GW-DOC-WORKBENCH-UX | C05 |
| GW-FR-234-UNIFIED-WORKBENCH-COMPONENT-PRESENTATION | REFERENCE | GW-DOC-WORKBENCH-UX | C19 |
| GW-FR-235-GLOBAL-THEME-PARITY | REFERENCE | GW-DOC-WORKBENCH-UX | C19 |
| GW-FR-236-WORK-TYPE-AWARE-TASK-INFORMATION | REFERENCE | GW-DOC-WORKBENCH-UX | C05 |
| GW-FR-237-BOUNDED-AGENT-ACTIVITY | REFERENCE | GW-DOC-WORKBENCH-UX | C15 |
| GW-FR-238-PROPOSAL-CANCEL-CLOSURE | REFERENCE | GW-DOC-WORKBENCH-UX | C14 |
| GW-FR-239-TASK-SCOPED-MANUAL-IMPLEMENTATION | REFERENCE | GW-DOC-WORKBENCH-UX | C12 |
| GW-FR-240-REJECTED-PROVIDER-RESULT-FAILURE | REFERENCE | GW-DOC-WORKBENCH-UX | C15 |
| GW-FR-241-DERIVED-MATERIAL-MATURITY | REFERENCE | GW-DOC-WORKBENCH-UX | C14 |
| GW-FR-242-DIALOGUE-REPLY-CONTEXT | REFERENCE | GW-DOC-WORKBENCH-UX | C14 |
| GW-DOC-WORK-LIFECYCLE clause: `GW-P2-CONTROLLED-WORK` System Brief cross-reference | DELTA | GW-DOC-WORK-LIFECYCLE | C01 |
| GW-DOC-INSTALLATION-READINESS clauses: §§2/4.2 fresh-install success versus recovery readiness | DELTA | GW-DOC-INSTALLATION-READINESS | C16 |

The stable-ID table is a mechanical ownership/completeness proof only. Normative P3 clauses without stable IDs remain mandatory semantic audit material under each R2 pair audit and cannot be declared complete by identifier counting.

Two P2 corrections are part of this R2 package but are not misrepresented as P3 dispositions:

- `GW-DOC-SYSTEM-BRIEF` §8 states product-level terminal success without collapsing valid no-code results into candidate execution success.
- `GW-DOC-PRODUCT-IDENTITY` §7 distinguishes prohibited automatic implementation/delivery commits from the already-governed explicit WorkItem-documentation Git commit capability.

The C01 clause-level P3 `DELTA` corrects the `GW-P2-CONTROLLED-WORK` cross-reference in `GW-DOC-WORK-LIFECYCLE` from System Brief §8 to its actual declaration in §9. It does not change lifecycle behavior.

## G-F10 R1-to-R2 semantic revalidation ledger

This ledger records the exact factual basis consumed by R2 after G-F10 plus the post-G6 `ALIGN-A09-F01` revalidation. It does not copy permanent P3 semantics: the canonical owner in the primary disposition ledger remains authoritative. Stable requirements remain `REFERENCE` unless R1 proves that the current canonical requirement itself participates in an authority defect. `C16-F04` does exactly that for `GW-FR-079`, so FR079 is the single stable `DELTA`; FR007 remains `REFERENCE` at its correct owner, `GW-DOC-WORK-LIFECYCLE`.

| Stable requirement | R1 realization verdict | Exact R1 evidence | R2 disposition | Primary concern |
|---|---|---|---|---|
| `GW-FR-001-GOVERNED-LIFECYCLE` | `CONFORMS` | `C01-O03`, `C01-O05`, `C01-O08` | `REFERENCE` | C01 |
| `GW-FR-002-REPRODUCIBLE-AUTHORITY` | `CONFORMS` | `C01-O01`, `C01-O07` | `REFERENCE` | C01 |
| `GW-FR-003-DURABLE-BOUNDED-EXECUTION` | `CONFORMS` | `C12-O01`, `C12-O02`, `C12-O07` | `REFERENCE` | C12 |
| `GW-FR-004-INDEPENDENT-VALIDATION` | `CONFORMS_WITH_DEPENDENCY` | `C12-O08`, `C12-O09`, `C12-O10`, `C12-O11`, `C12-O12`, `C20-O10` | `REFERENCE` | C20 |
| `GW-FR-005-LOCAL-WORKBENCH` | `CONFORMS` | `C05-O01`, `C05-O04`, `C05-O12`, `C19-O06`, `C19-O08` | `REFERENCE` | C05 |
| `GW-FR-006-MINIMUM-VERIFIED-CANDIDATE` | `CONFORMS` | `C12-O12`, `C12-O13`, `C12-O19` | `REFERENCE` | C12 |
| `GW-FR-007-GUIDED-PRODUCTIVE-BOOTSTRAP` | `VIOLATES` | `DIRECT-FR007`, `C16-F04` | `REFERENCE` | C16 |
| `GW-FR-008-GOVERNED-REPOSITORY-ACCESS` | `CONFORMS` | `C16-O02`, `C16-O05`, `C22-O10` | `REFERENCE` | C22 |
| `GW-FR-009-PORTABLE-WORK-ITEM-SOURCE` | `CONFORMS` | `C04-O01`, `C04-O04` | `REFERENCE` | C04 |
| `GW-FR-010-GOVERNED-WORK-KIND-CATALOG` | `CONFORMS` | `C02-O01` | `REFERENCE` | C02 |
| `GW-FR-011-VERSIONED-AUTHORING-SCHEMAS` | `CONFORMS` | `C02-O02`, `C02-O06` | `REFERENCE` | C02 |
| `GW-FR-012-CATALOG-DRIVEN-AUTHORING` | `MIXED` | `C02-O04`, `C02-O05`, `C02-O07` | `REFERENCE` | C02 |
| `GW-FR-013-PORTABLE-QUEUE-RECONCILIATION` | `CONFORMS` | `C03-O01`, `C03-O02`, `C03-O03`, `C03-O05`, `C03-O09` | `REFERENCE` | C03 |
| `GW-FR-014-SOURCE-FRESHNESS` | `CONFORMS` | `C04-O14`, `C02-O12` | `REFERENCE` | C04 |
| `GW-FR-015-SOURCE-CONTEXT-PROJECTION` | `CONFORMS_WITH_DEPENDENCY` | `C06-O02`, `C22-O06` | `REFERENCE` | C06 |
| `GW-FR-016-SOURCE-CONFORMANCE-IDENTITY` | `CONFORMS` | `C06-O15`, `C22-O06` | `REFERENCE` | C17 |
| `GW-FR-017-SOURCE-SIGNOFF-BINDING` | `CONFORMS` | `C11-O01`, `C11-O03`, `C12-O20` | `REFERENCE` | C11 |
| `GW-FR-018-SOURCE-CONSUMER-CLOSURE` | `MIXED` | `C04-O07`, `C04-O14` | `REFERENCE` | C04 |
| `GW-FR-019-SOURCE-CLARIFICATION-DURABILITY` | `VIOLATES` | `C06-O13` | `REFERENCE` | C06 |
| `GW-FR-020-WORKBENCH-SOURCE-OPERATIONS` | `CONFORMS` | `C03-O04`, `C03-O09` | `REFERENCE` | C04 |
| `GW-FR-021-MARKDOWN-WORKSPACE` | `CONFORMS` | `C04-O15`, `C05-O02`, `C05-O10` | `REFERENCE` | C05 |
| `GW-FR-022-GOVERNED-MARKDOWN-EDITING` | `CONFORMS` | `C04-O03`, `C04-O08`, `C04-O14` | `REFERENCE` | C04 |
| `GW-FR-023-MARKDOWN-SOURCE-FIDELITY` | `CONFORMS` | `C04-O01`, `C04-O02` | `REFERENCE` | C04 |
| `GW-FR-024-LIFECYCLE-FRESHNESS-VISIBILITY` | `MIXED` | `C17-O02`, `C17-O05`, `C17-O09` | `REFERENCE` | C17 |
| `GW-FR-025-DURABLE-INTENT-INTERACTION` | `VIOLATES` | `C06-O13` | `REFERENCE` | C06 |
| `GW-FR-026-SOURCE-BOUND-SIGNOFF-INTEGRATION` | `CONFORMS` | `C11-O01`, `C11-O02`, `C11-O07` | `REFERENCE` | C11 |
| `GW-FR-027-READONLY-EXECUTION-EDITOR-BOUNDARY` | `CONFORMS` | `C04-O15`, `C12-O03`, `C12-O17` | `REFERENCE` | C12  |
| `GW-FR-028-NONDELIVERY-TERMINAL-VIEW` | `CONFORMS` | `C13-O01`, `C13-O05` | `REFERENCE` | C13 |
| `GW-FR-029-NO-IDE-SCOPE` | `CONFORMS` | `C04-O15` | `REFERENCE` | C02 |
| `GW-FR-060-PROJECT-LOCAL-WORKITEM-DOCUMENTATION` | `CONFORMS` | `C04-O04` | `REFERENCE` | C04 |
| `GW-FR-061-DETERMINISTIC-WORKITEM-DOCUMENT-LAYOUT` | `CONFORMS` | `C04-O04`, `C04-O05` | `REFERENCE` | C04 |
| `GW-FR-062-EXPLICIT-DOCUMENTATION-GIT-SAVE` | `CONFORMS` | `C04-O08`, `C04-O10`, `C04-O13` | `REFERENCE` | C04 |
| `GW-FR-063-DOCUMENTATION-GIT-STATUS` | `CONFORMS` | `C04-O09` | `REFERENCE` | C04 |
| `GW-FR-065-EXACT-SOURCE-MARKDOWN-EDITOR` | `CONFORMS` | `C04-O02`, `C04-O15` | `REFERENCE` | C04 |
| `GW-FR-066-DOCUMENT-EDIT-PREVIEW-MODES` | `CONFORMS` | `DIRECT-FR066` | `REFERENCE` | C04 |
| `GW-FR-067-MARKDOWN-AUTHORING-ERGONOMICS` | `CONFORMS` | `C18-O11`, `DIRECT-FR067` | `REFERENCE` | C04 |
| `GW-FR-068-LIVE-SAFE-MARKDOWN-PREVIEW` | `CONFORMS` | `DIRECT-FR068` | `REFERENCE` | C04 |
| `GW-FR-069-EDITOR-STATE-CONTINUITY` | `CONFORMS` | `C05-O07`, `C18-O04`, `C18-O11` | `REFERENCE` | C04 |
| `GW-FR-070-REPOSITORY-LIFECYCLE-DRAFT-REDISCOVERY` | `CONFORMS` | `C04-O05` | `REFERENCE` | C03 |
| `GW-FR-071-DOCUMENTATION-GIT-ELIGIBILITY` | `CONFORMS` | `C04-O12`, `C04-O13` | `REFERENCE` | C04 |
| `GW-FR-072-REPOSITORY-LOCAL-GIT-IDENTITY` | `CONFORMS` | `C04-O12` | `REFERENCE` | C03 |
| `GW-FR-073-OPENCODE-ACCOUNT-VISIBILITY` | `CONFORMS` | `C16-O06` | `REFERENCE` | C16 |
| `GW-FR-074-OPENCODE-SAVED-ACCOUNT-SWITCHING` | `CONFORMS` | `C16-O06` | `REFERENCE` | C16 |
| `GW-FR-075-OPENCODE-ACCOUNT-LOGIN` | `CONFORMS` | `C16-O06` | `REFERENCE` | C16 |
| `GW-FR-076-OPENCODE-ACCOUNT-MUTATION-SAFETY` | `CONFORMS` | `C16-O07` | `REFERENCE` | C16 |
| `GW-FR-077-DIRECT-WORKITEM-TITLE-EDIT` | `CONFORMS` | `C04-O03` | `REFERENCE` | C04 |
| `GW-FR-078-PORTABLE-WORKITEM-ARCHIVE` | `CONFORMS` | `C03-O06`, `C03-O08` | `REFERENCE` | C03 |
| `GW-FR-079-PRODUCTIVE-INSTALLATION-READINESS` | `MIXED` | `C16-O09`, `C16-O10`, `C16-F04` | `DELTA` | C16 |
| `GW-FR-080-CONFIGURATION-CONTINUITY` | `CONFORMS` | `DIRECT-FR080` | `REFERENCE` | C16 |
| `GW-FR-081-OPENCODE-ACCOUNT-CONTINUITY` | `CONFORMS` | `C16-O06`, `DIRECT-FR081` | `REFERENCE` | C16 |
| `GW-FR-082-REPOSITORY-AND-DOCUMENT-CONTINUITY` | `CONFORMS` | `C16-O04`, `DIRECT-FR082` | `REFERENCE` | C16 |
| `GW-FR-087-WORKITEM-AUTHORING-OWNERSHIP` | `CONFORMS` | `C02-O07`, `C02-O08` | `REFERENCE` | C02 |
| `GW-FR-088-WORKITEM-METADATA-PRESERVATION` | `CONFORMS` | `C04-O02`, `C04-O03` | `REFERENCE` | C04 |
| `GW-FR-089-HUMAN-FIRST-WORKITEM-SOURCE-EDITOR` | `CONFORMS` | `C04-O02`, `C04-O15` | `REFERENCE` | C04 |
| `GW-FR-090-WORKITEM-BODY-CONFLICT-SAFETY` | `CONFORMS` | `C04-O03` | `REFERENCE` | C04 |
| `GW-FR-091-FIRST-CLASS-INSTALLATION-CONFIGURATION` | `CONFORMS` | `C16-O01`, `C16-O06`, `C16-O08`, `C16-O09` | `REFERENCE` | C16 |
| `GW-FR-092-CONNECTED-REPOSITORY-CONFIGURATION` | `CONFORMS` | `C16-O02`, `C16-O03` | `REFERENCE` | C16 |
| `GW-FR-093-DOCUMENT-ROOT-MIGRATION-SAFETY` | `CONFORMS` | `C16-O04` | `REFERENCE` | C16 |
| `GW-FR-095-CENTRALIZED-APPLICATION-SETTINGS` | `CONFORMS` | `C16-O01`, `C16-O02`, `C16-O06`, `C16-O08`, `DIRECT-FR095` | `REFERENCE` | C16  |
| `GW-FR-096-LIFECYCLE-AUTHORITY-DISPOSITION` | `CONFORMS` | `C07-O04` | `REFERENCE` | C07 |
| `GW-FR-097-STAGE-CONFORMANCE-OUTPUT-CLOSURE` | `CONFORMS` | `C06-O14`, `C07-O07`, `C08-O09`, `C09-O09`, `C10-O03` | `REFERENCE` | C20 |
| `GW-FR-098-READINESS-AUTHORITY-TOPOLOGY-REVIEW` | `CONFORMS` | `C10-O01`, `C10-O09`, `C10-O10` | `REFERENCE` | C10 |
| `GW-FR-099-PRODUCTIVE-PROVIDER-WORKSPACE-CONTAINMENT` | `CONFORMS` | `C15-O02`, `C15-O08`, `C15-O15`, `DIRECT-FR099` | `REFERENCE` | C15  |
| `GW-FR-100-COMPLETE-REPOSITORY-INSTRUCTION-CLOSURE` | `CONFORMS` | `C22-O09` | `REFERENCE` | C22 |
| `GW-FR-101-PRODUCTIVE-OPENCODE-PATH-CONSISTENCY` | `CONFORMS` | `C15-O03`, `C15-O04`, `C15-O08` | `REFERENCE` | C15 |
| `GW-FR-102-FAILURE-ORIGIN-CLASSIFICATION` | `CONFORMS` | `C15-O12`, `C15-O13` | `REFERENCE` | C15 |
| `GW-FR-103-OPENCODE-INTEGRATION-CERTIFICATION-COVERAGE` | `VERIFICATION_GAP` | `DIRECT-FR103`, `C20-F04` | `REFERENCE` | C20 |
| `GW-FR-104-STAGE-WORKSPACE-FRESHNESS` | `CONFORMS` | `C15-O03`, `C15-O04` | `REFERENCE` | C15 |
| `GW-FR-105-PRODUCTIVE-MODEL-CONTEXT-AUTHORITY-CLOSURE` | `CONFORMS_WITH_DEPENDENCY` | `C22-O06`, `C22-O09`, `C22-O10`, `C15-O15` | `REFERENCE` | C22 |
| `GW-FR-200-CANONICAL-WORKFLOW-OBSERVATION` | `MIXED` | `C05-O05`, `C05-O06`, `C05-O11` | `REFERENCE` | C05 |
| `GW-FR-201-OBSERVATIONAL-READS` | `CONFORMS` | `C05-O03`, `C05-O09` | `REFERENCE` | C05 |
| `GW-FR-202-ATOMIC-COMMAND-OUTCOME` | `CONFORMS` | `C17-O04`, `C17-O08` | `REFERENCE` | C17 |
| `GW-FR-203-SERIALIZED-RUN-TURNS` | `CONFORMS` | `C15-O05` | `REFERENCE` | C15 |
| `GW-FR-204-EXACT-HUMAN-INPUT-OWNERSHIP` | `CONFORMS` | `C06-O09` | `REFERENCE` | C06 |
| `GW-FR-205-MONOTONIC-REACH-HISTORY` | `CONFORMS` | `C01-O10` | `REFERENCE` | C01 |
| `GW-FR-206-CURRENT-ATTENTION-PRECEDENCE` | `VIOLATES` | `C17-O05` | `REFERENCE` | C17 |
| `GW-FR-207-PROPOSAL-AUTHORITY-BOUNDARY` | `CONFORMS` | `C14-O05`, `C14-O06` | `REFERENCE` | C14 |
| `GW-FR-208-ACTIVE-RUN-AUTHORITY-EXCLUSION` | `CONFORMS` | `C14-O09`, `C05-O09` | `REFERENCE` | C14 |
| `GW-FR-209-SOURCE-BLOCKER-ADMISSION` | `CONFORMS` | `C03-O04`, `C04-O14` | `REFERENCE` | C04 |
| `GW-FR-210-ASYNC-WORKFLOW-CONVERGENCE` | `CONFORMS` | `C17-O07` | `REFERENCE` | C17 |
| `GW-FR-211-READINESS-RETURN-CONTINUITY` | `CONFORMS` | `C10-O04`, `C01-O10` | `REFERENCE` | C10 |
| `GW-FR-212-APPROVAL-PURITY-AND-CURRENTNESS` | `CONFORMS` | `C11-O02`, `C11-O03`, `C11-O10`, `C11-O11` | `REFERENCE` | C11 |
| `GW-FR-213-EXECUTION-BLOCKER-PRECEDENCE` | `CONFORMS` | `C12-O17`, `C17-O10` | `REFERENCE` | C12 |
| `GW-FR-214-STABLE-WORKBENCH-GEOMETRY` | `CONFORMS` | `C05-O08` | `REFERENCE` | C05 |
| `GW-FR-215-STABLE-WORKFLOW-RAIL` | `CONFORMS` | `C05-O01`, `C05-O08` | `REFERENCE` | C05 |
| `GW-FR-216-NO-CONDITIONAL-PRESIGNOFF-RAIL` | `CONFORMS` | `C05-O08` | `REFERENCE` | C05 |
| `GW-FR-217-PRIMARY-INFORMATION-ECONOMY` | `MIXED` | `C05-O10`, `C05-O12`, `C19-O03` | `REFERENCE` | C05 |
| `GW-FR-218-SPACE-CLASS-CONSISTENCY` | `CONFORMS` | `C05-O12`, `C19-O04` | `REFERENCE` | C05 |
| `GW-FR-219-EXPLICIT-CONTEXT` | `CONFORMS` | `C05-O04` | `REFERENCE` | C05 |
| `GW-FR-220-PRESIGNOFF-CONTINUITY` | `MIXED` | `C05-O05`, `C05-O06`, `C05-O12` | `REFERENCE` | C05 |
| `GW-FR-221-READINESS-REVIEW-HIERARCHY` | `VIOLATES` | `C10-O06`, `C10-O07` | `REFERENCE` | C10 |
| `GW-FR-222-APPROVAL-REVIEW-HIERARCHY` | `MIXED` | `C11-O06`, `C11-O07` | `REFERENCE` | C11 |
| `GW-FR-223-IMPLEMENTATION-MASTER-DETAIL` | `CONFORMS` | `C12-O17` | `REFERENCE` | C12 |
| `GW-FR-224-TERMINAL-RESULT-PRIMACY` | `CONFORMS` | `C13-O04` | `REFERENCE` | C13 |
| `GW-FR-225-RESPONSIVE-SEMANTIC-CONTINUITY` | `CONFORMS` | `C18-O01`, `C18-O04` | `REFERENCE` | C18 |
| `GW-FR-226-WORKFLOW-CRITICAL-FEEDBACK` | `CONFORMS` | `C17-O08` | `REFERENCE` | C17 |
| `GW-FR-227-CERTIFICATION-MATRIX` | `VERIFICATION_GAP` | `C20-O12` | `REFERENCE` | C20 |
| `GW-FR-228-FUNCTIONAL-STATE-TRANSITION-CLOSURE` | `CONFORMS` | `C01-O05` | `REFERENCE` | C01 |
| `GW-FR-229-PROVIDER-TURN-CONTROL-EXCLUSIVITY` | `CONFORMS` | `C15-O05`, `C15-O07`, `C15-O11` | `REFERENCE` | C15 |
| `GW-FR-230-CLOSED-WORKBENCH-INTERACTION-GRAMMAR` | `CONFORMS` | `C05-O08`, `C05-O12`, `C19-O01` | `REFERENCE` | C05 |
| `GW-FR-231-CANONICAL-WORKBENCH-VISUAL-LANGUAGE` | `MIXED` | `C19-O01`, `C19-O03`, `C19-O04`, `C19-O07`, `C19-O09`, `C19-O10`, `C19-O12` | `REFERENCE` | C19 |
| `GW-FR-232-CLOSED-WORKFLOW-STATE-LANGUAGE` | `CONFORMS` | `C01-O03`, `C01-O11` | `REFERENCE` | C01 |
| `GW-FR-233-CANONICAL-WORKFLOW-RAIL-PROJECTION` | `CONFORMS` | `C05-O01`, `C05-O02` | `REFERENCE` | C05 |
| `GW-FR-234-UNIFIED-WORKBENCH-COMPONENT-PRESENTATION` | `CONFORMS_WITH_VERIFICATION_GAP` | `C19-O04`, `C19-O10`, `C19-O11`, `C19-O12` | `REFERENCE` | C19 |
| `GW-FR-235-GLOBAL-THEME-PARITY` | `CONFORMS_WITH_VERIFICATION_GAP` | `C19-O06`, `C19-O08`, `C19-O11`, `C20-O12` | `REFERENCE` | C19 |
| `GW-FR-236-WORK-TYPE-AWARE-TASK-INFORMATION` | `CONFORMS_WITH_VERIFICATION_GAP` | `C06-O03`, `C06-O04`, `C06-O05`, `C06-O06`, `C20-O07` | `REFERENCE` | C05 |
| `GW-FR-237-BOUNDED-AGENT-ACTIVITY` | `CONFORMS` | `C15-O09`, `C15-O10` | `REFERENCE` | C15 |
| `GW-FR-238-PROPOSAL-CANCEL-CLOSURE` | `CONFORMS` | `C14-O05`, `C14-O06` | `REFERENCE` | C14 |
| `GW-FR-239-TASK-SCOPED-MANUAL-IMPLEMENTATION` | `CONFORMS` | `C12-O16` | `REFERENCE` | C12 |
| `GW-FR-240-REJECTED-PROVIDER-RESULT-FAILURE` | `CONFORMS` | `C15-O01`, `C15-O07`, `C15-O12` | `REFERENCE` | C15 |
| `GW-FR-241-DERIVED-MATERIAL-MATURITY` | `CONFORMS` | `C14-O03`, `C14-O04` | `REFERENCE` | C14 |
| `GW-FR-242-DIALOGUE-REPLY-CONTEXT` | `CONFORMS` | `C14-O08`, `DIRECT-FR242` | `REFERENCE` | C14 |

Cardinality: **112 / 112**, missing **0**, duplicate **0**. Every row resolves to the current `research.md` G-F10 evidence ledger.

R2 consequence rule: a `REFERENCE` row with R1 `VIOLATES`, `MIXED`, `VERIFICATION_GAP` or dependency/certification qualification retains the canonical functional behavior unchanged and requires downstream DESIGN to dispose only the exact evidenced realization/verification gap. It does not authorize a concern-wide implementation delta.

## G-F12 complete functional design reconstruction

This section is the mandatory package-level functional projection required by campaign §4.3. It does not replace the permanent P2/P3 owners named in the disposition ledger. It states the complete 0.6.0 consequence of those owners so DESIGN and implementation do not have to recover product behavior from current code, tests, historical UI, or scattered authority prose.

The functional model is singular: work kind changes the meaning and required information of the task; workflow step changes the decision being made and current governed material; interaction/current-attention/material state changes what owns the operator's current action; responsive class changes composition only, never semantics; and OpenCode remains a productive interaction channel inside the lifecycle stage rather than another lifecycle, authority store or UI model.

### Functional work-kind × workflow-step contract

| Work kind | Workflow step | Required task information | Primary / supporting / technical hierarchy | Current interaction and valid actions | Failure, recovery and terminal behavior | Downstream functional consequence |
|---|---|---|---|---|---|---|
| CHANGE | Work request | requested outcome; current context; known constraints/non-goals; relevant references/evidence; selected Project, Change type and zero-or-more Concerns | Primary: human-authored source Markdown and semantic field labels. Supporting: project/concern choices, current repository path and source diagnostics. Technical: schema pin, IDs, hashes and format metadata. | Operator edits/saves/cancels the source. Start Research is available only when source/project readiness permits it. | Invalid/stale/conflicting source blocks Research and exposes its owner; no partial WorkItem is admitted. | Current source is the originating intent for Change R1 and remains supporting context downstream. |
| DEFECT | Work request | observed behavior; expected behavior; reproduction/evidence if known; behavior that must remain unchanged; impact/context; selected Project, Defect type and Concerns | Same hierarchy as Change, with defect evidence/preservation information primary. | Same source authoring grammar; Start Research only when eligible. | Same source blocker/recovery law. | Current source becomes the factual defect/root-cause investigation input and preservation intent for downstream delivery. |
| INVESTIGATION | Work request | question to answer; why it matters; known evidence/context; investigation boundary | Same source hierarchy; question/boundary are primary. | Same source authoring grammar; Start Research only when eligible. | Same source blocker/recovery law. | R1 must produce an evidence-backed investigation result; successful investigation does not create delivery stages. |
| AUDIT | Work request | target under audit; governing authority/criteria; scope/exclusions; requested evidence/verdict | Same source hierarchy; target/criteria/scope are primary. | Same source authoring grammar; Start Research only when eligible. | Same source blocker/recovery law. | R1 must produce an evidence-backed audit result; successful audit does not create delivery stages. |
| CHANGE | Research | current state/absence; evidence; governing authority; affected producer→consumer path; downstream invariants; unresolved facts; factual verdict | Primary while current interaction owns attention: current dialogue/question/proposal blocker. Otherwise current Research document. Supporting: Work request, prior attempt/history/evidence. Technical: Run/session/context identities. | Productive Research may inspect evidence, report bounded activity, ask exact human questions, receive information/evidence, or propose/adopt the governed R1 artifact. | Provider rejection/failure/blocker remains owned by Research; unresolved facts retain R1. Authority-changing human decisions are not made durable by chat alone. | CONFIRMED may progress to R2. DISPROVEN, DUPLICATE and ALREADY_SATISFIED are terminal. |
| DEFECT | Research | observed symptom/reproduction; proven root cause; producer→carrier→consumer path; downstream effects/invariants; governing authority; unresolved facts; factual verdict | Same Research hierarchy; root cause/reproduction/preservation evidence are primary. | Same Research interaction grammar. | Same failure/input/durable-authority law. | CONFIRMED may progress to R2 only after factual/root-cause closure; terminal outcomes remain valid when the defect is disproven/duplicate/already satisfied. |
| INVESTIGATION | Research | question; evidence for and against; findings; unresolved questions; conclusion | Same Research hierarchy, with investigation conclusion primary once current. | Same bounded dialogue/evidence interaction. | NEEDS_DECISION/BLOCKED retain R1; provider failure does not fabricate a conclusion. | INVESTIGATION_COMPLETE, DUPLICATE and ALREADY_SATISFIED go directly to COMPLETE. A remediation need creates a separate linked Change/Defect. |
| AUDIT | Research | target/criteria; evidence by criterion; findings; verdict | Same Research hierarchy, with criterion-based evidence/verdict primary. | Same bounded dialogue/evidence interaction. | NEEDS_DECISION/BLOCKED retain R1; provider failure does not fabricate a verdict. | AUDIT_COMPLETE, DUPLICATE and ALREADY_SATISFIED go directly to COMPLETE. Remediation is separate governed work. |
| CHANGE | Requirements | P2 intent + R1 factual basis; authority-disposition consequences; required observable outcome/delta; acceptance; scope/exclusions; failure/negative behavior; material constraints; open product/authority questions | Primary: current Requirements material and any current input/proposal. Supporting: Research + Work request. Technical: artifact/run identity. | Operator may interact with the current Requirements attempt, review/adopt its governed artifact, or directly edit/save the current lifecycle Markdown when no active Run owns mutation. | Missing product intent or unresolved authority contradiction blocks; it is never inferred by the agent. Permanent P2/P3 amendments require governed proposal/adoption at the existing owner. | Functionally closed Requirements become the only product-behavior input to DESIGN. |
| DEFECT | Requirements | proven defect/root cause; authority disposition; expected corrected behavior; behavior that must remain unchanged; acceptance proving original defect; regression/preservation acceptance; scope/exclusions; open questions | Same shared Requirements grammar; corrected + preserved behavior are primary. | Same interaction/adoption/editing law. | Missing corrected/preservation semantics blocks; no implementation choice may redefine them. | DESIGN must solve the proven root cause while preserving the explicit unchanged/regression obligations. |
| INVESTIGATION / AUDIT | Requirements | not applicable after successful R1 terminalization | No unreached productive Requirements material is presented as empty authority. | No Start Requirements action is admitted. | Any later delivery work is a separate Change/Defect WorkItem. | None on the terminal WorkItem. |
| CHANGE | Solution design | complete technical-solution decision material needed to realize the Change requirements: requirement→solution mapping, owner/boundaries, reuse/replacement/new concepts, architecture/contracts/state/data-flow consequences, rationale/alternatives, compatibility/failure/validation obligations | Primary: current Solution design document/current interaction. Supporting: Requirements, Research, Work request. Technical: artifact/run identity. | Same pre-signoff dialogue/document/proposal interaction grammar. | Missing product requirement returns upstream rather than being invented. Permanent P4-P6 amendment must target the existing canonical owner through governed proposal/adoption. | Functionally, the Design stage must leave no material architecture decision for PLAN/implementation while preserving R2 behavior. |
| DEFECT | Solution design | root cause/producer boundary; requirement→solution map; correction at canonical owner; reuse plus behavior to delete/replace; rejected alternatives; preserved invariants/downstream consumers; minimum remediation; failure/regression-validation obligations | Same shared Design grammar; root-cause correction + preservation are primary. | Same interaction/adoption law. | A solution that only masks the symptom or weakens preservation/acceptance returns to R2/DESIGN ownership. | PLAN receives a root-cause correction with explicit preservation/regression consequences. |
| INVESTIGATION / AUDIT | Solution design | not applicable after successful terminal R1 | No productive DESIGN surface exists for the terminal WorkItem. | No Start Design action. | Remediation is separate work. | None. |
| CHANGE | Implementation plan | exact tasks/dependencies/objectives; requirement/design traceability; module/decomposition/checkpoints; expected production + test/validation surface; required deletion/replacement; completion evidence; minimum-change forecast; verification contract; one canonical signed task block | Primary: current Plan document/current interaction and exact task meaning. Supporting: DESIGN then R2. Technical: task/artifact identity. | Same pre-signoff dialogue/document/proposal grammar. | Implementation-required plan cannot be materially empty or delegate P1-P6 choices. Change-surface forecast cannot become a semantic authorization substitute. | Current complete PLAN becomes the execution proposal that R3 challenges; no implementation is authorized yet. |
| DEFECT | Implementation plan | root-cause remediation tasks plus all shared planning information; reproduction/regression/preservation verification must be explicit | Same shared Plan grammar with remediation + proof obligations primary. | Same interaction/adoption law. | Plan that omits original-defect reproduction or preservation proof is incomplete. | R3 receives an exact remediation/verification package. |
| INVESTIGATION / AUDIT | Implementation plan | not applicable | No productive PLAN surface. | No Start Plan action. | Separate remediation if required. | None. |
| CHANGE / DEFECT | Readiness review | canonical R3 verdict/current readiness; findings and exact defective owner; package material needed to understand verdict; evidence; attempt history | Primary: verdict + findings/defective owner. Supporting: package material/evidence/history. Technical: package/artifact/run identity. | Read-only Review by default. Exact REQUIRED_INPUT may temporarily own current action without turning Readiness into generic chat. | Return outcome routes to exact owning R1/R2/DESIGN/PLAN stage; blocker remains R3-owned until resolved. READY_FOR_SIGNOFF alone does not sign or execute. | READY permits Approval/sign-off review of the exact current package. |
| CHANGE / DEFECT | Approval | package currentness + canonical readiness; signed task meaning/scope/gates; governed documents required for judgment; meaningful approver identity; exact sign-off action | Primary: readiness/currentness and task meaning. Supporting: governed package documents. Technical: hashes/commit/package identity collapsed/on-demand. | Operator inspects one coherent Review and signs the exact current package only. Historical package/task selection is read-only. | Stale/different package, missing readiness or invalid identity blocks sign-off; no implicit approval. | Exact sign-off materializes immutable execution authority/tasks. |
| CHANGE / DEFECT | Implementation | approved task objective/scope; canonical current task state; current attempt; current blocker/next action; validation state; chronology; evidence/resources | Primary: current execution owner/action + selected task detail. Supporting: task/attempt history/evidence. Technical: IDs, baseline/context/session/change-surface details. | Persistent operational master/detail. Manual action means Start current task only; current blocker/recovery overrides historical selection for attention. | Scope/governance/stale/spec failures route to their canonical owner. Retry/remediation is bounded. Provider/session failure cannot expand authority. | Successful V0-V7 completion yields the minimum verified candidate; discoveries outside authority become new/returned work rather than silent scope expansion. |
| CHANGE / DEFECT | Complete | canonical terminal outcome; verified candidate resources when executed; prior reached history; linked follow-up only where allowed | Primary: final governed outcome. Supporting: reached lifecycle/history and candidate resources/evidence. Technical: identities on demand. | Read-only terminal result. | COMPLETE is terminal; no command mutates its history. | Executed delivery uses Verified candidate under umbrella verified result language. |
| INVESTIGATION / AUDIT | Complete | evidence-backed investigation/audit result and governed R1 result material; optional linked remediation action where permitted | Primary: final governed result/verdict. Supporting: governed result material/evidence + reached history. Technical: artifact identity on demand. | Read-only terminal result; Create linked remediation is a separate authoring action, not continuation of the completed WorkItem. | Terminal WorkItem remains unchanged. Linked remediation is same-project Change/Defect with immutable provenance. | No fake R2/DESIGN/PLAN/R3/Execution history is created. |

### Functional OpenCode / productive interaction contract

For every applicable productive pre-signoff stage, the operator-visible contract is the same even though the stage's information obligation differs:

| Condition | Required functional behavior |
|---|---|
| stage starts | the productive agent receives the current governed work narrative and stage-appropriate authoritative context; the UI does not ask the operator to manually reconstruct context already owned by Order |
| processing | current workflow task remains visible; bounded useful agent activity may be shown as supporting information, never hidden reasoning/raw unbounded provider data |
| substantive message / OPEN continuation | the selected attempt's conversation and reply anchor are visible; free-form reply exists only when there is a legitimate reply-capable interaction |
| REQUIRED_INPUT | the exact current question/category owns the reply action; a new request receives one focus transition and remains reachable despite historical selection |
| INFORMATION / EVIDENCE reply | may continue the stage interaction but does not by itself rewrite canonical source/authority |
| STAGE_CHOICE / AUTHORITY_DECISION / AUTHORITY_CONFLICT | reply may explain operator intent, but durable authority must be updated/adopted through its canonical source/authority owner before progression may rely on it |
| proposal pending/applying | proposal review/disposition is the sole current mutation owner; free-form continuation does not compete with it |
| provider result rejected | none of its requested workflow effects apply; Run fails and WorkItem remains at the same workflow step with an explicit recovery owner |
| provider/process failure | canonical WorkItem state remains authoritative; failure/blocker/retry/reconcile is shown in the owning stage material |
| current attempt vs history | historical attempts remain inspectable, but they never displace the current required input/proposal/blocker/action |
| technical provider identity | account/model/session/context/baseline information remains secondary technical detail unless an active configuration/recovery task requires it |

### Functional material, attention and selection contract

1. Current attention wins without destroying inspection. Required input, proposal decision/adoption, mutation conflict, blocker/failure, active processing/open continuation and current document follow canonical precedence. Historical/current supporting selection remains available, but one compact current-attention affordance remains visible and directly returns to its owner.
2. One current mutation owner. A save, proposal disposition, required-input reply, retry/resume/reconcile, sign-off or execution command is owned by exactly one current material. Duplicate equal-weight actions/feedback are prohibited.
3. Current material is primary. Reached/current stage material dominates. Source/upstream documents, prior attempts and evidence are subordinate and never presented as a flat set of equal authorities.
4. Unreached material is not productive authority. No empty downstream document or action is rendered merely because the lifecycle has a later stage.
5. Document editing and Runs do not race. Source/lifecycle direct editing is unavailable while an active Run owns mutation for that WorkItem/stage; stale-write/freshness consequences remain explicit.
6. Proposal adoption does not skip lifecycle. Adoption changes the governed artifact/authority at its owner; ordinary stage conformance/promotion must still pass.
7. Reads/selection are observational. Inspecting Context, documents, history, evidence or tasks cannot mutate lifecycle state.
8. Async convergence preserves meaning. Polling/terminal drain may refresh the observation but cannot clear a legitimate user selection, lose unsaved editing state, hide new attention, or fabricate success.

### Functional information hierarchy and responsive contract

Across all services, Primary information is what the operator needs to decide or act now: source/task intent, current question/action/blocker, current governed document, readiness verdict, package meaning/currentness, current implementation task or final outcome. Supporting information is necessary context that should not compete with the task: source/upstream documents, prior attempts, evidence, activity, validation history and resources. Technical information is diagnostic identity: IDs, hashes, paths, baselines, provider/session/transport details; it is collapsed/on-demand unless the active task requires the exact value.

The hierarchy is invariant across wide/medium/narrow presentation. Responsive behavior may replace a persistent secondary region with an overlay/drawer or compact selector, but it must preserve the same current task, current attention, action ownership, dirty state, return origin and semantic ordering. System/Light/Dark theme changes appearance only.

### Functional failure / return / terminal closure

The complete functional sequence is Create/Work request → R1 Research → either a valid terminal R1 outcome, Investigation/Audit COMPLETE, or Change/Defect CONFIRMED → R2 Requirements → DESIGN → PLAN → R3 Readiness → exact upstream return/block or READY_FOR_SIGNOFF → Approval → exact sign-off → Implementation → bounded blocker/retry/remediation/upstream return → V0-V7 verified candidate → Complete.

Every return preserves monotonic reached history. A return makes the exact upstream owner current; it does not erase evidence/history or create an alternate lifecycle. COMPLETE is terminal.

### G-F12 functional closure decision

The reconstructed R2 contains the complete applicable functional consequence of the 112/112 permanent P3 requirements and all normative clauses consumed by C01-C22.

- REFERENCE means canonical owner unchanged plus explicit package behavior stated here; it never means read the permanent document and infer the package consequence.
- no new LOCAL functional authority is introduced.
- the already-governed P2/P3 precision corrections remain at their existing permanent owners.
- every R1 factual finding has an explicit functional consequence and downstream owner.
- every applicable work-kind/stage information contract, interaction/current-attention rule, failure/recovery/return path, terminalization rule, responsive hierarchy and acceptance consequence is explicit.
- open product/authority questions: NONE.
- material functional UNPROVEN: 0.
- DESIGN may choose technical realization only within these functional boundaries.

## Post-rendered-evidence functional revalidation

The exact-candidate screenshot audit does **not** introduce new product behavior. It disproves the downstream assumption that the existing browser realization already satisfied the complete Workbench presentation contract. R2 therefore keeps the functional model above unchanged and makes the following downstream consequence explicit:

- every screen must realize the same Primary / Supporting / Technical hierarchy already defined by the work-kind × workflow-step contract;
- Queue/Create/Settings and every lifecycle surface must use one recognizable component/action/form/status/notice/collection language rather than a feature-specific or historical grammar;
- the interaction class is functionally significant: Operational scan, Form/configuration, Document, Dialogue, Review, Operational master/detail, Evidence, Terminal result, Context and Safety/exception must remain distinct and must not collapse into generic cards/forms/panels merely because the underlying controls function;
- the actual user-facing information required by each work kind/stage must be present and legible in the rendered composition; technically correct hidden/collapsed/mis-prioritized information is not functional fulfillment;
- responsive recomposition preserves the same semantic ordering and current-action ownership; it may not rescue an incorrect wide composition by shrinking/wrapping the old layout;
- System/Light/Dark parity means the same hierarchy/component meaning is retained, not merely that theme tokens switch;
- exact-candidate rendered evidence is required to prove these obligations because semantic DOM/component assertions alone cannot demonstrate information hierarchy, density, geometry or visual affordance fidelity.

The functional domains requiring fresh technical realization are exhaustive across the UI surface, even where their underlying domain/state behavior remains valid:

| Functional domain | Preserved functional owner | Required downstream realization consequence |
|---|---|---|
| C02 intake/Create | controlled Project/kind/Concerns + derived metadata | Form/configuration composition must expose those concepts with the intended hierarchy and no legacy/raw metadata grammar. |
| C03 Queue | one active/archive/project/search derivation + explicit diagnostics | Operational-scan composition must keep normal Queue, diagnostics, empty/search/archive states as distinct readable states. |
| C04 source/document Git | exact Markdown/source/Git ownership | Document and confirmation surfaces must retain canonical source primacy and exact-path review without feature-local chrome. |
| C05/C17 workspace/current attention | current attention wins while inspection remains observational | WorkItem shell, rail, selector, Context and material surface must preserve one stable hierarchy across every stage. |
| C06/C07/C08/C09 productive pre-signoff | one Dialogue/Document/Proposal interaction grammar with stage-specific information | Research, Requirements, Solution design and Plan must reuse the same structural grammar while rendering different governed information obligations. |
| C10 Readiness | typed R3 verdict + findings/return owner | Review composition must make the verdict and defect owner dominant. |
| C11 Approval | readiness/currentness + exact package/sign-off | Review composition must keep package judgment primary and technical identity subordinate. |
| C12 Implementation | current task/attempt/blocker/validation/evidence | Operational master/detail must be the stable execution topology. |
| C13 Complete | final governed outcome + valid resources/remediation | Terminal-result composition must make outcome primary and preserve kind-specific terminal behavior. |
| C14 governed materials | documents/proposals/evidence/dialogue remain distinct | Material renderers must retain distinct semantics inside the common Workbench language. |
| C15 provider interaction | bounded session/activity/input/failure | Dialogue/activity presentation must keep provider plumbing secondary except when it owns recovery. |
| C16 Settings | readiness/meaning/action primary; technical identity secondary | Settings must use the same configuration/form language and must not revert to diagnostic/admin-page hierarchy. |
| C18 responsive/accessibility | semantic continuity + safe focus/keyboard | Every primitive/surface must have an explicit wide/medium/narrow and focus contract. |
| C19 component/theme | one Workbench/Astryx language | All recurring structure/visual semantics must be owned by the canonical primitive/theme system; feature-era alternatives are nonconforming. |
| C20 certification | authority-complete proof | Acceptance must include actual rendered screen/state evidence in addition to semantic/browser assertions. |

No R2 product decision is reopened by this evidence. DESIGN is reopened because the technical realization must now implement these already-defined functional obligations instead of preserving the current presentation.


### Semantic-region and primary-composition functional law

The post-G6 audit does not add a new interaction class or product state. It closes ambiguity in the already-governed Workbench grammar:

- current attention answers the canonical “what, if anything, requires human action now?” question; it is not a generic header/top-content region;
- a primary interaction class renders an attention region only when that class and current condition actually own current attention;
- Operational scan, Review, Evidence and Terminal result do not invent an outer attention region merely to host a heading, review currentness/verdict/decision, status, identity or action; Review owns currentness/summary/body/decisions inside `WorkbenchReview`;
- one selected task/material owns exactly one primary interaction composition at a time. Explicit Proposal Review or Evidence replaces the owning material composition until Back restores the recorded origin; neither is wrapped or nested inside another primary Workbench composition;
- Complete is one Terminal-result composition. Its canonical product-facing outcome, substantive result/evidence/resources and permitted remediation action are not duplicated through a second “current attention” presentation;
- architecture/governance/container-taxonomy phrases are not operator-facing copy unless the canonical product-language owner explicitly requires that exact phrase. Product outcome mapping remains the source of terminal labels;
- rendered acceptance cannot classify a visible nonconforming descendant as outside scope merely by assigning the screenshot a parent `SURF-*` identifier. A PASS is valid only when every visible composition required to judge that surface is itself conforming or the evidence isolates the governed region without replacing the real product composition;
- permanent certification must prove allowed renderer→interaction-class composition and prohibited nesting/semantic-slot misuse, not merely that components/text are present.

These obligations apply uniformly to Queue, pre-signoff Proposal Review, Readiness, Approval, WorkItem shell/material routing, Evidence, Complete and every future consumer of the Workbench foundation.

### Screen-replacement functional law

The current screen implementations are **not** preservation targets, compatibility targets, migration templates or information-design baselines. Their only permitted role in the reconstruction is defect evidence showing what must not be carried forward.

For this campaign, a **screen information schema** means the design-time functional mapping from the current R2 contract into:

- required Primary information and its ordering;
- required Supporting information and its relationship to the primary task;
- Technical information and the exact condition under which it becomes visible;
- current action owner and permitted secondary actions;
- empty/loading/processing/input/proposal/blocker/failure/stale/recovery/terminal states that materially change the screen;
- interaction class and responsive semantic order;
- work-kind or lifecycle-stage differences that change information content.

It is **not** a DTO, transport shape, persisted model, browser state object or second semantic owner. Runtime values continue to come from the existing canonical contracts, lifecycle derivations, daemon/API/query owners and approved presentation-policy functions.

The replacement implementation law is destructive:

1. UI primitives and approved non-screen content mechanisms are retained as reusable implementation capability.
2. The old application/screen composition is removed before the replacement screen is authored.
3. No old screen JSX/DOM hierarchy, field grouping, table-column selection, card/panel arrangement, control placement, screen-local CSS, responsive branch or visual hierarchy is presumed correct or copied forward.
4. Replacement screen structure is derived only from the current functional contract, current P4/P5/P6 authority and the reviewed SVG composition where it is not superseded.
5. Existing underlying query/mutation/domain code may be reused only through its canonical owner. Logic embedded only inside an old screen is not automatically reusable; it must be re-derived or extracted only when its non-visual responsibility is independently authorized and contains no screen-composition policy.
6. A replacement is nonconforming if it can be described as the old screen with renamed classes, new wrappers, changed spacing, different tokens or rearranged cards.
7. Every replacement screen must have a fresh screen-information-schema review and rendered comparison before its task may close.

This law intentionally makes the new screen layer incompatible with the old screen grammar. Functional/domain compatibility is preserved below the screen boundary; presentation compatibility is neither required nor desired.

## Required observable outcome/delta

### A01 — C01 product model + C21 product identity

**C01.** Order has one canonical WorkItem lifecycle: IDEA, R1, R2, DESIGN, PLAN, R3, AWAITING_SIGNOFF, EXECUTION and COMPLETE. IMPLEMENT, deterministic/mechanical verification, independent review and bounded remediation are internal execution/validation boundaries under EXECUTION, not extra WorkItem stages. Valid schema-specific R1 terminal outcomes may reach COMPLETE without implementation. Product-level success is a verified terminal result; candidate success is the stricter executed-delivery result. Missing product intent is never inferred by an agent or UI.

**C21.** Ordinary product language uses Order/Pontivus Order, "Ideas in. Results out.", "From idea to verified result.", **verified result** for the umbrella terminal outcome and **verified candidate** only for executed delivery. Public surfaces must not imply every WorkItem executes. They must not describe automatic product/candidate commit/push/merge/deploy as a v1 capability. Explicit operator-triggered Git commits of governed WorkItem documentation remain permitted documentation behavior. Internal lifecycle enums are not ordinary operator-facing outcome copy.

### A02 — C22 project authority + C02 intake

**C22.** Project authority is resolved from the selected project manifest and canonical authority graph before productive stage interpretation. Manifest `authority.p1`–`authority.p6` selection defines the reachable authority set, not an include-everything stage context. The pinned WorkItem schema/template, current stage policy, explicit upstream/signed authority refs and their dependencies determine the applicable material subset: stable refs use the current canonical owner, while an explicit versioned ref uses that exact retained snapshot. A retained historical version must remain resolvable without leaking into current-schema context solely because it shares a selected layer. Same-layer precedence/default/override/extension semantics must have one resolved meaning among simultaneously applicable sources; unresolved material contradiction blocks the owning stage rather than being delegated to the provider. UI/provider state never becomes authority.

**C02.** Ordinary authoring exposes exactly the governed four work kinds and project-owned **Concerns**, not raw concern IDs as the primary language. Current authoring defaults are chosen from the canonical schema catalog while historical pins remain resolvable. Project selection determines the durable repository boundary, so the selected project's resolved repository-relative WorkItem documentation root is default-visible supporting task context before creation; schema/version/internal identifiers remain technical. Linked remediation is fixed to the completed parent WorkItem's project and only creates a new Change/Defect under the allowed lineage; the parent's human meaning/title is ordinary context while its raw WorkItem id remains technical. Human title/body remain the authoring surface; system metadata remains derived/guarded. UI-created and externally authored sources must enter the same functional source/reconciliation contract.

### A03 — C03 queue + C04 source/document Git

**C03.** Queue/search/project semantics are identical whether archived work is excluded or included; including archived rows expands the candidate set and does not replace project/search filtering with another rule. Repository source diagnostics remain explicit and invalid/duplicate/misplaced sources never become partial productive WorkItems. When no valid WorkItem row can exist, the diagnostic's source path is ordinary operator information because it identifies the defective source named by the recovery task; raw diagnostic code, parser/provider mechanics and payload detail remain Diagnostic/Technical. Queue is Operational scan: its heading/controls/table/notice content belong to the scan composition itself and must not be represented as current attention merely to satisfy a generic surface API.

**C04.** The portable Markdown source remains the durable project-local source while Order runtime state owns lifecycle/run/approval/execution state. Source editing is conflict-safe and source-authority changes return/stale downstream work according to canonical lifecycle rules. The selected source/lifecycle document's current repository path is default-visible supporting document identity as required by the Markdown workbench; hashes, schema pins, ArtifactRef ids and commit identity remain technical. Before saving an already-reached upstream source/lifecycle document, the operator is told that the save may return workflow ownership upstream and make downstream material stale/historical; after save, the Workbench orients to the resulting canonical owner. Documentation Git review must make the exact governed path set and each path's Git state directly legible before the operator confirms the commit. No second browser/source metadata authority is created.

### A04 — C05 workspace/current attention + C06 Research/input

**C05.** Workflow-step material, Context, historical inspection and current work remain distinct. Explicit document/history selection may not hide the exact current attention owner: required input, proposal review, blocker, stale/recovery action or other higher-priority attention remains visible and directly reachable without destroying legitimate historical inspection. The selected material has exactly one primary interaction composition. A transient Evidence selection replaces the owning primary material until Back restores the origin; it must not be nested inside a second generic workflow surface. Current-attention presentation is used only when the selected interaction class/current condition actually owns that semantic region.

**C06.** R1 remains factual and may request human input. Ordinary information/evidence may continue the current factual interaction. Input categorized as authority-changing (`STAGE_CHOICE`, `AUTHORITY_DECISION`, `AUTHORITY_CONFLICT` where it changes durable authority) cannot be accepted as chat-only authority; the user must be directed to the governed durable-authority update path or the stage remains blocked until that authority is updated. Conversation is not a shadow authority store.

### A05 — C07 Requirements + C08 Solution design

**C07.** R2 owns required observable behavior, acceptance, scope/exclusions and functional authority dispositions. A permanent P2/P3 `DELTA` is applied to its existing canonical owner through the governed explicit proposal/adoption path; `requirements.md` records the package consequence and never becomes a shadow permanent owner. Missing product intent blocks rather than being invented.

**C08.** DESIGN owns technical decisions and may amend existing P4/P5/P6 canonical owners only through the same governed proposal/adoption model, with target path/layer validated against the resolved authority graph. `solution-design.md` records the package's technical consequence; it is not a second architecture/contract owner.

### A06 — C09 PLAN + C10 R3

**C09.** PLAN carries the complete S8-S10 package contract and exactly one canonical `order-tasks` block. An executable package cannot be vacuous: it must contain at least one materially specified task when implementation is required, and each task must have meaningful identity/objective, justified authority/acceptance/concern ownership, bounded semantic scope/exclusions, an expected physical `changeSurface` forecast and required gates. The forecast must be exact enough to review intended work but must not become a file-list rule that forces duplicate responsibility or forbids the minimum same-layer physical decomposition needed solely to preserve an already-resolved responsibility/effect boundary. Any change to semantic owner, public contract, state meaning, effect boundary, dependency direction/external dependency, validation contract or authorized behavior is not such variance and returns upstream. PLAN may not delegate product/architecture choices to implementation.

**C10.** R3 is read-only adversarial review. Its dominant judgment is the canonical typed R3 outcome (`READY_FOR_SIGNOFF` or the exact return/block result), not document maturity/currentness. It returns defects to the exact owning stage and cannot repair them locally. `READY_FOR_SIGNOFF` requires current coherent authority, complete P1-P7 traceability and successful canonical signed-task mechanical validation. The ordinary Readiness UI is exactly one Review primary composition: verdict/currentness, findings, supporting material and review actions remain inside `WorkbenchReview`; no generic `WorkflowStepFrame -> WorkbenchSurface -> WorkbenchAttention` wrapper is permitted. If required input genuinely changes the primary interaction class, that selected class replaces Review for the duration of the interaction.

### A07 — C11 Approval + C12 Execution

**C11.** Approval is explicit human authorization of one exact current package. Canonical readiness and package currentness are primary review facts before technical identity. A valid approval identity is non-empty human-readable operator identity after semantic normalization; browser validation is feedback, not the invariant owner. Stale/different material cannot be signed. Approval is exactly one Review primary composition: package currentness/readiness, selected task/material judgment and sign-off decision remain inside `WorkbenchReview`; no outer `WorkflowStepFrame`/`WorkbenchSurface`/`WorkbenchAttention` is authorized.

**C12.** EXECUTION materializes only signed tasks and preserves builder/reviewer/remediator separation, bounded repair and independent validation. Signed semantic scope/exclusions remain authoritative; the task's expected `changeSurface` is a reviewed forecast rather than an exhaustive physical whitelist. Execution may admit only the minimum same-layer physical decomposition required to preserve an already-resolved responsibility/effect boundary, and that variance remains subject to semantic review, architecture/governance validation and minimum-change proof. A materially different semantic owner, public contract, state meaning, effect boundary, dependency/external dependency, validation contract or behavior is outside this allowance and returns upstream. If a signed PLAN requires an architecture-feedback checkpoint between architecture-affecting internal steps, Order must provide a governed coordinator-owned way to execute the resolved gate before the builder proceeds; denied ambient provider shell/execute permission is not relaxed to satisfy that obligation.

#### A07 package-local execution-surface consequence

`PL-C12-02` is a package-local trace key, not a new permanent P3 requirement. It preserves the functional consequence exposed by historical `C12-F02`; the current R1 realization now conforms, but the rule remains required by canonical lifecycle/execution authority:

- signed `scope`/`exclusions` bound authorized semantics/repository reach;
- `changeSurface` is the exact expected physical forecast;
- an unforecast path is not automatically authorized, but absence from the forecast alone is not a semantic scope breach;
- the only in-task variance permitted without upstream redesign is the minimum same-layer physical decomposition required to preserve an already-resolved responsibility/effect boundary;
- V4/V5/V6 must positively prove that such variance preserves canonical ownership/contracts/state/dependencies/behavior and is minimum sufficient change;
- any new/changed semantic owner, public contract, state meaning, effect boundary, dependency/external dependency, validation contract or behavior returns to DESIGN/PLAN.

### A08 — C13 Complete + C14 governed materials

**C13.** COMPLETE is terminal. The result surface distinguishes verified candidate from legitimate non-candidate outcomes and keeps linked remediation as a separate governed WorkItem rather than mutating terminal history. Reached history is monotonic. Complete renders one Terminal-result composition: canonical product-facing outcome first, substantive governed result/evidence/resources directly beneath it, and the permitted result action attached to that result. The terminal outcome is not also rendered as a separate current-attention band, and architecture/container labels are not substituted for product copy.

**C14.** Documents, proposals, evidence, dialogue/activity and derived inspection remain distinct material classes with explicit currentness/editability. Durable authority changes occur only through canonical document/proposal/adoption owners; dialogue and activity cannot silently become authority. Evidence is an explicit primary inspection interaction while selected: its identity/bytes/header/action belong to that one Evidence composition and it replaces rather than nests inside the owning Document/Dialogue/Review/Implementation material.

### A09 — C15 provider interaction + C16 Settings

**C15.** OpenCode/provider interaction remains a trusted execution/information channel inside Order's resolved authority and permission boundary. Session continuity, observable activity, exact required input and provider failure are visible without turning provider state into lifecycle authority. Rejected/failed provider actions preserve canonical state and expose the owning recovery path.

**C16.** Productive installation and Settings have distinct responsibilities. Fresh installation is a guided productive bootstrap: before reporting successful installation it must collect the required operator-owned repository, OpenCode-account and model choices inside the installer-owned flow, using existing canonical configuration/provider owners; it must not defer mandatory first-run setup to a separate browser Settings step. Supported update/migration retains valid existing configuration under the canonical continuity rules. An already-installed runtime may enter a non-productive recovery condition if readiness is later lost or an update exposes unresolved configuration; that recovery state does not redefine successful fresh-install completion. After installation, Settings remains operator-first: readiness/attention, meaning and available actions are primary. Each connected-repository entry default-visibly shows project identity, readiness/attention, the exact connected Git root as secondary repository identity, the resolved repository-relative WorkItem-document root and whether it is the current queue/creation context, because `GW-DOC-INSTALLATION-READINESS-V1 §7.2` makes those operator-facing repository facts. Manifest/config hashes, endpoint/API identity, credential identifiers and provider transport mechanics remain Technical/Diagnostic unless an active bounded configuration task requires an exact value.

**C16 authority resolution — `C16-F04`.** R2 explicitly resolves the same-layer P3 contradiction; this is a product decision, not inferred precedence. `GW-FR-007-GUIDED-PRODUCTIVE-BOOTSTRAP` remains unchanged at `GW-DOC-WORK-LIFECYCLE` and continues to own successful fresh-install completion. `GW-DOC-INSTALLATION-READINESS` is amended at §§2/4.2 and `GW-FR-079` so its readiness/recovery semantics apply to already-installed/update/recovery conditions and cannot authorize successful fresh-install completion while required repository, account, model or daemon setup remains. Settings retains post-install management and recovery ownership. No `precedence.p3` entry, second installation state model or alternate setup workflow is introduced. The adopted canonical `GW-DOC-INSTALLATION-READINESS` bytes are blob `9c2ec83a9552b7583f90e91080c014df4d6870df`; those exact bytes remove the P3-to-P3 contradiction before DESIGN revalidation.

### A10 — C17 recovery/current attention + C18 responsive/accessibility

**C17.** Current-attention priority, blockers, stale authority, retry/resume/reconcile and asynchronous convergence are derived from canonical state. The exact current task/action remains visible and reachable even while historical/current supporting material is inspected. Failed mutations do not fabricate success or lose the governing attention state.

**C18.** Wide/medium/narrow presentation preserves semantic hierarchy and actions. Keyboard/focus behavior preserves the operator's place. When a new required human-input request becomes current, focus moves once to the relevant composer for that exact request; polling/re-rendering must not repeatedly steal focus. Dirty-buffer and modal/dialogue behavior remain safe.

### A11 — C19 component/theme + C20 certification

**C19.** The application has one Workbench/Astryx component and theme language. Every production renderer must be classifiable against the canonical renderer-to-primitive ownership matrix; an unclassified renderer is an architecture defect, not permission for a feature-local visual system.

Canonical `GW-DOC-WORKBENCH-UX-V2 §11.4A/§12` now owns the permanent information classes, visual prominence and composition invariants. `GW-DOC-MARKDOWN-WORKBENCH-V1 §17.4` owns the Markdown authoring adjacency/toolbar rule. This R2 does not redefine those policies. Its 0.6.0 package-specific consequence is the following exhaustive surface-family mapping.

The per-family contract is:

| Surface family | Primary/default-visible | Supporting / operational owner | Technical / diagnostic inspection owner | Composition / decision exception |
|---|---|---|---|---|
| Queue / application | actionable WorkItems, human lifecycle/status/outcome meaning, human-readable app-level blocker/recovery, invalid-source path only when required to identify the defective source | Queue search/project/archive controls and scan context | one explicit application diagnostics/inspection owner; raw source diagnostic code/parser payload, WorkItem ids, hashes/schema/internal metadata stay out of Queue | blocking state promotes human meaning + valid action only; no generic Technical-details strip in Queue |
| Create / linked remediation | Project identity, kind, human title, Concerns, linked parent meaning/title and one Create action | resolved repository-relative WorkItem documentation root and bounded derived-field explanation | application/creation technical inspection only if exact parent/schema/internal identity must be inspected | task is one modal with governed header/body/footer; no local Technical-details disclosure in the form body |
| WorkItem shell / rail | WorkItem title/meaning, current lifecycle step, current attention, true WorkItem-level utilities | reached/historical workflow navigation; explicit Context entry | **Context** is the single WorkItem-scoped technical-inspection destination for the selected WorkItem/material/run/task | shell never becomes a technical dashboard; Context never auto-opens or owns current action |
| Work request / documents | governed content and current authoring/reading action; upstream-return/staleness consequence when applicable | semantic material selector/upstream material, maturity/currentness, current repository path, compact Git state | selected-document SHA/schema/ArtifactRef/authority-layer/commit identity in WorkItem Context | editor controls remain adjacent to source/preview canvas; exact changed paths + Git state become Primary only inside explicit Git confirmation |
| Research / Requirements / Design / Plan | current Dialogue, governed Document or Proposal Review according to attention precedence | one material/history selector; bounded activity/timeline and evidence/resource links inside their semantic owners | provider/session/baseline/context identity and raw Run/event tags in WorkItem Context or Evidence, not local technical bars | no separate Supporting material/history strip; raw provider failure promotes human blocker/recovery only |
| Readiness | typed R3 verdict/readiness, findings/defective owner, exact return action | package material/evidence/attempt history through review/material owners | package/artifact technical identity in WorkItem Context | Review does not append a generic Technical-details accordion |
| Approval | readiness/currentness, signed task meaning/scope/gates, approver identity and sign-off | governed documents/task collection/detail needed for judgment | package hash/baseline/commit and approval/task ids in WorkItem Context | sign-off decision remains visually primary; no local Task technical details junk drawer |
| Implementation | current task objective/state/action/blocker, current attempt meaning, current/recorded validation boundary | task master/history, chronology, evidence/resources | task/approval/plan/Run ids, baseline/context/provider session and raw execution diagnostics in WorkItem Context; exact evidence in Evidence | operational disclosure such as a complete validation matrix is allowed only when it expands the same semantic validation task, not as generic technical storage |
| Complete | canonical final governed outcome and valid next action | applicable result evidence/resources and linked-remediation action | internal event tags/role codes/ids/hashes in WorkItem Context/Evidence | no generic local Technical-details surface |
| Evidence / Context | exact evidence identity+bytes when Evidence is intentionally opened; selected-view technical orientation when Context is intentionally opened | related resource metadata only | these are the authorized explicit raw/technical inspection surfaces | neither auto-opens and neither may become sole owner of current blocker/action |
| Settings / account / repository / model | readiness, configuration meaning and productive action; exact values when actively selecting/entering them | inventory/status and default-visible connected repository facts | one explicit Settings diagnostics/technical inspection section for manifest/config hashes, endpoints, account ids and provider mechanics; no per-section Technical-details accordions | Add/Move/model/account configuration may make exact task-required values Primary while that task is active |

**C19 composition consequence.** The 0.6.0 UI must not preserve local `Technical details`, `Task technical details`, `Timeline technical details` or `Supporting material and history` bars as a generic product grammar. A semantically specific expandable control remains legal only where it expands the same operator task (for example a complete validation matrix) and does not become a technical/supporting junk drawer. WorkItem Context must become selection-aware enough to inspect the exact technical identity of the selected document, Run, proposal, approval/task or execution task without duplicating that identity in the productive surface. The same semantic-ownership rule applies to structural slots: an attention slot may carry only genuine current-attention semantics, never a Queue/Review/Evidence heading, Review currentness/decision, or Terminal-result classification. Exactly one primary interaction composition owns the selected material; Proposal Review/Readiness/Approval cannot be wrapped in a second generic workflow surface, and product-visible copy must come from product/presentation policy rather than architecture/governance container terminology.

**C20.** Certification proves the reconstructed authority, not historical behavior. Permanent verification must cover the complete required scenario matrix, including all four WorkItem kinds' Research information contracts and the Change/Defect downstream distinction (scenario 41), plus representative cross-application component/semantic-role parity under System/Light/Dark modes (scenarios 26 and 33-36). It must also satisfy `GW-FR-103` at the actual productive OpenCode process boundary: a fake OpenCode executable may support lower-level deterministic fixtures but cannot by itself prove the exact supported OpenCode process/session contract. Deterministic model simulation is admissible for repeatable integration proof only when the OpenCode process under test is the exact supported pin and the evidence states which external provider/account semantics are intentionally not proved by the simulation. Temporary branch-only scaffolding is not a substitute for retained permanent certification. Green adjacent tests do not imply untested obligations.

For every governed rendered surface/state, certification must additionally prove the C19 information **and composition** contract in both directions: required ordinary information is visible without inspection; Technical/Diagnostic information is absent from the productive surface; the singular authorized Context/technical-inspection or Evidence destination exposes the exact information after explicit entry; returning restores the ordinary hierarchy without losing current task state. Certification also proves **no generic disclosure accumulation, no duplicate material/history owner, editor-control→canvas adjacency, one-row/overflow-before-wrap Markdown toolbar behavior, governed task-dialog header/body/footer anatomy, active-state capture completeness, exactly one primary interaction composition, no nested/wrapped Workbench primary compositions, Review without an outer workflow Surface/Attention frame, and semantic-slot integrity (including attention only where authorized)**. Rendered evidence for a parent SURF row cannot ignore a visibly rendered descendant whose composition is material to the screenshot. Tests that merely assert technical text exists, that a disclosure label/component is present, or that a passive view screenshot exists are insufficient and must not preserve a defective composition.

Certification ownership is phase-local until final integration: an implementation phase may close only the exact `SURF-*` rows and shared-foundation invariants assigned to that phase. A known defect owned by a later phase remains an explicit open obligation and must not be converted into an earlier-phase PASS requirement or repaired through an earlier bounded grant. The complete renderer→interaction-class negative matrix, including direct Review composition and Terminal-result composition, becomes mandatory only at the final IA20/IA26 integration boundary after the owning IA29-IA34 phases have run.

## Acceptance criteria

| Concern | Functional acceptance |
|---|---|
| C01 | Product and lifecycle authority distinguish verified result from verified candidate, valid no-code terminal outcomes and EXECUTION-internal validation boundaries; the stable P2 cross-reference is exact. |
| C02 | Create uses governed work-kind defaults and Concerns, shows the selected project's resolved repository-relative WorkItem documentation root before creation, keeps raw parent/schema identity technical, and applies one functional source/reconciliation contract to created/discovered work. |
| C03 | Project/search filtering has one meaning with or without archived rows; diagnostics remain explicit and identify an otherwise-unmaterializable defective source by path without promoting raw diagnostic code/parser payload. |
| C04 | Source/runtime ownership is singular at the functional level; current document path and pre-Save upstream-return consequence are operator-visible as governed; exact documentation-Git paths plus per-path Git state are reviewed before confirmation. |
| C05 | Historical/supporting inspection cannot hide or make unreachable the exact current attention owner. |
| C06 | Authority-changing human input requires durable authority update/block; ordinary information/evidence may continue interaction. |
| C07 | R2 dispositions are explicit and permanent P2/P3 changes use the canonical proposal/adoption owner. |
| C08 | P4-P6 changes use one validated canonical-owner proposal/adoption path and do not create shadow architecture/contracts. |
| C09 | Implementation-required PLAN is materially non-vacuous, completely specified, has one canonical signed-task representation, treats `changeSurface` as an expected physical forecast inside signed semantic scope, and does not force architecture-breaking file-list conformance. |
| C10 | Dominant Readiness judgment is the canonical R3 outcome and defective packages return to the exact owning stage. |
| C11 | Approval shows readiness + currentness first, accepts only meaningful human identity and signs only the exact current package. |
| C12 | Signed tasks execute under canonical role/validation rules; bounded S9-authorized same-layer physical variance can reach V4-V6 instead of failing solely for absence from the forecast; semantic scope expansion still returns upstream; required in-task architecture checkpoints are executable without ambient provider shell authority. |
| C13 | COMPLETE is terminal and uses canonical verified-result/verified-candidate product language. |
| C14 | Document/proposal/evidence/dialogue/currentness ownership remains explicit with no chat/activity authority shadow. |
| C15 | Provider/session/input/failure behavior remains observable and bounded by Order authority; rejection preserves canonical state. |
| C16 | Fresh installation completes required guided repository/OpenCode-account/model setup before reporting success; supported configuration continuity remains intact; Settings keeps operator readiness/meaning/actions primary, shows the canonical connected-repository root/document-root/current-context facts required by P3, and keeps unrelated technical identity hidden unless task-required. |
| C17 | Canonical current attention/recovery remains visible/reachable through selection, failure and asynchronous convergence. |
| C18 | Responsive/focus/keyboard semantics hold; each new required-input request receives one non-repeating focus transition. |
| C19 | Every production renderer is covered by the canonical primitive ownership rule and one theme/component system; every datum/action on every governed surface has one deterministic Primary/Supporting/Operational/Technical/Diagnostic classification, default visibility and authorized disclosure owner, with raw technical identity hidden from ordinary UX unless the active task requires that exact value. |
| C20 | Permanent certification covers the full kind/stage and representative cross-application theme/semantic-role matrices required by P3, the exact-pin productive OpenCode process/session boundary required by `GW-FR-103`, and negative/positive information/composition proof through phase-local acceptance followed by final IA20/IA26 global closure; an earlier phase cannot require or repair later-owned surfaces merely to make its own proof green. Fake-process fixtures, temporary scaffolding and presence-only UI assertions are insufficient. |
| C21 | Public/product surfaces consistently use verified result/verified candidate and do not overclaim automatic delivery commits or universal execution. |
| C22 | Authority precedence/default/override/extension semantics resolve before provider interpretation and unresolved contradiction blocks. |

## Scope/exclusions

In scope at R2:

- the three permanent-authority precision corrections above;
- exact functional consequences for C01-C22;
- information hierarchy, interaction, state/action/transition/failure/recovery and negative behavior already required by current P2/P3 authority;
- explicit disposition of every fresh R1 finding to R2 resolution or DESIGN ownership.

Out of scope at R2:

- selecting module/file boundaries, algorithms, transport/persistence shapes or provider-control mechanics;
- introducing DTOs, shadow state, alternate lifecycle/task/source/readiness models or feature-local component systems;
- deciding implementation change surfaces or task decomposition;
- treating current code/UI/tests/0.5.0 behavior as a preservation requirement;
- unrelated feature/product expansion.

## Failure/negative behavior

The 0.6.0 functional package is non-conformant if a downstream layer:

- invents missing product intent or treats current implementation as fallback authority;
- creates another WorkItem stage, readiness/source/queue/authority owner or signed-task representation;
- hides current required attention behind an explicit historical/supporting selection;
- accepts an authority-changing decision only as conversational text;
- allows non-canonical P2-P6 mutation without resolved target/layer validation and explicit adoption;
- permits a materially empty executable PLAN package;
- signs stale/different material or whitespace-only approval identity;
- requires a BUILDER to satisfy a signed checkpoint it has no governed capability to execute;
- reports productive installation success while mandatory repository/OpenCode-account/model setup is still deferred to a separate Settings/setup step;
- exposes raw IDs/paths/endpoints/internal enums as primary ordinary operator meaning where authority defines a semantic label/hierarchy;
- weakens required scenario/theme/accessibility certification because adjacent historical tests are green.

## Material compatibility/security/performance constraints

No new compatibility, security or performance policy is introduced.

Existing canonical constraints remain binding: exact-package sign-off/freshness, local-only daemon boundary, pinned/trusted provider integration, project-governance authority, responsive/accessibility requirements, strict typing, FCIS, SoC, DRY/canonical ownership, no-OOP/no-DTO posture and minimum sufficient change.

Historical schema pins and valid historical WorkItems remain resolvable under their pinned semantics. This is canonical version compatibility, not preservation of incidental 0.5.0 behavior or UI composition.

## Open product/authority questions

NONE.

Every fresh R1 finding has an explicit functional disposition. Remaining open work is technical realization/verification owned by DESIGN and then PLAN; no implementation worker is authorized by this R2 artifact.
