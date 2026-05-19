import type { ProjectLaunch } from "@/lib/schemas/project.schema";
import { ProjectLaunchSchema, REQUIRED_SECTION_IDS } from "@/lib/schemas/project.schema";

export const PLACEHOLDER_PATTERNS = [
  "Krátke vysvetlenie hodnoty",
  "Hlavné prínosy",
  "Tri až štyri kroky",
  "Balíky alebo varianty",
  "Najčastejšie otázky",
  "Tu bude",
  "Placeholder",
  "Lorem ipsum",
] as const;

export interface LaunchValidationResult {
  valid: boolean;
  errors: string[];
}

function hasPlaceholder(text: string): boolean {
  const lower = text.toLowerCase();
  return PLACEHOLDER_PATTERNS.some((phrase) => lower.includes(phrase.toLowerCase()));
}

export function validateLaunchStudioPayload(payload: unknown, input?: { explicitTargetAmount?: boolean }): LaunchValidationResult {
  const parsed = ProjectLaunchSchema.safeParse(payload);
  if (!parsed.success) {
    return { valid: false, errors: ["schema_validation_failed"] };
  }

  const data = parsed.data as ProjectLaunch;
  const errors: string[] = [];

  if (data.project.name === data.project.type) errors.push("project_name_equals_project_type");
  if (data.project.name.toLowerCase() === "support-campaign") errors.push("project_name_is_support_campaign");
  if (data.page.headline.toLowerCase().includes("support-campaign")) errors.push("headline_contains_project_type_literal");

  if (data.page.sections.length < 7) errors.push("sections_less_than_7");

  for (const required of REQUIRED_SECTION_IDS) {
    if (!data.page.sections.find((s) => s.id === required)) {
      errors.push(`missing_section_${required}`);
    }
  }

  for (const sec of data.page.sections) {
    if (hasPlaceholder(sec.body) || hasPlaceholder(sec.title)) {
      errors.push(`placeholder_in_section_${sec.id}`);
    }
  }

  if (!data.seo.title) errors.push("seo_title_missing");
  if (!data.seo.description) errors.push("seo_description_missing");
  if (data.faq.length < 4) errors.push("faq_less_than_4");

  if (!data.compliance || data.compliance.passed !== true) errors.push("compliance_not_passed");
  if (!Array.isArray(data.compliance?.violations) || data.compliance.violations.length !== 0) errors.push("compliance_violations_not_empty");

  if (!Array.isArray(data.technicalRecommendations) || data.technicalRecommendations.length === 0) errors.push("technical_recommendations_missing");
  if (!Array.isArray(data.securityRecommendations) || data.securityRecommendations.length === 0) errors.push("security_recommendations_missing");
  if (!Array.isArray(data.antiPatterns) || data.antiPatterns.length === 0) errors.push("anti_patterns_missing");
  if (!Array.isArray(data.wordpressImportNotes) || data.wordpressImportNotes.length === 0) errors.push("wordpress_import_notes_missing");

  if (data.productionWrite !== false) errors.push("production_write_must_be_false");
  if (data.wordpressPostId !== null) errors.push("wordpress_post_id_must_be_null");

  if (data.project.type === "support-campaign") {
    const hasTarget = Object.prototype.hasOwnProperty.call(data.supportCampaign ?? {}, "targetAmount") && data.supportCampaign?.targetAmount != null;
    if (hasTarget && !input?.explicitTargetAmount) {
      errors.push("support_target_amount_present_without_explicit_input");
    }
  }

  return { valid: errors.length === 0, errors };
}
