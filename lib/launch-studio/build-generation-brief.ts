import type { LaunchStudioGeneratedBrief, LaunchStudioInput } from "@/lib/launch-studio/source-of-truth-schema";
import { stripHtmlForPlainText } from "@/lib/launch-studio/content-format";

export function buildLaunchStudioGenerationBrief(input: LaunchStudioInput): LaunchStudioGeneratedBrief {
  return {
    identity: {
      name: stripHtmlForPlainText(input.projectName),
      type: input.projectType,
    },
    audience: stripHtmlForPlainText(input.targetAudience),
    goal: stripHtmlForPlainText(input.goal),
    description: stripHtmlForPlainText(input.description),
    tone: stripHtmlForPlainText(input.preferredTone),
    contactEmail: stripHtmlForPlainText(input.contactEmail),
    qualityRules: [
      "Použi konkrétny, finálny slovník vhodný priamo na web.",
      "Žiadne placeholder texty ani inštrukcie typu 'tu doplniť obsah'.",
      "Každá sekcia má mať jasnú hodnotu pre klienta a akčný krok."
    ],
    complianceRules: [
      "Bez fake referencií, fake počtov klientov a fake revenue.",
      "Bez garantovaných výsledkov, rankingov alebo príjmu.",
      "Bez manipulatívnej urgency, lotérie alebo gambling mechaník.",
      "Bez unsafe technických odporúčaní a bypassov."
    ]
  };
}
