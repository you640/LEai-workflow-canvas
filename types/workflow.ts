import type { Edge, Node } from "@xyflow/react";

export type ProjectType =
  | "business"
  | "saas"
  | "booking"
  | "product-launch"
  | "support-campaign"
  | "personal-brand";

export type NodeStatus = "idle" | "running" | "success" | "warning" | "failed";

export type LaunchNodeType =
  | "project-type"
  | "launch-brief"
  | "scope-guard"
  | "strategy-agent"
  | "copy-agent"
  | "structure-agent"
  | "template-selector"
  | "seo-agent"
  | "preview-builder"
  | "wordpress-adapter"
  | "qa-audit"
  | "launch-pack";

export interface LaunchNodeData extends Record<string, unknown> {
  label: string;
  description: string;
  status: NodeStatus;
  summary?: string;
}

export type WorkflowNode = Node<LaunchNodeData, LaunchNodeType>;
export type WorkflowEdge = Edge;

export interface WorkflowDefinition {
  id: string;
  name: string;
  dryRun: boolean;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEvent {
  at: string;
  nodeId: string;
  nodeLabel: string;
  status: NodeStatus;
  message: string;
}

export interface WorkflowRunResponse {
  workflowId: string;
  dryRun: boolean;
  compliancePassed: boolean;
  canExport: boolean;
  canImport: boolean;
  nodes: WorkflowNode[];
  timeline: TimelineEvent[];
  generated?: unknown;
  violations: string[];
}

export interface LaunchBriefInput {
  projectType: ProjectType;
  projectName: string;
  targetAudience: string;
  goal: string;
  description: string;
  preferredTone: string;
  contactEmail?: string;
  budget?: string;
  deadline?: string;
  targetAmount?: number | null;
  rewardsRequested?: boolean;
}
