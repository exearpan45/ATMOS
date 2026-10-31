# ATMOS – Premium Real-Time Weather & Forecast Platform

ATMOS is a modern, high-performance, real-time meteorological platform designed to provide accurate weather intelligence, 24-hour predictive models, 7-day extended forecasts with global forecasts and practical planning tools.

Created by **Arpan Goswami**.

---

## 🌟 Key Features

1. **Precision Live Telemetry**:
   - Current temperature, feels-like temperature, and day/night status.
   - WMO weather code interpretation with animated atmospheric icons and mood-calibrated background themes.
   - Relative humidity, dew point estimation, barometric sea-level pressure (hPa & inHg), wind velocity with cardinal heading and gusts, and solar UV radiation indices.

2. **24-Hour Hourly Forecast**:
   - Interactive horizonal card carousel for the next 24 hours.
   - Built-in interactive **Chart.js** telemetry line graph displaying temperature and precipitation chance curves simultaneously.
   - Expandable deep-dive metric readout for each selected hour.

3. **7-Day Extended Trajectory**:
   - High and low thermal range spectrum bars calibrated across weekly extremes.
   - Daily precipitation probabilities and maximum expected gust speeds.

4. **Solar Ephemeris & Daylight Tracking**:
   - Precise sunrise, sunset, and daylight duration calculation based on the queried station's specific local timezone.
   - Visual SVG solar arc indicator displaying live sun/moon traversal.

5. **Aerosols & Air Quality Index (AQI)**:
   - Granular breakdown of key pollutants: PM2.5, PM10, Nitrogen Dioxide ($\text{NO}_2$), Ozone ($\text{O}_3$), Sulphur Dioxide ($\text{SO}_2$), and Carbon Monoxide ($\text{CO}$).
   - WHO & EPA health advisories for general populations and sensitive groups.

6. **Weather Planner**:
   - Outdoor activity score based on forecast rain, temperature, wind, and UV.
   - Suggested weather window and practical planning tips.


7. **Global City Search & Geocoding**:
   - Keyboard accessible (Arrow Up/Down, Enter, Escape).
   - Saved favorites and recent search history stored securely in LocalStorage.

8. **Location Detection via GPS**:
   - Safe, user-initiated device location detection.
   - Automatically reverse-geocodes coordinates into city and country names.

9. **Unit & Theme Customization**:
   - Instant toggle between Celsius (°C) and Fahrenheit (°F).
   - Full dark mode (deep obsidian/navy glassmorphism) and light mode support with Tailwind v4 custom variants.

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + Glassmorphism architecture
- **Icons**: Lucide Icons
- **Charting**: Chart.js
- **Weather Data**: Global forecast, location search, and air-quality services
- **Persistence**: LocalStorage with schema validation & fallback protection
- **Deployment**: GitHub + Cloudflare Pages ready (static SPA build)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Node.js 20+
- npm or yarn or pnpm

### Installation

```bash
git clone https://github.com/your-username/atmos.git
cd atmos
npm install
```

### Local Development

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Production Build

```bash
npm run build
```

This compiles optimized static assets into the `dist/` directory, ready to deploy to Cloudflare Pages, GitHub Pages, or Vercel.

---

## 📂 Project Architecture

```
/
├── index.html                   # Entry point with SEO, OpenGraph, JSON-LD schema
├── favicon.svg                  # SVG vector favicon
├── robots.txt                   # Search crawler directives
├── sitemap.xml                  # Sitemap configuration
├── package.json                 # Project dependencies & scripts
├── vite.config.ts               # Vite configuration
├── src/
│   ├── main.tsx                 # React application bootstrapper
│   ├── index.css                # Tailwind CSS v4, dark variants & glass styles
│   ├── App.tsx                  # Core state manager, tab routing & offline handler
│   ├── types/
│   │   └── weather.ts           # Unified TypeScript definitions & schemas
│   ├── services/
│   ├── utils/
│   │   ├── weatherCodes.ts      # WMO condition mapping & AQI thresholds
│   │   ├── formatters.ts        # Unit converters & date/time formatters
│   │   └── storage.ts           # Safe LocalStorage persistence
│   └── components/
│       ├── Header.tsx           # Top navigation bar (Design Constitution compliant)
│       ├── CitySearch.tsx       # Debounced search with suggestions & history
│       ├── CurrentHero.tsx      # Atmospheric hero card with live metrics
│       ├── HourlyForecast.tsx   # 24h cards + interactive Chart.js canvas
│       ├── DailyForecast.tsx    # 7-day outlook with thermal range bars
│       ├── WeatherDetails.tsx   # Sensor telemetry grid (Wind, UV, Pressure, etc.)
│       ├── SunMoonCycle.tsx     # SVG solar arc ephemeris tracking
│       ├── AirQualitySection.tsx# European & US AQI with pollutant breakdown
│       ├── WeatherIcon.tsx      # Condition-based animated Lucide icon mapper
│       ├── FavoritesModal.tsx   # Saved cities management dialog
│       └── Footer.tsx           # Attributions & credits
└── README.md                    # Project documentation
```

---

## ☁️ Deployment (Cloudflare Pages)

1. Push this repository to GitHub.
2. In the Cloudflare Dashboard, navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select your repository.
4. Configure Build settings:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Click **Save and Deploy**. Your site will be live instantly with global CDN acceleration and HTTPS.

---

## 🧪 Testing

Run type checking and linting:

```bash
npm run lint
```

Run production build validation:

```bash
npm run build
```

---

## 🛡️ Privacy & Performance

- **Zero Trackers**: No third-party behavioral analytics or telemetry scripts.
- **Client-Side Caching**: 10-minute cache on meteorological requests to prevent unnecessary network requests and avoid unnecessary network requests.
- **Responsive Layout**: Validated across mobile (360px–390px), tablet (768px), and desktop (1024px–1440px+).

---

## 📜 Credits & License

**Created by Arpan Goswami.**

Weather data is provided by [Open-Meteo](https://open-meteo.com/) under Creative Commons Attribution 4.0 International (CC BY 4.0).
Licensed under the Apache-2.0 License.
