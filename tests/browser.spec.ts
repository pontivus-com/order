import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  ArtifactRefSchema,
  ExecutionTaskSchema,
  ExpectedHashWriteResultSchema,
  InstallationReadinessSchema,
  OpenCodeAccountLoginAttemptSchema,
  OpenCodeAccountStateSchema,
  RunEventSchema,
  RunSchema,
  WorkItemSchema,
  WorkItemSourceSnapshotSchema,
} from "../src/core/contracts.ts";
import { expect, test, type APIRequestContext, type Locator, type Page } from "@playwright/test";

const baseURL = "http://127.0.0.1:17347";
const stateRoot = process.env.PONTIVUS_ORDER_TEST_STATE_ROOT;
if (stateRoot === undefined || stateRoot.length === 0) {
  throw new TypeError("PONTIVUS_ORDER_TEST_STATE_ROOT is required");
}
const daemonToken = readFileSync(join(stateRoot, "daemon-token"), "utf8").trim();
const repositoryRoot = stateRoot + "-e2e-project";
const fixtureControlURL = "http://127.0.0.1:17348";

const renderedAcceptanceDir = process.env.PONTIVUS_ORDER_RENDERED_ACCEPTANCE_DIR;
const renderedAcceptanceCandidateSha =
  process.env.PONTIVUS_ORDER_RENDERED_ACCEPTANCE_CANDIDATE_SHA;
const renderedAcceptanceLabel =
  process.env.PONTIVUS_ORDER_RENDERED_ACCEPTANCE_LABEL ?? "IA26";

const renderedEvidenceKind =
  process.env.PONTIVUS_ORDER_RENDERED_EVIDENCE_KIND ?? "ia26_acceptance";
if (![
  "bounded_phase_acceptance",
  "diagnostic_current_state",
  "ia26_acceptance",
].includes(renderedEvidenceKind)) {
  throw new TypeError("unsupported rendered evidence kind: " + renderedEvidenceKind);
}
const diagnosticCurrentState = renderedEvidenceKind === "diagnostic_current_state";

const diagnosticPhase = process.env.PONTIVUS_ORDER_DIAGNOSTIC_PHASE ?? null;
const signedRenderedPhases = ["IA27_28","IA29","IA31","IA30","IA32","IA33","IA34"] as const;
type SignedRenderedPhase = typeof signedRenderedPhases[number];
const rawSignedRenderedPhase = process.env.PONTIVUS_ORDER_SIGNED_RENDERED_PHASE;
const signedRenderedPhase = rawSignedRenderedPhase === undefined ? null :
  signedRenderedPhases.find((phase) => phase === rawSignedRenderedPhase);
if (signedRenderedPhase === undefined ||
    (signedRenderedPhase !== null && (renderedEvidenceKind !== "ia26_acceptance" ||
      diagnosticPhase !== null || renderedAcceptanceDir === undefined))) {
  throw new TypeError("invalid or incompatible PONTIVUS_ORDER_SIGNED_RENDERED_PHASE");
}

const renderedDiagnosticPhases = ["IA34", "IA29", "IA30", "IA31", "IA32", "IA33"] as const;
type RenderedDiagnosticPhase = typeof renderedDiagnosticPhases[number];
const runRenderedPhase = (phase: RenderedDiagnosticPhase): boolean =>
  signedRenderedPhase !== null ? signedRenderedPhase === phase :
    !diagnosticCurrentState || diagnosticPhase === phase;

// These are the explicitly named scenario variants, not a post-execution filter.
// Owned surfaces follow the action catalog's disjoint 37-SURF partition.
const signedPhaseCaptureIds = {
  IA27_28: [
    "application-wide-light-active-account",
    "diagnostic-application-wide-light-account-required",
    "application-wide-light-installation-readiness",
    "diagnostic-application-wide-light-readiness-all-blockers",
    "diagnostic-queue-wide-light-loading",
    "diagnostic-queue-wide-light-true-empty",
    "diagnostic-application-wide-light-browser-session-required",
    "queue-wide-light-source-diagnostic",
    "queue-wide-light-populated",
    "queue-wide-light-archived",
    "queue-wide-light-no-matches",
    "queue-narrow-light-populated",
    "application-queue-wide-dark",
    "ia26-queue-wide-dark",
    "application-toolbar-wide-system-light",
    "application-toolbar-wide-system-dark",
    "ia26-queue-system-light",
    "ia26-queue-system-dark",
    "hux-app-queue-wide-light",
    "hux-app-queue-narrow-dark",
    "create-work-item-wide-light-change",
    "create-work-item-narrow-light-change",
    "ia26-create-workitem-wide-dark",
    "create-linked-remediation-wide-light",
    "create-linked-remediation-narrow-light",
    "application-toolbar-workitem-wide-light",
    "application-toolbar-workitem-medium-light",
    "workitem-shell-wide-light-chrome",
    "workitem-shell-wide-light-current-attention",
    "workitem-context-wide-light-selected-workitem",
    "workitem-context-narrow-light-selected-workitem",
    "application-toolbar-workitem-narrow-light",
    "workitem-shell-narrow-light-chrome",
    "workitem-shell-narrow-light-current-attention",
    "application-toolbar-settings-wide-light",
    "application-toolbar-settings-medium-light",
    "application-toolbar-settings-narrow-light",
    "hux-shell-approval-wide-light",
    "hux-shell-approval-wide-dark",
    "hux-shell-approval-narrow-light",
    "hux-shell-approval-narrow-dark",
  ],
  IA29: [
    "hux-shell-document-wide-light",
    "hux-shell-document-narrow-dark",
    "ia26-work-request-step-wide-light",
    "ia26-work-request-step-narrow-light",
    "ia26-workitem-medium-light",
    "ia26-work-request-step-wide-dark",
    "ia26-workitem-shell-wide-dark",
    "ia26-context-wide-dark",
    "ia26-source-document-wide-light",
    "ia26-source-document-editor-wide-light",
    "ia26-source-document-editor-narrow-light",
    "ia26-source-document-editor-wide-dark",
    "ia26-source-document-dirty-wide-light",
    "ia26-source-document-conflict-wide-light",
    "ia26-confirm-dirty-material-wide-light",
    "ia26-confirm-dirty-destination-wide-light",
    "ia26-lifecycle-document-editor-wide-light",
    "ia26-lifecycle-document-readonly-wide-light",
    "ia26-confirm-documentation-git-wide-light",
    "ia26-confirm-archive-wide-light",
    "ia26-confirm-archive-wide-dark",
    "ia26-work-type-change-source-wide-light",
    "ia26-work-type-defect-source-wide-light",
    "ia26-work-type-investigation-source-wide-light",
    "ia26-work-type-audit-source-wide-light",
  ],
  IA31: [
    "ia26-proposal-review-wide-light",
    "ia26-proposal-review-wide-dark",
    "ia26-proposal-review-adopted-wide-light",
    "ia26-proposal-review-rejected-wide-light",
    "ia26-proposal-review-adopting-wide-light",
    "ia26-readiness-review-wide-light",
    "ia26-readiness-review-narrow-light",
    "ia26-approval-wide-light",
    "ia26-approval-narrow-light",
    "ia26-approval-wide-dark",
    "ia26-approval-narrow-dark",
    "hux-shell-review-narrow-dark",
    "hux-shell-review-wide-light",
    "ia26-approval-task-wide-light",
    "ia26-approval-task-wide-dark",
    "ia26-approval-task-narrow-light",
    "ia26-approval-task-narrow-dark",
    "ia26-readiness-required-input-wide-light",
  ],
  IA30: [
    "ia26-research-wide-light",
    "ia26-research-narrow-light",
    "ia26-requirements-wide-light",
    "ia26-requirements-narrow-light",
    "ia26-solution-design-wide-light",
    "ia26-solution-design-narrow-light",
    "ia26-implementation-plan-wide-light",
    "ia26-implementation-plan-narrow-light",
    "ia26-stage-dialogue-open-wide-light",
    "ia26-stage-dialogue-open-wide-dark",
    "ia26-stage-dialogue-required-input-wide-light",
    "ia26-stage-dialogue-processing-wide-light",
    "ia26-stage-dialogue-closed-wide-light",
  ],
  IA32: [
    "ia26-implementation-wide-light",
    "ia26-implementation-wide-dark",
    "ia26-implementation-task-wide-light",
    "ia26-implementation-narrow-light",
    "ia26-implementation-processing-wide-light",
    "ia26-implementation-blocked-wide-light",
    "ia26-implementation-validation-recorded-wide-light",
    "ia26-implementation-builder-attempt-wide-light",
  ],
  IA33: [
    "ia26-complete-candidate-wide-light",
    "ia26-complete-candidate-wide-dark",
    "ia26-complete-candidate-narrow-light",
    "ia26-complete-investigation-linked-wide-light",
    "ia26-evidence-wide-light",
    "ia26-evidence-wide-dark",
  ],
  IA34: [
    "ia26-settings-frame-wide-light",
    "ia26-settings-repositories-wide-light",
    "ia26-settings-repository-add-wide-light",
    "ia26-settings-repository-move-wide-light",
    "ia26-confirm-repository-disconnect-wide-light",
    "ia26-settings-opencode-wide-light",
    "ia26-settings-opencode-rename-wide-light",
    "ia26-confirm-opencode-remove-wide-light",
    "ia26-settings-opencode-add-wide-light",
    "ia26-settings-opencode-login-pending-wide-light",
    "ia26-settings-opencode-login-completed-wide-light",
    "ia26-settings-opencode-login-failed-wide-light",
    "ia26-settings-opencode-login-expired-wide-light",
    "ia26-settings-opencode-login-cancelled-wide-light",
    "ia26-settings-model-wide-light",
    "ia26-settings-model-wide-dark",
    "ia26-settings-diagnostics-model-wide-light",
    "ia26-settings-model-narrow-light",
  ],
} as const;
const signedPhaseOwnedSurfaces = {
  IA27_28: [
    "SURF-WI-001",
    "SURF-WI-CONTEXT-001",
    "SURF-APP-001",
    "SURF-QUEUE-001",
    "SURF-CREATE-001",
  ],
  IA29: [
    "SURF-STEP-WR-001",
    "SURF-MAT-SOURCE-001",
    "SURF-MAT-DOC-001",
    "SURF-MAT-DOC-RO-001",
    "SURF-CONF-DIRTY-DEST-001",
    "SURF-CONF-DIRTY-MATERIAL-001",
    "SURF-CONF-ARCHIVE-001",
    "SURF-CONF-DOC-GIT-001",
  ],
  IA31: [
    "SURF-MAT-PROPOSAL-001",
    "SURF-STEP-R3-001",
    "SURF-STEP-APPROVAL-001",
    "SURF-MAT-APPROVAL-TASK-001",
  ],
  IA30: [
    "SURF-STEP-R1-001",
    "SURF-STEP-R2-001",
    "SURF-STEP-DESIGN-001",
    "SURF-STEP-PLAN-001",
    "SURF-MAT-ACTIVITY-001",
  ],
  IA32: [
    "SURF-STEP-EXEC-001",
    "SURF-MAT-EXEC-TASK-001",
  ],
  IA33: [
    "SURF-STEP-COMPLETE-001",
    "SURF-MAT-EVIDENCE-001",
  ],
  IA34: [
    "SURF-SET-001",
    "SURF-SET-REPO-001",
    "SURF-SET-REPO-ADD-001",
    "SURF-SET-REPO-MOVE-001",
    "SURF-SET-OC-001",
    "SURF-SET-OC-RENAME-001",
    "SURF-SET-OC-ADD-001",
    "SURF-SET-OC-LOGIN-001",
    "SURF-SET-MODEL-001",
    "SURF-CONF-REPO-DISCONNECT-001",
    "SURF-CONF-OC-REMOVE-001",
  ],
} as const;
const signedPhaseSharedSurfaces: Readonly<Partial<Record<SignedRenderedPhase, readonly string[]>>> = {
  IA29: ["SURF-WI-001", "SURF-WI-CONTEXT-001"],
  IA31: ["SURF-WI-001"],
};

type ReferenceViewportClass = "wide" | "medium" | "narrow";
type ReferenceTheme = "light" | "dark" | "system";

type ReferenceManifestSurface = Readonly<{
  id: string;
  interactionClass: string;
  source: string;
  selector: string;
  captureScope: "full-workbench" | "component-reference";
  stateCaptureScopes?: Readonly<Record<string, "full-workbench" | "component-reference">>;
  states: readonly string[];
  viewports: readonly ReferenceViewportClass[];
  themes: readonly ReferenceTheme[];
  authority: readonly string[];
}>;

type ReferenceManifest = Readonly<{
  schemaVersion: number;
  status: string;
  semanticAuthority: false;
  source: string;
  query: string;
  viewportClasses: Readonly<{ wide: number; medium: number; narrow: number }>;
  surfaces: readonly ReferenceManifestSurface[];
}>;

type RenderedAcceptanceReference = Readonly<{
  manifestPath: string;
  sourcePath: string;
  surface: string;
  state: string | null;
  selector: string;
  captureScope: "full-workbench" | "component-reference";
  viewportClass: ReferenceViewportClass | null;
  theme: ReferenceTheme;
  authority: readonly string[];
  query: string | null;
  comparisonEligible: boolean;
}>;

type RenderedAcceptanceEntry = Readonly<{
  id: string;
  workItemKind: "QUEUE" | "CHANGE" | "DEFECT" | "INVESTIGATION" | "AUDIT";
  workflowStep: string | null;
  surface: string;
  state: string;
  fixture: string;
  viewport: Readonly<{ width: number; height: number }>;
  theme: "Light" | "Dark" | "System/light" | "System/dark";
  route: string;
  authorityRefs: readonly string[];
  captureScope?: string;
  reference: RenderedAcceptanceReference;
  screenshot: string;
  referenceScreenshot?: string;
}>;

type RenderedAcceptanceInput = Omit<
  RenderedAcceptanceEntry,
  "reference" | "screenshot" | "referenceScreenshot"
>;

const referenceManifestPath =
  "docs/references/workbench-ui/reference-manifest.json";
const referenceAtlasPath =
  "docs/references/workbench-ui/reference-atlas.html";
const referenceReadmePath =
  "docs/references/workbench-ui/README.md";
const referenceManifest = JSON.parse(
  readFileSync(referenceManifestPath, "utf8"),
) as ReferenceManifest;
if (referenceManifest.semanticAuthority !== false) {
  throw new TypeError("Workbench comparison corpus must remain non-authoritative");
}
if (referenceManifest.source !== referenceAtlasPath) {
  throw new TypeError(
    "Workbench comparison manifest source must be the current reference atlas",
  );
}
const referenceSurfaceById = new Map(
  referenceManifest.surfaces.map((surface) => [surface.id, surface] as const),
);

const canonicalReferenceState = (
  surface: string,
  runtimeState: string,
): string | null => {
  const declared = referenceSurfaceById.get(surface);
  if (declared?.states.includes(runtimeState)) return runtimeState;
  if (surface === "SURF-APP-001") {
    if (runtimeState.startsWith("selected-workitem-destination")) return "toolbar-workitem";
    if (runtimeState.startsWith("settings-destination")) return "toolbar-settings";
    if (runtimeState.includes("browser-session")) return null;
    return /readiness|missing-account/.test(runtimeState) ? "readiness-blocked" : "default";
  }
  if (surface === "SURF-QUEUE-001") {
    if (runtimeState.includes("source-diagnostic")) return "source-diagnostic";
    if (runtimeState.includes("no-search")) return "no-match";
    if (/loading|archived/.test(runtimeState)) return null;
    if (runtimeState.includes("true-empty")) return "empty";
    return "populated";
  }
  if (surface === "SURF-CREATE-001") return runtimeState.includes("linked") ? "linked-remediation" : "ordinary";
  if (surface === "SURF-WI-001") {
    if (runtimeState.includes("blocked")) return "blocked";
    if (runtimeState.includes("attention")) return "current-action";
    return "default";
  }
  if (surface === "SURF-WI-CONTEXT-001") {
    if (runtimeState.includes("run")) return "run";
    if (runtimeState.includes("proposal")) return "proposal";
    if (runtimeState.includes("approval")) return "approval";
    if (/task|execution/.test(runtimeState)) return "task";
    return "document";
  }
  if (surface === "SURF-SET-001") return /readiness.*blocked/.test(runtimeState) ? "readiness-blocked" : "ready";
  if ([
    "SURF-SET-REPO-001","SURF-SET-OC-001","SURF-SET-OC-RENAME-001",
    "SURF-SET-OC-ADD-001","SURF-SET-MODEL-001","SURF-CONF-DIRTY-DEST-001",
    "SURF-CONF-DIRTY-MATERIAL-001","SURF-CONF-REPO-DISCONNECT-001","SURF-CONF-OC-REMOVE-001",
  ].includes(surface)) return "default";
  if (surface === "SURF-SET-REPO-ADD-001") return runtimeState.includes("error") ? "error" : "default";
  if (surface === "SURF-SET-REPO-MOVE-001") return runtimeState.includes("conflict") ? "conflict" : "default";
  if (surface === "SURF-SET-OC-LOGIN-001") {
    if (/pending|processing/.test(runtimeState)) return "processing";
    if (/complete|success/.test(runtimeState)) return "success";
    if (/failed|expired|cancelled|error/.test(runtimeState)) return "error";
    if (runtimeState.includes("ready")) return "ready";
    return null;
  }
  if (surface === "SURF-STEP-WR-001") {
    if (runtimeState.includes("read-only")) return "read-only";
    if (runtimeState.includes("stale")) return "stale";
    return "active";
  }
  if (surface === "SURF-STEP-R1-001" || surface === "SURF-STEP-R2-001") {
    if (surface === "SURF-STEP-R2-001" && runtimeState.includes("document")) return "document";
    if (runtimeState.includes("required-input")) return "required-input";
    if (runtimeState.includes("processing")) return "processing";
    if (runtimeState.includes("blocked")) return "blocked";
    return "open";
  }
  if (surface === "SURF-STEP-DESIGN-001" || surface === "SURF-STEP-PLAN-001") {
    if (runtimeState.includes("read-only")) return "read-only";
    if (runtimeState.includes("stale")) return "stale";
    return "active";
  }
  if (surface === "SURF-STEP-R3-001") {
    if (runtimeState.includes("required-input")) return "required-input";
    if (runtimeState.includes("return")) return "return";
    return "ready";
  }
  if (surface === "SURF-STEP-APPROVAL-001") {
    if (runtimeState.includes("stale")) return "stale";
    if (runtimeState.includes("signoff")) return "signoff";
    return "current";
  }
  if (surface === "SURF-STEP-EXEC-001") {
    if (runtimeState.includes("historical")) return "historical-selection";
    if (runtimeState.includes("blocked")) return "blocked";
    if (runtimeState.includes("validation")) return "validation-recorded";
    if (/processing|running/.test(runtimeState)) return "running";
    return "ready";
  }
  if (surface === "SURF-STEP-COMPLETE-001") {
    if (/linked|investigation-result/.test(runtimeState)) return "linked-remediation";
    if (runtimeState.includes("verified-result")) return "verified-result";
    return "verified-candidate";
  }
  if (surface === "SURF-MAT-SOURCE-001") {
    if (/dirty|canonical-document-changed/.test(runtimeState)) return "dirty";
    if (runtimeState.includes("split")) return "split";
    if (/preview|read-view/.test(runtimeState)) return "preview";
    return "edit";
  }
  if (surface === "SURF-MAT-DOC-001") {
    if (runtimeState.includes("stale")) return "stale";
    if (runtimeState.includes("split")) return "split";
    if (runtimeState.includes("preview")) return "preview";
    return "edit";
  }
  if (surface === "SURF-MAT-DOC-RO-001") return runtimeState.includes("historical") ? "historical" : "current";
  if (surface === "SURF-MAT-ACTIVITY-001") {
    if (runtimeState.includes("required-input")) return "required-input";
    if (runtimeState.includes("processing")) return "processing";
    if (runtimeState.includes("blocked")) return "blocked";
    if (runtimeState.includes("closed-terminal")) return "closed";
    return "open";
  }
  if (surface === "SURF-MAT-PROPOSAL-001") {
    if (runtimeState.includes("adoption-in-progress")) return "applying";
    if (runtimeState.includes("failed")) return "failed";
    if (runtimeState.includes("pending-decision")) return "pending";
    if (runtimeState.includes("adopted")) return "adopted";
    if (runtimeState.includes("rejected")) return "rejected";
    return null;
  }
  if (surface === "SURF-MAT-EVIDENCE-001") return "text";
  if (surface === "SURF-MAT-APPROVAL-TASK-001") return runtimeState.includes("historical") ? "historical" : "current";
  if (surface === "SURF-MAT-EXEC-TASK-001") {
    if (runtimeState.includes("historical")) return "historical";
    if (runtimeState.includes("blocked")) return "blocked";
    if (runtimeState.includes("validation")) return "validation-recorded";
    return "current";
  }
  if (surface === "SURF-CONF-ARCHIVE-001") return runtimeState.includes("restore") ? "restore" : "archive";
  if (surface === "SURF-CONF-DOC-GIT-001") return runtimeState.includes("blocked") ? "blocked" : "default";
  return null;
};

const referenceTheme = (theme: RenderedAcceptanceInput["theme"]): ReferenceTheme =>
  theme === "Dark" ? "dark" : theme.startsWith("System/") ? "system" : "light";

const referenceViewportClass = (
  viewport: RenderedAcceptanceInput["viewport"],
): ReferenceViewportClass | null =>
  !Number.isFinite(viewport.width) || viewport.width <= 0 ||
  !Number.isFinite(viewport.height) || viewport.height <= 0 ? null
    : viewport.width >= 1280 ? "wide" : viewport.width >= 800 ? "medium" : "narrow";

// These are independently declared expectations from the persisted e2e fixtures,
 // not observations copied from the rendered workflow rail.
const referenceLifecycleFixture = (entry: RenderedAcceptanceInput): Readonly<{
  current: string; reached: readonly string[];
}> | null => {
  const precedingApproval = ["Work request", "Research", "Requirements", "Solution design", "Implementation plan", "Readiness review"];
  if (/^(Source editing workbench|Lifecycle editing workbench|Awaiting sign-off|unsaved Work request source)/.test(entry.fixture)) {
    return { current: "Approval", reached: precedingApproval };
  }
  if (entry.fixture.startsWith("Completed investigation")) {
    return { current: "Complete", reached: ["Work request", "Research"] };
  }
  if (entry.fixture.startsWith("Verified candidate")) {
    return { current: "Complete", reached: ["Work request", "Approval", "Implementation"] };
  }
  if (/^(Implementation action ready|Failed implementation feedback)/.test(entry.fixture)) {
    return { current: "Implementation", reached: ["Work request", "Approval"] };
  }
  if (/^(Proposal review|Proposal rejection review|Proposal adoption in progress|Workflow input required)/.test(entry.fixture)) {
    return { current: "Implementation plan", reached: ["Work request"] };
  }
  if (/^(Research open continuation|Research processing attention visual|Invalid lifecycle Markdown)/.test(entry.fixture)) {
    return { current: "Research", reached: ["Work request"] };
  }
  if (/^(Requirements document visual|Solution design document visual|Implementation plan document visual|Readiness input required)/.test(entry.fixture)) {
    const current = entry.fixture.startsWith("Readiness input required") ? "Readiness review" : entry.workflowStep;
    if (current === null) return null;
    return { current, reached: precedingApproval.slice(0, precedingApproval.indexOf(current)) };
  }
  if (/^(Change work type|Defect work type|Investigation work type|Audit work type|IA26 confirmation fixture|new untracked WorkItem documentation)/.test(entry.fixture)) {
    return { current: "Work request", reached: [] };
  }
  return null;
};

const resolveRenderedReference = (
  entry: RenderedAcceptanceInput,
  captureScope: string,
): RenderedAcceptanceReference => {
  const declared = referenceSurfaceById.get(entry.surface);
  if (declared === undefined) {
    throw new TypeError("rendered evidence surface is missing from reference manifest: " + entry.surface);
  }
  const state = canonicalReferenceState(entry.surface, entry.state);
  if (state !== null && !declared.states.includes(state)) {
    throw new TypeError("rendered evidence reference state is not manifest-declared: " + entry.surface + " / " + state);
  }
  const viewportClass = referenceViewportClass(entry.viewport);
  const theme = referenceTheme(entry.theme);
  const declaredScope = (state === null ? undefined : declared.stateCaptureScopes?.[state]) ?? declared.captureScope;
  const comparisonEligible =
    state !== null &&
    viewportClass !== null &&
    declared.viewports.includes(viewportClass) &&
    declared.themes.includes(theme) &&
    captureScope === declaredScope;
  const lifecycleFixture = referenceLifecycleFixture(entry);
  const query = state === null ? null :
    "?surf=" + encodeURIComponent(entry.surface) +
    "&state=" + encodeURIComponent(state) +
    "&theme=" + encodeURIComponent(theme) +
    "&step=" + encodeURIComponent(entry.workflowStep ?? "") +
    "&kind=" + encodeURIComponent(entry.workItemKind) +
    (lifecycleFixture === null ? "" : "&current=" + encodeURIComponent(lifecycleFixture.current) +
      "&reached=" + encodeURIComponent(lifecycleFixture.reached.join("|"))) +
    (entry.id === "ia26-implementation-validation-recorded-wide-light" ? "&attempt=reviewer-2" :
      entry.id === "ia26-implementation-builder-attempt-wide-light" ? "&attempt=builder-1" : "");
  return {
    manifestPath: referenceManifestPath,
    sourcePath: referenceAtlasPath,
    surface: declared.id,
    state,
    selector: declared.selector,
    captureScope: declaredScope,
    viewportClass,
    theme,
    authority: declared.authority,
    query,
    comparisonEligible,
  };
};

const writeRenderedAcceptanceEvidence = (
  entries: readonly RenderedAcceptanceEntry[],
): void => {
  if (renderedAcceptanceDir === undefined) {
    throw new TypeError("PONTIVUS_ORDER_RENDERED_ACCEPTANCE_DIR is required");
  }
  if (
    renderedAcceptanceCandidateSha === undefined ||
    renderedAcceptanceCandidateSha.length === 0
  ) {
    throw new TypeError(
      "PONTIVUS_ORDER_RENDERED_ACCEPTANCE_CANDIDATE_SHA is required",
    );
  }
  mkdirSync(renderedAcceptanceDir, { recursive: true });
  const manifestPath = join(renderedAcceptanceDir, "manifest.json");
  let priorEntries: readonly RenderedAcceptanceEntry[] = [];
  try {
    const prior = JSON.parse(readFileSync(manifestPath, "utf8")) as {
      candidateSha?: unknown;
      evidenceKind?: unknown;
      signedPhase?: unknown;
      entries?: unknown;
    };
    if (prior.candidateSha !== renderedAcceptanceCandidateSha) {
      throw new TypeError("rendered acceptance candidate changed within one evidence run");
    }
    if (prior.evidenceKind !== renderedEvidenceKind) {
      throw new TypeError("rendered evidence kind changed within one evidence run");
    }
    if ((prior.signedPhase ?? null) !== signedRenderedPhase) {
      throw new TypeError("signed rendered phase changed within one evidence run");
    }
    if (Array.isArray(prior.entries)) {
      priorEntries = prior.entries as readonly RenderedAcceptanceEntry[];
    }
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("ENOENT")) throw error;
  }
  const merged = [...priorEntries, ...entries];
  const duplicateIds = merged
    .map((entry) => entry.id)
    .filter((id, index, all) => all.indexOf(id) !== index);
  if (duplicateIds.length > 0) {
    throw new TypeError("duplicate rendered acceptance capture id: " + duplicateIds.join(", "));
  }
  writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        schemaVersion: 2,
        candidateSha: renderedAcceptanceCandidateSha,
        evidenceKind: renderedEvidenceKind,
        signedPhase: signedRenderedPhase,
        label: renderedAcceptanceLabel,
        entries: merged,
      },
      null,
      2,
    ) + "\n",
  );
  const referenceDir = join(renderedAcceptanceDir, "references");
  mkdirSync(referenceDir, { recursive: true });
  for (const [source, name] of [
    [referenceManifestPath, "reference-manifest.json"],
    [referenceAtlasPath, "reference-atlas.html"],
    [referenceReadmePath, "README.md"],
  ] as const) {
    writeFileSync(join(referenceDir, name), readFileSync(source));
  }

  writeFileSync(
    join(renderedAcceptanceDir, "index.md"),
    [
      "# Order 0.6.0 rendered acceptance — " + renderedAcceptanceLabel,
      "",
      "Exact candidate: `" + renderedAcceptanceCandidateSha + "`",
      "",
      "Evidence kind: `" + renderedEvidenceKind + "`",
      "Signed phase: " + (signedRenderedPhase ?? "none (unscoped or diagnostic/bounded)"),
      "",
      "| Capture | Surface/state | Scope | Reference | Authority |",
      "|---|---|---|---|---|",
      ...merged.map((entry) =>
        "| `" + entry.screenshot + "` | " + entry.surface + " / " + entry.state +
        " | " + (entry.captureScope ?? "viewport") +
        " | `" + entry.reference.surface + "` via `reference-manifest.json`" +
        (entry.reference.state === null ? " (no state-equivalent atlas reference)" : " / `" + entry.reference.state + "`") +
        (entry.referenceScreenshot === undefined ? " (not presented as equivalent)" : " (static reference PNG; visual disposition pending)") +
        " | " + entry.authorityRefs.map((value) => "`" + value + "`").join(", ") + " |"
      ),
      "",
      "These captures are runtime evidence only. The authority-bound manifest/atlas is derived comparison evidence; current canonical authority wins on every conflict. A row marked not presented as equivalent is not an acceptance comparison.",
      "",
    ].join("\n"),
  );

  const escapeHtml = (value: string): string =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  writeFileSync(
    join(renderedAcceptanceDir, "comparison.html"),
    [
      "<!doctype html>",
      '<html lang="en"><head><meta charset="utf-8">',
      "<title>Order 0.6.0 " + escapeHtml(renderedAcceptanceLabel) + " rendered acceptance</title>",
      "<style>",
      "body{font-family:system-ui,sans-serif;margin:0;background:#f6f7f9;color:#111827}header{position:sticky;top:0;background:white;border-bottom:1px solid #d1d5db;padding:16px 24px;z-index:2}main{padding:24px;display:grid;gap:24px}.case{background:white;border:1px solid #d1d5db;border-radius:8px;padding:16px}.meta{display:flex;gap:12px;flex-wrap:wrap;margin:8px 0 16px;color:#4b5563}.pair{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px}.visual{border:1px solid #e5e7eb;background:#fff;padding:8px;overflow:auto}.visual img{display:block;width:auto;max-width:none;height:auto;border:0}.refs{display:grid;gap:12px}@media(max-width:900px){.pair{grid-template-columns:1fr}}code{font-size:.9em}h2{margin-bottom:4px}",
      "</style></head><body>",
      "<header><strong>Order 0.6.0 " + escapeHtml(renderedAcceptanceLabel) + "</strong> · exact candidate <code>" + escapeHtml(renderedAcceptanceCandidateSha) + "</code></header>",
      "<main>",
      ...merged.map((entry) => {
        const refs = entry.referenceScreenshot !== undefined
          ? '<div class="visual"><strong>Authority-bound derived reference: ' +
            escapeHtml(entry.reference.surface + " / " + entry.reference.state) +
            '</strong><img src="references/' + encodeURIComponent(entry.referenceScreenshot) +
            '" alt="Derived reference ' + escapeHtml(entry.reference.surface) + '"></div>'
          : '<div class="visual"><strong>Reference comparison withheld</strong><p>' +
            'No state/scope/viewport-equivalent atlas comparison is declared for this capture. ' +
            'See <code>references/reference-manifest.json</code>; do not infer a target from a fallback image.</p></div>';
        return '<section class="case"><h2>' + escapeHtml(entry.id) + '</h2>' +
          '<div class="meta"><span><code>' + escapeHtml(entry.surface) + '</code></span>' +
          '<span>' + escapeHtml(entry.state) + '</span><span>' +
          escapeHtml(entry.viewport.width + "×" + entry.viewport.height) +
          '</span><span>' + escapeHtml(entry.theme) + '</span></div>' +
          '<div class="pair"><div class="visual"><strong>Runtime PNG</strong><img src="' +
          encodeURIComponent(entry.screenshot) + '" alt="' + escapeHtml(entry.id) +
          '"></div><div class="refs">' + refs + '</div></div></section>';
      }),
      "</main></body></html>",
    ].join("\n"),
  );
};

const captureRenderedAcceptance = async (
  page: Page,
  entry: RenderedAcceptanceInput,
  target?: Locator,
): Promise<RenderedAcceptanceEntry> => {
  if (renderedAcceptanceDir === undefined) {
    throw new TypeError("PONTIVUS_ORDER_RENDERED_ACCEPTANCE_DIR is required");
  }
  mkdirSync(renderedAcceptanceDir, { recursive: true });
  const screenshot = entry.id + ".png";
  expect(page.viewportSize(), entry.id + " runtime viewport").toEqual(entry.viewport);
  if (entry.workflowStep === "Approval" && !entry.state.includes("stale") &&
      (entry.surface === "SURF-STEP-APPROVAL-001" ||
       entry.surface === "SURF-MAT-APPROVAL-TASK-001")) {
    await expect(page.getByText("Resolving approval package…", { exact: true })).toHaveCount(0);
    await expect(page.getByTestId("review-verdict")).toBeVisible();
  }
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  const declaredReference = referenceSurfaceById.get(entry.surface);
  if (declaredReference === undefined) {
    throw new TypeError("rendered evidence surface is missing from reference manifest: " + entry.surface);
  }
  const shellChromeCapture = entry.surface === "SURF-WI-001" &&
    !entry.state.includes("attention");
  const shellAttentionCapture = entry.surface === "SURF-WI-001" &&
    entry.state.includes("attention");
  const referenceState = canonicalReferenceState(entry.surface, entry.state);
  const declaredScope = (referenceState === null ? undefined : declaredReference.stateCaptureScopes?.[referenceState]) ?? declaredReference.captureScope;
  const toolbarCapture = entry.surface === "SURF-APP-001" && declaredScope === "component-reference";
  const acceptanceTarget = shellChromeCapture
      ? page.locator(".order-workbench-chrome")
      : diagnosticCurrentState || shellAttentionCapture
        ? target
        : toolbarCapture ? page.getByTestId("workbench-toolbar")
          : declaredScope === "full-workbench" ? undefined : target;
  if (!diagnosticCurrentState &&
      declaredScope === "component-reference" &&
      acceptanceTarget === undefined) {
    throw new TypeError("component-reference acceptance requires an explicit governed locator: " + entry.surface);
  }
  if (acceptanceTarget === undefined) {
    await page.screenshot({
      path: join(renderedAcceptanceDir, screenshot),
      fullPage: false,
      animations: "disabled",
      scale: "css",
    });
  } else {
    await acceptanceTarget.screenshot({
      path: join(renderedAcceptanceDir, screenshot),
      animations: "disabled",
      scale: "css",
    });
  }
  const captureScope = diagnosticCurrentState
      ? entry.captureScope ?? (acceptanceTarget === undefined ? "full application viewport" : "explicit locator crop")
      : shellAttentionCapture ? "production current-attention region only"
      : declaredScope;
  const reference = resolveRenderedReference(entry, captureScope);
  let referenceScreenshot: string | undefined;
  if (reference.comparisonEligible && reference.query !== null) {
    const referenceDir = join(renderedAcceptanceDir, "references");
    mkdirSync(referenceDir, { recursive: true });
    const referencePage = await page.context().newPage();
    try {
      await referencePage.setViewportSize(entry.viewport);
      expect(referencePage.viewportSize()).toEqual(entry.viewport);
      await referencePage.emulateMedia({
        colorScheme: entry.theme === "Dark" || entry.theme === "System/dark" ? "dark" : "light",
      });
      await referencePage.route("https://order-reference.invalid/**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "text/html",
          body: readFileSync(referenceAtlasPath, "utf8"),
        });
      });
      await referencePage.goto("https://order-reference.invalid/" + reference.query);
      const referenceSurface = referencePage.locator(reference.selector);
      await expect(referenceSurface).toBeVisible();
      await expect(referenceSurface).toHaveAttribute("data-state", reference.state!);
      const expectedDark = entry.theme === "Dark" || entry.theme === "System/dark";
      expect(await referencePage.locator("html").evaluate(node => node.classList.contains("dark"))).toBe(expectedDark);
      const lifecycleFixture = referenceLifecycleFixture(entry);
      const referenceRail = referenceSurface.locator(".rail");
      if (lifecycleFixture !== null && await referenceRail.count() > 0) {
        await expect(referenceRail.locator(".rail-cell.current .process-label")).toHaveText(lifecycleFixture.current);
        await expect(referenceRail.locator(".rail-cell.reached .process-label")).toHaveText(lifecycleFixture.reached);
        if (entry.workflowStep !== null) await expect(referenceRail.locator(".rail-cell.selected .process-label")).toHaveText(entry.workflowStep);
      }
      if (entry.id === "ia26-implementation-validation-recorded-wide-light" || entry.id === "ia26-implementation-builder-attempt-wide-light") {
        const reviewer = entry.id === "ia26-implementation-validation-recorded-wide-light";
        await expect(referenceSurface.locator(".attempts .masteritem.current strong")).toHaveText(
          reviewer ? "Independent review · Attempt 2" : "Implementation agent · Attempt 1");
        await expect(referenceSurface.locator(".attempt-heading")).toHaveText("Attempts");
        if (reviewer) await expect(referenceSurface.locator(".validation-results tbody tr")).toHaveCount(8);
        else await expect(referenceSurface.locator(".validation-results")).toContainText("No validation results in this attempt");
      }
      await referencePage.evaluate(async () => { await document.fonts.ready; });
      referenceScreenshot = entry.id + "-reference.png";
      const options = {
        path: join(referenceDir, referenceScreenshot),
        animations: "disabled" as const,
        scale: "css" as const,
      };
      if (reference.captureScope === "component-reference") {
        const component = entry.surface === "SURF-APP-001" ? ".toolbar"
          : entry.surface === "SURF-WI-001" ? ".workitem-chrome"
          : entry.surface === "SURF-MAT-APPROVAL-TASK-001" ? ".review" : ".dialog";
        await referenceSurface.locator(component).screenshot(options);
      } else {
        await referencePage.screenshot({ ...options, fullPage: false });
      }
    } finally {
      await referencePage.close();
    }
  }
  const captured = {
    ...entry,
    captureScope,
    reference,
    screenshot,
    ...(referenceScreenshot === undefined ? {} : { referenceScreenshot }),
  };
  if (diagnosticCurrentState || signedRenderedPhase !== null) {
    writeRenderedAcceptanceEvidence([captured]);
  }
  return captured;
};

