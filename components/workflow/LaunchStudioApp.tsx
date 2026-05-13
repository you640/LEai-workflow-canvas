"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ReactFlowProvider, useEdgesState, useNodesState, type Edge } from "@xyflow/react";
import { createDefaultWorkflow } from "@/lib/workflow/default-workflow";
import type { LaunchBriefInput, ProjectType, WorkflowNode, WorkflowRunResponse } from "@/types/workflow";
import { LaunchCanvas } from "@/components/workflow/LaunchCanvas";
import { WorkflowToolbar } from "@/components/workflow/WorkflowToolbar";
import { NodeInspector } from "@/components/workflow/NodeInspector";
import { ExecutionTimeline } from "@/components/workflow/ExecutionTimeline";
import { JsonPreview } from "@/components/workflow/JsonPreview";
import { ProjectTypeSelector } from "@/components/workflow/ProjectTypeSelector";
import { useI18n } from "@/lib/i18n/client";
import type { TranslationKey } from "@/lib/i18n";
import { validateSourceOfTruthExport } from "@/lib/launch-studio/validation";
import { validateLiveBrief } from "@/lib/launch-studio/brief-validation";
import { loadProjectConfig, saveProjectConfig } from "@/lib/launch-studio/project-store";

const NODE_COPY_KEYS: Record<string, { label: `nodes.${string}.label`; description: `nodes.${string}.description` }> = {
  "project-type": { label: "nodes.project-type.label", description: "nodes.project-type.description" },
  "launch-brief": { label: "nodes.launch-brief.label", description: "nodes.launch-brief.description" },
  "scope-guard": { label: "nodes.scope-guard.label", description: "nodes.scope-guard.description" },
  "strategy-agent": { label: "nodes.strategy-agent.label", description: "nodes.strategy-agent.description" },
  "copy-agent": { label: "nodes.copy-agent.label", description: "nodes.copy-agent.description" },
  "structure-agent": { label: "nodes.structure-agent.label", description: "nodes.structure-agent.description" },
  "template-selector": { label: "nodes.template-selector.label", description: "nodes.template-selector.description" },
  "seo-agent": { label: "nodes.seo-agent.label", description: "nodes.seo-agent.description" },
  "preview-builder": { label: "nodes.preview-builder.label", description: "nodes.preview-builder.description" },
  "wordpress-adapter": { label: "nodes.wordpress-adapter.label", description: "nodes.wordpress-adapter.description" },
  "qa-audit": { label: "nodes.qa-audit.label", description: "nodes.qa-audit.description" },
  "launch-pack": { label: "nodes.launch-pack.label", description: "nodes.launch-pack.description" },
};

