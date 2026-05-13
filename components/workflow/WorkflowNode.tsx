"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { LaunchNodeData } from "@/types/workflow";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";

const statusColors: Record<string, string> = {
  idle: "border-zinc-600",
  running: "border-blue-500",
  success: "border-emerald-500",
  warning: "border-amber-500",
  failed: "border-rose-500",
};

export function WorkflowNode({ data, selected }: NodeProps) {
  const { translate } = useI18n();
  const nodeData = data as LaunchNodeData;
  const status = String(nodeData.status ?? "idle");
  const localizedStatus =
    status === "idle"
      ? translate("status.idle")
      : status === "running"
        ? translate("status.running")
        : status === "success"
          ? translate("status.success")
          : status === "warning"
            ? translate("status.warning")
            : status === "failed"
              ? translate("status.failed")
              : status;

  return (
    <div
      className={cn(
        "min-w-[210px] rounded-xl border bg-zinc-900/95 p-3 shadow-xl backdrop-blur",
        statusColors[status] ?? statusColors.idle,
        selected && "ring-2 ring-emerald-400/60"
      )}
    >
      <Handle type="target" position={Position.Left} className="!h-2.5 !w-2.5 !bg-zinc-400" />
      <div className="text-xs uppercase tracking-wide text-zinc-300">{localizedStatus}</div>
      <div className="mt-1 text-sm font-semibold text-zinc-100">{nodeData.label}</div>
      <p className="mt-1 text-xs text-zinc-300">{nodeData.description}</p>
      {nodeData.summary ? <p className="mt-2 text-xs text-zinc-300">{nodeData.summary}</p> : null}
      <Handle type="source" position={Position.Right} className="!h-2.5 !w-2.5 !bg-zinc-400" />
    </div>
  );
}
