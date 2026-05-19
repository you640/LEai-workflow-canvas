import type { TimelineEvent, WorkflowDefinition, WorkflowNode, WorkflowRunResponse } from "@/types/workflow";
import type { LaunchBriefInput } from "@/types/workflow";
import { runNode, type NodeContext } from "@/lib/workflow/node-handlers";
import { t, type Locale } from "@/lib/i18n";
import { validateSourceOfTruthExport } from "@/lib/launch-studio/validation";

function now() {
  return new Date().toISOString();
}

export function executeWorkflow(workflow: WorkflowDefinition, brief: LaunchBriefInput, locale: Locale): WorkflowRunResponse {
  const timeline: TimelineEvent[] = [];
  const nodes: WorkflowNode[] = workflow.nodes.map((n) => ({ ...n, data: { ...n.data, status: "idle", summary: "" } }));

  let ctx: NodeContext = {
    brief,
    generated: undefined,
    compliancePassed: true,
    violations: [],
    locale,
  };

  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i];
    node.data.status = "running";
    timeline.push({ at: now(), nodeId: node.id, nodeLabel: String(node.data.label), status: "running", message: t(locale, "runner.nodeStarted") });

    try {
      ctx = runNode(node, ctx);

      if (!ctx.compliancePassed && (node.type === "scope-guard" || node.type === "qa-audit")) {
        node.data.status = "failed";
        node.data.summary = `${t(locale, "runner.complianceBlocked")} (${ctx.violations.join(", ")})`;
        timeline.push({ at: now(), nodeId: node.id, nodeLabel: String(node.data.label), status: "failed", message: String(node.data.summary) });
        for (let j = i + 1; j < nodes.length; j += 1) {
          nodes[j].data.status = "idle";
          nodes[j].data.summary = t(locale, "runner.skippedCompliance");
        }
        break;
      }

      node.data.status = "success";
      node.data.summary = node.type === "preview-builder" ? t(locale, "runner.previewGenerated") : t(locale, "runner.completed");
      timeline.push({ at: now(), nodeId: node.id, nodeLabel: String(node.data.label), status: "success", message: String(node.data.summary) });
    } catch {
      node.data.status = "failed";
      node.data.summary = t(locale, "runner.executionFailed");
      ctx = {
        ...ctx,
        compliancePassed: false,
        violations: Array.from(new Set([...ctx.violations, "execution_failed"])),
      };
      timeline.push({ at: now(), nodeId: node.id, nodeLabel: String(node.data.label), status: "failed", message: String(node.data.summary) });
      for (let j = i + 1; j < nodes.length; j += 1) {
        nodes[j].data.status = "idle";
        nodes[j].data.summary = t(locale, "runner.skippedNodeFailure");
      }
      break;
    }
  }

  const generationValidation = ctx.generated ? validateSourceOfTruthExport(ctx.generated) : { valid: false, errors: ["missing_generated_payload"] };
  const canExport = ctx.compliancePassed && Boolean(ctx.generated) && generationValidation.valid;
  const canImport = canExport;

  return {
    workflowId: workflow.id,
    dryRun: false,
    compliancePassed: ctx.compliancePassed,
    canExport,
    canImport,
    nodes,
    timeline,
    generated: ctx.generated,
    violations: Array.from(new Set([...ctx.violations, ...(generationValidation.valid ? [] : generationValidation.errors)])),
  };
}
