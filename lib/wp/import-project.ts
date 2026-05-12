import type { ProjectLaunch } from "@/lib/schemas/project.schema";

export interface ImportResult {
  dryRun: boolean;
  imported: boolean;
  endpoint?: string;
  payloadPreview: unknown;
  message: string;
}

function makeSupportCampaignPayload(project: ProjectLaunch) {
  if (project.project.type !== "support-campaign") {
    return null;
  }

  return {
    campaign: {
      title: project.project.name,
      slug: project.project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      type: project.supportCampaign?.mode ?? "donation",
      goalAmount: project.supportCampaign?.targetAmount,
      currency: project.supportCampaign?.currency ?? "EUR",
      content: project.project.description,
    },
    rewards: (project.supportCampaign?.rewards ?? []).map((r) => ({
      title: r.title,
      description: r.description,
      minimumAmount: r.minimumAmount,
      isDigital: r.isDigital,
      requiresShipping: r.requiresShipping,
    })),
    faq: project.faq,
    seo: {
      title: project.seo.title,
      description: project.seo.description,
    },
  };
}

export async function importProjectToWordPress(project: ProjectLaunch, compliancePassed: boolean): Promise<ImportResult> {
  const payloadPreview = makeSupportCampaignPayload(project) ?? { project: project.project, template: project.template };

  const realEnabled = process.env.ENABLE_REAL_WP_IMPORT === "true";
  const isSupport = project.project.type === "support-campaign";

  if (!compliancePassed) {
    return {
      dryRun: true,
      imported: false,
      payloadPreview,
      message: "Import blocked: compliance failed.",
    };
  }

  if (!realEnabled || !isSupport) {
    return {
      dryRun: true,
      imported: false,
      payloadPreview,
      message: "Dry-run mode active. No production write executed.",
    };
  }

  const baseUrl = process.env.WP_BASE_URL;
  const username = process.env.WP_IMPORT_USERNAME;
  const appPassword = process.env.WP_IMPORT_APP_PASSWORD;

  if (!baseUrl || !username || !appPassword) {
    return {
      dryRun: true,
      imported: false,
      payloadPreview,
      message: "Dry-run fallback: missing WordPress server credentials.",
    };
  }

  const endpoint = `${baseUrl.replace(/\/$/, "")}/wp-json/le-raising/v1/campaigns/import`;

  const authHeader = Buffer.from(`${username}:${appPassword}`).toString("base64");

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${authHeader}`,
    },
    body: JSON.stringify(payloadPreview),
    cache: "no-store",
  });

  if (!res.ok) {
    return {
      dryRun: false,
      imported: false,
      endpoint,
      payloadPreview,
      message: `Import request failed with status ${res.status}.`,
    };
  }

  return {
    dryRun: false,
    imported: true,
    endpoint,
    payloadPreview,
    message: "Support campaign imported successfully.",
  };
}
