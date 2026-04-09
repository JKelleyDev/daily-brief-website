const express = require('express');
const router = express.Router();

// GET /api/news
router.get('/', (req, res) => {
  res.json({ message: 'news route' });
});

async function healthCheck() {
  return { status: 'ok' };
}

module.exports = {router, healthCheck};
