import { cancel, confirm, group, isCancel, select, text } from '@clack/prompts';
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import {
  EXISTING_CONTENT_MODES,
  SUPPORTED_PACKAGES,
  PROJECT_TYPES,
  SUPPORTED_CATEGORIES,
  SUPPORTED_PROJECTS,
  templateNeedsPackageManager,
  type ExistingContentMode,
  type DestinationMode,
  type Package,
  type PackageManager,
  type TemplateId,
} from './config';

export type CliOptions = {
  targetDir?: string;
  project?: TemplateId;
  packageManager?: PackageManager;
  existingContentMode?: ExistingContentMode;
  git?: boolean;
  skipInstall?: boolean;
  dryRun?: boolean;
};

export type CliPlan = {
  targetDir: string;
  dirName: string;
  projectType: TemplateId;
  packageManager: PackageManager;
  destinationMode: DestinationMode;
  git: boolean;
  pkInstall: string;
};

function resolveGitOption(command: { getOptionValueSource: (name: string) => string; getOptionValue: (name: string) => unknown }): boolean | undefined {
  const source = command.getOptionValueSource('git');
  if (source === 'default') return undefined;
  return command.getOptionValue('git') as boolean;
}

function validateProjectType(command: { error: (message: string) => void }, project?: string) {
  if (!project) return;
  if (!PROJECT_TYPES.includes(project as TemplateId)) {
    command.error(`Invalid project. Use one of: ${PROJECT_TYPES.join(', ')}`);
  }
}

function validatePackageManager(command: { error: (message: string) => void }, packageManager?: string) {
  if (!packageManager) return;
  const managers = SUPPORTED_PACKAGES.map(p => p.pkName);
  if (!managers.includes(packageManager as PackageManager)) {
    command.error(`Invalid package manager. Use one of: ${managers.join(', ')}`);
  }
}

function validateExistingContentMode(command: { error: (message: string) => void }, mode?: string) {
  if (!mode) return;
  if (!EXISTING_CONTENT_MODES.includes(mode as ExistingContentMode)) {
    command.error(`Invalid existing-content mode. Use one of: ${EXISTING_CONTENT_MODES.join(', ')}`);
  }
}

function detectPositionalProject(argv: string[]): { project?: TemplateId; normalizedArgv: string[] } {
  const normalized = [...argv];
  const candidate = normalized[2];
  if (candidate && PROJECT_TYPES.includes(candidate as TemplateId)) {
    normalized.splice(2, 1);
    return { project: candidate as TemplateId, normalizedArgv: normalized };
  }
  return { normalizedArgv: normalized };
}

function isCanceled(value: boolean | string | symbol): asserts value is string | boolean {
  if (isCancel(value)) {
    cancel('Project creation cancelled.');
    process.exit(0);
  }
}

function getPackageManager(): Package {
  const ua = process.env.npm_config_user_agent ?? '';
  const detected = SUPPORTED_PACKAGES.find(p => ua.startsWith(p.pkName)) ?? SUPPORTED_PACKAGES[0];
  return detected;
}

function getDestinationMode(targetDir: string, cliMode?: ExistingContentMode): Promise<DestinationMode> | DestinationMode {
  const resolvedTargetDir = path.resolve(targetDir);

  if (!fs.existsSync(resolvedTargetDir)) {
    return 'create';
  }

  const stats = fs.statSync(resolvedTargetDir);
  if (!stats.isDirectory()) {
    throw new Error(`Destination ${resolvedTargetDir} already exists and is not a directory.`);
  }

  if (fs.readdirSync(resolvedTargetDir).length === 0) {
    return 'create';
  }

  if (cliMode) {
    return cliMode;
  }

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error(
      `Destination ${resolvedTargetDir} already contains files. Re-run with --existing-content append or --existing-content override.`
    );
  }

  return select({
    message: `Destination ${resolvedTargetDir} already contains files. How should create-stk proceed?`,
    options: [
      {
        value: 'append',
        label: 'Append',
        hint: 'add scaffold files on top of the current contents',
      },
      {
        value: 'override',
        label: 'Override',
        hint: 'replace current contents but preserve .git if it exists',
      },
    ],
  }) as Promise<DestinationMode>;
}

