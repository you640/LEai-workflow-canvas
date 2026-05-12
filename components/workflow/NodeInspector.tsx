"use client";

import type { WorkflowNode } from "@/types/workflow";

interface Props {
  node: WorkflowNode | null;
  projectType: string;
  dryRun: boolean;
  compliancePassed: boolean;
  canExport: boolean;
  lastRunAt?: string;
}

export function NodeInspector({ node, projectType, dryRun, compliancePassed, canExport, lastRunAt }: Props) {
  if (!node) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <h3 className="text-sm font-semibold text-zinc-100">Launch Summary</h3>
        <div className="mt-3 space-y-2 text-xs text-zinc-300">
          <div>Project type: <span className="text-zinc-100">{projectType}</span></div>
          <div>Dry-run status: <span className="text-emerald-300">{dryRun ? "Active" : "Disabled"}</span></div>
          <div>Compliance status: <span className={compliancePassed ? "text-emerald-300" : "text-rose-300"}>{compliancePassed ? "Passed" : "Pending / Failed"}</span></div>
          <div>Last run: <span className="text-zinc-100">{lastRunAt ? new Date(lastRunAt).toLocaleTimeString() : "Not run yet"}</span></div>
          <div>Export readiness: <span className={canExport ? "text-emerald-300" : "text-zinc-400"}>{canExport ? "Ready" : "Blocked"}</span></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <h3 className="text-sm font-semibold text-zinc-100">{node.data.label}</h3>
      <p className="mt-1 text-xs text-zinc-400">{node.data.description}</p>
      <div className="mt-3 text-xs text-zinc-300">Status: {node.data.status}</div>
      {node.data.summary ? <div className="mt-2 text-xs text-zinc-300">Summary: {node.data.summary}</div> : null}
      <div className="mt-3 text-xs text-zinc-500">Node ID: {node.id}</div>
    </div>
  );
}
