<!-- Order 0.6.0 package-local DESIGN component. Permanent information-visibility semantics remain owned by GW-DOC-WORKBENCH-UX-V2. -->

# Order 0.6.0 Workbench surface information contract

## Status and purpose

This artifact is the exhaustive package-local UI information contract for the Order 0.6.0 Workbench reconstruction.

It is a **DESIGN component**, not a new permanent product-policy owner, DTO, view model, browser state model or runtime schema.

Permanent semantics remain owned by:

- `GW-DOC-WORKBENCH-UX-V2`, especially §11.4A, §§12-15 and the closed interaction-class model;
- the applicable WorkItem/document/install/configuration requirements selected by `pontivus-order.toml`;
- `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2` for technical composition/disclosure ownership;
- `GW-DOC-WORKBENCH-THEME-V1` for visual-role realization.

This artifact projects those authorities onto the **complete 37-surface 0.6.0 Workbench universe** so PLAN and implementation do not classify information, choose placement, invent disclosure behavior or infer hierarchy from current code, tests, historical UI or SVG references.

The source inventory is the completed Phase-1 `application-interaction-map.md`: its `SURF-*`, typed-input, state-axis and interaction inventories are evidence of what may be presented or operated. Its historical placement verdicts are **not** authority where later R2/P3/DESIGN corrected them.

The reviewed SVG pack remains derived comparison material only.

## Binding interpretation

For every datum or action that may appear on a governed surface, implementation must be able to point to exactly one row in this artifact or to an explicitly referenced governed-document body whose internal content is rendered as canonical Markdown.

No implementation phase may:

- derive a new information class;
- decide that an exact id/path/hash/session/event field is useful enough to expose ordinarily;
- move a datum to another disclosure owner because the current component makes that convenient;
- promote raw technical or diagnostic representation when its underlying condition owns current attention;
- create a second Context, diagnostics rail, metadata stack or feature-local disclosure system;
- change classification because of viewport, theme, loading density, collection count or historical/current selection;
- treat current JSX/CSS, current tests or a derived SVG as a preservation/placement target.

If an implementation owner encounters an operator-visible datum/action not classified here, or cannot realize a row without changing its meaning, it **returns to DESIGN**. It does not complete the classification locally.

## Closed information classes

| Class | Meaning | Default visibility |
|---|---|---|
| **Primary** | required to understand or perform the current operator task | visible in the owning primary interaction and allowed to dominate |
| **Supporting** | useful to judge/orient the current task but not itself the task | subordinate, selectable or secondary |
| **Operational** | low-frequency operator-facing history/resource/status detail | subordinate and collapsed/selected when persistent display would compete |
| **Technical** | exact implementation/audit identity: ids, hashes, commits, raw paths where a semantic label suffices, provider/session/schema/internal-role identity | hidden by default behind the authorized local **Technical details** or explicit **Context** |
| **Diagnostic** | raw diagnostic codes, raw event tags/payloads, parser/provider mechanics and equivalent implementation-facing failure evidence | absent from ordinary product presentation; explicit technical/Evidence inspection only |

A Technical/Diagnostic cause may own current attention, but only its **human-readable meaning, consequence and valid action** are promoted. Raw code/path/hash/session/payload remains in its technical/evidence owner.

## Closed disclosure owners

Only these progressive-disclosure owners are valid:

1. **Supporting material/history** — operator-facing workflow material/history selection.
2. **Context** — explicitly opened compact WorkItem/material orientation, including appropriate exact identity.
3. **Technical details** — local exact mechanics/identity associated with the current surface.
4. **Evidence** — explicitly selected exact evidence identity and bytes.
5. **Safety/confirmation** — exact target/scope only when required to make the pending decision safely and knowingly.

Primary information may never exist only behind disclosure. Technical/Diagnostic information may never become persistently visible because of responsive recomposition or a current failure.

## Contract fields

Every detailed row below binds:

- **datum/action** — semantic operator concept, not a UI property name;
- **source** — canonical typed fact, pure derivation or governed document;
- **intent** — why the operator needs it;
- **class** — one of the five closed classes;
- **default placement** — its ordinary UI owner;
- **disclosure/promotion** — the only permitted subordinate/technical owner and any promotion exception;
- **negative rule** — what implementation must not render ordinarily.

Local query loading/error/pending states inherit the owning datum/action's semantic surface. They use `WorkbenchState`/`WorkbenchNotice` and never expose raw transport/provider internals.

## Complete surface registry and interaction class

