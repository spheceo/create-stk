import { cancel, isCancel, text, select, confirm, group } from '@clack/prompts';
import path from 'path';
import { Command } from 'commander';
import { Package, PROJECT_TYPES, ProjectType, SUPPORTED_CATEGORIES, SUPPORTED_PACKAGES, SUPPORTED_PROJECTS } from './constants';
import { installDependencies, initializeGit, setupNext, setupNode, setupNuxt, setupSvelte } from './setup';

const program = new Command();

program
  .name('create-stk')
  .description('My personal project scaffolding CLI.')
  .argument('[directory]', 'Where your project will be stored')
  .option('-p, --project <type>', `Project type: ${PROJECT_TYPES.join(' | ')}`)
  .action((directory, options) => {
    if (!directory) return
    if (options.project && !PROJECT_TYPES.includes(options.project)) {
      console.error(`Invalid project. Use one of: ${PROJECT_TYPES.join(', ')}`)
      process.exit(1)
    }
  })

program.parse(process.argv)

// The function called when someone cancels a step.
function isCanceled(value: boolean | string | symbol): asserts value is string | boolean {
  if (isCancel(value)) {
      cancel('Project creation cancelled.');
      process.exit(0);
  }
}

// Get the package manager
function getPackageManager(): Package {
  const ua = process.env.npm_config_user_agent ?? ''
  const detected = SUPPORTED_PACKAGES.find(p => ua.startsWith(p.pkName)) ?? SUPPORTED_PACKAGES[0];
  return detected;
}

export async function Step1() {
  let targetDir = program.args[0]
  let options = program.opts()
  let project = options.project as ProjectType || false

  if (!targetDir) {
    const dir = await text({
        message: 'Enter your project name:',
        placeholder: '.',
        defaultValue: '.',
        validate(value) {
          if (/\s/.test(value)) return `Spaces are not allowed in the project name!`;
        }
    })

    isCanceled(dir)

    targetDir = dir.toString()
  }

  const dirName = targetDir === '.' ? path.basename(process.cwd()) : path.basename(path.resolve(targetDir))
  const { pkName, pkInstall } = getPackageManager();

  return { targetDir, dirName, project, pkName, pkInstall }
}

export async function Step2(project: ProjectType | false, pkName: string) {
  let packageManager: string;
  let git: boolean;
  let projectType: string;

  if (project) {
      // Auto-select defaults when project is provided via flag
      packageManager = pkName;
      git = true;
      projectType = project;
  } else {
      // Confirm package manager & git
      const selections = await group(
          {
              packageManager: () => select({
                  message: 'Which package manager would you like to use?',
                  initialValue: pkName,
                  options: SUPPORTED_PACKAGES.map(p => ({
                    value: p.pkName,
                    label: p.pkName,
                    hint: pkName === p.pkName ? 'detected' : '',
                  })),
              }),
              git: () => confirm({
                  message: 'Do you want to initialize a git repo?',
              })
          }, {
              onCancel: () => {
                  cancel('Project creation cancelled.');
                  process.exit(0);
              },
      })

      packageManager = selections.packageManager as string;
      git = selections.git as boolean;

      // Ask Project category
      const projectCategory = await select({
          message: 'What type of project do you want?',
          options: SUPPORTED_CATEGORIES.map(p => ({ value: p, label: p })),
      });

      isCanceled(projectCategory)

      // Ask Project type
      projectType = await select({
          message: `What ${projectCategory.toLowerCase()} template do you want to use?`,
          options: SUPPORTED_PROJECTS.filter(p => p.category === projectCategory).map(p => ({
              value: p.type,
              label: p.name,
          })),
      }) as string;
      
      isCanceled(projectType)
  }

  return { packageManager, git, projectType }
}

export async function Step3(targetDir: string, dirName: string, pkInstall: string, packageManager: string, projectType: string, git: boolean) {
  // Setup Project
  switch(projectType) {
    case "next":
      await setupNext(targetDir, pkInstall, dirName)
      break;
    case "nuxt":
      await setupNuxt(targetDir, pkInstall, dirName, packageManager)
      break;
    case "node":
      await setupNode(targetDir, pkInstall, dirName)
      break;
    case "svelte":
      await setupSvelte(targetDir, pkInstall, dirName, packageManager)
      break;
  }

  // Install Dependencies
  await installDependencies(targetDir, packageManager, projectType)

  // Initialize Git
  if (git) {
    await initializeGit(targetDir)
  }
}
