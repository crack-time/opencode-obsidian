import { readFile } from "fs/promises";
import path from "path";
import { execObsidianCommand, buildFlag, type ObsidianCLIOptions } from "../utils/obsidian.js";

export async function handleSearch(
  options: ObsidianCLIOptions,
  args: { query: string; path?: string; limit?: number }
): Promise<{ content: { type: string; text: string }[] }> {
  const { query, path: p, limit } = args;

  if (!query) {
    throw new Error("query is required");
  }

  const raw = await execObsidianCommand(options, "search", {
    query,
    path: p,
    limit,
    format: "json",
  });

  const paths = JSON.parse(raw) as string[];
  const results = await formatSearchResults(paths, query, options.vaultPath);

  return {
    content: [{ type: "text", text: results }],
  };
}

async function formatSearchResults(
  paths: string[],
  query: string,
  vaultPath: string
): Promise<string> {
  if (paths.length === 0) {
    return "No results found.";
  }

  const results = await Promise.all(
    paths.map(async (filePath) => {
      try {
        const fullPath = path.join(vaultPath, filePath);
        const content = await readFile(fullPath, "utf-8");

        // Skip YAML frontmatter
        let body = content;
        if (content.startsWith("---")) {
          const endIdx = content.indexOf("---", 3);
          if (endIdx !== -1) {
            body = content.slice(endIdx + 3);
          }
        }

        // Find first match (case-insensitive)
        const lowerBody = body.toLowerCase();
        const lowerQuery = query.toLowerCase();
        const matchIdx = lowerBody.indexOf(lowerQuery);

        if (matchIdx === -1) {
          return `File: ${filePath}\n  Snippet: (match not found in content)\n`;
        }

        // Extract ~200-char snippet centered on match
        const start = Math.max(0, matchIdx - 80);
        const end = Math.min(body.length, matchIdx + query.length + 120);
        let snippet = body.slice(start, end).trim();
        if (start > 0) snippet = "..." + snippet;
        if (end < body.length) snippet = snippet + "...";

        // Clean up newlines in snippet
        snippet = snippet.replace(/\n+/g, " ").trim();

        return `File: ${filePath}\n  Snippet: "${snippet}"\n`;
      } catch (err) {
        return `File: ${filePath}\n  Snippet: (unreadable: ${(err as Error).message})\n`;
      }
    })
  );

  return results.join("\n");
}