| SURF | Surface | Required interaction class | PLAN owner |
|---|---|---|---|
| `SURF-APP-001` | application shell / toolbar / global attention | application shell + utilities | IA28 |
| `SURF-QUEUE-001` | WorkItem queue | Operational scan | IA28 |
| `SURF-CREATE-001` | Create / linked remediation | Task panel → Form/configuration | IA28 |
| `SURF-SET-001` | Settings frame/readiness/navigation | Settings | IA34 |
| `SURF-SET-REPO-001` | repository/reference-root settings | Settings + Operational scan | IA34 |
| `SURF-SET-REPO-ADD-001` | Add repository | Form/configuration | IA34 |
| `SURF-SET-REPO-MOVE-001` | Move WorkItem documents | Form/configuration | IA34 |
| `SURF-SET-OC-001` | OpenCode accounts | Settings + Operational scan | IA34 |
| `SURF-SET-OC-RENAME-001` | Rename OpenCode account | Form/configuration | IA34 |
| `SURF-SET-OC-ADD-001` | Add OpenCode account | Form/configuration | IA34 |
| `SURF-SET-OC-LOGIN-001` | OpenCode sign-in | Form/configuration / current task | IA34 |
| `SURF-SET-MODEL-001` | model/runtime settings | Settings + Form/configuration | IA34 |
| `SURF-WI-001` | selected WorkItem shell / identity / rail / current attention | Workbench shell + owning material | IA27 |
| `SURF-WI-CONTEXT-001` | explicit technical Context | Compact context | IA33 |
| `SURF-STEP-WR-001` | Work request | Document | IA29 |
| `SURF-STEP-R1-001` | Research | Dialogue / Document / Review by current attention | IA30 |
| `SURF-STEP-R2-001` | Requirements | Dialogue / Document / Review by current attention | IA30 |
| `SURF-STEP-DESIGN-001` | Solution design | Dialogue / Document / Review by current attention | IA30 |
| `SURF-STEP-PLAN-001` | Implementation plan | Dialogue / Document / Review by current attention | IA30 |
| `SURF-STEP-R3-001` | Readiness review | Review | IA31 |
| `SURF-STEP-APPROVAL-001` | Approval | Review | IA31 |
| `SURF-STEP-EXEC-001` | Implementation | Operational master/detail | IA32 |
| `SURF-STEP-COMPLETE-001` | Complete | Terminal result | IA33 |
| `SURF-MAT-SOURCE-001` | Work request source document/editor | Document | IA29 |
| `SURF-MAT-DOC-001` | editable lifecycle document | Document | IA29 |
| `SURF-MAT-DOC-RO-001` | read-only lifecycle/supporting document | Document | IA29 |
| `SURF-MAT-ACTIVITY-001` | STAGE dialogue/activity | Dialogue | IA30 |
| `SURF-MAT-PROPOSAL-001` | proposal review | Review | IA30 |
| `SURF-MAT-EVIDENCE-001` | exact evidence viewer | Evidence | IA33 |
| `SURF-MAT-APPROVAL-TASK-001` | Approval task detail | Review detail | IA31 |
| `SURF-MAT-EXEC-TASK-001` | execution task/attempt detail | Operational detail | IA32 |
| `SURF-CONF-DIRTY-DEST-001` | dirty destination confirmation | Safety/confirmation | IA29 |
| `SURF-CONF-DIRTY-MATERIAL-001` | dirty material confirmation | Safety/confirmation | IA29 |
| `SURF-CONF-ARCHIVE-001` | archive/restore confirmation | Safety/confirmation | IA29 |
| `SURF-CONF-DOC-GIT-001` | documentation-Git confirmation | Safety/confirmation | IA29 |
| `SURF-CONF-REPO-DISCONNECT-001` | repository disconnect confirmation | Safety/confirmation | IA34 |
| `SURF-CONF-OC-REMOVE-001` | OpenCode-account removal confirmation | Safety/confirmation | IA34 |

The registry cardinality is exactly **37**. No implementation phase may add a new rendered surface grammar without DESIGN authority.

---

# Surface contracts

## SURF-APP-001 — application shell / global attention

| Datum/action | Canonical source | Intent | Class | Default placement | Disclosure / promotion | Negative rule |
|---|---|---|---|---|---|---|
| Product identity + current destination meaning | application destination state | orient the operator globally | Primary | application toolbar | none | do not expose route/internal state names |
| Queue search utility | browser-local search | find work while Queue is current | Supporting | toolbar utility on Queue only | none | must not displace WorkItem identity/current action |
| New WorkItem entry | local create action | begin governed authoring | Primary action on Queue | toolbar/action region | opens `SURF-CREATE-001` | not shown as workflow mutation on selected WorkItem |
| Installation readiness human meaning + Settings recovery destination | `InstallationReadiness` | make setup blocker actionable | Primary only while blocking | global notice/current attention | raw blocker mechanics stay Technical; promote meaning + action only | no raw readiness enum/transport detail |
| Source diagnostic human meaning + inspect/recovery action | `WorkItemSourceDiagnostic[]` | explain why productive work is blocked | Primary only while relevant/blocking | global notice/current attention | code/path/parser detail only Technical/Evidence | ordinary notice must not print raw diagnostic code/path |
| Active saved OpenCode account label/readiness utility | `OpenCodeAccountState` | global provider-account orientation and Settings quick access | Supporting | toolbar utility | account id/provider mechanics stay Technical/Settings | no account-management detail in toolbar |
| System/Light/Dark choice | local theme preference | appearance selection | Supporting | toolbar utility | none | theme never changes semantic hierarchy |
| dirty-navigation decision | local dirty/pending destination | protect unsaved work | Primary only when invoked | `SURF-CONF-DIRTY-DEST-001` | exact destination meaning only as needed | no silent discard |

## SURF-QUEUE-001 — WorkItem queue

| Datum/action | Source | Intent | Class | Default placement | Disclosure / promotion | Negative rule |
|---|---|---|---|---|---|---|
| WorkItem title | `WorkItem.title` | scan/select work | Primary | row identity | none | no id substitute |
| work kind | schema catalog → kind | understand task kind | Primary/Supporting scan datum | row metadata | schema id Technical | do not show schema id as ordinary kind |
| project identity | `WorkItem.projectId` | disambiguate work | Supporting | row metadata/filter | exact repo root Technical elsewhere | no repository path |
| human lifecycle stage/status meaning | `WorkItem.stage/status` + presentation policy | understand current state | Primary scan datum | row status | internal enum value not required as raw text | no raw enum/internal code |
| Concerns | `WorkItem.concernIds` mapped to governed concern identity | useful task context/filtering | Supporting | subordinate row metadata | internal representation Technical if different from human label | no UUID-like/internal-only representation |
| archived state | `WorkItem.archived` | distinguish historical work | Supporting | row/state treatment | archive/restore decision uses confirmation | no second archive navigation grammar |
| project/search/archive filters | local filter state over canonical list | control scan set | Supporting/Operational | Queue controls | none | inclusion of archived rows cannot replace project/search semantics |
| open WorkItem | row navigation | inspect selected work | Primary navigation action | row | enters `SURF-WI-001` | no lifecycle mutation |
| source/readiness blocker associated with queue | canonical diagnostics/readiness | explain inability to proceed | Primary only when actionable | human-readable notice | raw code/path in Technical/Evidence | no diagnostic dump in queue |

## SURF-CREATE-001 — Create / linked remediation

