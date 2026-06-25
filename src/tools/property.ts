import { execObsidianCommand, type ObsidianCLIOptions } from "../utils/obsidian.js";

export async function handleProperty(
  options: ObsidianCLIOptions,
  args: { name: string; file: string }
): Promise<{ content: { type: string; text: string }[] }> {
  const { name, file } = args;

  if (!name) {
    throw new Error("name is required");
  }

  if (!file) {
    throw new Error("file is required");
  }

  const raw = await execObsidianCommand(options, "properties", {
    file,
    format: "json",
  });

  let parsed: Record<string, any>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      content: [{ type: "text", text: `No frontmatter in ${file}` }],
    };
  }

  if (!(name in parsed)) {
    return {
      content: [{ type: "text", text: `Property "${name}" not found in ${file}` }],
    };
  }

  const value = parsed[name];
  const text = typeof value === "string" ? value : JSON.stringify(value);

  return { content: [{ type: "text", text }] };
}
