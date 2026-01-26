#!/usr/bin/env node
import chalk from 'chalk';
import { Step1, Step2, Step3 } from './steps';

async function main() {
    // Step 1: Get the necessary variables to begin the scaffold.
    const { targetDir, dirName, project, pkName, pkInstall } = await Step1();

    // Step 2: Get package manager, git, and project type
    const { packageManager, git, projectType } = await Step2(project, pkName);

    // Step 3: Setup project, install dependencies & initialize git
    await Step3(targetDir, dirName, pkInstall, packageManager, projectType, git)

    // Step 4: Success message
    console.log(chalk.green("\n🎉 Great! Your project has been created successfully! 🎉"))
    console.log("To view your project run:")
    console.log("")
    {targetDir != "." && console.log(chalk.yellow(`\tcd ${targetDir}`))}
    {packageManager=="npm" ? (
        console.log(chalk.yellow(`\t${packageManager} run dev`))
    ):(
        console.log(chalk.yellow(`\t${packageManager} dev`))
    )}
    console.log("");
}

main();