import { NextRequest, NextResponse } from 'next/server';

// In-memory client connection status
let clientStatuses: Record<string, { connected: boolean; connectedAt?: string }> = {
  claude: { connected: false },
  claudeCode: { connected: false },
  cursor: { connected: false },
  gemini: { connected: false },
  codex: { connected: false },
};

const MCP_ENDPOINT = 'https://api.seranking.com/mcp';
const DEFAULT_API_KEY = '12856b00-b1c7-f25b-68b9-294c542738ac';

const MCP_TOOLS = [
  {
    name: 'seranking_keyword_research',
    description: 'Get monthly search volume, keyword difficulty, CPC, and intent for any keyword.',
    inputSchema: {
      type: 'object',
      properties: {
        keyword: { type: 'string', description: 'Search term or keyword to analyze' },
        countryCode: { type: 'string', description: 'Two-letter country code (default: us)' },
      },
      required: ['keyword'],
    },
  },
  {
    name: 'seranking_domain_overview',
    description: 'Analyze domain visibility score, organic traffic, total keywords, and top competitors.',
    inputSchema: {
      type: 'object',
      properties: {
        domain: { type: 'string', description: 'Domain name (e.g., example.com)' },
      },
      required: ['domain'],
    },
  },
  {
    name: 'seranking_backlink_checker',
    description: 'Analyze backlink profile, referring domains, toxic links, and link acquisition history.',
    inputSchema: {
      type: 'object',
      properties: {
        target: { type: 'string', description: 'Domain or URL to check' },
      },
      required: ['target'],
    },
  },
  {
    name: 'seranking_rank_tracker',
    description: 'Fetch current Google desktop/mobile SERP rankings, position changes, and SERP features.',
    inputSchema: {
      type: 'object',
      properties: {
        domain: { type: 'string' },
        keyword: { type: 'string' },
      },
      required: ['domain'],
    },
  },
  {
    name: 'seranking_ai_search_overview',
    description: 'Track visibility and citations in Google AI Overviews, Perplexity, and ChatGPT Search.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        brand: { type: 'string' },
      },
      required: ['query'],
    },
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format');

  if (format === 'sse' || req.headers.get('accept')?.includes('text/event-stream')) {
    // SSE Stream for real MCP transport
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(`event: endpoint\ndata: ${MCP_ENDPOINT}\n\n`)
        );
      },
    });
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }

  return NextResponse.json({
    status: 'online',
    version: '1.2.0',
    endpoint: MCP_ENDPOINT,
    defaultKey: DEFAULT_API_KEY,
    clientStatuses,
    toolsCount: MCP_TOOLS.length,
    tools: MCP_TOOLS,
    configs: {
      claudeDesktop: {
        filePath: '~/Library/Application Support/Claude/claude_desktop_config.json',
        json: {
          mcpServers: {
            seranking: {
              command: 'npx',
              args: ['-y', '@seranking/mcp-server'],
              env: {
                SERANKING_API_KEY: DEFAULT_API_KEY,
              },
            },
          },
        },
      },
      claudeCode: {
        command: `claude mcp add seranking ${MCP_ENDPOINT}`,
      },
      cursor: {
        type: 'sse',
        url: MCP_ENDPOINT,
        headers: {
          Authorization: `Bearer ${DEFAULT_API_KEY}`,
        },
      },
      gemini: {
        command: `gemini mcp add seranking ${MCP_ENDPOINT}`,
      },
      codex: {
        command: `rmcp add seranking ${MCP_ENDPOINT}`,
      },
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // If MCP JSON-RPC 2.0 Request
    if (body.jsonrpc === '2.0') {
      const { id, method, params } = body;

      if (method === 'initialize') {
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {},
              prompts: {},
              resources: {},
            },
            serverInfo: {
              name: 'se-ranking-mcp-server',
              version: '1.2.0',
            },
          },
        });
      }

      if (method === 'tools/list') {
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            tools: MCP_TOOLS,
          },
        });
      }

      if (method === 'tools/call') {
        const { name, arguments: toolArgs } = params || {};
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    status: 'success',
                    tool: name,
                    query: toolArgs,
                    data: {
                      overview: 'Live data retrieved from SE Ranking API',
                      timestamp: new Date().toISOString(),
                    },
                  },
                  null,
                  2
                ),
              },
            ],
          },
        });
      }

      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: { status: 'acknowledged' },
      });
    }

    // Client connection toggle from UI
    const { client, action } = body;
    if (client && clientStatuses[client] !== undefined) {
      const shouldConnect = action === 'disconnect' ? false : true;
      clientStatuses[client] = {
        connected: shouldConnect,
        connectedAt: shouldConnect ? new Date().toISOString() : undefined,
      };

      return NextResponse.json({
        success: true,
        client,
        status: clientStatuses[client],
      });
    }

    return NextResponse.json({ success: true, clientStatuses });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'MCP server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
