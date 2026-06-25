import { execObsidianCommand, buildFlag, type ObsidianCLIOptions } from "../utils/obsidian.js";

export async function handleTags(
  options: ObsidianCLIOptions,
  args: {
    file?: string;
    path?: string;
    total?: boolean;
    counts?: boolean;
    sort?: "name" | "count";
    format?: "json" | "tsv" | "csv";
    active?: boolean;
  }
): Promise<{ content: { type: string; text: string }[] }> {
  const { file, path: p, total, counts, sort, format, active } = args;

  const raw = await execObsidianCommand(options, "tags", {
    file,
    path: p,
    total: total ? "total" : undefined,
    counts: counts ? "counts" : undefined,
    sort,
    format,
    active: active ? "active" : undefined,
  });

  return {
    content: [{ type: "text", text: raw }],
  };
}
