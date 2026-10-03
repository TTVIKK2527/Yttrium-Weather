'use strict';
const form = document.getElementById('search-form');
const cityInput = document.getElementById('city');
const searchButton = document.getElementById('search');
const status = document.getElementById('status');
const locations = document.getElementById('locations');
const weather = document.getElementById('weather');
const locateButton = document.getElementById('locate');
let locationAttempt = 0;
let activeRequest;

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function condition(code) {
  if (code === 0) return '☀️ Clear sky';
  if ([1, 2].includes(code)) return '🌤️ Partly clear';
  if (code === 3) return '☁️ Overcast';
  if ([45, 48].includes(code)) return '🌫️ Fog';
  if ([51, 53, 55, 56, 57].includes(code)) return '🌦️ Drizzle';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return '🌧️ Rain';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return '❄️ Snow';
  if ([95, 96, 99].includes(code)) return '⛈️ Thunderstorm';
  return 'Conditions unavailable';
}
async function json(url, signal) {
  const response = await fetch(url, { signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]) });
  if (!response.ok) throw new Error('Weather service is unavailable. Please try again.');
  const data = await response.json();
  if (data.error) throw new Error('Weather service could not complete the request.');
  return data;
}
function begin(message) {
  activeRequest?.abort();
  activeRequest = new AbortController();
  status.textContent = message;
  weather.replaceChildren();
  locations.replaceChildren();
  searchButton.disabled = true;
  return activeRequest;
}
function fail(error, request) {
  if (request !== activeRequest || error.name === 'AbortError') return;
  status.textContent = error.name === 'TimeoutError' ? 'Weather service timed out. Please try again.' : error instanceof TypeError ? 'Could not connect. Check your connection and try again.' : error.message;
}
function label(location) {
  return [location.name, location.admin1, location.country].filter(Boolean).join(', ');
}
function formatValue(value, unit) {
  return typeof value === 'number' && Number.isFinite(value) ? `${Math.round(value)}${unit}` : 'Unavailable';
}
async function forecast(location) {
  const request = begin('Loading forecast…');
  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.search = new URLSearchParams({ latitude: location.latitude, longitude: location.longitude,
      daily: 'temperature_2m_max,temperature_2m_min,weather_code,wind_speed_10m_max', timezone: 'auto', forecast_days: '7' });
    const data = await json(url, request.signal);
    if (request !== activeRequest) return;
    const daily = data.daily;
    if (!daily?.time?.length) throw new Error('No forecast is available for this location.');
    const grid = element('div', undefined, 'forecast');
    daily.time.forEach((date, i) => {
      const card = element('article', undefined, 'day');
      const heading = new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
      card.append(element('h3', heading), element('p', condition(daily.weather_code?.[i])),
        element('p', `High: ${formatValue(daily.temperature_2m_max?.[i], ' °C')}`),
        element('p', `Low: ${formatValue(daily.temperature_2m_min?.[i], ' °C')}`),
        element('p', `Wind: ${formatValue(daily.wind_speed_10m_max?.[i], ' km/h')}`));
      grid.append(card);
    });
    const title = element('h2', label(location));
    const coordinates = `${Math.abs(location.latitude).toFixed(3)}° ${location.latitude < 0 ? 'S' : 'N'}, ${Math.abs(location.longitude).toFixed(3)}° ${location.longitude < 0 ? 'W' : 'E'}`;
    weather.append(title, element('p', `Coordinates: ${coordinates} · Forecast time zone: ${data.timezone || 'Not provided'}`));
    if (location.detected) {
      const accuracy = Number.isFinite(location.accuracy) ? `${Math.round(location.accuracy)} metres` : 'not reported';
      weather.append(element('p', `Device location accuracy: ${accuracy}. ${location.accuracy > 5000 ? 'This is a broad area estimate; search for your city for a better forecast.' : 'City name is the nearest locality to the detected coordinates.'}`));
      resolveCity(location, title, request);
    }
    weather.append(grid);
    status.textContent = 'Forecast loaded. Dates follow the selected location’s time zone.';
  } catch (error) { fail(error, request); }
  finally { if (request === activeRequest) searchButton.disabled = false; }
}
form.addEventListener('submit', async event => {
  event.preventDefault();
  const city = cityInput.value.trim();
  if (city.length < 2) { status.textContent = 'Enter at least two characters for the city name.'; return; }
  locationAttempt++;
  locateButton.disabled = false;
  const request = begin('Searching for cities…');
  try {
    const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
    url.search = new URLSearchParams({ name: city, count: '5', language: 'en', format: 'json' });
    const data = await json(url, request.signal);
    if (request !== activeRequest) return;
    if (!data.results?.length) throw new Error('City not found. Check the spelling and try again.');
    if (data.results.length === 1) { await forecast(data.results[0]); return; }
    status.textContent = 'Choose your city:';
    data.results.forEach(location => {
      const button = element('button', label(location), 'location-option');
      button.type = 'button';
      button.addEventListener('click', () => forecast(location));
      locations.append(button);
    });
  } catch (error) { fail(error, request); }
  finally { if (request === activeRequest) searchButton.disabled = false; }
});

function detectLocation() {
  const attempt = ++locationAttempt;
  activeRequest?.abort();
  activeRequest = undefined;
  searchButton.disabled = false;
  locations.replaceChildren();
  weather.replaceChildren();
  if (!navigator.geolocation) {
    status.textContent = 'Location is unavailable in this browser. Search for a city instead.';
    cityInput.focus();
    return;
  }
  locateButton.disabled = true;
  status.textContent = 'Finding your location… You can still search for a city.';
  let completed = false;
  const fallback = message => {
    if (completed || attempt !== locationAttempt) return;
    completed = true;
    clearTimeout(watchdog);
    locateButton.disabled = false;
    status.textContent = message + ' Search for a city instead.';
    cityInput.focus();
  };
  const watchdog = setTimeout(() => fallback('Location request timed out.'), 21000);
  try {
    navigator.geolocation.getCurrentPosition(position => {
      if (completed || attempt !== locationAttempt) return;
      const { latitude, longitude, accuracy } = position.coords;
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
        fallback('Location returned invalid coordinates.'); return;
      }
      completed = true;
      clearTimeout(watchdog);
      locateButton.disabled = false;
      forecast({ name: 'Detected location — looking up city…', detected: true, latitude, longitude, accuracy });
    }, error => fallback(error.code === 1 ? 'Location permission was denied.' : error.code === 3 ? 'Location request timed out.' : 'Your location could not be determined.'),
    { timeout: 20000, maximumAge: 0, enableHighAccuracy: true });
  } catch (error) { fallback('Location is unavailable in this browser.'); }
}
locateButton.addEventListener('click', detectLocation);
detectLocation();

async function resolveCity(location, title, request) {
  try {
    const url = new URL('https://api.bigdatacloud.net/data/reverse-geocode-client');
    url.search = new URLSearchParams({ latitude: location.latitude, longitude: location.longitude, localityLanguage: 'en' });
    const place = await json(url, request.signal);
    if (request !== activeRequest) return;
    const city = place.city || place.locality || place.principalSubdivision;
    title.textContent = city ? `${location.accuracy > 5000 ? 'Approximate area: ' : ''}${[city, place.countryName].filter(Boolean).join(', ')}` : 'Detected location — city name unavailable';
  } catch (error) {
    if (request === activeRequest) title.textContent = 'Detected location — city name unavailable';
  }
}
