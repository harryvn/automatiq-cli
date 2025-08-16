#!/usr/bin/env node

import { Command } from "commander";
import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import fs from "fs";
import path from "path";
import { setupProject } from "../src/setup.js";
import { showBanner } from "../src/banner.js";

// Version validation helper
const validateNodeVersion = () => {
  const requiredVersion = "16.0.0";
  const currentVersion = process.versions.node;
  const compareVersions = (a, b) => {
    const partsA = a.split(".").map(Number);
    const partsB = b.split(".").map(Number);
    for (let i = 0; i < 3; i++) {
      if (partsA[i] > partsB[i]) return 1;
      if (partsA[i] < partsB[i]) return -1;
    }
    return 0;
  };

  if (compareVersions(currentVersion, requiredVersion) < 0) {
    console.error(
      chalk.red(
        `Error: Node.js version ${requiredVersion} or higher is required. Current version: ${currentVersion}`
      )
    );
    process.exit(1);
  }
};

// Project name validation helper
const validateProjectName = (name) => {
  if (!name.trim().length) {
    return "Project name cannot be empty";
  }
  if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
    return "Project name can only contain letters, numbers, hyphens, and underscores";
  }

  const projectPath = path.join(process.cwd(), name);
  if (fs.existsSync(projectPath)) {
    return `A directory named "${name}" already exists. Please choose a different name.`;
  }

  return true;
};

// Language validation helper
const validateLanguage = (language) => {
  const validLanguages = ["JavaScript", "Java"];
  if (!validLanguages.includes(language)) {
    return `Invalid language. Please choose either 'JavaScript' or 'Java'`;
  }
  return true;
};

// Initialize CLI
const program = new Command();
validateNodeVersion();

program.version("1.0.0").description("Test Automation Framework Setup CLI");

program
  .command("init")
  .description("Initialize a new test automation project")
  .option("-n, --name <name>", "Project name")
  .option(
    "-l, --language <language>",
    "Programming language (JavaScript or Java)"
  )
  .action(async (options) => {
    try {
      await showBanner();

      // Validate language if provided via command line
      if (options.language) {
        const validationResult = validateLanguage(options.language);
        if (validationResult !== true) {
          console.error(chalk.red(`Error: ${validationResult}`));
          process.exit(1);
        }
      }

      // Collect project configuration
      const questions = [];

      // Project name input/validation
      if (!options.name) {
        questions.push({
          type: "input",
          name: "projectName",
          message: "Enter a project name:",
          validate: validateProjectName,
        });
      } else {
        const validationResult = validateProjectName(options.name);
        if (validationResult !== true) {
          console.error(chalk.red(`Error: ${validationResult}`));
          process.exit(1);
        }
      }

      // Framework selection (Selenium only for now)
      questions.push({
        type: "list",
        name: "framework",
        message: "Choose your test automation framework:",
        choices: [
          {
            name: "Selenium",
            value: "Selenium",
          },
          {
            name: "Playwright (Coming Soon)",
            value: "Playwright",
            disabled: true,
          },
        ],
      });

      const initialAnswers = await inquirer.prompt(questions);

      // Language selection for Selenium
      const languageQuestion = {
        type: "list",
        name: "language",
        message: "Choose your preferred programming language:",
        choices: [
          {
            name: "JavaScript",
            value: "JavaScript",
          },
          {
            name: "Java",
            value: "Java",
          },
        ],
      };

      const languageAnswer = options.language
        ? { language: options.language }
        : await inquirer.prompt([languageQuestion]);

      // Configure and setup project
      const projectConfig = {
        projectName: options.name || initialAnswers.projectName,
        framework: initialAnswers.framework,
        language: languageAnswer.language,
      };

      const spinner = ora({
        text: "Setting up your project...",
        spinner: "dots",
      }).start();

      try {
        await setupProject(projectConfig);
        spinner.succeed("Project created successfully!");

        // Show success message and next steps
        console.log(chalk.green("\n✨ Your project is ready! ✨"));
        console.log(
          chalk.cyan(`\n🔨 Framework: Selenium with ${projectConfig.language}`)
        );
        console.log(chalk.blue("\n📝 Next steps:"));
        console.log(chalk.white(`1. cd ${projectConfig.projectName}`));
        console.log(
          chalk.white("2. Check the `README.md` file for more details")
        );
      } catch (error) {
        spinner.fail("Project setup failed");
        throw error;
      }
    } catch (error) {
      console.error(chalk.red("\nError:", error.message));
      process.exit(1);
    }
  });

program.parse(process.argv);
