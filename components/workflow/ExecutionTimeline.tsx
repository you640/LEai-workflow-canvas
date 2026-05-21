"use client";

import type { TimelineEvent } from "@/types/workflow";
import { useI18n } from "@/lib/i18n/client";

interface Props {
  events: TimelineEvent[];
}

export function ExecutionTimeline({ events }: Props) {
  const { locale, translate } = useI18n();

  return (
    <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.035] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_20px_70px_rgba(0,0,0,0.4)] backdrop-blur-xl">
      <h3 className="text-sm font-semibold tracking-tight text-white">{translate("timeline.title")}</h3>
      <div className="mt-4 max-h-56 space-y-2 overflow-auto">
        {events.length === 0 ? <p className="text-xs text-zinc-400">{translate("timeline.empty")}</p> : null}
        {events.map((event) => (
          <div key={`${event.at}-${event.nodeId}`} className="rounded-2xl border border-white/10 bg-black/35 p-3">
            <div className="text-[11px] text-zinc-500">{new Date(event.at).toLocaleTimeString(locale)}</div>
            <div className="mt-1 text-xs leading-relaxed text-zinc-300">{event.nodeLabel}: {event.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
