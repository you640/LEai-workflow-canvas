"use client";

import type { TimelineEvent } from "@/types/workflow";

interface Props {
  events: TimelineEvent[];
}

export function ExecutionTimeline({ events }: Props) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <h3 className="text-sm font-semibold text-zinc-100">Execution Log</h3>
      <div className="mt-3 max-h-56 space-y-2 overflow-auto">
        {events.length === 0 ? <p className="text-xs text-zinc-400">Žiadny beh zatiaľ.</p> : null}
        {events.map((event) => (
          <div key={`${event.at}-${event.nodeId}`} className="rounded-md border border-zinc-800 bg-zinc-950 p-2">
            <div className="text-[11px] text-zinc-500">{new Date(event.at).toLocaleTimeString()}</div>
            <div className="text-xs text-zinc-200">{event.nodeLabel}: {event.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
