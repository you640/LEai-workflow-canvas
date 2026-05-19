import type { LaunchBriefInput, WorkflowNode } from "@/types/workflow";
import { SourceOfTruthExportSchema } from "@/lib/launch-studio/source-of-truth-schema";
import { buildMockProject } from "@/lib/mock/mock-project";
import { scanProjectPayload } from "@/lib/compliance/wording";
import type { Locale } from "@/lib/i18n";
import { validateSourceOfTruthExport } from "@/lib/launch-studio/validation";

export interface NodeContext {
  brief: LaunchBriefInput;
  generated?: unknown;
  compliancePassed: boolean;
  violations: string[];
  locale: Locale;
}

export function runNode(node: WorkflowNode, ctx: NodeContext): NodeContext {
  switch (node.type) {
    case "project-type":
    case "launch-brief":
    case "strategy-agent":
    case "copy-agent":
    case "structure-agent":
    case "template-selector":
    case "seo-agent":
    case "wordpress-adapter":
    case "launch-pack":
      return { ...ctx };
    case "scope-guard": {
      const scan = scanProjectPayload(ctx.brief);
      return { ...ctx, compliancePassed: scan.passed, violations: scan.violations };
    }
    case "preview-builder": {
      const generated = buildMockProject(ctx.brief, ctx.locale);
      return { ...ctx, generated };
    }
    case "qa-audit": {
      if (!ctx.generated) {
        return {
          ...ctx,
          compliancePassed: false,
          violations: [...ctx.violations, "missing_generated_payload"],
        };
      }

      const parsed = SourceOfTruthExportSchema.safeParse(ctx.generated);
      if (!parsed.success) {
        return {
          ...ctx,
          compliancePassed: false,
          violations: [...ctx.violations, "schema_validation_failed"],
        };
      }

      const scan = scanProjectPayload(parsed.data);
      const validation = validateSourceOfTruthExport(parsed.data);

      return {
        ...ctx,
        generated: parsed.data,
        compliancePassed: ctx.compliancePassed && scan.passed && validation.valid,
        violations: [...ctx.violations, ...scan.violations, ...validation.errors],
      };
    }
    default:
      return { ...ctx };
  }
}
