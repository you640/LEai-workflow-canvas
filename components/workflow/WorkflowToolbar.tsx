"use client";

import { Moon, Sun, Play, Save, FolderOpen, RotateCcw, Code2, Plus, Download } from "lucide-react";
import { useTheme } from "next-themes";

interface Props {
  workflowName: string;
  onWorkflowNameChange: (name: string) => void;
  onRun: () => void;
  onSave: () => void;
  onLoad: () => void;
  onReset: () => void;
  onAddNode: () => void;
  onToggleJson: () => void;
  onExport: () => void;
  isRunning: boolean;
  dryRun: boolean;
  canExport: boolean;
}

export function WorkflowToolbar({
  workflowName,
  onWorkflowNameChange,
  onRun,
  onSave,
  onLoad,
  onReset,
  onAddNode,
  onToggleJson,
  onExport,
  isRunning,
  dryRun,
  canExport,
}: Props) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <div className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4">
      <div className="flex items-center gap-3">
        <div>
          <div className="text-xs text-zinc-500">Web do 24h</div>
          <div className="text-sm font-semibold text-zinc-100">Rubberduck Launch Studio</div>
        </div>
        <span className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-[11px] text-zinc-300">
          Launch Studio
        </span>
        {dryRun ? (
          <span className="rounded-md border border-emerald-700/60 bg-emerald-950/40 px-2 py-1 text-[11px] text-emerald-300">
            Dry-run mode
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <input
          value={workflowName}
          onChange={(e) => onWorkflowNameChange(e.target.value)}
          className="w-48 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-100"
          aria-label="Workflow name"
        />
        <button className="rounded-md border border-zinc-700 p-2 text-zinc-200" onClick={onAddNode} title="Add node">
          <Plus className="h-4 w-4" />
        </button>
        <button className="rounded-md border border-zinc-700 p-2 text-zinc-200" onClick={onSave} title="Save">
          <Save className="h-4 w-4" />
        </button>
        <button className="rounded-md border border-zinc-700 p-2 text-zinc-200" onClick={onLoad} title="Load">
          <FolderOpen className="h-4 w-4" />
        </button>
        <button className="rounded-md border border-zinc-700 p-2 text-zinc-200" onClick={onReset} title="Reset workflow">
          <RotateCcw className="h-4 w-4" />
        </button>
        <button className="rounded-md border border-zinc-700 p-2 text-zinc-200" onClick={onToggleJson} title="Code/JSON view">
          <Code2 className="h-4 w-4" />
        </button>
        <button
          className="rounded-md border border-zinc-700 p-2 text-zinc-200 disabled:opacity-40"
          onClick={onExport}
          disabled={!canExport}
          title="Export JSON"
        >
          <Download className="h-4 w-4" />
        </button>
        <button
          className="rounded-md border border-zinc-700 p-2 text-zinc-200"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          title="Theme toggle"
        >
          {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <button
          className="ml-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
          onClick={onRun}
          disabled={isRunning}
        >
          <span className="inline-flex items-center gap-2"> <Play className="h-4 w-4" /> {isRunning ? "Running..." : "Run Workflow"}</span>
        </button>
      </div>
    </div>
  );
}
