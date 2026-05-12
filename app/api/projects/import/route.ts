import { NextResponse } from "next/server";
import { ProjectLaunchSchema } from "@/lib/schemas/project.schema";
import { importProjectToWordPress } from "@/lib/wp/import-project";
import { scanProjectPayload } from "@/lib/compliance/wording";
import { safeError } from "@/lib/safe-error";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const compliancePassedFromClient = Boolean(body?.compliancePassed);
    const parsed = ProjectLaunchSchema.safeParse(body?.project);

    if (!parsed.success) {
      return safeError(422, "project_schema_invalid", "Project payload is invalid.");
    }

    const scan = scanProjectPayload(parsed.data);
    const compliancePassed = compliancePassedFromClient && scan.passed;

    if (!compliancePassed) {
      return NextResponse.json({
        dryRun: true,
        imported: false,
        canImport: false,
        compliance: { passed: false, violations: Array.from(new Set(scan.violations)) },
        message: "Import blocked because compliance scan failed.",
      });
    }

    const result = await importProjectToWordPress(parsed.data, compliancePassed);

    return NextResponse.json({
      ...result,
      canImport: compliancePassed,
      compliance: { passed: compliancePassed, violations: [] },
    });
  } catch {
    return safeError(500, "project_import_failed", "Project import failed.");
  }
}
