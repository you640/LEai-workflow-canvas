import type { LaunchBriefInput } from "@/types/workflow";
import type { Locale } from "@/lib/i18n";
import type { SourceOfTruthExport } from "@/lib/launch-studio/source-of-truth-schema";
import { generateSourceOfTruthPayload } from "@/lib/launch-studio/generate-source-of-truth-payload";

export function buildMockProject(brief: LaunchBriefInput, _locale: Locale = "sk"): SourceOfTruthExport {
  return generateSourceOfTruthPayload({
    projectType: brief.projectType,
    projectName: brief.projectName,
    targetAudience: brief.targetAudience,
    goal: brief.goal,
    description: brief.description,
    preferredTone: brief.preferredTone,
    contactEmail: brief.contactEmail ?? "",
    targetAmount: brief.targetAmount ?? null,
  });
}
