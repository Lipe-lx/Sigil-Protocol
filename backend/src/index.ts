import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('*', cors());

app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    service: 'sigil-protocol-worker',
    version: '1.0.0-hono',
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (c) => {
  return c.json({
    service: 'Sigil Protocol Worker API',
    description: 'Cloudflare Worker for Sigil Protocol',
    endpoints: ['/health', '/api/skills/:id/execute']
  });
});

// Proxy logic or direct implementation of execute route
app.post('/api/skills/:id/execute', async (c) => {
  const id = c.req.param('id');
  return c.json({
    message: `Worker ready to execute skill ${id}`,
    note: "Migration to Worker in progress"
  });
});

export default app;
