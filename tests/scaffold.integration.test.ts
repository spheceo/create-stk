import { execa } from 'execa';
import { describe, it, expect } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const cliPath = path.join(projectRoot, 'src', 'index.ts');

async function runCli(args: string[]) {
  const result = await execa(process.execPath, ['--import', 'tsx', cliPath, ...args], {
    env: { ...process.env, CI: '1' },
  });
  return result.stdout.trim();
}

function parseDryRun(stdout: string) {
  return JSON.parse(stdout) as {
    dryRun: boolean;
    plan: {
      targetDir: string;
      projectType: string;
    };
  };
}

describe('create-stk CLI project selection', () => {
  const cases = ['next', 'nuxt', 'svelte', 'node'] as const;

  for (const project of cases) {
    it(`accepts --project ${project}`, async () => {
      const stdout = await runCli(['my-app', '--project', project, '--dry-run', '--pm', 'npm', '--no-git']);
      const data = parseDryRun(stdout);
      expect(data.plan.projectType).toBe(project);
    });

    it(`accepts positional ${project}`, async () => {
      const stdout = await runCli([project, 'my-app', '--dry-run', '--pm', 'npm', '--no-git']);
      const data = parseDryRun(stdout);
      expect(data.plan.projectType).toBe(project);
    });
  }
});
