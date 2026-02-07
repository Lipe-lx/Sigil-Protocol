"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const schema_1 = require("./graphql/schema");
const resolvers_1 = require("./graphql/resolvers");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const execute_1 = __importDefault(require("./routes/execute"));
const consensus_1 = __importDefault(require("./routes/consensus"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' })); // Increased for skill content
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'sigil-protocol-api',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});
// API Routes
app.use('/api/skills', execute_1.default); // Skill execution + x402 payment
app.use('/api/consensus', consensus_1.default); // Consensus engine
// Root info
app.get('/', (req, res) => {
    res.json({
        service: 'Sigil Protocol API',
        version: '1.0.0',
        description: 'Decentralized peer review system for AI agent skills',
        endpoints: {
            graphql: '/graphql',
            health: '/health',
            skills: {
                execute: 'POST /api/skills/:id/execute',
                price: 'GET /api/skills/:id/price',
            },
            consensus: {
                prereview: 'POST /api/consensus/prereview',
                evaluate: 'POST /api/consensus/evaluate',
                calculate: 'POST /api/consensus/calculate',
                quick: 'POST /api/consensus/quick',
                demo: 'POST /api/consensus/demo',
                config: 'GET /api/consensus/config',
                tiers: 'GET /api/consensus/tiers',
            },
        },
        documentation: 'https://github.com/Lipe-lx/Sigil-Protocol',
    });
});
const startServer = async () => {
    const server = new apollo_server_express_1.ApolloServer({
        typeDefs: schema_1.typeDefs,
        resolvers: resolvers_1.resolvers,
        context: ({ req }) => ({ req }),
        introspection: true, // Enable introspection for development
    });
    await server.start();
    server.applyMiddleware({ app });
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log('');
        console.log('╔═══════════════════════════════════════════════════════════╗');
        console.log('║           SIGIL PROTOCOL - API SERVER                     ║');
        console.log('╠═══════════════════════════════════════════════════════════╣');
        console.log(`║  🚀 Server ready at http://localhost:${PORT}                  ║`);
        console.log(`║  📊 GraphQL at http://localhost:${PORT}${server.graphqlPath}              ║`);
        console.log('║  🔐 Consensus Engine: ACTIVE                              ║');
        console.log('║  💳 x402 Payment Flow: ENABLED                            ║');
        console.log('╚═══════════════════════════════════════════════════════════╝');
        console.log('');
    });
};
startServer().catch(console.error);