const fixtureMutation = async (
  request: APIRequestContext,
  action: "/start-stage" | "/submit-input" | "/tick",
  data: Record<string, unknown>,
): Promise<unknown> => {
  const response = await request.post(fixtureControlURL + action, { data });
  expect(response.ok()).toBe(true);
  return response.json();
};

const mintConnectToken = async (
  request: APIRequestContext,
): Promise<string> => {
  const response = await request.post("/api/auth/connect-token", {
    headers: { authorization: "Bearer " + daemonToken },
    data: {},
  });
  expect(response.status()).toBe(200);
  const body = await response.json() as { token?: unknown };
  expect(typeof body.token).toBe("string");
  return String(body.token);
};

const authenticate = async (
  page: Page,
  request: APIRequestContext,
): Promise<void> => {
  const token = await mintConnectToken(request);
  await page.goto("/connect?token=" + token);
  await expect(page).toHaveURL(baseURL + "/");
  await expect(page.getByText("Order", { exact: true })).toBeVisible();
};

const rowFor = (page: Page, title: string) =>
  page
    .locator('[data-testid^="work-item-row-"]')
    .filter({ has: page.getByText(title, { exact: true }) })
    .first();

const recoveryFixtureEventIds = new Map([
  ["Workflow retry action", "event_00000000-0000-4000-8000-000000000001"],
  ["Workflow resume action", "event_00000000-0000-4000-8000-000000000002"],
] as const);
const recoveryFixtureRoutes = new WeakMap<Page, Set<string>>();

const ensureCanonicalRecoveryFixture = async (
  page: Page,
  title: string,
): Promise<void> => {
  const syntheticEventId = recoveryFixtureEventIds.get(
    title as "Workflow retry action" | "Workflow resume action",
  );
  if (syntheticEventId === undefined) return;

  const installed = recoveryFixtureRoutes.get(page) ?? new Set<string>();
  if (installed.has(title)) return;

  const workItemsResponse = await page.context().request.get("/api/work-items");
  expect(workItemsResponse.status()).toBe(200);
  const workItems = WorkItemSchema.array().parse(await workItemsResponse.json());
  const workItem = workItems.find((candidate) => candidate.title === title);
  expect(workItem).toBeDefined();

  const runsResponse = await page.context().request.get(
    "/api/work-items/" + workItem!.id + "/runs",
  );
  expect(runsResponse.status()).toBe(200);
  const runs = RunSchema.array().parse(await runsResponse.json());
  const run = runs.find((candidate) =>
    candidate.stage === "PLAN" &&
    (candidate.status === "FAILED" || candidate.status === "BLOCKED")
  );
  expect(run).toBeDefined();

  const eventsResponse = await page.context().request.get(
    "/api/runs/" + run!.id + "/events?afterSequence=0",
  );
  expect(eventsResponse.status()).toBe(200);
  const events = RunEventSchema.array().parse(await eventsResponse.json());
  const canonicalEvents = events.some((event) => event.event.tag === "STAGE_STARTED")
    ? events
    : [
        RunEventSchema.parse({
          id: syntheticEventId,
          runId: run!.id,
          sequence: 1,
          occurredAt: run!.startedAt,
          event: {
            tag: "STAGE_STARTED",
            stage: "PLAN",
            mode: "INTERACTIVE",
            contextHash: run!.contextHash,
          },
        }),
        ...events.map((event) => RunEventSchema.parse({
          ...event,
          sequence: event.sequence + 1,
        })),
      ];

  await page.route(
    "**/api/runs/" + run!.id + "/events*",
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(canonicalEvents),
      });
    },
  );
  installed.add(title);
  recoveryFixtureRoutes.set(page, installed);
};

const openWorkItem = async (page: Page, title: string): Promise<void> => {
  await ensureCanonicalRecoveryFixture(page, title);
  const row = rowFor(page, title);
  await expect(row).toBeVisible();
  await row.click();
  await expect(page.getByTestId("work-item-workspace")).toBeVisible();
  await expect(page.getByTestId("work-item-heading")).toHaveText(title);
};

const backToQueue = async (page: Page): Promise<void> => {
  await page.getByRole("link", { name: "Back to queue" }).click();
  await expect(page.getByTestId("work-item-queue")).toBeVisible();
};

const selectWorkflowStep = async (
  page: Page,
  name:
    | "Work request"
    | "Research"
    | "Requirements"
    | "Solution design"
    | "Implementation plan"
    | "Readiness review"
    | "Approval"
    | "Implementation"
    | "Acceptance"
    | "Complete",
): Promise<void> => {
  const button = page
    .getByTestId("workflow-rail")
    .getByRole("button", { name, exact: true });
  await button.click();
  await expect(button).toHaveAttribute("aria-pressed", "true");
};

const openMarkdownEditor = async (
  page: Page,
  editorName: string,
) => {
  const editor = page.getByLabel(editorName);
  if (!(await editor.isVisible().catch(() => false))) {
    const edit = page.getByRole("button", { name: "Edit", exact: true });
    await expect(edit).toBeVisible();
    await edit.click();
  }
  await expect(editor).toBeVisible();
  return editor;
};

const openWorkflowResource = async (
  page: Page,
  label: string,
): Promise<void> => {
  const viewAction = page.getByRole("button", {
    name: "View " + label,
    exact: true,
  });
  if (await viewAction.isVisible().catch(() => false)) {
    await viewAction.click();
    return;
  }
  const masterItem = page.getByTestId("workbench-master-detail-master").getByText(label, { exact: true });
  if (await masterItem.isVisible().catch(() => false)) {
    await masterItem.click();
    return;
  }
  const openAction = page.getByRole("button", {
    name: "Open " + label,
    exact: true,
  });
  await expect(openAction).toBeVisible();
  await openAction.click();
};

const selectWorkflowMaterial = openWorkflowResource;
const selectCurrentWorkflowMaterial = openWorkflowResource;

const openDisclosureResource = async (
  page: Page,
  disclosureName: string,
  actionName: string,
): Promise<void> => {
  const disclosure = page.getByRole("button", { name: disclosureName, exact: true });
  if (await disclosure.isVisible().catch(() => false)) {
    const expanded = await disclosure.getAttribute("aria-expanded");
    if (expanded !== "true") await disclosure.click();
  }
  const action = page.getByRole("button", { name: actionName, exact: true });
  await expect(action).toBeVisible();
  await action.click();
};

const markdownSourceValue = async (editor: Locator): Promise<string> =>
  editor.evaluate((node) =>
    Array.from(node.querySelectorAll(".cm-line"))
      .map((line) => line.textContent ?? "")
      .join("\n"));

const replaceMarkdownSource = async (
  page: Page,
  editor: Locator,
  markdown: string,
): Promise<void> => {
  // CodeMirror's contenteditable spans the full document height. Target a rendered
  // line so pointer interaction is exercised inside the visible editor viewport,
  // rather than asking Playwright to click the offscreen center of the full document.
  await editor.locator(".cm-line").first().click();
  await editor.press("Control+A");
  await page.keyboard.insertText(markdown);
  const finalLine = markdown.split("\n").at(-1) ?? "";
  await expect(editor.locator(".cm-line").last()).toHaveText(finalLine);
};

const workItemForTitle = async (
  page: Page,
  title: string,
) => {
  const response = await page.context().request.get("/api/work-items");
  expect(response.status()).toBe(200);
  const workItems = WorkItemSchema.array().parse(await response.json());
  const workItem = workItems.find((candidate) => candidate.title === title);
  expect(workItem).toBeDefined();
  return workItem!;
};

test("browser bootstrap is local, one-time, exact-cookie, origin-bound, and expiry-aware", async ({
  page,
  request,
}) => {
  const unauthenticated = await request.get("/api/work-items");
  expect(unauthenticated.status()).toBe(401);

  const headerToken = await mintConnectToken(request);
  const connect = await request.get("/connect?token=" + headerToken, {
    maxRedirects: 0,
  });
  expect(connect.status()).toBe(303);
  expect(connect.headers()["location"]).toBe("/");
  expect(connect.headers()["cache-control"]).toBe("no-store");
  expect(connect.headers()["referrer-policy"]).toBe("no-referrer");
  expect(connect.headers()["set-cookie"]).toMatch(
    /^pontivus_order_session=[0-9a-f]{64}; Path=\/; HttpOnly; SameSite=Strict$/,
  );
  const reused = await request.get("/connect?token=" + headerToken, {
    maxRedirects: 0,
  });
  expect(reused.status()).toBe(401);

  await authenticate(page, request);
  const cookies = await page.context().cookies();
  const session = cookies.find((cookie) => cookie.name === "pontivus_order_session");
  expect(session).toMatchObject({
    httpOnly: true,
    secure: false,
    sameSite: "Strict",
    path: "/",
  });

  const missingOrigin = await page.context().request.post("/api/tick", {
    data: {},
  });
  expect(missingOrigin.status()).toBe(401);
  const wrongOrigin = await page.context().request.post("/api/tick", {
    headers: { origin: "http://127.0.0.1:1" },
    data: {},
  });
  expect(wrongOrigin.status()).toBe(401);

  test.setTimeout(90_000);
  const expiringToken = await mintConnectToken(request);
  await new Promise((resolve) => setTimeout(resolve, 61_000));
  const expired = await request.get("/connect?token=" + expiringToken, {
    maxRedirects: 0,
  });
  expect(expired.status()).toBe(401);
});

test("appearance uses a direct compact mode switcher, follows system mode, and persists explicit overrides", async ({
  page,
  request,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await authenticate(page, request);

  const root = page.locator("html");
  const layout = page.getByTestId("workbench-app-shell");
  const toolbar = page.getByTestId("workbench-toolbar");
  const system = page.getByRole("radio", { name: "System" });
  const light = page.getByRole("radio", { name: "Light" });
  const dark = page.getByRole("radio", { name: "Dark" });
  const radioLabelContrast = async (radio: Locator): Promise<number> =>
    radio.evaluate((node) => {
      const parseColor = (value: string): readonly [number, number, number, number] => {
        const match = value.match(
          /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/,
        );
        if (match === null) throw new TypeError("unsupported computed color: " + value);
        return [
          Number(match[1]),
          Number(match[2]),
          Number(match[3]),
          match[4] === undefined ? 1 : Number(match[4]),
        ];
      };
      const composite = (
        foreground: readonly [number, number, number, number],
        background: readonly [number, number, number, number],
      ): readonly [number, number, number, number] => {
        const alpha = foreground[3] + background[3] * (1 - foreground[3]);
        if (alpha === 0) return [0, 0, 0, 0];
        return [
          (foreground[0] * foreground[3] + background[0] * background[3] * (1 - foreground[3])) / alpha,
          (foreground[1] * foreground[3] + background[1] * background[3] * (1 - foreground[3])) / alpha,
          (foreground[2] * foreground[3] + background[2] * background[3] * (1 - foreground[3])) / alpha,
          alpha,
        ];
      };
      const luminance = (color: readonly [number, number, number, number]): number => {
        const linear = color.slice(0, 3).map((channel) => {
          const normalized = channel / 255;
          return normalized <= 0.04045
            ? normalized / 12.92
            : ((normalized + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!;
      };
      const track = node.parentElement;
      const toolbarElement = node.closest('[data-testid="workbench-toolbar"]');
      if (track === null || toolbarElement === null) {
        throw new TypeError("theme control is outside the Workbench toolbar");
      }
      const foreground = parseColor(getComputedStyle(node).color);
      const itemBackground = parseColor(getComputedStyle(node).backgroundColor);
      const trackBackground = parseColor(getComputedStyle(track).backgroundColor);
      const toolbarBackground = parseColor(getComputedStyle(toolbarElement).backgroundColor);
      const background = composite(
        itemBackground,
        composite(trackBackground, toolbarBackground),
      );
      const foregroundLuminance = luminance(foreground);
      const backgroundLuminance = luminance(background);
      const lighter = Math.max(foregroundLuminance, backgroundLuminance);
      const darker = Math.min(foregroundLuminance, backgroundLuminance);
      return (lighter + 0.05) / (darker + 0.05);
    });
  const expectThemeControlContrast = async (): Promise<void> => {
    // Astryx animates segment foreground/background colors. The toolbar
    // background may already be current while a segment is still transitioning.
    // Establish settled control paint independently of the contrast result.
    await expect.poll(
      () => system.evaluate(async (node) => {
        const group = node.closest('[role="radiogroup"]');
        if (group === null) throw new TypeError("theme radio has no group");
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        );
        for (const radio of group.querySelectorAll('[role="radio"]')) {
          // Force computed-style resolution before observing CSS transitions.
          void getComputedStyle(radio).color;
          void getComputedStyle(radio).backgroundColor;
        }
        return group.getAnimations({ subtree: true }).some(
          (animation) => animation.pending || animation.playState === "running",
        );
      }),
      { message: "theme control paint must settle before contrast measurement" },
    ).toBe(false);
    for (const [label, radio] of [["System", system], ["Light", light], ["Dark", dark]] as const) {
      expect(await radioLabelContrast(radio), label + " settled text contrast").toBeGreaterThanOrEqual(4.5);
    }
  };

  await expect(toolbar.locator("select")).toHaveCount(0);
  await expect(system).toBeChecked();
  await expect(root).not.toHaveAttribute("data-theme");
  await expect(root).toHaveAttribute("data-astryx-theme");
  await expect(layout).toHaveCSS("background-color", "rgb(17, 26, 41)");
  await expect(toolbar).toHaveCSS("background-color", "rgb(17, 26, 41)");
  await expectThemeControlContrast();

  await expect(
    page.getByTestId("workbench-search").getByRole("searchbox"),
  ).toHaveCSS("color", "rgb(237, 243, 250)");

  await light.click();
  await expect(root).toHaveAttribute("data-theme", "light");
  await expect(layout).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(toolbar).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expectThemeControlContrast();

  await page.reload();
  await expect(page.getByRole("radio", { name: "Light" })).toBeChecked();

  await page.getByRole("radio", { name: "Dark" }).click();
  await expect(root).toHaveAttribute("data-theme", "dark");
  await expect(layout).toHaveCSS("background-color", "rgb(17, 26, 41)");
  await expect(toolbar).toHaveCSS("background-color", "rgb(17, 26, 41)");
  await expectThemeControlContrast();
  await page.reload();
  await expect(page.getByRole("radio", { name: "Dark" })).toBeChecked();

  await page.getByRole("radio", { name: "System" }).click();
  await expect(root).not.toHaveAttribute("data-theme");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(layout).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(toolbar).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expectThemeControlContrast();

  await page.emulateMedia({ colorScheme: "dark" });
  await expect(layout).toHaveCSS("background-color", "rgb(17, 26, 41)");
  await expect(toolbar).toHaveCSS("background-color", "rgb(17, 26, 41)");
  await expectThemeControlContrast();
  await page.reload();
  await expect(page.getByRole("radio", { name: "System" })).toBeChecked();
});

test("System, Light and Dark preserve representative Workbench semantic roles", async ({
  page,
  request,
}) => {
  test.setTimeout(300_000);
  await page.emulateMedia({ colorScheme: "dark" });
  await authenticate(page, request);
  await page.setViewportSize({ width: 1280, height: 800 });

  for (const theme of ["System", "Light", "Dark"] as const) {
    await page.goto("/");
    await page.getByRole("radio", { name: theme }).click();
    await expect(page.getByTestId("work-item-queue")).toBeVisible();

    await page.getByRole("button", { name: "New work item" }).click();
    await expect(page.getByRole("dialog", { name: "Create work item" })).toBeVisible();
    await page.getByRole("button", { name: "Cancel", exact: true }).click();

    await page.getByRole("link", { name: "Settings", exact: true }).click();
    await expect(page.getByTestId("settings-workspace")).toBeVisible();

    await page.goto("/");
    await openWorkItem(page, "Implementation plan document visual");
    await expect(page.getByTestId("lifecycle-document-material")).toBeVisible();
    await page.getByRole("button", { name: "Context", exact: true }).click();
    await expect(page.getByTestId("work-item-context")).toBeVisible();

    await page.goto("/");
    await openWorkItem(page, "Research open continuation");
    await expect(page.getByTestId("activity-detail")).toBeVisible();
    await expect(page.getByTestId("activity-composer")).toBeVisible();

    await page.goto("/");
    await openWorkItem(page, "Readiness ready after Plan");
    await expect(page.getByTestId("review-workspace")).toBeVisible();

    await page.goto("/");
    await openWorkItem(page, "Verified candidate");
    await selectWorkflowStep(page, "Implementation");
    await expect(page.getByTestId("execution-workspace")).toBeVisible();
    await selectWorkflowMaterial(page, "Independent review · Attempt 2");
    const reviewEvidence = page
      .locator('[data-evidence-path="review.txt"]')
      .first()
      .getByRole("button", { name: "Evidence: review.txt" });
    await reviewEvidence.scrollIntoViewIfNeeded();
    await reviewEvidence.click();
    await expect(page.getByRole("heading", { name: "Evidence", exact: true })).toBeVisible();
    await expect(page.getByTestId("raw-content-view")).toBeVisible();
    await page.getByRole("button", { name: "Back to workflow context" }).click();
    await selectWorkflowStep(page, "Complete");
    await expect(page.getByTestId("result-workspace")).toBeVisible();
  }
});

test("Settings uses stable native-history destinations and daemon-owned readiness", async ({
  page,
  request,
}) => {
  await authenticate(page, request);

  await page.getByRole("link", { name: "Settings", exact: true }).click();
  await expect(page).toHaveURL(baseURL + "/settings/repositories");
  const settings = page.getByTestId("settings-workspace");
  await expect(settings).toBeVisible();
  const repositories = page.getByTestId("settings-repositories");
  await expect(repositories).toBeVisible();
  await expect(settings).toContainText("WorkItem documents");
  const readinessResponse = await page.request.get("/api/settings/readiness");
  expect(readinessResponse.status()).toBe(200);
  const installationReadiness = InstallationReadinessSchema.parse(
    await readinessResponse.json(),
  );
  const readyForProductiveWork = settings.getByText(
    "Ready for productive work",
    { exact: true },
  );
  const expectDaemonReadiness = async (): Promise<void> => {
    if (installationReadiness.ready) {
      await expect(readyForProductiveWork).toBeVisible();
      return;
    }
    await expect(readyForProductiveWork).toHaveCount(0);
    await expect(
      settings.getByText("Setup requires attention", { exact: true }),
    ).toBeVisible();
  };
  await expectDaemonReadiness();
  await expect(repositories.getByTestId("add-repository-form")).toHaveCount(0);
  await expectDaemonReadiness();
  await repositories.getByRole("button", { name: "Add repository" }).click();
  await expect(repositories.getByTestId("add-repository-form")).toBeVisible();
  await expectDaemonReadiness();
  await expect(repositories.getByText("Order does not create or initialize repositories here.")).toBeVisible();
  await repositories.getByRole("button", { name: "Cancel add repository" }).click();
  await expect(repositories.getByTestId("add-repository-form")).toHaveCount(0);

  const repositoryTable = repositories.getByRole("table", {
    name: "Connected repositories",
  });
  const repositoryRow = repositoryTable.getByRole("row").nth(1);
  await expect(repositoryRow).toBeVisible();
  await expect(repositoryRow).toContainText(repositoryRoot);
  await expect(repositoryRow).toContainText("docs/order/work-items");
  await expect(repositories.getByRole("button", { name: "Technical details", exact: true })).toHaveCount(0);
  // The Settings diagnostics owner is required, but its final interaction
  // mechanism belongs to IA34/IA26 and is not preserved as a generic disclosure.
  const moveDocuments = repositoryRow.getByRole("button", { name: /^Move WorkItem documents for / });
  await moveDocuments.click();
  const movePanel = repositories.getByTestId("move-workitem-documents");
  await expect(movePanel).toContainText("Current repository-relative root");
  await expect(movePanel).toContainText("docs/order/work-items");
  await expectDaemonReadiness();
  await expect(movePanel.getByLabel("New repository-relative WorkItem document root")).toBeVisible();
  await movePanel.getByRole("button", { name: "Cancel move" }).click();
  await expect(movePanel).toHaveCount(0);
  await expectDaemonReadiness();

  const disconnectRepository = repositoryRow.getByRole("button", { name: /^Disconnect / });
  await disconnectRepository.click();
  const disconnectDialog = page.getByRole("alertdialog", { name: "Disconnect repository?" });
  await expect(disconnectDialog).toContainText(repositoryRoot);
  await expect(disconnectDialog).toContainText("This removes only Order's connection.");
  await expect(disconnectDialog).toContainText(
    "Repository files, WorkItem Markdown, Git history and authority documents are not deleted.",
  );
  await disconnectDialog.getByRole("button", { name: "Cancel" }).click();
  await expect(repositoryRow).toBeVisible();
  await expect(disconnectRepository).toBeFocused();

  await settings.getByRole("link", { name: "Model & runtime", exact: true }).click();
  await expect(page).toHaveURL(baseURL + "/settings/model");
  await expect(page.getByTestId("settings-model")).toBeVisible();
  await expectDaemonReadiness();

  await settings.getByRole("link", { name: "OpenCode", exact: true }).click();
  await expect(page).toHaveURL(baseURL + "/settings/opencode");
  await expect(page.getByTestId("settings-opencode")).toBeVisible();
  await expectDaemonReadiness();

  await page.goBack();
  await expect(page).toHaveURL(baseURL + "/settings/model");
  await page.goBack();
  await expect(page).toHaveURL(baseURL + "/settings/repositories");
  await page.goBack();
  await expect(page).toHaveURL(baseURL + "/");
  await expect(page.getByTestId("work-item-queue")).toBeVisible();

  await page.goForward();
  await expect(page).toHaveURL(baseURL + "/settings/repositories");
  await expect(page.getByTestId("settings-workspace")).toBeVisible();
});

test("global OpenCode account utility switches, renames, signs in, blocks during active Runs, and remains responsive", async ({
  page,
  request,
}) => {
  const loginAttemptId = "00000000-0000-4000-8000-000000000001";
  let pollCount = 0;
  let state = OpenCodeAccountStateSchema.parse({
    accounts: [
      {
        id: "cred_alpha",
        label: "alpha@example.com",
        active: true,
        status: { status: "READY" },
      },
      {
        id: "cred_beta",
        label: "beta@example.com",
        active: false,
        status: { status: "READY" },
      },
      {
        id: "cred_gamma",
        label: "gamma@example.com",
        active: false,
        status: {
          status: "NEEDS_AUTH",
          message: "Reconnect account",
          url: "https://opencode.ai/console/reconnect",
        },
      },
    ],
    activeAccountId: "cred_alpha",
    mutationBlockers: [],
  });

  await page.route("**/api/opencode/accounts**", async (route) => {
    const requestForRoute = route.request();
    const url = new URL(requestForRoute.url());
    const path = url.pathname;
    const method = requestForRoute.method();

    const fulfillJson = async (value: unknown, status = 200): Promise<void> => {
      await route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(value),
      });
    };

    if (path === "/api/opencode/accounts" && method === "GET") {
      await fulfillJson(state);
      return;
    }

    if (path === "/api/opencode/accounts/cred_beta/activate" && method === "POST") {
      const body = requestForRoute.postDataJSON() as { expectedActiveAccountId?: unknown };
      expect(body.expectedActiveAccountId).toBe("cred_alpha");
      state = OpenCodeAccountStateSchema.parse({
        ...state,
        accounts: state.accounts.map((account) => ({
          ...account,
          active: account.id === "cred_beta",
        })),
        activeAccountId: "cred_beta",
      });
      await fulfillJson(state);
      return;
    }

    if (path === "/api/opencode/accounts/cred_beta" && method === "PATCH") {
      const body = requestForRoute.postDataJSON() as { label?: unknown };
      expect(body.label).toBe("beta+renamed@example.com");
      state = OpenCodeAccountStateSchema.parse({
        ...state,
        accounts: state.accounts.map((account) =>
          account.id === "cred_beta"
            ? { ...account, label: "beta+renamed@example.com" }
            : account),
      });
      await fulfillJson(state);
      return;
    }

    const removeMatch = /^\/api\/opencode\/accounts\/([^/]+)$/.exec(path);
    if (removeMatch !== null && method === "DELETE") {
      const body = requestForRoute.postDataJSON() as { expectedActiveAccountId?: unknown };
      expect(body.expectedActiveAccountId).toBe(state.activeAccountId);
      const accountId = removeMatch[1]!;
      const removingActive = state.activeAccountId === accountId;
      state = OpenCodeAccountStateSchema.parse({
        ...state,
        accounts: state.accounts
          .filter((account) => account.id !== accountId)
          .map((account) => removingActive ? { ...account, active: false } : account),
        activeAccountId: removingActive ? null : state.activeAccountId,
      });
      await fulfillJson(state);
      return;
    }

    if (path === "/api/opencode/accounts/login" && method === "POST") {
      const body = requestForRoute.postDataJSON() as { label?: unknown };
      expect(body.label).toBe("delta@example.com");
      await fulfillJson(OpenCodeAccountLoginAttemptSchema.parse({
        id: loginAttemptId,
        authorizationUrl: "https://opencode.ai/console/device",
        instructions: "Open the verification page and continue.",
        expiresAt: "2026-11-13T04:00:00.000Z",
        status: "PENDING",
        message: null,
      }), 201);
      return;
    }

    if (path === `/api/opencode/accounts/login/${loginAttemptId}` && method === "GET") {
      pollCount += 1;
      if (pollCount < 2) {
        await fulfillJson(OpenCodeAccountLoginAttemptSchema.parse({
          id: loginAttemptId,
          authorizationUrl: "https://opencode.ai/console/device",
          instructions: "Open the verification page and continue.",
          expiresAt: "2026-11-13T04:00:00.000Z",
          status: "PENDING",
          message: null,
        }));
        return;
      }
      state = OpenCodeAccountStateSchema.parse({
        accounts: [
          ...state.accounts.map((account) => ({ ...account, active: false })),
          {
            id: "cred_delta",
            label: "delta@example.com",
            active: true,
            status: { status: "READY" },
          },
        ],
        activeAccountId: "cred_delta",
        mutationBlockers: [],
      });
      await fulfillJson(OpenCodeAccountLoginAttemptSchema.parse({
        id: loginAttemptId,
        authorizationUrl: "https://opencode.ai/console/device",
        instructions: "Open the verification page and continue.",
        expiresAt: "2026-11-13T04:00:00.000Z",
        status: "COMPLETED",
        message: null,
      }));
      return;
    }

    if (path === `/api/opencode/accounts/login/${loginAttemptId}` && method === "DELETE") {
      await route.fulfill({ status: 204 });
      return;
    }

    await route.fallback();
  });

  await authenticate(page, request);
  const trigger = page.getByTestId("opencode-account-trigger");
  await expect(trigger).toContainText("alpha@example.com");
  await trigger.click();
  await expect(page).toHaveURL(baseURL + "/settings/opencode");

  const panel = page.getByTestId("settings-opencode");
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("table", { name: "Saved OpenCode accounts" })).toContainText("alpha@example.com");
  await expect(panel.getByRole("table", { name: "Saved OpenCode accounts" })).toContainText("beta@example.com");
  await expect(panel.getByRole("table", { name: "Saved OpenCode accounts" })).toContainText("gamma@example.com");
  await expect(panel).toContainText("Needs sign-in");
  await expect(panel).not.toContainText("cred_alpha");

  await panel.getByRole("button", { name: "Switch to beta@example.com" }).click();
  await expect(trigger).toContainText("beta@example.com");

  await panel.getByRole("button", { name: "Rename beta@example.com" }).click();
  await panel.getByLabel("Account label").fill("beta+renamed@example.com");
  await panel.getByRole("button", { name: "Save account label" }).click();
  await expect(panel).toContainText("beta+renamed@example.com");
  await expect(trigger).toContainText("beta+renamed@example.com");

  await panel.getByRole("button", { name: "Remove gamma@example.com" }).click();
  const removeDialog = page.getByRole("alertdialog");
  await expect(removeDialog).toContainText("gamma@example.com");
  await expect(removeDialog).toContainText("Repository selection and model configuration are unchanged.");
  await expect(removeDialog).not.toContainText("cred_gamma");
  await removeDialog.getByRole("button", { name: "Remove account" }).click();
  await expect(panel).not.toContainText("gamma@example.com");

  await panel.getByRole("button", { name: "Add account" }).click();
  await panel.getByLabel("Account label").fill("delta@example.com");
  await panel.getByRole("button", { name: "Continue to OpenCode sign-in" }).click();

  const attempt = panel.getByTestId("opencode-login-attempt");
  const external = attempt.getByRole("link", { name: "Open OpenCode sign-in" });
  await expect(external).toHaveAttribute("href", "https://opencode.ai/console/device");
  await expect(external).toHaveAttribute("target", "_blank");
  await expect(attempt).toContainText("Waiting for OpenCode sign-in");
  await expect(attempt).toContainText("OpenCode sign-in complete.");
  await attempt.getByRole("button", { name: "Done" }).click();
  await expect(trigger).toContainText("delta@example.com");

  await panel.getByRole("button", { name: "Remove delta@example.com" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Remove account" }).click();
  await expect(trigger).toContainText("No account");

  await panel.getByRole("button", { name: "Remove beta+renamed@example.com" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Remove account" }).click();
  await expect(panel).not.toContainText("beta+renamed@example.com");

  await panel.getByRole("button", { name: "Remove alpha@example.com" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Remove account" }).click();
  await expect(panel).toContainText("No saved OpenCode accounts");
  await expect(trigger).toContainText("No account");

  state = OpenCodeAccountStateSchema.parse({
    accounts: [{
      id: "cred_blocked_mutation",
      label: "blocked-mutation@example.com",
      active: true,
      status: { status: "READY" },
    }],
    activeAccountId: "cred_blocked_mutation",
    mutationBlockers: ["ACTIVE_RUN"],
  });
  await page.reload();
  await expect(trigger).toContainText("blocked-mutation@example.com");
  await expect(trigger).toContainText("Ready");
  await expect(trigger).not.toContainText("Changes blocked");
  await expect(page.getByTestId("settings-opencode"))
    .toContainText("Finish or cancel active agent work before changing the OpenCode account.");
  await expect(page.getByRole("button", { name: "Add account" })).toBeDisabled();

  await page.setViewportSize({ width: 700, height: 800 });
  await expect(page.getByTestId("workbench-utilities")).toBeVisible();
  await expect(trigger).toBeVisible();
  await expect(page.getByTestId("settings-workspace")).toBeVisible();
});


test("P6 installation readiness exposes every blocker owner and OpenCode login terminal states stay bounded", async ({
  page,
  request,
}) => {
  await page.route("**/api/settings/readiness", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ready: false,
        blockers: [
          "REPOSITORY_REQUIRED",
          "REPOSITORY_CONFIGURATION_REQUIRES_ATTENTION",
          "MODEL_INVALID",
          "REFERENCE_ROOT_CONFIGURATION_REQUIRES_ATTENTION",
          "OPENCODE_ACCOUNT_REQUIRED",
        ],
      }),
    });
  });
  await authenticate(page, request);

  const readiness = page.getByText("Setup requires attention", { exact: true }).first();
  await expect(readiness).toBeVisible();
  for (const label of [
    "Target repository required",
    "Repository configuration needs attention",
    "Reference-root configuration needs attention",
  ]) {
    await expect(page.getByText(label, { exact: true })).toBeVisible();
  }
  await expect(page.getByRole("link", { name: "Open Repositories", exact: true })).toHaveCount(3);
  await expect(page.getByRole("link", { name: "Open Model & runtime", exact: true }))
    .toHaveAttribute("href", "/settings/model");
  await expect(page.getByRole("link", { name: "Open OpenCode accounts", exact: true }))
    .toHaveAttribute("href", "/settings/opencode");
  await page.unroute("**/api/settings/readiness");

  let terminalStatus: "FAILED" | "EXPIRED" | "CANCELLED" = "FAILED";
  let attempt = 0;
  await page.route("**/api/opencode/accounts**", async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    if (url.pathname === "/api/opencode/accounts" && req.method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ accounts: [], activeAccountId: null, mutationBlockers: [] }),
      });
      return;
    }
    if (url.pathname === "/api/opencode/accounts/login" && req.method() === "POST") {
      attempt += 1;
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          id: "00000000-0000-4000-8000-" + String(attempt).padStart(12, "0"),
          authorizationUrl: "https://opencode.ai/console/device",
          instructions: "Open the verification page and continue.",
          expiresAt: "2026-11-18T04:00:00.000Z",
          status: "PENDING",
          message: null,
        }),
      });
      return;
    }
    if (/\/api\/opencode\/accounts\/login\/.+/.test(url.pathname) && req.method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: url.pathname.split("/").at(-1),
          authorizationUrl: "https://opencode.ai/console/device",
          instructions: "Open the verification page and continue.",
          expiresAt: "2026-11-18T04:00:00.000Z",
          status: terminalStatus,
          message: terminalStatus === "FAILED" ? "Provider rejected sign-in." : null,
        }),
      });
      return;
    }
    await route.fallback();
  });

  await page.getByRole("link", { name: "Settings", exact: true }).click();
  await page.getByRole("link", { name: "OpenCode", exact: true }).click();
  const panel = page.getByTestId("settings-opencode");
  for (const [status, text] of [
    ["FAILED", "Provider rejected sign-in."],
    ["EXPIRED", "OpenCode sign-in expired."],
    ["CANCELLED", "OpenCode sign-in cancelled."],
  ] as const) {
    terminalStatus = status;
    await panel.getByRole("button", { name: "Add account" }).click();
    await panel.getByLabel("Account label").fill(status.toLowerCase() + "@example.com");
    await panel.getByRole("button", { name: "Continue to OpenCode sign-in" }).click();
    await expect(panel.getByTestId("opencode-login-attempt")).toContainText(text, { timeout: 5_000 });
    await panel.getByRole("button", { name: "Done" }).click();
  }
  await page.unroute("**/api/opencode/accounts**");
});

test("CodeMirror editor preserves exact source, formats Markdown, previews one buffer, and follows the Order theme", async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await authenticate(page, request);
  await openWorkItem(page, "Lifecycle editing workbench");
  await selectWorkflowStep(page, "Implementation plan");

  const editor = await openMarkdownEditor(page, "Implementation plan document Markdown source");
  await expect(page.getByTestId("markdown-format-toolbar")).toBeVisible();
  await expect(page.locator("textarea")).toHaveCount(0);

  const initial = await markdownSourceValue(editor);
  const unsaved = initial + "\n# Preview continuity\n";
  await replaceMarkdownSource(page, editor, unsaved);
  await expect(page.getByText("Unsaved edits", { exact: true })).toBeVisible();

  await page.getByRole("radio", { name: "Preview" }).click();
  await expect(page.getByTestId("markdown-preview")).toContainText("Preview continuity");
  await page.getByRole("radio", { name: "Edit" }).click();
  const editAgain = page.getByLabel("Implementation plan document Markdown source");
  await expect.poll(() => markdownSourceValue(editAgain)).toBe(unsaved);

  await page.getByRole("radio", { name: "Split" }).click();
  const splitEditor = page.getByLabel("Implementation plan document Markdown source");
  await expect(splitEditor).toBeVisible();
  await expect(page.getByTestId("markdown-preview")).toContainText("Preview continuity");

  const formattingCases = [
    ["Heading 1", "alpha", "# alpha"],
    ["Heading 2", "alpha", "## alpha"],
    ["Heading 3", "alpha", "### alpha"],
    ["Bold", "alpha", "**alpha**"],
    ["Italic", "alpha", "*alpha*"],
    ["Inline code", "alpha", "`alpha`"],
    ["Blockquote", "alpha", "> alpha"],
    ["Bulleted list", "alpha\nbeta", "- alpha\n- beta"],
    ["Numbered list", "alpha\nbeta", "1. alpha\n2. beta"],
    ["Link", "alpha", "[alpha](url)"],
    ["Fenced code block", "alpha", "```\nalpha\n```"],
    ["Horizontal rule", "alpha", "alpha\n---"],
  ] as const;

  await page.getByRole("radio", { name: "Edit" }).click();
  const formatEditor = page.getByLabel("Implementation plan document Markdown source");
  for (const [label, source, expected] of formattingCases) {
    await replaceMarkdownSource(page, formatEditor, source);
    await formatEditor.press("Control+A");
    await page.getByRole("button", { name: label }).click();
    await expect.poll(() => markdownSourceValue(formatEditor)).toBe(expected);
  }

  await replaceMarkdownSource(page, formatEditor, "alpha");
  await formatEditor.press("Control+A");
  await page.getByRole("button", { name: "Bold" }).click();
  await expect.poll(() => markdownSourceValue(formatEditor)).toBe("**alpha**");
  await page.getByRole("button", { name: "Undo" }).click();
  await expect.poll(() => markdownSourceValue(formatEditor)).toBe("alpha");
  await page.getByRole("button", { name: "Redo" }).click();
  await expect.poll(() => markdownSourceValue(formatEditor)).toBe("**alpha**");

  await replaceMarkdownSource(page, formatEditor, "- item");
  await formatEditor.press("End");
  await formatEditor.press("Enter");
  await formatEditor.type("next");
  await expect.poll(() => markdownSourceValue(formatEditor)).toBe("- item\n- next");

  await formatEditor.press("ControlOrMeta+f");
  await expect(page.locator(".cm-panel.cm-search")).toBeVisible();
  await formatEditor.press("Escape");

  await replaceMarkdownSource(page, formatEditor, "# Heading");
  const cm = page.locator(".order-markdown-source-editor .cm-editor");
  const gutter = page.locator(".order-markdown-source-editor .cm-gutters");
  const headingToken = page.locator(".order-markdown-source-editor .cm-content span")
    .filter({ hasText: "Heading" })
    .first();

  await page.getByRole("radio", { name: "Light" }).click();
  await expect(cm).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(gutter).toHaveCSS("background-color", "rgb(248, 250, 252)");
  await expect(headingToken).toHaveCSS("color", "rgb(15, 23, 42)");

  await page.getByRole("radio", { name: "Dark" }).click();
  await expect(cm).toHaveCSS("background-color", "rgb(17, 26, 41)");
  await expect(gutter).toHaveCSS("background-color", "rgb(23, 34, 51)");
  await expect(headingToken).toHaveCSS("color", "rgb(237, 243, 250)");

  await page.setViewportSize({ width: 700, height: 800 });
  await expect(formatEditor).toBeVisible();
  await expect.poll(() => markdownSourceValue(formatEditor)).toBe("# Heading");
  await expect(page.getByRole("button", { name: "Save", exact: true })).toBeVisible();
});

