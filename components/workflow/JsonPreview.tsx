"use client";

interface Props {
  data: unknown;
  blocked: boolean;
  onExport: () => void;
}

export function JsonPreview({ data, blocked, onExport }: Props) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-100">JSON Preview</h3>
        <button
          type="button"
          onClick={onExport}
          disabled={blocked || !data}
          className="rounded-md border border-zinc-700 px-3 py-1 text-xs text-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Export JSON
        </button>
      </div>
      <pre className="max-h-72 overflow-auto rounded-md bg-black/40 p-3 text-xs text-zinc-200">
        {data ? JSON.stringify(data, null, 2) : "Run workflow to generate structured JSON."}
      </pre>
      {blocked ? <p className="mt-2 text-xs text-rose-400">Export blocked by compliance.</p> : null}
    </div>
  );
}
