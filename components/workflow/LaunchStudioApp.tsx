"use client";

import { useMemo, useState } from "react";
import { ReactFlowProvider, useEdgesState, useNodesState, type Edge } from "@xyflow/react";
import { createDefaultWorkflow } from "@/lib/workflow/default-workflow";
import type { LaunchBriefInput, ProjectType, WorkflowNode, WorkflowRunResponse } from "@/types/workflow";
import { LaunchCanvas } from "@/components/workflow/LaunchCanvas";
import { WorkflowToolbar } from "@/components/workflow/WorkflowToolbar";
import { NodeInspector } from "@/components/workflow/NodeInspector";
import { ExecutionTimeline } from "@/components/workflow/ExecutionTimeline";
import { JsonPreview } from "@/components/workflow/JsonPreview";
import { ProjectTypeSelector } from "@/components/workflow/ProjectTypeSelector";

const defaultBrief: LaunchBriefInput = {
  projectType: "business",
  projectName: "Web do 24h Project",
  targetAudience: "Majitelia menších a stredných firiem",
  goal: "Spustiť moderný web pripravený na klientov",
  description: "Prehľadný web s jasnou ponukou a CTA.",
  preferredTone: "jasný, profesionálny, priamy",
  contactEmail: "hello@example.com",
};

function LaunchStudioInner() {
  const initial = useMemo(() => createDefaultWorkflow(), []);
  const [workflowId, setWorkflowId] = useState<string>(initial.id);
  const [workflowName, setWorkflowName] = useState<string>(initial.name);
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges as Edge[]);
  const [brief, setBrief] = useState<LaunchBriefInput>(defaultBrief);
  const [timeline, setTimeline] = useState<WorkflowRunResponse["timeline"]>([]);
  const [generated, setGenerated] = useState<unknown>(null);
  const [compliancePassed, setCompliancePassed] = useState<boolean>(false);
  const [violations, setViolations] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showJson, setShowJson] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<string>("");

  const selectedNode: WorkflowNode | null = nodes.find((n) => n.id === selectedNodeId) ?? null;
  const canExport = compliancePassed && Boolean(generated);

  const handleRun = async () => {
    setIsRunning(true);
    setImportMessage("");
    try {
      await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: workflowId, name: workflowName, nodes, edges }),
      });

      const runRes = await fetch(`/api/workflows/${workflowId}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, workflow: { id: workflowId, name: workflowName, nodes, edges } }),
      });
      const runData = await runRes.json();

      if (!runRes.ok) {
        setImportMessage(runData?.message ?? "Workflow run failed.");
        return;
      }

      setNodes(runData.nodes);
      setTimeline(runData.timeline);
      setGenerated(runData.generated ?? null);
      setCompliancePassed(Boolean(runData.compliancePassed));
      setViolations(runData.violations ?? []);

      const genRes = await fetch("/api/projects/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief }),
      });

      const genData = await genRes.json();
      if (genRes.ok && genData?.project) {
        setGenerated(genData.project);
        setCompliancePassed(Boolean(genData?.compliance?.passed));
        setViolations(genData?.compliance?.violations ?? []);
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleSave = async () => {
    const res = await fetch("/api/workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: workflowId, name: workflowName, nodes, edges }),
    });
    const data = await res.json();
    if (res.ok && data?.workflow?.id) {
      setWorkflowId(data.workflow.id);
      setImportMessage("Workflow saved.");
    }
  };

  const handleLoad = async () => {
    const res = await fetch(`/api/workflows?workflowId=${workflowId}`);
    const data = await res.json();
    if (res.ok && data?.workflow) {
      setWorkflowName(data.workflow.name);
      setNodes(data.workflow.nodes);
      setEdges(data.workflow.edges);
      setImportMessage("Workflow loaded.");
    }
  };

  const handleReset = () => {
    const fresh = createDefaultWorkflow();
    setWorkflowId(fresh.id);
    setWorkflowName(fresh.name);
    setNodes(fresh.nodes);
    setEdges(fresh.edges as Edge[]);
    setTimeline([]);
    setGenerated(null);
    setCompliancePassed(false);
    setViolations([]);
    setImportMessage("");
  };

  const handleExport = () => {
    if (!canExport || !generated) return;
    const blob = new Blob([JSON.stringify(generated, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "web-do-24h-launch-pack.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportDryRun = async () => {
    if (!generated) return;
    const res = await fetch("/api/projects/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project: generated, compliancePassed }),
    });
    const data = await res.json();
    setImportMessage(data?.message ?? "Import response received.");
  };

  const handleAddNode = () => {
    const last = nodes[nodes.length - 1];
    const newNode: WorkflowNode = {
      id: `custom-${Date.now()}`,
      type: "launch-pack",
      position: { x: (last?.position.x ?? 100) + 220, y: last?.position.y ?? 80 },
      data: {
        label: "Custom Step",
        description: "Custom planning node.",
        status: "idle",
      },
    };
    setNodes((prev) => [...prev, newNode]);
  };

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100">
      <WorkflowToolbar
        workflowName={workflowName}
        onWorkflowNameChange={setWorkflowName}
        onRun={handleRun}
        onSave={handleSave}
        onLoad={handleLoad}
        onReset={handleReset}
        onAddNode={handleAddNode}
        onToggleJson={() => setShowJson((v) => !v)}
        onExport={handleExport}
        isRunning={isRunning}
        dryRun
        canExport={canExport}
      />

      <div className="grid h-[calc(100vh-64px)] grid-cols-12 gap-3 p-3">
        <div className="col-span-8 flex flex-col gap-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <h2 className="text-sm font-semibold">AI Launch Studio</h2>
            <p className="text-xs text-zinc-400">Od briefu po štruktúru webu cez vizuálny workflow.</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-zinc-400">Project Type</label>
                <ProjectTypeSelector value={brief.projectType as ProjectType} onChange={(projectType) => setBrief((b) => ({ ...b, projectType }))} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-400">Project Name</label>
                <input className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" value={brief.projectName} onChange={(e) => setBrief((b) => ({ ...b, projectName: e.target.value }))} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-400">Target Audience</label>
                <input className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" value={brief.targetAudience} onChange={(e) => setBrief((b) => ({ ...b, targetAudience: e.target.value }))} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-400">Goal</label>
                <input className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" value={brief.goal} onChange={(e) => setBrief((b) => ({ ...b, goal: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-xs text-zinc-400">Description</label>
                <textarea className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" rows={2} value={brief.description} onChange={(e) => setBrief((b) => ({ ...b, description: e.target.value }))} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-400">Preferred Tone</label>
                <input className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" value={brief.preferredTone} onChange={(e) => setBrief((b) => ({ ...b, preferredTone: e.target.value }))} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-400">Contact Email</label>
                <input className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" value={brief.contactEmail ?? ""} onChange={(e) => setBrief((b) => ({ ...b, contactEmail: e.target.value }))} />
              </div>
            </div>
          </div>

          <div className="flex-1">
            <LaunchCanvas
              nodes={nodes as WorkflowNode[]}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={setSelectedNodeId}
            />
          </div>
        </div>

        <div className="col-span-4 flex flex-col gap-3">
          <NodeInspector node={selectedNode} />
          <ExecutionTimeline events={timeline} />
          {showJson ? <JsonPreview data={generated} blocked={!canExport} onExport={handleExport} /> : null}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <button
              type="button"
              onClick={handleImportDryRun}
              disabled={!compliancePassed || !generated}
              className="w-full rounded-md border border-zinc-700 px-3 py-2 text-sm disabled:opacity-40"
            >
              Prepare WordPress Import (Dry-run)
            </button>
            <div className="mt-2 text-xs text-zinc-400">Real import is disabled by default.</div>
            {violations.length > 0 ? (
              <div className="mt-2 text-xs text-rose-400">Compliance violations: {violations.join(", ")}</div>
            ) : null}
            {importMessage ? <div className="mt-2 text-xs text-zinc-300">{importMessage}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LaunchStudioApp() {
  return (
    <ReactFlowProvider>
      <LaunchStudioInner />
    </ReactFlowProvider>
  );
}
