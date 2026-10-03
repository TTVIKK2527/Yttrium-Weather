# Yttrium Weather

Search for a city, select the matching place and view a seven-day forecast with daily high and low temperatures, conditions and maximum wind speed.

Location detection starts automatically and requires browser or desktop permission. If the high-accuracy request fails, one standard request is attempted. A failed detection keeps the previous forecast visible. Each forecast identifies whether its location came from city search or the device. The app shows the city, coordinates, time zone and reported accuracy. Broad estimates are labeled approximate. If detection fails or points to the wrong area, city search remains available.

## Run locally

Serve this folder with `python3 -m http.server 8000` and open http://localhost:8000. Internet access and JavaScript are required.

## Publish

Deploy `index.html`, `app.js`, `style.css` and `.nojekyll` to an HTTPS static host. No build step, backend or API key is required. Relative asset paths support deployment in a subdirectory.

## Desktop app on Arch Linux

Build with `makepkg -f`, install the resulting package with `sudo pacman -U <package-file>`, then launch Yttrium Weather from the application menu or run `yttrium-weather`. The launcher opens an embedded WebKit window and serves app files only on the local loopback interface.

## Data and privacy

Open-Meteo supplies city search and weather forecasts. BigDataCloud resolves permitted device coordinates to a city. Coordinates are sent to those services for those purposes. The app does not save location history or include analytics. The browser or operating system chooses the device location provider and its accuracy. Switching weather services cannot improve the detected coordinates.

Weather data attribution: [Open-Meteo](https://open-meteo.com/), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
