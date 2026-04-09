const express = require('express');
const router = express.Router();

const weather = require('./weather');
const news = require('./news');
const events = require('./events'); 

router.use('/weather', weather.router);
router.use('/news', news.router);
router.use('/events', events.router);


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