/**
 * @file routes/events.js
 * @description Express router for events data. Placeholder implementation —
 * full events API integration is pending.
 * @module routes/events
 * @author Jordan Kelley
 */

const express = require('express');
const router = express.Router();

/**
 * Events route placeholder. Returns a stub message until the events API is wired up.
 *
 * @name GET /api/events
 * @function
 * @returns {{ message: string }} JSON stub response.
 */
router.get('/', (req, res) => {
  res.json({ message: 'events route' });
});

/**
 * Health check for the events service. Always returns `ok` while the route is
 * a local stub with no external dependency.
 *
 * @async
 * @function healthCheck
 * @returns {Promise<{status: 'ok'}>} Resolves immediately with `{ status: 'ok' }`.
 */
async function healthCheck() {
  return { status: 'ok' };
}

module.exports = { router, healthCheck };
