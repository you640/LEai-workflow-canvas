import type { WorkflowDefinition } from "@/types/workflow";

const workflowStore = new Map<string, WorkflowDefinition>();

export function saveWorkflow(workflow: WorkflowDefinition): WorkflowDefinition {
  workflowStore.set(workflow.id, workflow);
  return workflow;
}

export function getWorkflow(id: string): WorkflowDefinition | undefined {
  return workflowStore.get(id);
}

export function listWorkflows(): WorkflowDefinition[] {
  return Array.from(workflowStore.values()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
