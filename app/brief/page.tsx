import { BriefPageClient } from "@/components/brief/BriefPageClient";
import type { ProjectType } from "@/types/workflow";

const TYPES: ProjectType[] = [
  "business",
  "saas",
  "booking",
  "product-launch",
  "support-campaign",
  "personal-brand",
];

function parseType(value: string | undefined): ProjectType | undefined {
  if (!value) return undefined;
  return TYPES.includes(value as ProjectType) ? (value as ProjectType) : undefined;
}

export default async function BriefPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; type?: string }>;
}) {
  const params = await searchParams;
  const initialPlan = params.plan ?? "launch-pack";
  const initialType = parseType(params.type);

  return <BriefPageClient initialPlan={initialPlan} initialType={initialType} />;
}

