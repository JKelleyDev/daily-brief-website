/**
 * @file routes/weather.js
 * @description Express router for weather data. Fetches current conditions and a
 * 7-day forecast from the Open-Meteo API using the caller's coordinates.
 * @module routes/weather
 * @author Jordan Kelley
 */

const { fetchWeatherApi } = require("openmeteo");
const express = require('express');
const router = express.Router();

/** @constant {string} Base URL for the Open-Meteo forecast API. */
const url = "https://api.open-meteo.com/v1/forecast";

/**
 * @typedef {Object} CurrentWeather
 * @property {Date}   time                 - Observation timestamp (local time).
 * @property {number} temperature_2m       - Air temperature 2 m above ground (°F).
 * @property {number} rain                 - Rainfall in the last hour (in).
 * @property {number} relative_humidity_2m - Relative humidity at 2 m (%).
 * @property {number} apparent_temperature - Feels-like temperature (°F).
 * @property {number} cloud_cover          - Total cloud cover (%).
 * @property {number} showers              - Shower precipitation in the last hour (in).
 * @property {number} precipitation        - Total precipitation in the last hour (in).
 * @property {number} wind_speed_10m       - Wind speed at 10 m (mph).
 * @property {number} wind_direction_10m   - Wind direction at 10 m (degrees).
 * @property {number} wind_gusts_10m       - Wind gusts at 10 m (mph).
 */

/**
 * @typedef {Object} DailyWeather
 * @property {Date}   date              - Forecast date.
 * @property {number} temp_max          - Daily high temperature (°F).
 * @property {number} temp_min          - Daily low temperature (°F).
 * @property {number} precipitation_sum - Total precipitation for the day (in).
 * @property {number} wind_speed_max    - Maximum wind speed for the day (mph).
 * @property {number} wind_gusts_max    - Maximum wind gusts for the day (mph).
 */

/**
 * @typedef {Object} WeatherResponse
 * @property {CurrentWeather}   current - Current weather conditions.
 * @property {DailyWeather[]}   daily   - 7-day forecast array.
 */

/**
 * Fetches current weather conditions and a 7-day forecast for the given
 * latitude/longitude coordinates.
 *
 * @name GET /api/weather
 * @function
 * @param {string} req.query.lat - Latitude of the target location.
 * @param {string} req.query.lon - Longitude of the target location.
 * @returns {WeatherResponse} JSON weather payload on success.
 * @returns {Object} 500 JSON `{ error: string }` on failure.
 *
 * @example
 * // Request
 * GET /api/weather?lat=40.7128&lon=-74.0060
 *
 * // Response (truncated)
 * {
 *   "current": { "temperature_2m": 72.4, "wind_speed_10m": 8.1, ... },
 *   "daily": [{ "date": "2025-01-01T...", "temp_max": 75, "temp_min": 60, ... }, ...]
 * }
 */
router.get('/', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const params = {
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        current: ["temperature_2m", "rain", "relative_humidity_2m", "apparent_temperature", "cloud_cover", "showers", "precipitation", "wind_speed_10m", "wind_direction_10m", "wind_gusts_10m"],
        daily: ["temperature_2m_max", "temperature_2m_min", "precipitation_sum", "wind_speed_10m_max", "wind_gusts_10m_max"],
        timezone: "auto",
        wind_speed_unit: "mph",
        temperature_unit: "fahrenheit",
        precipitation_unit: "inch",
    };
    const responses = await fetchWeatherApi(url, params);
    const response = responses[0];
    const latitude = response.latitude();
    const longitude = response.longitude();
    const elevation = response.elevation();
    const timezone = response.timezone();
    const timezoneAbbreviation = response.timezoneAbbreviation();
    const utcOffsetSeconds = response.utcOffsetSeconds();
    console.log(`\nCoordinates: ${latitude}°N ${longitude}°E`, `\nElevation: ${elevation}m asl`, `\nTimezone: ${timezone} ${timezoneAbbreviation}`, `\nTimezone difference to GMT+0: ${utcOffsetSeconds}s`);
    const current = response.current();
    const daily = response.daily();
    const dailyTime = [...Array(7).keys()].map(i =>
        new Date((Number(daily.time()) + 86400 * i + utcOffsetSeconds) * 1000)
    );
    const weatherData = {
        current: {
            time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
            temperature_2m: current.variables(0).value(),
            rain: current.variables(1).value(),
            relative_humidity_2m: current.variables(2).value(),
            apparent_temperature: current.variables(3).value(),
            cloud_cover: current.variables(4).value(),
            showers: current.variables(5).value(),
            precipitation: current.variables(6).value(),
            wind_speed_10m: current.variables(7).value(),
            wind_direction_10m: current.variables(8).value(),
            wind_gusts_10m: current.variables(9).value(),
        },
        daily: dailyTime.map((date, i) => ({
            date,
            temp_max: daily.variables(0).valuesArray()[i],
            temp_min: daily.variables(1).valuesArray()[i],
            precipitation_sum: daily.variables(2).valuesArray()[i],
            wind_speed_max: daily.variables(3).valuesArray()[i],
            wind_gusts_max: daily.variables(4).valuesArray()[i],
        })),
    };
    console.log(`\nCurrent time: ${weatherData.current.time}\n`, `\nCurrent temperature_2m: ${weatherData.current.temperature_2m}`, `\nCurrent rain: ${weatherData.current.rain}`, `\nCurrent relative_humidity_2m: ${weatherData.current.relative_humidity_2m}`, `\nCurrent apparent_temperature: ${weatherData.current.apparent_temperature}`, `\nCurrent cloud_cover: ${weatherData.current.cloud_cover}`, `\nCurrent showers: ${weatherData.current.showers}`, `\nCurrent precipitation: ${weatherData.current.precipitation}`, `\nCurrent wind_speed_10m: ${weatherData.current.wind_speed_10m}`, `\nCurrent wind_direction_10m: ${weatherData.current.wind_direction_10m}`, `\nCurrent wind_gusts_10m: ${weatherData.current.wind_gusts_10m}`);
    res.json(weatherData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Performs a minimal probe of the Open-Meteo API to verify reachability.
 * The API has no dedicated health endpoint, so this fires the smallest valid
 * forecast request (single variable, null island) and checks for a response.
 *
 * @async
 * @function healthCheck
 * @returns {Promise<{status: 'ok'}|{status: 'error', message: string}>}
 *   Resolves to `{ status: 'ok' }` on success or `{ status: 'error', message }` on failure.
 */
async function healthCheck() {
  try {
    const responses = await fetchWeatherApi(url, {
        latitude: 0,
        longitude: 0,
        current: ["temperature_2m"],
    });
    responses[0].current();
    return { status: 'ok' };
  } catch (err) {
    return { status: 'error', message: err.message };
  }
}

module.exports = { router, healthCheck };