| Datum/action | Source | Intent | Class | Default placement | Disclosure / promotion | Negative rule |
|---|---|---|---|---|---|---|
| Project identity | project manifest | choose governing project | Primary | form field; fixed semantic label for linked remediation | repository root remains Technical | no persistent repo root |
| work kind | schema catalog | choose Change/Defect/Investigation/Audit; linked remediation limited to Change/Defect | Primary | form field | schema id/version Technical | no schema id as primary label |
| title | local authoring state | human task identity | Primary | form field | none | no generated technical identity substitute |
| Concerns | project concern catalog | classify governed concern set | Primary | form control | underlying ids not shown when human names exist | no raw ids as ordinary labels |
| linked parent meaning/title | completed parent WorkItem | explain remediation lineage | Primary/supporting | fixed linked-remediation context | parent WorkItem id Technical | no persistent raw parent id |
| derived/fixed-field explanation | governing lineage/project rules | explain non-editable choices | Supporting | form help | none | must not compete with form task |
| Create | validated form state | create one governed source-backed WorkItem | Primary action | action region | failure shown as owning notice | no duplicate create command |
| repository documentation root / schema/version/internal metadata | manifest/catalog/internal state | exact implementation identity | Technical | Technical details only if legitimate inspection is needed | never promoted merely for creation | must be absent from ordinary form |

## SURF-SET-001 — Settings frame/readiness/navigation

| Datum/action | Source | Intent | Class | Default placement | Disclosure / promotion | Negative rule |
|---|---|---|---|---|---|---|
| installation readiness meaning | `InstallationReadiness` | show whether installation is productive and where action is required | Primary | Settings summary/notice | blocker mechanics Technical; human blocker action may dominate | no raw blocker code |
| Settings sections | local destination | navigate repositories/accounts/model configuration | Supporting navigation | `WorkbenchSettingsLayout` | none | no second app sidebar grammar |
| blocker destination/action | blocker→section policy | take operator to owning configuration task | Primary when blocked | readiness region | none | no dead-end blocker |
| exact config hashes/internal transport state | config/query mechanics | optimistic/concurrency identity | Technical | Technical details only | never ordinary readiness content | no raw SHA/status dump |

## SURF-SET-REPO-001 — repositories/reference roots

| Datum/action | Source | Intent | Class | Default placement | Disclosure / promotion | Negative rule |
|---|---|---|---|---|---|---|
| connected project/repository semantic identity | `ConnectedRepositoryState.projectId` + repository record | identify configured repository | Primary | repository row | exact filesystem root Technical except active task | do not make raw root the only row identity |
| readiness/attention meaning | `status/attention[]` mapped to product language | show required repository action | Primary when actionable; otherwise Supporting | row status/notice | raw codes/details Technical | no raw enum |
| WorkItem-document configuration meaning | repository config | show where governed documents live | Supporting | row/config summary | exact root Technical until Move task | no persistent full path where semantic label suffices |
| reference-root configuration | `config.referenceRoots` | configure productive context sources | Primary while editing | bounded configuration region | exact values are primary because this is the active configuration task | not repeated as general metadata |
| Add repository | local task action | connect repository | Primary configuration action | task entry | opens `SURF-SET-REPO-ADD-001` | no inline second form grammar |
| Move documents | repository action | relocate WorkItem document root safely | Primary task action for selected repository | task entry | opens `SURF-SET-REPO-MOVE-001` | no silent move |
| Disconnect | repository action | remove connected repository | Destructive action | row action | `SURF-CONF-REPO-DISCONNECT-001` | no immediate destructive mutation |
| repositoryRoot/workItemsRoot/manifestSha256/config sha | settings/config records | exact identity/concurrency mechanics | Technical outside active Add/Move/reference-root task | Technical details | exact root becomes Primary only when the active configuration input/confirmation requires it | no ordinary metadata wall |

## SURF-SET-REPO-ADD-001 — Add repository

| Datum/action | Source | Intent | Class | Placement | Rule |
|---|---|---|---|---|---|
| Git repository root input | local form | specify repository to connect | Primary | form field | exact path is task-required and therefore legitimately Primary here |
| project/readiness result or validation failure | repository admission result | explain whether connection can proceed | Primary | form notice | show human meaning; raw parser/internal codes Technical |
| Connect | validated form | perform connection | Primary action | action region | expected config identity remains hidden mechanics |
| Cancel | local | abandon bounded task | Secondary action | action region | no mutation |

## SURF-SET-REPO-MOVE-001 — Move WorkItem documents

| Datum/action | Source | Intent | Class | Placement | Rule |
|---|---|---|---|---|---|
| target repository/project semantic identity | selected repository | identify affected configuration | Primary | task header | exact current root may be shown because path-specific mutation is being configured |
| current/new document root | repository config + local input | define exact migration | Primary | form | exact paths are decision-required |
| migration consequence/preservation meaning | canonical migration contract | explain effect | Primary/Supporting | task body | no implementation-internal transport detail |
| Move/Cancel | mutation/local | commit or abandon task | Primary/Secondary actions | action region | failure shown in owning task |

## SURF-SET-OC-001 — saved OpenCode accounts

| Datum/action | Source | Intent | Class | Default placement | Disclosure / promotion |
|---|---|---|---|---|---|
| saved account label | account state | identify account | Primary | account row | exact account id Technical |
| active/authentication human state | discriminated account status mapped to product language | understand readiness | Primary/Supporting | row status | raw provider/status internals Technical |
| needs-auth human instruction/action | account status | restore productive account | Primary when actionable | row/notice | raw provider mechanics remain Technical |
| mutation blocker human meaning | mutation blockers | explain why account mutation is unsafe | Primary when blocking | Settings notice | raw Run/provider identity Technical |
| Activate/Rename/Remove/Add | account commands | manage saved account | task actions | row/section | Rename/Add bounded tasks; Remove confirmation |
| provider/account ids/transport mechanics | account/provider records | exact integration identity | Technical | Technical details | absent ordinarily |

## SURF-SET-OC-RENAME-001 — Rename OpenCode account

| Datum/action | Source | Intent | Class | Placement | Rule |
|---|---|---|---|---|---|
| current human label | selected account | identify target | Primary | form context | account id Technical |
| new label | local form validated by canonical label schema | set human-facing identity | Primary | form field | validation is product-facing, raw schema mechanics are not |
| Save/Cancel | mutation/local | commit/abandon rename | Primary/Secondary | action region | failure remains in task |

## SURF-SET-OC-ADD-001 — Add OpenCode account

| Datum/action | Source | Intent | Class | Placement | Rule |
|---|---|---|---|---|---|
| new account label | local form | establish human saved-account identity | Primary | form | no account id yet |
| sign-in start meaning | account login command | begin governed login | Primary action | action region | provider mechanics Technical |
| failure/retry | login-start result | recover current task | Primary when failed | notice | raw process/provider evidence Technical |
| Cancel | local | abandon task | Secondary | action region | no mutation |

