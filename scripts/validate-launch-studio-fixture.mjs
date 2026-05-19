#!/usr/bin/env node
import fs from 'node:fs';

const PLACEHOLDERS = [
  'Krátke vysvetlenie',
  'Hlavné prínosy',
  'Tri až štyri kroky',
  'Balíky alebo varianty',
  'Najčastejšie otázky',
  'Tu bude',
  'Placeholder',
  'Lorem ipsum'
];

const PLAIN_TEXT_FIELDS = [
  'wordpress.main.title',
  'wordpress.main.slug',
  'wordpress.main.tagline',
  'wordpress.main.context',
  'wordpress.main.label',
  'wordpress.main.link',
  'wordpress.post.source',
  'seo.title',
  'seo.description',
  'seo.ogTitle',
  'seo.ogDescription',
];

const FORBIDDEN_EDITOR_HTML = /<(script|style|iframe|object|embed|form|input|button|svg)\b/i;
const FORBIDDEN_EDITOR_ATTR = /\s(on\w+|style|class|className)\s*=/i;
const LAYOUT_TAGS = /<\/?(div|section|article|main|header|footer|aside|nav|span)\b/i;
const HTML_TAGS = /<[^>]*>/;
const DISALLOWED_LAYOUT_KEYS = new Set(['classname', 'style', 'components', 'blocks', 'jsx', 'css', 'tailwind']);
const PLACEHOLDER_URL = /(example\.com|localhost|127\.0\.0\.1|placeholder|dummy|lorem)/i;

function fail(msg) {
  console.error(`FAIL: ${msg}`);
}

function getByPath(obj, path) {
  return path.split('.').reduce((acc, part) => (acc == null ? undefined : acc[part]), obj);
}

function collectDisallowedKeys(value, base = '') {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectDisallowedKeys(item, `${base}[${index}]`));
  }
  if (!value || typeof value !== 'object') return [];

  const out = [];
  for (const [key, nested] of Object.entries(value)) {
    const path = base ? `${base}.${key}` : key;
    if (DISALLOWED_LAYOUT_KEYS.has(key.toLowerCase())) {
      out.push(path);
    }
    out.push(...collectDisallowedKeys(nested, path));
  }
  return out;
}

