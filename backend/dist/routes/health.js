"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const registry_service_1 = require("../services/registry.service");
const web3_js_1 = require("@solana/web3.js");
const router = express_1.default.Router();
/**
 * GET /health
 *
 * Health check endpoint for monitoring and load balancers
 */
router.get('/', async (req, res) => {
    const startTime = Date.now();
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        uptime: process.uptime(),
        checks: {},
    };
    // Check Solana RPC connection
    try {
        const connection = new web3_js_1.Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com', 'confirmed');
        const slot = await connection.getSlot();
        health.checks.solana = {
            status: 'healthy',
            network: 'devnet',
            slot: slot,
            latencyMs: Date.now() - startTime,
        };
    }
    catch (error) {
        health.checks.solana = {
            status: 'unhealthy',
            error: error.message,
        };
        health.status = 'degraded';
    }
    // Check Registry (read skills)
    try {
        const registryStart = Date.now();
        const stats = await registry_service_1.RegistryService.getRegistryStats();
        health.checks.registry = {
            status: stats ? 'healthy' : 'empty',
            skillCount: stats?.skillCount || 0,
            totalExecutions: stats?.totalExecutions || 0,
            latencyMs: Date.now() - registryStart,
        };
    }
    catch (error) {
        health.checks.registry = {
            status: 'unhealthy',
            error: error.message,
        };
        health.status = 'degraded';
    }
    // Memory usage
    const memUsage = process.memoryUsage();
    health.checks.memory = {
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
    };
    health.totalLatencyMs = Date.now() - startTime;
    const statusCode = health.status === 'healthy' ? 200 : 503;
    return res.status(statusCode).json(health);
});
/**
 * GET /health/live
 *
 * Kubernetes liveness probe - is the server running?
 */
router.get('/live', (req, res) => {
    res.status(200).json({ status: 'live' });
});
/**
 * GET /health/ready
 *
 * Kubernetes readiness probe - is the server ready to accept traffic?
 */
router.get('/ready', async (req, res) => {
    try {
        const connection = new web3_js_1.Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com', 'confirmed');
        await connection.getSlot();
        res.status(200).json({ status: 'ready' });
    }
    catch {
        res.status(503).json({ status: 'not ready' });
    }
});
exports.default = router;
