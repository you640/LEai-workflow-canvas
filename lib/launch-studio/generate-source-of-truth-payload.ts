import type { LaunchStudioInput, SourceOfTruthExport } from "@/lib/launch-studio/source-of-truth-schema";
import { buildLaunchStudioGenerationBrief } from "@/lib/launch-studio/build-generation-brief";
import { normalizeToWordPressMetabox } from "@/lib/launch-studio/normalize-to-wordpress-metabox";
import { containsForbiddenClaims, stripHtmlForPlainText } from "@/lib/launch-studio/content-format";
import { randomId } from "@/lib/random-id";

const CLAIM_VIOLATION_CODES = [
  { code: "fake_testimonials", match: /fake testimonials?/i },
  { code: "fake_customer_count", match: /fake customer count/i },
  { code: "fake_revenue", match: /fake revenue/i },
  { code: "guaranteed_income", match: /guaranteed income/i },
  { code: "guaranteed_google_ranking", match: /guaranteed (first )?position in google/i },
  { code: "guaranteed_sales", match: /guaranteed sales/i },
  { code: "hidden_admin_bypass", match: /hidden admin bypass/i },
  { code: "lottery_or_gambling", match: /lottery|gambling/i },
  { code: "manipulative_urgency", match: /manipulative urgency/i },
] as const;

export function generateSourceOfTruthPayload(input: LaunchStudioInput): SourceOfTruthExport {
  // Launch Studio generates content-first payload only.
  // WordPress is responsible for storage and final frontend rendering.
  const brief = buildLaunchStudioGenerationBrief(input);
  const { wordpress, previewSections } = normalizeToWordPressMetabox(brief);

  const description = stripHtmlForPlainText(brief.description);
  const claimViolations = CLAIM_VIOLATION_CODES
    .filter((rule) => rule.match.test(description))
    .map((rule) => rule.code);
  const hasForbiddenClaims = containsForbiddenClaims(description);
  const violations = hasForbiddenClaims ? claimViolations : [];

  return {
    dryRun: false,
    productionWrite: false,
    wordpressPostId: null,
    projectId: randomId("project"),
    buildStatus: "ready",
    generatedAt: new Date().toISOString(),
    sourceOfTruth: "meta.numbers",
    schemaVersion: "1.0.0",
    project: {
      name: stripHtmlForPlainText(brief.identity.name),
      type: brief.identity.type,
      goal: stripHtmlForPlainText(brief.goal),
      audience: stripHtmlForPlainText(brief.audience),
      description,
      tone: stripHtmlForPlainText(brief.tone),
      contactEmail: stripHtmlForPlainText(brief.contactEmail)
    },
    wordpress,
    seo: {
      title: `${stripHtmlForPlainText(brief.identity.name)} | Web do 24h by Rubberduck`,
      description: "Moderný firemný web pripravený na klientov do 24 hodín. Štruktúra, obsah a bezpečný dry-run import payload.",
      ogTitle: `${stripHtmlForPlainText(brief.identity.name)} — AI Launch Studio`,
      ogDescription: "Rýchly a transparentný launch webu cez Launch Studio workflow."
    },
    faq: [
      {
        question: "Ako rýchlo vieme začať?",
        answer: "Po potvrdení briefu sa hneď pripraví štruktúra a obsah bez zbytočného čakania."
      },
      {
        question: "Je výstup pripravený pre WordPress?",
        answer: "Áno, výsledok je normalizovaný do metabox schémy a pripravený pre dry-run import preview."
      },
      {
        question: "Čo je súčasťou dodania?",
        answer: "H1, tagline, editor obsah, CTA, SEO metadata, FAQ a technické odporúčania."
      },
      {
        question: "Prečo je to bezpečné?",
        answer: "Systém beží v dry-run režime, productionWrite je false a wordpressPostId je vždy null."
      }
    ],
    compliance: {
      passed: violations.length === 0,
      violations
    },
    technicalRecommendations: [
      "Pred exportom validovať payload proti source-of-truth schéme.",
      "Udržať striktne mapovanie frontend vstupov na metabox polia.",
      "Použiť QA fixture gate pred každým release." 
    ],
    securityRecommendations: [
      "Nezapisovať do produkcie v dry-run režime.",
      "Nelogovať secrets ani auth hlavičky.",
      "Guardovať import cez server-side feature flag a compliance pass."
    ],
    antiPatterns: [
      "Nevkladať generické výplňové vety do final exportu.",
      "Nevymýšľať ceny, médiá alebo obchodné metriky bez vstupu.",
      "Neobchádzať validáciu exportu/importu."
    ],
    wordpressImportNotes: [
      "Import payload sa skladá z wordpress.main/post/services/products/media.",
      "UI preview môže používať _preview, ale import source je wordpress objekt.",
      "Pri neúspešnej compliance musí zostať export/import blokovaný."
    ],
    _preview: {
      sections: previewSections
    }
  };
}
