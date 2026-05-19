import { z } from "zod";

export const ProjectTypeSchema = z.enum([
  "business",
  "saas",
  "booking",
  "product-launch",
  "support-campaign",
  "personal-brand",
]);

export const REQUIRED_SECTION_IDS = ["hero", "benefits", "process", "offer", "trust", "faq", "contact"] as const;

const sectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  bullets: z.array(z.string().min(1)).min(1),
  cta: z.string().min(1).nullable(),
});

const faqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

const rewardsSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  minimumAmount: z.number().nonnegative(),
  isDigital: z.boolean(),
  requiresShipping: z.boolean(),
});

const supportCampaignSchema = z.object({
  mode: z.enum(["donation", "reward", "preorder"]).optional(),
  targetAmount: z.number().positive().nullable().optional(),
  currency: z.enum(["EUR", "USD", "GBP"]).optional(),
  rewards: z.array(rewardsSchema).optional(),
});

const complianceSchema = z.object({
  passed: z.boolean(),
  violations: z.array(z.string()),
});

const baseSchema = z.object({
  dryRun: z.literal(true),
  project: z.object({
    name: z.string().min(1),
    type: ProjectTypeSchema,
    goal: z.string().min(1),
    audience: z.string().min(1),
    description: z.string().min(1),
    tone: z.string().min(1),
    contactEmail: z.string().email().min(1),
    deadline: z.string().min(1).optional(),
  }),
  strategy: z.object({
    positioning: z.string().min(1),
    valueProposition: z.string().min(1),
    primaryCTA: z.string().min(1),
    secondaryCTA: z.string().min(1),
  }),
  page: z.object({
    headline: z.string().min(1),
    subheadline: z.string().min(1),
    sections: z.array(sectionSchema).min(7),
  }),
  seo: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    ogTitle: z.string().min(1),
    ogDescription: z.string().min(1),
  }),
  faq: z.array(faqSchema).min(4),
  compliance: complianceSchema,
  technicalRecommendations: z.array(z.string().min(1)).min(1),
  securityRecommendations: z.array(z.string().min(1)).min(1),
  antiPatterns: z.array(z.string().min(1)).min(1),
  wordpressImportNotes: z.array(z.string().min(1)).min(1),
  launchPack: z.object({
    checklist: z.array(z.string().min(1)).min(1),
    nextSteps: z.array(z.string().min(1)).min(1),
  }),
  productionWrite: z.literal(false),
  wordpressPostId: z.null(),
});

const supportSchema = baseSchema.extend({
  project: baseSchema.shape.project.extend({
    type: z.literal("support-campaign"),
  }),
  supportCampaign: supportCampaignSchema.optional(),
});

const nonSupportSchema = baseSchema.extend({
  project: baseSchema.shape.project.extend({
    type: z.enum(["business", "saas", "booking", "product-launch", "personal-brand"]),
  }),
  supportCampaign: z.undefined().optional(),
});

export const ProjectLaunchSchema = z.union([supportSchema, nonSupportSchema]);

export type ProjectLaunch = z.infer<typeof ProjectLaunchSchema>;
export type ProjectType = z.infer<typeof ProjectTypeSchema>;
