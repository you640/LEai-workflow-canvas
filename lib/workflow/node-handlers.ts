import type { LaunchBriefInput, WorkflowNode } from "@/types/workflow";
import { ProjectLaunchSchema } from "@/lib/schemas/project.schema";
import { buildMockProject } from "@/lib/mock/mock-project";
import { scanProjectPayload } from "@/lib/compliance/wording";

export interface NodeContext {
  brief: LaunchBriefInput;
  generated?: unknown;
  compliancePassed: boolean;
  violations: string[];
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
      const generated = buildMockProject(ctx.brief);
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

      const parsed = ProjectLaunchSchema.safeParse(ctx.generated);
      if (!parsed.success) {
        return {
          ...ctx,
          compliancePassed: false,
          violations: [...ctx.violations, "schema_validation_failed"],
        };
      }

      const scan = scanProjectPayload(parsed.data);
      return {
        ...ctx,
        generated: parsed.data,
        compliancePassed: ctx.compliancePassed && scan.passed,
        violations: [...ctx.violations, ...scan.violations],
      };
    }
    default:
      return { ...ctx };
  }
}