test("browser surfaces the canonical typed API failure message", async ({ page, request }) => {
  await authenticate(page, request);

  await page.route("**/api/work-items", async (route) => {
    await route.fulfill({
      status: 409,
      contentType: "application/json",
      body: JSON.stringify({
        code: "CURRENT_STATE_CONFLICT",
        message: "Documentation changed; review the current state and retry.",
        sourceDiagnostic: null,
        staleAuthorityOwner: null,
      }),
    });
  });
  await page.reload();

  await expect(page.getByText("Documentation changed; review the current state and retry."))
    .toBeVisible();
  await expect(page.getByText("Local browser session required")).toBeVisible();

  await page.unroute("**/api/work-items");
});

test("Approval consumes the real typed stale authority owner and returns to the exact canonical owner", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  const workItem = await workItemForTitle(page, "Stale approval recovery");

  await openWorkItem(page, "Stale approval recovery");
  const review = page.getByTestId("review-workspace");
  await expect(page.getByTestId("workflow-step-summary")).toHaveCount(0);
  await expect(review).toContainText("Package stale");
  await expect(review).toContainText("Approval authority is stale");
  await expect(review).toContainText(
    "Return workflow ownership to Implementation plan before continuing.",
  );

  const reconcile = page.getByRole("button", {
    name: "Return to Implementation plan",
  });
  await expect(reconcile).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Sign off exact package" }),
  ).toHaveCount(0);
  const responseObserved = page.waitForResponse((candidate) =>
    candidate.request().method() === "POST" &&
    candidate.url().endsWith(
      `/api/work-items/${encodeURIComponent(workItem.id)}/reconcile-authority`,
    ));
  await reconcile.click();
  const reconcileResponse = await responseObserved;
  expect(reconcileResponse.status()).toBe(200);
  expect(WorkItemSchema.parse(await reconcileResponse.json()).stage).toBe("PLAN");

  await expect(
    page.getByTestId("workflow-rail").getByRole("button", {
      name: "Implementation plan",
      exact: true,
    }),
  ).toHaveAttribute("aria-current", "step");
  await expect(page.getByTestId("workflow-step-summary")).toHaveCount(0);

  await selectWorkflowStep(page, "Approval");
  await expect(page.getByTestId("workflow-step-summary")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Return to Implementation plan", exact: true })).toBeVisible();
  await expect(page.getByTestId("review-workspace")).toContainText(
    "Returned before sign-off",
  );
  await expect(page.getByTestId("review-workspace")).toContainText(
    "Approval history",
  );
  await expect(
    page.getByRole("button", { name: "Sign off exact package" }),
  ).toHaveCount(0);
});

test("valid external Work request drift keeps source reconciliation distinct from Approval authority reconciliation", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  const workItem = await workItemForTitle(page, "Awaiting sign-off");
  const sourceResponse = await page.context().request.get(
    `/api/work-items/${encodeURIComponent(workItem.id)}/source`,
  );
  expect(sourceResponse.status()).toBe(200);
  const source = WorkItemSourceSnapshotSchema.parse(await sourceResponse.json());
  const sourcePath =
    `**/api/work-items/${encodeURIComponent(workItem.id)}/source`;

  await page.route(sourcePath, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ...source,
        sha256: `sha256:${"f".repeat(64)}`,
      }),
    });
  });

  let sourceReconcileCalled = false;
  await page.route("**/api/work-item-sources/reconcile", async (route) => {
    sourceReconcileCalled = true;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        registered: [],
        updated: [workItem.id],
        unchanged: [],
        diagnostics: [],
      }),
    });
  });

  let authorityReconcileCalled = false;
  await page.route(
    `**/api/work-items/${encodeURIComponent(workItem.id)}/reconcile-authority`,
    async (route) => {
      authorityReconcileCalled = true;
      await route.abort();
    },
  );

  await openWorkItem(page, "Awaiting sign-off");
  const review = page.getByTestId("review-workspace");
  await expect(page.getByTestId("workflow-step-summary")).toHaveCount(0);
  await expect(review).toContainText("Work request source changed");
  const reconcile = page.getByRole("button", {
    name: "Reconcile source authority",
  });
  await expect(reconcile).toBeVisible();
  const staleSignoff = page.getByRole("button", {
    name: "Sign off exact package",
  });
  if (await staleSignoff.count()) {
    await expect(staleSignoff).toBeDisabled();
  }
  await reconcile.click();
  await expect.poll(() => sourceReconcileCalled).toBe(true);
  expect(authorityReconcileCalled).toBe(false);

  await page.unroute(sourcePath);
  await page.unroute("**/api/work-item-sources/reconcile");
  await page.unroute(
    `**/api/work-items/${encodeURIComponent(workItem.id)}/reconcile-authority`,
  );
});

test("queue opens a primary workspace, keeps context compact, preserves URL history, responds with a Drawer, and creates real WorkItems", async ({
  page,
  request,
}) => {
  await authenticate(page, request);

  const websocketUrls: string[] = [];
  const eventStreamUrls: string[] = [];
  page.on("websocket", (socket) => websocketUrls.push(socket.url()));
  page.on("request", (browserRequest) => {
    if ((browserRequest.headers()["accept"] ?? "").includes("text/event-stream")) {
      eventStreamUrls.push(browserRequest.url());
    }
  });

  await expect(page.getByTestId("work-item-queue")).toBeVisible();
  await expect(rowFor(page, "Discovered on startup")).toBeVisible();
  await expect(page.getByTestId("source-diagnostics")).not.toContainText("INVALID_SOURCE");
  await expect(page.getByTestId("source-diagnostics")).toContainText("work-request.md");
  await expect(page.getByTestId("source-diagnostics")).toContainText(
    "WorkItem source must begin with ---",
  );
  await page.getByRole("button", { name: "Refresh sources" }).click();
  await expect(page.getByTestId("source-diagnostics")).not.toContainText("INVALID_SOURCE");
  await expect(page.getByTestId("source-diagnostics")).toContainText("work-request.md");

  const proposalItem = await workItemForTitle(page, "Proposal review");
  const proposalRow = rowFor(page, "Proposal review");
  await expect(
    proposalRow.getByRole("button", { name: /Copy work item id/ }),
  ).toHaveCount(0);

  await proposalRow.focus();
  await proposalRow.press("Enter");
  await expect(page.getByTestId("work-item-workspace")).toBeVisible();
  await expect(page.getByTestId("work-item-heading")).toBeFocused();
  await expect(page).toHaveURL(/workItem=/);

  const context = page.getByTestId("work-item-context");
  await expect(context).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Context" })).toBeVisible();
  await page.getByRole("button", { name: "Context" }).click();
  await expect(context).toBeVisible();
  await expect(page.getByTestId("selected-view-context")).toBeVisible();
  await expect(context.getByRole("heading", { name: "WorkItem identity", exact: true })).toBeVisible();
  await expect(context.getByRole("button", { name: "WorkItem technical details" })).toHaveCount(0);
  await expect(context).toContainText(proposalItem.id);
  await expect(page.getByTestId("workbench-search")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Refresh sources" })).toHaveCount(0);
  await expect(context.locator(
    '[data-testid="workflow-step-frame"], [data-testid="stage-run-material"], [data-testid="lifecycle-document-material"], [data-testid="review-workspace"], [data-testid="execution-workspace"]',
  )).toHaveCount(0);

  await page.goBack();
  await expect(page.getByTestId("work-item-queue")).toBeVisible();
  await page.goForward();
  await expect(page.getByTestId("work-item-workspace")).toBeVisible();

  await page.setViewportSize({ width: 1000, height: 800 });
  await expect(page.getByTestId("work-item-context")).toHaveCount(0);
  await expect(page.getByTestId("work-item-context-drawer")).toBeVisible();
  await expect(
    page.getByTestId("work-item-context-drawer").locator('[data-testid="stage-run-material"]'),
  ).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("work-item-context-drawer")).toBeHidden();

  await page.setViewportSize({ width: 700, height: 800 });
  await expect(page.getByTestId("work-item-workspace")).toBeVisible();
  await page.getByRole("button", { name: "Context" }).click();
  await expect(page.getByTestId("work-item-context-drawer")).toBeVisible();
  await page.keyboard.press("Escape");

  await page.setViewportSize({ width: 1280, height: 720 });
  await backToQueue(page);
  await expect(proposalRow).toBeFocused();

  await page.getByRole("button", { name: "New work item" }).click();
  const createDialog = page.getByRole("dialog", { name: "Create work item" });
  await expect(createDialog).toBeVisible();
  await expect(createDialog.getByRole("button", { name: "Cancel", exact: true })).toBeVisible();
  await createDialog.getByRole("combobox", { name: "Project Required" }).click();
  await page.getByRole("option", { name: "order-e2e", exact: true }).click();
  await createDialog.getByRole("radio", { name: "Change" }).click();
  await createDialog.getByLabel("Title").fill("Created in browser");
  await createDialog.getByRole("button", { name: "Concerns", exact: true }).click();
  await page.getByRole("option", { name: "browser" }).click();
  await page.keyboard.press("Escape");
  await createDialog.getByRole("button", { name: "Create work item" }).click();

  await expect(page.getByTestId("work-item-heading")).toHaveText("Created in browser");
  await backToQueue(page);
  await expect(rowFor(page, "Created in browser")).toContainText("browser");

  expect(websocketUrls).toEqual([]);
  expect(eventStreamUrls).toEqual([]);
});


// These exact named fixtures are part of the existing scenario dispatch.
// Re-render each at the actual medium viewport, not a fallback atlas width.
// The pre-cutover runtime has 37 owned surfaces; IA38/39 add Acceptance.
const mediumComparisonSources = {
  "SURF-APP-001": "hux-app-queue-wide-light",
  "SURF-QUEUE-001": "queue-wide-light-populated",
  "SURF-CREATE-001": "create-work-item-wide-light-change",
  "SURF-WI-001": "workitem-shell-wide-light-chrome",
  "SURF-WI-CONTEXT-001": "workitem-context-wide-light-selected-workitem",
  "SURF-STEP-WR-001": "ia26-work-request-step-wide-light",
  "SURF-MAT-SOURCE-001": "ia26-source-document-editor-wide-light",
  "SURF-MAT-DOC-001": "ia26-lifecycle-document-editor-wide-light",
  "SURF-MAT-DOC-RO-001": "ia26-lifecycle-document-readonly-wide-light",
  "SURF-CONF-DIRTY-DEST-001": "ia26-confirm-dirty-destination-wide-light",
  "SURF-CONF-DIRTY-MATERIAL-001": "ia26-confirm-dirty-material-wide-light",
  "SURF-CONF-ARCHIVE-001": "ia26-confirm-archive-wide-light",
  "SURF-CONF-DOC-GIT-001": "ia26-confirm-documentation-git-wide-light",
  "SURF-MAT-PROPOSAL-001": "ia26-proposal-review-wide-light",
  "SURF-STEP-R3-001": "ia26-readiness-review-wide-light",
  "SURF-STEP-APPROVAL-001": "ia26-approval-wide-light",
  "SURF-MAT-APPROVAL-TASK-001": "ia26-approval-task-wide-light",
  "SURF-STEP-R1-001": "ia26-research-wide-light",
  "SURF-STEP-R2-001": "ia26-requirements-wide-light",
  "SURF-STEP-DESIGN-001": "ia26-solution-design-wide-light",
  "SURF-STEP-PLAN-001": "ia26-implementation-plan-wide-light",
  "SURF-MAT-ACTIVITY-001": "ia26-stage-dialogue-open-wide-light",
  "SURF-STEP-EXEC-001": "ia26-implementation-wide-light",
  "SURF-MAT-EXEC-TASK-001": "ia26-implementation-task-wide-light",
  "SURF-STEP-COMPLETE-001": "ia26-complete-candidate-wide-light",
  "SURF-MAT-EVIDENCE-001": "ia26-evidence-wide-light",
  "SURF-SET-001": "ia26-settings-frame-wide-light",
  "SURF-SET-REPO-001": "ia26-settings-repositories-wide-light",
  "SURF-SET-REPO-ADD-001": "ia26-settings-repository-add-wide-light",
  "SURF-SET-REPO-MOVE-001": "ia26-settings-repository-move-wide-light",
  "SURF-SET-OC-001": "ia26-settings-opencode-wide-light",
  "SURF-SET-OC-RENAME-001": "ia26-settings-opencode-rename-wide-light",
  "SURF-SET-OC-ADD-001": "ia26-settings-opencode-add-wide-light",
  "SURF-SET-OC-LOGIN-001": "ia26-settings-opencode-login-pending-wide-light",
  "SURF-SET-MODEL-001": "ia26-settings-model-wide-light",
  "SURF-CONF-REPO-DISCONNECT-001": "ia26-confirm-repository-disconnect-wide-light",
  "SURF-CONF-OC-REMOVE-001": "ia26-confirm-opencode-remove-wide-light",
} as const satisfies Readonly<Record<string, string>>;
const mediumComparisonId = (sourceId: string): string => sourceId + "-medium-comparison";

const validateSignedPhaseEvidence = (entries: readonly RenderedAcceptanceEntry[]): void => {
  if (signedRenderedPhase === null) return;
  const expectedIds: readonly string[] = signedPhaseCaptureIds[signedRenderedPhase];
  const owned: readonly string[] = signedPhaseOwnedSurfaces[signedRenderedPhase];
  const expectedMediumIds = owned.map(surface =>
    mediumComparisonId(mediumComparisonSources[surface as keyof typeof mediumComparisonSources]));
  expect(entries.map((entry) => entry.id).sort(), "exact phase capture identities")
    .toEqual([...expectedIds, ...expectedMediumIds].sort());
  for (const surface of owned) {
    const medium = entries.find(entry => entry.surface === surface &&
      entry.id === mediumComparisonId(mediumComparisonSources[surface as keyof typeof mediumComparisonSources]));
    expect(medium?.viewport.width, surface + " exact medium viewport").toBe(1000);
    expect(medium?.reference.viewportClass, surface + " medium class").toBe("medium");
    expect(medium?.reference.comparisonEligible, surface + " same-scope comparison").toBe(true);
    expect(medium?.referenceScreenshot, surface + " medium reference PNG").toBeDefined();
  }
  if (signedRenderedPhase === "IA27_28") {
    for (const id of ["application-toolbar-workitem-medium-light", "application-toolbar-settings-medium-light",
      "hux-app-queue-narrow-dark", "application-toolbar-workitem-narrow-light", "application-toolbar-settings-narrow-light"]) {
      const entry = entries.find(candidate => candidate.id === id);
      expect(entry?.reference.captureScope, id + " exact toolbar scope").toBe("component-reference");
      expect(entry?.reference.comparisonEligible, id + " matching toolbar reference").toBe(true);
      expect(entry?.referenceScreenshot, id + " matching toolbar PNG").toBeDefined();
    }
  }
  const shared = signedPhaseSharedSurfaces[signedRenderedPhase] ?? [];
  expect([...new Set(entries.map((entry) => entry.surface))].sort(), "exact phase SURF coverage")
    .toEqual([...owned, ...shared].sort());
  for (const entry of entries) {
    expect(readFileSync(join(renderedAcceptanceDir!, entry.screenshot)).length).toBeGreaterThan(0);
    expect(entry.reference.manifestPath).toBe(referenceManifestPath);
    expect(entry.reference.sourcePath).toBe(referenceAtlasPath);
    if (entry.reference.comparisonEligible) {
      expect(entry.referenceScreenshot, entry.id).toBeDefined();
      expect(readFileSync(join(renderedAcceptanceDir!, "references", entry.referenceScreenshot!)).length).toBeGreaterThan(0);
    }
  }
  const manifest = JSON.parse(readFileSync(join(renderedAcceptanceDir!, "manifest.json"), "utf8")) as {
    candidateSha: string; evidenceKind: string; signedPhase: string; entries: RenderedAcceptanceEntry[];
  };
  expect(manifest.candidateSha).toBe(renderedAcceptanceCandidateSha);
  expect(manifest.evidenceKind).toBe("ia26_acceptance");
  expect(manifest.signedPhase).toBe(signedRenderedPhase);
  expect(manifest.entries.map((entry) => entry.id).sort()).toEqual([...expectedIds, ...expectedMediumIds].sort());
};

