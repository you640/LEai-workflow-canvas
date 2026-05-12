import { z } from "zod";

const ProjectTypeSchema = z.enum([
  "business",
  "saas",
  "booking",
  "product-launch",
  "support-campaign",
  "personal-brand",
]);

const baseSchema = z.object({
  dryRun: z.boolean(),
  project: z.object({
    name: z.string().min(1),
    type: ProjectTypeSchema,
    goal: z.string().min(1),
    audience: z.string().min(1),
    description: z.string().min(1),
    tone: z.string().min(1),
  }),
  strategy: z.object({ positioning: z.string(), valueProposition: z.string(), primaryCTA: z.string() }),
  page: z.object({ headline: z.string(), subheadline: z.string(), sections: z.array(z.object({ id: z.string(), title: z.string(), body: z.string() })) }),
  seo: z.object({ title: z.string(), description: z.string(), ogTitle: z.string(), ogDescription: z.string() }),
  template: z.object({ preset: z.string() }),
  faq: z.array(z.object({ question: z.string(), answer: z.string() })),
  launchPack: z.object({ checklist: z.array(z.string()), nextSteps: z.array(z.string()) }),
});

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const business = {
  dryRun: true,
  project: { name: "Demo", type: "business", goal: "Launch", audience: "SMB", description: "Desc", tone: "clean" },
  strategy: { positioning: "pos", valueProposition: "vp", primaryCTA: "cta" },
  page: { headline: "h", subheadline: "s", sections: [{ id: "hero", title: "Hero", body: "Body" }] },
  seo: { title: "t", description: "d", ogTitle: "ot", ogDescription: "od" },
  template: { preset: "local-business" },
  faq: [{ question: "q", answer: "a" }],
  launchPack: { checklist: ["x"], nextSteps: ["y"] },
};

const support = {
  ...business,
  project: { ...business.project, type: "support-campaign" },
};

assert(baseSchema.safeParse(business).success, "business schema should pass");
assert(baseSchema.safeParse(support).success, "support schema should pass");
assert(!baseSchema.safeParse({ ...business, project: { ...business.project, type: "bad" } }).success, "invalid project type should fail");
console.log("schema checks passed");
