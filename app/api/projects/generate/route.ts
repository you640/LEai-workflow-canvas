import { NextResponse } from "next/server";
import { ProjectLaunchSchema } from "@/lib/schemas/project.schema";
import { buildMockProject } from "@/lib/mock/mock-project";
import { scanProjectPayload } from "@/lib/compliance/wording";
import { safeError } from "@/lib/safe-error";
import type { LaunchBriefInput } from "@/types/workflow";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const brief = body?.brief as LaunchBriefInput | undefined;

    if (!brief) {
      return safeError(400, "brief_missing", "Launch brief is required.");
    }

    const draft = buildMockProject(brief);
    const parsed = ProjectLaunchSchema.safeParse(draft);

    if (!parsed.success) {
      return safeError(422, "project_schema_invalid", "Generated project payload is invalid.");
    }

    const scan = scanProjectPayload(parsed.data);
    const compliance = {
      passed: scan.passed,
      violations: scan.violations,
    };

    return NextResponse.json({
      dryRun: true,
      project: parsed.data,
      compliance,
      canExport: compliance.passed,
      canImport: compliance.passed,
    });
  } catch {
    return safeError(500, "project_generate_failed", "Project generation failed.");
  }
}
