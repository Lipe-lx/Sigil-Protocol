"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const cors_1 = require("hono/cors");
const graphql_1 = require("graphql");
const schema_1 = require("@graphql-tools/schema");
const web3_js_1 = require("@solana/web3.js");
const schema_2 = require("./graphql/schema");
const resolvers_1 = require("./graphql/resolvers");
const registry_service_1 = require("./services/registry.service");
const payment_service_1 = require("./services/payment.service");
const app = new hono_1.Hono();
app.use('*', (0, cors_1.cors)());
// Initialize services on each request or globally
// In Workers, it's fine to initialize Connection once or per request
const getServices = (env) => {
    const connection = new web3_js_1.Connection(env.SOLANA_RPC_URL || 'https://api.devnet.solana.com', 'confirmed');
    return {
        registryService: new registry_service_1.RegistryService(connection),
        paymentService: new payment_service_1.PaymentService(connection, env.USDC_MINT, env.PROTOCOL_TREASURY),
    };
};
const schema = (0, schema_1.makeExecutableSchema)({ typeDefs: schema_2.typeDefs, resolvers: resolvers_1.resolvers });
app.get('/health', (c) => {
    return c.json({
        status: 'healthy',
        service: 'sigil-protocol-worker',
        version: '1.1.0',
        timestamp: new Date().toISOString(),
    });
});
app.post('/graphql', async (c) => {
    try {
        const { query, variables } = await c.req.json();
        const services = getServices(c.env);
        const result = await (0, graphql_1.graphql)({
            schema,
            source: query,
            variableValues: variables,
            contextValue: { ...services, env: c.env },
        });
        return c.json(result);
    }
    catch (error) {
        console.error('GraphQL Execution Error:', error);
        return c.json({
            errors: [{
                    message: error.message || 'Internal Server Error',
                    extensions: {
                        code: 'INTERNAL_SERVER_ERROR',
                        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
                    }
                }]
        }, 500);
    }
});
app.get('/', (c) => {
    return c.json({
        service: 'Sigil Protocol Worker API',
        description: 'Cloudflare Worker for Sigil Protocol',
        endpoints: ['/health', '/graphql', '/api/skills/:id/execute']
    });
});
app.post('/api/skills/:id/execute', async (c) => {
    const id = c.req.param('id');
    const services = getServices(c.env);
    // Basic implementation for now
    return c.json({
        message: `Worker ready to execute skill ${id}`,
        service: 'Sigil Protocol',
        status: 'success'
    });
});
exports.default = app;
