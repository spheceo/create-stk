#!/usr/bin/env node
import chalk from 'chalk';
import { parseCliArgs, resolvePlan } from './cli';
import { executeTemplate, initializeGit, installDependencies, shouldInstallDependencies } from './templates';

function printDryRun(plan: {
  targetDir: string;
  dirName: string;
  projectType: string;
  packageManager: string;
  git: boolean;
  pkInstall: string;
  skipInstall: boolean;
}) {
  console.log(JSON.stringify({ dryRun: true, plan }, null, 2));
}

function getDevCommand(projectType: string, packageManager: string): string {
  if (projectType === 'go-fiber') {
    return 'go run .';
  }
  if (projectType === 'rust-axum') {
    return 'cargo run';
  }

  if (packageManager === 'npm') {
    return `${packageManager} run dev`;
  }

  return `${packageManager} dev`;
}

async function main() {
  const cli = parseCliArgs(process.argv);
  const plan = await resolvePlan(cli);

  if (cli.dryRun) {
    printDryRun({
      ...plan,
      skipInstall: Boolean(cli.skipInstall),
    });
    return;
  }

  await executeTemplate(plan.projectType, {
    targetDir: plan.targetDir,
    dirName: plan.dirName,
    pkInstall: plan.pkInstall,
    packageManager: plan.packageManager,
  });

  if (!cli.skipInstall && shouldInstallDependencies(plan.projectType)) {
    await installDependencies(plan.targetDir, plan.packageManager, plan.projectType);
  }

  if (plan.git) {
    await initializeGit(plan.targetDir);
  }

  console.log(chalk.green('\n🎉 Great! Your project has been created successfully! 🎉'));
  console.log('To view your project run:');
  console.log('');
  { plan.targetDir != '.' && console.log(chalk.yellow(`\tcd ${plan.targetDir}`)); }
  console.log(chalk.yellow(`\t${getDevCommand(plan.projectType, plan.packageManager)}`));
  console.log('');
}

main().catch((error: unknown) => {
  const err = error instanceof Error ? error : new Error(String(error));
  console.error(chalk.red('Something went wrong:'));
  console.error(chalk.red(err.message));
  if (err.stack) console.error(chalk.gray(err.stack));
  process.exit(1);
});