function validate(data) {
  const errors = [];

  if (data?.dryRun !== false) errors.push('dryRun must be false');
  if (data?.productionWrite !== false) errors.push('productionWrite must be false');
  if (data?.wordpressPostId !== null) errors.push('wordpressPostId must be null');
  if (data?.sourceOfTruth !== 'meta.numbers') errors.push('sourceOfTruth must be meta.numbers');

  if (!data?.project?.name) errors.push('project.name missing');
  if (data?.project?.name === data?.project?.type) errors.push('project.name equals project.type');
  if (String(data?.project?.name || '').toLowerCase() === 'support-campaign') errors.push('project.name must not equal support-campaign');

  const w = data?.wordpress;
  if (!w?.main?.title) errors.push('wordpress.main.title missing');
  if (!w?.main?.slug) errors.push('wordpress.main.slug missing');
  if (!w?.main?.tagline) errors.push('wordpress.main.tagline missing');
  if (!w?.main?.context) errors.push('wordpress.main.context missing');
  if (!w?.main?.editor) errors.push('wordpress.main.editor missing');
  if (!w?.main?.label) errors.push('wordpress.main.label missing');
  if (!w?.main?.link) errors.push('wordpress.main.link missing');

  if (!Array.isArray(w?.post?.section)) errors.push('wordpress.post.section must be array');
  if (!Array.isArray(w?.post?.topic)) errors.push('wordpress.post.topic must be array');
  if (!w?.post?.source) errors.push('wordpress.post.source missing');

  if (!Array.isArray(w?.services)) errors.push('wordpress.services invalid');
  if (!Array.isArray(w?.products)) errors.push('wordpress.products invalid');

  if (!w?.media || !Array.isArray(w.media.gallery) || !Array.isArray(w.media.files)) errors.push('wordpress.media invalid');

  if (!data?.compliance) errors.push('compliance missing');
  if (data?.compliance?.passed !== true) errors.push('compliance.passed must be true');
  if (!Array.isArray(data?.compliance?.violations) || data.compliance.violations.length !== 0) errors.push('compliance.violations must be empty');

  if (!Array.isArray(data?.faq) || data.faq.length < 4) errors.push('faq must contain at least 4 items');
  if (!Array.isArray(data?.technicalRecommendations) || data.technicalRecommendations.length === 0) errors.push('technicalRecommendations missing');
  if (!Array.isArray(data?.securityRecommendations) || data.securityRecommendations.length === 0) errors.push('securityRecommendations missing');
  if (!Array.isArray(data?.antiPatterns) || data.antiPatterns.length === 0) errors.push('antiPatterns missing');
  if (!Array.isArray(data?.wordpressImportNotes) || data.wordpressImportNotes.length === 0) errors.push('wordpressImportNotes missing');

  if (w?.postStatus !== 'draft') errors.push('wordpress.postStatus must be draft');

  for (const field of PLAIN_TEXT_FIELDS) {
    const value = getByPath(data, field);
    if (typeof value !== 'string' || value.trim().length === 0) {
      errors.push(`${field} must be non-empty string`);
      continue;
    }
    if (HTML_TAGS.test(value)) {
      errors.push(`${field} must not contain HTML tags`);
    }
  }

  const faq = Array.isArray(data?.faq) ? data.faq : [];
  faq.forEach((item, index) => {
    if (typeof item?.question !== 'string' || HTML_TAGS.test(item.question)) errors.push(`faq[${index}].question invalid`);
    if (typeof item?.answer !== 'string' || HTML_TAGS.test(item.answer)) errors.push(`faq[${index}].answer invalid`);
  });

  const searchable = JSON.stringify({
    main: data?.wordpress?.main,
    faq: data?.faq,
    preview: data?._preview,
    seo: data?.seo
  });
  if (PLACEHOLDERS.some((p) => searchable.toLowerCase().includes(p.toLowerCase()))) {
    errors.push('placeholder text detected');
  }

  if (typeof w?.main?.editor !== 'string' || w.main.editor.trim().length === 0) {
    errors.push('wordpress.main.editor missing');
  } else {
    if (FORBIDDEN_EDITOR_HTML.test(w.main.editor)) errors.push('editor contains forbidden html tags');
    if (FORBIDDEN_EDITOR_ATTR.test(w.main.editor)) errors.push('editor contains forbidden html attributes');
    if (LAYOUT_TAGS.test(w.main.editor)) errors.push('editor contains layout tags');
  }

  if (w?.services?.[0]?.price !== null && w?.services?.[0]?.price !== undefined) {
    errors.push('invented service price');
  }

  if (w?.products?.length > 0) {
    const hasMoney = w.products.some((p) => p.regular_price !== null || p.reseller_price !== null || p.sale_price !== null || p.stock !== null || p.paylink);
    if (hasMoney) errors.push('invented product pricing');
  }

  if (w?.media?.image !== null || (w?.media?.gallery?.length ?? 0) > 0 || (w?.media?.files?.length ?? 0) > 0) {
    errors.push('invented media assets');
  }

  if (typeof w?.media?.video === 'string' && PLACEHOLDER_URL.test(w.media.video)) errors.push('placeholder media.video url');
  if (typeof w?.media?.icon === 'string' && PLACEHOLDER_URL.test(w.media.icon)) errors.push('placeholder media.icon url');
  if (typeof w?.media?.image === 'string' && PLACEHOLDER_URL.test(w.media.image)) errors.push('placeholder media.image url');
  if (Array.isArray(w?.media?.gallery) && w.media.gallery.some((url) => PLACEHOLDER_URL.test(url))) errors.push('placeholder media.gallery url');
  if (Array.isArray(w?.media?.files) && w.media.files.some((url) => PLACEHOLDER_URL.test(url))) errors.push('placeholder media.files url');

  if (Array.isArray(w?.products) && w.products.some((product) => typeof product?.paylink === 'string' && PLACEHOLDER_URL.test(product.paylink))) {
    errors.push('placeholder product paylink');
  }

  const layoutKeyErrors = collectDisallowedKeys(data);
  if (layoutKeyErrors.length > 0) {
    errors.push(`layout-only keys present: ${layoutKeyErrors.join(', ')}`);
  }

  return errors;
}

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/validate-launch-studio-fixture.mjs <fixture.json>');
  process.exit(1);
}

let parsed;
try {
  parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
} catch (err) {
  fail(`invalid json file: ${err.message}`);
  process.exit(1);
}

const errors = validate(parsed);
if (errors.length > 0) {
  errors.forEach(fail);
  process.exit(1);
}

console.log(`PASS: fixture valid (${file})`);
process.exit(0);
