export const SUPPORTED_PROJECTS = [
  { name: 'Next JS', type: 'next', category: 'Frontend' },
  { name: 'Nuxt', type: 'nuxt', category: 'Frontend' },
  { name: 'Svelte', type: 'svelte', category: 'Frontend' },
  { name: 'Node', type: 'node', category: 'Backend' },
] as const

export const SUPPORTED_PACKAGES = [
  { pkName: 'npm', pkInstall: 'npx' },
  { pkName: 'pnpm', pkInstall: 'pnpx' },
  { pkName: 'bun', pkInstall: 'bunx' },
] as const

export const SUPPORTED_CATEGORIES = [...new Set(SUPPORTED_PROJECTS.map(p => p.category))]
export const PROJECT_TYPES = SUPPORTED_PROJECTS.map(p => p.type)
export type ProjectType = typeof PROJECT_TYPES[number]
export type Package = (typeof SUPPORTED_PACKAGES)[number]
