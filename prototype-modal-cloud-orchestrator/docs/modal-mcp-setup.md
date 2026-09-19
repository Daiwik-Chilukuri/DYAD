# Modal MCP Setup Guide

To control Modal cloud functions and sandboxes directly from coding assistants via the Model Context Protocol (MCP):

### 1. Antigravity Configuration
In `~/.gemini/antigravity/mcp_config.json` (or workspace MCP settings):
```json
{
  "mcpServers": {
    "modal": {
      "command": "uvx",
      "args": ["modal-mcp"]
    }
  }
}
```

### 2. Cursor / Windsurf / Claude Code Configuration
Add to your respective MCP configuration:
```json
{
  "modal": {
    "command": "npx",
    "args": ["-y", "@modal-labs/mcp-server"]
  }
}
```

### 3. Prerequisites
Ensure you have run:
```bash
modal setup
```
This stores your API token in `~/.modal.toml`.
