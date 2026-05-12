import type { WorkflowDefinition, WorkflowNode, WorkflowEdge } from "@/types/workflow";

function node(id: string, label: string, description: string, x: number, y: number, type: WorkflowNode["type"]): WorkflowNode {
  return {
    id,
    type,
    position: { x, y },
    data: {
      label,
      description,
      status: "idle",
    },
  };
}

export function createDefaultWorkflow(): WorkflowDefinition {
  const nodes: WorkflowNode[] = [
    node("project-type", "Project Type", "Choose one of six project types.", 40, 80, "project-type"),
    node("launch-brief", "Launch Brief", "Fill launch brief input.", 280, 80, "launch-brief"),
    node("scope-guard", "Scope Guard", "Validate request scope and safety.", 520, 80, "scope-guard"),
    node("strategy-agent", "Strategy Agent", "Generate positioning and CTA strategy.", 760, 80, "strategy-agent"),
    node("copy-agent", "Copy Agent", "Generate headline, subheadline, CTA, FAQ draft.", 1000, 80, "copy-agent"),
    node("structure-agent", "Structure Agent", "Generate section architecture.", 1240, 80, "structure-agent"),
    node("template-selector", "Template Selector", "Pick preset by project type.", 1480, 80, "template-selector"),
    node("seo-agent", "SEO Agent", "Generate metadata package.", 1720, 80, "seo-agent"),
    node("preview-builder", "Preview Builder", "Assemble launch preview JSON.", 1960, 80, "preview-builder"),
    node("wordpress-adapter", "WordPress Adapter", "Prepare server-side import payload.", 2220, 80, "wordpress-adapter"),
    node("qa-audit", "QA Audit", "Validate required fields and wording.", 2510, 80, "qa-audit"),
    node("launch-pack", "Launch Pack", "Produce checklist and next steps.", 2800, 80, "launch-pack"),
  ];

  const edges: WorkflowEdge[] = nodes.slice(0, -1).map((n, idx) => ({
    id: `e-${n.id}-${nodes[idx + 1].id}`,
    source: n.id,
    target: nodes[idx + 1].id,
  }));

  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: "Web do 24h Generator",
    dryRun: true,
    nodes,
    edges,
    createdAt: now,
    updatedAt: now,
  };
}
