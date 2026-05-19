import type { LaunchBriefInput } from "@/types/workflow";

const INVALID_PLACEHOLDERS = [
  "placeholder",
  "lorem ipsum",
  "example project",
  "test project",
  "demo",
  "tu bude",
];

const GENERIC_CTA = [
  "click here",
  "learn more",
  "start now",
];

function hasPlaceholder(value: string): boolean {
  const lower = value.toLowerCase();
  return INVALID_PLACEHOLDERS.some((p) => lower.includes(p));
}

export function validateLiveBrief(brief: LaunchBriefInput): string[] {
  const errors: string[] = [];
  const required: Array<[keyof LaunchBriefInput, string | undefined]> = [
    ["projectType", brief.projectType],
    ["projectName", brief.projectName],
    ["targetAudience", brief.targetAudience],
    ["goal", brief.goal],
    ["description", brief.description],
    ["preferredTone", brief.preferredTone],
    ["contactEmail", brief.contactEmail],
  ];

  required.forEach(([key, value]) => {
    if (!value || value.trim().length < 3) errors.push(`${String(key)}_required`);
    if (value && hasPlaceholder(value)) errors.push(`${String(key)}_placeholder_forbidden`);
  });

  if (brief.contactEmail && /example\.com$/i.test(brief.contactEmail.trim())) {
    errors.push("contactEmail_example_domain_forbidden");
  }

  if (brief.goal && GENERIC_CTA.some((cta) => brief.goal.toLowerCase().includes(cta))) {
    errors.push("goal_generic_cta_forbidden");
  }

  return Array.from(new Set(errors));
}

