import type { LaunchBriefInput } from "@/types/workflow";

export interface LaunchStudioGenerationBrief {
  projectIdentity: {
    name: string;
    type: LaunchBriefInput["projectType"];
    contactEmail: string;
  };
  targetAudience: string;
  businessGoal: string;
  rawUserDescription: string;
  preferredTone: string;
  requiredOutputSchema: string[];
  contentQualityRules: string[];
  complianceRules: string[];
  forbiddenClaims: string[];
  wordpressDryRunConstraints: string[];
  seoRequirements: string[];
  faqRequirements: string[];
  sectionRequirements: string[];
  technicalSecurityRequirements: string[];
  explicitInputs: {
    hasTargetAmount: boolean;
    targetAmount: number | null;
    hasRewardsRequest: boolean;
  };
}

export function buildLaunchStudioGenerationBrief(input: LaunchBriefInput): LaunchStudioGenerationBrief {
  const cleanDescription = input.description.trim();
  const explicitTargetAmount =
    typeof input.targetAmount === "number" && Number.isFinite(input.targetAmount) && input.targetAmount > 0
      ? input.targetAmount
      : null;
  const target = explicitTargetAmount != null
    ? { hasTargetAmount: true, targetAmount: explicitTargetAmount }
    : { hasTargetAmount: false, targetAmount: null };
  const hasRewardsRequest = Boolean(input.rewardsRequested) || /(reward|odmena|rewards|odmeny|perk|preorder)/i.test(cleanDescription);

  return {
    projectIdentity: {
      name: input.projectName.trim(),
      type: input.projectType,
      contactEmail: (input.contactEmail ?? "").trim(),
    },
    targetAudience: input.targetAudience.trim(),
    businessGoal: input.goal.trim(),
    rawUserDescription: cleanDescription,
    preferredTone: input.preferredTone.trim(),
    requiredOutputSchema: [
      "dryRun/project/strategy/page/seo/faq/compliance/technicalRecommendations/securityRecommendations/antiPatterns/wordpressImportNotes/launchPack/productionWrite/wordpressPostId",
      "page.sections must include hero, benefits, process, offer, trust, faq, contact",
      "all section bodies must be final copy, no placeholders"
    ],
    contentQualityRules: [
      "Write concrete website-ready Slovak copy based on user input.",
      "Use details from target audience, goal and description in every section.",
      "No generic filler or meta instructions."
    ],
    complianceRules: [
      "No fake testimonials, fake customer counts, fake revenue, fake urgency.",
      "No guaranteed income, guaranteed ranking, or guaranteed outcomes.",
      "No gambling or lottery mechanics.",
      "No hidden admin bypass or unsafe technical advice."
    ],
    forbiddenClaims: [
      "fake testimonials",
      "fake customer count",
      "guaranteed income",
      "guaranteed first position in Google",
      "manipulative urgency",
      "gambling or lottery mechanics"
    ],
    wordpressDryRunConstraints: [
      "dryRun must stay true",
      "productionWrite must stay false",
      "wordpressPostId must stay null",
      "Prepare import payload preview only"
    ],
    seoRequirements: [
      "SEO title max ~65 chars",
      "SEO description max ~160 chars",
      "OG title/description aligned with primary CTA"
    ],
    faqRequirements: [
      "At least 4 FAQ entries",
      "Answers must be practical and transparent"
    ],
    sectionRequirements: ["hero", "benefits", "process", "offer", "trust", "faq", "contact"],
    technicalSecurityRequirements: [
      "Recommend schema validation and rate limits",
      "Recommend safe error handling and audit logs",
      "Recommend dry-run import until manual approval"
    ],
    explicitInputs: {
      hasTargetAmount: target.hasTargetAmount,
      targetAmount: target.targetAmount,
      hasRewardsRequest
    }
  };
}