export function parseCliArgs(argv: string[]): CliOptions {
  const program = new Command();
  let parsed: CliOptions | null = null;

  const { project, normalizedArgv } = detectPositionalProject(argv);

  const managers = SUPPORTED_PACKAGES.map(p => p.pkName);

  program
    .name('create-stk')
    .description('Opinionated, unified project scaffolding CLI.')
    .argument('[directory]', 'Where your project will be stored')
    .option('-p, --project <type>', `Project type: ${PROJECT_TYPES.join(' | ')} (auto-selects defaults)`)
    .option('--pm <manager>', `Package manager: ${managers.join(' | ')} (defaults to detected when project is provided)`)
    .option('--existing-content <mode>', `How to handle non-empty destinations: ${EXISTING_CONTENT_MODES.join(' | ')}`)
    .option('--git', 'Initialize git repository (default when project is provided)')
    .option('--no-git', 'Skip git initialization (overrides default)')
    .option('--skip-install', 'Skip dependency installation')
    .option('--dry-run', 'Print the plan without creating files');

  program.action((directory: string | undefined, options: Record<string, unknown>, command: { error: (message: string) => void; getOptionValueSource: (name: string) => string; getOptionValue: (name: string) => unknown }) => {
    const projectOption = options.project as TemplateId | undefined;
    const packageManager = options.pm as PackageManager | undefined;
    const existingContentMode = options.existingContent as ExistingContentMode | undefined;

    validateProjectType(command, projectOption ?? project);
    validatePackageManager(command, packageManager);
    validateExistingContentMode(command, existingContentMode);

    parsed = {
      targetDir: directory,
      project: projectOption ?? project,
      packageManager,
      existingContentMode,
      git: resolveGitOption(command),
      skipInstall: Boolean(options.skipInstall),
      dryRun: Boolean(options.dryRun),
    };
  });

  program.parse(normalizedArgv);

  return (parsed ?? { project }) as CliOptions;
}

export async function resolvePlan(cli: CliOptions): Promise<CliPlan> {
  let targetDir = cli.targetDir;
  const project = cli.project ?? false;

  if (!targetDir) {
    const dir = await text({
      message: 'Enter your project name:',
      placeholder: '.',
      defaultValue: '.',
      validate(value) {
        if (/\s/.test(value)) return `Spaces are not allowed in the project name!`;
      },
    });

    isCanceled(dir);

    targetDir = dir.toString();
  }

  const dirName = targetDir === '.' ? path.basename(process.cwd()) : path.basename(path.resolve(targetDir));
  const { pkName, pkInstall } = getPackageManager();
  const destinationMode = await getDestinationMode(targetDir, cli.existingContentMode);

  isCanceled(destinationMode);

  let projectType: TemplateId;
  if (project) {
    projectType = project as TemplateId;
  } else {
    const projectCategory = await select({
      message: 'What type of project do you want?',
      options: SUPPORTED_CATEGORIES.map(p => ({ value: p, label: p })),
    });

    isCanceled(projectCategory);

    const categoryProjects = SUPPORTED_PROJECTS.filter(p => p.category === projectCategory);
    const hasGroupedProjects = categoryProjects.some(p => Boolean(p.group));

    if (hasGroupedProjects) {
      const groupOptions = [...new Set(categoryProjects.map(p => p.group ?? p.name))];
      const projectGroup = await select({
        message: `What ${projectCategory.toLowerCase()} stack do you want to use?`,
        options: groupOptions.map(group => ({ value: group, label: group })),
      });

      isCanceled(projectGroup);

      const projectsInGroup = categoryProjects.filter(p => (p.group ?? p.name) === projectGroup);
      projectType = await select({
        message: `What ${String(projectGroup).toLowerCase()} template do you want to use?`,
        options: projectsInGroup.map(p => ({
          value: p.type,
          label: p.name,
        })),
      }) as TemplateId;
    } else {
      projectType = await select({
        message: `What ${projectCategory.toLowerCase()} template do you want to use?`,
        options: categoryProjects.map(p => ({
          value: p.type,
          label: p.name,
        })),
      }) as TemplateId;
    }

    isCanceled(projectType);
  }

  let packageManager: PackageManager;
  if (templateNeedsPackageManager(projectType)) {
    if (cli.packageManager) {
      packageManager = cli.packageManager;
    } else if (project) {
      packageManager = pkName as PackageManager;
    } else {
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
        },
        {
          onCancel: () => {
            cancel('Project creation cancelled.');
            process.exit(0);
          },
        }
      );

      packageManager = selections.packageManager as PackageManager;
    }
  } else {
    packageManager = cli.packageManager ?? (pkName as PackageManager);
  }
  if (projectType === 'node-elysia' || projectType === 'node-serverless-playwright') {
    packageManager = 'bun';
  }

  let git: boolean;
  if (typeof cli.git === 'boolean') {
    git = cli.git;
  } else if (project) {
    git = true;
  } else {
    const gitChoice = await confirm({
      message: 'Do you want to initialize a git repo?',
    });
    isCanceled(gitChoice);
    git = gitChoice as boolean;
  }

  return { targetDir, dirName, projectType, packageManager, destinationMode, git, pkInstall };
}
