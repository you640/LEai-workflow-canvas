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
      className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
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
