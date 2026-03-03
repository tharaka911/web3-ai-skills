#!/usr/bin/env node

import { Command } from "commander";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import ora from "ora";

// Handle __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

program
  .name("web3-ai-skills")
  .description("CLI to initialize the Web3 AI Agent Skills template")
  .version("1.0.0");

program
  .command("init")
  .description("Initialize Web3 AI skills in the current directory")
  .option("-d, --dir <directory>", "Target directory to install", ".agent")
  .option("-f, --force", "Force overwrite existing files", false)
  .action(async (options) => {
    const targetDir = path.resolve(process.cwd(), options.dir);
    const sourceDir = path.resolve(__dirname, "../template/.agent");

    console.log(
      chalk.blueBright(`\n🚀 Initializing Web3 AI Skills in ${chalk.bold(targetDir)}...\n`)
    );

    const spinner = ora("Copying Web3 Agent templates...").start();

    try {
      // Check if target exists
      if (fs.existsSync(targetDir) && !options.force) {
        spinner.fail(
          chalk.red(
            `Directory ${chalk.bold(
              options.dir
            )} already exists! Use --force to overwrite.`
          )
        );
        process.exit(1);
      }

      // Check if source exists
      if (!fs.existsSync(sourceDir)) {
        spinner.fail(chalk.red("Template source not found! Is the package corrupted?"));
        process.exit(1);
      }

      // Copy files
      await fs.copy(sourceDir, targetDir, {
        overwrite: options.force,
        errorOnExist: false,
      });

      spinner.succeed(chalk.green("Web3 AI Skills initialized successfully! 🎉"));

      console.log(`\n${chalk.cyan("Next steps:")}`);
      console.log(`1. Review the generated ${chalk.bold(options.dir)} folder.`);
      console.log(`2. Read ${chalk.bold(path.join(options.dir, "GEMINI.md"))} to understand the Web3 agent protocol.`);
      console.log(`3. Start interacting with your specialized Web3 Agents!\n`);
    } catch (error) {
      spinner.fail(chalk.red("Oops! Something went wrong during initialization."));
      console.error(error);
      process.exit(1);
    }
  });

program.parse();
