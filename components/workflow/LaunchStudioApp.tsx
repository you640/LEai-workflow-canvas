"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ReactFlowProvider, useEdgesState, useNodesState, type Edge } from "@xyflow/react";
import { Activity, Compass, Database, FileJson, Monitor, Play, Share2, WandSparkles, X } from "lucide-react";
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
import { containsForbiddenClaims, containsPlaceholderText, stripHtmlForPlainText } from "@/lib/launch-studio/content-format";

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

const PROJECT_TYPE_LABEL_KEYS: Record<ProjectType, TranslationKey> = {
  business: "projectTypes.business",
  saas: "projectTypes.saas",
  booking: "projectTypes.booking",
  "product-launch": "projectTypes.product-launch",
  "support-campaign": "projectTypes.support-campaign",
  "personal-brand": "projectTypes.personal-brand",
};

const MAGIC_TIMEOUT_MS = 15000;
const MAGIC_MAX_ATTEMPTS = 2;
const GENERATED_PAYLOAD_STORAGE_KEY = "le-studio:last-generated-payload";

function cleanMagicValue(value: string): string {
  return stripHtmlForPlainText(value).replace(/\s+/g, " ").trim();
}

function parseMagicPayload(rawText: string): Partial<Pick<LaunchBriefInput, "description" | "goal" | "targetAudience" | "preferredTone">> {
  const cleaned = rawText.trim();
  const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const jsonCandidate = (fenced?.[1] ?? cleaned).trim();

  try {
    const parsed = JSON.parse(jsonCandidate) as Record<string, unknown>;
    const description = typeof parsed.description === "string" ? cleanMagicValue(parsed.description) : "";
    const goal = typeof parsed.goal === "string" ? cleanMagicValue(parsed.goal) : "";
    const targetAudience = typeof parsed.targetAudience === "string" ? cleanMagicValue(parsed.targetAudience) : "";
    const preferredTone = typeof parsed.preferredTone === "string" ? cleanMagicValue(parsed.preferredTone) : "";
    return { description, goal, targetAudience, preferredTone };
  } catch {
    return { description: cleanMagicValue(cleaned) };
  }
}

function isSafeMagicText(value: string): boolean {
  if (!value.trim()) return false;
  if (containsPlaceholderText(value)) return false;
  if (containsForbiddenClaims(value)) return false;
  return true;
}

function createDeterministicMagicDraft(brief: LaunchBriefInput): Required<Pick<LaunchBriefInput, "description" | "goal" | "targetAudience" | "preferredTone">> {
  const projectName = brief.projectName.trim();
  const projectType = brief.projectType;

  return {
    goal:
      brief.goal.trim() ||
      `Pripraviť dôveryhodný launch plán pre projekt ${projectName} so zrozumiteľnou ponukou, jasnou CTA cestou a exportom pripraveným pre WordPress payload.`,
    targetAudience:
      brief.targetAudience.trim() ||
      `Majitelia menších a stredných firiem, tímy a tvorcovia, ktorí potrebujú rýchlo spustiť profesionálnu webovú prezentáciu pre typ projektu ${projectType}.`,
    preferredTone:
      brief.preferredTone.trim() || "Jasný, profesionálny, dôveryhodný, vecný a konverzne zameraný bez lacných marketingových fráz.",
    description: [
      `Vytvor production-grade brief pre projekt „${projectName}“ typu ${projectType}.`,
      "Výstup musí byť konkrétny, overiteľný a použiteľný pre LE Studio workflow bez placeholderov a bez fake tvrdení.",
      "Doplň hodnotový headline, stručný subheadline, sekcie (hero, benefits, process, offer, trust, faq, contact), CTA smer a SEO základy.",
      "Text musí byť pripravený pre export do source-of-truth WordPress metabox payloadu.",
    ].join(" "),
  };
}

function persistGeneratedPayload(payload: unknown): string | null {
  if (typeof window === "undefined") return null;

  try {
    const savedAt = new Date().toLocaleString();
    window.localStorage.setItem(GENERATED_PAYLOAD_STORAGE_KEY, JSON.stringify({ savedAt, payload }));
    return savedAt;
  } catch {
    return null;
  }
}

