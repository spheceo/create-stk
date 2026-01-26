#!/usr/bin/env node
import chalk from 'chalk';
import { parseCliArgs, resolvePlan } from './cli';
import { executeTemplate, initializeGit, installDependencies } from './templates';

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

  if (!cli.skipInstall) {
    await installDependencies(plan.targetDir, plan.packageManager, plan.projectType);
  }

  if (plan.git) {
    await initializeGit(plan.targetDir);
  }

  console.log(chalk.green('\n🎉 Great! Your project has been created successfully! 🎉'));
  console.log('To view your project run:');
  console.log('');
  { plan.targetDir != '.' && console.log(chalk.yellow(`\tcd ${plan.targetDir}`)); }
  { plan.packageManager == 'npm'
    ? console.log(chalk.yellow(`\t${plan.packageManager} run dev`))
    : console.log(chalk.yellow(`\t${plan.packageManager} dev`)); }
  console.log('');
}

main();