## SURF-SET-OC-LOGIN-001 — OpenCode sign-in

| Datum/action | Source | Intent | Class | Default placement | Disclosure / promotion |
|---|---|---|---|---|---|
| authorization instructions | `OpenCodeAccountLoginAttempt.instructions` | tell operator what to do | Primary | task body | none |
| authorization URL | login attempt | perform explicit external authorization | Primary | task action/link | exact protocol/provider mechanics Technical |
| human status/result message | attempt status/message mapped to product meaning | show progress/terminal state | Primary | task status | raw enum Technical |
| expiry when useful to task | `expiresAt` | time-bound action awareness | Supporting | task detail | exact internal attempt id Technical |
| Cancel / Done / retry as admitted | attempt state | control current login task | Primary/Secondary | action region | no hidden competing action |
| attempt id/provider transport details | attempt record | exact integration identity | Technical | Technical details | absent ordinarily |

## SURF-SET-MODEL-001 — model/runtime settings

| Datum/action | Source | Intent | Class | Default placement | Rule |
|---|---|---|---|---|---|
| configured model human/provider selection | config + available models | choose productive model | Primary | form/configuration | exact provider/model value is task-required and may be Primary while selecting |
| availability/readiness human state | model query/config comparison | explain unusable or unavailable selection | Primary when actionable | notice/status | raw fetch/provider mechanics Technical |
| Save/update | configuration mutation | commit model selection | Primary action | action region | config SHA is hidden optimistic precondition |
| provider ids/model ids outside active selection mechanics | model records | exact integration identity | Technical when not required to choose the model | Technical details | do not create provider-debug panel |

## SURF-WI-001 — selected WorkItem shell / rail / current attention

| Datum/action | Source | Intent | Class | Default placement | Disclosure / promotion | Negative rule |
|---|---|---|---|---|---|---|
| WorkItem title | `WorkItem.title` | stable human identity | Primary | identity row | title edit is local WorkItem utility | no WorkItem id |
| work kind / concise status where needed | schema catalog + WorkItem state | orient operator | Supporting | identity/status | schema id Technical | no metadata dump |
| current lifecycle step | `deriveWorkflowRail` / current stage | orientation | Primary | rail/current marker | none | no raw enum |
| reached/historical/unreached navigation | `deriveReachedStages/deriveWorkflowRail` | inspect legitimate history | Supporting navigation | rail | none | history selection cannot steal current attention |
| current attention human meaning | `deriveCurrentAttention` + recovery/currentness/coherence | answer “what needs action now?” | Primary | stable attention region | technical cause promotes meaning/consequence/action only | no raw diagnostic/session/path |
| current valid action | canonical attention/recovery owner | operate current workflow | Primary action | attention action region | exactly one competing mutation owner | no generic Start beside higher-priority action |
| Context open/close | local state | inspect technical orientation | Supporting utility | identity/utility region | opens `SURF-WI-CONTEXT-001`; never auto-open | Context not sole blocker/action owner |
| archive/restore | WorkItem utility | manage queue visibility | Supporting/destructive utility | identity/utility region | confirmation required | no immediate destructive mutation |
| title edit | title mutation contract | maintain human identity | Supporting utility | identity row | mutation error stays with title | no technical metadata edit surface |
| hashes, paths, ids, project/schema dumps, Run/task/provider identity | canonical records | exact mechanics | Technical | Context/Technical details only | never promoted to identity row |

## SURF-WI-CONTEXT-001 — explicit technical Context

Context is intentionally an explicit inspection surface. Exact technical values may be visible here because the operator requested them.

| Datum/action | Source | Intent | Class | Placement | Rule |
|---|---|---|---|---|---|
| selected workflow step/material label | current browser selection + presentation policy | orient technical inspection | Primary within Context | Context header | human label first |
| selected document path/SHA | selected document | exact document identity | Technical globally; Primary within explicit Context | metadata | allowed only because Context is open |
| selected Run id/role/status/attempt/start time | canonical Run | exact attempt identity | Technical globally; Primary/Supporting within Context | metadata | no provider raw payload |
| source issue count | source diagnostics | corroborating orientation | Supporting | metadata | blocker/action remains on primary surface |
| WorkItem stage/status/outcome/project/kind/schema/concerns | WorkItem + catalog | compact exact orientation | Technical globally | metadata | no duplicate policy/current-action logic |
| Close Context | local | restore primary width | Primary Context action | predictable close/toggle | Context never auto-opens; close restores focus/primary hierarchy |

## SURF-STEP-WR-001 — Work request step

| Datum/action | Source | Intent | Class | Default placement | Rule |
|---|---|---|---|---|---|
| Work request purpose/currentness | source + WorkItem stage | orient source-owned task | Primary | attention/step header | human meaning only |
| canonical source document | `WorkItemSourceSnapshot` | author/inspect originating intent | Primary | `SURF-MAT-SOURCE-001` | document internal content follows schema/template |
| source blocker human meaning + recovery | source diagnostics/recovery | unblock Research | Primary when applicable | attention/notice | raw code/path Technical |
| Start Research | canonical eligibility/current attention | begin R1 | Primary action when admitted | attention action region | hidden/suppressed when another owner blocks |
| supporting history/context | legitimate source/Git state | orient task | Supporting | selector/document support | exact identity Technical |

## SURF-STEP-R1-001 — Research

Research document semantics are work-kind specific and remain owned by the selected R1 schema/template plus R2 work-kind × step contract.

| Datum/action | Source | Intent | Class | Default placement | Rule |
|---|---|---|---|---|---|
| current Research attention | current stage interaction/proposal/blocker/currentness | identify the current research task | Primary | attention region | required input/proposal/blocker/processing precedence applies |
| current Dialogue | current STAGE Run | converse/answer/continue when interaction owns attention | Primary when current interaction requires it | `SURF-MAT-ACTIVITY-001` | conversation never replaced by event dump |
| current governed Research document | R1 ArtifactRef + bytes | inspect governed factual result | Primary when no higher attention owner | `SURF-MAT-DOC-001` | repository path/hash Technical |
| proposal review | proposal state | review a proposed governed change | Primary while proposal decision owns attention | `SURF-MAT-PROPOSAL-001` | free-form continuation suppressed |
| attempts/history/upstream source/evidence | Runs/artifacts/source/evidence | inspect supporting context | Supporting/Operational | `WorkbenchSelector` / history | cannot change primary canvas width |
| provider/session/baseline/context/raw event identity | Run/RunEvents | exact mechanics | Technical/Diagnostic | Technical details / Evidence | provider failure promotes only human meaning/action |
| Start/Retry/Resume/Reconcile/Cancel/Input/Adopt/Reject | canonical attention/interaction/recovery | operate Research | Primary action according to one current owner | owning material | never competing equal-weight mutations |

