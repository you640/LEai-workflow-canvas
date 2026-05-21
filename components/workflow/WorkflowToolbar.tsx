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
    <div className="flex h-[72px] items-center justify-between border-b border-white/10 bg-black/80 px-5 backdrop-blur-2xl">
      <div className="flex items-center gap-3">
        <div>
          <div className="text-xs font-medium text-zinc-500">{translate("app.brandTop")}</div>
          <div className="text-base font-semibold tracking-tight text-white">{translate("app.brandName")}</div>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-zinc-300 backdrop-blur-xl">
          {translate("app.badge")}
        </span>
        {dryRun ? (
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-emerald-300 backdrop-blur-xl">
            {translate("app.dryRunMode")}
          </span>
        ) : (
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-emerald-300 backdrop-blur-xl">LIVE</span>
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
          className="w-52 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-zinc-100 transition-colors hover:border-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
          aria-label={translate("app.workflowNameLabel")}
        />

        <label className="sr-only" htmlFor="language-switcher">
          {translate("common.language")}
        </label>
        <select
          id="language-switcher"
          value={locale}
          onChange={(e) => setLocale(e.target.value as "en" | "sk")}
          className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-zinc-100 transition-colors hover:border-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
          aria-label={translate("common.language")}
        >
          <option value="sk">{translate("common.slovak")}</option>
          <option value="en">{translate("common.english")}</option>
        </select>

        <button type="button" aria-label={translate("common.addNode")} className="rounded-xl border border-white/10 bg-white/[0.035] p-2.5 text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25" onClick={onAddNode} title={translate("common.addNode")}>
          <Plus className="h-4 w-4" />
        </button>
        <button type="button" aria-label={translate("common.save")} className="rounded-xl border border-white/10 bg-white/[0.035] p-2.5 text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25" onClick={onSave} title={translate("common.save")}>
          <Save className="h-4 w-4" />
        </button>
        <button type="button" aria-label={translate("common.load")} className="rounded-xl border border-white/10 bg-white/[0.035] p-2.5 text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25" onClick={onLoad} title={translate("common.load")}>
          <FolderOpen className="h-4 w-4" />
        </button>
        <button type="button" aria-label={translate("common.resetWorkflow")} className="rounded-xl border border-white/10 bg-white/[0.035] p-2.5 text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25" onClick={onReset} title={translate("common.resetWorkflow")}>
          <RotateCcw className="h-4 w-4" />
        </button>
        <button type="button" aria-label={translate("common.codeJsonView")} className="rounded-xl border border-white/10 bg-white/[0.035] p-2.5 text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25" onClick={onToggleJson} title={translate("common.codeJsonView")}>
          <Code2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label={translate("common.exportJson")}
          className="rounded-xl border border-white/10 bg-white/[0.035] p-2.5 text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 disabled:opacity-40"
          onClick={onExport}
          disabled={!canExport}
          title={translate("common.exportJson")}
        >
          <Download className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label={translate("common.improvePrompt")}
          className="rounded-xl border border-white/10 bg-white/[0.035] p-2.5 text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 disabled:opacity-40"
          onClick={onMagicPrompt}
          disabled={isGeneratingPrompt}
          title={isGeneratingPrompt ? translate("app.magicPromptRunning") : translate("common.improvePrompt")}
        >
          <WandSparkles className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="ml-2 rounded-2xl bg-zinc-50 px-5 py-2.5 text-sm font-semibold text-black shadow-[0_18px_45px_rgba(255,255,255,0.12)] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-40"
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