test("rendered acceptance phase 1 captures Queue and Create WorkItem", async ({
  page,
  request,
}) => {
  test.skip(
    renderedAcceptanceDir === undefined ||
      (signedRenderedPhase !== null && signedRenderedPhase !== "IA27_28"),
    "rendered acceptance capture runs only in its GitHub Actions evidence step",
  );
  test.setTimeout(300_000);
  const widths = [[390,"narrow"],[700,"narrow"],[760,"narrow"],[799,"narrow"],[800,"medium"],
    [1000,"medium"],[1279,"medium"],[1280,"wide"],[1440,"wide"]] as const;
  for (const [width, expected] of widths) expect(referenceViewportClass({width,height:800})).toBe(expected);
  for (const width of [0,-1,NaN,Infinity]) expect(referenceViewportClass({width,height:800})).toBeNull();
  expect(referenceViewportClass({width:1000,height:0})).toBeNull();
  const toolbarComparison: RenderedAcceptanceInput = {
    id: "scope-check", workItemKind: "QUEUE", workflowStep: null,
    surface: "SURF-APP-001", state: "toolbar-queue", fixture: "scope check",
    viewport: {width:1000,height:800}, theme:"Light", route:"/", authorityRefs:[],
  };
  expect(resolveRenderedReference(toolbarComparison,"component-reference").comparisonEligible).toBe(true);
  expect(resolveRenderedReference(toolbarComparison,"full-workbench").comparisonEligible).toBe(false);
  expect(resolveRenderedReference({...toolbarComparison,viewport:{width:1000,height:0}},"component-reference").comparisonEligible).toBe(false);
  expect(Object.keys(mediumComparisonSources).sort()).toEqual(
    Object.values(signedPhaseOwnedSurfaces).flat().sort()
  );
  const phaseOneNegativeStates = diagnosticCurrentState || signedRenderedPhase === "IA27_28";
  const runtimeErrors: string[] = [];
  let expectedDiagnosticConsoleErrors = 0;
  page.on("pageerror", (error) => runtimeErrors.push("pageerror: " + error.message));
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    if (
      phaseOneNegativeStates &&
      expectedDiagnosticConsoleErrors > 0 &&
      message.text().includes("status of 401 (Unauthorized)")
    ) {
      expectedDiagnosticConsoleErrors -= 1;
      return;
    }
    runtimeErrors.push("console: " + message.text());
  });

  let renderedAccountState = OpenCodeAccountStateSchema.parse({
    accounts: [{
      id: "cred_rendered_acceptance",
      label: "operator@example.com",
      active: true,
      status: { status: "READY" },
    }],
    activeAccountId: "cred_rendered_acceptance",
    mutationBlockers: [],
  });
  await page.route("**/api/opencode/accounts", async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(renderedAccountState),
    });
  });
  let renderedReadinessBlockers: string[] = [];
  await page.route("**/api/settings/readiness", async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ready: renderedReadinessBlockers.length === 0,
        blockers: renderedReadinessBlockers,
      }),
    });
  });
  await page.route("**/api/work-item-sources/diagnostics", async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await authenticate(page, request);
  await page.getByRole("radio", { name: "Light" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.getByTestId("work-item-queue")).toBeVisible();
  await expect(page.getByTestId("opencode-account-trigger")).toContainText(
    "operator@example.com",
  );

  const entries: RenderedAcceptanceEntry[] = [];
  const capturePhaseOne = async (entry: RenderedAcceptanceInput, target?: Locator): Promise<void> => {
    entries.push(await captureRenderedAcceptance(page, entry, target));
    if (diagnosticCurrentState || renderedEvidenceKind !== "ia26_acceptance") return;
    if (mediumComparisonSources[entry.surface as keyof typeof mediumComparisonSources] !== entry.id) return;
    const previous = entry.viewport;
    try {
      const viewport = { width: 1000, height: 800 };
      await page.setViewportSize(viewport);
      // Context changes from docked panel to Drawer; this SURF uses the
      // full-workbench reference, so do not retain the desktop locator.
      const mediumTarget = entry.surface === "SURF-WI-CONTEXT-001" ? undefined : target;
      if (entry.surface === "SURF-WI-CONTEXT-001") {
        await expect(page.getByTestId("work-item-context-drawer")).toBeVisible();
      }
      entries.push(await captureRenderedAcceptance(page, {
        ...entry, id: mediumComparisonId(entry.id), viewport,
      }, mediumTarget));
    } finally {
      await page.setViewportSize(previous);
      if (entry.surface === "SURF-WI-CONTEXT-001") await expect(page.getByTestId("work-item-context")).toBeVisible();
    }
  };
  const toolbar = page.getByTestId("workbench-toolbar");
  const accountUtility = toolbar.getByTestId("opencode-account-trigger");
  await expect(accountUtility).toContainText("OpenCode");
  const accountLabel = accountUtility.locator(".order-workbench-account-label");
  expect(await accountUtility.evaluate((node) => {
    const css = getComputedStyle(node);
    return ["borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth"]
      .every((side) => Number.parseFloat(css.getPropertyValue(side.replace(/[A-Z]/g, (s) => "-" + s.toLowerCase()))) > 0);
  })).toBe(true);
  await expect(accountLabel).toHaveText("operator@example.com");
  await expect(accountLabel).toBeVisible();
  expect(await accountLabel.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    return rect.width > 1 && rect.height > 1 && getComputedStyle(node).clipPath === "none";
  })).toBe(true);
  await expect(toolbar.getByRole("radio")).toHaveCount(3);

  await capturePhaseOne({
    id: "application-wide-light-active-account",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-APP-001",
    state: "active-account-visible",
    fixture: "application shell with deterministic active OpenCode account",
    viewport: { width: 1440, height: 900 },
    theme: "Light",
    route: "/",
    authorityRefs: [
      "GW-DOC-WORKBENCH-UX",
      "GW-DOC-INSTALLATION-READINESS",
    ],
  });

  if (phaseOneNegativeStates) {
    renderedAccountState = OpenCodeAccountStateSchema.parse({
      accounts: [],
      activeAccountId: null,
      mutationBlockers: [],
    });
    await page.reload();
    await expect(page.getByTestId("opencode-account-trigger")).toContainText("No account");
    await expect(page.getByTestId("opencode-account-trigger")).toContainText("Account required");
    await capturePhaseOne({
      id: "diagnostic-application-wide-light-account-required",
      workItemKind: "QUEUE",
      workflowStep: null,
      surface: "SURF-APP-001",
      state: "missing-account-required",
      fixture: "application shell with deterministic missing OpenCode account",
      viewport: { width: 1440, height: 900 },
      theme: "Light",
      route: "/",
      authorityRefs: [
        "GW-DOC-WORKBENCH-UX",
        "GW-DOC-INSTALLATION-READINESS",
      ],
      captureScope: "full application viewport",
    });
    renderedAccountState = OpenCodeAccountStateSchema.parse({
      accounts: [{
        id: "cred_rendered_acceptance",
        label: "operator@example.com",
        active: true,
        status: { status: "READY" },
      }],
      activeAccountId: "cred_rendered_acceptance",
      mutationBlockers: [],
    });
    await page.reload();
    await expect(page.getByTestId("opencode-account-trigger")).toContainText(
      "operator@example.com",
    );
  }

  renderedReadinessBlockers = ["REPOSITORY_REQUIRED"];
  await page.reload();
  await expect(page.getByTestId("installation-readiness")).toBeVisible();
  await expect(page.getByTestId("work-item-queue")).toBeVisible();
  await capturePhaseOne({
    id: "application-wide-light-installation-readiness",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-APP-001",
    state: "installation-readiness-blocked",
    fixture: "application shell with deterministic readiness blockers",
    viewport: { width: 1440, height: 900 },
    theme: "Light",
    route: "/",
    authorityRefs: [
      "GW-DOC-WORKBENCH-UX",
      "GW-DOC-INSTALLATION-READINESS",
    ],
  });
  renderedReadinessBlockers = [];
  await page.reload();

  if (phaseOneNegativeStates) {
    renderedReadinessBlockers = [
      "REPOSITORY_REQUIRED",
      "REPOSITORY_CONFIGURATION_REQUIRES_ATTENTION",
      "MODEL_INVALID",
      "REFERENCE_ROOT_CONFIGURATION_REQUIRES_ATTENTION",
      "OPENCODE_ACCOUNT_REQUIRED",
    ];
    await page.reload();
    const readiness = page.getByTestId("installation-readiness");
    for (const label of [
      "Target repository required",
      "Repository configuration needs attention",
      "Model unavailable / invalid",
      "Reference-root configuration needs attention",
      "OpenCode account required",
    ]) {
      await expect(readiness.getByText(label, { exact: true })).toBeVisible();
    }
    await capturePhaseOne({
      id: "diagnostic-application-wide-light-readiness-all-blockers",
      workItemKind: "QUEUE",
      workflowStep: null,
      surface: "SURF-APP-001",
      state: "installation-readiness-all-blockers",
      fixture: "application shell with all canonical readiness blockers",
      viewport: { width: 1440, height: 900 },
      theme: "Light",
      route: "/",
      authorityRefs: [
        "GW-DOC-INSTALLATION-READINESS",
        "GW-DOC-WORKBENCH-UX",
      ],
      captureScope: "full application viewport",
    });
    renderedReadinessBlockers = [];
    await page.reload();

    let releaseLoading!: () => void;
    const loadingGate = new Promise<void>((resolve) => {
      releaseLoading = resolve;
    });
    await page.route("**/api/work-items**", async (route) => {
      if (route.request().method() !== "GET") {
        await route.fallback();
        return;
      }
      await loadingGate;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      });
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByText("Loading work items…", { exact: true })).toBeVisible();
    await capturePhaseOne({
      id: "diagnostic-queue-wide-light-loading",
      workItemKind: "QUEUE",
      workflowStep: null,
      surface: "SURF-QUEUE-001",
      state: "loading",
      fixture: "deterministic pending WorkItem query",
      viewport: { width: 1440, height: 900 },
      theme: "Light",
      route: "/",
      authorityRefs: ["GW-DOC-WORKBENCH-UX"],
      captureScope: "full application viewport",
    });
    releaseLoading();
    await expect(page.getByText("No work items", { exact: true })).toBeVisible();
    await capturePhaseOne({
      id: "diagnostic-queue-wide-light-true-empty",
      workItemKind: "QUEUE",
      workflowStep: null,
      surface: "SURF-QUEUE-001",
      state: "true-empty",
      fixture: "deterministic empty WorkItem list",
      viewport: { width: 1440, height: 900 },
      theme: "Light",
      route: "/",
      authorityRefs: ["GW-DOC-WORKBENCH-UX"],
      captureScope: "full application viewport",
    });
    await page.unroute("**/api/work-items**");
    await page.reload();
    await expect(page.getByRole("table", { name: "Work items" })).toBeVisible();

    await page.route("**/api/work-items**", async (route) => {
      if (route.request().method() !== "GET") {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          code: "BROWSER_SESSION_REQUIRED",
          message: "browser session required",
          sourceDiagnostic: null,
          staleAuthorityOwner: null,
        }),
      });
    });
    expectedDiagnosticConsoleErrors += 1;
    await page.reload();
    await expect(page.getByText("Local browser session required", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Retry", exact: true })).toBeVisible();
    await capturePhaseOne({
      id: "diagnostic-application-wide-light-browser-session-required",
      workItemKind: "QUEUE",
      workflowStep: null,
      surface: "SURF-APP-001",
      state: "browser-session-required-recovery",
      fixture: "deterministic local browser session failure",
      viewport: { width: 1440, height: 900 },
      theme: "Light",
      route: "/",
      authorityRefs: ["GW-DOC-WORKBENCH-UX"],
      captureScope: "full application viewport",
    });
    await page.unroute("**/api/work-items**");
    await page.reload();
    await expect(page.getByRole("table", { name: "Work items" })).toBeVisible();
  }

  await page.unroute("**/api/work-item-sources/diagnostics");
  await page.route("**/api/work-item-sources/diagnostics", async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([{
        projectId: "order-e2e",
        path: "docs/order/work-items/broken/work-request.md",
        workItemId: null,
        code: "INVALID_SOURCE",
        detail: "The WorkItem source could not be parsed.",
      }]),
    });
  });
  await page.reload();
  const diagnostics = page.getByTestId("source-diagnostics");
  await expect(diagnostics).toBeVisible();
  await expect(diagnostics).toContainText("docs/order/work-items/broken/work-request.md");
  await expect(diagnostics).toContainText("The WorkItem source could not be parsed.");
  await expect(diagnostics).not.toContainText("INVALID_SOURCE");
  await expect(page.getByRole("table", { name: "Work items" })).toBeVisible();
  await expect(page.getByText("Loading work queue...", { exact: true })).toHaveCount(0);
  await capturePhaseOne({
    id: "queue-wide-light-source-diagnostic",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-QUEUE-001",
    state: "source-diagnostic-human-recovery",
    fixture: "deterministic invalid WorkItem source diagnostic",
    viewport: { width: 1440, height: 900 },
    theme: "Light",
    route: "/",
    authorityRefs: [
      "GW-DOC-WORKBENCH-UX",
      "GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM",
    ],
  });
  await page.unroute("**/api/work-item-sources/diagnostics");
  await page.route("**/api/work-item-sources/diagnostics", async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });
  await page.reload();
  const queue = page.getByTestId("work-item-queue");
  await expect(queue.locator(".order-workbench-surface-attention")).toHaveCount(0);
  await expect(queue.getByRole("heading", { name: "Work items", exact: true })).toBeVisible();
  await capturePhaseOne({
    id: "queue-wide-light-populated",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-QUEUE-001",
    state: "active-list-populated-attention-absent",
    fixture: "order-e2e populated queue",
    viewport: { width: 1440, height: 900 },
    theme: "Light",
    route: "/",
    authorityRefs: [
      "GW-DOC-WORKBENCH-UX",
      "GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM",
    ],
  });

  await page.route("**/api/work-items**", async (route) => {
    const url = new URL(route.request().url());
    if (route.request().method() !== "GET" || url.pathname !== "/api/work-items") {
      await route.fallback();
      return;
    }
    const upstream = await route.fetch();
    const rows = WorkItemSchema.array().parse(await upstream.json());
    const template = rows[0];
    if (template === undefined) {
      throw new Error("rendered Queue archived state requires one WorkItem fixture");
    }
    const archived = WorkItemSchema.parse({
      ...template,
      id: "work_c1a55e11-7ae0-4aac-9f0c-d5ff82f5c629",
      title: "Rendered archived work item",
      archived: true,
    });
    await route.fulfill({
      status: upstream.status(),
      contentType: "application/json",
      body: JSON.stringify([
        ...rows,
        ...(url.searchParams.get("includeArchived") === "true" ? [archived] : []),
      ]),
    });
  });
  await page.getByRole("button", { name: "Show archived" }).click();
  const archivedSearch = page.getByLabel("Search work items");
  await archivedSearch.fill("Rendered archived work item");
  const archivedRow = rowFor(page, "Rendered archived work item");
  await expect(archivedRow).toContainText("Archived");
  await expect(archivedRow.getByRole("button", {
    name: "Restore Rendered archived work item",
  })).toBeVisible();
  await capturePhaseOne({
    id: "queue-wide-light-archived",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-QUEUE-001",
    state: "archived-visible",
    fixture: "deterministic archived WorkItem filtered for explicit archived-state review",
    viewport: { width: 1440, height: 900 },
    theme: "Light",
    route: "/",
    authorityRefs: [
      "GW-DOC-WORKBENCH-UX",
      "GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM",
    ],
  });
  await archivedSearch.fill("");
  await page.getByRole("button", { name: "Hide archived" }).click();
  await page.unroute("**/api/work-items**");

  const noMatchSearch = page.getByLabel("Search work items");
  await noMatchSearch.fill("no rendered acceptance match");
  await expect(page.getByText("No matching work items", { exact: true })).toBeVisible();
  await capturePhaseOne({
    id: "queue-wide-light-no-matches",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-QUEUE-001",
    state: "no-search-matches",
    fixture: "order-e2e queue filtered to no matches",
    viewport: { width: 1440, height: 900 },
    theme: "Light",
    route: "/",
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  });
  await noMatchSearch.fill("");
  await page.setViewportSize({ width: 700, height: 800 });
  await expect(queue).toBeVisible();
  await expect(
    page.getByLabel("Current application destination").getByText("Work queue", { exact: true }),
  ).toBeVisible();
  await expect(queue.locator(".order-workbench-surface-attention")).toHaveCount(0);
  const narrowQueueTable = page.getByRole("table", { name: "Work items" });
  await expect(narrowQueueTable).toHaveCSS("table-layout", "auto");
  const concernsHeader = narrowQueueTable.getByRole("columnheader", { name: "Concerns" });
  await expect(concernsHeader).toBeVisible();
  await expect(concernsHeader).toHaveCSS("text-overflow", "clip");
  await expect(concernsHeader).toHaveCSS("white-space", "normal");
  const narrowCellWrapping = await narrowQueueTable.locator("tbody td").evaluateAll((cells) =>
    cells.map((cell) => {
      const style = getComputedStyle(cell);
      return { wordBreak: style.wordBreak, overflowWrap: style.overflowWrap };
    }),
  );
  expect(narrowCellWrapping.length).toBeGreaterThan(0);
  expect(narrowCellWrapping.every((style) =>
    style.wordBreak === "normal" && style.overflowWrap === "normal"
  )).toBe(true);
  await capturePhaseOne({
    id: "queue-narrow-light-populated",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-QUEUE-001",
    state: "active-list-populated-narrow-attention-absent",
    fixture: "order-e2e populated queue",
    viewport: { width: 700, height: 800 },
    theme: "Light",
    route: "/",
    authorityRefs: [
      "GW-DOC-WORKBENCH-UX",
      "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
    ],
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole("radio", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await capturePhaseOne({
    id: "application-queue-wide-dark",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-APP-001",
    state: "queue-dark-theme-parity",
    fixture: "order-e2e populated queue",
    viewport: { width: 1440, height: 900 },
    theme: "Dark",
    route: "/",
    authorityRefs: [
      "GW-DOC-WORKBENCH-UX",
      "GW-DOC-WORKBENCH-THEME-V1",
    ],
  });
  await capturePhaseOne({
    id: "ia26-queue-wide-dark", workItemKind: "QUEUE", workflowStep: null,
    surface: "SURF-QUEUE-001", state: "operational-scan-dark", fixture: "populated Queue",
    viewport: { width: 1440, height: 900 }, theme: "Dark", route: "/",
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-THEME-V1"],
  }, page.getByTestId("work-item-queue"));
  await page.setViewportSize({ width: 700, height: 800 });
  await capturePhaseOne({
    id: "hux-app-queue-narrow-dark", workItemKind: "QUEUE", workflowStep: null,
    surface: "SURF-APP-001", state: "toolbar-queue", fixture: "populated Queue shared toolbar",
    viewport: { width: 700, height: 800 }, theme: "Dark", route: "/",
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-THEME-V1"],
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole("radio", { name: "Light" }).click();
  await capturePhaseOne({
    id: "hux-app-queue-wide-light", workItemKind: "QUEUE", workflowStep: null,
    surface: "SURF-APP-001", state: "toolbar-queue", fixture: "populated Queue shared toolbar",
    viewport: { width: 1440, height: 900 }, theme: "Light", route: "/",
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-THEME-V1"],
  });
  await page.getByRole("radio", { name: "System" }).click();
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).not.toHaveAttribute("data-theme");
  await capturePhaseOne({
    id: "application-toolbar-wide-system-light",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-APP-001",
    state: "queue-system-theme-effective-light",
    fixture: "order-e2e populated queue",
    viewport: { width: 1440, height: 900 },
    theme: "System/light",
    route: "/",
    authorityRefs: [
      "GW-DOC-WORKBENCH-UX",
      "GW-DOC-WORKBENCH-THEME-V1",
    ],
    captureScope: "production application toolbar only",
  }, page.getByTestId("workbench-toolbar"));
  await capturePhaseOne({
    id: "ia26-queue-system-light", workItemKind: "QUEUE", workflowStep: null,
    surface: "SURF-APP-001", state: "system-theme-effective-light", fixture: "populated Queue",
    viewport: { width: 1440, height: 900 }, theme: "System/light", route: "/",
    authorityRefs: ["GW-DOC-WORKBENCH-THEME-V1"],
  });
  await page.emulateMedia({ colorScheme: "dark" });
  await capturePhaseOne({
    id: "ia26-queue-system-dark", workItemKind: "QUEUE", workflowStep: null,
    surface: "SURF-APP-001", state: "system-theme-effective-dark", fixture: "populated Queue",
    viewport: { width: 1440, height: 900 }, theme: "System/dark", route: "/",
    authorityRefs: ["GW-DOC-WORKBENCH-THEME-V1"],
  });
  await capturePhaseOne({
    id: "application-toolbar-wide-system-dark",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-APP-001",
    state: "queue-system-theme-effective-dark",
    fixture: "order-e2e populated queue",
    viewport: { width: 1440, height: 900 },
    theme: "System/dark",
    route: "/",
    authorityRefs: [
      "GW-DOC-WORKBENCH-UX",
      "GW-DOC-WORKBENCH-THEME-V1",
    ],
    captureScope: "production application toolbar only",
  }, page.getByTestId("workbench-toolbar"));
  await page.getByRole("radio", { name: "Light" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  const createDialog = page.getByRole("dialog", { name: "Create work item" });
  const openCreate = async (): Promise<void> => {
    await page.getByRole("button", { name: "New work item" }).click();
    await expect(createDialog).toBeVisible();
    await createDialog.getByRole("combobox", { name: "Project Required" }).click();
    await page.getByRole("option", { name: "order-e2e", exact: true }).click();
    await createDialog.getByRole("radio", { name: "Change" }).click();
    await createDialog.getByLabel("Title").fill("Rendered acceptance change");
    await createDialog.getByRole("button", { name: "Concerns", exact: true }).click();
    await page.getByRole("option", { name: "browser" }).click();
    await page.keyboard.press("Escape");
  };
  await openCreate();
  const createPanel = createDialog.locator(".order-workbench-task-panel");
  const createHeader = createPanel.locator(".order-workbench-task-panel-header");
  const createBody = createPanel.locator(".order-workbench-task-panel-body");
  const createFooter = createPanel.locator(".order-workbench-task-panel-footer");
  await expect(createHeader).toBeVisible();
  await expect(createBody).toBeVisible();
  await expect(createFooter).toBeVisible();
  await expect(createFooter.getByRole("button", { name: "Cancel", exact: true })).toBeVisible();
  await expect(createFooter.getByRole("button", { name: "Create work item", exact: true })).toBeVisible();
  await expect(createBody.getByRole("button", { name: "Create work item", exact: true })).toHaveCount(0);
  await expect(createDialog.getByTestId("create-work-item-location")).toContainText(
    "docs/order/work-items",
  );
  await expect(createDialog).not.toContainText(/(?:change|defect|investigation|audit)-v\d/i);
  await expect(createDialog.getByLabel("Title")).toHaveValue("Rendered acceptance change");
  await capturePhaseOne({
    id: "create-work-item-wide-light-change",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-CREATE-001",
    state: "ordinary-change-populated",
    fixture: "Create WorkItem deterministic CHANGE input",
    viewport: { width: 1440, height: 900 },
    theme: "Light",
    route: "/",
    captureScope: "production Create dialog only",
    authorityRefs: [
      "GW-DOC-WORKBENCH-UX",
      "GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM",
    ],
  }, createDialog);
  await page.setViewportSize({ width: 700, height: 800 });
  await expect(createDialog.getByLabel("Title")).toHaveValue("Rendered acceptance change");
  await expect(createDialog.getByRole("button", { name: "Cancel", exact: true })).toBeVisible();
  await capturePhaseOne({
    id: "create-work-item-narrow-light-change", workItemKind: "CHANGE",
    workflowStep: "Work request", surface: "SURF-CREATE-001", state: "ordinary-change-populated",
    fixture: "Create WorkItem deterministic CHANGE input", viewport: { width: 700, height: 800 },
    theme: "Light", route: "/", authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM"],
  }, createDialog);
  await page.setViewportSize({ width: 1440, height: 900 });
  await createDialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.getByRole("radio", { name: "Dark" }).click();
  await openCreate();
  await capturePhaseOne({
    id: "ia26-create-workitem-wide-dark", workItemKind: "CHANGE", workflowStep: "Work request",
    surface: "SURF-CREATE-001", state: "ordinary-change-populated-dark",
    fixture: "Create WorkItem deterministic CHANGE input", viewport: { width: 1440, height: 900 },
    theme: "Dark", route: "/", captureScope: "production Create dialog only",
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-THEME-V1"],
  }, createDialog);
  await createDialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.getByRole("radio", { name: "Light" }).click();

  await openWorkItem(page, "Completed investigation");
  const completedInvestigation = await workItemForTitle(page, "Completed investigation");
  await page.getByRole("button", { name: "Create linked remediation" }).click();
  const linkedDialog = page.getByRole("dialog", { name: "Create linked remediation" });
  await expect(linkedDialog).toBeVisible();
  await linkedDialog.getByRole("radio", { name: "Defect" }).click();
  await linkedDialog.getByLabel("Title").fill("Rendered acceptance remediation");
  await expect(linkedDialog).toContainText("Completed parent Investigation · same project");
  await expect(linkedDialog).not.toContainText(completedInvestigation.id);
  await capturePhaseOne({
    id: "create-linked-remediation-wide-light",
    workItemKind: "DEFECT",
    workflowStep: "Complete",
    surface: "SURF-CREATE-001",
    state: "linked-remediation",
    fixture: "Completed investigation linked-remediation creation",
    viewport: { width: 1440, height: 900 },
    theme: "Light",
    route: new URL(page.url()).pathname + new URL(page.url()).search,
    captureScope: "production linked-remediation dialog only; terminal descendant excluded",
    authorityRefs: [
      "GW-DOC-WORKBENCH-UX",
      "GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM",
    ],
  }, linkedDialog);
  await page.setViewportSize({ width: 700, height: 800 });
  await expect(linkedDialog).toContainText("Completed parent Investigation · same project");
  await expect(linkedDialog.getByLabel("Title")).toHaveValue("Rendered acceptance remediation");
  await capturePhaseOne({
    id: "create-linked-remediation-narrow-light", workItemKind: "DEFECT",
    workflowStep: "Complete", surface: "SURF-CREATE-001", state: "linked-remediation",
    fixture: "Completed investigation linked-remediation creation", viewport: { width: 700, height: 800 },
    theme: "Light", route: new URL(page.url()).pathname + new URL(page.url()).search,
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM"],
  }, linkedDialog);
  await page.setViewportSize({ width: 1440, height: 900 });
  await linkedDialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await backToQueue(page);

  await openWorkItem(page, "Change work type");
  await expect(page.getByTestId("workbench-workitem-shell")).toBeVisible();
  await expect(page.getByTestId("workflow-rail")).toBeVisible();
  const shellChrome = page.locator(".order-workbench-chrome");
  const currentAttention = page.locator(".order-workbench-attention");
  await expect(shellChrome).toBeVisible();
  const identity = page.getByTestId("workbench-identity");
  await expect(identity.getByRole("navigation", { name: "Work item navigation" }).getByRole("link", { name: "Back to queue" })).toBeVisible();
  await expect(identity.locator(".order-workbench-identity-primary").getByTestId("work-item-heading")).toBeVisible();
  // HUX-11: navigation is subordinate and title is the dominant identity.
  const identityHierarchy = await identity.evaluate((node) => {
    const nav = node.querySelector(".order-workbench-identity-navigation")!;
    const primary = node.querySelector(".order-workbench-identity-primary")!;
    const title = primary.querySelector("h1")!;
    const utilities = node.querySelector(".order-workbench-identity-utilities")!;
    return {
      navCenter: (nav.getBoundingClientRect().top + nav.getBoundingClientRect().bottom) / 2,
      primaryCenter: (primary.getBoundingClientRect().top + primary.getBoundingClientRect().bottom) / 2,
      utilityCenter: (utilities.getBoundingClientRect().top + utilities.getBoundingClientRect().bottom) / 2,
      primaryRight: primary.getBoundingClientRect().right,
      utilityLeft: utilities.getBoundingClientRect().left,
      titleSize: Number.parseFloat(getComputedStyle(title).fontSize),
      navSize: Number.parseFloat(getComputedStyle(nav.querySelector("a")!).fontSize),
    };
  });
  expect(Math.abs(identityHierarchy.primaryCenter - identityHierarchy.navCenter)).toBeLessThanOrEqual(4);
  expect(Math.abs(identityHierarchy.primaryCenter - identityHierarchy.utilityCenter)).toBeLessThanOrEqual(4);
  expect(identityHierarchy.primaryRight).toBeLessThanOrEqual(identityHierarchy.utilityLeft);
  expect(identityHierarchy.titleSize).toBeGreaterThan(identityHierarchy.navSize);
  const processRail = page.getByTestId("workflow-rail");
  await expect(processRail.locator(".order-workbench-process-marker")).toHaveCount(9);
  await expect(processRail.getByRole("button", { name: "Work request", exact: true }).locator(".order-workbench-rail-status")).toBeVisible();
  await expect(processRail.getByRole("button", { name: "Work request", exact: true })).toHaveAttribute("aria-current", "step");
  await expect(identity.locator(".order-workbench-identity-primary .order-workitem-kind")).toHaveText("Change");
  await expect(identity.locator(".order-workitem-kind")).toHaveCSS("border-radius", "0px");
  await expect(identity.getByRole("group", { name: "Work item actions" }).getByRole("button", { name: "Edit title", exact: true })).toBeVisible();
  await expect(currentAttention).toBeVisible();
  await expect(currentAttention).not.toContainText("Current attention:");

  await capturePhaseOne({
    id: "application-toolbar-workitem-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-APP-001",
    state: "selected-workitem-destination-wide",
    fixture: "Change work type selected WorkItem",
    viewport: { width: 1440, height: 900 },
    theme: "Light",
    route: new URL(page.url()).pathname + new URL(page.url()).search,
    authorityRefs: [
      "GW-DOC-WORKBENCH-UX",
      "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
    ],
    captureScope: "production application toolbar only; WorkItem body excluded",
  }, page.getByTestId("workbench-toolbar"));
  await page.setViewportSize({ width: 1000, height: 800 });
  await capturePhaseOne({
    id: "application-toolbar-workitem-medium-light",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-APP-001",
    state: "selected-workitem-destination-medium",
    fixture: "Change work type selected WorkItem",
    viewport: { width: 1000, height: 800 },
    theme: "Light",
    route: new URL(page.url()).pathname + new URL(page.url()).search,
    authorityRefs: [
      "GW-DOC-WORKBENCH-UX",
      "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
    ],
    captureScope: "production application toolbar only; WorkItem body excluded",
  }, page.getByTestId("workbench-toolbar"));
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.getByRole("button", { name: "Edit title", exact: true }).click();
  await expect(page.getByRole("button", { name: "Save title", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Start Research", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Cancel title edit", exact: true }).click();
  await expect(page.getByRole("button", { name: "Start Research", exact: true })).toBeVisible();

  await capturePhaseOne({
    id: "workitem-shell-wide-light-chrome",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-WI-001",
    state: "selected-workitem-chrome",
    fixture: "Change work type selected WorkItem",
    viewport: { width: 1440, height: 900 },
    theme: "Light",
    route: new URL(page.url()).pathname + new URL(page.url()).search,
    captureScope: "production WorkItem identity + workflow rail only",
    authorityRefs: [
      "GW-DOC-WORKBENCH-UX",
      "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
      "GW-DOC-WORKBENCH-THEME-V1",
    ],
  }, shellChrome);

  await capturePhaseOne({
    id: "workitem-shell-wide-light-current-attention",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-WI-001",
    state: "current-work-request-attention",
    fixture: "Change work type selected WorkItem",
    viewport: { width: 1440, height: 900 },
    theme: "Light",
    route: new URL(page.url()).pathname + new URL(page.url()).search,
    captureScope: "production current-attention region only",
    authorityRefs: [
      "GW-DOC-WORKBENCH-UX",
      "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
    ],
  }, currentAttention);

  await page.getByRole("button", { name: "Context", exact: true }).click();
  const context = page.getByTestId("work-item-context");
  await expect(context).toBeVisible();
  await expect(context.getByRole("heading", { name: "WorkItem identity", exact: true })).toBeVisible();
  await capturePhaseOne({
    id: "workitem-context-wide-light-selected-workitem",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-WI-CONTEXT-001",
    state: "selected-workitem-technical-inspection",
    fixture: "Change work type explicit WorkItem Context",
    viewport: { width: 1440, height: 900 },
    theme: "Light",
    route: new URL(page.url()).pathname + new URL(page.url()).search,
    captureScope: "production WorkItem Context panel only",
    authorityRefs: [
      "GW-DOC-WORKBENCH-UX",
      "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
    ],
  }, context);
  await page.getByRole("button", { name: "Close context", exact: true }).click();

  await page.setViewportSize({ width: 700, height: 800 });
  await expect(page.getByTestId("workbench-workitem-shell")).toHaveAttribute(
    "data-responsive-class",
    "narrow",
  );
  await expect(
    page.getByLabel("Current application destination").getByText("Work item", { exact: true }),
  ).toBeVisible();
  await capturePhaseOne({
    id: "application-toolbar-workitem-narrow-light",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-APP-001",
    state: "selected-workitem-destination-narrow",
    fixture: "Change work type selected WorkItem",
    viewport: { width: 700, height: 800 },
    theme: "Light",
    route: new URL(page.url()).pathname + new URL(page.url()).search,
    authorityRefs: [
      "GW-DOC-WORKBENCH-UX",
      "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
    ],
    captureScope: "production application toolbar only; WorkItem body excluded",
  }, page.getByTestId("workbench-toolbar"));
  const narrowIdentity = await identity.evaluate((node) => {
    const navigation = node.querySelector(".order-workbench-identity-navigation")!.getBoundingClientRect();
    const primary = node.querySelector(".order-workbench-identity-primary")!.getBoundingClientRect();
    const utilities = node.querySelector(".order-workbench-identity-utilities")!.getBoundingClientRect();
    return { navigationTop: navigation.top, utilitiesTop: utilities.top,
      primaryTop: primary.top, primaryWidth: primary.width, identityWidth: node.getBoundingClientRect().width,
      navigationBottom: navigation.bottom, utilitiesBottom: utilities.bottom };
  });
  expect(Math.abs(narrowIdentity.navigationTop - narrowIdentity.utilitiesTop)).toBeLessThanOrEqual(8);
  expect(narrowIdentity.primaryTop).toBeGreaterThanOrEqual(Math.max(narrowIdentity.navigationBottom, narrowIdentity.utilitiesBottom));
  expect(narrowIdentity.primaryWidth).toBeGreaterThan(narrowIdentity.identityWidth * 0.85);
  await capturePhaseOne({
    id: "workitem-shell-narrow-light-chrome",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-WI-001",
    state: "selected-workitem-chrome-narrow",
    fixture: "Change work type selected WorkItem",
    viewport: { width: 700, height: 800 },
    theme: "Light",
    route: new URL(page.url()).pathname + new URL(page.url()).search,
    captureScope: "production WorkItem identity + workflow rail only",
    authorityRefs: [
      "GW-DOC-WORKBENCH-UX",
      "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
    ],
  }, shellChrome);
  await capturePhaseOne({
    id: "workitem-shell-narrow-light-current-attention",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-WI-001",
    state: "current-work-request-attention-narrow",
    fixture: "Change work type selected WorkItem",
    viewport: { width: 700, height: 800 },
    theme: "Light",
    route: new URL(page.url()).pathname + new URL(page.url()).search,
    captureScope: "production current-attention region only",
    authorityRefs: [
      "GW-DOC-WORKBENCH-UX",
      "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
    ],
  }, currentAttention);
  await page.getByRole("button", { name: "Context", exact: true }).click();
  const contextDrawer = page.getByTestId("work-item-context-drawer");
  await expect(contextDrawer).toBeVisible();
  await expect(contextDrawer.getByRole("heading", { name: "WorkItem identity", exact: true })).toBeVisible();
  await capturePhaseOne({
    id: "workitem-context-narrow-light-selected-workitem", workItemKind: "CHANGE",
    workflowStep: "Work request", surface: "SURF-WI-CONTEXT-001",
    state: "selected-workitem-technical-inspection", fixture: "Change work type explicit WorkItem Context",
    viewport: { width: 700, height: 800 }, theme: "Light",
    route: new URL(page.url()).pathname + new URL(page.url()).search,
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2"],
  }, contextDrawer);
  await contextDrawer.getByRole("button", { name: "Close context", exact: true }).click();
  await expect(contextDrawer).toBeHidden();
  await expect(page.getByTestId("work-item-heading")).toHaveText("Change work type");

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole("link", { name: "Settings", exact: true }).click();
  await expect(page.getByTestId("settings-workspace")).toBeVisible();
  await capturePhaseOne({
    id: "application-toolbar-settings-wide-light",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-APP-001",
    state: "settings-destination-wide",
    fixture: "Settings destination",
    viewport: { width: 1440, height: 900 },
    theme: "Light",
    route: new URL(page.url()).pathname + new URL(page.url()).search,
    authorityRefs: [
      "GW-DOC-WORKBENCH-UX",
      "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
    ],
    captureScope: "production application toolbar only; Settings body excluded",
  }, page.getByTestId("workbench-toolbar"));
  await page.setViewportSize({ width: 1000, height: 800 });
  await capturePhaseOne({
    id: "application-toolbar-settings-medium-light",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-APP-001",
    state: "settings-destination-medium",
    fixture: "Settings destination",
    viewport: { width: 1000, height: 800 },
    theme: "Light",
    route: new URL(page.url()).pathname + new URL(page.url()).search,
    authorityRefs: [
      "GW-DOC-WORKBENCH-UX",
      "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
    ],
    captureScope: "production application toolbar only; Settings body excluded",
  }, page.getByTestId("workbench-toolbar"));
  await page.setViewportSize({ width: 700, height: 800 });
  await expect(
    page.getByLabel("Current application destination").getByText("Settings", { exact: true }),
  ).toBeVisible();
  await capturePhaseOne({
    id: "application-toolbar-settings-narrow-light",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-APP-001",
    state: "settings-destination-narrow",
    fixture: "Settings destination",
    viewport: { width: 700, height: 800 },
    theme: "Light",
    route: new URL(page.url()).pathname + new URL(page.url()).search,
    authorityRefs: [
      "GW-DOC-WORKBENCH-UX",
      "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
    ],
    captureScope: "production application toolbar only; Settings body excluded",
  }, page.getByTestId("workbench-toolbar"));

  // Bounded HUX-10/HUX-11 evidence: exercise the same shell over a real Review
  // destination, without changing or accepting the Review body.
  if (!diagnosticCurrentState) {
    await page.goto("/");
    await page.setViewportSize({ width: 1440, height: 900 });
    await openWorkItem(page, "Awaiting sign-off");
    await selectWorkflowStep(page, "Approval");
    await expect(page.getByTestId("workbench-workitem-shell")).toBeVisible();
    await expect(page.getByTestId("work-item-heading")).toHaveText("Awaiting sign-off");
    await expect(page.getByTestId("workflow-rail").getByRole("button", { name: "Approval", exact: true }))
      .toHaveAttribute("aria-current", "step");
    await expect(page.getByLabel("Current application destination").getByText("Work item", { exact: true })).toBeVisible();
    for (const viewport of [{ width: 1440, height: 900 }, { width: 700, height: 800 }]) {
      await page.setViewportSize(viewport);
      for (const theme of ["Light", "Dark"] as const) {
        await page.getByRole("radio", { name: theme }).click();
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme.toLowerCase());
        await expect(page.getByTestId("workbench-identity").getByTestId("work-item-heading")).toBeVisible();
        await expect(page.getByTestId("workbench-toolbar").getByLabel("Current application destination")).toBeVisible();
        await capturePhaseOne({
          id: (renderedEvidenceKind === "bounded_phase_acceptance" ? "bounded-" : "") +
            "hux-shell-approval-" + (viewport.width === 1440 ? "wide" : "narrow") + "-" + theme.toLowerCase(),
          workItemKind: "CHANGE",
          workflowStep: "Approval",
          surface: "SURF-WI-001",
          state: "selected-workitem-chrome-review",
          fixture: "Awaiting sign-off (shared shell only; Review body not accepted)",
          viewport,
          theme,
          route: new URL(page.url()).pathname + new URL(page.url()).search,
          authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2", "GW-DOC-WORKBENCH-THEME-V1"],
        });
      }
    }
    await page.getByRole("radio", { name: "Light" }).click();
    expect(entries.filter((entry) => entry.id.includes("hux-shell-approval-"))).toHaveLength(4);
  }
  if (!diagnosticCurrentState && signedRenderedPhase === null) writeRenderedAcceptanceEvidence(entries);
  validateSignedPhaseEvidence(entries);
  expect([...new Set(entries.map((entry) => entry.surface))].sort()).toEqual([
    "SURF-APP-001",
    "SURF-CREATE-001",
    "SURF-QUEUE-001",
    "SURF-WI-001",
    "SURF-WI-CONTEXT-001",
  ]);
  expect(expectedDiagnosticConsoleErrors).toBe(0);
  expect(runtimeErrors).toEqual([]);
});


test("rendered acceptance IA26 captures downstream Workbench", async ({
  page,
  request,
}) => {
  test.skip(
    renderedAcceptanceDir === undefined || signedRenderedPhase === "IA27_28",
    "IA26 rendered acceptance runs only in its GitHub Actions evidence step",
  );
  test.setTimeout(300_000);

  if (
    diagnosticCurrentState &&
    (diagnosticPhase === null ||
      !renderedDiagnosticPhases.includes(diagnosticPhase as RenderedDiagnosticPhase))
  ) {
    throw new TypeError(
      "PONTIVUS_ORDER_DIAGNOSTIC_PHASE must select one IA29-IA34 rendered diagnostic phase",
    );
  }

  const runtimeErrors: string[] = [];
  let expectedConflictConsoleErrors = 0;
  page.on("pageerror", (error) => runtimeErrors.push("pageerror: " + error.message));
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    if (
      expectedConflictConsoleErrors > 0 &&
      message.text().includes("status of 409 (Conflict)")
    ) {
      expectedConflictConsoleErrors -= 1;
      return;
    }
    runtimeErrors.push("console: " + message.text());
  });

  let loginStatus: "PENDING" | "COMPLETED" | "FAILED" | "EXPIRED" | "CANCELLED" = "PENDING";
  const loginAttemptId = "00000000-0000-4000-8000-00000000a026";
  const accountState = OpenCodeAccountStateSchema.parse({
    accounts: [
      { id: "cred_ia26_alpha", label: "alpha@example.com", active: true, status: { status: "READY" } },
      { id: "cred_ia26_beta", label: "beta@example.com", active: false, status: { status: "READY" } },
    ],
    activeAccountId: "cred_ia26_alpha",
    mutationBlockers: [],
  });
  await page.route("**/api/opencode/accounts**", async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    if (url.pathname === "/api/opencode/accounts" && req.method() === "GET") {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(accountState) });
      return;
    }
    if (url.pathname === "/api/opencode/accounts/login" && req.method() === "POST") {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          id: loginAttemptId,
          authorizationUrl: "https://opencode.ai/console/device",
          instructions: "Open the verification page and continue.",
          expiresAt: "2026-11-24T04:00:00.000Z",
          status: "PENDING",
          message: null,
        }),
      });
      return;
    }
    if (url.pathname === "/api/opencode/accounts/login/" + loginAttemptId && req.method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: loginAttemptId,
          authorizationUrl: "https://opencode.ai/console/device",
          instructions: "Open the verification page and continue.",
          expiresAt: "2026-11-24T04:00:00.000Z",
          status: loginStatus,
          message: loginStatus === "FAILED" ? "Provider rejected sign-in." : null,
        }),
      });
      return;
    }
    if (url.pathname === "/api/opencode/accounts/login/" + loginAttemptId && req.method() === "DELETE") {
      await route.fulfill({ status: 204 });
      return;
    }
    await route.fallback();
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await authenticate(page, request);
  await page.getByRole("radio", { name: "Light" }).click();

  const entries: RenderedAcceptanceEntry[] = [];
  const routeValue = (): string => {
    const url = new URL(page.url());
    return url.pathname + url.search;
  };
  const capture = async (
    entry: RenderedAcceptanceInput,
    target?: Locator,
  ): Promise<void> => {
    entries.push(await captureRenderedAcceptance(page, entry, target));
    if (diagnosticCurrentState || renderedEvidenceKind !== "ia26_acceptance") return;
    if (mediumComparisonSources[entry.surface as keyof typeof mediumComparisonSources] !== entry.id) return;
    try {
      const viewport = { width: 1000, height: 800 };
      await page.setViewportSize(viewport);
      const settingsCapture = entry.surface.startsWith("SURF-SET-") ||
        entry.surface === "SURF-CONF-REPO-DISCONNECT-001" ||
        entry.surface === "SURF-CONF-OC-REMOVE-001";
      if (settingsCapture) {
        await expect(page.getByTestId("workbench-settings-layout"))
          .toHaveAttribute("data-responsive-class", "medium");
        if (target !== undefined) await expect(target, entry.id + " medium selected Settings task").toBeVisible();
      }
      entries.push(await captureRenderedAcceptance(page, {
        ...entry, id: mediumComparisonId(entry.id), viewport,
      }, target));
    } finally {
      await page.setViewportSize(entry.viewport);
    }
    if (entry.surface.startsWith("SURF-SET-") ||
        entry.surface === "SURF-CONF-REPO-DISCONNECT-001" ||
        entry.surface === "SURF-CONF-OC-REMOVE-001") {
      await expect(page.getByTestId("workbench-settings-layout"))
        .toHaveAttribute("data-responsive-class", referenceViewportClass(entry.viewport)!);
      if (target !== undefined) await expect(target, entry.id + " restored Settings task").toBeVisible();
    }
  };
  const light = { width: 1440, height: 900 } as const;
  const narrow = { width: 700, height: 800 } as const;

  if (runRenderedPhase("IA34")) {
  // IA34 — Settings and OpenCode, including the two destructive confirmations.
  await page.getByRole("link", { name: "Settings", exact: true }).click();
  const settings = page.getByTestId("settings-workspace");
  const repositories = page.getByTestId("settings-repositories");
  await expect(settings).toBeVisible();
  await expect(repositories).toBeVisible();
  await expect(settings.getByText("Checking installation readiness…", { exact: true }))
    .toHaveCount(0, { timeout: 15_000 });
  await expect(settings.getByText("Settings readiness unavailable", { exact: true }))
    .toHaveCount(0);
  if (diagnosticCurrentState) {
    await capture({
      id: "diagnostic-application-settings-wide-light",
      workItemKind: "QUEUE",
      workflowStep: null,
      surface: "SURF-APP-001",
      state: "settings-destination-wide",
      fixture: "deterministic installation Settings",
      viewport: light,
      theme: "Light",
      route: routeValue(),
      authorityRefs: [
        "GW-DOC-WORKBENCH-UX",
        "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
        "GW-DOC-WORKBENCH-THEME-V1",
      ],
      captureScope: "full application viewport",
    });
    await page.setViewportSize(narrow);
    await capture({
      id: "diagnostic-application-settings-narrow-light",
      workItemKind: "QUEUE",
      workflowStep: null,
      surface: "SURF-APP-001",
      state: "settings-destination-narrow",
      fixture: "deterministic installation Settings",
      viewport: narrow,
      theme: "Light",
      route: routeValue(),
      authorityRefs: [
        "GW-DOC-WORKBENCH-UX",
        "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
      ],
      captureScope: "full application viewport",
    });
    await page.setViewportSize(light);
  }
  await capture({
    id: "ia26-settings-frame-wide-light",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-SET-001",
    state: "repositories-current-diagnostics-closed",
    fixture: "deterministic installation Settings",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-INSTALLATION-READINESS"],
  }, settings);
  await capture({
    id: "ia26-settings-repositories-wide-light",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-SET-REPO-001",
    state: "connected-repository-inventory",
    fixture: "order-e2e connected repository",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-PROJECT-GOVERNANCE-INTEGRATION"],
  }, repositories);

  await repositories.getByRole("button", { name: "Add repository" }).click();
  const addRepository = repositories.getByTestId("add-repository-form");
  await expect(addRepository).toBeVisible();
  if (!diagnosticCurrentState) {
    // A responsive layout change must not reset an unsubmitted Settings
    // task or its input. Do not reopen or reconstruct the form to pass.
    const exactRoot = addRepository.getByLabel("Exact Git root");
    await exactRoot.fill("/tmp/order-responsive-unsaved-repository");
    const settingsLayout = page.getByTestId("workbench-settings-layout");
    for (const viewport of [
      { width: 1000, height: 800 },
      { width: 700, height: 800 },
      light,
    ]) {
      await page.setViewportSize(viewport);
      await expect(settingsLayout).toHaveAttribute("data-responsive-class",
        viewport.width >= 1280 ? "wide" : viewport.width >= 800 ? "medium" : "narrow");
      await expect(addRepository, "responsive Settings task must remain mounted").toBeVisible();
      await expect(exactRoot, "unsubmitted repository root must survive reflow")
        .toHaveValue("/tmp/order-responsive-unsaved-repository");
    }
    await exactRoot.fill("");
  }
  await capture({
    id: "ia26-settings-repository-add-wide-light",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-SET-REPO-ADD-001",
    state: "bounded-add-repository-task",
    fixture: "repository add task",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, addRepository);
  await expect(addRepository.getByRole("button", { name: "Cancel add repository" }),
    "repository task must survive the medium evidence capture").toBeVisible();
  await addRepository.getByRole("button", { name: "Cancel add repository" }).click();

  const repositoryTable = repositories.getByRole("table", { name: "Connected repositories" });
  const repositoryRow = repositoryTable.getByRole("row").nth(1);
  await repositoryRow.getByRole("button", { name: /^Move WorkItem documents for / }).click();
  const moveDocuments = page.getByTestId("settings-repositories");
  await expect(
    moveDocuments.getByRole("heading", { name: "Move WorkItem documents" }),
  ).toBeVisible();
  await capture({
    id: "ia26-settings-repository-move-wide-light",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-SET-REPO-MOVE-001",
    state: "bounded-document-root-migration",
    fixture: "repository document-root move task",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM"],
  }, moveDocuments);
  await expect(moveDocuments.getByTestId("move-workitem-documents")).toBeVisible();
  await expect(moveDocuments.getByRole("button", { name: "Cancel move" })).toBeVisible();
  await moveDocuments.getByRole("button", { name: "Cancel move" }).click();

  await repositoryRow.getByRole("button", { name: /^Disconnect / }).click();
  const disconnect = page.getByRole("alertdialog", { name: "Disconnect repository?" });
  await capture({
    id: "ia26-confirm-repository-disconnect-wide-light",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-CONF-REPO-DISCONNECT-001",
    state: "destructive-confirmation",
    fixture: "connected repository disconnect confirmation",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    captureScope: "production confirmation only",
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, disconnect);
  await disconnect.getByRole("button", { name: "Cancel" }).click();

  await settings.getByRole("link", { name: "OpenCode", exact: true }).click();
  const openCode = page.getByTestId("settings-opencode");
  await expect(openCode).toBeVisible();
  await capture({
    id: "ia26-settings-opencode-wide-light",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-SET-OC-001",
    state: "saved-account-inventory",
    fixture: "two deterministic saved OpenCode accounts",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-OPENCODE-INTEGRATION-V1"],
  }, openCode);

  await openCode.getByRole("button", { name: "Rename beta@example.com" }).click();
  const renameAccount = page.getByTestId("rename-opencode-account");
  await expect(renameAccount).toBeVisible();
  await capture({
    id: "ia26-settings-opencode-rename-wide-light",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-SET-OC-RENAME-001",
    state: "bounded-rename-task",
    fixture: "saved OpenCode account rename",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-OPENCODE-INTEGRATION-V1"],
  }, renameAccount);
  await renameAccount.getByRole("button", { name: "Cancel rename" }).click();

  await openCode.getByRole("button", { name: "Remove beta@example.com" }).click();
  const removeAccount = page.getByRole("alertdialog", { name: "Remove saved OpenCode account?" });
  await capture({
    id: "ia26-confirm-opencode-remove-wide-light",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-CONF-OC-REMOVE-001",
    state: "destructive-confirmation",
    fixture: "saved OpenCode account removal",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    captureScope: "production confirmation only",
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-OPENCODE-INTEGRATION-V1"],
  }, removeAccount);
  await removeAccount.getByRole("button", { name: "Cancel" }).click();

  await openCode.getByRole("button", { name: "Add account" }).click();
  const addAccount = page.getByTestId("add-opencode-account");
  await capture({
    id: "ia26-settings-opencode-add-wide-light",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-SET-OC-ADD-001",
    state: "bounded-add-account-task",
    fixture: "saved OpenCode account add",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-OPENCODE-INTEGRATION-V1"],
  }, addAccount);
  await addAccount.getByLabel("Account label").fill("ia26@example.com");
  loginStatus = "PENDING";
  await addAccount.getByRole("button", { name: "Continue to OpenCode sign-in" }).click();
  const loginAttempt = page.getByTestId("opencode-login-attempt");
  await expect(loginAttempt).toContainText("Waiting for sign-in");
  await capture({
    id: "ia26-settings-opencode-login-pending-wide-light",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-SET-OC-LOGIN-001",
    state: "pending-authorization",
    fixture: "deterministic pending OpenCode login",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-OPENCODE-INTEGRATION-V1"],
  }, loginAttempt);
  await expect(loginAttempt).toContainText("Waiting for sign-in");
  await expect(loginAttempt.getByRole("button", { name: "Cancel OpenCode sign-in" })).toBeVisible();
  await loginAttempt.getByRole("button", { name: "Cancel OpenCode sign-in" }).click();
  await expect(openCode.getByRole("button", { name: "Add account" })).toBeVisible();

  for (const [status, label] of [
    ["COMPLETED", "sign-in-complete"],
    ["FAILED", "sign-in-failed"],
    ["EXPIRED", "sign-in-expired"],
    ["CANCELLED", "sign-in-cancelled"],
  ] as const) {
    loginStatus = status;
    await openCode.getByRole("button", { name: "Add account" }).click();
    await openCode.getByLabel("Account label").fill("ia26-" + status.toLowerCase() + "@example.com");
    await openCode.getByRole("button", { name: "Continue to OpenCode sign-in" }).click();
    const terminalLogin = page.getByTestId("opencode-login-attempt");
    await expect(terminalLogin.getByRole("button", { name: "Done" })).toBeVisible({ timeout: 5_000 });
    await capture({
      id: "ia26-settings-opencode-login-" + status.toLowerCase() + "-wide-light",
      workItemKind: "QUEUE",
      workflowStep: null,
      surface: "SURF-SET-OC-LOGIN-001",
      state: label,
      fixture: "deterministic " + status.toLowerCase() + " OpenCode login",
      viewport: light,
      theme: "Light",
      route: routeValue(),
      authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-OPENCODE-INTEGRATION-V1"],
    }, terminalLogin);
    await terminalLogin.getByRole("button", { name: "Done" }).click();
  }

  await settings.getByRole("link", { name: "Model & runtime", exact: true }).click();
  const modelSettings = page.getByTestId("settings-model");
  await expect(modelSettings.getByText("Loading available models…", { exact: true }))
    .toHaveCount(0, { timeout: 15_000 });
  await expect(modelSettings.getByText("Available models could not be loaded", { exact: true }))
    .toHaveCount(0);
  await expect(
    modelSettings.getByRole("combobox", { name: "Configured model", exact: true }),
  ).toContainText("opencode/glm-5.3-flash-free");
  await expect(modelSettings.getByText("Configured model is unavailable", { exact: true }))
    .toBeVisible();
  await capture({
    id: "ia26-settings-model-wide-light",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-SET-MODEL-001",
    state: "configured-model-task",
    fixture: "deterministic model/runtime settings",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-OPENCODE-INTEGRATION-V1"],
  }, modelSettings);
  await page.getByRole("radio", { name: "Dark" }).click();
  await capture({
    id: "ia26-settings-model-wide-dark",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-SET-MODEL-001",
    state: "configured-model-task-dark",
    fixture: "deterministic model/runtime settings",
    viewport: light,
    theme: "Dark",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-THEME-V1"],
  }, modelSettings);
  await page.getByRole("radio", { name: "Light" }).click();

  const diagnosticsToggle = settings.getByRole("button", { name: "Inspect settings diagnostics", exact: true });
  await diagnosticsToggle.click();
  await capture({
    id: "ia26-settings-diagnostics-model-wide-light",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-SET-001",
    state: "explicit-settings-diagnostics",
    fixture: "model settings explicit diagnostics",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, page.getByTestId("settings-diagnostics"));
  await settings.getByRole("button", { name: "Hide settings diagnostics", exact: true }).click();

  await page.setViewportSize(narrow);
  await capture({
    id: "ia26-settings-model-narrow-light",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-SET-MODEL-001",
    state: "configured-model-task-narrow",
    fixture: "deterministic model/runtime settings",
    viewport: narrow,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2"],
  }, settings);
  await page.setViewportSize(light);

  }

  if (runRenderedPhase("IA29")) {
  // IA29 — Work request, document materials, and safety confirmations.
  await page.goto("/");
  await openWorkItem(page, "Source editing workbench");
  await selectWorkflowStep(page, "Work request");
  if (diagnosticCurrentState) {
    await capture({
      id: "diagnostic-application-workitem-wide-light",
      workItemKind: "CHANGE",
      workflowStep: "Work request",
      surface: "SURF-APP-001",
      state: "selected-workitem-destination-wide",
      fixture: "Source editing workbench",
      viewport: light,
      theme: "Light",
      route: routeValue(),
      authorityRefs: [
        "GW-DOC-WORKBENCH-UX",
        "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
      ],
      captureScope: "full application viewport",
    });
    await page.setViewportSize({ width: 1000, height: 800 });
    await capture({
      id: "diagnostic-application-workitem-medium-light",
      workItemKind: "CHANGE",
      workflowStep: "Work request",
      surface: "SURF-APP-001",
      state: "selected-workitem-destination-medium",
      fixture: "Source editing workbench",
      viewport: { width: 1000, height: 800 },
      theme: "Light",
      route: routeValue(),
      authorityRefs: [
        "GW-DOC-WORKBENCH-UX",
        "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
      ],
      captureScope: "full application viewport",
    });
    await page.setViewportSize(narrow);
    await capture({
      id: "diagnostic-application-workitem-narrow-light",
      workItemKind: "CHANGE",
      workflowStep: "Work request",
      surface: "SURF-APP-001",
      state: "selected-workitem-destination-narrow",
      fixture: "Source editing workbench",
      viewport: narrow,
      theme: "Light",
      route: routeValue(),
      authorityRefs: [
        "GW-DOC-WORKBENCH-UX",
        "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
      ],
      captureScope: "full application viewport",
    });
    await page.setViewportSize(light);
  }
  if (!diagnosticCurrentState) {
    for (const [viewport, theme, suffix] of [
      [light, "Light", "wide-light"],
      [narrow, "Dark", "narrow-dark"],
    ] as const) {
      await page.setViewportSize(viewport);
      await page.getByRole("radio", { name: theme }).click();
      await expect(page.getByTestId("workbench-identity")).toBeVisible();
      await capture({
        id: "hux-shell-document-" + suffix, workItemKind: "CHANGE",
        workflowStep: "Work request", surface: "SURF-WI-001",
        state: "default", fixture: "Source editing workbench shared identity",
        viewport, theme, route: routeValue(),
        authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-THEME-V1"],
      });
    }
    await page.setViewportSize(light);
    await page.getByRole("radio", { name: "Light" }).click();
  }
  const sourceMaterial = page.getByTestId("source-document-material");
  await expect(sourceMaterial.getByTestId("workbench-document")).toHaveCount(1);
  const workRequestDetails = sourceMaterial.getByRole("button", {
    name: "Work request context",
    exact: true,
  });
  await expect(workRequestDetails).toBeVisible();
  await expect(sourceMaterial.getByLabel("Work request context")).not.toBeVisible();
  const workRequestDocument = sourceMaterial.getByTestId("markdown-document-view");
  await expect(workRequestDocument).toBeVisible();
  const expectReadableWorkRequest = async (): Promise<void> => {
    const preview = workRequestDocument.getByTestId("markdown-preview");
    await expect(preview).toBeVisible();
    await expect(preview.getByText("Requested outcome", { exact: true })).toBeVisible();
    const geometry = await preview.evaluate((node) => {
      const viewport = node.closest(".order-workbench-document-content");
      if (!(viewport instanceof HTMLElement)) throw new Error("Document content owner missing");
      return {
        previewHeight: node.getBoundingClientRect().height,
        previewContentHeight: node.scrollHeight,
        ownerHeight: viewport.clientHeight,
        ownerOverflow: getComputedStyle(viewport).overflowY,
      };
    });
    expect(geometry.previewHeight).toBeGreaterThan(0);
    expect(geometry.previewHeight + 1).toBeGreaterThanOrEqual(geometry.previewContentHeight);
    expect(geometry.ownerHeight).toBeGreaterThan(0);
    expect(geometry.ownerOverflow).toBe("auto");
  };
  await expectReadableWorkRequest();
  const [documentBox, detailsBox] = await Promise.all([
    workRequestDocument.boundingBox(),
    workRequestDetails.boundingBox(),
  ]);
  expect(documentBox).not.toBeNull();
  expect(detailsBox).not.toBeNull();
  if (documentBox !== null && detailsBox !== null) {
    expect(documentBox.y).toBeLessThan(detailsBox.y);
  }
  await workRequestDetails.click();
  await expect(sourceMaterial.getByLabel("Work request context")).toContainText("Work type");
  await expect(sourceMaterial.getByLabel("Work request context")).toContainText("Project");
  await expect(sourceMaterial.getByLabel("Work request context")).toContainText("Concerns");
  await expect(sourceMaterial.getByLabel("Work request context")).toContainText("Repository path");
  await expect(sourceMaterial.getByLabel("Work request context")).toContainText("WorkItem documents");
  await workRequestDetails.click();
  await expect(sourceMaterial.getByLabel("Work request context")).not.toBeVisible();
  await expect(sourceMaterial).not.toContainText("schemaId");
  await expect(sourceMaterial.getByText("Requested outcome", { exact: true }))
    .toBeVisible({ timeout: 15_000 });
  await capture({
    id: "ia26-work-request-step-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-STEP-WR-001",
    state: "source-selected",
    fixture: "Source editing workbench",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-MARKDOWN-WORKBENCH-V1"],
  });
  await page.setViewportSize(narrow);
  await expectReadableWorkRequest();
  await expect(sourceMaterial.getByText("Requested outcome", { exact: true }))
    .toBeVisible({ timeout: 15_000 });
  await capture({
    id: "ia26-work-request-step-narrow-light",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-STEP-WR-001",
    state: "source-selected-narrow",
    fixture: "Source editing workbench",
    viewport: narrow,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2"],
  });
  await page.setViewportSize({ width: 1000, height: 800 });
  await capture({
    id: "ia26-workitem-medium-light",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-WI-001",
    state: "selected-workitem-medium",
    fixture: "Source editing workbench",
    viewport: { width: 1000, height: 800 },
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2"],
  });
  await page.setViewportSize(light);
  await page.getByRole("radio", { name: "Dark" }).click();
  await capture({
    id: "ia26-work-request-step-wide-dark",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-STEP-WR-001",
    state: "source-selected-dark",
    fixture: "Source editing workbench",
    viewport: light,
    theme: "Dark",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-THEME-V1"],
  });
  await capture({
    id: "ia26-workitem-shell-wide-dark",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-WI-001",
    state: "selected-workitem-shell-dark",
    fixture: "Source editing workbench",
    viewport: light,
    theme: "Dark",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-THEME-V1"],
  }, page.locator(".order-workbench-chrome"));
  await page.getByRole("button", { name: "Context", exact: true }).click();
  await capture({
    id: "ia26-context-wide-dark",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-WI-CONTEXT-001",
    state: "explicit-technical-context-dark",
    fixture: "Source editing workbench",
    viewport: light,
    theme: "Dark",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-THEME-V1"],
  }, page.getByTestId("work-item-context"));
  await page.getByRole("button", { name: "Close context", exact: true }).click();
  await page.getByRole("radio", { name: "Light" }).click();
  await capture({
    id: "ia26-source-document-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-MAT-SOURCE-001",
    state: "read-view",
    fixture: "Source editing workbench canonical source",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    captureScope: "production source document material",
    authorityRefs: ["GW-DOC-MARKDOWN-WORKBENCH-V1", "GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM"],
  }, sourceMaterial);

  const sourceEditor = await openMarkdownEditor(page, "WorkItem source Markdown source");
  await capture({
    id: "ia26-source-document-editor-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-MAT-SOURCE-001",
    state: "active-editor",
    fixture: "Source editing workbench active source editor",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-MARKDOWN-WORKBENCH-V1"],
  }, page.locator("form.order-markdown-editor"));
  const formattingButtonTops = await page.getByTestId("markdown-format-toolbar")
    .getByRole("button")
    .evaluateAll((nodes) =>
      nodes.map((node) => Math.round(node.getBoundingClientRect().top)));
  expect(formattingButtonTops.length).toBeGreaterThan(0);
  expect(Math.max(...formattingButtonTops) - Math.min(...formattingButtonTops))
    .toBeLessThanOrEqual(2);

  await page.setViewportSize(narrow);
  const narrowFormattingButtonTops = await page.getByTestId("markdown-format-toolbar")
    .getByRole("button")
    .evaluateAll((nodes) =>
      nodes.map((node) => Math.round(node.getBoundingClientRect().top)));
  expect(narrowFormattingButtonTops.length).toBeGreaterThan(0);
  expect(Math.max(...narrowFormattingButtonTops) - Math.min(...narrowFormattingButtonTops))
    .toBeLessThanOrEqual(2);
  const narrowFormattingOverflow = await page.getByTestId("markdown-format-toolbar")
    .evaluate((node) => ({
      overflowX: getComputedStyle(node).overflowX,
      scrollWidth: node.scrollWidth,
      clientWidth: node.clientWidth,
    }));
  expect(narrowFormattingOverflow.overflowX).toBe("auto");
  expect(narrowFormattingOverflow.scrollWidth)
    .toBeGreaterThanOrEqual(narrowFormattingOverflow.clientWidth);
  const narrowEditorActionRegion = page.locator(
    "form.order-markdown-editor .order-markdown-editor-actions",
  );
  const narrowEditorActionOverflow = await narrowEditorActionRegion.evaluate((node) => ({
    scrollWidth: node.scrollWidth,
    clientWidth: node.clientWidth,
  }));
  expect(narrowEditorActionOverflow.scrollWidth)
    .toBeLessThanOrEqual(narrowEditorActionOverflow.clientWidth);
  const narrowEditorBounds = await page.locator("form.order-markdown-editor").boundingBox();
  expect(narrowEditorBounds).not.toBeNull();
  for (const label of ["Save", "Cancel"] as const) {
    const actionBounds = await page.locator("form.order-markdown-editor")
      .getByRole("button", { name: label, exact: true })
      .boundingBox();
    expect(actionBounds).not.toBeNull();
    if (narrowEditorBounds !== null && actionBounds !== null) {
      expect(actionBounds.x).toBeGreaterThanOrEqual(narrowEditorBounds.x - 1);
      expect(actionBounds.x + actionBounds.width)
        .toBeLessThanOrEqual(narrowEditorBounds.x + narrowEditorBounds.width + 1);
    }
  }
  await capture({
    id: "ia26-source-document-editor-narrow-light",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-MAT-SOURCE-001",
    state: "active-editor-narrow-overflow",
    fixture: "Source editing workbench active source editor",
    viewport: narrow,
    theme: "Light",
    route: routeValue(),
    authorityRefs: [
      "GW-DOC-MARKDOWN-WORKBENCH-V1",
      "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
    ],
  }, page.locator("form.order-markdown-editor"));
  await page.setViewportSize(light);

  await page.getByRole("radio", { name: "Dark" }).click();
  await capture({
    id: "ia26-source-document-editor-wide-dark",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-MAT-SOURCE-001",
    state: "active-editor-dark",
    fixture: "Source editing workbench active source editor",
    viewport: light,
    theme: "Dark",
    route: routeValue(),
    authorityRefs: ["GW-DOC-MARKDOWN-WORKBENCH-V1", "GW-DOC-WORKBENCH-THEME-V1"],
  }, page.locator("form.order-markdown-editor"));
  await page.getByRole("radio", { name: "Light" }).click();

  const sourceText = await markdownSourceValue(sourceEditor);
  await replaceMarkdownSource(page, sourceEditor, sourceText + "\nIA26 unsaved material\n");
  await capture({
    id: "ia26-source-document-dirty-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-MAT-SOURCE-001",
    state: "dirty-unsaved-buffer",
    fixture: "Source editing workbench dirty source",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-MARKDOWN-WORKBENCH-V1"],
  }, page.locator("form.order-markdown-editor"));

  const sourceItem = await workItemForTitle(page, "Source editing workbench");
  const sourceResponse = await page.context().request.get(
    "/api/work-items/" + sourceItem.id + "/source",
  );
  expect(sourceResponse.status()).toBe(200);
  const sourceSnapshot = WorkItemSourceSnapshotSchema.parse(await sourceResponse.json());
  const sourceFilePath = join(repositoryRoot, sourceSnapshot.path);
  const canonicalSourceBeforeConflict = readFileSync(sourceFilePath, "utf8");
  writeFileSync(
    sourceFilePath,
    canonicalSourceBeforeConflict.replace(
      "# Source editing workbench",
      "# Source editing IA26 external change",
    ),
  );
  expectedConflictConsoleErrors = 1;
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText(/canonical file changed while this buffer was open/i)).toBeVisible();
  await expect.poll(() => expectedConflictConsoleErrors).toBe(0);
  await capture({
    id: "ia26-source-document-conflict-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-MAT-SOURCE-001",
    state: "canonical-document-changed",
    fixture: "Source editing workbench external canonical drift",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-MARKDOWN-WORKBENCH-V1"],
  }, page.locator("form.order-markdown-editor"));
  await page.getByRole("button", { name: "Reload current", exact: true }).click();
  await expect.poll(() => markdownSourceValue(sourceEditor))
    .toContain("# Source editing IA26 external change");
  const reloadedSource = await markdownSourceValue(sourceEditor);
  await replaceMarkdownSource(page, sourceEditor, reloadedSource + "\nIA26 unsaved material\n");

  await page.getByTestId("workflow-rail").getByRole("button", { name: "Research", exact: true }).click();
  const dirtyMaterial = page.getByRole("alertdialog", { name: "Discard unsaved Markdown?" });
  await capture({
    id: "ia26-confirm-dirty-material-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-CONF-DIRTY-MATERIAL-001",
    state: "dirty-material-navigation",
    fixture: "unsaved Work request source",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    captureScope: "production confirmation only",
    authorityRefs: ["GW-DOC-MARKDOWN-WORKBENCH-V1"],
  }, dirtyMaterial);
  await dirtyMaterial.getByRole("button", { name: "Cancel", exact: true }).click();

  await page.getByRole("link", { name: "Back to queue" }).click();
  const dirtyDestination = page.getByRole("alertdialog", { name: "Discard unsaved Markdown?" });
  await capture({
    id: "ia26-confirm-dirty-destination-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-CONF-DIRTY-DEST-001",
    state: "dirty-destination-navigation",
    fixture: "unsaved Work request source",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    captureScope: "production confirmation only",
    authorityRefs: ["GW-DOC-MARKDOWN-WORKBENCH-V1"],
  }, dirtyDestination);
  await dirtyDestination.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();

  await backToQueue(page);
  await openWorkItem(page, "Lifecycle editing workbench");
  await selectWorkflowStep(page, "Implementation plan");
  const planMaterial = page.getByTestId("lifecycle-document-material");
  await expect(planMaterial.getByTestId("workbench-document")).toHaveCount(1);
  const documentDetails = planMaterial.getByRole("button", {
    name: "Document location",
    exact: true,
  });
  await expect(documentDetails).toBeVisible();
  await expect(planMaterial.getByLabel("Document location")).not.toBeVisible();
  await documentDetails.click();
  await expect(planMaterial.getByLabel("Document location")).toContainText("Repository path");
  await expect(planMaterial.getByLabel("Document location")).toContainText("WorkItem documents");
  const taskInspection = planMaterial.getByTestId("plan-task-inspection");
  await expect(taskInspection).toContainText("Prove the browser candidate surface");
  for (const label of ["Dependencies", "Scope", "Exclusions", "Expected change surface (forecast)", "Acceptance", "Gates", "Authority", "Concerns"]) {
    await expect(taskInspection).toContainText(label);
  }
  await documentDetails.click();
  await expect(taskInspection).not.toBeVisible();
  const planEditor = await openMarkdownEditor(page, "Implementation plan document Markdown source");
  await capture({
    id: "ia26-lifecycle-document-editor-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Implementation plan",
    surface: "SURF-MAT-DOC-001",
    state: "active-editor",
    fixture: "Lifecycle editing workbench Plan editor",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-MARKDOWN-WORKBENCH-V1"],
  }, page.locator("form.order-markdown-editor"));
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await selectWorkflowStep(page, "Readiness review");
  await expect(page.getByTestId("review-verdict")).toBeVisible();
  await page.getByRole("button", { name: "View Implementation plan", exact: true }).click();
  const readOnlyMaterial = page.getByTestId("markdown-readonly").first();
  await expect(readOnlyMaterial).toBeVisible();
  await capture({
    id: "ia26-lifecycle-document-readonly-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Readiness review",
    surface: "SURF-MAT-DOC-RO-001",
    state: "read-only-governed-document",
    fixture: "Lifecycle editing workbench Readiness supporting Implementation plan",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-MARKDOWN-WORKBENCH-V1"],
  }, readOnlyMaterial);

  await backToQueue(page);
  await page.getByRole("radio", { name: "Dark" }).click();
  await page.getByRole("button", { name: "New work item" }).click();
  const create = page.getByRole("dialog", { name: "Create work item" });
  await create.getByRole("combobox", { name: "Project Required" }).click();
  await page.getByRole("option", { name: "order-e2e", exact: true }).click();
  await create.getByRole("radio", { name: "Change" }).click();
  await create.getByLabel("Title").fill("IA26 confirmation fixture");
  await create.getByRole("button", { name: "Concerns", exact: true }).click();
  await page.getByRole("option", { name: "browser" }).click();
  await page.keyboard.press("Escape");
  await create.getByRole("button", { name: "Create work item" }).click();
  await expect(page.getByTestId("work-item-heading")).toHaveText("IA26 confirmation fixture");
  await page.getByRole("radio", { name: "Light" }).click();
  await page.getByRole("button", { name: "Save documentation to Git" }).click();
  const gitConfirm = page.getByRole("dialog", { name: "Save WorkItem documentation to Git?" });
  await capture({
    id: "ia26-confirm-documentation-git-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-CONF-DOC-GIT-001",
    state: "exact-path-commit-confirmation",
    fixture: "new untracked WorkItem documentation",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    captureScope: "production confirmation only",
    authorityRefs: ["GW-DOC-MARKDOWN-WORKBENCH-V1"],
  }, gitConfirm);
  await gitConfirm.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.getByRole("radio", { name: "Dark" }).click();
  await page.getByRole("button", { name: "Archive", exact: true }).click();
  const archiveConfirm = page.getByRole("dialog", { name: "Archive work item?" });
  await capture({
    id: "ia26-confirm-archive-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-CONF-ARCHIVE-001",
    state: "archive-confirmation",
    fixture: "IA26 confirmation fixture",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    captureScope: "production confirmation only",
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, archiveConfirm);
  await capture({
    id: "ia26-confirm-archive-wide-dark",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-CONF-ARCHIVE-001",
    state: "archive-confirmation-dark",
    fixture: "IA26 confirmation fixture",
    viewport: light,
    theme: "Dark",
    route: routeValue(),
    captureScope: "production confirmation only",
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-THEME-V1"],
  }, archiveConfirm);
  await archiveConfirm.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.getByRole("radio", { name: "Light" }).click();

  // Work-kind information variants.
  await backToQueue(page);
  for (const [title, kind] of [
    ["Change work type", "CHANGE"],
    ["Defect work type", "DEFECT"],
    ["Investigation work type", "INVESTIGATION"],
    ["Audit work type", "AUDIT"],
  ] as const) {
    await openWorkItem(page, title);
    const source = page.getByTestId("source-document-material");
    await capture({
      id: "ia26-work-type-" + kind.toLowerCase() + "-source-wide-light",
      workItemKind: kind,
      workflowStep: "Work request",
      surface: "SURF-MAT-SOURCE-001",
      state: "work-type-" + kind.toLowerCase(),
      fixture: title,
      viewport: light,
      theme: "Light",
      route: routeValue(),
      authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM"],
    }, source);
    await backToQueue(page);
  }

  }

  if (runRenderedPhase("IA30")) {
  // IA30 — productive stages, Dialogue and direct Proposal Review.
  const stageCases = [
    ["Research open continuation", "Research", "SURF-STEP-R1-001"],
    ["Requirements document visual", "Requirements", "SURF-STEP-R2-001"],
    ["Solution design document visual", "Solution design", "SURF-STEP-DESIGN-001"],
    ["Implementation plan document visual", "Implementation plan", "SURF-STEP-PLAN-001"],
  ] as const;
  for (const [title, step, surface] of stageCases) {
    await openWorkItem(page, title);
    await selectWorkflowStep(page, step);
    await page.setViewportSize(light);
    await capture({
      id: "ia26-" + step.toLowerCase().replaceAll(" ", "-") + "-wide-light",
      workItemKind: "CHANGE",
      workflowStep: step,
      surface,
      state: step === "Requirements" ? "document" : "primary-wide",
      fixture: title,
      viewport: light,
      theme: "Light",
      route: routeValue(),
      authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2"],
    });
    await page.setViewportSize(narrow);
    await capture({
      id: "ia26-" + step.toLowerCase().replaceAll(" ", "-") + "-narrow-light",
      workItemKind: "CHANGE",
      workflowStep: step,
      surface,
      state: step === "Requirements" ? "document" : "primary-narrow",
      fixture: title,
      viewport: narrow,
      theme: "Light",
      route: routeValue(),
      authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2"],
    });
    await page.setViewportSize(light);
    if (step === "Research") {
      const activity = page.getByTestId("activity-detail");
      await capture({
        id: "ia26-stage-dialogue-open-wide-light",
        workItemKind: "CHANGE",
        workflowStep: "Research",
        surface: "SURF-MAT-ACTIVITY-001",
        state: "open-continuation",
        fixture: title,
        viewport: light,
        theme: "Light",
        route: routeValue(),
        authorityRefs: ["GW-DOC-WORKBENCH-UX"],
      }, activity);
      await page.getByRole("radio", { name: "Dark" }).click();
      await capture({
        id: "ia26-stage-dialogue-open-wide-dark",
        workItemKind: "CHANGE",
        workflowStep: "Research",
        surface: "SURF-MAT-ACTIVITY-001",
        state: "open-continuation-dark",
        fixture: title,
        viewport: light,
        theme: "Dark",
        route: routeValue(),
        authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-THEME-V1"],
      }, activity);
      await page.getByRole("radio", { name: "Light" }).click();
    }
    await backToQueue(page);
  }

  await openWorkItem(page, "Workflow input required");
  const requiredInputActivity = page.getByTestId("activity-detail");
  await expect(requiredInputActivity.getByLabel("Message input")).toBeEditable();
  await expect(page.getByTestId("workflow-rail").locator('li[data-state="current"][data-tone="warning"] .order-workbench-rail-status')).toHaveText("Action required");
  await expect(requiredInputActivity.getByText("Your response", { exact: true })).toBeVisible();
  await expect(requiredInputActivity.locator(".order-workbench-dialogue-message").first()).toBeVisible();
  const dialogue = requiredInputActivity.locator(".order-workbench-dialogue");
  const activityTop = await dialogue.evaluate((node) => ({
    canvas: node.getBoundingClientRect().top,
    sidebar: node.querySelector(".order-workbench-dialogue-activity")!.getBoundingClientRect().top,
  }));
  expect(Math.abs(activityTop.canvas - activityTop.sidebar)).toBeLessThanOrEqual(1);
  await capture({
    id: "ia26-stage-dialogue-required-input-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Implementation plan",
    surface: "SURF-MAT-ACTIVITY-001",
    state: "required-input",
    fixture: "Workflow input required",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, requiredInputActivity);
  await backToQueue(page);

  const processingDialogueItem = await workItemForTitle(page, "Research processing attention visual");
  await fixtureMutation(request, "/start-stage", { workItemId: processingDialogueItem.id });
  await openWorkItem(page, "Research processing attention visual");
  await expect(page.getByTestId("selected-run-header")).toContainText("Processing");
  await expect(page.getByTestId("workflow-rail").locator('li[data-state="current"][data-tone="info"] .order-workbench-rail-status')).toHaveText("Processing");
  await capture({
    id: "ia26-stage-dialogue-processing-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Research",
    surface: "SURF-MAT-ACTIVITY-001",
    state: "processing",
    fixture: "Research processing attention visual",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, page.getByTestId("stage-run-material"));
  await backToQueue(page);

  await openWorkItem(page, "Completed investigation");
  await selectWorkflowStep(page, "Research");
  await selectCurrentWorkflowMaterial(page, "Attempt 1");
  await capture({
    id: "ia26-stage-dialogue-closed-wide-light",
    workItemKind: "INVESTIGATION",
    workflowStep: "Research",
    surface: "SURF-MAT-ACTIVITY-001",
    state: "closed-terminal-run",
    fixture: "Completed investigation historical Research attempt",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, page.getByTestId("stage-run-material"));
  await backToQueue(page);

  }

  if (runRenderedPhase("IA31")) {
  // IA31 — atomic Proposal, Readiness and Approval Review.
  await openWorkItem(page, "Proposal review");
  const proposal = page.getByTestId("proposal-review-workspace");
  await expect(proposal.getByTestId("document-change-view")).toBeVisible();
  await expect(proposal.getByLabel("Proposed document")).toBeVisible();
  await expect(proposal.getByTestId("document-change-region").first()).toBeVisible();
  await expect(proposal.getByRole("button", { name: "View exact diff", exact: true })).toBeVisible();
  await expect(proposal.locator("pre")).toBeHidden();
  await capture({
    id: "ia26-proposal-review-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Implementation plan",
    surface: "SURF-MAT-PROPOSAL-001",
    state: "pending-decision-direct-review",
    fixture: "Proposal review",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, proposal);
  await page.getByRole("radio", { name: "Dark" }).click();
  await capture({
    id: "ia26-proposal-review-wide-dark",
    workItemKind: "CHANGE",
    workflowStep: "Implementation plan",
    surface: "SURF-MAT-PROPOSAL-001",
    state: "pending-decision-direct-review-dark",
    fixture: "Proposal review",
    viewport: light,
    theme: "Dark",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-THEME-V1"],
  }, proposal);
  await page.getByRole("radio", { name: "Light" }).click();
  await page.getByRole("button", { name: "Back to workflow attempt" }).click();
  const historicalAttemptAction = page.getByRole("button", {
    name: "View Attempt 1",
    exact: true,
  });
  if (
    diagnosticCurrentState &&
    !(await historicalAttemptAction.isVisible().catch(() => false))
  ) {
    await capture({
      id: "diagnostic-proposal-historical-attempt-affordance-missing",
      workItemKind: "CHANGE",
      workflowStep: "Implementation plan",
      surface: "SURF-MAT-PROPOSAL-001",
      state: "historical-attempt-affordance-missing",
      fixture: "Proposal review after returning to workflow attempt",
      viewport: light,
      theme: "Light",
      route: routeValue(),
      authorityRefs: ["GW-DOC-WORKBENCH-UX"],
      captureScope: "full application viewport",
    });
  } else {
    await selectCurrentWorkflowMaterial(page, "Attempt 1");
    await page.getByRole("button", { name: "Review proposed document change" }).click();
    await capture({
      id: "ia26-proposal-review-adopted-wide-light",
      workItemKind: "CHANGE",
      workflowStep: "Implementation plan",
      surface: "SURF-MAT-PROPOSAL-001",
      state: "adopted",
      fixture: "Proposal review historical adopted proposal",
      viewport: light,
      theme: "Light",
      route: routeValue(),
      authorityRefs: ["GW-DOC-WORKBENCH-UX"],
    }, page.getByTestId("proposal-review-workspace"));
  }
  await backToQueue(page);

  await openWorkItem(page, "Proposal rejection review");
  const rejectionReview = page.getByTestId("proposal-review-workspace");
  await expect(rejectionReview).toBeVisible();
  await rejectionReview.getByRole("button", { name: "Reject" }).click();
  await expect(page.getByTestId("stage-run-material")).toBeVisible({ timeout: 5_000 });
  await page.getByRole("button", { name: "Review proposed document change" }).click();
  await capture({
    id: "ia26-proposal-review-rejected-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Implementation plan",
    surface: "SURF-MAT-PROPOSAL-001",
    state: "rejected",
    fixture: "Proposal rejection review",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, page.getByTestId("proposal-review-workspace"));
  await backToQueue(page);

  await openWorkItem(page, "Proposal adoption in progress");
  await capture({
    id: "ia26-proposal-review-adopting-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Implementation plan",
    surface: "SURF-MAT-PROPOSAL-001",
    state: "adoption-in-progress",
    fixture: "Proposal adoption in progress",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, page.getByTestId("proposal-review-workspace"));
  await backToQueue(page);


  // IA31 — direct Readiness and Approval Review plus task detail.
  await openWorkItem(page, "Awaiting sign-off");
  await selectWorkflowStep(page, "Readiness review");
  const readinessReview = page.getByTestId("review-workspace");
  await expect(readinessReview.getByTestId("review-verdict")).toContainText("Ready for sign-off");
  await expect(readinessReview.getByText("Loading readiness findings…", { exact: true })).toHaveCount(0);
  await expect(readinessReview).toContainText("The review assessed contradictory authority and missing verification evidence.");
  await expect(readinessReview).toContainText("The exact conformed artifact identifies the reviewed package.");
  await expect(readinessReview.getByRole("button", { name: "Return to Approval", exact: true })).toBeVisible();
  await capture({
    id: "ia26-readiness-review-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Readiness review",
    surface: "SURF-STEP-R3-001",
    state: "ready-for-signoff-direct-review",
    fixture: "Awaiting sign-off R3",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, readinessReview);
  await page.setViewportSize(narrow);
  await capture({
    id: "ia26-readiness-review-narrow-light",
    workItemKind: "CHANGE",
    workflowStep: "Readiness review",
    surface: "SURF-STEP-R3-001",
    state: "ready-for-signoff-direct-review-narrow",
    fixture: "Awaiting sign-off R3",
    viewport: narrow,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, readinessReview);
  await page.setViewportSize(light);

  await selectWorkflowStep(page, "Approval");
  const approval = page.getByTestId("review-workspace");
  await expect(approval.getByText("Resolving exact package…", { exact: true }))
    .toHaveCount(0, { timeout: 15_000 });
  await expect(page.getByRole("button", { name: "Sign off exact package", exact: true }))
    .toBeVisible();
  await capture({
    id: "ia26-approval-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Approval",
    surface: "SURF-STEP-APPROVAL-001",
    state: "exact-current-package-direct-review",
    fixture: "Awaiting sign-off",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, approval);
  await page.setViewportSize(narrow);
  await expect(
    approval.getByRole("button", { name: "Sign off exact package", exact: true }),
  ).toBeVisible({ timeout: 15_000 });
  await capture({
    id: "ia26-approval-narrow-light",
    workItemKind: "CHANGE",
    workflowStep: "Approval",
    surface: "SURF-STEP-APPROVAL-001",
    state: "exact-current-package-direct-review-narrow",
    fixture: "Awaiting sign-off",
    viewport: narrow,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, approval);
  await page.setViewportSize(light);
  for (const [viewport, suffix] of [[light, "wide"], [narrow, "narrow"]] as const) {
    await page.setViewportSize(viewport);
    await page.getByRole("radio", { name: "Dark" }).click();
    await capture({
      id: "ia26-approval-" + suffix + "-dark",
      workItemKind: "CHANGE", workflowStep: "Approval",
      surface: "SURF-STEP-APPROVAL-001", state: "current",
      fixture: "Awaiting sign-off", viewport, theme: "Dark", route: routeValue(),
      authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-THEME-V1"],
    }, approval);
    if (!diagnosticCurrentState && suffix === "narrow") {
      await capture({
        id: "hux-shell-review-narrow-dark", workItemKind: "CHANGE",
        workflowStep: "Approval", surface: "SURF-WI-001",
        state: "default", fixture: "Awaiting sign-off shared identity",
        viewport, theme: "Dark", route: routeValue(),
        authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-THEME-V1"],
      });
    }
  }
  await page.setViewportSize(light);
  await page.getByRole("radio", { name: "Light" }).click();
  if (!diagnosticCurrentState) {
    await capture({
      id: "hux-shell-review-wide-light", workItemKind: "CHANGE",
      workflowStep: "Approval", surface: "SURF-WI-001", state: "default",
      fixture: "Awaiting sign-off shared identity", viewport: light, theme: "Light",
      route: routeValue(), authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-THEME-V1"],
    });
  }
  await expect(approval.locator('[data-review-section="tasks"]').getByRole("button", { name: "View task 1", exact: true })).toBeVisible();
  await expect(approval.locator('[data-review-section="documents"]').getByTestId("workbench-resource-list")).toBeVisible();
  await expect(approval.locator('[data-review-section="documents"]').getByRole("button", { name: "View Implementation plan", exact: true })).toContainText("View Implementation plan");
  await approval.getByRole("button", {
    name: "View task 1",
    exact: true,
  }).click();
  await expect(approval).toContainText("Prove the browser candidate surface");
  const approvalTask = page.getByTestId("review-workspace");
  await capture({
    id: "ia26-approval-task-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Approval",
    surface: "SURF-MAT-APPROVAL-TASK-001",
    state: "signed-task-detail",
    fixture: "Awaiting sign-off task",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, approvalTask);
  await page.getByRole("radio", { name: "Dark" }).click();
  await capture({
    id: "ia26-approval-task-wide-dark",
    workItemKind: "CHANGE",
    workflowStep: "Approval",
    surface: "SURF-MAT-APPROVAL-TASK-001",
    state: "signed-task-detail-dark",
    fixture: "Awaiting sign-off task",
    viewport: light,
    theme: "Dark",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-THEME-V1"],
  }, approvalTask);
  await page.setViewportSize(narrow);
  for (const theme of ["Dark", "Light"] as const) {
    await page.getByRole("radio", { name: theme }).click();
    await expect(approvalTask.getByLabel("Task boundaries")).toBeVisible();
    await capture({
      id: "ia26-approval-task-narrow-" + theme.toLowerCase(),
      workItemKind: "CHANGE", workflowStep: "Approval",
      surface: "SURF-MAT-APPROVAL-TASK-001", state: "current",
      fixture: "Awaiting sign-off task", viewport: narrow, theme,
      route: routeValue(), authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-THEME-V1"],
    }, approvalTask);
  }
  await page.setViewportSize(light);
  await page.getByRole("radio", { name: "Light" }).click();
  await backToQueue(page);

  await openWorkItem(page, "Readiness input required");
  await expect(page.getByTestId("review-workspace").getByLabel("Message input")).toBeEditable();
  await expect(page.getByTestId("review-workspace").getByText("Which readiness finding should be resolved before approval?", { exact: true })).toBeVisible();
  await capture({
    id: "ia26-readiness-required-input-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Readiness review",
    surface: "SURF-STEP-R3-001",
    state: "required-input-dialogue-replaces-review",
    fixture: "Readiness input required",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, page.getByTestId("review-workspace"));
  await backToQueue(page);

  }

  if (runRenderedPhase("IA32")) {
  // IA32 — Implementation master/detail and task detail.
  await openWorkItem(page, "Implementation action ready");
  const execution = page.getByTestId("execution-workspace");
  await expect(execution.getByLabel("Task overview")).toContainText("Not started");
  await expect(execution.getByRole("navigation", { name: "Approved tasks" })
    .getByRole("button", { pressed: true })).toContainText("Current · Ready to start");
  await capture({
    id: "ia26-implementation-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Implementation",
    surface: "SURF-STEP-EXEC-001",
    state: "current-task-ready",
    fixture: "Implementation action ready",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, execution);
  await page.getByRole("radio", { name: "Dark" }).click();
  await capture({
    id: "ia26-implementation-wide-dark",
    workItemKind: "CHANGE",
    workflowStep: "Implementation",
    surface: "SURF-STEP-EXEC-001",
    state: "current-task-ready-dark",
    fixture: "Implementation action ready",
    viewport: light,
    theme: "Dark",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-THEME-V1"],
  }, execution);
  await page.getByRole("radio", { name: "Light" }).click();
  await capture({
    id: "ia26-implementation-task-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Implementation",
    surface: "SURF-MAT-EXEC-TASK-001",
    state: "approved-task-contract",
    fixture: "Implementation action ready",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, page.getByTestId("execution-task-detail"));
  await page.setViewportSize(narrow);
  await capture({
    id: "ia26-implementation-narrow-light",
    workItemKind: "CHANGE",
    workflowStep: "Implementation",
    surface: "SURF-STEP-EXEC-001",
    state: "current-task-ready-narrow",
    fixture: "Implementation action ready",
    viewport: narrow,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, execution);
  await page.setViewportSize(light);
  const processingImplementation = await workItemForTitle(page, "Implementation action ready");
  await fixtureMutation(request, "/tick", { workItemId: processingImplementation.id });
  await page.reload();
  await expect(page.getByTestId("execution-workspace")).toBeVisible();
  await expect(page.getByTestId("selected-run-header")).toContainText("Running", { timeout: 5_000 });
  await capture({
    id: "ia26-implementation-processing-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Implementation",
    surface: "SURF-STEP-EXEC-001",
    state: "processing",
    fixture: "Implementation action ready active builder",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, execution);
  await backToQueue(page);

  await openWorkItem(page, "Failed implementation feedback");
  await expect(page.getByTestId("workflow-rail").locator('li[data-state="current"][data-tone="danger"] .order-workbench-rail-status')).toHaveText("Blocked");
  await expect(execution.getByText("Semantic review failed. Resolve this blocker before resuming the approved task.", { exact: true })).toBeVisible();
  await expect(execution.getByLabel("Task overview")).toContainText("Current boundary: failed at V4");
  await selectWorkflowMaterial(page, "Implementation agent · Attempt 1");
  await expect(execution.getByText("Semantic review failed. Resolve this blocker before resuming the approved task.", { exact: true })).toBeVisible();
  await expect(execution.getByTestId("validation-matrix")).toContainText("No validation results in this attempt");
  await expect(execution.getByRole("button", { name: "Resume resolved blocker" })).toBeVisible();
  await selectWorkflowMaterial(page, "Independent review · Attempt 2");
  await capture({
    id: "ia26-implementation-blocked-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Implementation",
    surface: "SURF-STEP-EXEC-001",
    state: "blocked-validation-failure",
    fixture: "Failed implementation feedback",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, page.getByTestId("execution-workspace"));
  await backToQueue(page);

  await openWorkItem(page, "Verified candidate");
  await selectWorkflowStep(page, "Implementation");
  await expect(page.getByTestId("execution-workspace")).toBeVisible();
  await selectWorkflowMaterial(page, "Independent review · Attempt 2");
  await expect(page.getByTestId("selected-run-header")).toContainText("Independent review · Attempt 2");
  await expect(page.getByTestId("validation-matrix").getByTestId("validation-stage-V7")).toContainText("Passed");
  await expect(page.getByTestId("workflow-rail").getByRole("button", { name: "Complete", exact: true })).toHaveAttribute("aria-current", "step");
  await expect(page.getByTestId("workflow-rail").getByRole("button", { name: "Implementation", exact: true })).toHaveAttribute("aria-pressed", "true");
  await capture({
    id: "ia26-implementation-validation-recorded-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Implementation",
    surface: "SURF-STEP-EXEC-001",
    state: "validation-recorded",
    fixture: "Verified candidate reached Implementation · Independent review · Attempt 2",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, page.getByTestId("execution-workspace"));
  await selectWorkflowMaterial(page, "Implementation agent · Attempt 1");
  await expect(page.getByTestId("selected-run-header")).toContainText("Implementation agent · Attempt 1");
  await expect(page.getByLabel("Task overview")).toContainText("Recorded boundary: complete");
  await expect(page.getByTestId("validation-matrix")).toContainText("No validation results in this attempt");
  await expect(page.getByTestId("validation-matrix")).not.toContainText("boundary:");
  await capture({
    id: "ia26-implementation-builder-attempt-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Implementation",
    surface: "SURF-STEP-EXEC-001",
    state: "validation-recorded",
    fixture: "Verified candidate reached Implementation · Implementation agent · Attempt 1",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, page.getByTestId("execution-workspace"));
  await backToQueue(page);

  }

  if (runRenderedPhase("IA33")) {
  // IA33 — terminal result and Evidence, both attention-free.
  await openWorkItem(page, "Verified candidate");
  const complete = page.getByTestId("result-workspace");
  await capture({
    id: "ia26-complete-candidate-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Complete",
    surface: "SURF-STEP-COMPLETE-001",
    state: "verified-candidate",
    fixture: "Verified candidate",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, complete);
  await page.getByRole("radio", { name: "Dark" }).click();
  await capture({
    id: "ia26-complete-candidate-wide-dark",
    workItemKind: "CHANGE",
    workflowStep: "Complete",
    surface: "SURF-STEP-COMPLETE-001",
    state: "verified-candidate-dark",
    fixture: "Verified candidate",
    viewport: light,
    theme: "Dark",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-THEME-V1"],
  }, complete);
  await page.getByRole("radio", { name: "Light" }).click();
  await page.setViewportSize(narrow);
  await capture({
    id: "ia26-complete-candidate-narrow-light",
    workItemKind: "CHANGE",
    workflowStep: "Complete",
    surface: "SURF-STEP-COMPLETE-001",
    state: "verified-candidate-narrow",
    fixture: "Verified candidate",
    viewport: narrow,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, complete);
  await page.setViewportSize(light);
  await backToQueue(page);

  await openWorkItem(page, "Completed investigation");
  await capture({
    id: "ia26-complete-investigation-linked-wide-light",
    workItemKind: "INVESTIGATION",
    workflowStep: "Complete",
    surface: "SURF-STEP-COMPLETE-001",
    state: "investigation-result-linked-remediation",
    fixture: "Completed investigation",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, page.getByTestId("result-workspace"));
  await backToQueue(page);

  await openWorkItem(page, "Invalid lifecycle Markdown");
  await selectWorkflowStep(page, "Research");
  await page.getByRole("button", { name: "Inspect exact bytes" }).click();
  const evidence = page.getByTestId("evidence-workspace");
  await expect(evidence).toBeVisible();
  await capture({
    id: "ia26-evidence-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Research",
    surface: "SURF-MAT-EVIDENCE-001",
    state: "exact-bytes-attention-free",
    fixture: "Invalid lifecycle Markdown exact bytes",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, evidence);
  await page.getByRole("radio", { name: "Dark" }).click();
  await capture({
    id: "ia26-evidence-wide-dark",
    workItemKind: "CHANGE",
    workflowStep: "Research",
    surface: "SURF-MAT-EVIDENCE-001",
    state: "exact-bytes-attention-free-dark",
    fixture: "Invalid lifecycle Markdown exact bytes",
    viewport: light,
    theme: "Dark",
    route: routeValue(),
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-THEME-V1"],
  }, evidence);
  await page.getByRole("radio", { name: "Light" }).click();


  }

  if (!diagnosticCurrentState) {
  if (signedRenderedPhase !== null) {
    validateSignedPhaseEvidence(entries);
    expect(expectedConflictConsoleErrors).toBe(0);
    expect(runtimeErrors).toEqual([]);
    return;
  }
  writeRenderedAcceptanceEvidence(entries);

  const manifest = JSON.parse(
    readFileSync(join(renderedAcceptanceDir!, "manifest.json"), "utf8"),
  ) as { candidateSha: string; entries: RenderedAcceptanceEntry[] };
  expect(manifest.candidateSha).toBe(renderedAcceptanceCandidateSha);
  const allEntries = manifest.entries;
  const requiredSurfaces = [
    "SURF-APP-001",
    "SURF-CONF-ARCHIVE-001",
    "SURF-CONF-DIRTY-DEST-001",
    "SURF-CONF-DIRTY-MATERIAL-001",
    "SURF-CONF-DOC-GIT-001",
    "SURF-CONF-OC-REMOVE-001",
    "SURF-CONF-REPO-DISCONNECT-001",
    "SURF-CREATE-001",
    "SURF-MAT-ACTIVITY-001",
    "SURF-MAT-APPROVAL-TASK-001",
    "SURF-MAT-DOC-001",
    "SURF-MAT-DOC-RO-001",
    "SURF-MAT-EVIDENCE-001",
    "SURF-MAT-EXEC-TASK-001",
    "SURF-MAT-PROPOSAL-001",
    "SURF-MAT-SOURCE-001",
    "SURF-QUEUE-001",
    "SURF-SET-001",
    "SURF-SET-MODEL-001",
    "SURF-SET-OC-001",
    "SURF-SET-OC-ADD-001",
    "SURF-SET-OC-LOGIN-001",
    "SURF-SET-OC-RENAME-001",
    "SURF-SET-REPO-001",
    "SURF-SET-REPO-ADD-001",
    "SURF-SET-REPO-MOVE-001",
    "SURF-STEP-APPROVAL-001",
    "SURF-STEP-COMPLETE-001",
    "SURF-STEP-DESIGN-001",
    "SURF-STEP-EXEC-001",
    "SURF-STEP-PLAN-001",
    "SURF-STEP-R1-001",
    "SURF-STEP-R2-001",
    "SURF-STEP-R3-001",
    "SURF-STEP-WR-001",
    "SURF-WI-001",
    "SURF-WI-CONTEXT-001",
  ].sort();
  expect([...new Set(allEntries.map((entry) => entry.surface))].sort())
    .toEqual(requiredSurfaces);

  for (const step of [
    "Work request",
    "Research",
    "Requirements",
    "Solution design",
    "Implementation plan",
    "Readiness review",
    "Approval",
    "Implementation",
    "Complete",
  ]) {
    expect(allEntries.some((entry) =>
      entry.workflowStep === step &&
      entry.viewport.width === 1440 &&
      entry.theme === "Light"
    )).toBe(true);
    expect(allEntries.some((entry) =>
      entry.workflowStep === step &&
      entry.viewport.width === 700 &&
      entry.theme === "Light"
    )).toBe(true);
  }

  const darkClassRepresentatives = [
    "SURF-QUEUE-001",
    "SURF-CREATE-001",
    "SURF-WI-001",
    "SURF-WI-CONTEXT-001",
    "SURF-MAT-SOURCE-001",
    "SURF-MAT-ACTIVITY-001",
    "SURF-MAT-PROPOSAL-001",
    "SURF-SET-MODEL-001",
    "SURF-MAT-APPROVAL-TASK-001",
    "SURF-STEP-EXEC-001",
    "SURF-STEP-COMPLETE-001",
    "SURF-MAT-EVIDENCE-001",
    "SURF-CONF-ARCHIVE-001",
  ];
  for (const surface of darkClassRepresentatives) {
    expect(allEntries.some((entry) =>
      entry.surface === surface && entry.theme === "Dark"
    )).toBe(true);
  }
  expect(allEntries.some((entry) => entry.theme === "System/light")).toBe(true);
  expect(allEntries.some((entry) => entry.theme === "System/dark")).toBe(true);
  for (const surface of requiredSurfaces) {
    const medium = allEntries.find(entry => entry.surface === surface &&
      entry.id === mediumComparisonId(mediumComparisonSources[surface as keyof typeof mediumComparisonSources]));
    expect(medium?.viewport.width, surface + " exact medium viewport").toBe(1000);
    expect(medium?.reference.comparisonEligible, surface + " same-scope medium comparison").toBe(true);
    expect(medium?.referenceScreenshot, surface + " medium reference PNG").toBeDefined();
  }
  expect(allEntries.some((entry) =>
    entry.surface === "SURF-MAT-SOURCE-001" &&
    entry.viewport.width === 700 &&
    entry.state === "active-editor-narrow-overflow"
  )).toBe(true);

  expect(referenceManifest.semanticAuthority).toBe(false);
  expect(referenceManifest.source).toBe(referenceAtlasPath);
  // The authority-derived comparison target has 38 surfaces. This existing
  // pre-cutover runtime corpus still proves the exact 37 current surfaces;
  // IA39 must extend actual runtime/phase/final coverage, not fabricate a capture.
  expect(referenceManifest.surfaces).toHaveLength(38);
  expect([...new Set(allEntries.map((entry) => entry.reference.surface))].sort())
    .toEqual(requiredSurfaces);
  for (const entry of allEntries) {
    expect(entry.reference.manifestPath).toBe(referenceManifestPath);
    expect(entry.reference.sourcePath).toBe(referenceAtlasPath);
    expect(referenceSurfaceById.has(entry.reference.surface)).toBe(true);
    if (entry.reference.comparisonEligible) {
      expect(entry.reference.query).not.toBeNull();
      expect(entry.captureScope).toBe(entry.reference.captureScope);
    }
  }

  for (const kind of ["CHANGE", "DEFECT", "INVESTIGATION", "AUDIT"] as const) {
    expect(allEntries.some((entry) => entry.workItemKind === kind)).toBe(true);
  }

  for (const proposalState of [
    "pending-decision-direct-review",
    "adoption-in-progress",
    "adopted",
    "rejected",
  ]) {
    expect(allEntries.some((entry) =>
      entry.surface === "SURF-MAT-PROPOSAL-001" && entry.state === proposalState
    )).toBe(true);
  }
  for (const dialogueState of [
    "open-continuation",
    "required-input",
    "processing",
    "closed-terminal-run",
  ]) {
    expect(allEntries.some((entry) =>
      entry.surface === "SURF-MAT-ACTIVITY-001" && entry.state === dialogueState
    )).toBe(true);
  }
  for (const executionState of [
    "current-task-ready",
    "processing",
    "blocked-validation-failure",
    "validation-recorded",
  ]) {
    expect(allEntries.some((entry) =>
      entry.surface === "SURF-STEP-EXEC-001" && entry.state === executionState
    )).toBe(true);
  }
  for (const loginState of [
    "pending-authorization",
    "sign-in-complete",
    "sign-in-failed",
    "sign-in-expired",
    "sign-in-cancelled",
  ]) {
    expect(allEntries.some((entry) =>
      entry.surface === "SURF-SET-OC-LOGIN-001" && entry.state === loginState
    )).toBe(true);
  }
  for (const documentState of [
    "active-editor",
    "dirty-unsaved-buffer",
    "canonical-document-changed",
    "read-only-governed-document",
  ]) {
    expect(allEntries.some((entry) =>
      (entry.surface === "SURF-MAT-SOURCE-001" || entry.surface === "SURF-MAT-DOC-RO-001") &&
      entry.state === documentState
    )).toBe(true);
  }

  expect(new Set(allEntries.map((entry) => entry.id)).size).toBe(allEntries.length);
  expect(expectedConflictConsoleErrors).toBe(0);
  expect(runtimeErrors).toEqual([]);
  }
});

test("queue filtering composes archive dataset, project and search exactly once", async ({
  page,
  request,
}) => {
  const activeId = "work_aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const archivedId = "work_bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

  await page.route("**/api/work-items**", async (route) => {
    const url = new URL(route.request().url());
    if (route.request().method() !== "GET" || url.pathname !== "/api/work-items") {
      await route.fallback();
      return;
    }
    const upstream = await route.fetch();
    const rows = WorkItemSchema.array().parse(await upstream.json());
    const template = rows[0];
    if (template === undefined) throw new Error("queue matrix requires one WorkItem fixture");
    const active = WorkItemSchema.parse({
      ...template,
      id: activeId,
      projectId: "other-e2e",
      repositoryRoot: repositoryRoot + "-other",
      title: "Matrix active other",
      archived: false,
    });
    const archived = WorkItemSchema.parse({
      ...template,
      id: archivedId,
      projectId: "other-e2e",
      repositoryRoot: repositoryRoot + "-other",
      title: "Matrix archived other",
      archived: true,
    });
    const includeArchived = url.searchParams.get("includeArchived") === "true";
    await route.fulfill({
      status: upstream.status(),
      contentType: "application/json",
      body: JSON.stringify([
        ...rows,
        active,
        ...(includeArchived ? [archived] : []),
      ]),
    });
  });

  await page.route("**/api/settings/repositories", async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    const upstream = await route.fetch();
    const repositories = await upstream.json() as Array<Record<string, unknown>>;
    const first = repositories[0];
    if (first === undefined) throw new Error("queue matrix requires one repository fixture");
    await route.fulfill({
      status: upstream.status(),
      contentType: "application/json",
      body: JSON.stringify([
        ...repositories,
        {
          ...first,
          repositoryRoot: repositoryRoot + "-other",
          projectId: "other-e2e",
        },
      ]),
    });
  });

  await authenticate(page, request);
  await expect(rowFor(page, "Matrix active other")).toHaveCount(0);
  await expect(rowFor(page, "Matrix archived other")).toHaveCount(0);
  await expect(rowFor(page, "Change work type")).toBeVisible();

  await page.getByRole("link", { name: "Settings", exact: true }).click();
  const repositories = page.getByTestId("settings-repositories");
  const projectContext = repositories.getByRole("combobox", {
    name: "Queue and creation context",
  });
  await projectContext.click();
  await page.getByRole("option", { name: "other-e2e", exact: true }).click();
  await page.getByRole("link", { name: "Work queue", exact: true }).click();

  await expect(rowFor(page, "Matrix active other")).toBeVisible();
  await expect(rowFor(page, "Change work type")).toHaveCount(0);

  const search = page.getByLabel("Search work items");
  await search.fill("Matrix");
  await expect(rowFor(page, "Matrix active other")).toBeVisible();
  await expect(rowFor(page, "Matrix archived other")).toHaveCount(0);

  await page.getByRole("button", { name: "Show archived" }).click();
  await expect(rowFor(page, "Matrix active other")).toBeVisible();
  await expect(rowFor(page, "Matrix archived other")).toBeVisible();

  await search.fill("archived");
  await expect(rowFor(page, "Matrix active other")).toHaveCount(0);
  await expect(rowFor(page, "Matrix archived other")).toBeVisible();

  await page.getByRole("button", { name: "Hide archived" }).click();
  await expect(rowFor(page, "Matrix archived other")).toHaveCount(0);
});

test("repository-native WorkItem management keeps project, Git, title, and archive state explicit", async ({
  page,
  request,
}) => {
  await authenticate(page, request);

  await page.getByRole("button", { name: "New work item" }).click();
  const createDialog = page.getByRole("dialog", { name: "Create work item" });
  await expect(createDialog).toBeVisible();
  await createDialog.getByRole("combobox", { name: "Project Required" }).click();
  await page.getByRole("option", { name: "order-e2e", exact: true }).click();
  await expect(createDialog.getByTestId("create-work-item-location"))
    .toContainText("docs/order/work-items");
  await createDialog.getByRole("radio", { name: "Change" }).click();
  await createDialog.getByLabel("Title").fill("Repository-native management");
  await createDialog.getByRole("button", { name: "Concerns", exact: true }).click();
  await page.getByRole("option", { name: "browser" }).click();
  await page.keyboard.press("Escape");
  await createDialog.getByRole("button", { name: "Create work item" }).click();

  await expect(page.getByTestId("work-item-heading"))
    .toHaveText("Repository-native management");

  const documentState = page.getByTestId("document-git-state");
  await expect(documentState).toContainText("Saved to project, not Git");
  await page.getByRole("button", { name: "Save documentation to Git" }).click();
  const gitDialog = page.getByRole("dialog", {
    name: "Save WorkItem documentation to Git?",
  });
  await expect(gitDialog).toContainText("Only the exact governed paths reviewed in WorkItemDocumentationGitStatus will be committed.");
  await expect(gitDialog).toContainText("work-request.md");
  await expect(gitDialog).toContainText("[UNTRACKED]");
  await gitDialog.getByRole("button", { name: "Save documentation to Git" }).click();
  await expect(documentState).toContainText("Saved to Git");

  await page.getByRole("button", { name: "Edit title" }).click();
  await expect(page.getByRole("button", { name: "Start Research", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Save title", exact: true })).toBeVisible();
  await page.getByLabel("Work item title").fill("Repository-native management renamed");
  await page.getByRole("button", { name: "Save title" }).click();
  await expect(page.getByRole("button", { name: "Start Research", exact: true })).toBeVisible();
  await expect(page.getByTestId("work-item-heading"))
    .toHaveText("Repository-native management renamed");
  await expect(documentState).toContainText("Saved to project, not Git");

  await page.getByRole("button", { name: "Save documentation to Git" }).click();
  const renamedGitDialog = page.getByRole("dialog", {
    name: "Save WorkItem documentation to Git?",
  });
  await expect(renamedGitDialog).toContainText("work-request.md");
  await expect(renamedGitDialog).toContainText("[MODIFIED]");
  await renamedGitDialog.getByRole("button", { name: "Save documentation to Git" }).click();
  await expect(documentState).toContainText("Saved to Git");

  await page.getByRole("button", { name: "Archive", exact: true }).click();
  await page.getByRole("dialog", { name: "Archive work item?" })
    .getByRole("button", { name: "Archive work item" }).click();
  await expect(page.getByTestId("work-item-queue")).toBeVisible();
  await expect(rowFor(page, "Repository-native management renamed")).toHaveCount(0);
  await page.getByLabel("Search work items").fill("Repository-native management renamed");

  await page.getByRole("button", { name: "Show archived" }).click();
  const archivedRow = rowFor(page, "Repository-native management renamed");
  await expect(archivedRow).toContainText("Archived");
  await archivedRow.getByRole("button", {
    name: "Restore Repository-native management renamed",
  }).click();
  await expect(archivedRow).not.toContainText("Archived");
  await page.getByRole("button", { name: "Hide archived" }).click();
  await expect(rowFor(page, "Repository-native management renamed"))
    .toContainText("browser");
});
test("documentation Git blockers remain canonical and visible in the browser", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  const item = await workItemForTitle(page, "Source editing workbench");
  const statusResponse = await page.context().request.get(
    "/api/work-items/" + item.id + "/documentation-git-status",
  );
  expect(statusResponse.status()).toBe(200);
  const baseStatus = await statusResponse.json() as {
    workItemId: string;
    headCommit: string;
    branch: string | null;
    authorName: string | null;
    authorEmail: string | null;
    blockers: string[];
    paths: Array<Record<string, unknown>>;
  };
  let blocker = "MISSING_GIT_IDENTITY";
  const statusPath = "**/api/work-items/" + item.id + "/documentation-git-status";
  await page.route(statusPath, async (route) => {
    const paths = baseStatus.paths.map((path, index) =>
      index === 0 ? { ...path, state: "MODIFIED" } : path);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ...baseStatus,
        branch: blocker === "DETACHED_HEAD" ? null : baseStatus.branch,
        authorName: blocker === "MISSING_GIT_IDENTITY" ? null : baseStatus.authorName,
        authorEmail: blocker === "MISSING_GIT_IDENTITY" ? null : baseStatus.authorEmail,
        blockers: [blocker],
        paths,
      }),
    });
  });

  await openWorkItem(page, "Source editing workbench");
  await selectWorkflowStep(page, "Work request");

  for (const [nextBlocker, message] of [
    ["MISSING_GIT_IDENTITY", "Set repository-local Git user.name and user.email before saving documentation to Git."],
    ["DETACHED_HEAD", "Check out a local branch before saving documentation to Git."],
    ["GIT_OPERATION_ACTIVE", "Finish the in-progress Git operation before saving documentation to Git."],
  ] as const) {
    blocker = nextBlocker;
    await page.reload();
    await expect(page.getByTestId("work-item-workspace")).toBeVisible();
    await selectWorkflowStep(page, "Work request");
    await expect(page.getByText("Documentation cannot be saved to Git", { exact: true }))
      .toBeVisible();
    await expect(page.getByText(message, { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Save documentation to Git" }))
      .toBeDisabled();
  }
});

test("long Source and lifecycle Markdown keep the final line editable, savable, and persistent at wide and narrow widths", async ({
  page,
  request,
}) => {
  await authenticate(page, request);

  const exercise = async (
    width: number,
    title: string,
    tabName: "Work request" | "Implementation plan",
    editorName: string,
    marker: string,
  ): Promise<void> => {
    await page.setViewportSize({ width, height: 760 });
    await openWorkItem(page, title);
    await selectWorkflowStep(page, tabName);

    const editor = await openMarkdownEditor(page, editorName);
    const currentMarkdown = await markdownSourceValue(editor);
    const longMarkdown = currentMarkdown + "\n" + Array.from(
      { length: 260 },
      (_, index) => "line " + String(index + 1).padStart(3, "0"),
    ).join("\n") + "\n" + marker;
    await replaceMarkdownSource(page, editor, longMarkdown);

    await editor.evaluate((node) => {
      const scroller = node.closest(".cm-scroller");
      if (!(scroller instanceof HTMLElement)) throw new Error("CodeMirror scroller missing");
      scroller.scrollTop = scroller.scrollHeight;
    });
    const finalLine = editor.locator(".cm-line").last();
    await expect(finalLine).toHaveText(marker);
    await expect(finalLine).toBeVisible();
    await finalLine.click();
    await page.keyboard.press("End");
    await page.keyboard.insertText(" persisted");
    await expect(finalLine).toHaveText(marker + " persisted");
    await expect(page.getByText("Unsaved edits", { exact: true })).toBeVisible();
    const save = page.getByRole("button", { name: "Save", exact: true });
    await expect(save).toBeVisible();
    await expect(page.getByRole("button", { name: "Cancel", exact: true })).toBeVisible();
    const saveResponse = page.waitForResponse((response) => {
      if (response.request().method() !== "PUT") return false;
      const path = new URL(response.url()).pathname;
      return path.endsWith("/source/body") ||
        /^\/api\/artifacts\/[^/]+\/content$/.test(path);
    });
    await save.click();
    const response = await saveResponse;
    expect(response.ok()).toBe(true);
    const writeResult = ExpectedHashWriteResultSchema.parse(await response.json());
    expect(writeResult.tag).toBe("UPDATED");
    await expect(page.getByText("Unsaved edits", { exact: true })).toHaveCount(0);
    await backToQueue(page);
    await openWorkItem(page, title);
    await selectWorkflowStep(page, tabName);
    const reloaded = await openMarkdownEditor(page, editorName);
    await reloaded.locator(".cm-line").first().click();
    await reloaded.press("Control+End");
    await expect(reloaded.locator(".cm-line").last()).toHaveText(marker + " persisted");
    await backToQueue(page);
  };

  await exercise(
    1440,
    "Long source editing workbench wide",
    "Work request",
    "WorkItem source Markdown source",
    "WIDE_SOURCE_FINAL",
  );
  await exercise(
    1440,
    "Long lifecycle editing workbench wide",
    "Implementation plan",
    "Implementation plan document Markdown source",
    "WIDE_PLAN_FINAL",
  );
  await exercise(
    700,
    "Long source editing workbench narrow",
    "Work request",
    "WorkItem source Markdown source",
    "NARROW_SOURCE_FINAL",
  );
  await exercise(
    700,
    "Long lifecycle editing workbench narrow",
    "Implementation plan",
    "Implementation plan document Markdown source",
    "NARROW_PLAN_FINAL",
  );
});

test("workflow-step geometry gives the selected task the canvas and recomposes narrow queue rows", async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await authenticate(page, request);

  await openWorkItem(page, "Lifecycle editing workbench");
  await selectWorkflowStep(page, "Implementation plan");
  const stepWorkspace = page.getByTestId("workflow-step-workspace");
  await expect(stepWorkspace).toBeVisible();
  const stepWorkspaceBox = await stepWorkspace.boundingBox();
  expect(stepWorkspaceBox).not.toBeNull();
  expect(stepWorkspaceBox!.height).toBeGreaterThan(500);

  await expect(page.getByRole("button", { name: "Context" })).toBeVisible();
  await expect(page.getByTestId("workbench-search")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Refresh sources" })).toHaveCount(0);
  await expect(page.getByRole("radio", { name: "Documents" })).toHaveCount(0);
  await expect(page.getByRole("radio", { name: "Activity" })).toHaveCount(0);
  await expect(page.getByTestId("governed-document-nav")).toHaveCount(0);
  await expect(page.getByTestId("document-state-strip")).toHaveCount(0);
  await expect(page.locator(".order-editor-actionbar")).toHaveCount(0);

  const workspace = page.getByTestId("lifecycle-document-material");
  const editor = await openMarkdownEditor(
    page,
    "Implementation plan document Markdown source",
  );
  const save = page.getByRole("button", { name: "Save", exact: true });
  await expect(workspace).toBeVisible();
  await expect(editor).toBeVisible();
  await expect(save).toBeVisible();

  const workspaceBox = await workspace.boundingBox();
  const editorBox = await editor.boundingBox();
  const saveBox = await save.boundingBox();
  expect(workspaceBox).not.toBeNull();
  expect(editorBox).not.toBeNull();
  expect(saveBox).not.toBeNull();
  const previewBox = await page.getByTestId("markdown-preview").boundingBox();
  expect(previewBox).not.toBeNull();
  expect(editorBox!.width).toBeGreaterThan(workspaceBox!.width * 0.4);
  expect(previewBox!.width).toBeGreaterThan(workspaceBox!.width * 0.4);
  expect(editorBox!.height).toBeGreaterThan(workspaceBox!.height * 0.45);
  expect(saveBox!.y + saveBox!.height).toBeLessThanOrEqual(900);

  await backToQueue(page);
  await page.setViewportSize({ width: 700, height: 800 });
  const item = await workItemForTitle(page, "Lifecycle editing workbench");
  const row = rowFor(page, "Lifecycle editing workbench");
  await expect(row).toBeVisible();
  await expect(row).toContainText("Approval");
  await expect(row).toContainText(item.status === "ACTIVE" ? "Active" : item.status.toLowerCase());

  await page.setViewportSize({ width: 1280, height: 800 });
  await openWorkItem(page, "Verified candidate");
  await selectWorkflowStep(page, "Implementation");
  const taskMaster = page.getByTestId("workbench-master-detail-master");
  const taskDetail = page.getByTestId("execution-task-detail");
  await expect(taskMaster).toBeVisible();
  await expect(taskDetail).toBeVisible();
  const masterBox = await taskMaster.boundingBox();
  const detailBox = await taskDetail.boundingBox();
  expect(masterBox).not.toBeNull();
  expect(detailBox).not.toBeNull();
  expect(masterBox!.width).toBeLessThanOrEqual(18 * 16 + 20);
  expect(detailBox!.width).toBeGreaterThan(640);
});

test("narrow workflow work index returns focus and preserves dirty material across recomposition", async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 700, height: 800 });
  await authenticate(page, request);
  await openWorkItem(page, "Lifecycle editing workbench");
  await selectWorkflowStep(page, "Implementation plan");

  const editor = await openMarkdownEditor(
    page,
    "Implementation plan document Markdown source",
  );
  const initial = await markdownSourceValue(editor);
  await replaceMarkdownSource(
    page,
    editor,
    initial + "\n# Responsive continuity\n",
  );

  const relatedAttempt = page.getByRole("button", { name: "View Attempt 1", exact: true });
  await relatedAttempt.focus();
  await expect(relatedAttempt).toBeFocused();
  await expect(page.getByRole("button", { name: "Supporting material and history", exact: true })).toHaveCount(0);
  await expect(page.getByRole("combobox", { name: "Current workflow material" })).toHaveCount(0);
  await expect(relatedAttempt).toBeVisible();
  await expect.poll(() => markdownSourceValue(editor))
    .toContain("# Responsive continuity");

  await page.setViewportSize({ width: 1600, height: 900 });
  await expect(page.getByRole("button", { name: "Supporting material and history", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "View Attempt 1", exact: true })).toBeVisible();
  await expect.poll(() => markdownSourceValue(editor))
    .toContain("# Responsive continuity");
});

test("workflow step owns Run history, dialogue, responsive detail, and technical feedback", async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await authenticate(page, request);

  await openWorkItem(page, "Proposal adoption in progress");
  const adoptionReview = page.getByTestId("proposal-review-workspace");
  await expect(adoptionReview).toBeVisible();
  await expect(adoptionReview).toContainText("Adoption in progress");
  await expect(page.getByRole("button", { name: "Adopt" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Reject" })).toHaveCount(0);
  await backToQueue(page);

  await openWorkItem(page, "Proposal review");

  const workflowRail = page.getByTestId("workflow-rail");
  await expect(workflowRail.getByRole("button", { name: "Implementation plan" }))
    .toHaveAttribute("aria-current", "step");
  await expect(page.getByTestId("proposal-review-workspace")).toBeVisible();
  await expect(page.getByRole("button", { name: "Supporting material and history", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Back to workflow attempt", exact: true }).click();
  await expect(page.getByTestId("stage-run-material")).toBeVisible();
  await expect(page.getByRole("radio", { name: "Activity" })).toHaveCount(0);
  await expect(page.getByTestId("selected-run-header")).toHaveCount(1);

  const detail = page.getByTestId("activity-detail");
  const detailBox = await detail.boundingBox();
  expect(detailBox).not.toBeNull();
  expect(detailBox!.width).toBeGreaterThan(640);

  await expect(detail.getByText("Continue current work", { exact: true })).toHaveCount(0);
  await expect(page.getByLabel("Message input")).toHaveCount(0);
  await expect(page.getByText("ARTIFACT_PROPOSAL_CREATED", { exact: true })).toHaveCount(0);
  await expect(detail.getByText("Timeline technical details", { exact: true })).toHaveCount(0);

  await page.setViewportSize({ width: 1000, height: 800 });
  await expect(page.getByTestId("work-item-context")).toHaveCount(0);
  await expect(page.getByTestId("activity-detail")).toBeVisible();

  await page.setViewportSize({ width: 700, height: 800 });
  await expect(page.getByTestId("activity-detail")).toBeVisible();
  await expect(page.getByText("Continue current work", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("radio", { name: "Documents" })).toHaveCount(0);

  await backToQueue(page);
  await page.setViewportSize({ width: 1600, height: 900 });
  await openWorkItem(page, "Completed investigation");
  await expect(page.getByTestId("result-workspace")).toBeVisible();
  await selectWorkflowStep(page, "Research");
  await expect(page.getByTestId("workflow-step-index")).toHaveCount(0);
  await selectCurrentWorkflowMaterial(page, "Attempt 1");
  await expect(page.getByTestId("stage-run-material")).toBeVisible();
  await expect(page.getByText("Completed", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Workflow step completed", { exact: true })).toBeVisible();
});

test("completed pre-signoff history never suppresses the canonical next-stage action", async ({
  page,
  request,
}) => {
  await authenticate(page, request);

  const cases = [
    {
      title: "Requirements ready after Research",
      currentStep: "Requirements",
      action: "Start Requirements",
    },
    {
      title: "Solution design ready after Requirements",
      currentStep: "Solution design",
      action: "Start Solution design",
    },
    {
      title: "Implementation plan ready after Design",
      currentStep: "Implementation plan",
      action: "Start Implementation planning",
    },
    {
      title: "Readiness ready after Plan",
      currentStep: "Readiness review",
      action: "Start Readiness review",
    },
  ] as const;

  for (const entry of cases) {
    await openWorkItem(page, entry.title);
    const rail = page.getByTestId("workflow-rail");
    await expect(
      rail.getByRole("button", { name: entry.currentStep, exact: true }),
    ).toHaveAttribute("aria-current", "step");
    await expect(
      page.getByRole("button", { name: entry.action, exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("radio", { name: "Documents" })).toHaveCount(0);
    await expect(page.getByRole("radio", { name: "Activity" })).toHaveCount(0);

    if (entry.currentStep === "Requirements") {
      const reachedResearch = rail.getByRole("button", { name: "Research", exact: true });
      await expect(reachedResearch.locator(".order-workbench-process-marker")).toHaveText("✓");
      await expect(reachedResearch.locator("..")).toHaveAttribute("data-state", "reached");
      await expect(reachedResearch.locator("..")).toHaveAttribute("data-tone", "success");
      const markerGeometry = await reachedResearch.locator(".order-workbench-process-marker").evaluate((marker) => {
        const cell = marker.closest("li")!;
        const cellRect = cell.getBoundingClientRect();
        const markerRect = marker.getBoundingClientRect();
        const before = getComputedStyle(cell, "::before");
        const after = getComputedStyle(cell, "::after");
        return {
          leftGap: markerRect.left - cellRect.left - parseFloat(before.width),
          rightGap: cellRect.right - markerRect.right - parseFloat(after.width),
          markerColor: getComputedStyle(marker).color,
          successColor: (() => {
            const probe = document.createElement("span");
            probe.style.color = "var(--color-text-success)";
            cell.append(probe);
            const color = getComputedStyle(probe).color;
            probe.remove();
            return color;
          })(),
        };
      });
      expect(markerGeometry.leftGap).toBeGreaterThan(0);
      expect(markerGeometry.rightGap).toBeGreaterThan(0);
      expect(markerGeometry.markerColor).toBe(markerGeometry.successColor);
      await selectWorkflowStep(page, "Research");
      await expect(reachedResearch).toHaveAttribute("aria-pressed", "true");
      await expect(rail.getByRole("button", { name: "Requirements", exact: true })).toHaveAttribute("aria-current", "step");
      await expect(page.getByRole("button", { name: "Supporting material and history", exact: true })).toHaveCount(0);
      await selectCurrentWorkflowMaterial(page, "Attempt 1");
      await expect(page.getByTestId("stage-run-material")).toBeVisible();
      await expect(
        page.getByText("Workflow step completed", { exact: true }),
      ).toBeVisible();
      await selectWorkflowStep(page, "Requirements");
      await expect(
        page.getByRole("button", { name: "Start Requirements", exact: true }),
      ).toBeVisible();
    }

    await backToQueue(page);
  }
});

test("historical inspection keeps return navigation bounded and current mutations on the current owner", async ({
  page,
  request,
}) => {
  await authenticate(page, request);

  for (const [title, attentionText, currentAction] of [
    ["Workflow input required", "Waiting for you", null],
    ["Proposal review", "Proposal review required", null],
    ["Workflow resume action", "is blocked", "Resume resolved blocker"],
    ["Workflow retry action", "requires recovery", "Retry Implementation plan"],
  ] as const) {
    await openWorkItem(page, title);
    await selectWorkflowStep(page, "Work request");
    await expect(page.locator(".order-workbench-attention")).toHaveCount(0);
    await expect(page.getByTestId("workflow-step-summary")).toHaveCount(0);
    const returnToCurrent = page.getByRole("button", {
      name: "Return to Implementation plan",
      exact: true,
    });
    await expect(returnToCurrent).toBeVisible();
    await expect(returnToCurrent.locator("..")).not.toContainText(attentionText);
    if (currentAction !== null) {
      await expect(page.getByRole("button", {
        name: currentAction,
        exact: true,
      })).toHaveCount(0);
      await returnToCurrent.click();
      await expect(page.getByRole("button", {
        name: currentAction,
        exact: true,
      })).toBeVisible();
    }
    await backToQueue(page);
  }

  await openWorkItem(page, "Stale approval inspection matrix");
  await expect(page.getByTestId("workflow-step-summary")).toHaveCount(0);
  await expect(page.getByTestId("review-workspace")).toContainText("Package stale");
  await selectWorkflowStep(page, "Work request");
  await expect(page.locator(".order-workbench-attention")).toHaveCount(0);
  await expect(page.getByTestId("workflow-step-summary")).toHaveCount(0);
  const returnToApproval = page.getByRole("button", { name: "Return to Approval", exact: true });
  await expect(returnToApproval).toBeVisible();
  await expect(returnToApproval.locator("..")).not.toContainText("Approval authority is stale");
  await expect(page.getByRole("button", {
    name: "Return to Implementation plan",
    exact: true,
  })).toHaveCount(0);
  await returnToApproval.click();
  await expect(page.getByRole("button", {
    name: "Return to Implementation plan",
    exact: true,
  })).toBeVisible();
});

test("canonical Run feedback remains visible in the owning workflow context without synthetic progress", async ({
  page,
  request,
}) => {
  await authenticate(page, request);

  await openWorkItem(page, "Workflow input required");
  await expect(page.getByTestId("workflow-step-summary")).toHaveCount(0);
  await expect(page.getByTestId("selected-run-header"))
    .toContainText("Waiting for you");
  await expect(
    page.getByText("Which constraint should the plan prioritize?", { exact: true }),
  ).toBeVisible();
  const requiredInputComposer = page.getByTestId("activity-composer");
  await expect(requiredInputComposer).not.toContainText("Answer the question above");
  await expect(requiredInputComposer.getByLabel("Message input")).toBeEditable();
  await expect(requiredInputComposer.getByRole("button", { name: "Send", exact: true })).toBeVisible();
  await expect(requiredInputComposer.getByRole("button", { name: "Send", exact: true })).toBeDisabled();
  await expect(requiredInputComposer).toBeFocused();
  const contextControl = page.getByRole("button", { name: "Context", exact: true });
  await contextControl.focus();
  await page.waitForTimeout(1_000);
  await expect(contextControl).toBeFocused();
  await expect(
    page.getByTestId("activity-composer")
      .getByText("Which constraint should the plan prioritize?", { exact: true }),
  ).toHaveCount(0);
  await expect(page.getByRole("progressbar")).toHaveCount(0);

  await page.setViewportSize({ width: 700, height: 800 });
  await selectWorkflowStep(page, "Work request");
  await selectWorkflowStep(page, "Implementation plan");
  const remountedComposer = page.getByTestId("activity-composer");
  await expect(remountedComposer).toBeVisible();
  await expect(remountedComposer).not.toBeFocused();
  const remountContextControl = page.getByRole("button", { name: "Context", exact: true });
  await remountContextControl.focus();
  await page.waitForTimeout(500);
  await expect(remountContextControl).toBeFocused();
  await page.setViewportSize({ width: 1280, height: 720 });

  await backToQueue(page);

  await openWorkItem(page, "Workflow failure feedback");
  await selectCurrentWorkflowMaterial(page, "Attempt 4");
  await expect(page.getByText("Work is blocked", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Conformance check failed", { exact: true }),
  ).toBeVisible();

  await selectCurrentWorkflowMaterial(page, "Attempt 2");
  await expect(page.getByText("Agent setup blocked", { exact: true })).toBeVisible();
  await expect(page.getByTestId("workflow-step-summary")).toHaveCount(0);
  await expect(page.locator(".order-workbench-attention")).toHaveCount(0);
  const returnToPlan = page.getByRole("button", { name: "Return to Implementation plan", exact: true });
  await expect(returnToPlan).toBeVisible();
  await expect(returnToPlan.locator("..")).not.toContainText("Implementation plan requires recovery");
  await expect(
    page.getByText("Technical diagnostics available", { exact: true }),
  ).toBeVisible();
  const setupEvidence = page
    .locator('[data-evidence-path="provider-diagnostics.json"]')
    .first()
    .getByRole("button", { name: "Evidence: provider-diagnostics.json" });
  await expect(setupEvidence).toBeVisible();

  await selectCurrentWorkflowMaterial(page, "Attempt 3");
  await expect(
    page.getByText("Agent execution failed", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Approved authority changed", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Repository changed", { exact: true })).toBeVisible();

  await selectCurrentWorkflowMaterial(page, "Attempt 1");
  await expect(page.getByText("Cancelled", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Attempt cancelled", { exact: true })).toBeVisible();
  await backToQueue(page);

  await openWorkItem(page, "Already satisfied implementation");
  await expect(page.getByTestId("result-workspace"))
    .toContainText("Already satisfied");
  await selectWorkflowStep(page, "Implementation");
  await expect(
    page.getByTestId("execution-task-detail")
      .getByText("No change required", { exact: true })
      .first(),
  ).toBeVisible();
  await backToQueue(page);

  await openWorkItem(page, "Failed implementation feedback");
  await selectWorkflowMaterial(page, "Independent review · Attempt 2");
  await expect(
    page.getByText("Independent review failed", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Validation failed", { exact: true })).toBeVisible();

  await selectWorkflowMaterial(page, "Implementation agent · Attempt 1");
  await expect(page.getByText("Verification passed", { exact: true })).toBeVisible();
  await expect(page.getByText("Verification failed", { exact: true })).toBeVisible();
  await expect(page.getByRole("progressbar")).toHaveCount(0);
  await backToQueue(page);
});

test("workflow mutations lock their owning controls while pending and keep failures local", async ({
  page,
  request,
}) => {
  await authenticate(page, request);

  const failNext = async (
    pattern: string,
    trigger: () => Promise<void>,
    assertPending: () => Promise<void>,
  ): Promise<void> => {
    let release = (): void => {};
    let markHandled = (): void => {};
    const barrier = new Promise<void>((resolve) => {
      release = resolve;
    });
    const handled = new Promise<void>((resolve) => {
      markHandled = resolve;
    });
    await page.route(pattern, async (route) => {
      if (route.request().method() === "GET") {
        await route.fallback();
        return;
      }
      await barrier;
      await route.abort("failed");
      markHandled();
    });
    await trigger();
    await assertPending();
    release();
    await handled;
    await page.unroute(pattern);
  };

  await openWorkItem(page, "Requirements ready after Research");
  const start = page.getByRole("button", { name: "Start Requirements", exact: true });
  await failNext(
    "**/api/work-items/*/runs",
    async () => start.click(),
    async () => expect(start).toBeDisabled(),
  );
  await expect(page.getByText("Could not start current workflow step", { exact: true }))
    .toBeVisible();
  await backToQueue(page);

  await openWorkItem(page, "Workflow input required");
  const messageInput = page.getByLabel("Message input");
  await messageInput.fill("Keep the approved constraint.");
  await failNext(
    "**/api/runs/*/input",
    async () => messageInput.press("Enter"),
    async () => expect(messageInput).toBeDisabled(),
  );
  await expect(page.getByText("Workflow action failed", { exact: true })).toBeVisible();

  const cancel = page.getByRole("button", { name: "Cancel current activity" });
  await failNext(
    "**/api/runs/*/cancel",
    async () => cancel.click(),
    async () => expect(cancel).toBeDisabled(),
  );
  await expect(page.getByText("Workflow action failed", { exact: true })).toBeVisible();
  await backToQueue(page);

  await openWorkItem(page, "Workflow retry action");
  const retry = page.getByRole("button", { name: "Retry Implementation plan" });
  await expect(retry).toBeEnabled();
  await failNext(
    "**/api/work-items/*/runs",
    async () => retry.click(),
    async () => expect(retry).toBeDisabled(),
  );
  await expect(page.getByText("Could not start current workflow step", { exact: true })).toBeVisible();
  await backToQueue(page);

  await openWorkItem(page, "Workflow resume action");
  const resume = page.getByRole("button", { name: "Resume resolved blocker" });
  await expect(resume).toBeEnabled();
  await failNext(
    "**/api/work-items/*/resume",
    async () => resume.click(),
    async () => expect(resume).toBeDisabled(),
  );
  await expect(page.getByText("Could not resume current workflow owner", { exact: true })).toBeVisible();
  await backToQueue(page);

  await openWorkItem(page, "Implementation action ready");
  const implementationDetail = page.getByTestId("execution-task-detail");
  await expect(implementationDetail).toBeVisible();
  await expect(implementationDetail.getByText("Approved implementation task", { exact: true })).toBeVisible();
  await expect(
    page.getByTestId("workbench-master-detail-master")
      .getByText("No attempts yet", { exact: true }),
  ).toBeVisible();
  await expect(implementationDetail.getByText("Loading attempt timeline…", { exact: true })).toHaveCount(0);
  const signedTaskDetails = implementationDetail.getByRole("button", { name: "Signed task details", exact: true });
  await expect(signedTaskDetails).toBeVisible();
  await signedTaskDetails.click();
  await expect(implementationDetail.getByText("Change surface forecast", { exact: true })).toBeVisible();
  await expect(implementationDetail.getByText("Task id", { exact: true })).toHaveCount(0);
  await expect(implementationDetail.getByText("Provider session", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "Approved tasks" })).toBeVisible();
  await expect(implementationDetail.getByLabel("Task overview")).toContainText("Validation boundary");
  await expect(implementationDetail.getByLabel("Task overview")).toContainText("Not started");
  await expect(page.getByRole("navigation", { name: "Approved tasks" }).getByRole("button", { pressed: true })).toContainText("Current · Ready to start");
  await expect(page.getByRole("button", { name: "Technical details", exact: true })).toHaveCount(0);
  const implementationItem = await workItemForTitle(page, "Implementation action ready");
  const taskResponse = await page.context().request.get(
    "/api/work-items/" + implementationItem.id + "/tasks",
  );
  expect(taskResponse.status()).toBe(200);
  const currentTask = ExecutionTaskSchema.array().parse(await taskResponse.json())[0];
  expect(currentTask).toBeDefined();
  const startCurrent = page.getByRole("button", { name: "Start current task" });
  await failNext(
    "**/api/work-items/" + implementationItem.id + "/tasks/" + currentTask!.id + "/start",
    async () => startCurrent.click(),
    async () => expect(startCurrent).toBeDisabled(),
  );
  await expect(page.getByText("Implementation action failed", { exact: true }))
    .toBeVisible();
});

test("P5 keeps current execution ownership independent from historical selection across responsive classes", async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await authenticate(page, request);
  await openWorkItem(page, "Implementation historical selection");

  const workItem = await workItemForTitle(page, "Implementation historical selection");
  const tasksResponse = await page.context().request.get(
    "/api/work-items/" + workItem.id + "/tasks",
  );
  expect(tasksResponse.status()).toBe(200);
  const tasks = ExecutionTaskSchema.array().parse(await tasksResponse.json());
  const historicalTask = tasks.find((task) => task.objective === "Completed prerequisite");
  const currentTask = tasks.find((task) => task.objective === "Current implementation task");
  expect(historicalTask).toBeDefined();
  expect(currentTask).toBeDefined();

  const historicalTaskRow = page.getByRole("navigation", { name: "Approved tasks" })
    .getByRole("button", { name: /Completed prerequisite/ });
  await expect(historicalTaskRow).toBeVisible();
  await historicalTaskRow.click();
  const detail = page.getByTestId("execution-task-detail");
  await expect(detail).toContainText("Completed prerequisite");
  await expect(detail).toContainText("No change required");
  await expect(page.getByTestId("execution-workspace")).toContainText("Current boundary: not started");
  await expect(page.getByRole("button", { name: "Start current task", exact: true }))
    .toBeVisible();

  for (const width of [1000, 700]) {
    await page.setViewportSize({ width, height: 800 });
    await expect(detail).toContainText("Completed prerequisite");
    await expect(page.getByTestId("execution-workspace")).toContainText("Current boundary: not started");
    await expect(page.getByRole("button", { name: "Approved tasks", exact: true }))
      .toBeVisible();
    await expect(page.getByRole("button", { name: "Start current task", exact: true }))
      .toBeVisible();
  }

  let historicalStartCalled = false;
  const historicalStartPath =
    "/api/work-items/" + workItem.id + "/tasks/" + historicalTask!.id + "/start";
  const currentStartPath =
    "/api/work-items/" + workItem.id + "/tasks/" + currentTask!.id + "/start";
  await page.route("**" + historicalStartPath, async (route) => {
    historicalStartCalled = true;
    await route.abort("failed");
  });
  await page.route("**" + currentStartPath, async (route) => {
    const run = RunSchema.parse(await fixtureMutation(
      page.context().request,
      "/tick",
      { workItemId: workItem.id, taskId: currentTask!.id },
    ));
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify(run),
    });
  });
  const startResponse = page.waitForResponse((response) =>
    response.request().method() === "POST" &&
    response.url().endsWith(currentStartPath));
  await page.getByRole("button", { name: "Start current task", exact: true }).click();
  expect((await startResponse).status()).toBe(201);
  expect(historicalStartCalled).toBe(false);
  await page.unroute("**" + currentStartPath);
  await page.unroute("**" + historicalStartPath);

  await expect(detail).toContainText("Completed prerequisite");
  await expect(
    page.getByRole("button", {
      name: "Cancel current implementation attempt",
      exact: true,
    }),
  ).toBeVisible();

  await backToQueue(page);
  await page.setViewportSize({ width: 1000, height: 800 });
  await openWorkItem(page, "Verified candidate");
  const finalOutcome = page.getByTestId("final-governed-outcome");
  const candidateResources = page.getByTestId("candidate-result-material");
  await expect(finalOutcome).toBeVisible();
  await expect(candidateResources).toBeVisible();
  let outcomeBox = await finalOutcome.boundingBox();
  let resourcesBox = await candidateResources.boundingBox();
  expect(outcomeBox).not.toBeNull();
  expect(resourcesBox).not.toBeNull();
  expect(outcomeBox!.y).toBeLessThan(resourcesBox!.y);
  await expect(finalOutcome).not.toContainText(/deployed|production/i);

  await page.setViewportSize({ width: 700, height: 800 });
  await expect(finalOutcome).toBeVisible();
  await expect(candidateResources).toBeVisible();
  outcomeBox = await finalOutcome.boundingBox();
  resourcesBox = await candidateResources.boundingBox();
  expect(outcomeBox).not.toBeNull();
  expect(resourcesBox).not.toBeNull();
  expect(outcomeBox!.y).toBeLessThan(resourcesBox!.y);
  await expect(page.getByRole("button", { name: "Create linked remediation" }))
    .toHaveCount(0);

  await backToQueue(page);
  await openWorkItem(page, "Completed audit");
  const auditOutcome = page.getByTestId("final-governed-outcome");
  const auditResult = page.getByTestId("result-material");
  await expect(auditOutcome).toBeVisible();
  await expect(auditResult).toBeVisible();
  const auditOutcomeBox = await auditOutcome.boundingBox();
  const auditResultBox = await auditResult.boundingBox();
  expect(auditOutcomeBox).not.toBeNull();
  expect(auditResultBox).not.toBeNull();
  expect(auditOutcomeBox!.y).toBeLessThan(auditResultBox!.y);
  await expect(page.getByRole("button", { name: "Create linked remediation", exact: true }))
    .toBeVisible();
});

test("mutation conflict remains primary until the selected WorkItem refresh succeeds", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  await openWorkItem(page, "Requirements ready after Research");
  const workItem = await workItemForTitle(page, "Requirements ready after Research");
  const selectedPath =
    `**/api/work-items/${encodeURIComponent(workItem.id)}`;
  const startPath =
    `**/api/work-items/${encodeURIComponent(workItem.id)}/runs`;

  await page.route(selectedPath, async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    await route.abort("failed");
  });
  await page.route(startPath, async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status: 409,
      contentType: "application/json",
      body: JSON.stringify({
        code: "CURRENT_STATE_CONFLICT",
        message: "The workflow changed before this command could commit.",
        sourceDiagnostic: null,
        staleAuthorityOwner: null,
      }),
    });
  });

  const start = page.getByRole("button", {
    name: "Start Requirements",
    exact: true,
  });
  await start.click();

  await expect(page.locator(".order-workbench-attention")).toHaveCount(0);
  await expect(page.getByText(
    "Workflow state changed during the action",
    { exact: true },
  )).toBeVisible();
  await expect(page.getByText(
    "Review the refreshed current workflow state before attempting another mutation.",
    { exact: true },
  )).toBeVisible();
  await expect(page.getByTestId("workflow-step-summary")).toHaveCount(0);
  await expect(
    page.getByRole("button", {
      name: "Start Requirements",
      exact: true,
    }),
  ).toHaveCount(0);

  await page.unroute(startPath);
  await page.unroute(selectedPath);
});

test("successful workflow mutations reconcile to refreshed canonical state without provider-dependent browser work", async ({
  page,
  request,
}) => {
  await authenticate(page, request);

  await openWorkItem(page, "Work request start success");
  const startItem = await workItemForTitle(page, "Work request start success");
  const researchRun = RunSchema.parse(await fixtureMutation(
    page.context().request,
    "/start-stage",
    { workItemId: startItem.id },
  ));
  const startPattern = "**/api/work-items/" + startItem.id + "/runs";
  await page.route(startPattern, async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify(researchRun),
    });
  });
  const startResponse = page.waitForResponse((response) =>
    response.request().method() === "POST" &&
    response.url().includes("/api/work-items/" + startItem.id + "/runs"));
  await page.getByRole("button", { name: "Start Research", exact: true }).click();
  await startResponse;
  await page.unroute(startPattern);
  await expect(
    page.getByTestId("workflow-rail")
      .getByRole("button", { name: "Research", exact: true }),
  ).toHaveAttribute("aria-current", "step");
  await expect(page.getByTestId("selected-run-header")).toContainText("Processing");
  await expect(page.getByTestId("activity-composer")).toHaveCount(0);
  await backToQueue(page);

  await openWorkItem(page, "Workflow input required");
  const inputItem = await workItemForTitle(page, "Workflow input required");
  const inputRunsResponse = await page.context().request.get(
    "/api/work-items/" + inputItem.id + "/runs",
  );
  expect(inputRunsResponse.status()).toBe(200);
  const inputRuns = RunSchema.array().parse(await inputRunsResponse.json());
  const inputRun = inputRuns.find((run) => run.status === "WAITING_FOR_INPUT");
  expect(inputRun).toBeDefined();
  const inputEventsResponse = await page.context().request.get(
    "/api/runs/" + inputRun!.id + "/events?afterSequence=0",
  );
  expect(inputEventsResponse.status()).toBe(200);
  const inputEvents = RunEventSchema.array().parse(await inputEventsResponse.json());
  const requested = inputEvents.find(
    (event) => event.event.tag === "HUMAN_INPUT_REQUESTED",
  );
  expect(requested).toBeDefined();
  const inputPattern = "**/api/runs/" + inputRun!.id + "/input";
  await page.route(inputPattern, async (route) => {
    const received = RunEventSchema.parse(await fixtureMutation(
      page.context().request,
      "/submit-input",
      {
        runId: inputRun!.id,
        requestEventId: requested!.id,
        text: "Keep the approved constraint.",
      },
    ));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(received),
    });
  });
  const messageInput = page.getByLabel("Message input");
  await messageInput.fill("Keep the approved constraint.");
  const inputResponse = page.waitForResponse((response) =>
    response.request().method() === "POST" &&
    response.url().includes("/api/runs/" + inputRun!.id + "/input"));
  await messageInput.press("Enter");
  await inputResponse;
  await page.unroute(inputPattern);
  await expect(
    page.getByText("Keep the approved constraint.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Continue current work", { exact: true })).toHaveCount(0);

  const cancelResponse = page.waitForResponse((response) =>
    response.request().method() === "POST" &&
    response.url().includes("/api/runs/" + inputRun!.id + "/cancel"));
  await page.getByRole("button", { name: "Cancel current activity" }).click();
  expect((await cancelResponse).status()).toBe(200);
  await expect(page.getByTestId("selected-run-header")).toContainText("Cancelled");
  await expect(page.getByTestId("activity-composer")).toHaveCount(0);
  await backToQueue(page);

  await openWorkItem(page, "Workflow retry action");
  const retryItem = await workItemForTitle(page, "Workflow retry action");
  const retryPattern = "**/api/work-items/" + retryItem.id + "/runs";
  await page.route(retryPattern, async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }
    const retryRun = RunSchema.parse(await fixtureMutation(
      page.context().request,
      "/start-stage",
      { workItemId: retryItem.id },
    ));
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify(retryRun),
    });
  });
  const retryResponse = page.waitForResponse((response) =>
    response.request().method() === "POST" &&
    response.url().includes("/api/work-items/" + retryItem.id + "/runs"));
  await page.getByRole("button", { name: "Retry Implementation plan" }).click();
  await retryResponse;
  await page.unroute(retryPattern);
  await expect(page.getByTestId("selected-run-header")).toContainText("Attempt 2");
  await expect(page.getByTestId("selected-run-header")).toContainText("Processing");
  await expect(page.getByTestId("activity-composer")).toHaveCount(0);
  await backToQueue(page);

  await openWorkItem(page, "Workflow resume action");
  const resumeItem = await workItemForTitle(page, "Workflow resume action");
  const resumeResponse = page.waitForResponse((response) =>
    response.request().method() === "POST" &&
    response.url().includes("/api/work-items/" + resumeItem.id + "/resume"));
  await page.getByRole("button", { name: "Resume resolved blocker" }).click();
  expect((await resumeResponse).status()).toBe(200);
  await expect(
    page.getByRole("button", { name: "Resume resolved blocker" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Retry Implementation plan" }),
  ).toBeVisible();
  await backToQueue(page);

  await openWorkItem(page, "Implementation action ready");
  const executionItem = await workItemForTitle(page, "Implementation action ready");
  const tasksResponse = await page.request.get(
    "/api/work-items/" + executionItem.id + "/tasks",
  );
  expect(tasksResponse.status()).toBe(200);
  const executionTasks = ExecutionTaskSchema.array().parse(
    await tasksResponse.json(),
  );
  const executionTask = executionTasks[0];
  expect(executionTask).toBeDefined();
  const startPath =
    "/api/work-items/" + executionItem.id +
    "/tasks/" + executionTask!.id + "/start";
  await page.route("**" + startPath, async (route) => {
    const run = RunSchema.parse(await fixtureMutation(
      page.context().request,
      "/tick",
      { workItemId: executionItem.id },
    ));
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify(run),
    });
  });
  const executionStartResponse = page.waitForResponse((response) =>
    response.request().method() === "POST" &&
    response.url().endsWith(startPath));
  await page.getByRole("button", { name: "Start current task" }).click();
  expect((await executionStartResponse).status()).toBe(201);
  await page.unroute("**" + startPath);
  await expect(page.getByTestId("selected-run-header"))
    .toContainText("Implementation agent · Attempt 1");
  await expect(page.getByTestId("selected-run-header")).toContainText("Running");
  await expect(
    page.getByRole("button", { name: "Start current task" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Cancel current implementation attempt" }),
  ).toBeVisible();
});

test("all nine workflow steps keep their canonical summary/material grammar and supporting context local", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  await openWorkItem(page, "Lifecycle editing workbench");

  const cases = [
    "Work request",
    "Research",
    "Requirements",
    "Solution design",
    "Implementation plan",
    "Readiness review",
    "Approval",
  ] as const;

  for (const step of cases) {
    await selectWorkflowStep(page, step);
    if (step === "Readiness review" || step === "Approval") {
      const review = page.getByTestId("review-workspace");
      await expect(review).toBeVisible();
      await expect(page.getByTestId("workflow-step-summary")).toHaveCount(0);
      if (step === "Readiness review") {
        await expect(page.getByRole("button", { name: "Return to Approval", exact: true })).toBeVisible();
      } else {
        await expect(review).toContainText("Ready for sign-off");
        await expect(page.getByRole("button", { name: "Return to Approval" })).toHaveCount(0);
      }
    } else {
      await expect(page.locator(".order-workbench-attention")).toHaveCount(0);
      const returnToApproval = page.getByRole("button", { name: "Return to Approval" });
      await expect(returnToApproval).toBeVisible();
      await expect(returnToApproval.locator("..")).not.toContainText("Approval is ready for your action");
      await expect(page.getByTestId("workflow-step-summary")).toHaveCount(0);
      await expect(page.getByTestId("primary-material-frame")).toHaveCount(0);
      await expect(page.getByTestId("workflow-step-workspace")).toBeVisible();
    }
  }

  await selectWorkflowStep(page, "Research");
  await selectCurrentWorkflowMaterial(page, "Work request");
  await expect(page.getByTestId("source-document-material")).toBeVisible();
  await expect(page.getByTestId("document-git-controls")).toHaveCount(0);
  await expect(
    page.getByText("Read-only supporting Work request context.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Back to workflow context" }).click();
  await expect(page.getByTestId("lifecycle-document-material")).toBeVisible();

  await selectWorkflowStep(page, "Requirements");
  await selectCurrentWorkflowMaterial(page, "Research");
  await expect(page.getByTestId("lifecycle-document-material")).toBeVisible();
  await expect(page.getByTestId("document-git-controls")).toHaveCount(0);
  await page.getByRole("button", { name: "Back to workflow context" }).click();

  await backToQueue(page);
  await openWorkItem(page, "Verified candidate");
  await selectWorkflowStep(page, "Implementation");
  await expect(page.getByTestId("workflow-step-summary")).toHaveCount(0);
  await expect(page.getByTestId("execution-workspace")).toBeVisible();
  await selectWorkflowStep(page, "Complete");
  await expect(page.getByTestId("result-workspace")).toContainText("Verified candidate");
});

test("OPEN continuation keeps the agent anchor visible and admits exactly one current reply composer", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  await openWorkItem(page, "Research open continuation");
  const detail = page.getByTestId("activity-detail");
  await expect(detail).toBeVisible();
  await expect(page.getByTestId("workflow-step-summary")).toHaveCount(0);
  await expect(page.getByTestId("selected-run-header"))
    .not.toContainText("Open for continuation");
  await expect(detail).toContainText("The current Research findings are ready for your continuation.");
  const composer = detail.getByTestId("activity-composer");
  await expect(composer).toBeVisible();
  await expect(composer.getByLabel("Message input")).toBeVisible();
  await expect(composer.getByLabel("Message input")).toBeEditable();
  await expect(composer).not.toContainText("Continue current work");
  await expect(composer.getByText("Answer the question above", { exact: true })).toHaveCount(0);
  await expect(detail.getByRole("heading", { name: "Research document", exact: true })).toBeVisible();
  await expect(detail.getByRole("button", { name: "View Research document", exact: true })).toBeVisible();
  await expect(page.getByTestId("proposal-review-workspace")).toHaveCount(0);
});

test("PROCESSING dialogue state is visibly distinct and has no reply composer", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  const item = await workItemForTitle(page, "Research processing attention visual");
  await fixtureMutation(request, "/start-stage", { workItemId: item.id });
  await openWorkItem(page, "Research processing attention visual");

  await expect(page.getByTestId("workflow-step-summary")).toHaveCount(0);
  await expect(page.getByTestId("selected-run-header")).toContainText("Processing");
  await expect(page.getByTestId("activity-composer")).toHaveCount(0);
});

test("active agent ownership keeps title and lifecycle authoring read-only while workflow interaction remains available", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  const item = await workItemForTitle(page, "Implementation plan document visual");
  await fixtureMutation(request, "/start-stage", { workItemId: item.id });
  await openWorkItem(page, "Implementation plan document visual");

  await expect(page.getByTestId("workflow-step-summary")).toHaveCount(0);
  await expect(page.getByTestId("selected-run-header")).toContainText("Processing");
  await expect(page.getByRole("button", { name: "Edit title", exact: true })).toBeDisabled();

  await openWorkflowResource(page, "Implementation plan document");
  await expect(page.getByTestId("lifecycle-document-material")).toBeVisible();
  await expect(page.getByRole("button", { name: "Edit", exact: true })).toHaveCount(0);
  await expect(page.getByLabel("Implementation plan document Markdown source")).toHaveCount(0);

  await selectWorkflowStep(page, "Work request");
  await expect(page.getByTestId("source-document-material")).toBeVisible();
  await expect(page.getByLabel("WorkItem source Markdown source")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Edit", exact: true })).toHaveCount(0);
  await expect(page.getByText(/Finish or cancel the active workflow attempt before editing or saving this document/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Save", exact: true })).toHaveCount(0);

  await selectWorkflowStep(page, "Implementation plan");
  await expect(page.getByTestId("workflow-step-summary")).toHaveCount(0);
  await expect(page.getByTestId("selected-run-header")).toContainText("Processing");
});

test("work-type variants preserve their canonical Work request information contracts in one shared shell", async ({
  page,
  request,
}) => {
  test.setTimeout(60_000);
  await authenticate(page, request);
  const variants = [
    {
      title: "Change work type",
      kind: "Change",
      headings: ["Requested outcome", "Current context", "Constraints/non-goals", "Evidence/references"],
    },
    {
      title: "Defect work type",
      kind: "Defect",
      headings: ["Observed behavior", "Expected behavior", "Reproduction/evidence", "Behavior that must remain unchanged", "Impact/context"],
    },
    {
      title: "Investigation work type",
      kind: "Investigation",
      headings: ["Question", "Why it matters", "Known evidence/context", "Investigation boundary"],
    },
    {
      title: "Audit work type",
      kind: "Audit",
      headings: ["Target under audit", "Governing authority/criteria", "Scope/exclusions", "Requested evidence/verdict"],
    },
  ] as const;

  for (const variant of variants) {
    await page.goto("/");
    await openWorkItem(page, variant.title);
    await expect(page.locator(".order-workitem-kind")).toHaveText(variant.kind);
    const source = page.getByTestId("source-document-material");
    await expect(source).toBeVisible();
    for (const heading of variant.headings) await expect(source).toContainText(heading);
    await expect(source.getByTestId("markdown-preview")).not.toContainText("Order template:");
    if (variant.kind === "Change") {
      const editor = await openMarkdownEditor(page, "WorkItem source Markdown source");
      await expect.poll(() => markdownSourceValue(editor)).toContain(
        "<!-- Order template: change-intake-v1;",
      );
      await page.getByRole("button", { name: "Cancel", exact: true }).click();
    }
    await expect(page.getByRole("button", { name: "Start Research", exact: true })).toBeVisible();
    await expect(page.getByTestId("workflow-step-index")).toHaveCount(0);
  }

  const researchVariants = [
    {
      title: "Change research contract",
      kind: "Change",
      headings: [
        "Current state / absence",
        "Evidence",
        "Governing authority",
        "Affected producer→consumer path",
        "Downstream invariants",
        "Unresolved facts",
        "Verdict",
      ],
    },
    {
      title: "Defect research contract",
      kind: "Defect",
      headings: [
        "Observed symptom / reproduction",
        "Proven root cause",
        "Producer→carrier→consumer path",
        "Downstream effects / invariants",
        "Governing authority",
        "Unresolved facts",
        "Verdict",
      ],
    },
    {
      title: "Investigation research contract",
      kind: "Investigation",
      headings: ["Question", "Evidence for / against", "Findings", "Unresolved questions", "Conclusion"],
    },
    {
      title: "Audit research contract",
      kind: "Audit",
      headings: ["Target / criteria", "Evidence by criterion", "Findings", "Verdict"],
    },
  ] as const;

  for (const variant of researchVariants) {
    await page.goto("/");
    await openWorkItem(page, variant.title);
    await expect(page.locator(".order-workitem-kind")).toHaveText(variant.kind);
    const research = page.getByTestId("lifecycle-document-material");
    await expect(research).toBeVisible();
    for (const heading of variant.headings) await expect(research).toContainText(heading);
  }

  await page.goto("/");
  await openWorkItem(page, "Change requirements contract");
  const changeRequirements = page.getByTestId("lifecycle-document-material");
  await expect(changeRequirements).toContainText("Requested outcome");
  await expect(changeRequirements).toContainText("Proven current-state / absence basis");
  await expect(changeRequirements).toContainText("Required observable outcome / delta");
  await expect(changeRequirements).not.toContainText("Proven defect / root cause");

  await page.goto("/");
  await openWorkItem(page, "Defect requirements contract");
  const defectRequirements = page.getByTestId("lifecycle-document-material");
  await expect(defectRequirements).toContainText("Proven defect / root cause");
  await expect(defectRequirements).toContainText("Expected corrected behavior");
  await expect(defectRequirements).toContainText("Behavior that must remain unchanged");
  await expect(defectRequirements).toContainText("Regression / preservation acceptance");
  await expect(defectRequirements).not.toContainText("Proven current-state / absence basis");

  await page.goto("/");
  await openWorkItem(page, "Change solution design contract");
  const changeDesign = page.getByTestId("lifecycle-document-material");
  await expect(changeDesign).toContainText("Requested outcome");
  await expect(changeDesign).toContainText("Proven current-state / absence basis");
  await expect(changeDesign).not.toContainText("Proven root cause / producing boundary");

  await page.goto("/");
  await openWorkItem(page, "Defect solution design contract");
  const defectDesign = page.getByTestId("lifecycle-document-material");
  await expect(defectDesign).toContainText("Proven root cause / producing boundary");
  await expect(defectDesign).toContainText("Preservation invariants");
  await expect(defectDesign).not.toContainText("Proven current-state / absence basis");

  await page.goto("/");
  await openWorkItem(page, "Change implementation plan contract");
  const changePlan = page.getByTestId("lifecycle-document-material");
  await expect(changePlan).toContainText("Requested outcome");
  await expect(changePlan).toContainText("Proven current-state / absence basis");
  await expect(changePlan).not.toContainText("Exact remediation");

  await page.goto("/");
  await openWorkItem(page, "Defect implementation plan contract");
  const defectPlan = page.getByTestId("lifecycle-document-material");
  await expect(defectPlan).toContainText("Exact remediation");
  await expect(defectPlan).toContainText("Reproduction verification");
  await expect(defectPlan).toContainText("Regression verification");
  await expect(defectPlan).toContainText("Preservation verification");
  await expect(defectPlan).not.toContainText("Proven current-state / absence basis");
});

test("Readiness verdict follows typed R3 outcome independently from material currentness", async ({
  page,
  request,
}) => {
  await authenticate(page, request);

  for (const [title, verdict] of [
    ["Readiness returned to Research", "Return to Research"],
    ["Readiness returned to Requirements", "Return to Requirements"],
    ["Readiness returned to Design", "Return to Solution design"],
    ["Readiness returned to Plan", "Return to Implementation plan"],
  ] as const) {
    await openWorkItem(page, title);
    await selectWorkflowStep(page, "Readiness review");
    const review = page.getByTestId("review-workspace");
    await expect(
      review.getByTestId("review-verdict").getByText(verdict, { exact: true }),
    ).toBeVisible();
    await backToQueue(page);
  }

  await openWorkItem(page, "Readiness blocked");
  await expect(
    page.getByTestId("review-workspace")
      .getByTestId("review-verdict")
      .getByText("Blocked", { exact: true }),
  ).toBeVisible();
  await backToQueue(page);

  await openWorkItem(page, "Readiness blocked after prior ready");
  const blockedAfterPriorReady = page.getByTestId("review-workspace")
    .getByTestId("review-verdict");
  await expect(blockedAfterPriorReady.getByText("Blocked", { exact: true }))
    .toBeVisible();
  await expect(
    blockedAfterPriorReady.getByText("Ready for sign-off", { exact: true }),
  ).toHaveCount(0);
  await backToQueue(page);

  await openWorkItem(page, "Awaiting sign-off");
  await selectWorkflowStep(page, "Readiness review");
  await expect(
    page.getByTestId("review-workspace")
      .getByTestId("review-verdict")
      .getByText("Ready for sign-off", { exact: true }),
  ).toBeVisible();
  await backToQueue(page);

  await openWorkItem(page, "Stale approval inspection matrix");
  await expect(page.getByTestId("review-workspace")).toContainText("Package stale");
  await selectWorkflowStep(page, "Readiness review");
  const staleReview = page.getByTestId("review-workspace");
  await expect(
    staleReview.getByTestId("review-verdict")
      .getByText("Ready for sign-off", { exact: true }),
  ).toBeVisible();
  await expect(staleReview.getByText("Stale", { exact: true })).toBeVisible();
});

test("Readiness required input exposes the exact current question without sign-off", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  await openWorkItem(page, "Readiness input required");
  await expect(page.getByTestId("workflow-step-summary")).toHaveCount(0);
  await expect(
    page.getByText(
      "Which readiness finding should be resolved before approval?",
      { exact: true },
    ),
  ).toBeVisible();
  const readinessComposer = page.getByTestId("activity-composer");
  await expect(readinessComposer).toBeVisible();
  await expect(page.getByTestId("stage-run-material")).toBeVisible();
  await expect(page.getByTestId("review-verdict")).toHaveCount(0);
  await expect(readinessComposer.getByLabel("Message input")).toBeVisible();
  await expect(readinessComposer).not.toContainText("Answer the question above");
  await expect(readinessComposer.getByLabel("Message input")).toBeEditable();
  await expect(page.getByRole("combobox", { name: "Readiness material" }))
    .toHaveCount(0);
  await expect(page.getByRole("button", { name: "Sign off exact package" }))
    .toHaveCount(0);
});

test("Readiness keeps verdict and findings primary while subordinate material changes", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  await openWorkItem(page, "Readiness ready after Plan");
  const review = page.getByTestId("review-workspace");
  await expect(review).toBeVisible();
  await expect(review.getByTestId("review-verdict")).toBeVisible();
  // The fixture has completed Plan, but has no R3 Run or verdict.
  await expect(review.getByTestId("review-verdict")).toContainText("Not started");
  await expect(
    review.getByTestId("review-verdict").getByText("Not started", { exact: true }),
  ).toHaveCount(1);
  await expect(review.getByText("Review in progress", { exact: true })).toHaveCount(0);
  await expect(review.getByText("No review findings yet", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Start Readiness review", exact: true })).toBeVisible();
  await expect(review.getByText("Findings", { exact: true })).toBeVisible();
  await review.getByRole("button", {
    name: "View Implementation plan",
    exact: true,
  }).click();
  await expect(review.getByTestId("review-verdict")).toHaveCount(0);
  await expect(review.getByTestId("markdown-readonly")).toBeVisible();
  const backToReadiness = review.getByRole("button", {
    name: "Back to Readiness review",
    exact: true,
  });
  await expect(backToReadiness).toBeVisible();
  await backToReadiness.click();
  await expect(review.getByTestId("review-verdict")).toBeVisible();
  await expect(review.getByText("Findings", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign off exact package" })).toHaveCount(0);
});

test("Approval retains the inspected package when a different prospective hash is observed", async ({ page, request }) => {
  await authenticate(page, request);
  await openWorkItem(page, "Awaiting sign-off");
  const review = page.getByTestId("review-workspace");
  await expect(review.getByTestId("review-verdict")).toContainText("Ready for sign-off");
  await review.getByRole("button", { name: "View task 1", exact: true }).click();
  await page.getByLabel("Approved by").fill("old-package-operator");
  await page.getByRole("button", { name: "Context", exact: true }).click();
  const hash = page.getByTestId("context-signoff-package-hash");
  await expect(hash).toHaveText(/^sha256:[0-9a-f]{64}$/);
  const originalHash = (await hash.textContent())!;
  await page.getByRole("button", { name: "Close context", exact: true }).click();
  const item = await workItemForTitle(page, "Awaiting sign-off");
  const packagePath = "/api/work-items/" + item.id + "/signoff-package";
  const replacementHash = "sha256:" + (originalHash === "sha256:" + "b".repeat(64) ? "c" : "b").repeat(64);
  const originalClosure = await page.context().request.get(packagePath + "/artifacts?expectedPackageHash=" + encodeURIComponent(originalHash));
  expect(originalClosure.ok()).toBe(true);
  const members = await originalClosure.json();
  await page.route("**" + packagePath, async route => {
    const response = await route.fetch();
    const body = await response.json();
    await route.fulfill({ response, json: { ...body, packageHash: replacementHash } });
  });
  await page.route("**" + packagePath + "/artifacts?**", async route => {
    if (new URL(route.request().url()).searchParams.get("expectedPackageHash") === replacementHash) {
      await route.fulfill({ json: members });
    } else {
      await route.continue();
    }
  });
  // Opening Context mounts another observer of the current package query.
  await page.getByRole("button", { name: "Context", exact: true }).click();
  await expect(review.getByTestId("review-verdict")).toContainText("Inspected package is no longer current");
  await expect(review).toContainText("Prove the browser candidate surface");
  await expect(hash).toHaveText(originalHash);
  await expect(review.getByRole("button", { name: "Sign off exact package" })).toHaveCount(0);
  await page.getByRole("button", { name: "Close context", exact: true }).click();
  await review.getByRole("button", { name: "Return to Approval", exact: true }).click();
  await expect(review.getByTestId("review-verdict")).toContainText("Ready for sign-off");
  await expect(page.getByLabel("Approved by")).toHaveValue("");
});

test("proposal decisions are primary, mutation-safe, and Approval keeps sign-off attached to selected material", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  await openWorkItem(page, "Proposal review");

  await expect(page.getByTestId("workflow-step-summary")).toHaveCount(0);
  const proposalReview = page.getByTestId("proposal-review-workspace");
  await expect(proposalReview).toContainText("Pending review");
  await expect(proposalReview).toBeVisible();
  const documentChange = proposalReview.getByTestId("document-change-view");
  await expect(documentChange).toBeVisible();
  await expect(documentChange.getByTestId("document-change-region").first()).toBeVisible();
  const exactDiff = documentChange.getByRole("button", {
    name: "View exact diff",
    exact: true,
  });
  await expect(exactDiff).toBeVisible();
  await expect(exactDiff).toHaveAttribute("aria-expanded", "false");
  await expect(documentChange.locator("pre")).toBeHidden();
  await expect(proposalReview.getByTestId("activity-composer")).toHaveCount(0);
  await expect(proposalReview.getByLabel("Message input")).toHaveCount(0);

  const adopt = page.getByRole("button", { name: "Adopt" });
  const reject = page.getByRole("button", { name: "Reject" });
  await expect(adopt).toBeVisible();
  await expect(reject).toBeVisible();

  let releaseAdopt = (): void => {};
  let markAdoptHandled = (): void => {};
  const adoptBarrier = new Promise<void>((resolve) => {
    releaseAdopt = resolve;
  });
  const adoptHandled = new Promise<void>((resolve) => {
    markAdoptHandled = resolve;
  });
  await page.route("**/api/run-events/*/adopt", async (route) => {
    await adoptBarrier;
    await route.continue();
    markAdoptHandled();
  });
  await adopt.click();
  await expect(adopt).toBeDisabled();
  await expect(reject).toBeDisabled();
  releaseAdopt();
  await adoptHandled;
  await expect(page.getByTestId("stage-run-material")).toBeVisible({
    timeout: 5_000,
  });
  await expect(
    page.getByText("Document change adopted", { exact: true }).last(),
  ).toBeVisible();
  await page.unroute("**/api/run-events/*/adopt");
  await selectCurrentWorkflowMaterial(page, "Attempt 1");
  await expect(
    page.getByText("Document adoption in progress", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Document change adopted", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Adopt" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Reject" })).toHaveCount(0);

  await backToQueue(page);
  await openWorkItem(page, "Proposal rejection review");
  await expect(page.getByTestId("proposal-review-workspace")).toBeVisible();
  const rejectAction = page.getByRole("button", { name: "Reject" });
  const adoptAction = page.getByRole("button", { name: "Adopt" });
  let releaseReject = (): void => {};
  let markRejectHandled = (): void => {};
  const rejectBarrier = new Promise<void>((resolve) => {
    releaseReject = resolve;
  });
  const rejectHandled = new Promise<void>((resolve) => {
    markRejectHandled = resolve;
  });
  await page.route("**/api/run-events/*/reject", async (route) => {
    await rejectBarrier;
    await route.continue();
    markRejectHandled();
  });
  await rejectAction.click();
  await expect(rejectAction).toBeDisabled();
  await expect(adoptAction).toBeDisabled();
  releaseReject();
  await rejectHandled;
  await expect(page.getByTestId("stage-run-material")).toBeVisible({
    timeout: 5_000,
  });
  await expect(
    page.getByText("Document change rejected", { exact: true }).last(),
  ).toBeVisible();
  await page.unroute("**/api/run-events/*/reject");

  await backToQueue(page);
  await openWorkItem(page, "Awaiting sign-off");
  const approvalReview = page.getByTestId("review-workspace");
  await expect(approvalReview).toBeVisible();
  await expect(page.getByTestId("workflow-step-summary")).toHaveCount(0);
  await expect(approvalReview).toContainText("Ready for sign-off");
  await expect(approvalReview.getByTestId("review-verdict"))
    .toContainText("Ready for sign-off");
  await expect(approvalReview.getByTestId("signoff-package-hash")).toHaveCount(0);
  await page.getByRole("button", { name: "Context", exact: true }).click();
  const packageHash = page.getByTestId("context-signoff-package-hash");
  await expect(packageHash).toHaveText(/^sha256:[0-9a-f]{64}$/);
  await expect(packageHash).toBeVisible();
  const approvalItem = await workItemForTitle(page, "Awaiting sign-off");
  const observedHash = await packageHash.textContent();
  const closurePath = "/api/work-items/" + approvalItem.id + "/signoff-package/artifacts";
  const exactPath = closurePath + "?expectedPackageHash=" + encodeURIComponent(observedHash!);
  const exactResponse = await page.context().request.get(exactPath);
  expect(exactResponse.status()).toBe(200);
  const exactMembers = ArtifactRefSchema.array().parse(await exactResponse.json());
  expect(exactMembers.every(member => member.workItemId === approvalItem.id)).toBe(true);
  expect(exactMembers.filter(member => member.role === "PLAN")).toHaveLength(1);
  expect(exactMembers.filter(member => member.role === "R3")).toHaveLength(1);
  expect(new Set(exactMembers.map(member => member.id)).size).toBe(exactMembers.length);
  const repeated = await page.context().request.get(exactPath);
  expect(await repeated.json()).toEqual(exactMembers);
  expect((await page.context().request.get(closurePath)).status()).toBe(400);
  expect((await page.context().request.get(closurePath + "?expectedPackageHash=bad")).status()).toBe(400);
  expect((await page.context().request.get(exactPath + "&expectedPackageHash=" + encodeURIComponent(observedHash!))).status()).toBe(400);
  expect((await page.context().request.get(closurePath + "?expectedPackageHash=sha256:" + "0".repeat(64))).status()).toBe(409);
  await expect(page.getByTestId("workflow-step-index")).toHaveCount(0);
  await page.getByRole("button", { name: "Close context", exact: true }).click();

  await approvalReview.getByRole("button", {
    name: "View Implementation plan",
    exact: true,
  }).click();
  await expect(page.getByTestId("markdown-readonly")).toBeVisible();
  await expect(page.getByRole("button", { name: "Back to Approval", exact: true })).toBeVisible();
  await expect(page.getByLabel("Approved by")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Sign off exact package" })).toHaveCount(0);
  await expect(page.getByTestId("document-git-controls")).toHaveCount(0);
  await page.getByRole("button", { name: "Back to Approval", exact: true }).click();

  await approvalReview.getByRole("button", {
    name: "View task 1",
    exact: true,
  }).click();
  const approvalTaskDetail = page.getByTestId("review-workspace");
  await expect(approvalTaskDetail)
    .toContainText("Prove the browser candidate surface");
  await expect(approvalTaskDetail).toContainText("Gates");
  await expect(approvalTaskDetail).toContainText("Scope");
  await expect(approvalTaskDetail).toContainText("Exclusions");
  await expect(approvalTaskDetail).toContainText("Expected change surface");
  await expect(approvalTaskDetail).toContainText("Authority");
  await expect(approvalTaskDetail.getByText("Task id", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Task technical details", exact: true })).toHaveCount(0);
  const approvedBy = page.getByLabel("Approved by");
  const signoff = page.getByRole("button", { name: "Sign off exact package" });
  await expect(approvedBy).toBeVisible();
  await approvedBy.fill("   ");
  await expect(signoff).toBeDisabled();
  await approvedBy.fill("browser-approver");
  await expect(signoff).toBeEnabled();

  let releaseSignoff = (): void => {};
  let markSignoffHandled = (): void => {};
  const signoffBarrier = new Promise<void>((resolve) => {
    releaseSignoff = resolve;
  });
  const signoffHandled = new Promise<void>((resolve) => {
    markSignoffHandled = resolve;
  });
  await page.route("**/api/work-items/*/signoff", async (route) => {
    await signoffBarrier;
    await route.continue();
    markSignoffHandled();
  });
  await signoff.click();
  await expect(signoff).toBeDisabled();
  await expect(page.getByLabel("Approved by")).toBeDisabled();
  releaseSignoff();
  await signoffHandled;
  await page.unroute("**/api/work-items/*/signoff");
  await expect(
    page.getByTestId("workflow-rail")
      .getByRole("button", { name: "Implementation", exact: true }),
  ).toHaveAttribute("aria-current", "step", { timeout: 5_000 });
});

test("historical pre-signoff inspection returns to the current owner before offering current mutations", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  await openWorkItem(page, "Requirements ready after Research");
  await expect(page.getByRole("button", { name: "Start Requirements", exact: true })).toBeVisible();

  await selectWorkflowStep(page, "Research");
  await expect(page.locator(".order-workbench-attention")).toHaveCount(0);
  await expect(page.getByTestId("workflow-step-summary")).toHaveCount(0);
  const returnToRequirements = page.getByRole("button", { name: "Return to Requirements", exact: true });
  await expect(returnToRequirements).toBeVisible();
  await expect(returnToRequirements.locator("..")).not.toContainText("Requirements is ready for your action");
  await expect(page.getByRole("button", { name: "Start Requirements", exact: true })).toHaveCount(0);
});

test("source editor preserves stale buffers, never overwrites newer source, and returns work visibly to R1", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  await openWorkItem(page, "Source editing workbench");
  await expect(page.getByRole("button", { name: "Sign off exact package" })).toBeVisible();
  await selectWorkflowStep(page, "Work request");
  await expect(page.getByRole("button", { name: "Sign off exact package" })).toHaveCount(0);
  const sourceEditor = await openMarkdownEditor(page, "WorkItem source Markdown source");
  const original = await markdownSourceValue(sourceEditor);
  expect(original).toContain("# Source editing workbench");
  expect(original).not.toContain('"formatVersion"');
  await expect(
    page.getByTestId("source-document-material")
      .getByRole("button", { name: "Technical details", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Context", exact: true }).click();
  await expect(page.getByTestId("selected-view-context")).toContainText("Work request");
  await expect(page.getByTestId("selected-view-context")).toContainText("work-request.md");
  await page.getByRole("button", { name: "Close context", exact: true }).click();

  await replaceMarkdownSource(page, sourceEditor, original + "\nlocal unsaved buffer\n");
  await expect(page.getByText("Effect of saving", { exact: true })).toBeVisible();
  await expect(page.getByText(/returns workflow ownership to Research and invalidates affected downstream conformance/)).toBeVisible();
  const item = await workItemForTitle(page, "Source editing workbench");
  const sourceResponse = await page.context().request.get(
    "/api/work-items/" + item.id + "/source",
  );
  expect(sourceResponse.status()).toBe(200);
  const source = WorkItemSourceSnapshotSchema.parse(await sourceResponse.json());
  const sourcePath = join(repositoryRoot, source.path);
  const external = readFileSync(sourcePath, "utf8").replace(
    "# Source editing workbench",
    "# Source editing externally changed",
  );
  writeFileSync(sourcePath, external);
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText(/canonical file changed while this buffer was open/i)).toBeVisible();
  expect(await markdownSourceValue(sourceEditor)).toContain("local unsaved buffer");
  expect(readFileSync(sourcePath, "utf8")).toBe(external);

  await page.getByRole("button", { name: "Reload current" }).click();
  await expect.poll(() => markdownSourceValue(sourceEditor)).toContain("# Source editing externally changed");
  const current = await markdownSourceValue(sourceEditor);

  await replaceMarkdownSource(page, sourceEditor, current + "\nwill be cancelled\n");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByTestId("markdown-document-view")).toBeVisible();
  const reopenedSourceEditor = await openMarkdownEditor(page, "WorkItem source Markdown source");
  await expect.poll(() => markdownSourceValue(reopenedSourceEditor)).toBe(current);

  await replaceMarkdownSource(page, reopenedSourceEditor, current + "\nsaved through browser workbench\n");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect.poll(() => markdownSourceValue(reopenedSourceEditor)).toContain("saved through browser workbench");
  await expect.poll(() => readFileSync(sourcePath, "utf8")).toContain(
    "saved through browser workbench",
  );
  const sourceEditorControls = page.getByTestId("markdown-editor-controls");
  await expect(
    sourceEditorControls.getByRole("button", { name: "Save", exact: true }),
  ).toBeDisabled();

  const workflowRail = page.getByTestId("workflow-rail");
  await expect(
    workflowRail.getByRole("button", { name: "Research" }),
  ).toHaveAttribute("aria-current", "step");
  await expect(page.getByRole("button", { name: "Sign off exact package" })).toHaveCount(0);

  await selectWorkflowStep(page, "Implementation plan");
  await expect(
    workflowRail.getByRole("button", { name: "Research" }),
  ).toHaveAttribute("aria-current", "step");
  await expect(page.getByTestId("markdown-readonly")).toBeVisible();
  await expect(page.getByLabel("Implementation plan document Markdown source")).toHaveCount(0);
});

test("dirty Markdown navigation is explicit, preserves the buffer when cancelled, restores queue focus when discarded, and PLAN/R3 editing remains correct", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  await openWorkItem(page, "Lifecycle editing workbench");

  const workflowMutations: string[] = [];
  page.on("request", (browserRequest) => {
    if (browserRequest.method() !== "GET") {
      workflowMutations.push(browserRequest.method() + " " + new URL(browserRequest.url()).pathname);
    }
  });
  const workflowRail = page.getByTestId("workflow-rail");
  await selectWorkflowStep(page, "Work request");
  await expect(page.getByTestId("source-document-material")).toBeVisible();
  expect(workflowMutations).toEqual([]);

  await selectWorkflowStep(page, "Implementation plan");
  const planEditor = await openMarkdownEditor(page, "Implementation plan document Markdown source");
  const initial = await markdownSourceValue(planEditor);
  await replaceMarkdownSource(page, planEditor, initial + "\nunsaved guard\n");
  await expect(page.getByTestId("document-maturity")).toContainText("Current");
  await expect(page.getByText(/returns workflow ownership to Implementation plan and invalidates affected downstream conformance/)).toBeVisible();

  await page.getByTestId("workflow-rail")
    .getByRole("button", { name: "Approval" })
    .click();
  const workflowGuard = page.getByRole("alertdialog", { name: "Discard unsaved Markdown?" });
  await expect(workflowGuard).toBeVisible();
  await workflowGuard.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect.poll(() => markdownSourceValue(planEditor)).toContain("unsaved guard");
  expect(workflowMutations).toEqual([]);

  await page.getByRole("link", { name: "Back to queue" }).click();
  const guard = page.getByRole("alertdialog", { name: "Discard unsaved Markdown?" });
  await expect(guard).toBeVisible();
  await guard.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect.poll(() => markdownSourceValue(planEditor)).toContain("unsaved guard");

  await page.getByRole("link", { name: "Back to queue" }).click();
  await page.getByRole("alertdialog", { name: "Discard unsaved Markdown?" })
    .getByRole("button", { name: "Discard unsaved changes" })
    .click();
  await expect(page.getByTestId("work-item-queue")).toBeVisible();
  await expect(rowFor(page, "Lifecycle editing workbench")).toBeFocused();

  await openWorkItem(page, "Lifecycle editing workbench");
  await selectWorkflowStep(page, "Readiness review");
  await expect(page.getByTestId("review-workspace")).toBeVisible();
  await expect(page.getByTestId("review-verdict")).toBeVisible();
  await expect(page.getByTestId("markdown-readonly")).toHaveCount(0);
  await expect(page.getByLabel("Readiness review document Markdown source")).toHaveCount(0);

  await selectWorkflowStep(page, "Implementation plan");
  await openMarkdownEditor(page, "Implementation plan document Markdown source");
  const unchangedCancel = page.getByRole("button", { name: "Cancel", exact: true });
  await expect(unchangedCancel).toBeEnabled();
  await unchangedCancel.click();
  await expect(page.getByTestId("markdown-document-view")).toBeVisible();

  const editablePlan = await openMarkdownEditor(page, "Implementation plan document Markdown source");
  const fresh = await markdownSourceValue(editablePlan);
  await replaceMarkdownSource(page, editablePlan, fresh + "\ncancelled plan edit\n");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByTestId("markdown-document-view")).toBeVisible();
  const reopenedPlan = await openMarkdownEditor(
    page,
    "Implementation plan document Markdown source",
  );
  await expect.poll(() => markdownSourceValue(reopenedPlan)).toBe(fresh);

  await replaceMarkdownSource(page, reopenedPlan, fresh + "\nsaved plan edit\n");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  const savedPlan = page.getByLabel("Implementation plan document Markdown source");
  await expect(savedPlan).toBeVisible();

  const currentItem = await workItemForTitle(page, "Lifecycle editing workbench");
  await expect.poll(async () => {
    const artifactsResponse = await page.context().request.get(
      "/api/work-items/" + currentItem.id + "/lifecycle-artifacts",
    );
    if (artifactsResponse.status() !== 200) return "";
    const artifacts = ArtifactRefSchema.array().parse(await artifactsResponse.json());
    const currentPlan = artifacts.find((artifact) => artifact.role === "PLAN");
    if (currentPlan === undefined) return "";
    const contentResponse = await page.context().request.get(
      "/api/artifacts/" + currentPlan.id + "/content",
    );
    return contentResponse.status() === 200 ? await contentResponse.text() : "";
  }).toContain("saved plan edit");
  await expect(page.getByTestId("document-maturity")).toContainText("Updated — validation required");
  await expect(page.getByText("Unsaved", { exact: true })).toHaveCount(0, {
    timeout: 15_000,
  });

  await page.getByRole("button", { name: "Context" }).click();
  await expect(page.getByTestId("selected-view-context")).toContainText("Implementation plan");
  await expect(page.getByTestId("selected-view-context")).toContainText("Governed document");
  await expect(page.getByTestId("selected-view-context")).toContainText("docs/plan.md");
  await expect(page.getByRole("button", { name: "Sign off exact package" })).toHaveCount(0);
});

test("Requirements keeps governed content primary and routes artifact mechanics to Context", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  await openWorkItem(page, "Requirements document visual");
  await expect(page.getByText("Requirements document", { exact: true }).first()).toBeVisible();
  await expect(page.locator('[aria-label="Requirements authority"]')).toHaveCount(0);
  await expect(page.getByText("P3 lifecycle authority", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Technical details", exact: true })).toHaveCount(0);

  await page.getByRole("button", { name: "Context", exact: true }).click();
  const context = page.getByTestId("selected-view-context");
  await expect(context).toContainText("docs/r2.md");
  await expect(context.getByText("Authority layer", { exact: true })).toBeVisible();
  await expect(context.getByText("P3", { exact: true })).toBeVisible();
  await expect(context.getByText("Artifact id", { exact: true })).toBeVisible();
  await expect(context.getByText("Git commit", { exact: true })).toBeVisible();
  const selectedItem = await workItemForTitle(page, "Requirements document visual");
  const response = await page.context().request.get("/api/work-items/" + selectedItem.id + "/lifecycle-artifacts");
  expect(response.ok()).toBe(true);
  const selectedArtifact = ArtifactRefSchema.array().parse(await response.json()).find(artifact => artifact.role === "R2");
  expect(selectedArtifact).toBeDefined();
  await expect(context.getByText(selectedArtifact!.id, { exact: true })).toBeVisible();
  await expect(context.getByText(selectedArtifact!.sha256, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Close context", exact: true }).click();
});

test("invalid lifecycle Markdown stays inspection-only and exact bytes open in the Evidence workspace", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  await openWorkItem(page, "Invalid lifecycle Markdown");
  await selectWorkflowStep(page, "Research");
  await expect(
    page.getByText("Lifecycle document is not canonical editable Markdown", { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Research document Markdown source")).toHaveCount(0);

  await page.getByRole("button", { name: "Inspect exact bytes" }).click();
  await expect(page.getByRole("heading", { name: "Evidence", exact: true })).toBeVisible();
  const exactBytes = page.getByTestId("raw-content-view");
  await expect(exactBytes).toBeVisible();
  await expect(exactBytes).toContainText("invalid lifecycle");
  const codeBlock = exactBytes.locator("pre");
  await expect(codeBlock).toBeVisible();
  const material = page.locator(".order-workbench-surface-material").last();
  const [exactBytesBox, codeBlockBox, materialBox] = await Promise.all([
    exactBytes.boundingBox(),
    codeBlock.boundingBox(),
    material.boundingBox(),
  ]);
  expect(exactBytesBox).not.toBeNull();
  expect(codeBlockBox).not.toBeNull();
  expect(materialBox).not.toBeNull();
  expect(exactBytesBox!.height).toBeGreaterThan(materialBox!.height * 0.6);
  expect(codeBlockBox!.height).toBeGreaterThan(exactBytesBox!.height * 0.9);
});

test("terminal investigation and audit results remain closed and linked remediation offers only CHANGE or DEFECT", async ({
  page,
  request,
}) => {
  await authenticate(page, request);

  await openWorkItem(page, "Completed audit");
  await expect(page.getByTestId("result-workspace")).toContainText("Audit complete");
  await expect(page.getByTestId("result-material")).toContainText(
    "Evidence-backed audit verdict.",
  );
  await expect(page.getByRole("button", { name: "Create linked remediation" })).toBeVisible();
  await backToQueue(page);

  const parent = await workItemForTitle(page, "Completed investigation");
  await openWorkItem(page, "Completed investigation");
  await expect(page.getByTestId("result-workspace")).toContainText("Investigation complete");
  await expect(page.getByTestId("result-material")).toContainText(
    "Evidence-backed conclusion.",
  );
  await selectWorkflowStep(page, "Research");
  await expect(page.getByTestId("markdown-readonly")).toContainText(
    "Evidence-backed conclusion.",
  );
  await expect(page.getByRole("button", { name: "Create linked remediation" })).toHaveCount(0);

  await selectWorkflowStep(page, "Complete");
  await page.getByRole("button", { name: "Create linked remediation" }).click();
  const dialog = page.getByRole("dialog", { name: "Create linked remediation" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Parent");
  await expect(dialog).toContainText("Completed investigation");
  await expect(dialog).toContainText("Completed parent Investigation · same project");
  await expect(dialog).not.toContainText(parent.id);
  await expect(dialog).not.toContainText("investigation-v1");
  await expect(dialog.getByTestId("linked-remediation-project")).toContainText(parent.projectId);
  await expect(dialog.getByRole("combobox", { name: "Project Required" })).toHaveCount(0);
  await expect(dialog.getByRole("radio", { name: "Change" })).toBeVisible();
  await expect(dialog.getByRole("radio", { name: "Defect" })).toBeVisible();
  await expect(dialog.getByRole("radio", { name: "Investigation" })).toHaveCount(0);
  await expect(dialog.getByRole("radio", { name: "Audit" })).toHaveCount(0);
  await expect(dialog.getByRole("button", { name: "Cancel", exact: true })).toBeVisible();

  await dialog.getByRole("radio", { name: "Defect" }).click();
  await dialog.getByLabel("Title").fill("Remediate investigation finding");

  let releaseRemediation = (): void => {};
  let remediationHandled = (): void => {};
  const remediationBarrier = new Promise<void>((resolve) => {
    releaseRemediation = resolve;
  });
  const remediationComplete = new Promise<void>((resolve) => {
    remediationHandled = resolve;
  });
  await page.route("**/api/work-items", async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }
    await remediationBarrier;
    await route.continue();
    remediationHandled();
  });
  const createRemediation = dialog.getByRole("button", { name: "Create linked remediation" });
  await createRemediation.click();
  await expect(createRemediation).toBeDisabled();
  releaseRemediation();
  await remediationComplete;
  await page.unroute("**/api/work-items");

  await expect(page.getByTestId("work-item-heading")).toHaveText("Remediate investigation finding");
  await expect(page.locator(".order-workitem-kind")).toHaveText("Defect");
  const child = await workItemForTitle(page, "Remediate investigation finding");
  expect(child.schemaId).toBe("defect-v2");
  expect(child.projectId).toBe(parent.projectId);
  expect(child.derivedFromWorkItemId).toBe(parent.id);

  const refreshedParent = await workItemForTitle(page, "Completed investigation");
  expect(refreshedParent.stage).toBe("COMPLETE");
  expect(refreshedParent.outcome).toBe("INVESTIGATION_COMPLETE");
});

test("all non-delivery terminal classifications render under Complete without invented remediation", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  for (const [title, outcome] of [
    ["Disproven work", "Disproven"],
    ["Duplicate work", "Duplicate"],
    ["Already satisfied work", "Already satisfied"],
  ] as const) {
    await openWorkItem(page, title);
    await expect(page.getByTestId("result-workspace")).toContainText(outcome);
    await expect(page.getByRole("button", { name: "Create linked remediation" })).toHaveCount(0);
    await backToQueue(page);
  }
});

test("candidate Complete surface and reached Implementation expose V0-V7, exact evidence, and never execute evidence markup", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  await openWorkItem(page, "Verified candidate");

  await expect(page.getByTestId("result-workspace")).toContainText("Verified candidate");
  const completeRail = page.getByTestId("workflow-rail");
  await expect(completeRail.locator('li[data-state="current"][data-tone="success"] .order-workbench-process-marker')).toHaveText("✓");
  await expect(completeRail.getByRole("button", { name: "Complete", exact: true })).toHaveAttribute("aria-current", "step");
  await expect(page.getByTestId("candidate-result-material")).toBeVisible();
  await expect(page.getByRole("button", { name: "Open in Activity" })).toHaveCount(0);

  await selectWorkflowStep(page, "Approval");
  await expect(page.getByTestId("review-workspace"))
    .toContainText("Approved");
  await expect(page.getByTestId("review-workspace"))
    .toContainText("Approval history");
  await expect(page.getByTestId("workflow-step-index")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Sign off exact package" })).toHaveCount(0);
  await page.getByTestId("review-workspace").getByRole("button", {
    name: "View task 1",
    exact: true,
  }).click();
  await expect(page.getByTestId("review-workspace"))
    .toContainText("Prove the browser candidate surface");

  await selectWorkflowStep(page, "Implementation");
  await expect(page.getByTestId("execution-workspace")).toBeVisible();
  for (const authorityLabel of [
    "Requirements",
    "Solution design",
    "Implementation plan",
  ] as const) {
    const authority = page.getByRole("button", {
      name: "Open " + authorityLabel,
      exact: true,
    });
    await authority.scrollIntoViewIfNeeded();
    await authority.click();
    await expect(page.getByRole("heading", { name: "Evidence", exact: true })).toBeVisible();
    await expect(page.locator("textarea")).toHaveCount(0);
    await page.getByRole("button", { name: "Back to workflow context" }).click();
    await expect(page.getByTestId("execution-workspace")).toBeVisible();
  }
  const approvedTasks = page.getByRole("navigation", { name: "Approved tasks" });
  const attempts = approvedTasks.getByRole("list", { name: "Attempts for Prove the browser candidate surface" });
  await expect(attempts).toBeVisible();
  await expect(approvedTasks.getByText("Attempts", { exact: true })).toBeVisible();
  const builderRow = attempts.getByRole("button", { name: /Implementation agent · Attempt 1/ });
  const reviewerRow = attempts.getByRole("button", { name: /Independent review · Attempt 2/ });
  await expect(builderRow.locator('[data-tone="success"]')).toContainText("Completed");
  await expect(reviewerRow.locator('[data-tone="success"]')).toContainText("Completed");
  // Ordinals are task-global; the reviewer must not share the builder's label.
  await expect(attempts.getByRole("button", { name: /Independent review · Attempt 1/ })).toHaveCount(0);
  await expect(attempts.getByRole("button")).toHaveCount(2);
  const rowGeometry = await builderRow.evaluate((button) => {
    const parent = button.closest(".order-workbench-master-attempt-group")?.previousElementSibling;
    if (!(parent instanceof HTMLElement)) throw new Error("Attempt has no visible parent task");
    return { task: parent.getBoundingClientRect().left, attempt: button.getBoundingClientRect().left, taskWidth: parent.getBoundingClientRect().width, attemptWidth: button.getBoundingClientRect().width };
  });
  expect(Math.abs(rowGeometry.task - rowGeometry.attempt)).toBeLessThanOrEqual(1);
  expect(Math.abs(rowGeometry.taskWidth - rowGeometry.attemptWidth)).toBeLessThanOrEqual(1);
  await selectWorkflowMaterial(page, "Implementation agent · Attempt 1");
  await expect(builderRow).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByText("Candidate state recorded", { exact: true }),
  ).toBeVisible();

  await expect(page.getByLabel("Task overview")).toContainText("Recorded boundary: complete");
  await expect(page.getByTestId("validation-matrix")).toContainText("No validation results in this attempt");
  await expect(page.getByTestId("validation-matrix")).not.toContainText("boundary:");
  await selectWorkflowMaterial(page, "Independent review · Attempt 2");
  await expect(page.getByRole("region", { name: "Agent activity" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Agent activity" }))
    .toContainText("Reviewing candidate evidence");
  await expect(page.getByRole("region", { name: "Workflow activity" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Timeline technical details", exact: true }))
    .toHaveCount(0);
  await expect(
    page.getByText("Independent review passed", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Verified candidate recorded", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByTestId("execution-task-detail")
      .getByText("Prove the browser candidate surface", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("textarea")).toHaveCount(0);

  const validation = page.getByTestId("validation-matrix");
  await expect(page.getByLabel("Task overview")).toContainText("Recorded boundary: complete");
  await expect(validation).not.toContainText("boundary:");
  for (const stage of ["V0", "V1", "V2", "V3", "V4", "V5", "V6", "V7"]) {
    await expect(
      validation.getByTestId("validation-stage-" + stage),
    ).toContainText("Passed");
  }

  const reviewEvidence = page
    .locator('[data-evidence-path="review.txt"]')
    .first()
    .getByRole("button", { name: "Evidence: review.txt" });
  await expect(reviewEvidence).toBeVisible();
  await reviewEvidence.scrollIntoViewIfNeeded();
  await reviewEvidence.click();
  await expect(page.getByRole("heading", { name: "Evidence", exact: true })).toBeVisible();
  const raw = page.getByTestId("raw-content-view");
  await expect(raw).toContainText(
    "<script>window.__orderXss=true</script>",
  );
  expect(
    await page.evaluate(() =>
      Object.prototype.hasOwnProperty.call(window, "__orderXss")),
  ).toBe(false);

  await page.getByRole("button", { name: "Back to workflow context" }).click();
  await expect(page.getByTestId("execution-workspace")).toBeVisible();
  await expect(
    page
      .locator('[data-evidence-path="review.txt"]')
      .first()
      .getByRole("button", { name: "Evidence: review.txt" }),
  ).toBeFocused();
});

test("native Acceptance uses one exact current decision and historical round stays read-only", async ({page,request})=>{
  await authenticate(page,request);
  await openWorkItem(page,"Native Acceptance review");
  const rail=page.getByTestId("workflow-rail");
  await expect(rail.getByRole("button",{name:"Acceptance",exact:true})).toHaveAttribute("aria-current","step");
  const workspace=page.getByTestId("workflow-step-workspace");
  await expect(workspace.getByRole("heading",{name:"Acceptance",exact:true})).toBeVisible();
  await expect(workspace.locator("[data-review-section]")).toHaveCount(4);
  await expect(workspace.getByTestId("review-verdict")).toContainText("Verified candidate");
  await expect(workspace.getByRole("button",{name:"Accept candidate",exact:true})).toBeEnabled();
  const criterion=workspace.getByRole("button",{name:"Open criterion",exact:true});
  await expect(criterion).toHaveCount(1);
  await criterion.click();
  await expect(workspace.getByText("Browser fixture lifecycle/specification authority",{exact:false})).toBeVisible();
  await expect(workspace.getByRole("button",{name:"Back to Acceptance",exact:true})).toBeVisible();
  await workspace.getByRole("button",{name:"Back to Acceptance",exact:true}).click();
  await expect(criterion).toBeFocused();
  await workspace.getByRole("button",{name:"Report finding for task",exact:true}).click();
  const reportDialog=page.getByRole("dialog",{name:"Report finding",exact:true});
  await reportDialog.getByLabel("Expected behavior").fill("draft retained");
  await reportDialog.getByRole("button",{name:"Open criterion",exact:true}).click();
  await expect(workspace.getByRole("button",{name:"Back to Acceptance",exact:true})).toBeVisible();
  await workspace.getByRole("button",{name:"Back to Acceptance",exact:true}).click();
  await expect(reportDialog.getByLabel("Expected behavior")).toHaveValue("draft retained");
  await expect(reportDialog.getByRole("button",{name:"Open criterion",exact:true})).toBeFocused();
  await reportDialog.getByRole("button",{name:"Cancel",exact:true}).click();
  await page.getByRole("dialog",{name:"Discard unsaved review form?"}).getByRole("button",{name:"Discard unsaved changes"}).click();
  await expect(reportDialog).toHaveCount(0);
  await workspace.getByRole("button",{name:"Inspect round",exact:true}).click();
  await expect(workspace.getByTestId("review-verdict")).toContainText("Historical review");
  await expect(workspace.getByRole("button",{name:"Accept candidate",exact:true})).toHaveCount(0);
  await expect(workspace.getByRole("button",{name:"Report finding",exact:true})).toHaveCount(0);
  await workspace.getByRole("button",{name:"Return to current review",exact:true}).click();
  await workspace.getByRole("button",{name:"Accept candidate",exact:true}).click();
  const dialog=page.getByRole("dialog",{name:"Accept candidate",exact:true});
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button",{name:"Accept candidate",exact:true})).toBeDisabled();
  await dialog.getByLabel("Your name").fill("Browser QA operator");
  await dialog.getByText("I confirm",{exact:true}).click();
  await expect(dialog.getByRole("button",{name:"Accept candidate",exact:true})).toBeEnabled();
  await dialog.getByRole("button",{name:"Accept candidate",exact:true}).click();
  await expect(rail.getByRole("button",{name:"Complete",exact:true})).toHaveAttribute("aria-current","step");
  await expect(page.getByTestId("candidate-result-material")).toContainText("Accepted by Browser QA operator");
  await selectWorkflowStep(page,"Acceptance");
  await expect(workspace.getByTestId("review-verdict")).toContainText("Accepted candidate");
  await expect(workspace.getByRole("button",{name:"Accept candidate",exact:true})).toHaveCount(0);
});
