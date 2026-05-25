import { spinner } from '@clack/prompts';
import { execa, type Options } from 'execa';
import { downloadTemplate } from 'giget';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { TEMPLATE_CONFIG, type TemplateContext, type TemplateId, type PackageManager, type DestinationMode } from './config';

const s = spinner();
const TEMPLATE_PLACEHOLDER = '{{ project_name }}';
const GO_FIBER_TEMPLATE_SOURCE = 'gh:spheceo/go-fiber-template';
const RUST_AXUM_TEMPLATE_SOURCE = 'gh:spheceo/rust-axum-template';
const NODE_SERVERLESS_PLAYWRIGHT_TEMPLATE_SOURCE = 'gh:spheceo/serverless-playwright';
const NODE_ELYSIA_TEMPLATE_SOURCE = 'gh:spheceo/ts-elysia-template';
const JAVA_MAVEN_TEMPLATE_SOURCE = 'gh:spheceo/java-maven-template';
const PYTHON_FASTAPI_TEMPLATE_SOURCE = 'gh:spheceo/python-fast-template';
const PYTHON_TEMPLATE_DESCRIPTION = 'This is an empty template.';

const SCAFFOLD_PACKAGE_VERSIONS = {
  createNextApp: '16.2.6',
  createNuxt: '3.35.2',
  sv: '0.15.3',
  portless: '^0.13.0',
  nuxtTailwindcss: 'tailwindcss@^4.3.0',
  nuxtTailwindcssVite: '@tailwindcss/vite@^4.3.0',
  nodeTypes: '@types/node@^25.9.1',
  dotenv: 'dotenv@^17.4.2',
  tsx: 'tsx@^4.22.3',
  typescript: 'typescript@^6.0.3',
  svelteAdapterBun: 'svelte-adapter-bun@^1.0.1',
} as const;

const ELYSIA_TEMPLATE_DEPENDENCIES = {
  '@elysiajs/static': '^1.4.10',
  elysia: '^1.4.28',
} as const;

const BUN_TEMPLATE_DEV_DEPENDENCIES = {
  '@types/bun': '^1.3.14',
  'bun-types': '^1.3.14',
} as const;

const SERVERLESS_PLAYWRIGHT_TEMPLATE_DEPENDENCIES = {
  '@sparticuz/chromium': '^148.0.0',
  '@t3-oss/env-core': '^0.13.11',
  'playwright-core': '^1.60.0',
  zod: '^4.4.3',
  ...ELYSIA_TEMPLATE_DEPENDENCIES,
} as const;

const SERVERLESS_PLAYWRIGHT_TEMPLATE_DEV_DEPENDENCIES = {
  ...BUN_TEMPLATE_DEV_DEPENDENCIES,
  playwright: '^1.60.0',
} as const;

export const gitignore = `# Dependencies
node_modules/

# Build outputs
dist/
build/
.output/
.nuxt/
.nitro/
.cache/
.next/

# Environment variables
.env
.env.*
!.env.example

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE
.vscode/
.idea/
.fleet/
*.swp
*.swo
*~

# Testing
coverage/
.nyc_output/

# Misc
*.tsbuildinfo`;

export const getReadmeCode = (dirName: string) => `# ${dirName.charAt(0).toUpperCase() + dirName.slice(1)}
This is an empty project.`;

export const globalsCss = `@import "tailwindcss";

:root {
    --background: #ffffff;
    --foreground: #171717;
}

body {
    background: var(--background);
    color: var(--foreground);
}`;

// Next JS
export const nextPageCode = `export default function Home() {
  return (
    <div>
      <h1>Hello World!</h1>
    </div>
  )
}`;

// Node
export const nodeIndex = `function main() {
  console.log("Hello World!");
}

main();`;

export const getNodePackage = (dirName: string) => `{
  "name": "${dirName}",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx index.ts"
  },
  "dependencies": {},
  "devDependencies": {}
}`;

// Nuxt 
export const nuxtApp = `<template>
  <h1>Hello World!</h1>
</template>`;

