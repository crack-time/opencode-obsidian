import { execObsidianCommand, type ObsidianCLIOptions } from "../utils/obsidian.js";

export async function handleFolders(
  options: ObsidianCLIOptions,
  args: { folder?: string; total?: boolean }
): Promise<{ content: { type: string; text: string }[] }> {
  const { folder, total } = args;

  const raw = await execObsidianCommand(options, "folders", {
    folder,
    total: total ? "total" : undefined,
  });

  // Convert to tree format
  const tree = formatTree(raw);

  return {
    content: [{ type: "text", text: tree }],
  };
}

function formatTree(raw: string): string {
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .sort();

  if (lines.length === 0) return "";

  interface TreeNode {
    name: string;
    children: Map<string, TreeNode>;
  }

  const root: TreeNode = { name: "", children: new Map() };

  for (const line of lines) {
    const parts = line.split("/").filter((p) => p.length > 0);
    let current = root;
    for (const part of parts) {
      if (!current.children.has(part)) {
        current.children.set(part, { name: part, children: new Map() });
      }
      current = current.children.get(part)!;
    }
  }

  function render(node: TreeNode, prefix: string, isLast: boolean): string {
    const entries = Array.from(node.children.entries());
    if (entries.length === 0) return "";

    let result = "";
    for (let i = 0; i < entries.length; i++) {
      const [name, child] = entries[i];
      const isLastChild = i === entries.length - 1;
      const connector = isLastChild ? "└── " : "├── ";
      const childPrefix = isLast ? "    " : "│   ";

      result += prefix + connector + name + "/\n";

      if (child.children.size > 0) {
        result += render(child, prefix + childPrefix, isLastChild);
      }
    }
    return result;
  }

  const hasRoot = lines.some((l) => l === "/");
  const treeBody = render(root, "", true);

  if (hasRoot) {
    return "/\n" + treeBody;
  }

  const topEntries = Array.from(root.children.entries());
  let result = "";
  for (let i = 0; i < topEntries.length; i++) {
    const [name, child] = topEntries[i];
    const isLast = i === topEntries.length - 1;
    result += (isLast ? "└── " : "├── ") + name + "/\n";
    result += render(child, isLast ? "    " : "│   ", true);
  }
  return result;
}
