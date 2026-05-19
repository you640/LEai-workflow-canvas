"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LaunchBriefInput, ProjectType } from "@/types/workflow";
import { useI18n } from "@/lib/i18n/client";
import { validateLiveBrief } from "@/lib/launch-studio/brief-validation";
import { saveProjectConfig } from "@/lib/launch-studio/project-store";

type Props = {
  initialPlan: string;
  initialType?: ProjectType;
};

type ProjectCard = {
  type: ProjectType;
  title: string;
  descriptionSk: string;
  descriptionEn: string;
};

const PROJECT_CARDS: ProjectCard[] = [
  {
    type: "business",
    title: "Business landing page",
    descriptionSk: "Pre služby, firmy, remeslá, salóny, fitness, konzultantov a lokálne podniky.",
    descriptionEn: "For services, companies, trades, salons, fitness, consultants, and local businesses.",
  },
  {
    type: "saas",
    title: "SaaS landing page",
    descriptionSk: "Pre MVP, waitlist, produktové demo, pricing a prvých používateľov.",
    descriptionEn: "For MVP, waitlist, product demo, pricing, and first users.",
  },
  {
    type: "booking",
    title: "Booking page",
    descriptionSk: "Pre služby, ktoré potrebujú rezervácie, objednávky alebo kontaktný flow.",
    descriptionEn: "For services that need bookings, reservations, or a contact flow.",
  },
  {
    type: "product-launch",
    title: "Product launch page",
    descriptionSk: "Pre nový produkt, preorder, beta launch alebo predajnú stránku.",
    descriptionEn: "For new product, preorder, beta launch, or sales page.",
  },
  {
    type: "support-campaign",
    title: "Support Campaign",
    descriptionSk: "Donation, reward alebo preorder stránka pre komunitný projekt, produkt alebo iniciatívu.",
    descriptionEn: "Donation, reward, or preorder page for a community project, product, or initiative.",
  },
  {
    type: "personal-brand",
    title: "Personal brand page",
    descriptionSk: "Pre freelancerov, tvorcov, expertov, portfóliá a osobné značky.",
    descriptionEn: "For freelancers, creators, experts, portfolios, and personal brands.",
  },
];

function safePlan(plan: string): string {
  const normalized = plan.trim().toLowerCase();
  if (!normalized) return "launch-pack";
  return normalized.replace(/[^a-z0-9-]/g, "");
}

