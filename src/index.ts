import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { handleSearch } from "./tools/search.js";
import { handleFiles } from "./tools/files.js";
import { handleFolders } from "./tools/folders.js";
import { handleTags } from "./tools/tags.js";
import { handleRecents } from "./tools/recents.js";
import { handleProperty } from "./tools/property.js";
import { handleGraph } from "./tools/graph.js";

export interface ObsidianServerOptions {
  vaultPath: string;
  cliPath: string;
}

export function createServer(vaultPath: string, cliPath: string): Server {
  const server = new Server(
    { name: "opencode-obsidian", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  const options: ObsidianServerOptions = { vaultPath, cliPath };

  // Register tools list
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "obsidian_search",
        description: "Search the vault for notes",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query text" },
            path: { type: "string", description: "Limit search to specific folder" },
            limit: { type: "number", description: "Maximum number of results" },
          },
          required: ["query"],
        },
      },
      {
        name: "obsidian_files",
        description: "List files in the vault",
        inputSchema: {
          type: "object",
          properties: {
            folder: { type: "string", description: "Filter by folder path" },
            ext: { type: "string", description: "Filter by file extension" },
            total: { type: "boolean", description: "Return only file count" },
          },
        },
      },
      {
        name: "obsidian_folders",
        description: "List folders in the vault",
        inputSchema: {
          type: "object",
          properties: {
            folder: { type: "string", description: "Filter by parent folder" },
            total: { type: "boolean", description: "Return only folder count" },
          },
        },
      },
      {
        name: "obsidian_tags",
        description: "List tags in the vault",
        inputSchema: {
          type: "object",
          properties: {
            file: { type: "string", description: "Filter by file name" },
            path: { type: "string", description: "Filter by file path" },
            total: { type: "boolean", description: "Return only tag count" },
            counts: { type: "boolean", description: "Include tag counts" },
            sort: { type: "string", enum: ["name", "count"], description: "Sort order" },
            format: { type: "string", enum: ["json", "tsv", "csv"], description: "Output format" },
            active: { type: "boolean", description: "Show tags for active file" },
          },
        },
      },
      {
        name: "obsidian_recents",
        description: "List recently opened files",
        inputSchema: {
          type: "object",
          properties: {
            total: { type: "boolean", description: "Return only file count" },
          },
        },
      },
      {
        name: "obsidian_property",
        description: "Manage frontmatter properties",
        inputSchema: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["read", "set", "remove"], description: "Action to perform" },
            name: { type: "string", description: "Property name" },
            file: { type: "string", description: "File name" },
            value: { type: "string", description: "Property value (for set action)" },
            type: { type: "string", enum: ["text", "list", "number", "date", "checkbox"], description: "Property type" },
          },
          required: ["action", "name", "file"],
        },
      },
      {
        name: "obsidian_graph",
        description: "Get graph information (backlinks, links, etc.)",
        inputSchema: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["backlinks", "links", "unresolved", "orphans", "deadends", "related"], description: "Graph type" },
            file: { type: "string", description: "File name (required for related type)" },
          },
          required: ["type"],
        },
      },
    ],
  }));

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name: toolName, arguments: args } = request.params;

    try {
      switch (toolName) {
        case "obsidian_search":
          return await handleSearch(options, args);
        case "obsidian_files":
          return await handleFiles(options, args);
        case "obsidian_folders":
          return await handleFolders(options, args);
        case "obsidian_tags":
          return await handleTags(options, args);
        case "obsidian_recents":
          return await handleRecents(options, args);
        case "obsidian_property":
          return await handleProperty(options, args);
        case "obsidian_graph":
          return await handleGraph(options, args);
        default:
          throw new Error(`Unknown tool: ${toolName}`);
      }
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` }],
        isError: true,
      };
    }
  });

  return server;
}
