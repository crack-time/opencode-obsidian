#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./src/index.js";

// Get configuration from environment variables
const OBSIDIAN_VAULT_PATH = process.env.OBSIDIAN_VAULT_PATH || "";
const OBSIDIAN_CLI_PATH = process.env.OBSIDIAN_CLI_PATH || "obsidian";

if (!OBSIDIAN_VAULT_PATH) {
  console.error("Error: OBSIDIAN_VAULT_PATH environment variable is required");
  process.exit(1);
}

const server = createServer(OBSIDIAN_VAULT_PATH, OBSIDIAN_CLI_PATH);
const transport = new StdioServerTransport();
await server.connect(transport);
