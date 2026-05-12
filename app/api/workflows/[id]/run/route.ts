import { NextResponse } from "next/server";
import { getWorkflow } from "@/lib/workflow/store";
import { executeWorkflow } from "@/lib/workflow/runner";
import { safeError } from "@/lib/safe-error";
import type { LaunchBriefInput, WorkflowDefinition } from "@/types/workflow";

function buildWorkflowFromBody(body: unknown, id: string): WorkflowDefinition | null {
  const payload = body as { workflow?: Partial<WorkflowDefinition> } | null;
  const w = payload?.workflow;
  if (!w || !Array.isArray(w.nodes) || !Array.isArray(w.edges)) {
    return null;
  }
  const now = new Date().toISOString();
  return {
    id: String(w.id ?? id),
    name: String(w.name ?? "Web do 24h Generator"),
    dryRun: true,
    nodes: w.nodes as WorkflowDefinition["nodes"],
    edges: w.edges as WorkflowDefinition["edges"],
    createdAt: String(w.createdAt ?? now),
    updatedAt: now,
  };
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const brief = body?.brief as LaunchBriefInput | undefined;

    if (!brief) {
      return safeError(400, "brief_missing", "Launch brief is required.");
    }

    const workflow = getWorkflow(id) ?? buildWorkflowFromBody(body, id);
    if (!workflow) {
      return safeError(404, "workflow_not_found", "Workflow not found.");
    }

    const run = executeWorkflow(workflow, brief);
    return NextResponse.json(run);
  } catch {
    return safeError(500, "workflow_run_failed", "Workflow execution failed.");
  }
}
