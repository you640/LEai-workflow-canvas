"use client";

import type { WorkflowNode } from "@/types/workflow";
import { useI18n } from "@/lib/i18n/client";

interface Props {
  node: WorkflowNode | null;
  projectType: string;
  dryRun: boolean;
  compliancePassed: boolean;
  canExport: boolean;
  lastRunAt?: string;
}

export function NodeInspector({ node, projectType, dryRun, compliancePassed, canExport, lastRunAt }: Props) {
  const { locale, translate } = useI18n();

  const statusLabel = (status?: string) => {
    if (!status) return "";
    if (status === "idle") return translate("status.idle");
    if (status === "running") return translate("status.running");
    if (status === "success") return translate("status.success");
    if (status === "warning") return translate("status.warning");
    if (status === "failed") return translate("status.failed");
    return status;
  };

  if (!node) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <h3 className="text-sm font-semibold text-zinc-100">{translate("inspector.launchSummary")}</h3>
        <div className="mt-3 space-y-2 text-xs text-zinc-300">
          <div>
            {translate("inspector.projectType")}: <span className="text-zinc-100">{projectType}</span>
          </div>
          <div>
            {translate("inspector.dryRunStatus")}: <span className="text-emerald-300">{dryRun ? translate("inspector.active") : translate("inspector.disabled")}</span>
          </div>
          <div>
            {translate("inspector.complianceStatus")}: <span className={compliancePassed ? "text-emerald-300" : "text-rose-300"}>{compliancePassed ? translate("inspector.passed") : translate("inspector.pendingFailed")}</span>
          </div>
          <div>
            {translate("inspector.lastRun")}: <span className="text-zinc-100">{lastRunAt ? new Date(lastRunAt).toLocaleTimeString(locale) : translate("inspector.notRunYet")}</span>
          </div>
          <div>
            {translate("inspector.exportReadiness")}: <span className={canExport ? "text-emerald-300" : "text-zinc-300"}>{canExport ? translate("inspector.ready") : translate("inspector.blocked")}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <h3 className="text-sm font-semibold text-zinc-100">{node.data.label}</h3>
      <p className="mt-1 text-xs text-zinc-300">{node.data.description}</p>
      <div className="mt-3 text-xs text-zinc-300">{translate("inspector.status")}: {statusLabel(node.data.status)}</div>
      {node.data.summary ? <div className="mt-2 text-xs text-zinc-300">{translate("inspector.summary")}: {node.data.summary}</div> : null}
      <div className="mt-3 text-xs text-zinc-400">{translate("inspector.nodeId")}: {node.id}</div>
    </div>
  );
}
