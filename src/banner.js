import figlet from "figlet";
import gradient from "gradient-string";
import { promisify } from "util";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const figletPromise = promisify(figlet);
const __dirname = dirname(fileURLToPath(import.meta.url));

export async function showBanner() {
  const packageJson = JSON.parse(
    readFileSync(join(__dirname, "../package.json"), "utf8")
  );
  const text = await figletPromise("A u t o M a t i Q");
  const coloredText = gradient(["#FF8C00", "#FF0080"]).multiline(text);

  // Calculate the width of the ASCII art by finding the longest line
  const titleWidth = text
    .split("\n")
    .reduce((max, line) => Math.max(max, line.length), 0);
  const subText = `The Future Tests Itself! - v${packageJson.version}`;
  // Calculate padding to center the subtext
  const padding = Math.max(0, Math.floor((titleWidth - subText.length) / 2));

  console.log("\n" + coloredText);
  // console.log(gradient(['#FF8C00', '#FF0080'])('─'.repeat(68)) + '\n');
  console.log(gradient(["#FF8C00", "#FF0080"])(" ".repeat(padding) + subText));
  // console.log(gradient(['#FF8C00', '#FF0080'])(`v${packageJson.version}`));
  console.log(gradient(["#FF8C00", "#FF0080"])("─".repeat(68)) + "\n");
}
