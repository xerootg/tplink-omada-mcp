import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { customHeadersSchema, siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

const inputSchema = siteInputSchema.extend({
    mac: z.string().min(1, 'mac (client MAC address) is required'),
    ip: z.string().min(1, 'ip (fixed IP to assign) is required'),
    description: z.string().optional(),
    netId: z.string().optional(),
    confirmConflict: z.boolean().optional(),
    customHeaders: customHeadersSchema,
});

export function registerCreateDhcpReservationTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'createDhcpReservation',
        {
            description:
                'Create a DHCP reservation (fixed IP) mapping a client MAC address to an IP on the site gateway. ' +
                'MAC accepts colon or dash form. netId is resolved automatically from the LAN network containing the IP when omitted. ' +
                'confirmConflict defaults to true so a reservation inside the DHCP pool still succeeds.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('createDhcpReservation', async ({ mac, ip, description, netId, confirmConflict, siteId, customHeaders }) =>
            toToolResult(await client.createDhcpReservation(mac, ip, description, netId, confirmConflict, siteId, customHeaders))
        )
    );
}
