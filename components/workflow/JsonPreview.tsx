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
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-100">{translate("jsonPreview.title")}</h3>
        <button
          type="button"
          onClick={onExport}
          disabled={blocked || !data}
          className="rounded-md border border-zinc-700 px-3 py-1 text-xs text-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {translate("common.exportJson")}
        </button>
      </div>
      <p className="mb-1 text-[11px] text-zinc-400">{translate("jsonPreview.metaboxNotice")}</p>
      <p className="mb-2 text-[11px] text-zinc-500">{translate("jsonPreview.dryRunNotice")}</p>
      <div className="mb-3 rounded-lg border border-emerald-900/50 bg-emerald-950/20 p-3 text-[11px] text-emerald-100">
        <div className="font-semibold text-emerald-200">{translate("jsonPreview.storageTitle")}</div>
        <p className="mt-1 text-emerald-100/80">{translate("jsonPreview.storageBody")}</p>
        {lastSavedAt ? (
          <p className="mt-1 text-emerald-200">
            {translate("jsonPreview.storageSaved")}: {lastSavedAt}
          </p>
        ) : null}
      </div>
      <pre className="max-h-72 overflow-auto rounded-md bg-black/40 p-3 text-xs text-zinc-200">
        {previewPayload ? JSON.stringify(previewPayload, null, 2) : translate("jsonPreview.empty")}
      </pre>
      <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 text-[11px] text-zinc-300">
        <div className="font-semibold text-zinc-100">{translate("jsonPreview.nextTitle")}</div>
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
