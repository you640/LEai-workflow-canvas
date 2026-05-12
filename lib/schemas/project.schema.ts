import { z } from "zod";

export const ProjectTypeSchema = z.enum([
  "business",
  "saas",
  "booking",
  "product-launch",
  "support-campaign",
  "personal-brand",
]);

const sectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  cta: z.string().min(1).optional(),
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
  mode: z.enum(["donation", "reward", "preorder"]),
  targetAmount: z.number().positive().optional(),
  currency: z.enum(["EUR", "USD", "GBP"]).optional(),
  rewards: z.array(rewardsSchema).optional(),
});

const baseSchema = z.object({
  dryRun: z.boolean(),
  project: z.object({
    name: z.string().min(1),
    type: ProjectTypeSchema,
    goal: z.string().min(1),
    audience: z.string().min(1),
    description: z.string().min(1),
    tone: z.string().min(1),
    contactEmail: z.string().email().optional(),
    deadline: z.string().min(1).optional(),
  }),
  strategy: z.object({
    positioning: z.string().min(1),
    valueProposition: z.string().min(1),
    primaryCTA: z.string().min(1),
    secondaryCTA: z.string().min(1).optional(),
  }),
  page: z.object({
    headline: z.string().min(1),
    subheadline: z.string().min(1),
    sections: z.array(sectionSchema).min(1),
  }),
  seo: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    ogTitle: z.string().min(1),
    ogDescription: z.string().min(1),
  }),
  template: z.object({
    preset: z.string().min(1),
    accentColor: z.string().min(1).optional(),
  }),
  faq: z.array(faqSchema).min(1),
  launchPack: z.object({
    checklist: z.array(z.string().min(1)).min(1),
    nextSteps: z.array(z.string().min(1)).min(1),
  }),
});

const supportSchema = baseSchema.extend({
  project: baseSchema.shape.project.extend({
    type: z.literal("support-campaign"),
  }),
  supportCampaign: supportCampaignSchema,
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
