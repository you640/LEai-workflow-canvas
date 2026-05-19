#!/usr/bin/env node
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const validFile = 'docs/samples/web-do-24h-source-of-truth.valid.json';
const invalidFile = 'docs/samples/web-do-24h-source-of-truth.invalid.json';

function runValidate(file) {
  const res = spawnSync('node', ['scripts/validate-launch-studio-fixture.mjs', file], { stdio: 'pipe', encoding: 'utf8' });
  return { code: res.status ?? 1, out: `${res.stdout}${res.stderr}` };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const valid = JSON.parse(fs.readFileSync(validFile, 'utf8'));

// A: field mapping
assert(valid.project.name === 'Web do 24h Project', 'A: project.name mapping failed');
assert(valid.project.type === 'support-campaign', 'A: project.type mapping failed');

// B: source-of-truth structure
assert(Boolean(valid.wordpress?.main?.title), 'B: wordpress.main.title missing');
assert(Boolean(valid.wordpress?.main?.slug), 'B: wordpress.main.slug missing');
assert(Boolean(valid.wordpress?.main?.tagline), 'B: wordpress.main.tagline missing');
assert(Boolean(valid.wordpress?.main?.context), 'B: wordpress.main.context missing');
assert(Boolean(valid.wordpress?.main?.editor), 'B: wordpress.main.editor missing');
assert(Boolean(valid.wordpress?.main?.label), 'B: wordpress.main.label missing');
assert(Boolean(valid.wordpress?.main?.link), 'B: wordpress.main.link missing');
assert(Array.isArray(valid.wordpress?.post?.section), 'B: wordpress.post.section missing');
assert(Array.isArray(valid.wordpress?.post?.topic), 'B: wordpress.post.topic missing');
assert(Boolean(valid.wordpress?.post?.source), 'B: wordpress.post.source missing');
assert(Array.isArray(valid.wordpress?.services), 'B: wordpress.services missing');
assert(Array.isArray(valid.wordpress?.products), 'B: wordpress.products missing');
assert(Boolean(valid.wordpress?.media), 'B: wordpress.media missing');

// C/D/E/F/G via validator and direct checks
const validCheck = runValidate(validFile);
assert(validCheck.code === 0, `validator should pass valid fixture\n${validCheck.out}`);

assert(valid.wordpress.services[0]?.price === null, 'D: invented service price');
assert(valid.wordpress.products.length === 0, 'D: products should be empty for service-only');
assert(valid.wordpress.media.image === null, 'E: media.image should be null');
assert(Array.isArray(valid.wordpress.media.gallery) && valid.wordpress.media.gallery.length === 0, 'E: media.gallery should be empty');
assert(Array.isArray(valid.wordpress.media.files) && valid.wordpress.media.files.length === 0, 'E: media.files should be empty');
assert(valid.compliance.passed === true && valid.compliance.violations.length === 0, 'F: compliance fail');
assert(valid.dryRun === false && valid.productionWrite === false && valid.wordpressPostId === null && valid.wordpress.postStatus === 'draft', 'G: live guard failed');

const invalidCheck = runValidate(invalidFile);
assert(invalidCheck.code === 1, 'invalid fixture must fail');

// H: plain text fields contain no HTML
const plainFields = [
  valid.wordpress.main.title,
  valid.wordpress.main.tagline,
  valid.wordpress.main.context,
  valid.wordpress.main.label,
  valid.seo.title,
  valid.seo.description,
];
plainFields.forEach((field, index) => {
  assert(typeof field === 'string' && !/<[^>]*>/.test(field), `H: plain field ${index} contains HTML`);
});

// I: editor is safe and layout-free
const editor = valid.wordpress.main.editor;
assert(typeof editor === 'string' && editor.length > 0, 'I: editor missing');
assert(!/<(script|style|iframe|object|embed|form|input|button|svg)\b/i.test(editor), 'I: editor contains forbidden html tag');
assert(!/\s(on\w+|style|class|className)\s*=/i.test(editor), 'I: editor contains forbidden html attribute');
assert(!/<\/?(div|section|article|main|header|footer|aside|nav|span)\b/i.test(editor), 'I: editor contains layout wrapper html');

// J: export payload has no layout-only keys
const payloadString = JSON.stringify(valid);
assert(!/\"className\"\s*:/.test(payloadString), 'J: className key present');
assert(!/\"style\"\s*:/.test(payloadString), 'J: style key present');
assert(!/\"components\"\s*:/.test(payloadString), 'J: components key present');
assert(!/\"blocks\"\s*:/.test(payloadString), 'J: blocks key present');
assert(!/\"jsx\"\s*:/.test(payloadString), 'J: jsx key present');
assert(!/\"css\"\s*:/.test(payloadString), 'J: css key present');

// K: no fake claims
assert(!/fake testimonials?/i.test(payloadString), 'K: fake testimonial claim found');
assert(!/fake customer count/i.test(payloadString), 'K: fake customer count claim found');
assert(!/fake revenue/i.test(payloadString), 'K: fake revenue claim found');
assert(!/guaranteed income/i.test(payloadString), 'K: guaranteed income claim found');
assert(!/guaranteed (first )?position in google/i.test(payloadString), 'K: guaranteed ranking claim found');

console.log('PASS: source-of-truth launch studio tests A-K');
