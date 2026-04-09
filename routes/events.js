const express = require('express');
const router = express.Router();

// GET /api/events
router.get('/', (req, res) => {
  res.json({ message: 'events route' });
});

async function healthCheck() {
  return { status: 'ok' };
}

module.exports = {router, healthCheck};
