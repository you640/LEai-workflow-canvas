import { z } from "zod";
import type { ProjectType } from "@/types/workflow";

export type LaunchStudioInput = {
  projectType: ProjectType;
  projectName: string;
  targetAudience: string;
  goal: string;
  description: string;
  preferredTone: string;
  contactEmail: string;
  targetAmount?: number | null;
};

export type LaunchStudioGeneratedBrief = {
  identity: { name: string; type: ProjectType };
  audience: string;
  goal: string;
  description: string;
  tone: string;
  contactEmail: string;
  qualityRules: string[];
  complianceRules: string[];
};

export type MainMetabox = {
  title: string;
  slug: string;
  tagline: string;
  context: string;
  editor: string;
  label: string;
  link: string;
};

export type PostMetabox = {
  section: string[];
  topic: string[];
  source: string;
};

export type ServiceMetaboxItem = {
  type: string[];
  category: string[];
  badge: string[];
  price: number | null;
  duration: number | null;
  datetime: string | null;
};

export type ProductMetaboxItem = {
  type: string[];
  category: string[];
  badge: string[];
  brand: string[];
  stock: number | null;
  regular_price: number | null;
  reseller_price: number | null;
  sale_price: number | null;
  paylink: string | null;
};

export type MediaMetabox = {
  video: string | null;
  icon: string | null;
  image: string | null;
  gallery: string[];
  files: string[];
};

export type WordPressMetaboxPayload = {
  postType: string;
  postStatus: "draft";
  main: MainMetabox;
  post: PostMetabox;
  services: ServiceMetaboxItem[];
  products: ProductMetaboxItem[];
  media: MediaMetabox;
};

export type SourceOfTruthExport = {
  dryRun: false;
  productionWrite: false;
  wordpressPostId: null;
  sourceOfTruth: "meta.numbers";
  schemaVersion: "1.0.0";
  projectId: string;
  buildStatus: "ready";
  generatedAt: string;
  project: {
    name: string;
    type: ProjectType;
    goal: string;
    audience: string;
    description: string;
    tone: string;
    contactEmail: string;
  };
  wordpress: WordPressMetaboxPayload;
  seo: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
  };
  faq: { question: string; answer: string }[];
  compliance: { passed: boolean; violations: string[] };
  technicalRecommendations: string[];
  securityRecommendations: string[];
  antiPatterns: string[];
  wordpressImportNotes: string[];
  _preview?: {
    sections: Array<{ id: string; title: string; body: string; bullets: string[]; cta: string | null }>;
  };
};

const stringArray = z.array(z.string().min(1));

export const SourceOfTruthExportSchema = z.object({
  dryRun: z.literal(false),
  productionWrite: z.literal(false),
  wordpressPostId: z.null(),
  projectId: z.string().min(1),
  buildStatus: z.literal("ready"),
  generatedAt: z.string().datetime(),
  sourceOfTruth: z.literal("meta.numbers"),
  schemaVersion: z.literal("1.0.0"),
  project: z.object({
    name: z.string().min(1),
    type: z.enum(["business", "saas", "booking", "product-launch", "support-campaign", "personal-brand"]),
    goal: z.string().min(1),
    audience: z.string().min(1),
    description: z.string().min(1),
    tone: z.string().min(1),
    contactEmail: z.string().email(),
  }),
  wordpress: z.object({
    postType: z.string().min(1),
    postStatus: z.literal("draft"),
    main: z.object({
      title: z.string().min(1),
      slug: z.string().min(1),
      tagline: z.string().min(1),
      context: z.string().min(1),
      editor: z.string().min(1),
      label: z.string().min(1),
      link: z.string().min(1),
    }),
    post: z.object({
      section: stringArray,
      topic: stringArray,
      source: z.string().min(1),
    }),
    services: z.array(z.object({
      type: stringArray,
      category: stringArray,
      badge: stringArray,
      price: z.number().nullable(),
      duration: z.number().nullable(),
      datetime: z.string().nullable(),
    })),
    products: z.array(z.object({
      type: stringArray,
      category: stringArray,
      badge: stringArray,
      brand: stringArray,
      stock: z.number().nullable(),
      regular_price: z.number().nullable(),
      reseller_price: z.number().nullable(),
      sale_price: z.number().nullable(),
      paylink: z.string().nullable(),
    })),
    media: z.object({
      video: z.string().nullable(),
      icon: z.string().nullable(),
      image: z.string().nullable(),
      gallery: z.array(z.string()),
      files: z.array(z.string()),
    }),
  }),
  seo: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    ogTitle: z.string().min(1),
    ogDescription: z.string().min(1),
  }),
  faq: z.array(z.object({ question: z.string().min(1), answer: z.string().min(1) })).min(4),
  compliance: z.object({ passed: z.boolean(), violations: z.array(z.string()) }),
  technicalRecommendations: z.array(z.string().min(1)).min(1),
  securityRecommendations: z.array(z.string().min(1)).min(1),
  antiPatterns: z.array(z.string().min(1)).min(1),
  wordpressImportNotes: z.array(z.string().min(1)).min(1),
  _preview: z.object({
    sections: z.array(z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      body: z.string().min(1),
      bullets: z.array(z.string().min(1)).min(1),
      cta: z.string().nullable(),
    })).optional(),
  }).optional(),
});
