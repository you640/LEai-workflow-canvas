import { NextResponse } from "next/server";
import { createDefaultWorkflow } from "@/lib/workflow/default-workflow";
import { getWorkflow, listWorkflows, saveWorkflow } from "@/lib/workflow/store";
import type { WorkflowDefinition } from "@/types/workflow";
import { safeError } from "@/lib/safe-error";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workflowId = searchParams.get("workflowId");

  if (workflowId) {
    const workflow = getWorkflow(workflowId);
    if (!workflow) return safeError(404, "workflow_not_found", "Workflow not found.");
    return NextResponse.json({ workflow, workflows: [] });
  }

  return NextResponse.json({ workflows: listWorkflows() });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const base = createDefaultWorkflow();
    const workflow: WorkflowDefinition = {
      ...base,
      id: body.id ?? base.id,
      name: body.name ?? "Web do 24h Generator",
      nodes: Array.isArray(body.nodes) && body.nodes.length > 0 ? body.nodes : base.nodes,
      edges: Array.isArray(body.edges) && body.edges.length > 0 ? body.edges : base.edges,
      updatedAt: new Date().toISOString(),
    };

    saveWorkflow(workflow);
    return NextResponse.json({ workflow });
  } catch {
    return safeError(500, "workflow_create_failed", "Failed to create workflow.");
  }
}
