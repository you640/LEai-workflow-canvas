import { NextResponse } from "next/server";
import { safeError } from "@/lib/safe-error";
import type { LaunchBriefInput } from "@/types/workflow";
import { resolveLocaleFromHeaders } from "@/lib/i18n/server";
import { t } from "@/lib/i18n";
import { generateSourceOfTruthPayload } from "@/lib/launch-studio/generate-source-of-truth-payload";
import { validateSourceOfTruthExport } from "@/lib/launch-studio/validation";
import { validateLiveBrief } from "@/lib/launch-studio/brief-validation";
import { isLiveMode } from "@/lib/launch-studio/mode";

export async function POST(request: Request) {
  const locale = resolveLocaleFromHeaders(request.headers);

  try {
    const body = await request.json();
    const brief = body?.brief as LaunchBriefInput | undefined;

    if (!brief) {
      return safeError(400, "brief_missing", t(locale, "api.briefRequired"));
    }

    const briefErrors = validateLiveBrief(brief);
    if (briefErrors.length > 0) {
      return NextResponse.json(
        {
          errorCode: "brief_validation_failed",
          message: "Live mode requires complete real project inputs.",
          status: 422,
          details: briefErrors,
          mode: isLiveMode() ? "live" : "dry-run",
        },
        { status: 422 }
      );
    }

    const project = generateSourceOfTruthPayload({
      projectType: brief.projectType,
      projectName: brief.projectName,
      targetAudience: brief.targetAudience,
      goal: brief.goal,
      description: brief.description,
      preferredTone: brief.preferredTone,
      contactEmail: brief.contactEmail ?? "",
      targetAmount: brief.targetAmount ?? null,
    });

    const validation = validateSourceOfTruthExport(project);

    return NextResponse.json({
      dryRun: false,
      mode: "live",
      project,
      compliance: project.compliance,
      validation,
      canExport: validation.valid,
      canImport: validation.valid,
    });
  } catch {
    return safeError(500, "project_generate_failed", t(locale, "api.projectGenerationFailed"));
  }
}