## SURF-STEP-R2-001 — Requirements

Same productive-stage grammar as Research, with the governed Requirements document/schema as the primary document when ordinary current work owns attention.

| Datum/action | Source | Intent | Class | Placement / rule |
|---|---|---|---|---|
| current Requirements attention/action | lifecycle/current-attention derivation | identify current functional-design task | Primary | attention region; one owner |
| Dialogue when current | STAGE Run/events | resolve missing functional decision/input | Primary | Activity surface |
| governed Requirements Markdown | R2 ArtifactRef/content | inspect required behavior, acceptance, scope/exclusions | Primary | document surface |
| supporting Research/source/attempt/history/evidence | artifacts/runs/source | judge current work | Supporting/Operational | selector/history |
| provider/session/path/hash/event mechanics | exact records | audit/debug | Technical/Diagnostic | Technical details/Evidence only |
| proposal disposition | proposal events | adopt/reject governed authority proposal | Primary while pending | Proposal Review; suppress continuation |

## SURF-STEP-DESIGN-001 — Solution design

| Datum/action | Source | Intent | Class | Placement / rule |
|---|---|---|---|---|
| current Solution-design attention/action | lifecycle/current attention | identify current technical-design task | Primary | attention region |
| Dialogue when current | STAGE Run/events | resolve technical design input | Primary | Activity |
| governed DESIGN Markdown | DESIGN ArtifactRef/content | inspect technical realization | Primary | document |
| supporting R2/R1/source/history/evidence | artifacts/runs/source | trace design basis | Supporting/Operational | selector/history |
| provider/session/path/hash/event mechanics | exact records | audit/debug | Technical/Diagnostic | Technical details/Evidence |
| proposal disposition | proposal events | govern P4-P6 change | Primary while pending | Proposal Review |

## SURF-STEP-PLAN-001 — Implementation plan

| Datum/action | Source | Intent | Class | Placement / rule |
|---|---|---|---|---|
| current Plan attention/action | lifecycle/current attention | identify current planning task | Primary | attention region |
| Dialogue when current | STAGE Run/events | resolve plan input | Primary | Activity |
| governed PLAN Markdown | PLAN ArtifactRef/content | inspect executable signed-task plan | Primary | document |
| task/change-surface summaries derived from PLAN | parsed signed-task block | support inspection | Supporting | subordinate selector/detail; never second plan authority |
| supporting DESIGN/R2/R1/source/history/evidence | artifacts/runs/source | trace plan basis | Supporting/Operational | selector/history |
| provider/session/path/hash/event mechanics | exact records | audit/debug | Technical/Diagnostic | Technical details/Evidence |
| Start Readiness / retry/recovery as canonically admitted | lifecycle/current attention | progress or recover | Primary action | attention action region |

## SURF-STEP-R3-001 — Readiness review

| Datum/action | Source | Intent | Class | Default placement | Disclosure / promotion |
|---|---|---|---|---|---|
| typed R3 verdict/current readiness | R3 `STAGE_COMPLETED.completion.outcome` + currentness | answer whether package is ready | Primary | Review header/verdict | never replaced by generic material maturity |
| findings / defective owner / exact return action | R3 governed content + lifecycle return | explain why not ready and where ownership returns | Primary | Review body/action | raw artifact identity remains Technical |
| governed R3 material | R3 ArtifactRef/content | substantive readiness review | Primary | Review body/document | exact path/hash Technical |
| package documents needed for judgment | current package artifacts | inspect basis | Supporting | selector/material list | role may be human label; path/hash hidden |
| attempt history/evidence | R3 Runs/evidence | inspect review history | Supporting/Operational | selector/history | exact Run/session identity Technical |
| legitimate REQUIRED_INPUT | current R3 Run interaction | answer exact readiness question | Primary temporarily | Dialogue/attention | unrelated technical identity not promoted |
| artifact/package role/path/hash/technical identity | package records | exact audit identity | Technical | Technical details | hidden before explicit disclosure |
| Return/Retry/Input actions | canonical attention/recovery | progress/recover | Primary action according to current owner | Review/Dialogue | one owner only |

## SURF-STEP-APPROVAL-001 — Approval

| Datum/action | Source | Intent | Class | Default placement | Disclosure / promotion |
|---|---|---|---|---|---|
| readiness/currentness | exact sign-off package + WorkItem state | determine whether approval is legitimate now | Primary | Review header | stale state promotes human meaning/owner, not hashes |
| package/task meaning | SignoffPackage task block | understand what will be authorized | Primary | Review body/task collection | exact package identity Technical |
| governed package documents | package ArtifactRefs | inspect authority basis | Supporting | selector/list | paths/hashes hidden |
| approver human identity | local input subject to canonical ingress validation | identify explicit human sign-off | Primary | decision region | internal approval id Technical |
| Sign off exact package | current package + approvedBy | authorize exact package | Primary action | decision region | absent/disabled when package not current |
| historical approval/task state | ExecutionTasks/history | inspect prior approval | Supporting/Operational | review history | exact approval/task ids Technical |
| package hash/source SHA/baseline commit/commit identity | SignoffPackage | exact audit identity | Technical | Technical details | absent by default |
| task/approval ids | package/task records | exact identity | Technical | Task technical details | absent from ordinary task meaning |
| stale/error/loading state | package query/currentness | explain inability to sign | Primary when blocking | Review notice | raw transport error not ordinary copy |

## SURF-MAT-APPROVAL-TASK-001 — Approval task detail

