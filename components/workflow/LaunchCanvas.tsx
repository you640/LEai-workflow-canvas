"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type OnNodesChange,
  type OnEdgesChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { WorkflowNode as WorkflowNodeView } from "@/components/workflow/WorkflowNode";
import type { WorkflowEdge, WorkflowNode } from "@/types/workflow";

const nodeTypes = {
  "project-type": WorkflowNodeView,
  "launch-brief": WorkflowNodeView,
  "scope-guard": WorkflowNodeView,
  "strategy-agent": WorkflowNodeView,
  "copy-agent": WorkflowNodeView,
  "structure-agent": WorkflowNodeView,
  "template-selector": WorkflowNodeView,
  "seo-agent": WorkflowNodeView,
  "preview-builder": WorkflowNodeView,
  "wordpress-adapter": WorkflowNodeView,
  "qa-audit": WorkflowNodeView,
  "launch-pack": WorkflowNodeView,
};

interface Props {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  onNodesChange: OnNodesChange<WorkflowNode>;
  onEdgesChange: OnEdgesChange<WorkflowEdge>;
  onNodeClick: (nodeId: string) => void;
}

export function LaunchCanvas({ nodes, edges, onNodesChange, onEdgesChange, onNodeClick }: Props) {
  const themedEdges = useMemo(
    () => edges.map((e) => ({ ...e, animated: false, style: { stroke: "#52525b", strokeWidth: 2 } })),
    [edges]
  );

  return (
    <div className="h-full w-full bg-zinc-950">
      <ReactFlow
        nodes={nodes}
        edges={themedEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => onNodeClick(node.id)}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="bg-zinc-950"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1f2937" />
        <MiniMap className="hidden md:block" nodeColor="#3f3f46" maskColor="rgba(0,0,0,0.6)" />
        <Controls
          showFitView={false}
          showInteractive={false}
          position="bottom-left"
          aria-label="Workflow zoom controls"
          className="!border-zinc-700/90 !bg-zinc-950/90 !shadow-xl"
        />
      </ReactFlow>
    </div>
  );
}
