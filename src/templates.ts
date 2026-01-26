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
*.tsbuildinfo`

export const getReadmeCode = (dirName: string) => `# ${dirName.charAt(0).toUpperCase() + dirName.slice(1)}
This is an empty project.`

export const globalsCss = `@import "tailwindcss";

:root {
    --background: #ffffff;
    --foreground: #171717;
}

body {
    background: var(--background);
    color: var(--foreground);
}`

// Next JS
export const nextPageCode = `export default function Home() {
  return (
    <div>
      <h1>Hello World!</h1>
    </div>
  )
}`

// Node
export const nodeIndex = `
console.log("Hello World!");`

export const getNodePackage = (dirName: string) => `{
  "name": "${dirName}",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx index.mts"
  },
  "dependencies": {},
  "devDependencies": {}
}`

// Nuxt 
export const nuxtApp = `<script setup lang="ts">
  // typescript logic here
</script>

<template>
  <h1>Hello World!</h1>
</template>`

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
})`

// Svelte
export const sveltePage = `<div>
  <h1>Hello World!</h1>
</div>`

export const svelteHead = `<svelte:head>
	<title>Empty</title>
	<meta name="description" content="This is an empty project" />
	<link rel="icon" href={favicon} />
</svelte:head>`
