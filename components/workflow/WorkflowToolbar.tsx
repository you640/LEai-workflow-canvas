"use client";

import { Play, Save, FolderOpen, RotateCcw, Code2, Plus, Download, WandSparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";

interface Props {
  workflowName: string;
  onWorkflowNameChange: (name: string) => void;
  onRun: () => void;
  onSave: () => void;
  onLoad: () => void;
  onReset: () => void;
  onAddNode: () => void;
  onToggleJson: () => void;
  onMagicPrompt: () => void;
  onExport: () => void;
  isRunning: boolean;
  dryRun: boolean;
  canExport: boolean;
  isGeneratingPrompt?: boolean;
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
  onMagicPrompt,
  onExport,
  isRunning,
  dryRun,
  canExport,
  isGeneratingPrompt = false,
}: Props) {
  const { locale, setLocale, translate } = useI18n();

  return (
    <div className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4">
      <div className="flex items-center gap-3">
        <div>
          <div className="text-xs text-zinc-500">{translate("app.brandTop")}</div>
          <div className="text-sm font-semibold text-zinc-100">{translate("app.brandName")}</div>
        </div>
        <span className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-[11px] text-zinc-300">{translate("app.badge")}</span>
        {dryRun ? (
          <span className="rounded-md border border-emerald-700/60 bg-emerald-950/40 px-2 py-1 text-[11px] text-emerald-300">
            {translate("app.dryRunMode")}
          </span>
        ) : (
          <span className="rounded-md border border-sky-600/70 bg-sky-950/40 px-2 py-1 text-[11px] text-sky-300">LIVE</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor="workflow-name-input">
          {translate("app.workflowNameLabel")}
        </label>
        <input
          id="workflow-name-input"
          value={workflowName}
          onChange={(e) => onWorkflowNameChange(e.target.value)}
          className="w-48 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-100"
          aria-label={translate("app.workflowNameLabel")}
        />

        <label className="sr-only" htmlFor="language-switcher">
          {translate("common.language")}
        </label>
        <select
          id="language-switcher"
          value={locale}
          onChange={(e) => setLocale(e.target.value as "en" | "sk")}
          className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-100"
          aria-label={translate("common.language")}
        >
          <option value="sk">{translate("common.slovak")}</option>
          <option value="en">{translate("common.english")}</option>
        </select>

        <button type="button" aria-label={translate("common.addNode")} className="rounded-md border border-zinc-700 p-2 text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70" onClick={onAddNode} title={translate("common.addNode")}>
          <Plus className="h-4 w-4" />
        </button>
        <button type="button" aria-label={translate("common.save")} className="rounded-md border border-zinc-700 p-2 text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70" onClick={onSave} title={translate("common.save")}>
          <Save className="h-4 w-4" />
        </button>
        <button type="button" aria-label={translate("common.load")} className="rounded-md border border-zinc-700 p-2 text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70" onClick={onLoad} title={translate("common.load")}>
          <FolderOpen className="h-4 w-4" />
        </button>
        <button type="button" aria-label={translate("common.resetWorkflow")} className="rounded-md border border-zinc-700 p-2 text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70" onClick={onReset} title={translate("common.resetWorkflow")}>
          <RotateCcw className="h-4 w-4" />
        </button>
        <button type="button" aria-label={translate("common.codeJsonView")} className="rounded-md border border-zinc-700 p-2 text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70" onClick={onToggleJson} title={translate("common.codeJsonView")}>
          <Code2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label={translate("common.exportJson")}
          className="rounded-md border border-zinc-700 p-2 text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 disabled:opacity-40"
          onClick={onExport}
          disabled={!canExport}
          title={translate("common.exportJson")}
        >
          <Download className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label={translate("common.improvePrompt")}
          className="rounded-md border border-zinc-700 p-2 text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
          onClick={onMagicPrompt}
          disabled={isGeneratingPrompt}
          title={isGeneratingPrompt ? translate("app.magicPromptRunning") : translate("common.improvePrompt")}
        >
          <WandSparkles className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="ml-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:opacity-40"
          onClick={onRun}
          disabled={isRunning}
        >
          <span className="inline-flex items-center gap-2">
            <Play className="h-4 w-4" /> {isRunning ? translate("common.running") : translate("common.run")}
          </span>
        </button>
      </div>
    </div>
  );
}
