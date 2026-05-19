#!/usr/bin/env node
import fs from 'node:fs';
import { chromium } from 'playwright';

const baseUrl = process.env.SMOKE_BASE_URL || 'http://localhost:3110';
const outFile = process.env.SMOKE_OUTPUT_FILE || 'docs/samples/.tmp-smoke-export.json';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const consoleErrors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') {
    consoleErrors.push(msg.text());
  }
});

await page.goto(`${baseUrl}/launch-studio`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('text=/LE Studio|Launch Studio/i', { timeout: 15000 });

// language switcher + project type
if (await page.locator('#language-switcher').count()) {
  await page.locator('#language-switcher').selectOption('sk');
}
await page.locator('#brief-project-type').selectOption('support-campaign');

await page.locator('#brief-project-name').fill('Web do 24h Project');
await page.locator('#brief-target-audience').fill('Majitelia malých a stredných firiem, lokálni podnikatelia, salóny, ambulancie, služby a startupy.');
await page.locator('#brief-goal').fill('Vytvoriť kvalitnú landing page a štruktúru kampane pre službu Web do 24h.');
await page.locator('#brief-description').fill('Profesionálny výstup pre projekt Web do 24h so zameraním na dôveru, konverzie a bezpečný dry-run import payload bez fake tvrdení.');
await page.locator('#brief-preferred-tone').fill('Jasný, profesionálny, priamy, dôveryhodný, technicky kompetentný.');
await page.locator('#brief-contact-email').fill('owner@rubberduck.sk');

const responsePromise = page.waitForResponse((r) => r.url().includes('/api/projects/generate') && r.request().method() === 'POST');
await page.getByRole('button', { name: /Run Workflow|Spustiť workflow|Generate|Generovať/i }).first().click();
const response = await responsePromise;
const json = await response.json();

if (!json?.project) {
  throw new Error('Missing project payload in /api/projects/generate response');
}

fs.writeFileSync(outFile, JSON.stringify(json.project, null, 2));

const importResponsePromise = page.waitForResponse((r) => r.url().includes('/api/projects/import') && r.request().method() === 'POST');
await page.getByRole('button', { name: /Prepare WordPress Import \(Dry-run\)|Pripraviť WordPress import \(Dry-run\)/i }).click();
const importResponse = await importResponsePromise;
const importJson = await importResponse.json();

const summary = {
  baseUrl,
  outputFile: outFile,
  canExport: json?.canExport,
  canImport: json?.canImport,
  validation: json?.validation,
  compliance: json?.compliance,
  importMessage: importJson?.message,
  importDryRun: importJson?.dryRun,
  importPreviewHasMain: Boolean(importJson?.payloadPreview?.main),
  consoleErrors,
};

fs.writeFileSync('docs/samples/.tmp-smoke-summary.json', JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));

await browser.close();
