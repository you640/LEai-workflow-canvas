#!/usr/bin/env node
import { spawn } from 'node:child_process';

const child = spawn('node', ['scripts/e2e-launch-studio-full.mjs'], {
  cwd: process.cwd(),
  env: process.env,
  stdio: 'inherit',
});

child.on('exit', (code) => {
  process.exit(code ?? 1);
});
