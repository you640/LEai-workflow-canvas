"use client";

import type { ProjectType } from "@/types/workflow";
import { useI18n } from "@/lib/i18n/client";

interface Props {
  value: ProjectType;
  onChange: (value: ProjectType) => void;
  id?: string;
  ariaLabel?: string;
}

const OPTIONS: Array<{ value: ProjectType; labelKey: `projectTypes.${ProjectType}` }> = [
  { value: "business", labelKey: "projectTypes.business" },
  { value: "saas", labelKey: "projectTypes.saas" },
  { value: "booking", labelKey: "projectTypes.booking" },
  { value: "product-launch", labelKey: "projectTypes.product-launch" },
  { value: "support-campaign", labelKey: "projectTypes.support-campaign" },
  { value: "personal-brand", labelKey: "projectTypes.personal-brand" },
];

export function ProjectTypeSelector({ value, onChange, id, ariaLabel }: Props) {
  const { translate } = useI18n();

  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value as ProjectType)}
      className="h-9 w-full rounded-lg border border-zinc-700/90 bg-zinc-950/90 px-3 text-xs text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 xl:h-10 xl:rounded-md xl:text-sm"
      aria-label={ariaLabel}
    >
      {OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {translate(opt.labelKey)}
        </option>
      ))}
    </select>
  );
}
