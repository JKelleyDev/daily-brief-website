/**
 * @file weather.js
 * @description Fetches weather data from the server and renders it on the page.
 * Implements localStorage caching (30-minute TTL) to reduce API calls and
 * improve performance. Listens for the `coordsReady` geolocation event when
 * coordinates are not yet available.
 * @module weather
 * @version 1.0
 * @author Jordan Kelley
 */

/** @constant {number} Cache time-to-live for weather data in milliseconds (30 min). */
const WEATHER_TTL = 30 * 60 * 1000;

/**
 * Fetches weather data from `/api/weather` for the given coordinates, caches
 * the result in localStorage, then renders it on the page.
 *
 * @param {number} lat - Latitude of the user's location.
 * @param {number} lon - Longitude of the user's location.
 * @returns {void}
 */
function fetchWeatherData(lat, lon) {
    fetch(`/api/weather?lat=${lat}&lon=${lon}`)
        .then(res => res.json())
        .then(data => {
            localStorage.setItem('weatherData', JSON.stringify(data));
            localStorage.setItem('weatherFetchedAt', Date.now());
            console.log('Weather data fetched and cached:', data);
            renderWeatherData(data);
        })
        .catch(err => console.error('Error fetching weather data:', err));
}

/**
 * Converts a wind direction in degrees to an 8-point cardinal direction string.
 *
 * @param {number} deg - Wind direction in degrees (0–360).
 * @returns {string} Cardinal direction abbreviation (e.g. `'N'`, `'NE'`, `'SW'`).
 *
 * @example
 * degreesToCardinal(0);   // 'N'
 * degreesToCardinal(90);  // 'E'
 * degreesToCardinal(225); // 'SW'
 */
function degreesToCardinal(deg) {
    const dirs = ['N','NE','E','SE','S','SW','W','NW'];
    return dirs[Math.round(deg / 45) % 8];
}

/**
 * Renders the current weather conditions into the DOM and fires the
 * `weatherReady` CustomEvent so dependent modules (e.g. `weather-detail.js`)
 * can react.
 *
 * Targeted element IDs:
 * - `#weather-temp`
 * - `#weather-feels-like`
 * - `#weather-humidity`
 * - `#weather-wind`
 * - `#weather-precip`
 * - `#weather-cloud`
 *
 * @param {Object} weatherData - Weather payload as returned by `/api/weather`.
 * @param {Object} weatherData.current - Current conditions object.
 * @param {number} weatherData.current.temperature_2m - Temperature (°F).
 * @param {number} weatherData.current.apparent_temperature - Feels-like temperature (°F).
 * @param {number} weatherData.current.relative_humidity_2m - Humidity (%).
 * @param {number} weatherData.current.wind_speed_10m - Wind speed (mph).
 * @param {number} weatherData.current.wind_direction_10m - Wind direction (degrees).
 * @param {number} weatherData.current.precipitation - Precipitation (in).
 * @param {number} weatherData.current.cloud_cover - Cloud cover (%).
 * @returns {void}
 */
function renderWeatherData(weatherData) {
    const c = weatherData.current;
    const tempEl       = document.getElementById('weather-temp');
    const feelsEl      = document.getElementById('weather-feels-like');
    const humidityEl   = document.getElementById('weather-humidity');
    const windEl       = document.getElementById('weather-wind');
    const precipEl     = document.getElementById('weather-precip');
    const cloudEl      = document.getElementById('weather-cloud');

    if (tempEl)     tempEl.textContent      = `${Math.round(c.temperature_2m)}°F`;
    if (feelsEl)    feelsEl.textContent     = `Feels like ${Math.round(c.apparent_temperature)}°F`;
    if (humidityEl) humidityEl.textContent  = `Humidity: ${Math.round(c.relative_humidity_2m)}%`;
    if (windEl)     windEl.textContent      = `Wind: ${Math.round(c.wind_speed_10m)} mph ${degreesToCardinal(c.wind_direction_10m)}`;
    if (precipEl)   precipEl.textContent    = `Precipitation: ${c.precipitation.toFixed(2)} in`;
    if (cloudEl)    cloudEl.textContent     = `Cloud Cover: ${Math.round(c.cloud_cover)}%`;

    window.dispatchEvent(new CustomEvent('weatherReady', { detail: weatherData }));
}

/**
 * Initializes weather data fetching and rendering using the following strategy:
 * 1. If fresh cached data exists in localStorage (within {@link WEATHER_TTL}), render it immediately.
 * 2. If coordinates are already stored in localStorage, fetch fresh data.
 * 3. Otherwise, wait for the `coordsReady` event fired by `geolocation.js`.
 *
 * @returns {void}
 */
function initWeather() {
    const lat = localStorage.getItem('userLat');
    const lon = localStorage.getItem('userLon');
    const cached = localStorage.getItem('weatherData');
    const fetchedAt = localStorage.getItem('weatherFetchedAt');
    const isFresh = fetchedAt && (Date.now() - fetchedAt) < WEATHER_TTL;

    if (cached && isFresh) {
        console.log('Using cached weather data');
        renderWeatherData(JSON.parse(cached));
    } else if (lat && lon) {
        fetchWeatherData(lat, lon);
    } else {
        window.addEventListener('coordsReady', (e) => {
            fetchWeatherData(e.detail.lat, e.detail.lon);
        }, { once: true });
    }
}

initWeather();
