import { execObsidianCommand, type ObsidianCLIOptions } from "../utils/obsidian.js";

export async function handleFiles(
  options: ObsidianCLIOptions,
  args: { folder?: string; ext?: string; total?: boolean }
): Promise<{ content: { type: string; text: string }[] }> {
  const { folder, ext, total } = args;

  const raw = await execObsidianCommand(options, "files", {
    folder,
    ext,
    total: total ? "total" : undefined,
  });

  return {
    content: [{ type: "text", text: raw }],
  };
}
