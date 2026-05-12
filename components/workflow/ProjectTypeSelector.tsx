"use client";

import type { ProjectType } from "@/types/workflow";

interface Props {
  value: ProjectType;
  onChange: (value: ProjectType) => void;
}

const OPTIONS: Array<{ value: ProjectType; label: string }> = [
  { value: "business", label: "Business landing page" },
  { value: "saas", label: "SaaS landing page" },
  { value: "booking", label: "Booking page" },
  { value: "product-launch", label: "Product launch page" },
  { value: "support-campaign", label: "Support Campaign" },
  { value: "personal-brand", label: "Personal brand page" },
];

export function ProjectTypeSelector({ value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ProjectType)}
      className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
    >
      {OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
