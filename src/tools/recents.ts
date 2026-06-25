import { execObsidianCommand, type ObsidianCLIOptions } from "../utils/obsidian.js";

export async function handleRecents(
  options: ObsidianCLIOptions,
  args: { total?: boolean }
): Promise<{ content: { type: string; text: string }[] }> {
  const { total } = args;

  const raw = await execObsidianCommand(options, "recents", {
    total: total ? "total" : undefined,
  });

  return {
    content: [{ type: "text", text: raw }],
  };
}
