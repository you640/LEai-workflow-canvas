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
    () => edges.map((e) => ({ ...e, animated: false, style: { stroke: "rgba(255,255,255,0.2)", strokeWidth: 1.5 } })),
    [edges]
  );

  return (
    <div className="h-full w-full bg-black">
      <ReactFlow
        nodes={nodes}
        edges={themedEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => onNodeClick(node.id)}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="bg-black"
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(255,255,255,0.08)" />
        <MiniMap className="hidden !rounded-2xl !border !border-white/10 !bg-black/70 md:block" nodeColor="rgba(255,255,255,0.26)" maskColor="rgba(0,0,0,0.72)" />
        <Controls
          showFitView={false}
          showInteractive={false}
          position="bottom-left"
          aria-label="Workflow zoom controls"
          className="!rounded-2xl !border-white/10 !bg-black/70 !shadow-[0_18px_55px_rgba(0,0,0,0.45)] !backdrop-blur-xl"
        />
      </ReactFlow>
    </div>
  );
}
