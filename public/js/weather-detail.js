/**
 * @file weather-detail.js
 * @description Renders detailed current conditions and a 7-day forecast on
 * `weather.html`. Reads from the shared localStorage cache populated by
 * `weather.js`, or waits for the `weatherReady` event if the cache is stale
 * or missing.
 * @module weather-detail
 * @version 1.0
 * @author Jordan Kelley
 */

/** @constant {string[]} Full day names indexed by `Date.getDay()`. */
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Converts a wind direction in degrees to an 8-point cardinal direction string.
 *
 * @param {number} deg - Wind direction in degrees (0–360).
 * @returns {string} Cardinal direction abbreviation (e.g. `'N'`, `'NE'`, `'SW'`).
 *
 * @example
 * degreesToCardinal(180); // 'S'
 */
function degreesToCardinal(deg) {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return dirs[Math.round(deg / 45) % 8];
}

/**
 * Renders the full weather detail view including current conditions and the
 * 7-day forecast cards.
 *
 * Targeted element IDs for current conditions:
 * - `#detail-temp`, `#detail-feels-like`, `#detail-humidity`
 * - `#detail-cloud`, `#detail-precip`, `#detail-rain`, `#detail-showers`
 * - `#detail-wind-speed`, `#detail-wind-dir`, `#detail-wind-gusts`
 * - `#detail-updated`
 *
 * Targeted element ID for forecast: `#forecast-cards` (innerHTML replaced).
 *
 * @param {Object}   weatherData         - Full weather payload from `/api/weather`.
 * @param {Object}   weatherData.current - Current conditions.
 * @param {number}   weatherData.current.temperature_2m       - Temperature (°F).
 * @param {number}   weatherData.current.apparent_temperature - Feels-like (°F).
 * @param {number}   weatherData.current.relative_humidity_2m - Humidity (%).
 * @param {number}   weatherData.current.cloud_cover          - Cloud cover (%).
 * @param {number}   weatherData.current.precipitation        - Precipitation (in).
 * @param {number}   weatherData.current.rain                 - Rainfall (in).
 * @param {number}   weatherData.current.showers              - Shower precipitation (in).
 * @param {number}   weatherData.current.wind_speed_10m       - Wind speed (mph).
 * @param {number}   weatherData.current.wind_direction_10m   - Wind direction (degrees).
 * @param {number}   weatherData.current.wind_gusts_10m       - Wind gusts (mph).
 * @param {string}   weatherData.current.time                 - ISO timestamp of observation.
 * @param {Object[]} weatherData.daily                        - Array of daily forecast objects.
 * @param {string}   weatherData.daily[].date                 - Forecast date string.
 * @param {number}   weatherData.daily[].temp_max             - Daily high (°F).
 * @param {number}   weatherData.daily[].temp_min             - Daily low (°F).
 * @param {number}   weatherData.daily[].precipitation_sum    - Total precipitation (in).
 * @param {number}   weatherData.daily[].wind_speed_max       - Max wind speed (mph).
 * @returns {void}
 */
function renderDetailWeather(weatherData) {
    const c = weatherData.current;

    document.getElementById('detail-temp').textContent        = `${Math.round(c.temperature_2m)}°F`;
    document.getElementById('detail-feels-like').textContent  = `Feels like ${Math.round(c.apparent_temperature)}°F`;
    document.getElementById('detail-humidity').textContent    = `Humidity: ${Math.round(c.relative_humidity_2m)}%`;
    document.getElementById('detail-cloud').textContent       = `Cloud Cover: ${Math.round(c.cloud_cover)}%`;
    document.getElementById('detail-precip').textContent      = `Precipitation: ${c.precipitation.toFixed(2)} in`;
    document.getElementById('detail-rain').textContent        = `Rain: ${c.rain.toFixed(2)} in`;
    document.getElementById('detail-showers').textContent     = `Showers: ${c.showers.toFixed(2)} in`;
    document.getElementById('detail-wind-speed').textContent  = `Wind: ${Math.round(c.wind_speed_10m)} mph`;
    document.getElementById('detail-wind-dir').textContent    = `Wind Direction: ${degreesToCardinal(c.wind_direction_10m)}`;
    document.getElementById('detail-wind-gusts').textContent  = `Wind Gusts: ${Math.round(c.wind_gusts_10m)} mph`;
    document.getElementById('detail-updated').textContent     = `Last updated: ${new Date(c.time).toLocaleTimeString()}`;

    const forecastContainer = document.getElementById('forecast-cards');
    forecastContainer.innerHTML = weatherData.daily.map(day => {
        const date = new Date(day.date);
        return `
        <div class="forecast-card">
            <p class="forecast-day">${DAYS[date.getDay()]}</p>
            <p class="forecast-high">${Math.round(day.temp_max)}°F</p>
            <p class="forecast-low">${Math.round(day.temp_min)}°F</p>
            <p class="forecast-precip">${day.precipitation_sum.toFixed(2)} in</p>
            <p class="forecast-wind">${Math.round(day.wind_speed_max)} mph</p>
        </div>`;
    }).join('');
}

/**
 * Initializes the weather detail page using the following strategy:
 * 1. If fresh cached data exists in localStorage (within 30-minute TTL), render it immediately.
 * 2. Otherwise, wait for the `weatherReady` event fired by `weather.js`.
 *
 * @returns {void}
 */
function initDetailWeather() {
    const cached = localStorage.getItem('weatherData');
    const fetchedAt = localStorage.getItem('weatherFetchedAt');
    const isFresh = fetchedAt && (Date.now() - fetchedAt) < 30 * 60 * 1000;

    if (cached && isFresh) {
        renderDetailWeather(JSON.parse(cached));
    } else {
        window.addEventListener('weatherReady', (e) => {
            renderDetailWeather(e.detail);
        }, { once: true });
    }
}

initDetailWeather();
