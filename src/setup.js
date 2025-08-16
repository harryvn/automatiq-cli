import fs from "fs-extra";
import path from "path";
import simpleGit from "simple-git";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

const TEMPLATE_REPOS = {
  Selenium: {
    JavaScript: "https://github.com/harryvn/automation-framework.git",
    Java: "https://github.com/harryvn/selenium-automation-framework-java.git",
  },
};

export async function setupProject(config) {
  const { projectName, framework, language } = config;
  const git = simpleGit();

  try {
    // Create project directory
    await fs.ensureDir(projectName);

    // Get the appropriate repository URL
    const templateRepo = TEMPLATE_REPOS[framework][language];

    // Clone the repository
    await git.clone(templateRepo, projectName, ["--depth", "1"]);

    // Remove .git directory to start fresh
    const gitDir = path.join(process.cwd(), projectName, ".git");
    await fs.remove(gitDir);

    // Initialize new git repository
    const projectGit = simpleGit(path.join(process.cwd(), projectName));
    await projectGit.init();
  } catch (error) {
    throw new Error(`Failed to setup project: ${error.message}`);
  }
}