| Datum/action | Source | Intent | Class | Default placement | Rule |
|---|---|---|---|---|---|
| task objective/state meaning | SignedTaskDefinition / ExecutionTask | understand authorized work | Primary | task detail | exact task id Technical unless human task label is meaningful |
| scope/exclusions | signed task | understand hard semantic/repository boundary | Primary | task detail | exact paths are task-required here and may be visible |
| dependencies | signed task | understand execution eligibility | Supporting | task detail | no graph UI required |
| acceptance/gates/authority/concerns | signed task | judge verification and traceability | Primary/Supporting | task detail | internal ids that have no operator meaning belong Technical |
| changeSurface forecast | signed task | understand expected physical change | Supporting/Operational | task detail | it is forecast, not hard scope |
| approval/task/internal ids | task records | exact audit identity | Technical | Task technical details | hidden by default |
| Back/select another task | local selection | continue package review | Supporting navigation | task selector | no mutation |

## SURF-STEP-EXEC-001 — Implementation master/detail

| Datum/action | Source | Intent | Class | Default placement | Disclosure / promotion |
|---|---|---|---|---|---|
| task objective + human state | ExecutionTasks | scan approved work | Primary | fixed master list | exact task ids Technical |
| current task owner/action/blocker | `deriveExecutionOwner` + recovery/current attention | know what requires action now | Primary | attention/detail header | blocker promotes human meaning/action only |
| attempt human meaning/status | Runs mapped to product labels | inspect current/historical attempts | Supporting/Operational | subordinate attempt selector/list | Run id/session Technical |
| current validation boundary | `deriveValidationBoundary` | understand verified progress/failure | Primary | task detail | unreached full matrix not primary |
| chronology | RunEvents mapped to product presentation | inspect operational history | Supporting/Operational | Timeline | raw event tags/payload Diagnostic |
| evidence/resources | EvidenceRefs/artifacts | inspect supporting proof | Supporting | resource list | exact bytes/identity in Evidence |
| Start current task / Retry / Resume / Cancel | canonical execution owner/recovery | operate current approved task | Primary action according to current owner | attention/action region | historical selection cannot retarget action |
| task/approval/plan/Run ids; baseline/context/provider session | exact execution records | audit mechanics | Technical | Technical details | absent ordinarily |
| raw execution diagnostics | diagnostics/events/provider evidence | debug failure | Diagnostic | Technical details/Evidence | never ordinary chronology copy |

## SURF-MAT-EXEC-TASK-001 — execution task/attempt detail

| Datum/action | Source | Intent | Class | Placement / rule |
|---|---|---|---|---|
| selected task objective/state | ExecutionTask | understand selected task | Primary | detail |
| signed scope/gates/dependencies/change forecast when needed | ExecutionTask | understand execution contract | Supporting/Operational | detail sections |
| selected attempt role/number/human status | Run | inspect attempt | Supporting/Operational | attempt detail |
| current validation boundary/results | pure derivation + validation events | understand verification | Primary/current + Operational history | current boundary visible; complete matrix subordinate/disclosed |
| timeline | RunEvents | inspect execution history | Operational | timeline with product labels |
| evidence resources | EvidenceRefs | inspect proof | Supporting | resource rows; opens Evidence |
| task/approval/Run/baseline/context/session/internal classification | exact records | audit mechanics | Technical | Technical details |
| raw event/payload/diagnostic data | RunEvents/provider diagnostics | debug | Diagnostic | Timeline Technical details/Evidence |

## SURF-STEP-COMPLETE-001 — terminal result

| Datum/action | Source | Intent | Class | Default placement | Rule |
|---|---|---|---|---|---|
| canonical final outcome human label/explanation | `WorkItem.outcome` → product language | state what happened | Primary | result header/status | use “Verified candidate” only for executed delivery; umbrella product outcome remains verified result semantics |
| governed result material | terminal ArtifactRefs/content | present investigation/audit result where applicable | Primary | result body | exact artifact identity Technical |
| candidate evidence/resources | successful execution Runs/RunEvents/EvidenceRefs | support verified candidate | Supporting | resource list | human resource labels ordinarily; exact identity in Evidence |
| linked remediation action | eligible Audit/Investigation outcome | create separately governed Change/Defect | Primary next action when applicable | result action | opens `SURF-CREATE-001` |
| internal event tags/role codes/ids/hashes/raw result identity | exact records | audit mechanics | Technical/Diagnostic | Evidence/Technical details if needed | never ordinary result copy |
| result loading/error state | content/evidence query | explain unavailable supporting material | Supporting/Primary if it prevents result inspection | owning result notice | raw transport internals hidden |

## SURF-MAT-SOURCE-001 — Work request source document/editor

| Datum/action | Source | Intent | Class | Default placement | Disclosure / promotion |
|---|---|---|---|---|---|
| canonical source Markdown/body | WorkItemSourceSnapshot | author originating intent | Primary | document/editor | internal template/schema identity hidden |
| Edit/Preview/Split | local editor mode | author/inspect safely | Supporting control | document toolbar | does not alter authority until Save |
| local dirty/current state | buffer vs loaded source | protect unsaved work | Supporting/current attention when navigation conflicts | toolbar/notice | confirmation on destructive navigation |
| Save/Cancel | source mutation/local | persist/abandon authoring | Primary/Secondary actions | editor actions | expected-hash conflict shown as human recovery |
| compact documentation-Git state/action | Git status | optionally persist governed docs | Supporting | document toolbar | exact branch/HEAD/paths Technical except confirmation |
| source blocker human meaning | source diagnostics | explain inability to progress | Primary when blocking | document/attention notice | raw code/path Technical |
| path/SHA/schema/source internals, WorkItem directory, branch, HEAD | source/Git state | audit identity | Technical | Technical details | hidden by default |
| exact changed paths | Git status | consent to documentation commit | Primary only inside `SURF-CONF-DOC-GIT-001` | confirmation | path-specific decision exception |

## SURF-MAT-DOC-001 — editable lifecycle document

