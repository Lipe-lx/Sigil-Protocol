import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import cors from 'cors';
import dotenv from 'dotenv';

import executeRouter from './routes/execute';
import consensusRouter from './routes/consensus';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased for skill content

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
app.use('/api/skills', executeRouter);       // Skill execution + x402 payment
app.use('/api/consensus', consensusRouter);  // Consensus engine

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
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req }),
    introspection: true, // Enable introspection for development
  });

  await server.start();
  server.applyMiddleware({ app } as any);

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
