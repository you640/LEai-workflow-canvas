import { NextResponse } from "next/server";
import { safeError } from "@/lib/safe-error";
import { resolveLocaleFromHeaders } from "@/lib/i18n/server";
import { t } from "@/lib/i18n";
import { SourceOfTruthExportSchema } from "@/lib/launch-studio/source-of-truth-schema";
import { validateSourceOfTruthExport } from "@/lib/launch-studio/validation";
import { isLiveMode } from "@/lib/launch-studio/mode";

export async function POST(request: Request) {
  const locale = resolveLocaleFromHeaders(request.headers);

  try {
    const body = await request.json();
    const compliancePassedFromClient = Boolean(body?.compliancePassed);
    const parsed = SourceOfTruthExportSchema.safeParse(body?.project);

    if (!parsed.success) {
      return safeError(422, "project_schema_invalid", t(locale, "api.projectInvalid"));
    }

    const validation = validateSourceOfTruthExport(parsed.data);
    const compliancePassed = compliancePassedFromClient && parsed.data.compliance.passed;

    if (!compliancePassed || !validation.valid) {
      return NextResponse.json({
        dryRun: false,
        mode: isLiveMode() ? "live" : "dry-run",
        imported: false,
        canImport: false,
        compliance: parsed.data.compliance,
        validation,
        payloadPreview: parsed.data.wordpress,
        message: !validation.valid ? `Import blocked because validation failed: ${validation.errors.join(", ")}` : t(locale, "api.importBlockedCompliance"),
      });
    }

    return NextResponse.json({
      dryRun: false,
      mode: isLiveMode() ? "live" : "dry-run",
      imported: false,
      canImport: true,
      compliance: parsed.data.compliance,
      validation,
      payloadPreview: parsed.data.wordpress,
      message: "Live execution complete. Export payload is production-ready. WordPress write remains server-guarded.",
    });
  } catch {
    return safeError(500, "project_import_failed", t(locale, "api.projectImportFailed"));
  }
}