export function BriefPageClient({ initialPlan, initialType }: Props) {
  const router = useRouter();
  const { locale, translate } = useI18n();

  const [selectedType, setSelectedType] = useState<ProjectType>(initialType ?? "business");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const plan = useMemo(() => safePlan(initialPlan), [initialPlan]);

  const [brief, setBrief] = useState<LaunchBriefInput>({
    projectType: initialType ?? "business",
    projectName: "",
    targetAudience: "",
    goal: "",
    description: "",
    preferredTone: "",
    contactEmail: "",
  });

  const ui = locale === "sk"
    ? {
        title: "Spustiť plán",
        subtitle: "Vyber typ projektu a pokračuj briefom.",
        planLabel: "Zvolený balík",
        sectionTypes: "Typ projektu",
        sectionBrief: "Launch brief",
        proceed: "Pokračovať do LE Studia",
        offerLink: "Pozrieť ponuku Web do 24h",
        helper: "Po odoslaní sa brief uloží a otvorí sa workflow s predvyplnenými dátami.",
      }
    : {
        title: "Start Plan",
        subtitle: "Choose a project type and continue with the brief.",
        planLabel: "Selected plan",
        sectionTypes: "Project type",
        sectionBrief: "Launch brief",
        proceed: "Continue to LE Studio",
        offerLink: "View Web do 24h offer",
        helper: "After submit, the brief is saved and workflow opens with prefilled data.",
      };

  const updateBrief = (patch: Partial<LaunchBriefInput>) => {
    setBrief((prev) => ({ ...prev, ...patch }));
  };

  const onSubmit = () => {
    const normalized: LaunchBriefInput = {
      ...brief,
      projectType: selectedType,
      projectName: brief.projectName.trim(),
      targetAudience: brief.targetAudience.trim(),
      goal: brief.goal.trim(),
      description: brief.description.trim(),
      preferredTone: brief.preferredTone.trim(),
      contactEmail: brief.contactEmail?.trim(),
    };

    const validationErrors = validateLiveBrief(normalized);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setErrors([]);
    saveProjectConfig(normalized);
    router.push(`/launch-studio?plan=${encodeURIComponent(plan)}&type=${encodeURIComponent(selectedType)}`);
  };

  return (
    <main className="min-h-[100vh] min-h-[100dvh] bg-[radial-gradient(1400px_700px_at_20%_-10%,#1d4ed8_0%,rgba(29,78,216,0)_55%),radial-gradient(900px_500px_at_80%_0%,#065f46_0%,rgba(6,95,70,0)_60%),#09090b] text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-2xl border border-zinc-700/60 bg-zinc-900/70 p-6 backdrop-blur">
          <div className="mb-3 inline-flex items-center rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            {ui.planLabel}: {plan}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{ui.title}</h1>
          <p className="mt-2 text-sm text-zinc-300 sm:text-base">{ui.subtitle}</p>
          <Link href="/web-do-24h" className="mt-4 inline-flex text-sm font-semibold text-emerald-300 underline-offset-4 hover:underline">
            {ui.offerLink}
          </Link>
        </div>

        <section className="mb-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">{ui.sectionTypes}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PROJECT_CARDS.map((card) => {
              const active = card.type === selectedType;
              return (
                <button
                  key={card.type}
                  type="button"
                  onClick={() => {
                    setSelectedType(card.type);
                    updateBrief({ projectType: card.type });
                  }}
                  className={[
                    "rounded-xl border p-4 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80",
                    active
                      ? "border-emerald-400/60 bg-emerald-500/10 shadow-[0_0_0_1px_rgba(16,185,129,0.35)]"
                      : "border-zinc-700/70 bg-zinc-900/75 hover:border-zinc-500 hover:bg-zinc-900",
                  ].join(" ")}
                >
                  <div className="mb-1 text-sm font-semibold text-zinc-100">{card.title}</div>
                  <p className="text-xs leading-relaxed text-zinc-300">
                    {locale === "sk" ? card.descriptionSk : card.descriptionEn}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-700/70 bg-zinc-900/80 p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">{ui.sectionBrief}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-zinc-200">
              <span className="mb-1 block">{translate("app.projectName")}</span>
              <input
                id="brief-project-name"
                value={brief.projectName}
                onChange={(e) => updateBrief({ projectName: e.target.value })}
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80"
              />
            </label>

            <label className="text-sm text-zinc-200">
              <span className="mb-1 block">{translate("app.targetAudience")}</span>
              <input
                id="brief-target-audience"
                value={brief.targetAudience}
                onChange={(e) => updateBrief({ targetAudience: e.target.value })}
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80"
              />
            </label>

            <label className="text-sm text-zinc-200 sm:col-span-2">
              <span className="mb-1 block">{translate("app.goal")}</span>
              <input
                id="brief-goal"
                value={brief.goal}
                onChange={(e) => updateBrief({ goal: e.target.value })}
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80"
              />
            </label>

            <label className="text-sm text-zinc-200 sm:col-span-2">
              <span className="mb-1 block">{translate("app.description")}</span>
              <textarea
                id="brief-description"
                rows={5}
                value={brief.description}
                onChange={(e) => updateBrief({ description: e.target.value })}
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80"
              />
            </label>

            <label className="text-sm text-zinc-200">
              <span className="mb-1 block">{translate("app.preferredTone")}</span>
              <input
                id="brief-preferred-tone"
                value={brief.preferredTone}
                onChange={(e) => updateBrief({ preferredTone: e.target.value })}
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80"
              />
            </label>

            <label className="text-sm text-zinc-200">
              <span className="mb-1 block">{translate("app.contactEmail")}</span>
              <input
                id="brief-contact-email"
                type="email"
                value={brief.contactEmail ?? ""}
                onChange={(e) => updateBrief({ contactEmail: e.target.value })}
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80"
              />
            </label>
          </div>

          {errors.length > 0 ? (
            <div className="mt-4 rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
              {translate("app.validationErrors")}: {errors.join(", ")}
            </div>
          ) : null}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-zinc-400">{ui.helper}</p>
            <button
              type="button"
              onClick={onSubmit}
              disabled={submitting}
              className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {ui.proceed}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
