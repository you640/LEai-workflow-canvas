import type { WorkflowDefinition } from "@/types/workflow";

const workflowStore = new Map<string, WorkflowDefinition>();
const workflowAuditLog: Array<{
  at: string;
  workflowId: string;
  action: "save" | "run";
  payload?: Record<string, unknown>;
}> = [];

export function saveWorkflow(workflow: WorkflowDefinition): WorkflowDefinition {
  workflowStore.set(workflow.id, workflow);
  workflowAuditLog.push({
    at: new Date().toISOString(),
    workflowId: workflow.id,
    action: "save",
    payload: { name: workflow.name, nodeCount: workflow.nodes.length, edgeCount: workflow.edges.length },
  });
  return workflow;
}

export function getWorkflow(id: string): WorkflowDefinition | undefined {
  return workflowStore.get(id);
}

export function listWorkflows(): WorkflowDefinition[] {
  return Array.from(workflowStore.values()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function addWorkflowRunAudit(workflowId: string, payload: Record<string, unknown>) {
  workflowAuditLog.push({
    at: new Date().toISOString(),
    workflowId,
    action: "run",
    payload,
  });
}

export function listWorkflowAuditLog(workflowId?: string) {
  const rows = workflowId ? workflowAuditLog.filter((x) => x.workflowId === workflowId) : workflowAuditLog;
  return rows.slice(-200);
}
