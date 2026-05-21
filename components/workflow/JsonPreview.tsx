"use client";

import { useI18n } from "@/lib/i18n/client";

interface Props {
  data: unknown;
  blocked: boolean;
  onExport: () => void;
  lastSavedAt?: string;
}

export function JsonPreview({ data, blocked, onExport, lastSavedAt }: Props) {
  const { translate } = useI18n();
  const previewPayload =
    data && typeof data === "object" && "wordpress" in (data as Record<string, unknown>)
      ? {
          dryRun: (data as Record<string, unknown>).dryRun,
          productionWrite: (data as Record<string, unknown>).productionWrite,
          sourceOfTruth: (data as Record<string, unknown>).sourceOfTruth,
          wordpress: (data as Record<string, unknown>).wordpress,
          seo: (data as Record<string, unknown>).seo,
          faq: (data as Record<string, unknown>).faq,
          compliance: (data as Record<string, unknown>).compliance,
        }
      : data;

  return (
    <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.035] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_20px_70px_rgba(0,0,0,0.4)] backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-tight text-white">{translate("jsonPreview.title")}</h3>
        <button
          type="button"
          onClick={onExport}
          disabled={blocked || !data}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-200 transition-colors hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {translate("common.exportJson")}
        </button>
      </div>

      <p className="mb-1 text-[11px] leading-relaxed text-zinc-400">{translate("jsonPreview.metaboxNotice")}</p>
      <p className="mb-3 text-[11px] leading-relaxed text-zinc-500">{translate("jsonPreview.dryRunNotice")}</p>
      <div className="mb-4 rounded-2xl border border-white/10 bg-black/35 p-4 text-[11px] text-zinc-300">
        <div className="font-semibold text-emerald-200">{translate("jsonPreview.storageTitle")}</div>
        <p className="mt-1 leading-relaxed text-zinc-400">{translate("jsonPreview.storageBody")}</p>

        {lastSavedAt ? (
          <p className="mt-1 text-emerald-200">
            {translate("jsonPreview.storageSaved")}: {lastSavedAt}
          </p>
        ) : null}
      </div>

      <pre className="max-h-72 overflow-auto rounded-2xl border border-white/10 bg-black/45 p-4 text-xs text-zinc-300">
        {previewPayload ? JSON.stringify(previewPayload, null, 2) : translate("jsonPreview.empty")}
      </pre>
      <div className="mt-4 rounded-2xl border border-white/10 bg-black/35 p-4 text-[11px] text-zinc-300">
        <div className="font-semibold text-white">{translate("jsonPreview.nextTitle")}</div>

        <ol className="mt-2 list-decimal space-y-1 pl-4">
          <li>{translate("jsonPreview.nextStepExport")}</li>
          <li>{translate("jsonPreview.nextStepDryRun")}</li>
          <li>{translate("jsonPreview.nextStepWordPress")}</li>
        </ol>
      </div>
      {blocked ? <p className="mt-2 text-xs text-rose-400">{translate("jsonPreview.blocked")}</p> : null}
    </div>
  );
}
