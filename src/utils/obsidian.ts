import { execSync } from "child_process";

export interface ObsidianCLIOptions {
  vaultPath: string;
  cliPath: string;
}

export async function execObsidianCommand(
  options: ObsidianCLIOptions,
  command: string,
  args: Record<string, any> = {}
): Promise<string> {
  const { vaultPath, cliPath } = options;
  
  // Build command string
  const vaultArg = vaultPath ? `--vault "${vaultPath}"` : "";
  const argsStr = Object.entries(args)
    .filter(([_, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => {
      if (typeof value === "boolean") {
        return value ? key : "";
      }
      return `${key}=${value}`;
    })
    .filter(Boolean)
    .join(" ");

  const fullCommand = `${cliPath} ${command} ${argsStr} ${vaultArg}`.trim();

  return new Promise((resolve, reject) => {
    execSync(fullCommand, { encoding: "utf-8" }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Obsidian CLI error: ${error.message}`));
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

export function buildFlag(key: string, value: any): string {
  if (value === undefined || value === null || value === "") {
    return "";
  }
  if (typeof value === "boolean") {
    return value ? key : "";
  }
  return `${key}=${value}`;
}
