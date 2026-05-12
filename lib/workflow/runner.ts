import type { TimelineEvent, WorkflowDefinition, WorkflowNode, WorkflowRunResponse } from "@/types/workflow";
import type { LaunchBriefInput } from "@/types/workflow";
import { runNode, type NodeContext } from "@/lib/workflow/node-handlers";

function now() {
  return new Date().toISOString();
}

export function executeWorkflow(workflow: WorkflowDefinition, brief: LaunchBriefInput): WorkflowRunResponse {
  const timeline: TimelineEvent[] = [];
  const nodes: WorkflowNode[] = workflow.nodes.map((n) => ({ ...n, data: { ...n.data, status: "idle", summary: "" } }));

  let ctx: NodeContext = {
    brief,
    generated: undefined,
    compliancePassed: true,
    violations: [],
  };

  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i];
    node.data.status = "running";
    timeline.push({ at: now(), nodeId: node.id, nodeLabel: String(node.data.label), status: "running", message: "Node started" });

    try {
      ctx = runNode(node, ctx);

      if (!ctx.compliancePassed && (node.type === "scope-guard" || node.type === "qa-audit")) {
        node.data.status = "failed";
        node.data.summary = `Compliance blocked (${ctx.violations.join(", ")})`;
        timeline.push({ at: now(), nodeId: node.id, nodeLabel: String(node.data.label), status: "failed", message: String(node.data.summary) });
        for (let j = i + 1; j < nodes.length; j += 1) {
          nodes[j].data.status = "idle";
          nodes[j].data.summary = "Skipped due to compliance failure";
        }
        break;
      }

      node.data.status = "success";
      node.data.summary = node.type === "preview-builder" ? "Preview JSON generated" : "Completed";
      timeline.push({ at: now(), nodeId: node.id, nodeLabel: String(node.data.label), status: "success", message: String(node.data.summary) });
    } catch {
      node.data.status = "failed";
      node.data.summary = "Execution failed";
      ctx = {
        ...ctx,
        compliancePassed: false,
        violations: Array.from(new Set([...ctx.violations, "execution_failed"])),
      };
      timeline.push({ at: now(), nodeId: node.id, nodeLabel: String(node.data.label), status: "failed", message: String(node.data.summary) });
      for (let j = i + 1; j < nodes.length; j += 1) {
        nodes[j].data.status = "idle";
        nodes[j].data.summary = "Skipped due to node failure";
      }
      break;
    }
  }

  const canExport = ctx.compliancePassed && Boolean(ctx.generated);
  const canImport = canExport;

  return {
    workflowId: workflow.id,
    dryRun: true,
    compliancePassed: ctx.compliancePassed,
    canExport,
    canImport,
    nodes,
    timeline,
    generated: ctx.generated,
    violations: Array.from(new Set(ctx.violations)),
  };
}
