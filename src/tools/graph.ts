import { execObsidianCommand, buildFlag, type ObsidianCLIOptions } from "../utils/obsidian.js";

export async function handleGraph(
  options: ObsidianCLIOptions,
  args: {
    type: "backlinks" | "links" | "unresolved" | "orphans" | "deadends" | "related";
    file?: string;
  }
): Promise<{ content: { type: string; text: string }[] }> {
  const { type, file } = args;

  if (type === "related") {
    if (!file) {
      throw new Error('file is required when type="related"');
    }

    const [backlinksRaw, linksRaw] = await Promise.all([
      execObsidianCommand(options, "backlinks", { file }),
      execObsidianCommand(options, "links", { file }),
    ]);

    const result = formatRelatedGraph(backlinksRaw, linksRaw);
    return {
      content: [{ type: "text", text: result }],
    };
  }

  const raw = await execObsidianCommand(options, type, { file });
  return {
    content: [{ type: "text", text: raw }],
  };
}

function formatRelatedGraph(backlinksRaw: string, linksRaw: string): string {
  const parseLines = (raw: string): string[] =>
    raw
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

  const parents = parseLines(backlinksRaw);
  const children = parseLines(linksRaw);

  let result = "Parents (backlinks):\n";
  if (parents.length === 0) {
    result += "  None\n";
  } else {
    for (const p of parents) {
      result += `  - ${p}\n`;
    }
  }

  result += "\nChildren (links):\n";
  if (children.length === 0) {
    result += "  None\n";
  } else {
    for (const c of children) {
      result += `  - ${c}\n`;
    }
  }

  return result;
}