function LaunchStudioInner() {
  const { translate } = useI18n();

  const defaultBrief: LaunchBriefInput = {
    projectType: "business",
    projectName: "",
    targetAudience: "",
    goal: "",
    description: "",
    preferredTone: "",
    contactEmail: "",
  };

  const initial = useMemo(() => {
    const workflow = createDefaultWorkflow();
    workflow.nodes = workflow.nodes.map((node) => {
      const copy = NODE_COPY_KEYS[node.type];
      if (!copy) return node;
      return {
        ...node,
        data: {
          ...node.data,
          label: translate(copy.label as TranslationKey),
          description: translate(copy.description as TranslationKey),
        },
      };
    });
    return workflow;
  }, [translate]);
  const [workflowId, setWorkflowId] = useState<string>(initial.id);
  const [workflowName, setWorkflowName] = useState<string>(translate("app.workflowName"));
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
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const selectedNode: WorkflowNode | null = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId]
  );
  const validation = useMemo(
    () =>
      generated
        ? validateSourceOfTruthExport(generated)
        : { valid: false, errors: ["missing_generated_payload"] },
    [generated]
  );
  const canExport = compliancePassed && Boolean(generated) && validation.valid;
  const liveBriefErrors = useMemo(() => validateLiveBrief(brief), [brief]);

  useEffect(() => {
    const restored = loadProjectConfig();
    if (restored) {
      setBrief(restored);
    }
  }, []);

  useEffect(() => {
    saveProjectConfig(brief);
  }, [brief]);

  const handleRun = async () => {
    if (liveBriefErrors.length > 0) {
      setValidationErrors(liveBriefErrors);
      setImportMessage("Validation failed. Fill all required real project fields.");
      return;
    }

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
        setImportMessage(runData?.message ?? translate("app.workflowRunFailed"));
        setValidationErrors(runData?.details ?? ["workflow_run_failed"]);
        return;
      }

      setNodes(runData.nodes);
      setTimeline(runData.timeline);
      setGenerated(runData.generated ?? null);
      setCompliancePassed(Boolean(runData.compliancePassed));
      setViolations(runData.violations ?? []);
      setValidationErrors([]);

      const genRes = await fetch("/api/projects/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief }),
      });

      const genData = await genRes.json();
      if (!genRes.ok) {
        setImportMessage(genData?.message ?? "Generation failed.");
        setValidationErrors(genData?.details ?? ["generation_failed"]);
        return;
      }
      if (genRes.ok && genData?.project) {
        setGenerated(genData.project);
        setCompliancePassed(Boolean(genData?.compliance?.passed));
        setViolations(genData?.compliance?.violations ?? []);
        const gate = validateSourceOfTruthExport(genData.project);
        setValidationErrors(gate.errors);
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
      setImportMessage(translate("app.workflowSaved"));
    }
  };

  const handleLoad = async () => {
    const res = await fetch(`/api/workflows?workflowId=${workflowId}`);
    const data = await res.json();
    if (res.ok && data?.workflow) {
      setWorkflowName(data.workflow.name);
      setNodes(data.workflow.nodes);
      setEdges(data.workflow.edges);
      setImportMessage(translate("app.workflowLoaded"));
    }
  };

  const handleReset = () => {
    const fresh = createDefaultWorkflow();
    setWorkflowId(fresh.id);
    setWorkflowName(translate("app.workflowName"));
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
    const gate = validateSourceOfTruthExport(generated);
    if (!gate.valid) {
      setImportMessage(`Validation failed: ${gate.errors.join(", ")}`);
      return;
    }
    const res = await fetch("/api/projects/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project: generated, compliancePassed }),
    });
    const data = await res.json();
    setImportMessage(data?.message ?? translate("app.importResponseReceived"));
  };

  const handleAddNode = useCallback(() => {
    const last = nodes[nodes.length - 1];
    const newNode: WorkflowNode = {
      id: `custom-${Date.now()}`,
      type: "launch-pack",
      position: { x: (last?.position.x ?? 100) + 220, y: last?.position.y ?? 80 },
      data: {
        label: translate("app.customStepLabel"),
        description: translate("app.customStepDescription"),
        status: "idle",
      },
    };
    setNodes((prev) => [...prev, newNode]);
  }, [nodes, setNodes, translate]);

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
  }, []);

  const lastRunAt = timeline[timeline.length - 1]?.at;

  return (
    <div className="app-shell launch-studio-shell bg-zinc-950 text-zinc-100">
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
        dryRun={false}
        canExport={canExport}
      />

      <div className="grid h-[calc(100dvh-64px-env(safe-area-inset-top)-env(safe-area-inset-bottom))] grid-cols-12 gap-3 overflow-hidden p-3">
        <div className="col-span-8 flex min-h-0 flex-col gap-3 overflow-hidden">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <h2 className="text-sm font-semibold">{translate("app.headline")}</h2>
            <p className="text-xs text-zinc-300">{translate("app.subheadline")}</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="brief-project-type" className="mb-1 block text-xs text-zinc-300">{translate("app.projectType")}</label>
                <ProjectTypeSelector
                  id="brief-project-type"
                  ariaLabel={translate("app.projectType")}
                  value={brief.projectType as ProjectType}
                  onChange={(projectType) => setBrief((b) => ({ ...b, projectType }))}
                />
              </div>
              <div>
                <label htmlFor="brief-project-name" className="mb-1 block text-xs text-zinc-300">{translate("app.projectName")}</label>
                <input id="brief-project-name" className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70" value={brief.projectName} onChange={(e) => setBrief((b) => ({ ...b, projectName: e.target.value }))} />
              </div>
              <div>
                <label htmlFor="brief-target-audience" className="mb-1 block text-xs text-zinc-300">{translate("app.targetAudience")}</label>
                <input id="brief-target-audience" className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70" value={brief.targetAudience} onChange={(e) => setBrief((b) => ({ ...b, targetAudience: e.target.value }))} />
              </div>
              <div>
                <label htmlFor="brief-goal" className="mb-1 block text-xs text-zinc-300">{translate("app.goal")}</label>
                <input id="brief-goal" className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70" value={brief.goal} onChange={(e) => setBrief((b) => ({ ...b, goal: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label htmlFor="brief-description" className="mb-1 block text-xs text-zinc-300">{translate("app.description")}</label>
                <textarea id="brief-description" className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70" rows={2} value={brief.description} onChange={(e) => setBrief((b) => ({ ...b, description: e.target.value }))} />
              </div>
              <div>
                <label htmlFor="brief-preferred-tone" className="mb-1 block text-xs text-zinc-300">{translate("app.preferredTone")}</label>
                <input id="brief-preferred-tone" className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70" value={brief.preferredTone} onChange={(e) => setBrief((b) => ({ ...b, preferredTone: e.target.value }))} />
              </div>
              <div>
                <label htmlFor="brief-contact-email" className="mb-1 block text-xs text-zinc-300">{translate("app.contactEmail")}</label>
                <input id="brief-contact-email" type="email" className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70" value={brief.contactEmail ?? ""} onChange={(e) => setBrief((b) => ({ ...b, contactEmail: e.target.value }))} />
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <LaunchCanvas
              nodes={nodes as WorkflowNode[]}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={handleNodeClick}
            />
          </div>
        </div>

        <div className="col-span-4 flex min-h-0 flex-col gap-3 overflow-hidden">
          <div className="min-h-[170px] overflow-auto">
            <NodeInspector
              node={selectedNode}
              projectType={brief.projectType}
              dryRun={false}
              compliancePassed={compliancePassed}
              canExport={canExport}
              lastRunAt={lastRunAt}
            />
          </div>
          <div className="min-h-[220px] overflow-auto">
            <ExecutionTimeline events={timeline} />
          </div>
          {showJson ? (
            <div className="min-h-[230px] overflow-auto">
              <JsonPreview data={generated} blocked={!canExport} onExport={handleExport} />
            </div>
          ) : null}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <button
              type="button"
              onClick={handleImportDryRun}
              disabled={!compliancePassed || !generated}
              className="w-full rounded-md border border-zinc-700 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 disabled:opacity-40"
            >
              {translate("app.prepareWpImport")}
            </button>
            <div className="mt-2 text-xs text-emerald-300">LIVE mode active. Real user inputs required.</div>
            {violations.length > 0 ? (
              <div className="mt-2 text-xs text-rose-400">{translate("app.complianceViolations")}: {violations.join(", ")}</div>
            ) : null}
            {validationErrors.length > 0 ? (
              <div className="mt-2 text-xs text-amber-300">{translate("app.validationErrors")}: {validationErrors.join(", ")}</div>
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
