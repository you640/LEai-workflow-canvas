import en from "@/messages/en.json";
import sk from "@/messages/sk.json";

export const locales = ["en", "sk"] as const;
export type Locale = (typeof locales)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "rd_locale";

export const messages = { en, sk } as const;
export type Messages = typeof en;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isLocale(value: string | null | undefined): value is Locale {
  return Boolean(value && locales.includes(value as Locale));
}

export function getMessages(locale: Locale): Messages {
  return messages[locale];
}

export function resolvePath(obj: unknown, path: string): string {
  const parts = path.split(".");
  let current: unknown = obj;

  for (const part of parts) {
    if (!isRecord(current) || !(part in current)) {
      return path;
    }
    current = current[part];
  }

  return typeof current === "string" ? current : path;
}

export type TranslationKey =
  | "meta.title"
  | "meta.description"
  | "common.language"
  | "common.english"
  | "common.slovak"
  | "common.save"
  | "common.load"
  | "common.run"
  | "common.running"
  | "common.addNode"
  | "common.resetWorkflow"
  | "common.codeJsonView"
  | "common.exportJson"
  | "common.magicPrompt"
  | "common.improvePrompt"
  | "common.themeToggle"
  | "common.generate"
  | "common.preview"
  | "common.share"
  | "app.brandTop"
  | "app.brandName"
  | "app.badge"
  | "app.dryRunMode"
  | "app.headline"
  | "app.subheadline"
  | "app.workflowName"
  | "app.loading"
  | "app.workflowNameLabel"
  | "app.projectType"
  | "app.projectName"
  | "app.targetAudience"
  | "app.goal"
  | "app.description"
  | "app.preferredTone"
  | "app.contactEmail"
  | "app.prepareWpImport"
  | "app.realImportDisabled"
  | "app.complianceViolations"
  | "app.validationErrors"
  | "app.importResponseReceived"
  | "app.workflowSaved"
  | "app.workflowLoaded"
  | "app.workflowRunFailed"
  | "app.exportPrepared"
  | "app.magicPromptRunning"
  | "app.magicPromptMissingProjectName"
  | "app.magicPromptPreparing"
  | "app.magicPromptFallback"
  | "app.magicPromptSuccess"
  | "app.magicPromptError"
  | "app.mobileActionBarLabel"
  | "app.customStepLabel"
  | "app.customStepDescription"
  | "projectTypes.business"
  | "projectTypes.saas"
  | "projectTypes.booking"
  | "projectTypes.product-launch"
  | "projectTypes.support-campaign"
  | "projectTypes.personal-brand"
  | "inspector.launchSummary"
  | "inspector.projectType"
  | "inspector.dryRunStatus"
  | "inspector.active"
  | "inspector.disabled"
  | "inspector.complianceStatus"
  | "inspector.passed"
  | "inspector.pendingFailed"
  | "inspector.lastRun"
  | "inspector.notRunYet"
  | "inspector.exportReadiness"
  | "inspector.ready"
  | "inspector.blocked"
  | "inspector.status"
  | "inspector.summary"
  | "inspector.nodeId"
  | "timeline.title"
  | "timeline.empty"
  | "jsonPreview.title"
  | "jsonPreview.metaboxNotice"
  | "jsonPreview.dryRunNotice"
  | "jsonPreview.empty"
  | "jsonPreview.blocked"
  | "jsonPreview.storageTitle"
  | "jsonPreview.storageBody"
  | "jsonPreview.storageSaved"
  | "jsonPreview.nextTitle"
  | "jsonPreview.nextStepExport"
  | "jsonPreview.nextStepDryRun"
  | "jsonPreview.nextStepWordPress"
  | "status.idle"
  | "status.running"
  | "status.success"
  | "status.warning"
  | "status.failed"
  | "api.briefRequired"
  | "api.projectInvalid"
  | "api.generatedProjectInvalid"
  | "api.projectGenerationFailed"
  | "api.projectImportFailed"
  | "api.workflowNotFound"
  | "api.workflowExecutionFailed"
  | "api.importBlockedCompliance"
  | "runner.nodeStarted"
  | "runner.complianceBlocked"
  | "runner.skippedCompliance"
  | "runner.previewGenerated"
  | "runner.completed"
  | "runner.executionFailed"
  | "runner.skippedNodeFailure"
  | "mock.defaultProjectName"
  | "mock.defaultAudience"
  | "mock.defaultGoal"
  | "mock.defaultDescription"
  | "mock.defaultTone"
  | "nodes.project-type.label"
  | "nodes.project-type.description"
  | "nodes.launch-brief.label"
  | "nodes.launch-brief.description"
  | "nodes.scope-guard.label"
  | "nodes.scope-guard.description"
  | "nodes.strategy-agent.label"
  | "nodes.strategy-agent.description"
  | "nodes.copy-agent.label"
  | "nodes.copy-agent.description"
  | "nodes.structure-agent.label"
  | "nodes.structure-agent.description"
  | "nodes.template-selector.label"
  | "nodes.template-selector.description"
  | "nodes.seo-agent.label"
  | "nodes.seo-agent.description"
  | "nodes.preview-builder.label"
  | "nodes.preview-builder.description"
  | "nodes.wordpress-adapter.label"
  | "nodes.wordpress-adapter.description"
  | "nodes.qa-audit.label"
  | "nodes.qa-audit.description"
  | "nodes.launch-pack.label"
  | "nodes.launch-pack.description";

export function t(locale: Locale, key: TranslationKey): string {
  return resolvePath(getMessages(locale), key);
}
