/**
 * @file server.js
 * @description Express application entry point. Serves static files from `public/`
 * and mounts all API routes under `/api`.
 * @module server
 * @author Jordan Kelley
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

///// API ROUTES /////
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
