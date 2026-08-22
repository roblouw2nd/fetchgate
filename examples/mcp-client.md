# Using Fetchgate as an MCP server

Fetchgate exposes a [Model Context Protocol](https://modelcontextprotocol.io)
server over Streamable HTTP at **`https://fetchgate.dev/mcp`**. It's listed in
the official MCP registry as `dev.fetchgate/fetchgate`, so MCP-aware clients can
also discover it there.

## Tools

| Tool | Description |
| --- | --- |
| `read_url(url)` | Fetch a URL → clean Markdown of the main content |
| `get_metadata(url)` | Fetch a URL → structured metadata (title, description, OpenGraph, …) |
| `list_products()` | Browse the digital-goods catalog |
| `get_purchase_info(product_id)` | Explain how to buy a product via x402 |

Free tier: 30 tool calls/day per caller; beyond that, `read_url`/`get_metadata`
are priced via x402 ($0.002 / $0.001).

## Connect

Point any Streamable-HTTP MCP client at `https://fetchgate.dev/mcp`. Example
config for clients that accept a remote MCP server URL:

```json
{
  "mcpServers": {
    "fetchgate": {
      "type": "streamable-http",
      "url": "https://fetchgate.dev/mcp"
    }
  }
}
```

## Raw JSON-RPC (no client library)

```bash
# list tools
curl -s https://fetchgate.dev/mcp \
  -H 'content-type: application/json' \
  -H 'MCP-Protocol-Version: 2025-06-18' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | jq '.result.tools[].name'

# call read_url
curl -s https://fetchgate.dev/mcp \
  -H 'content-type: application/json' \
  -H 'MCP-Protocol-Version: 2025-06-18' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call",
       "params":{"name":"read_url","arguments":{"url":"https://example.com"}}}' | jq -r '.result.content[0].text'
```
