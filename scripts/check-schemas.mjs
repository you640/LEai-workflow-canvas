import { spawnSync } from 'node:child_process';

function run(file) {
  const res = spawnSync('node', ['scripts/validate-launch-studio-fixture.mjs', file], { stdio: 'pipe', encoding: 'utf8' });
  return { code: res.status ?? 1, out: `${res.stdout}${res.stderr}` };
}

const valid = run('docs/samples/web-do-24h-source-of-truth.valid.json');
if (valid.code !== 0) {
  throw new Error(`valid source-of-truth fixture should pass\n${valid.out}`);
}

const invalid = run('docs/samples/web-do-24h-source-of-truth.invalid.json');
if (invalid.code !== 1) {
  throw new Error('invalid source-of-truth fixture should fail');
}

console.log('schema checks passed');