| Datum/action | Source | Intent | Class | Default placement | Rule |
|---|---|---|---|---|---|
| governed Markdown content | ArtifactRef + exact bytes | author current governed artifact | Primary | document/editor | semantic internal content remains owned by selected stage schema/template |
| human document role/title | ArtifactRef role mapped to product label | orient current material | Primary/Supporting | document header | repository path not subtitle |
| maturity/currentness | lifecycle/currentness derivation | understand whether material is current/editable | Supporting; Primary if stale blocks action | status/notice | exact hash Technical |
| Edit/Preview/Split | editor mode | author/inspect | Supporting | toolbar | no new authority |
| Save/Cancel | artifact mutation/local | persist/abandon direct edit where allowed | Primary/Secondary actions | editor | exact expected hash remains mechanics |
| documentation-Git state/action | Git status | optional governed docs commit | Supporting | toolbar | exact paths in confirmation |
| non-canonical Markdown incompatibility | decode/format validation | explain why ordinary editor cannot own bytes | Primary when blocking | notice + inspect exact bytes action | exact bytes in Evidence |
| repository path/SHA/git commit/branch/HEAD | ArtifactRef/Git status | audit identity | Technical | Technical details | absent ordinary heading |

## SURF-MAT-DOC-RO-001 — read-only lifecycle/supporting document

| Datum/action | Source | Intent | Class | Placement / rule |
|---|---|---|---|---|
| governed Markdown content | ArtifactRef + content bytes | inspect supporting/historical/R3/Approval material | Primary within selected material; Supporting relative to owning workflow task when historical | read-only document |
| human document role/currentness | ArtifactRef + lifecycle currentness | orient material | Supporting | header/status |
| exact path/SHA/git commit/internal role identity | ArtifactRef | audit identity | Technical | Technical details |
| inspect exact bytes if ordinary Markdown decode cannot represent content | content validation | preserve source fidelity | Supporting action | opens Evidence |
| Back/selector navigation | local selection | return to owning task | Supporting | selector/history |

## SURF-MAT-ACTIVITY-001 — STAGE dialogue/activity

| Datum/action | Source | Intent | Class | Default placement | Disclosure / promotion |
|---|---|---|---|---|---|
| human/agent conversation | persisted semantic RunEvents | understand/respond to stage work | Primary | Dialogue transcript | workflow/system events visually distinct |
| exact required-input question | unresolved HUMAN_INPUT_REQUESTED | answer current question | Primary | Dialogue anchor/composer | focus once for newly current request |
| free-form continuation guidance/composer | OPEN interaction + visible substantive agent message | continue current work | Primary action | anchored composer | absent while proposal/recovery/higher owner exists |
| human-readable processing/block/failure status | interaction/current attention | understand current state | Primary when it owns attention | Dialogue/attention notice | raw provider mechanics hidden |
| attempt number/time/human status | Run | orient attempt | Supporting | Dialogue header/selector | Run id Technical |
| bounded agent activity | AGENT_ACTIVITY_RECORDED | useful operational transparency | Supporting/Operational | activity region/timeline | does not replace conversation |
| workflow/system event labels | RunEvents through product presentation | understand persisted workflow history | Operational | timeline | raw tags/payloads Diagnostic |
| evidence resource labels | EvidenceRefs | inspect proof | Supporting | timeline/resource row | exact identity/bytes in Evidence |
| Cancel | canonical interaction eligibility | stop current Run | Primary/Secondary current action when admitted | Dialogue action | suppressed by proposal/adoption/current-owner rules |
| provider session/baseline/context/Run ids/raw role/status/terminal classification | Run | exact mechanics | Technical | Technical details | absent ordinary header |
| raw event tag/sequence/JSON payload | RunEvent | debug | Diagnostic | Timeline Technical details/Evidence | absent ordinary timeline |

## SURF-MAT-PROPOSAL-001 — proposal review

| Datum/action | Source | Intent | Class | Default placement | Rule |
|---|---|---|---|---|---|
| proposal currentness/state | proposal/adoption/disposition events | know whether decision is pending/applying/complete | Primary | Review header/status | human labels only |
| human target meaning | proposal target mapped to governed document/authority meaning | know what changes | Primary | Review body | raw path may be shown only where exact target identity is necessary to review the mutation; do not use as sole label |
| rationale | proposal event | understand why | Primary | Review body | none |
| unified diff | proposal event | inspect exact proposed bytes | Primary | CodeBlock/review body | exact mutation content is task-required |
| Adopt/Reject | current proposal decision state | dispose proposal | Primary actions | decision region | continuation/cancel competition follows canonical control exclusivity |
| adoption/decision failure | mutation state | recover decision | Primary when blocking | Review notice | raw transport mechanics hidden |
| raw event/schema/provider identity | RunEvents | debug | Technical/Diagnostic | Technical details/Evidence | absent ordinary review |

## SURF-MAT-EVIDENCE-001 — exact Evidence

Evidence is an explicit inspection surface; exact identity and exact bytes are intentionally Primary here.

| Datum/action | Source | Intent | Class | Placement | Rule |
|---|---|---|---|---|---|
| human evidence label/resource meaning | EvidenceSelection / ArtifactRef | identify selected proof | Primary | header | may include relative path where that is the evidence identity |
| exact evidence/artifact identity | EvidenceRef/ArtifactRef | audit exact resource | Primary within Evidence; Technical elsewhere | header/metadata | explicit inspection exception |
| exact read-only bytes/text | evidence/artifact API | inspect proof faithfully | Primary | CodeBlock/content | no independent theme island |
| binary/decoding representation | bounded evidence reader | preserve inspectability | Primary within Evidence | content | clearly technical |
| loading/read failure | evidence query | explain unavailable proof | Primary when blocking inspection | state/notice | raw transport internals hidden |
| Back | recorded origin | restore owning workflow/material and focus | Primary navigation action | header/action | no mutation |

## Confirmations

### SURF-CONF-DIRTY-DEST-001

| Datum/action | Source | Class | Placement rule |
|---|---|---|---|
| unsaved-change meaning | local dirty state | Primary | confirmation body |
| requested destination consequence | pending destination semantic label | Primary | enough context to decide safely; no internal route |
| Continue editing | local | Primary safe action | close confirmation, preserve buffer |
| Discard and navigate | local | destructive action | explicit confirmation; no silent discard |

### SURF-CONF-DIRTY-MATERIAL-001

| Datum/action | Source | Class | Placement rule |
|---|---|---|---|
| unsaved Markdown meaning | local dirty state | Primary | confirmation body |
| requested step/material semantic target | pending selection | Primary | human label, not internal key |
| Continue editing / Discard and switch | local | Primary safe / destructive | preserve or intentionally discard buffer |

### SURF-CONF-ARCHIVE-001

