"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { LaunchNodeData } from "@/types/workflow";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";

const statusColors: Record<string, string> = {
  idle: "border-white/10",
  running: "border-sky-400/45",
  success: "border-emerald-400/45",
  warning: "border-amber-400/45",
  failed: "border-rose-400/45",
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
        "min-w-[230px] rounded-2xl border bg-black/75 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.045),0_22px_70px_rgba(0,0,0,0.42)] backdrop-blur-xl",
        statusColors[status] ?? statusColors.idle,
        selected && "ring-2 ring-white/25"
      )}
    >
      <Handle type="target" position={Position.Left} className="!h-2.5 !w-2.5 !border !border-white/30 !bg-black" />
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">{localizedStatus}</div>
      <div className="mt-2 text-sm font-semibold text-white">{nodeData.label}</div>
      <p className="mt-1 text-xs font-light leading-relaxed text-zinc-400">{nodeData.description}</p>
      {nodeData.summary ? <p className="mt-3 text-xs leading-relaxed text-zinc-400">{nodeData.summary}</p> : null}
      <Handle type="source" position={Position.Right} className="!h-2.5 !w-2.5 !border !border-white/30 !bg-black" />
    </div>
  );
}
