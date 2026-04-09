const express = require('express');
const router = express.Router();

// GET /api/weather
router.get('/', (req, res) => {
  res.json({ message: 'weather route' });
});

async function healthCheck() {
  return { status: 'ok' };
}

module.exports = {router, healthCheck};
