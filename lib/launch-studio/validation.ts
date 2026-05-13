import type { SourceOfTruthExport } from "@/lib/launch-studio/source-of-truth-schema";
import { SourceOfTruthExportSchema } from "@/lib/launch-studio/source-of-truth-schema";
import {
  assertPlainText,
  assertStringArray,
  collectDisallowedLayoutKeys,
  containsForbiddenClaims,
  containsForbiddenHtml,
  containsLayoutMarkup,
  containsPlaceholderText,
  isIsoDatetimeOrNull,
  isPlaceholderUrl,
} from "@/lib/launch-studio/content-format";

export interface SourceOfTruthValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateSourceOfTruthExport(payload: unknown): SourceOfTruthValidationResult {
  const parsed = SourceOfTruthExportSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      valid: false,
      errors: [
        "schema_validation_failed",
        ...parsed.error.issues.map((issue) => `schema:${issue.path.join(".") || "root"}`),
      ],
    };
  }

  const data = parsed.data as SourceOfTruthExport;
  const errors: string[] = [];

  if (data.dryRun !== false) errors.push("dry_run_not_false");
  if (data.productionWrite !== false) errors.push("production_write_not_false");
  if (data.wordpressPostId !== null) errors.push("wordpress_post_id_not_null");
  if (data.wordpress.postStatus !== "draft") errors.push("wordpress_post_status_not_draft");
  if (data.sourceOfTruth !== "meta.numbers") errors.push("source_of_truth_invalid");

  if (data.project.name === data.project.type) errors.push("project_name_equals_project_type");
  if (data.project.name.toLowerCase() === "support-campaign") errors.push("project_name_is_support_campaign");

  const plainTextChecks: Array<[string, unknown]> = [
    ["wordpress.main.title", data.wordpress.main.title],
    ["wordpress.main.slug", data.wordpress.main.slug],
    ["wordpress.main.tagline", data.wordpress.main.tagline],
    ["wordpress.main.context", data.wordpress.main.context],
    ["wordpress.main.label", data.wordpress.main.label],
    ["wordpress.main.link", data.wordpress.main.link],
    ["wordpress.post.source", data.wordpress.post.source],
    ["seo.title", data.seo.title],
    ["seo.description", data.seo.description],
    ["seo.ogTitle", data.seo.ogTitle],
    ["seo.ogDescription", data.seo.ogDescription],
    ["project.name", data.project.name],
    ["project.goal", data.project.goal],
    ["project.audience", data.project.audience],
    ["project.description", data.project.description],
    ["project.tone", data.project.tone],
  ];

  for (const [fieldName, value] of plainTextChecks) {
    errors.push(...assertPlainText(value, fieldName));
  }

  data.faq.forEach((item, index) => {
    errors.push(...assertPlainText(item.question, `faq[${index}].question`));
    errors.push(...assertPlainText(item.answer, `faq[${index}].answer`));
  });

  errors.push(...assertStringArray(data.wordpress.post.section, "wordpress.post.section"));
  errors.push(...assertStringArray(data.wordpress.post.topic, "wordpress.post.topic"));

  data.wordpress.services.forEach((service, index) => {
    errors.push(...assertStringArray(service.type, `wordpress.services[${index}].type`));
    errors.push(...assertStringArray(service.category, `wordpress.services[${index}].category`));
    errors.push(...assertStringArray(service.badge, `wordpress.services[${index}].badge`));
    if (!(service.price === null || typeof service.price === "number")) {
      errors.push(`wordpress.services[${index}].price_invalid_type`);
    }
    if (!(service.duration === null || typeof service.duration === "number")) {
      errors.push(`wordpress.services[${index}].duration_invalid_type`);
    }
    if (!isIsoDatetimeOrNull(service.datetime)) {
      errors.push(`wordpress.services[${index}].datetime_invalid_type`);
    }
  });

  data.wordpress.products.forEach((product, index) => {
    errors.push(...assertStringArray(product.type, `wordpress.products[${index}].type`));
    errors.push(...assertStringArray(product.category, `wordpress.products[${index}].category`));
    errors.push(...assertStringArray(product.badge, `wordpress.products[${index}].badge`));
    errors.push(...assertStringArray(product.brand, `wordpress.products[${index}].brand`));

    const numericChecks: Array<[string, unknown]> = [
      [`wordpress.products[${index}].stock`, product.stock],
      [`wordpress.products[${index}].regular_price`, product.regular_price],
      [`wordpress.products[${index}].reseller_price`, product.reseller_price],
      [`wordpress.products[${index}].sale_price`, product.sale_price],
    ];

    numericChecks.forEach(([fieldName, value]) => {
      if (!(value === null || typeof value === "number")) {
        errors.push(`${fieldName}_invalid_type`);
      }
    });
  });

  const main = data.wordpress.main;
  if (!main.editor) errors.push("wordpress_main_editor_missing");
  if (containsForbiddenHtml(main.editor)) errors.push("wordpress_main_editor_forbidden_html");
  if (containsLayoutMarkup(main.editor)) errors.push("wordpress_main_editor_layout_markup");
  if (containsPlaceholderText(main.editor)) errors.push("wordpress_main_editor_placeholder");
  if (containsForbiddenClaims(main.editor)) errors.push("wordpress_main_editor_forbidden_claim");

  const { media } = data.wordpress;
  if (media.video !== null && typeof media.video !== "string") errors.push("wordpress_media_video_invalid_type");
  if (media.icon !== null && typeof media.icon !== "string") errors.push("wordpress_media_icon_invalid_type");
  if (media.image !== null && typeof media.image !== "string") errors.push("wordpress_media_image_invalid_type");
  errors.push(...assertStringArray(media.gallery, "wordpress.media.gallery"));
  errors.push(...assertStringArray(media.files, "wordpress.media.files"));

  if (!data.compliance || data.compliance.passed !== true) errors.push("compliance_not_passed");
  if (!Array.isArray(data.compliance?.violations) || data.compliance.violations.length !== 0) errors.push("compliance_violations_not_empty");

  if (data.faq.length < 4) errors.push("faq_less_than_4");
  if (!data.technicalRecommendations.length) errors.push("technical_recommendations_missing");
  if (!data.securityRecommendations.length) errors.push("security_recommendations_missing");
  if (!data.antiPatterns.length) errors.push("anti_patterns_missing");
  if (!data.wordpressImportNotes.length) errors.push("wordpress_import_notes_missing");

  const searchable = JSON.stringify(data);
  if (containsPlaceholderText(searchable)) errors.push("placeholder_phrase_found");
  if (containsForbiddenClaims(searchable)) errors.push("forbidden_claim_found");

  data.wordpress.services.forEach((service, index) => {
    if (service.price !== null) errors.push(`invented_service_price[${index}]`);
  });

  if (data.wordpress.products.length > 0) {
    const hasInventedMoney = data.wordpress.products.some(
      (p) => p.regular_price !== null || p.reseller_price !== null || p.sale_price !== null || p.stock !== null || Boolean(p.paylink)
    );
    if (hasInventedMoney) errors.push("invented_product_money_fields");
  }

  if (data.wordpress.media.video && isPlaceholderUrl(data.wordpress.media.video)) errors.push("media_video_placeholder_url");
  if (data.wordpress.media.icon && isPlaceholderUrl(data.wordpress.media.icon)) errors.push("media_icon_placeholder_url");
  if (data.wordpress.media.image && isPlaceholderUrl(data.wordpress.media.image)) errors.push("media_image_placeholder_url");
  if (data.wordpress.media.gallery.some((url) => isPlaceholderUrl(url))) errors.push("media_gallery_placeholder_url");
  if (data.wordpress.media.files.some((url) => isPlaceholderUrl(url))) errors.push("media_files_placeholder_url");

  if (data.wordpress.media.image !== null || data.wordpress.media.gallery.length > 0 || data.wordpress.media.files.length > 0) {
    errors.push("invented_media_assets");
  }

  if (data.wordpress.products.some((product) => product.paylink && isPlaceholderUrl(product.paylink))) {
    errors.push("placeholder_paylink");
  }

  const disallowedLayoutKeys = collectDisallowedLayoutKeys(data);
  if (disallowedLayoutKeys.length > 0) {
    errors.push(`layout_keys_found:${disallowedLayoutKeys.join(",")}`);
  }

  return { valid: errors.length === 0, errors };
}
