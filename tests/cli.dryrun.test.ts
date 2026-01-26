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
      dirName: string;
      projectType: string;
      packageManager: string;
      git: boolean;
      pkInstall: string;
    };
  };
}

describe('create-stk dry run', () => {
  it('supports subcommand fast path', async () => {
    const stdout = await runCli(['node', 'my-app', '--dry-run', '--pm', 'pnpm', '--no-git']);
    const data = parseDryRun(stdout);

    expect(data.dryRun).toBe(true);
    expect(data.plan.projectType).toBe('node');
    expect(data.plan.targetDir).toBe('my-app');
    expect(data.plan.packageManager).toBe('pnpm');
    expect(data.plan.git).toBe(false);
  });

  it('supports flag-based project selection', async () => {
    const stdout = await runCli(['my-app', '--project', 'nuxt', '--dry-run', '--pm', 'npm', '--git']);
    const data = parseDryRun(stdout);

    expect(data.dryRun).toBe(true);
    expect(data.plan.projectType).toBe('nuxt');
    expect(data.plan.targetDir).toBe('my-app');
    expect(data.plan.packageManager).toBe('npm');
    expect(data.plan.git).toBe(true);
  });
});
