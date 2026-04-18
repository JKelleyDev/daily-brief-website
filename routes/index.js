/**
 * @file routes/index.js
 * @description Root API router. Mounts all service sub-routers and exposes a
 * combined `/api/health` endpoint that aggregates the health status of every
 * downstream service.
 * @module routes/index
 * @author Jordan Kelley
 */

const express = require('express');
const router = express.Router();

const weather = require('./weather');
const news = require('./news');
const events = require('./events');

router.use('/weather', weather.router);
router.use('/news', news.router);
router.use('/events', events.router);

/**
 * @typedef {Object} ServiceHealth
 * @property {'ok'|'error'} status - Whether this service is reachable.
 * @property {string} [message] - Error message when status is `'error'`.
 */

/**
 * @typedef {Object} HealthResponse
 * @property {'ok'|'degraded'} status - Overall health. `'degraded'` if any service reports an error.
 * @property {Object} services - Per-service health results.
 * @property {ServiceHealth} services.weather - Weather API health.
 * @property {ServiceHealth} services.news - News API health.
 * @property {ServiceHealth} services.events - Events API health.
 */

/**
 * Aggregated health check across all registered API services.
 *
 * @name GET /api/health
 * @function
 * @returns {HealthResponse} JSON body with overall status and per-service detail.
 *
 * @example
 * // 200 OK — all services healthy
 * { "status": "ok", "services": { "weather": { "status": "ok" }, ... } }
 *
 * @example
 * // 200 OK — one or more services unreachable
 * { "status": "degraded", "services": { "weather": { "status": "error", "message": "..." }, ... } }
 */
router.get('/health', async (_req, res) => {
    const [weatherResult, newsResult, eventsResult] = await Promise.all([
        weather.healthCheck(),
        news.healthCheck(),
        events.healthCheck()
    ]);

    const services = { weather: weatherResult, news: newsResult, events: eventsResult };
    const overall = Object.values(services).every(s => s.status === 'ok') ? 'ok' : 'degraded';

    res.json({ status: overall, services });
});

module.exports = router;