function loadStoredGeneratedPayload(): { savedAt: string; payload: unknown } | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(GENERATED_PAYLOAD_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { savedAt?: unknown; payload?: unknown };
    if (typeof parsed.savedAt !== "string" || !parsed.payload) return null;
    return { savedAt: parsed.savedAt, payload: parsed.payload };
  } catch {
    return null;
  }
}

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
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string>("");

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

    const storedPayload = loadStoredGeneratedPayload();
    if (storedPayload) {
      const gate = validateSourceOfTruthExport(storedPayload.payload);
      setGenerated(storedPayload.payload);
      setLastSavedAt(storedPayload.savedAt);
      setCompliancePassed(gate.valid);
      setValidationErrors(gate.valid ? [] : gate.errors);
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
      if (runData.generated) {
        setLastSavedAt(persistGeneratedPayload(runData.generated) ?? "");
      }
      const runCompliancePassed = Boolean(runData.compliancePassed);
      const runViolations: string[] = Array.isArray(runData.violations) ? runData.violations : [];
      setCompliancePassed(runCompliancePassed);
      setViolations(runViolations);
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
        setLastSavedAt(persistGeneratedPayload(genData.project) ?? "");
        const generationCompliancePassed = Boolean(genData?.compliance?.passed);
        const generationViolations: string[] = Array.isArray(genData?.compliance?.violations) ? genData.compliance.violations : [];
        setCompliancePassed(runCompliancePassed && generationCompliancePassed);
        setViolations(Array.from(new Set([...runViolations, ...generationViolations])));
        const gate = validateSourceOfTruthExport(genData.project);
        setValidationErrors(Array.from(new Set([...(runCompliancePassed ? [] : runViolations), ...gate.errors])));
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
    setLastSavedAt("");
    setCompliancePassed(false);
    setViolations([]);
    setImportMessage("");
  };

  const handleExport = () => {
    if (!canExport || !generated) return;
    setLastSavedAt(persistGeneratedPayload(generated) ?? "");
    const blob = new Blob([JSON.stringify(generated, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "web-do-24h-launch-pack.json";
    a.click();
    URL.revokeObjectURL(url);
    setImportMessage(translate("app.exportPrepared"));
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

  const handleMagicPrompt = useCallback(async () => {
    if (!brief.projectName.trim()) {
      setValidationErrors([translate("app.magicPromptMissingProjectName")]);
      setImportMessage(translate("app.magicPromptMissingProjectName"));
      return;
    }

    const deterministicDraft = createDeterministicMagicDraft(brief);
    setBrief((prev) => ({
      ...prev,
      description: deterministicDraft.description,
      goal: prev.goal.trim() ? prev.goal : deterministicDraft.goal,
      targetAudience: prev.targetAudience.trim() ? prev.targetAudience : deterministicDraft.targetAudience,
      preferredTone: prev.preferredTone.trim() ? prev.preferredTone : deterministicDraft.preferredTone,
    }));
    setValidationErrors([]);
    setImportMessage(translate("app.magicPromptPreparing"));
    setIsGeneratingPrompt(true);

    try {
      const shortContext = [brief.goal, brief.targetAudience, brief.preferredTone]
        .filter(Boolean)
        .map((v) => v.trim())
        .filter((v) => v.length > 0)
        .join(" | ");

      let aiText = "";
      let attemptError = "";

      for (let attempt = 1; attempt <= MAGIC_MAX_ATTEMPTS; attempt += 1) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), MAGIC_TIMEOUT_MS);
        const model = attempt === 1 ? "mistral-small" : "mistral-large-latest";

        try {
          const generationPrompt = [
            "Vráť STRICT JSON objekt bez markdownu s kľúčmi: description, goal, targetAudience, preferredTone.",
            `Project Name: ${brief.projectName.trim()}`,
            `Project Type: ${brief.projectType}`,
            `Context: ${shortContext || "none"}`,
            "",
            "Rules:",
            "- content must be production-grade and concrete",
            "- no fake claims, no manipulated urgency, no placeholders",
            "- no forbidden investment wording",
            "- use clean plain text only",
            "- description should be launch-ready for LE Studio brief",
          ].join("\\n");

          const res = await fetch("/api/ai/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              provider: "mistral",
              model,
              temperature: 0.45,
              prompt: generationPrompt,
            }),
            signal: controller.signal,
          });
          const data = await res.json().catch(() => ({}));
          clearTimeout(timeout);

          if (!res.ok || !data?.text) {
            attemptError = `attempt_${attempt}_failed`;
            continue;
          }

          aiText = String(data.text);
          break;
        } catch {
          clearTimeout(timeout);
          attemptError = `attempt_${attempt}_failed`;
        }
      }

      if (!aiText) {
        setImportMessage(`${translate("app.magicPromptFallback")} (${attemptError || "network"})`);
        return;
      }

      const parsed = parseMagicPayload(aiText);
      setBrief((prev) => {
        const next = { ...prev };
        const safeDescription = parsed.description && isSafeMagicText(parsed.description) ? parsed.description : deterministicDraft.description;
        next.description = safeDescription;
        if (!prev.goal.trim()) {
          next.goal = parsed.goal && isSafeMagicText(parsed.goal) ? parsed.goal : deterministicDraft.goal;
        }
        if (!prev.targetAudience.trim()) {
          next.targetAudience =
            parsed.targetAudience && isSafeMagicText(parsed.targetAudience) ? parsed.targetAudience : deterministicDraft.targetAudience;
        }
        if (!prev.preferredTone.trim()) {
          next.preferredTone =
            parsed.preferredTone && isSafeMagicText(parsed.preferredTone) ? parsed.preferredTone : deterministicDraft.preferredTone;
        }
        return next;
      });
      setImportMessage(translate("app.magicPromptSuccess"));
    } catch {
      setImportMessage(translate("app.magicPromptError"));
    } finally {
      setIsGeneratingPrompt(false);
    }
  }, [brief, translate]);

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
  const projectTypeLabel = translate(PROJECT_TYPE_LABEL_KEYS[brief.projectType]);
  const latestEvent = timeline[timeline.length - 1];
  const latestEventText = latestEvent
    ? `${latestEvent.nodeLabel}: ${latestEvent.message}`
    : translate("timeline.empty");

  return (
    <div className="app-shell launch-studio-shell relative flex h-[100vh] h-[100dvh] flex-col overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(16,185,129,0.1),transparent_30%),radial-gradient(circle_at_90%_10%,rgba(59,130,246,0.08),transparent_28%)]" />
      <nav className="xl:hidden flex h-12 shrink-0 items-center justify-between border-b border-zinc-800/70 bg-zinc-950/80 px-3 backdrop-blur-md">
        <button
          type="button"
          onClick={handleReset}
          className="rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
          aria-label={translate("common.resetWorkflow")}
          title={translate("common.resetWorkflow")}
        >
          <X className="h-[18px] w-[18px]" />
        </button>
        <div className="text-xs font-medium tracking-wide text-zinc-400">studio.rubberduck.sk</div>
        <button
          type="button"
          onClick={() => setShowJson((v) => !v)}
          className="rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
          aria-label={translate("common.codeJsonView")}
          title={translate("common.codeJsonView")}
        >
          <Monitor className="h-[18px] w-[18px]" />
        </button>
      </nav>

      <header className="xl:hidden flex shrink-0 items-center justify-between px-4 py-3">
        <h1 className="text-lg font-bold leading-none text-zinc-50">{translate("app.brandName")}</h1>
        <div className="flex items-center overflow-hidden rounded-md border border-emerald-900/40">
          <span className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/50">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            LIVE
          </span>
          <span className="border-l border-emerald-900/40 bg-zinc-900 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
            {translate("app.brandTop")}
          </span>
        </div>
      </header>

      <div className="hidden xl:block">
        <WorkflowToolbar
          workflowName={workflowName}
          onWorkflowNameChange={setWorkflowName}
          onRun={handleRun}
          onSave={handleSave}
          onLoad={handleLoad}
          onReset={handleReset}
          onAddNode={handleAddNode}
          onToggleJson={() => setShowJson((v) => !v)}
          onMagicPrompt={handleMagicPrompt}
          onExport={handleExport}
          isRunning={isRunning}
          dryRun={false}
          canExport={canExport}
          isGeneratingPrompt={isGeneratingPrompt}
        />
      </div>

      <main className="relative z-10 min-h-0 flex-1 overflow-y-auto px-3 pb-2 xl:overflow-hidden xl:p-3">
        <div className="mx-auto flex h-full min-h-0 w-full max-w-[1800px] flex-col gap-3 xl:grid xl:grid-cols-12">
          <div className="flex min-h-0 flex-col gap-3 xl:col-span-8">
            <section className="shrink-0 rounded-2xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900 to-zinc-950 p-3 shadow-[0_14px_50px_rgba(0,0,0,0.35)] xl:rounded-xl xl:p-4">
              <h2 className="text-sm font-semibold text-zinc-50">{translate("app.headline")}</h2>
              <p className="text-xs text-zinc-300/95">{translate("app.subheadline")}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 xl:gap-3">
                <div>
                  <label htmlFor="brief-project-type" className="mb-1 block text-xs text-zinc-300">
                    {translate("app.projectType")}
                  </label>
                  <ProjectTypeSelector
                    id="brief-project-type"
                    ariaLabel={translate("app.projectType")}
                    value={brief.projectType as ProjectType}
                    onChange={(projectType) => setBrief((b) => ({ ...b, projectType }))}
                  />
                </div>
                <div>
                  <label htmlFor="brief-project-name" className="mb-1 block text-xs text-zinc-300">
                    {translate("app.projectName")}
                  </label>
                  <input
                    id="brief-project-name"
                    className="h-9 w-full rounded-lg border border-zinc-700/90 bg-zinc-950/90 px-3 text-xs text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 xl:h-10 xl:rounded-md xl:text-sm"
                    value={brief.projectName}
                    onChange={(e) => setBrief((b) => ({ ...b, projectName: e.target.value }))}
                  />
                </div>
                <div>
                  <label htmlFor="brief-target-audience" className="mb-1 block text-xs text-zinc-300">
                    {translate("app.targetAudience")}
                  </label>
                  <input
                    id="brief-target-audience"
                    className="h-9 w-full rounded-lg border border-zinc-700/90 bg-zinc-950/90 px-3 text-xs text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 xl:h-10 xl:rounded-md xl:text-sm"
                    value={brief.targetAudience}
                    onChange={(e) => setBrief((b) => ({ ...b, targetAudience: e.target.value }))}
                  />
                </div>
                <div>
                  <label htmlFor="brief-goal" className="mb-1 block text-xs text-zinc-300">
                    {translate("app.goal")}
                  </label>
                  <input
                    id="brief-goal"
                    className="h-9 w-full rounded-lg border border-zinc-700/90 bg-zinc-950/90 px-3 text-xs text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 xl:h-10 xl:rounded-md xl:text-sm"
                    value={brief.goal}
                    onChange={(e) => setBrief((b) => ({ ...b, goal: e.target.value }))}
                  />
                </div>
                <div className="col-span-2">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <label htmlFor="brief-description" className="block text-xs text-zinc-300">
                      {translate("app.description")}
                    </label>
                    <button
                      type="button"
                      onClick={handleMagicPrompt}
                      disabled={isGeneratingPrompt}
                      aria-label={translate("common.improvePrompt")}
                      title={translate("common.improvePrompt")}
                      className="inline-flex items-center gap-1 rounded-md border border-emerald-700/60 bg-emerald-950/30 px-2 py-1 text-[10px] font-medium text-emerald-200 transition-colors hover:border-emerald-400 hover:bg-emerald-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 disabled:cursor-not-allowed disabled:opacity-50 xl:hidden"
                    >
                      <WandSparkles className="h-3.5 w-3.5" />
                      <span>{isGeneratingPrompt ? translate("app.magicPromptRunning") : translate("common.magicPrompt")}</span>
                    </button>
                  </div>
                  <textarea
                    id="brief-description"
                    className="h-9 w-full resize-none rounded-lg border border-zinc-700/90 bg-zinc-950/90 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 xl:h-auto xl:rounded-md xl:text-sm"
                    rows={2}
                    value={brief.description}
                    onChange={(e) => setBrief((b) => ({ ...b, description: e.target.value }))}
                  />
                </div>
                <div>
                  <label htmlFor="brief-preferred-tone" className="mb-1 block text-xs text-zinc-300">
                    {translate("app.preferredTone")}
                  </label>
                  <input
                    id="brief-preferred-tone"
                    className="h-9 w-full rounded-lg border border-zinc-700/90 bg-zinc-950/90 px-3 text-xs text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 xl:h-10 xl:rounded-md xl:text-sm"
                    value={brief.preferredTone}
                    onChange={(e) => setBrief((b) => ({ ...b, preferredTone: e.target.value }))}
                  />
                </div>
                <div>
                  <label htmlFor="brief-contact-email" className="mb-1 block text-xs text-zinc-300">
                    {translate("app.contactEmail")}
                  </label>
                  <input
                    id="brief-contact-email"
                    type="email"
                    className="h-9 w-full rounded-lg border border-zinc-700/90 bg-zinc-950/90 px-3 text-xs text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 xl:h-10 xl:rounded-md xl:text-sm"
                    value={brief.contactEmail ?? ""}
                    onChange={(e) => setBrief((b) => ({ ...b, contactEmail: e.target.value }))}
                  />
                </div>
              </div>
            </section>

            <section className="relative flex-1 min-h-[180px] overflow-hidden rounded-2xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900 to-zinc-950 shadow-[0_14px_50px_rgba(0,0,0,0.35)] xl:min-h-0 xl:rounded-xl">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#2a2a2a_1px,transparent_1px)] [background-size:12px_12px] opacity-60 xl:hidden" />
              <div className="relative h-full w-full">
                <LaunchCanvas
                  nodes={nodes as WorkflowNode[]}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onNodeClick={handleNodeClick}
                />
              </div>
            </section>

            <section className="xl:hidden shrink-0 flex gap-3 overflow-x-auto pb-1 snap-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <article className="w-44 shrink-0 snap-start rounded-2xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900 to-zinc-950 p-3 shadow-[0_12px_30px_rgba(0,0,0,0.28)]">
                <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-zinc-100">
                  <Database className="h-3 w-3 text-blue-400" />
                  {translate("inspector.launchSummary")}
                </h4>
                <div className="space-y-1.5 text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">{translate("inspector.projectType")}:</span>
                    <span className="font-medium text-zinc-300">{projectTypeLabel}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">{translate("inspector.complianceStatus")}:</span>
                    <span className={compliancePassed ? "font-medium text-emerald-300" : "font-medium text-amber-300"}>
                      {compliancePassed ? translate("inspector.passed") : translate("inspector.pendingFailed")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">{translate("inspector.exportReadiness")}:</span>
                    <span className={canExport ? "font-medium text-emerald-300" : "font-medium text-zinc-300"}>
                      {canExport ? translate("inspector.ready") : translate("inspector.blocked")}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleImportDryRun}
                  disabled={!compliancePassed || !generated}
                  className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1 text-[10px] font-medium text-zinc-300 transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {translate("app.prepareWpImport")}
                </button>
              </article>

              {showJson ? (
                <article className="flex w-44 shrink-0 snap-start flex-col justify-between rounded-2xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900 to-zinc-950 p-3 shadow-[0_12px_30px_rgba(0,0,0,0.28)]">
                  <div>
                    <h4 className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-zinc-100">
                      <FileJson className="h-3 w-3 text-purple-400" />
                      {translate("jsonPreview.title")}
                    </h4>
                    <p className="text-[9px] leading-tight text-zinc-500">{translate("jsonPreview.metaboxNotice")}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExport}
                    disabled={!canExport}
                    className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 py-1 text-[10px] font-medium text-zinc-300 transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {translate("common.exportJson")}
                  </button>
                </article>
              ) : null}

              <article className="w-44 shrink-0 snap-start rounded-2xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900 to-zinc-950 p-3 shadow-[0_12px_30px_rgba(0,0,0,0.28)]">
                <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-zinc-100">
                  <Activity className="h-3 w-3 text-orange-400" />
                  {translate("timeline.title")}
                </h4>
                <p className="line-clamp-3 text-[10px] text-zinc-400">{latestEventText}</p>
              </article>
            </section>

            <section className="xl:hidden rounded-2xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900 to-zinc-950 p-3 shadow-[0_12px_30px_rgba(0,0,0,0.28)]" aria-live="polite">
              <div className="text-[10px] text-emerald-300">LIVE mode active. Real user inputs required.</div>
              {violations.length > 0 ? (
                <div className="mt-1 text-[10px] text-rose-400">
                  {translate("app.complianceViolations")}: {violations.join(", ")}
                </div>
              ) : null}
              {validationErrors.length > 0 ? (
                <div className="mt-1 text-[10px] text-amber-300">
                  {translate("app.validationErrors")}: {validationErrors.join(", ")}
                </div>
              ) : null}
              {importMessage ? <div className="mt-1 text-[10px] text-zinc-300">{importMessage}</div> : null}
            </section>
          </div>

          <aside className="hidden min-h-0 flex-col gap-3 overflow-hidden xl:col-span-4 xl:flex">
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
                <JsonPreview data={generated} blocked={!canExport} onExport={handleExport} lastSavedAt={lastSavedAt} />
              </div>
            ) : null}
            <div className="rounded-xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900 to-zinc-950 p-4 shadow-[0_14px_40px_rgba(0,0,0,0.3)]">
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
                <div className="mt-2 text-xs text-rose-400">
                  {translate("app.complianceViolations")}: {violations.join(", ")}
                </div>
              ) : null}
              {validationErrors.length > 0 ? (
                <div className="mt-2 text-xs text-amber-300">
                  {translate("app.validationErrors")}: {validationErrors.join(", ")}
                </div>
              ) : null}
              {importMessage ? <div className="mt-2 text-xs text-zinc-300">{importMessage}</div> : null}
            </div>
          </aside>
        </div>
      </main>

      <footer
        className="xl:hidden shrink-0 border-t border-zinc-800/80 bg-zinc-950/95 px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2 backdrop-blur"
        aria-label={translate("app.mobileActionBarLabel")}
      >
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <button
            type="button"
            onClick={handleRun}
            disabled={isRunning}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 text-sm font-semibold text-zinc-950 shadow-[0_10px_30px_rgba(16,185,129,0.18)] transition-colors hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Play className="h-4 w-4" />
            <span>{isRunning ? translate("common.running") : translate("common.run")}</span>
          </button>
          <button
            type="button"
            onClick={handleMagicPrompt}
            disabled={isGeneratingPrompt}
            aria-label={translate("common.improvePrompt")}
            title={translate("common.improvePrompt")}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-700/70 bg-emerald-950/40 text-emerald-200 transition-colors hover:border-emerald-400 hover:bg-emerald-900/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <WandSparkles className={isGeneratingPrompt ? "h-4 w-4 animate-pulse" : "h-4 w-4"} />
          </button>
          <button
            type="button"
            onClick={() => setShowJson((v) => !v)}
            aria-label={translate("common.preview")}
            title={translate("common.preview")}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 transition-colors hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
          >
            <Compass className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={!canExport}
            aria-label={translate("common.exportJson")}
            title={translate("common.exportJson")}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 transition-colors hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
        <p className="sr-only" aria-live="polite">
          {isGeneratingPrompt ? translate("app.magicPromptRunning") : importMessage}
        </p>
      </footer>
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
