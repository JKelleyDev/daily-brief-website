/**
 * @file geolocation.js
 * @description Requests the user's current position and stores the coordinates
 * in localStorage. Fires a `coordsReady` CustomEvent so other modules
 * (e.g. `weather.js`) can react without needing to request location themselves.
 * @module geolocation
 * @version 1.0
 * @author Jordan Kelley
 */
const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 600000
}
/**
 * Handles successful geolocation retrieval.
 * @param {GeolocationPosition} pos - The geolocation position object.
 */
function success(pos) {
    const crd = pos.coords;
    localStorage.setItem('userLat', crd.latitude);
    localStorage.setItem('userLon', crd.longitude);
    console.log(`Coords stored — Lat: ${crd.latitude}, Lon: ${crd.longitude}`);
    window.dispatchEvent(new CustomEvent('coordsReady', {
        detail: { lat: crd.latitude, lon: crd.longitude }
    }));
}

/**
 * Handles geolocation errors by logging a warning to the console.
 * @param {GeolocationPositionError} err - The geolocation error object.
 */
function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
}

if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(success, error, options);
} else {
    console.log("Geolocation is not supported by this browser.");
}
