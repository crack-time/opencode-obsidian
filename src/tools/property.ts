import { execObsidianCommand, buildFlag, type ObsidianCLIOptions } from "../utils/obsidian.js";

export async function handleProperty(
  options: ObsidianCLIOptions,
  args: {
    action: "read" | "set" | "remove";
    name: string;
    file: string;
    value?: string;
    type?: "text" | "list" | "number" | "date" | "checkbox";
  }
): Promise<{ content: { type: string; text: string }[] }> {
  const { action, name, file, value, type } = args;

  if (!name) {
    throw new Error("name is required");
  }

  if (!file) {
    throw new Error("file is required");
  }

  const cmd = `property:${action}`;
  const raw = await execObsidianCommand(options, cmd, {
    name,
    value,
    type,
    file,
  });

  return {
    content: [{ type: "text", text: raw }],
  };
}