export const nuxtConfig = `import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '0000-00-00',
  devtools: { enabled: true },
  css: ['./app/globals.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  app: {
    head: {
      title: 'Empty',
      meta: [
        { name: 'description', content: 'This is an empty project' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
      htmlAttrs: {
        lang: 'en',
      },
    },
  },
})`;

// Svelte
export const sveltePage = `<div>
  <h1>Hello World!</h1>
</div>`;

export const svelteHead = `<svelte:head>
\t<title>Empty</title>
\t<meta name="description" content="This is an empty project" />
\t<link rel="icon" href={favicon} />
</svelte:head>`;

function replaceFavicon(targetDir: string, dest: string) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const faviconSource = path.resolve(__dirname, '..', 'assets', 'favicon.ico');
  const faviconDest = path.resolve(targetDir, dest);
  fs.copyFileSync(faviconSource, faviconDest);
}

function isCommandNotFound(error: unknown): boolean {
  return Boolean(
    typeof error === 'object'
      && error
      && ('code' in error ? (error as { code?: string }).code === 'ENOENT' : false)
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function replaceInFile(filePath: string, searchValue: string, replacement: string) {
  if (!fs.existsSync(filePath)) return;
  const source = fs.readFileSync(filePath, 'utf8');
  if (!source.includes(searchValue)) return;
  fs.writeFileSync(filePath, source.split(searchValue).join(replacement));
}

type NodePackageJson = {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

function updateDownloadedNodePackage(
  targetDir: string,
  dirName: string,
  dependencies: Record<string, string>,
  devDependencies: Record<string, string>
) {
  const packageJsonPath = path.join(targetDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) return;

  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as NodePackageJson;
  pkg.name = dirName;
  pkg.dependencies = {
    ...pkg.dependencies,
    ...dependencies,
  };
  pkg.devDependencies = {
    ...pkg.devDependencies,
    ...devDependencies,
  };

  fs.writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`);
  fs.rmSync(path.join(targetDir, 'bun.lock'), { force: true });
}

function updatePythonFastApiDependencies(targetDir: string) {
  const pyprojectPath = path.join(targetDir, 'pyproject.toml');
  replaceInFile(pyprojectPath, '"fastapi>=0.133.1"', '"fastapi>=0.136.3"');
  replaceInFile(pyprojectPath, '"uvicorn>=0.41.0"', '"uvicorn>=0.48.0"');
}

function updateGoFiberDependencies(targetDir: string) {
  const goModPath = path.join(targetDir, 'go.mod');
  const replacements: Record<string, string> = {
    'github.com/gofiber/fiber/v3 v3.0.0': 'github.com/gofiber/fiber/v3 v3.3.0',
    'github.com/andybalholm/brotli v1.2.0': 'github.com/andybalholm/brotli v1.2.1',
    'github.com/gofiber/schema v1.6.0': 'github.com/gofiber/schema v1.7.1',
    'github.com/gofiber/utils/v2 v2.0.0': 'github.com/gofiber/utils/v2 v2.0.6',
    'github.com/klauspost/compress v1.18.3': 'github.com/klauspost/compress v1.18.6',
    'github.com/mattn/go-isatty v0.0.20': 'github.com/mattn/go-isatty v0.0.22',
    'github.com/tinylib/msgp v1.6.3': 'github.com/tinylib/msgp v1.6.4',
    'github.com/valyala/fasthttp v1.69.0': 'github.com/valyala/fasthttp v1.71.0',
    'golang.org/x/crypto v0.47.0': 'golang.org/x/crypto v0.52.0',
    'golang.org/x/net v0.49.0': 'golang.org/x/net v0.55.0',
    'golang.org/x/sys v0.40.0': 'golang.org/x/sys v0.45.0',
    'golang.org/x/text v0.33.0': 'golang.org/x/text v0.37.0',
  };

  for (const [currentVersion, nextVersion] of Object.entries(replacements)) {
    replaceInFile(goModPath, currentVersion, nextVersion);
  }
}

function updateRustAxumDependencies(targetDir: string) {
  const cargoTomlPath = path.join(targetDir, 'Cargo.toml');
  const replacements: Record<string, string> = {
    'axum = "0.8.8"': 'axum = "0.8.9"',
    'serde_json = "1.0.149"': 'serde_json = "1.0.150"',
    'tokio = { version = "1.49.0", features = ["full"] }': 'tokio = { version = "1.52.3", features = ["full"] }',
    'vercel_runtime = { version = "2.1.0", features = ["axum"] }': 'vercel_runtime = { version = "2.2.0", features = ["axum"] }',
    'dotenvy = "0.15"': 'dotenvy = "0.15.7"',
    'tower-http = { version = "0.6.8", features = ["cors"] }': 'tower-http = { version = "0.6.11", features = ["cors"] }',
  };

  for (const [currentVersion, nextVersion] of Object.entries(replacements)) {
    replaceInFile(cargoTomlPath, currentVersion, nextVersion);
  }
  fs.rmSync(path.join(targetDir, 'Cargo.lock'), { force: true });
}

function getPortlessPrefix(dirName: string): string {
  const dashIndex = dirName.indexOf('-');
  if (dashIndex > 0) return dirName.slice(0, dashIndex);
  return dirName.slice(0, 2);
}

function clearDirectoryContents(targetDir: string) {
  if (!fs.existsSync(targetDir)) return;

  for (const entry of fs.readdirSync(targetDir)) {
    if (entry === '.git') continue;
    fs.rmSync(path.join(targetDir, entry), { recursive: true, force: true });
  }
}

function mergeDirectory(sourceDir: string, targetDir: string) {
  if (!fs.existsSync(sourceDir)) return;

  fs.mkdirSync(targetDir, { recursive: true });

  for (const entry of fs.readdirSync(sourceDir)) {
    fs.cpSync(path.join(sourceDir, entry), path.join(targetDir, entry), {
      recursive: true,
      force: true,
    });
  }
}

type PreparedDestination = {
  workingDir: string;
  finalize: () => void;
  cleanup: () => void;
};

function prepareDestination(targetDir: string, destinationMode: DestinationMode): PreparedDestination {
  const resolvedTargetDir = path.resolve(targetDir);

  if (destinationMode === 'create') {
    return {
      workingDir: resolvedTargetDir,
      finalize: () => {},
      cleanup: () => {},
    };
  }

  const stagingRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'create-stk-'));
  const workingDir = path.join(stagingRoot, path.basename(resolvedTargetDir) || 'project');

  return {
    workingDir,
    finalize: () => {
      fs.mkdirSync(resolvedTargetDir, { recursive: true });
      if (destinationMode === 'override') {
        clearDirectoryContents(resolvedTargetDir);
      }
      mergeDirectory(workingDir, resolvedTargetDir);
    },
    cleanup: () => {
      fs.rmSync(stagingRoot, { recursive: true, force: true });
    },
  };
}

async function withPreparedDestination(ctx: TemplateContext, setup: (ctx: TemplateContext) => Promise<void>) {
  const prepared = prepareDestination(ctx.targetDir, ctx.destinationMode);

  try {
    await setup({
      ...ctx,
      targetDir: prepared.workingDir,
    });
    prepared.finalize();
  } finally {
    prepared.cleanup();
  }
}

async function runBestEffort(command: string, args: string[], options: Options, label: string): Promise<boolean> {
  try {
    await execa(command, args, options);
    return true;
  } catch (error) {
    if (isCommandNotFound(error)) {
      console.warn(`[create-stk] ${label} skipped: '${command}' not found on PATH.`);
    } else {
      console.warn(`[create-stk] ${label} failed: ${getErrorMessage(error)}`);
    }
    return false;
  }
}

// Next JS
async function setupNext(ctx: TemplateContext) {
  const { targetDir, dirName, pkInstall, portless } = ctx;
  s.start('Setting up Next JS Project');
  await execa`${pkInstall} create-next-app@${SCAFFOLD_PACKAGE_VERSIONS.createNextApp} ${targetDir} --yes --empty --skip-install --disable-git --biome --src-dir --no-agents-md`;

  // Change metadata
  const layoutPath = path.resolve(targetDir, 'src/app/layout.tsx');
  fs.writeFileSync(layoutPath, fs.readFileSync(layoutPath, 'utf8').replace('Create Next App', 'Empty'));
  fs.writeFileSync(layoutPath, fs.readFileSync(layoutPath, 'utf8').replace('Generated by create next app', 'This is an empty project'));

  // Copy favicon from assets to app directory
  replaceFavicon(targetDir, 'src/app/favicon.ico');

  fs.writeFileSync(path.join(targetDir, 'src/app/page.tsx'), nextPageCode);
  fs.writeFileSync(path.join(targetDir, 'src/app/globals.css'), globalsCss);
  fs.writeFileSync(path.join(targetDir, 'README.md'), getReadmeCode(dirName));

  if (portless) {
    const packageJsonPath = path.join(targetDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as {
      scripts?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    packageJson.scripts = {
      ...packageJson.scripts,
      dev: `PORTLESS_ENV=1234 portless ${getPortlessPrefix(dirName)} next dev`,
    };
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      portless: SCAFFOLD_PACKAGE_VERSIONS.portless,
    };
    fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
  }

  s.stop('Next JS Project created!');
}

// Nuxt
async function setupNuxt(ctx: TemplateContext) {
  const { targetDir, dirName, pkInstall, packageManager } = ctx;
  s.start('Setting up Nuxt Project');
  await execa`${pkInstall} create-nuxt@${SCAFFOLD_PACKAGE_VERSIONS.createNuxt} ${targetDir} --template=minimal --force --no-install --no-modules --gitInit=false --packageManager=${packageManager}`;

  fs.writeFileSync(path.join(targetDir, 'app/app.vue'), nuxtApp);
  fs.writeFileSync(path.join(targetDir, 'app/globals.css'), globalsCss);

  // add css + metadata to config
  const originalConfig = fs.readFileSync(path.join(targetDir, 'nuxt.config.ts'), 'utf8');
  const dateMatch = originalConfig.match(/compatibilityDate:\s*'([^']+)'/);
  const compatibilityDate = dateMatch ? dateMatch[1] : '2026-01-01';
  fs.writeFileSync(path.join(targetDir, 'nuxt.config.ts'), nuxtConfig.replace('0000-00-00', compatibilityDate));

  replaceFavicon(targetDir, 'public/favicon.ico');
  fs.rmSync(path.join(targetDir, 'public/robots.txt'), { force: true });
  fs.writeFileSync(path.join(targetDir, 'README.md'), getReadmeCode(dirName));

  s.stop('Nuxt Project created!');
}

async function setupNode(ctx: TemplateContext) {
  const { targetDir, dirName } = ctx;
  s.start('Setting up Node Empty Project');

  // Create the target directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  fs.writeFileSync(path.join(targetDir, 'package.json'), getNodePackage(dirName));
  fs.writeFileSync(path.join(targetDir, 'index.ts'), nodeIndex);

  s.stop('Node Empty Project created!');
}

async function setupNodeServerlessPlaywright(ctx: TemplateContext) {
  const { targetDir, dirName } = ctx;
  s.start('Setting up Node Serverless + Playwright Project');

  await downloadTemplate(NODE_SERVERLESS_PLAYWRIGHT_TEMPLATE_SOURCE, {
    dir: targetDir,
  });

  updateDownloadedNodePackage(
    targetDir,
    dirName,
    SERVERLESS_PLAYWRIGHT_TEMPLATE_DEPENDENCIES,
    SERVERLESS_PLAYWRIGHT_TEMPLATE_DEV_DEPENDENCIES
  );
  replaceInFile(path.join(targetDir, 'api/index.ts'), TEMPLATE_PLACEHOLDER, dirName);
  replaceInFile(path.join(targetDir, 'README.md'), TEMPLATE_PLACEHOLDER, dirName);

  s.stop('Node Serverless + Playwright Project created!');
}

async function setupNodeElysia(ctx: TemplateContext) {
  const { targetDir, dirName } = ctx;
  s.start('Setting up Node Elysia (Bun) Project');

  await downloadTemplate(NODE_ELYSIA_TEMPLATE_SOURCE, {
    dir: targetDir,
  });

  updateDownloadedNodePackage(targetDir, dirName, ELYSIA_TEMPLATE_DEPENDENCIES, BUN_TEMPLATE_DEV_DEPENDENCIES);
  replaceInFile(path.join(targetDir, 'README.md'), TEMPLATE_PLACEHOLDER, dirName);
  replaceInFile(path.join(targetDir, 'api/index.ts'), TEMPLATE_PLACEHOLDER, dirName);

  s.stop('Node Elysia (Bun) Project created!');
}

async function setupJavaMaven(ctx: TemplateContext) {
  const { targetDir, dirName } = ctx;
  s.start('Setting up Java (maven) Project');

  await downloadTemplate(JAVA_MAVEN_TEMPLATE_SOURCE, {
    dir: targetDir,
  });

  replaceInFile(path.join(targetDir, 'src/main/java/Main.java'), TEMPLATE_PLACEHOLDER, dirName);
  replaceInFile(path.join(targetDir, 'pom.xml'), TEMPLATE_PLACEHOLDER, dirName);
  replaceInFile(path.join(targetDir, 'README.md'), TEMPLATE_PLACEHOLDER, dirName);

  s.stop('Java (maven) Project created!');
}

async function setupPythonFastApi(ctx: TemplateContext) {
  const { targetDir, dirName } = ctx;
  s.start('Setting up Python (FastAPI) Project');

  await downloadTemplate(PYTHON_FASTAPI_TEMPLATE_SOURCE, {
    dir: targetDir,
  });

  updatePythonFastApiDependencies(targetDir);
  replaceInFile(path.join(targetDir, 'src/index.py'), '{{ project_name }}', dirName);
  replaceInFile(path.join(targetDir, 'pyproject.toml'), '{{ project_name }}', dirName);
  replaceInFile(path.join(targetDir, 'README.md'), '{{ project_name }}', dirName);
  replaceInFile(path.join(targetDir, 'pyproject.toml'), '{{ project_description }}', PYTHON_TEMPLATE_DESCRIPTION);

  s.stop('Python (FastAPI) Project created!');
}

async function setupSvelte(ctx: TemplateContext) {
  const { targetDir, dirName, pkInstall, packageManager } = ctx;
  s.start('Setting up Svelte Project');
  await execa(pkInstall, [`sv@${SCAFFOLD_PACKAGE_VERSIONS.sv}`, 'create', '--template', 'minimal', '--types', 'ts', '--add', 'tailwindcss=plugins:none', '--no-install', targetDir], { stdio: 'ignore' });

  // Delete stuff
  fs.rmSync(path.join(targetDir, '.vscode'), { recursive: true, force: true });
  fs.rmSync(path.join(targetDir, 'static'), { recursive: true, force: true });
  fs.rmSync(path.join(targetDir, '.npmrc'), { force: true });
  fs.rmSync(path.join(targetDir, 'src/lib/assets/favicon.svg'), { force: true });

  // Replace adapter '@sveltejs/adapter-auto'
  if (packageManager == 'bun') {
    const svelteConfigPath = path.join(targetDir, 'svelte.config.js');
    fs.writeFileSync(svelteConfigPath, fs.readFileSync(svelteConfigPath, 'utf-8').replace("'@sveltejs/adapter-auto'", "'svelte-adapter-bun'"));
  }

  // Replace svelte:head in +layout.svelte and copy favicon
  fs.writeFileSync(
    path.join(targetDir, 'src/routes/+layout.svelte'),
    fs.readFileSync(path.join(targetDir, 'src/routes/+layout.svelte'), 'utf8')
      .replace(/<svelte:head>[\s\S]*?<\/svelte:head>/, svelteHead)
      .replace("'./layout.css'", "'./globals.css'")
      .replace("'$lib/assets/favicon.svg'", "'$lib/assets/favicon.ico'")
  );

  fs.writeFileSync(path.join(targetDir, 'src/routes/+page.svelte'), sveltePage);
  fs.rmSync(path.join(targetDir, 'src/routes/layout.css'), { force: true });
  fs.writeFileSync(path.join(targetDir, 'src/routes/globals.css'), globalsCss);

  replaceFavicon(targetDir, 'src/lib/assets/favicon.ico');

  fs.writeFileSync(path.join(targetDir, 'README.md'), getReadmeCode(dirName));

  s.stop('Svelte Project created!');
}

async function setupGoFiber(ctx: TemplateContext) {
  const { targetDir, dirName } = ctx;
  s.start('Setting up Go + Fiber Project');
  let hadFailure = false;

  await downloadTemplate(GO_FIBER_TEMPLATE_SOURCE, {
    dir: targetDir,
  });

  updateGoFiberDependencies(targetDir);
  const modulePath = dirName;
  const goModPath = path.join(targetDir, 'go.mod');

  if (!fs.existsSync(goModPath)) {
    const modInitOk = await runBestEffort(
      'go',
      ['mod', 'init', modulePath],
      { cwd: targetDir, stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true },
      'Go module initialization'
    );
    if (!modInitOk) hadFailure = true;
  }

  replaceInFile(path.join(targetDir, 'README.md'), TEMPLATE_PLACEHOLDER, modulePath);
  replaceInFile(path.join(targetDir, 'main.go'), TEMPLATE_PLACEHOLDER, modulePath);
  replaceInFile(path.join(targetDir, 'api/index.go'), TEMPLATE_PLACEHOLDER, modulePath);
  replaceInFile(goModPath, TEMPLATE_PLACEHOLDER, modulePath);

  const tidyOk = await runBestEffort(
    'go',
    ['mod', 'tidy'],
    { cwd: targetDir, stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true },
    'Go module tidy'
  );
  if (!tidyOk) hadFailure = true;

  s.stop(hadFailure ? 'Go + Fiber Project created (with setup warnings)' : 'Go + Fiber Project created!');
}

async function setupRustAxum(ctx: TemplateContext) {
  const { targetDir, dirName } = ctx;
  s.start('Setting up Rust + Axum Project');
  let hadFailure = false;

  await downloadTemplate(RUST_AXUM_TEMPLATE_SOURCE, {
    dir: targetDir,
  });

  updateRustAxumDependencies(targetDir);
  const crateName = dirName;
  replaceInFile(path.join(targetDir, 'README.md'), TEMPLATE_PLACEHOLDER, crateName);
  replaceInFile(path.join(targetDir, 'Cargo.toml'), TEMPLATE_PLACEHOLDER, crateName);
  replaceInFile(path.join(targetDir, 'Cargo.lock'), TEMPLATE_PLACEHOLDER, crateName);
  replaceInFile(path.join(targetDir, 'api/main.rs'), TEMPLATE_PLACEHOLDER, crateName);

  const updateOk = await runBestEffort(
    'cargo',
    ['update'],
    { cwd: targetDir, stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true },
    'Rust cargo update'
  );
  if (!updateOk) hadFailure = true;

  s.stop(hadFailure ? 'Rust + Axum Project created (with setup warnings)' : 'Rust + Axum Project created!');
}

const TEMPLATE_IMPLEMENTATIONS: Record<TemplateId, (ctx: TemplateContext) => Promise<void>> = {
  next: setupNext,
  nuxt: setupNuxt,
  svelte: setupSvelte,
  node: setupNode,
  'node-serverless-playwright': setupNodeServerlessPlaywright,
  'node-elysia': setupNodeElysia,
  'java-maven': setupJavaMaven,
  'python-fastapi': setupPythonFastApi,
  'go-fiber': setupGoFiber,
  'rust-axum': setupRustAxum,
};

export async function executeTemplate(id: TemplateId, ctx: TemplateContext) {
  if (!TEMPLATE_CONFIG.find(t => t.id === id)) {
    throw new Error(`Unknown project type: ${id}`);
  }
  await withPreparedDestination(ctx, TEMPLATE_IMPLEMENTATIONS[id]);
}

export function shouldInstallDependencies(projectType: TemplateId): boolean {
  return projectType !== 'go-fiber'
    && projectType !== 'rust-axum'
    && projectType !== 'java-maven'
    && projectType !== 'python-fastapi';
}

export async function installDependencies(targetDir: string, packageManager: PackageManager, projectType: TemplateId) {
  if (!shouldInstallDependencies(projectType)) {
    return;
  }

  s.start('Installing dependencies');
  let hadFailure = false;

  if (projectType === 'node-serverless-playwright') {
    const ok = await runBestEffort(
      'bun',
      ['install'],
      { cwd: targetDir, stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true },
      'Serverless + Playwright dependency install'
    );
    s.stop(ok ? 'Installed via bun' : 'Installed via bun (with warnings)');
    return;
  }
  if (projectType === 'node-elysia') {
    const ok = await runBestEffort(
      'bun',
      ['install'],
      { cwd: targetDir, stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true },
      'Elysia bun dependency install'
    );
    s.stop(ok ? 'Installed via bun' : 'Installed via bun (with warnings)');
    return;
  }

  // Add tailwind dependencies if using nuxt
  if (projectType === 'nuxt') {
    const ok = await runBestEffort(
      packageManager.toString(),
      ['install', SCAFFOLD_PACKAGE_VERSIONS.nuxtTailwindcss, SCAFFOLD_PACKAGE_VERSIONS.nuxtTailwindcssVite],
      { cwd: targetDir, stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true },
      'Nuxt dependency install'
    );
    if (!ok) hadFailure = true;
  }

  // * Regular 'npm install'
  const baseOk = await runBestEffort(
    packageManager.toString(),
    ['install'],
    { cwd: targetDir, stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true },
    'Dependency install'
  );
  if (!baseOk) {
    s.stop('Dependency installation skipped');
    return;
  }

  // Add dev dependencies if using node
  if (projectType === 'node') {
    const ok = await runBestEffort(
      packageManager.toString(),
      [
        'install',
        '-D',
        SCAFFOLD_PACKAGE_VERSIONS.nodeTypes,
        SCAFFOLD_PACKAGE_VERSIONS.dotenv,
        SCAFFOLD_PACKAGE_VERSIONS.tsx,
        SCAFFOLD_PACKAGE_VERSIONS.typescript,
      ],
      { cwd: targetDir, stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true },
      'Node dev dependency install'
    );
    if (!ok) hadFailure = true;
  }

  // Add bun adapter if using bun & svelte
  if (packageManager === 'bun' && projectType === 'svelte') {
    const ok = await runBestEffort(
      'bun',
      ['add', '-D', SCAFFOLD_PACKAGE_VERSIONS.svelteAdapterBun],
      { cwd: targetDir, stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true },
      'Svelte bun adapter install'
    );
    if (!ok) hadFailure = true;
  }

  s.stop(hadFailure ? `Installed via ${packageManager} (with warnings)` : `Installed via ${packageManager}`);
}

export async function initializeGit(targetDir: string) {
  s.start('Initializing git');
  const resolvedDir = path.resolve(targetDir);
  const gitignorePath = path.resolve(targetDir, '.gitignore');

  if (fs.existsSync(path.join(resolvedDir, '.git'))) {
    if (!fs.existsSync(gitignorePath)) {
      fs.writeFileSync(gitignorePath, gitignore);
    }
    s.stop('Git already initialized (commit skipped)');
    return;
  }

  const initOk = await runBestEffort('git', ['init'], { cwd: resolvedDir, stdio: 'ignore', windowsHide: true }, 'Git init');
  if (!initOk) {
    s.stop('Git initialization skipped');
    return;
  }

  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, gitignore);
  }

  await runBestEffort('git', ['add', '.'], { cwd: resolvedDir, stdio: 'ignore', windowsHide: true }, 'Git add');

  const commitOk = await runBestEffort('git', ['commit', '-m', 'Initial commit'], { cwd: resolvedDir, stdio: 'ignore', windowsHide: true }, 'Git commit');
  if (!commitOk) {
    s.stop('Git initialized (commit skipped)');
    return;
  }

  s.stop('Git initialized');
}
