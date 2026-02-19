export const SUPPORTED_PACKAGES = [
  { pkName: 'npm', pkInstall: 'npx' },
  { pkName: 'pnpm', pkInstall: 'pnpx' },
  { pkName: 'bun', pkInstall: 'bunx' },
] as const;

export type Package = (typeof SUPPORTED_PACKAGES)[number];
export type PackageManager = Package['pkName'];

export const TEMPLATE_CONFIG = [
  { id: 'next', name: 'Next JS', category: 'Frontend' },
  { id: 'nuxt', name: 'Nuxt', category: 'Frontend' },
  { id: 'svelte', name: 'Svelte', category: 'Frontend' },
  { id: 'node', name: 'Node', category: 'Backend' },
  { id: 'go-fiber', name: 'Go + Fiber', category: 'Backend' },
  { id: 'rust-axum', name: 'Rust + Axum', category: 'Backend' },
] as const;

export type TemplateId = typeof TEMPLATE_CONFIG[number]['id'];

export const PROJECT_TYPES = TEMPLATE_CONFIG.map(t => t.id) as TemplateId[];
export const SUPPORTED_CATEGORIES = [...new Set(TEMPLATE_CONFIG.map(t => t.category))];
export const SUPPORTED_PROJECTS = TEMPLATE_CONFIG.map(t => ({
  name: t.name,
  type: t.id,
  category: t.category,
}));

export function templateNeedsPackageManager(templateId: TemplateId): boolean {
  return templateId !== 'go-fiber' && templateId !== 'rust-axum';
}

export type TemplateContext = {
  targetDir: string;
  dirName: string;
  pkInstall: string;
  packageManager: PackageManager;
};
