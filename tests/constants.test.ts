import { execa } from 'execa';
import { describe, it, expect } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const cliPath = path.join(projectRoot, 'src', 'index.ts');

async function runCli(args: string[]) {
  return execa(process.execPath, ['--import', 'tsx', cliPath, ...args], {
    env: { ...process.env, CI: '1' },
  });
}

describe('create-stk CLI errors', () => {
  it('rejects unknown project types', async () => {
    await expect(runCli(['my-app', '--project', 'nexts', '--dry-run'])).rejects.toThrow(/Invalid project/);
  });

  it('rejects unknown package managers', async () => {
    await expect(runCli(['my-app', '--project', 'node', '--dry-run', '--pm', 'yarn'])).rejects.toThrow(/Invalid package manager/);
  });
});
