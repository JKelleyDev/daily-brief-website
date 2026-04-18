/**
 * @file routes/news.js
 * @description Express router for news data. Placeholder implementation —
 * full news API integration is pending.
 * @module routes/news
 * @author Jordan Kelley
 */

const express = require('express');
const router = express.Router();

/**
 * News route placeholder. Returns a stub message until the news API is wired up.
 *
 * @name GET /api/news
 * @function
 * @returns {{ message: string }} JSON stub response.
 */
router.get('/', (req, res) => {
  res.json({ message: 'news route' });
});

/**
 * Health check for the news service. Always returns `ok` while the route is
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
