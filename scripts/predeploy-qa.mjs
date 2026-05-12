import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const base = process.env.QA_BASE_URL || 'http://localhost:4173';
const outDir = path.resolve('qa-artifacts');
await fs.mkdir(outDir, { recursive: true });

const banned = [
  'investor',
  'investors',
  'equity',
  'returns',
  'return on investment',
  'roi',
  'shares',
  'securities',
  'dividend',
  'yield',
  'capital raise',
  'guaranteed return',
  'profit guarantee',
];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

const logs = [];
const apiBodies = [];

page.on('console', (msg) => logs.push({ type: msg.type(), text: msg.text() }));
page.on('response', async (res) => {
  const url = res.url();
  if (url.includes('/api/projects/import') || url.includes('/api/projects/generate') || url.includes('/api/workflows/')) {
    try {
      const txt = await res.text();
      apiBodies.push({ url, status: res.status(), body: txt.slice(0, 2000) });
    } catch {
      // no-op
    }
  }
});

const result = {
  redirectToLaunchStudio: false,
  launchStudioRendered: false,
  timelineEntries: 0,
  nodeSuccessCount: 0,
  nodeFailedCount: 0,
  jsonPreviewVisible: false,
  payloadDryRunTrue: false,
  exportEnabledAfterPass: false,
  complianceBlocksExport: false,
  complianceBlocksImport: false,
  importDryRunMessage: false,
  restrictedWordingInUI: [],
  restrictedWordingInGenerated: [],
  secretLeakSignals: [],
  responsive: {},
  screenshots: [],
  notes: [],
};

try {
  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  result.redirectToLaunchStudio = page.url().includes('/launch-studio');

  await page.waitForSelector('text=AI Launch Studio', { timeout: 10000 });
  await page.waitForSelector('text=Rubberduck Launch Studio', { timeout: 10000 });
  result.launchStudioRendered = true;

  await page.getByRole('button', { name: /^Run$/ }).click();
  await page.waitForSelector('text=Preview JSON generated', { timeout: 15000 });
  await page.waitForSelector('text=launch-pack: Completed', { timeout: 15000 }).catch(() => {});

  result.nodeSuccessCount = await page.locator('text=success').count();
  result.nodeFailedCount = await page.locator('text=failed').count();

  const timelineRows = page.locator('h3:has-text("Execution Log") + div > div');
  result.timelineEntries = await timelineRows.count();

  result.jsonPreviewVisible = await page.locator('h3:has-text("JSON Preview")').first().isVisible();

  const jsonText = await page.locator('pre').first().innerText();
  result.payloadDryRunTrue = /"dryRun"\s*:\s*true/.test(jsonText);

  const toolbarExport = page.locator('div.h-16 button[title="Export JSON"]');
  result.exportEnabledAfterPass = await toolbarExport.isEnabled();

  await page.getByRole('button', { name: /Prepare WordPress Import \(Dry-run\)/ }).click();
  await page.waitForTimeout(600);
  const bodyAfterImport = await page.textContent('body');
  result.importDryRunMessage = /Dry-run mode active\. No production write executed\./.test(bodyAfterImport || '');

  const bodyTextClean = (await page.textContent('body'))?.toLowerCase() || "";
  result.restrictedWordingInUI = banned.filter((t) => bodyTextClean.includes(t));

  const generatedBodies = apiBodies
    .filter((x) => x.url.includes('/api/projects/generate'))
    .map((x) => x.body.toLowerCase())
    .join('\n');
  result.restrictedWordingInGenerated = banned.filter((t) => generatedBodies.includes(t));

  await page.fill('textarea', 'Support campaign pre investor ROI promise');
  await page.getByRole('button', { name: /^Run$/ }).click();
  await page.waitForSelector('text=Compliance blocked', { timeout: 15000 });

  const previewExport = page.locator('h3:has-text("JSON Preview")').locator('..').getByRole('button', { name: 'Export JSON' });
  const exportEnabledOnFail = await previewExport.isEnabled();
  const exportBlockedText = await page.locator('text=Export blocked by compliance.').isVisible();
  result.complianceBlocksExport = exportBlockedText && !exportEnabledOnFail;

  const importBtn = page.getByRole('button', { name: /Prepare WordPress Import \(Dry-run\)/ });
  result.complianceBlocksImport = !(await importBtn.isEnabled());

  const bodyText = (await page.textContent('body'))?.toLowerCase() || '';
  result.restrictedWordingInUIAfterInjectedFailCase = banned.filter((t) => bodyText.includes(t));

  const combined = [
    bodyText,
    JSON.stringify(apiBodies).toLowerCase(),
    logs.map((x) => x.text).join('\n').toLowerCase(),
  ].join('\n');

  const secretSignals = [
    'wp_import_app_password',
    'wp_import_username',
    'authorization: basic',
    'replace-with-secure-app-password',
    'begin private key',
  ];
  result.secretLeakSignals = secretSignals.filter((s) => combined.includes(s));

  const viewports = [
    { name: 'mobile-390', width: 390, height: 844 },
    { name: 'tablet-768', width: 768, height: 1024 },
    { name: 'desktop-1440', width: 1440, height: 1000 },
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(`${base}/launch-studio`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    const file = path.join(outDir, `${vp.name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    result.screenshots.push(file);
    result.responsive[vp.name] = {
      launchStudioVisible: await page.locator('text=AI Launch Studio').isVisible().catch(() => false),
    };
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  const rootShot = path.join(outDir, 'root-redirect.png');
  await page.screenshot({ path: rootShot, fullPage: true });
  result.screenshots.push(rootShot);

  result.notes.push(`consoleMessages=${logs.length}`);
  result.notes.push(`apiCallsCaptured=${apiBodies.length}`);
} catch (error) {
  result.notes.push(`error=${error instanceof Error ? error.message : String(error)}`);
} finally {
  await browser.close();
}

await fs.writeFile(path.join(outDir, 'qa-result.json'), JSON.stringify(result, null, 2), 'utf8');
console.log(JSON.stringify(result, null, 2));