| Datum/action | Source | Class | Placement rule |
|---|---|---|---|
| WorkItem human title + archive/restore consequence | WorkItem | Primary | identify affected work semantically |
| archive/restore command | WorkItem mutation | destructive/primary confirmation action | exact WorkItem id remains Technical |
| Cancel | local | Secondary | no mutation |

### SURF-CONF-DOC-GIT-001

| Datum/action | Source | Class | Placement rule |
|---|---|---|---|
| documentation-commit purpose/consequence | Git/document contract | Primary | explain explicit repository persistence |
| exact governed changed paths | Git status paths | Primary **inside this confirmation** | exact paths are required for informed path-scoped consent |
| branch/HEAD/author where necessary to understand the commit | Git status | Supporting/Technical | subordinate; must not swamp path scope |
| Commit / Cancel | Git command/local | Primary / Secondary actions | no commit without explicit confirmation |

### SURF-CONF-REPO-DISCONNECT-001

| Datum/action | Source | Class | Placement rule |
|---|---|---|---|
| affected repository/project meaning | selected repository | Primary | semantic identity first |
| exact repository root | selected repository | Primary within confirmation when needed to unambiguously identify destructive target | path-specific decision exception |
| preservation/consequence statement | disconnect contract | Primary | state what is and is not removed |
| Disconnect / Cancel | mutation/local | destructive / Secondary | explicit decision |

### SURF-CONF-OC-REMOVE-001

| Datum/action | Source | Class | Placement rule |
|---|---|---|---|
| account human label | selected account | Primary | identify target |
| credential/removal consequence | account mutation contract | Primary | explain effect |
| exact account id/provider mechanics | account record | Technical | hidden unless needed for technical inspection; not ordinary confirmation copy |
| Remove / Cancel | mutation/local | destructive / Secondary | explicit decision |

---

# Cross-surface action and placement laws

## Current-attention precedence

Observation coherence is evaluated before mutation controls. The one current mutation/action owner follows canonical P3 precedence. Historical/material selection never retargets the current action.

At minimum the implementation must preserve the closed precedence already governed for:

- convergence/mutation conflict;
- exact required input;
- proposal decision/adoption;
- current blocker/recovery/stale authority;
- active processing;
- ordinary actionable current task;
- ordinary current document/review/material.

Only the highest-precedence mutation owner is presented as the current workflow action.

## Responsive semantics

Wide/medium/narrow may change composition, not classification.

- Primary remains directly reachable and is never moved behind Context/Technical details.
- Technical/Diagnostic remains hidden by default and never becomes persistent to “fill” narrow/wide layouts.
- Context is explicit and closeable.
- Implementation remains the only persistent workflow master/detail class.
- selectors/history become adaptive controls without creating another navigation axis.
- action priority is invariant across viewport classes.

## Theme semantics

System/Light/Dark change visual tokens only. Information class, disclosure, action priority, hierarchy and interaction class remain identical.

## Human-label law

Internal lifecycle/status/schema/provider/event codes remain valid canonical values but are not ordinary operator copy where a human-facing meaning exists.

Exact internal identity is shown only where:

- the active task literally requires choosing/entering that exact value;
- a confirmation requires the exact target to make an informed decision;
- Context/Technical details/Evidence is explicitly opened.

## Resource-label law

Ordinary resource lists use human-facing role/meaning. Exact repository/evidence identity moves to Evidence or Technical details unless the exact target is itself the decision being made.

## Failure law

A failure can promote:

1. what failed in operator language;
2. consequence for the current task;
3. valid recovery/action.

It does not promote raw error code, event tag, parser/provider payload, session id, repository path, hash or transport response.

# Implementation consumption contract

IA27-IA34 **consume this document**. They do not create a new screen-information schema.

For each owned `SURF-*` row, implementation must:

1. load the applicable surface contract above before inspecting current implementation bytes;
2. map every rendered datum/action to the corresponding contract row;
3. record current implementation as either `CONFORMING_NO_EDIT` or `RESIDUAL_DELTA`;
4. correct only `RESIDUAL_DELTA` inside the phase-owned paths/selectors;
5. prove Primary information is present and correctly prioritized;
6. prove Supporting/Operational information remains subordinate;
7. prove Technical/Diagnostic information is absent by default;
8. prove the authorized disclosure owner reveals the exact owned value after explicit entry;
9. prove closing/return restores the ordinary hierarchy and current attention;
10. prove responsive/theme variants preserve the same classification and action priority.

A missing contract row is not an implementation gap. It is a DESIGN defect and blocks the phase.

For IA32-IA34, the existing destructive purge-before-fresh-authorship rule still applies. Purge happens **before implementation of this already-closed contract**, not before implementation derives the contract.

# Verification contract

Phase-local rendered review and final IA26 acceptance use three independent binary dimensions for every applicable surface/state:

- `schema_information` — this contract is realized exactly;
- `ux_interaction` — current-attention, action, navigation, recovery and interaction-class behavior conforms;
- `visual_ui` — hierarchy, density, geometry, typography, component consistency, affordance, truncation/wrapping, overlay and theme behavior conform to current authority.

`schema_information = PASS` requires both positive and negative proof:

- required Primary information is visible;
- required Supporting/Operational information is correctly subordinate;
- Technical/Diagnostic values are absent from the ordinary surface;
- the authorized disclosure/confirmation/Evidence owner exposes the value only when explicitly entered;
- close/return restores ordinary hierarchy;
- no current action is lost behind disclosure.

Presence-only assertions are insufficient.

# Completeness rules

This contract is complete only while all of the following remain true:

- the registry contains exactly the 37 current governed `SURF-*` ids;
- every production renderer is classified by the canonical P4 renderer matrix;
- every operator-visible canonical datum/action admitted by the Phase-1 typed-input/interaction inventories maps to a row here or to the rendered governed Markdown body;
- every exact-id/path/hash/session/event/provider value has an explicit default-visibility/disclosure decision;
- every destructive/dirty/configuration decision has an explicit target-information rule;
- every work-kind/stage difference remains preserved through the selected canonical document/schema semantics;
- responsive/theme variants do not create new information classes or placements;
- no implementation task is instructed to “derive”, “choose” or “infer” a screen information schema.

Any future new surface, datum/action class, disclosure owner or interaction grammar requires DESIGN/P3 amendment before implementation.
