import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { graphql } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { Connection } from '@solana/web3.js';

import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { RegistryService } from './services/registry.service';
import { PaymentService } from './services/payment.service';

const app = new Hono();

app.use('*', cors());

// Initialize services on each request or globally
// In Workers, it's fine to initialize Connection once or per request
const getServices = (env: any) => {
  const connection = new Connection(env.SOLANA_RPC_URL || 'https://api.devnet.solana.com', 'confirmed');
  return {
    registryService: new RegistryService(connection),
    paymentService: new PaymentService(connection, env.USDC_MINT, env.PROTOCOL_TREASURY),
  };
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    service: 'sigil-protocol-worker',
    version: '1.1.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/skill.md', (c) => {
  return c.text(`# Sigil Protocol Agent Skill

This skill allows agents to interact with the Sigil Protocol to discover, verify, and execute skills.

## Metadata
- **Name:** sigil-protocol
- **Version:** 1.1.0
- **Description:** Trustless skill registry and execution layer
- **Category:** infra
- **Homepage:** https://sigil-protocol.pages.dev

## Endpoints

### 1. Execute Skill
Run a registered skill by ID. Requires x402 payment in USDC.

- **URL:** \`https://sigil-protocol-worker.lulipe-lx.workers.dev/api/skills/:id/execute\`
- **Method:** POST
- **Payment:** 402 Payment Required (USDC)

### 2. Discover Skills (GraphQL)
Query the registry for available skills.

- **URL:** \`https://sigil-protocol-worker.lulipe-lx.workers.dev/graphql\`
- **Method:** POST
- **Body:**
\`\`\`graphql
query {
  skills {
    id
    trustScore
    priceUsdc
  }
}
\`\`\`
`);
});

app.post('/graphql', async (c) => {
  try {
    const { query, variables } = await c.req.json();
    const services = getServices(c.env);
    
    const result = await graphql({
      schema,
      source: query,
      variableValues: variables,
      contextValue: { ...services, env: c.env },
    });
    
    return c.json(result);
  } catch (error: any) {
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
    endpoints: ['/health', '/graphql', '/api/skills/:id/execute', '/skill.md']
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

export default app;
