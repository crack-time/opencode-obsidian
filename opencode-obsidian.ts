/**
 * Obsidian Plugin for OpenCode
 *
 * Injects the Obsidian MCP server via config hook.
 * The MCP server provides vault integration via Obsidian CLI.
 *
 * Prerequisites:
 * - obsidian-cli installed and in PATH
 * - OBSIDIAN_VAULT_PATH environment variable set
 * - OBSIDIAN_CLI_PATH environment variable (optional, defaults to "obsidian")
 */

import type { Plugin } from "@opencode-ai/plugin"
import path from "path"
import { fileURLToPath } from "url"
import { existsSync } from "fs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const ObsidianPlugin: Plugin = async (ctx) => {
  return {
    config: async (config) => {
      // 1. Inject MCP server configuration
      const vaultPath = process.env.OBSIDIAN_VAULT_PATH
      const cliPath = process.env.OBSIDIAN_CLI_PATH || "obsidian"
      
      if (vaultPath) {
        const serverPath = path.join(__dirname, "dist", "server.js")
        
        if (existsSync(serverPath)) {
          config.mcp = config.mcp || {}
          config.mcp["obsidian"] = {
            type: "local",
            command: ["node", serverPath],
            environment: {
              OBSIDIAN_VAULT_PATH: vaultPath,
              OBSIDIAN_CLI_PATH: cliPath,
            },
            enabled: true,
          }
        } else {
          console.warn("[opencode-obsidian] MCP server not found, run npm run build")
        }
      }
      
      // 2. Inject skills path
      const skillsDir = path.join(__dirname, "skills")
      if (existsSync(skillsDir)) {
        config.skills = config.skills || {}
        config.skills.paths = config.skills.paths || []
        if (!config.skills.paths.includes(skillsDir)) {
          config.skills.paths.push(skillsDir)
        }
      }
    },
  }
}
