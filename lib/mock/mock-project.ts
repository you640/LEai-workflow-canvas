import type { LaunchBriefInput } from "@/types/workflow";
import { ProjectLaunchSchema, type ProjectLaunch } from "@/lib/schemas/project.schema";

const PRESET_BY_TYPE: Record<LaunchBriefInput["projectType"], string> = {
  business: "local-business",
  saas: "saas-clean",
  booking: "booking-flow",
  "product-launch": "product-launch",
  "support-campaign": "support-campaign",
  "personal-brand": "personal-brand",
};

const SAFE_FAQ = [
  {
    question: "Ako rýchlo vieme spustiť stránku?",
    answer: "Základný výstup je pripravený na spustenie v krátkom čase po schválení briefu.",
  },
  {
    question: "Je výstup vhodný pre mobil?",
    answer: "Áno, štruktúra je navrhnutá mobile-first a pripravená na responzívny render.",
  },
];

export function buildMockProject(brief: LaunchBriefInput): ProjectLaunch {
  const basePayload = {
    dryRun: true,
    project: {
      name: brief.projectName,
      goal: brief.goal,
      audience: brief.targetAudience,
      description: brief.description,
      tone: brief.preferredTone,
      contactEmail: brief.contactEmail,
      deadline: brief.deadline,
    },
    strategy: {
      positioning: `${brief.projectName} ako praktický ${brief.projectType} projekt pre rýchly launch.`,
      valueProposition: "Jasná ponuka, čitateľné sekcie a konkrétny krok pre návštevníka.",
      primaryCTA: "Spustiť plán",
      secondaryCTA: "Pozrieť možnosti",
    },
    page: {
      headline: `Od nápadu po hotový web za 24 hodín pre ${brief.projectName}`,
      subheadline: "Vyber smer, doplň brief a AI Launch Studio pripraví štruktúru aj texty pripravené na spustenie.",
      sections: [
        { id: "hero", title: "Hero", body: "Krátke vysvetlenie hodnoty a hlavný CTA krok.", cta: "Spustiť plán" },
        { id: "benefits", title: "Benefits", body: "Hlavné prínosy pre cieľovú skupinu v stručných bodoch." },
        { id: "how-it-works", title: "How it works", body: "Tri až štyri kroky od briefu po spustenie." },
        { id: "offer", title: "Offer", body: "Balíky alebo varianty ponuky podľa typu projektu." },
        { id: "faq", title: "FAQ", body: "Najčastejšie otázky a jasné odpovede." },
        { id: "contact", title: "Contact", body: "Kontaktný alebo brief formulár pre ďalší krok.", cta: "Odoslať brief" },
      ],
    },
    seo: {
      title: `${brief.projectName} | Web do 24h by Rubberduck`,
      description: "Od nápadu po hotový web za 24 hodín. Štruktúra, texty a výstup pripravený na spustenie.",
      ogTitle: `${brief.projectName} — AI Launch Studio`,
      ogDescription: "Rýchly launch webu cez vizuálny workflow s pripraveným výstupom.",
    },
    template: {
      preset: PRESET_BY_TYPE[brief.projectType],
      accentColor: "#22c55e",
    },
    faq: SAFE_FAQ,
    launchPack: {
      checklist: [
        "Potvrdiť headline a hlavné CTA",
        "Skontrolovať obsah sekcií a FAQ",
        "Overiť kontaktné údaje a termín",
        "Spustiť finálny export JSON",
      ],
      nextSteps: ["Doplniť finálne brand assety", "Prejsť QA audit", "Schváliť publikáciu"],
    },
  };

  if (brief.projectType === "support-campaign") {
    return ProjectLaunchSchema.parse({
      ...basePayload,
      project: {
        ...basePayload.project,
        type: "support-campaign",
      },
      supportCampaign: {
        mode: "donation",
        targetAmount: 10000,
        currency: "EUR",
        rewards: [
          {
            title: "Supporter",
            description: "Poďakovanie pre supporters a backers.",
            minimumAmount: 25,
            isDigital: true,
            requiresShipping: false,
          },
        ],
      },
    });
  }

  return ProjectLaunchSchema.parse({
    ...basePayload,
    project: {
      ...basePayload.project,
      type: brief.projectType,
    },
  });
}
