"use client";

import type { WorkflowNode } from "@/types/workflow";

interface Props {
  node: WorkflowNode | null;
}

export function NodeInspector({ node }: Props) {
  if (!node) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-400">
        Vyber uzol pre detail.
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
