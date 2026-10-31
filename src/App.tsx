import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  WifiOff,
  MapPin,
  Clock,
  Sparkles,
  LayoutDashboard,
  Calendar,
  Wind,
} from 'lucide-react';
import {
  GeoLocation,
  TemperatureUnit,
  ThemeMode,
  WeatherData,
} from './types/weather';
import { fetchWeatherData, reverseGeocode, fetchIpLocation } from './services/api';
import {
  addToSearchHistory,
  DEFAULT_CITIES,
  getStoredDefaultCity,
  getStoredFavorites,
  getStoredHistory,
  getStoredTempUnit,
  getStoredTheme,
  removeFavorite,
  saveFavorite,
  setStoredDefaultCity,
  setStoredTempUnit,
  setStoredTheme,
} from './utils/storage';
import { Header } from './components/Header';
import { CitySearch } from './components/CitySearch';
import { CurrentHero } from './components/CurrentHero';
import { HourlyForecast } from './components/HourlyForecast';
import { DailyForecast } from './components/DailyForecast';
import { WeatherDetails } from './components/WeatherDetails';
import { SunMoonCycle } from './components/SunMoonCycle';
import { AirQualitySection } from './components/AirQualitySection';
import { FavoritesModal } from './components/FavoritesModal';
import { LocationPermissionModal } from './components/LocationPermissionModal';
import { WeatherAlertBanner } from './components/WeatherAlertBanner';
import { BackToTop } from './components/BackToTop';
import { Footer } from './components/Footer';
import { WeatherPlanner } from './components/WeatherPlanner';

export default function App() {
  // Application State
  const [currentCity, setCurrentCity] = useState<GeoLocation>(() => getStoredDefaultCity());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Settings & Preferences
  const [tempUnit, setTempUnit] = useState<TemperatureUnit>(() => getStoredTempUnit());
  const [theme, setTheme] = useState<ThemeMode>(() => getStoredTheme());
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Favorites & History
  const [favorites, setFavorites] = useState<GeoLocation[]>(() => getStoredFavorites());
  const [searchHistory, setSearchHistory] = useState<GeoLocation[]>(() => getStoredHistory());
  const [isFavoritesOpen, setIsFavoritesOpen] = useState<boolean>(false);

  // First-Entrance Location Permission Prompt
  const [showLocationPrompt, setShowLocationPrompt] = useState<boolean>(false);

  // Device & Network states
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const weatherRef = useRef<WeatherData | null>(null);

  // Sync theme with HTML documentElement
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme === 'light');
    setStoredTheme(theme);
  }, [theme]);

  // First Visit Check: prompt for location permission on first entrance
  useEffect(() => {
    try {
      const alreadyPrompted = localStorage.getItem('atmos_location_prompted_v1');
      if (!alreadyPrompted) {
        // Show permission prompt modal after layout mounts
        const timer = setTimeout(() => {
          setShowLocationPrompt(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.warn('LocalStorage access notice:', e);
    }
  }, []);

  // Main Weather Loader. Request IDs stop stale requests from overwriting
  // newer results or clearing their loading indicators.
  const loadWeather = useCallback(
    async (location: GeoLocation, forceRefresh: boolean = false) => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const requestId = ++requestIdRef.current;

      if (!weatherRef.current) setIsLoading(true);
      else setIsRefreshing(true);
      setErrorMessage(null);

      try {
        const data = await fetchWeatherData(location, forceRefresh, controller.signal);
        if (requestId !== requestIdRef.current) return;
        weatherRef.current = data;
        setWeather(data);
        setCurrentCity(data.location);
        setStoredDefaultCity(data.location);
      } catch (err: unknown) {
        if (requestId !== requestIdRef.current) return;
        if (err instanceof Error && err.name === 'AbortError') return;
        console.error('Failed to load weather:', err);
        setErrorMessage(err instanceof Error ? err.message : 'Weather could not be loaded. Check your connection and try again.');
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    []
  );

  useEffect(() => () => {
    requestIdRef.current += 1;
    abortControllerRef.current?.abort();
  }, []);

  // Online / Offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setNoticeMessage('Connection restored. Updating weather...');
      void loadWeather(currentCity, true);
      setTimeout(() => setNoticeMessage(null), 4000);
    };
    const handleOffline = () => {
      setIsOffline(true);
      setNoticeMessage('You are offline. Showing the latest available weather.');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentCity, loadWeather]);

  useEffect(() => {
    void loadWeather(currentCity);
  }, [currentCity.latitude, currentCity.longitude, loadWeather]);

  // City selection handler (from search, map pin drop, or favorites)
  const handleSelectCity = (location: GeoLocation) => {
    setCurrentCity(location);
    const updatedHistory = addToSearchHistory(location);
    setSearchHistory(updatedHistory);
    setNoticeMessage(`Loaded station: ${location.name}`);
    setTimeout(() => setNoticeMessage(null), 3000);
  };

  // Unit toggle handler
  const handleToggleTempUnit = () => {
    const newUnit = tempUnit === 'celsius' ? 'fahrenheit' : 'celsius';
    setTempUnit(newUnit);
    setStoredTempUnit(newUnit);
  };

  // Theme toggle handler
  const handleToggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  // Favorite toggle handler
  const handleToggleFavorite = (location: GeoLocation) => {
    const exists = favorites.some((f) => f.id === location.id);
    if (exists) {
      const updated = removeFavorite(location.id);
      setFavorites(updated);
    } else {
      const updated = saveFavorite(location);
      setFavorites(updated);
    }
  };

  // Geolocation multi-stage detection handler:
  // Stage 1: Prioritize high-accuracy GPS with a snappy 4500ms timeout
  // Stage 2: Transparently fall back to IP-based estimation if GPS times out, is denied, or fails
  // Safety: Strict timeout guard guarantees user is never left in a blocking loading state
  const handleDetectLocation = async () => {
    setIsLocating(true);
    setNoticeMessage('Acquiring pinpoint GPS fix...');

    const completeLocation = (loc: GeoLocation, msg: string) => {
      handleSelectCity(loc);
      setNoticeMessage(msg);
      setIsLocating(false);
      setShowLocationPrompt(false);
      try {
        localStorage.setItem('atmos_location_prompted_v1', 'true');
      } catch {}
      setTimeout(() => setNoticeMessage(null), 5000);
    };

    const tryIpFallback = async (reason?: string) => {
      try {
        setNoticeMessage('Estimating location via network IP...');
        const ipLoc = await fetchIpLocation();
        completeLocation(
          ipLoc,
          reason
            ? `Located via IP network (${ipLoc.name}): ${reason}`
            : `Located via IP network: ${ipLoc.name}`
        );
      } catch {
        setIsLocating(false);
        setShowLocationPrompt(false);
        try {
          localStorage.setItem('atmos_location_prompted_v1', 'true');
        } catch {}
        setNoticeMessage('Could not detect location. You can search any city or coordinates manually.');
        setTimeout(() => setNoticeMessage(null), 5000);
      }
    };

    if (!navigator.geolocation) {
      await tryIpFallback('GPS not supported on device');
      return;
    }

    let isResolved = false;

    // Safety guard timeout in case navigator.geolocation hangs indefinitely
    const safetyGuard = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        tryIpFallback('GPS fix timed out');
      }
    }, 5000);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (isResolved) return;
        isResolved = true;
        clearTimeout(safetyGuard);

        const { latitude, longitude, accuracy } = position.coords;
        try {
          const loc = await reverseGeocode(latitude, longitude, accuracy, true);
          completeLocation(
            loc,
            `Pinpoint GPS Fix acquired (±${Math.round(accuracy)}m): ${loc.name}`
          );
        } catch {
          completeLocation(
            {
              id: Math.round(latitude * 100000 + longitude * 100),
              name: 'Your Exact Location',
              latitude,
              longitude,
              accuracyMeters: accuracy,
              isGpsLocated: true,
              timezone: 'auto',
            },
            `Pinpoint GPS acquired: ${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`
          );
        }
      },
      async (error) => {
        if (isResolved) return;
        isResolved = true;
        clearTimeout(safetyGuard);

        // Fall back gracefully to IP estimation instead of leaving user stuck
        const reason =
          error.code === error.PERMISSION_DENIED
            ? 'GPS permission not granted'
            : error.code === error.TIMEOUT
            ? 'GPS request timed out'
            : 'Satellite signal unavailable';

        await tryIpFallback(reason);
      },
      { timeout: 4500, enableHighAccuracy: true, maximumAge: 60000 }
    );
  };

  const handleDismissLocationPrompt = () => {
    setShowLocationPrompt(false);
    try {
      localStorage.setItem('atmos_location_prompted_v1', 'true');
    } catch {}
  };

  const isCurrentFavorite = Boolean(
    weather && favorites.some((f) => f.id === weather.location.id)
  );

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Top Header Bar */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        tempUnit={tempUnit}
        onToggleTempUnit={handleToggleTempUnit}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onDetectLocation={handleDetectLocation}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        favoritesCount={favorites.length}
        isLocating={isLocating}
        onRefresh={() => loadWeather(currentCity, true)}
        isRefreshing={isRefreshing}
      />

      {/* Offline and Status Notification Banners */}
      {isOffline && (
        <div className="bg-amber-950/80 border-b border-amber-800/80 px-4 py-2 text-center text-xs font-semibold text-amber-200 flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4 text-amber-400" />
          <span>Offline mode active. Displaying cached weather records.</span>
        </div>
      )}

      {noticeMessage && !isOffline && (
        <div className="bg-cyan-950/90 border-b border-cyan-800/80 px-4 py-2 text-center text-xs font-semibold text-cyan-200 flex items-center justify-center gap-2 animate-in fade-in">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          <span>{noticeMessage}</span>
        </div>
      )}

      {/* Main Content Area (extra bottom padding for mobile navigation bar) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 md:pb-12 space-y-6 sm:space-y-8">
        
        {/* Global City & Coordinate Search Bar with quick access */}
        <section className="space-y-2.5">
          <CitySearch
            onSelectCity={handleSelectCity}
            recentSearches={searchHistory}
            onRemoveRecent={(id) => {
              setSearchHistory((prev) => prev.filter((p) => p.id !== id));
            }}
            favorites={favorites}
            currentCityName={weather?.location.name}
          />

          {/* Quick city presets chip-bar, including the user's village landmark */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap text-xs text-slate-400 pt-0.5">
            <span className="text-slate-400 font-medium text-[11px] sm:text-xs">Quick locations:</span>
            {DEFAULT_CITIES.map((c) => (
              <button
                key={`preset-${c.id}`}
                onClick={() => handleSelectCity(c)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer min-h-[36px] flex items-center ${
                  weather?.location.name === c.name
                    ? 'text-cyan-300 bg-cyan-950/50 border border-cyan-800/60'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/60'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </section>

        {/* Loading Skeleton */}
        {isLoading && !weather && (
          <div className="space-y-6 animate-pulse">
            <div className="h-64 rounded-2xl bg-slate-900/80 border border-slate-800" />
            <div className="h-44 rounded-2xl bg-slate-900/80 border border-slate-800" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-32 rounded-2xl bg-slate-900/80 border border-slate-800" />
              <div className="h-32 rounded-2xl bg-slate-900/80 border border-slate-800" />
              <div className="h-32 rounded-2xl bg-slate-900/80 border border-slate-800" />
            </div>
          </div>
        )}

        {/* Error State */}
        {errorMessage && (
          <div className="p-8 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-center space-y-4 max-w-lg mx-auto">
            <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Meteorological Service Notice</h3>
              <p className="text-xs text-rose-200">{errorMessage}</p>
            </div>
            <button
              onClick={() => loadWeather(currentCity, true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-lg min-h-[44px]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Fetch</span>
            </button>
          </div>
        )}

        {/* Populated Views based on currentTab */}
        {weather && (
          <div className="space-y-6 sm:space-y-8">
            
            {/* Real-Time Severe Weather Warning Alert Banner */}
            <WeatherAlertBanner alerts={weather.alerts} />

            {/* Tab: Dashboard (Full Comprehensive Overview) */}
            {currentTab === 'dashboard' && (
              <>
                {/* 1. Hero current conditions */}
                <CurrentHero
                  weather={weather}
                  tempUnit={tempUnit}
                  isFavorite={isCurrentFavorite}
                  onToggleFavorite={handleToggleFavorite}
                  onRefresh={() => loadWeather(currentCity, true)}
                  isRefreshing={isRefreshing}
                />

                {/* 2. 24-Hour Hourly Forecast strip / chart */}
                <HourlyForecast hourly={weather.hourly} tempUnit={tempUnit} />

                {/* 3. 7-Day Weekly Forecast & Solar Cycle Split Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
                  <div className="lg:col-span-2">
                    <DailyForecast daily={weather.daily} tempUnit={tempUnit} />
                  </div>
                  <div className="space-y-6">
                    <SunMoonCycle
                      todayDaily={weather.daily[0]}
                      timezone={weather.timezone}
                      isDay={weather.current.isDay}
                    />
                  </div>
                </div>

                {/* 4. Weather Details Sensor Matrix */}
                <WeatherDetails
                  current={weather.current}
                  uvIndex={weather.hourly[0]?.uvIndex ?? weather.daily[0]?.uvIndexMax}
                  visibilityMeters={weather.hourly[0]?.visibility}
                  dewPoint={weather.hourly[0]?.temperature ? weather.hourly[0].temperature - 3 : undefined}
                  tempUnit={tempUnit}
                />

                {/* 5. Air Quality & Atmospheric Health */}
                <AirQualitySection airQuality={weather.airQuality} /></>
            )}

            {/* Tab: 24h Hourly Forecast Dedicated View */}
            {currentTab === 'hourly' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                    24-Hour Hourly Projections for {weather.location.name}
                  </h2>
                  <span className="text-xs font-mono text-slate-400">Timezone: {weather.timezone}</span>
                </div>
                <HourlyForecast hourly={weather.hourly} tempUnit={tempUnit} />
                <WeatherDetails
                  current={weather.current}
                  uvIndex={weather.hourly[0]?.uvIndex}
                  visibilityMeters={weather.hourly[0]?.visibility}
                  tempUnit={tempUnit}
                />
              </div>
            )}

            {/* Tab: 7-Day Outlook Dedicated View */}
            {currentTab === 'forecast' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                    7-Day Extended Trajectory for {weather.location.name}
                  </h2>
                  <span className="text-xs font-mono text-slate-400">7-Day Horizon</span>
                </div>
                <DailyForecast daily={weather.daily} tempUnit={tempUnit} />
                <SunMoonCycle
                  todayDaily={weather.daily[0]}
                  timezone={weather.timezone}
                  isDay={weather.current.isDay}
                />
              </div>
            )}{/* Tab: Air Quality Dedicated View */}
            {currentTab === 'planner' && (
              <WeatherPlanner
                location={weather.location}
                current={weather.current}
                hourly={weather.hourly}
                daily={weather.daily}
                tempUnit={tempUnit}
              />
            )}

            {currentTab === 'airquality' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                    Aerosols & Particulate Matter for {weather.location.name}
                  </h2>
                  <span className="text-xs font-mono text-slate-400">WHO & EPA Air Quality Standards</span>
                </div>
                <AirQualitySection airQuality={weather.airQuality} />
              </div>
            )}

          </div>
        )}

      </main>

      {/* First Entrance Pinpoint Location Permission Modal */}
      <LocationPermissionModal
        isOpen={showLocationPrompt}
        onRequestLocation={handleDetectLocation}
        onDismiss={handleDismissLocationPrompt}
        isLocating={isLocating}
      />

      {/* Saved Favorites Dialog Modal */}
      <FavoritesModal
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onSelectCity={handleSelectCity}
        onRemoveFavorite={(id) => {
          const updated = removeFavorite(id);
          setFavorites(updated);
        }}
        currentCityId={weather?.location.id ?? 0}
      />

      {/* Mobile Sticky Bottom Thumb Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around shadow-2xl"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 8px), 8px)' }}
      >
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg min-w-[56px] min-h-[44px] transition-colors ${
            currentTab === 'dashboard' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Overview</span>
        </button>

        <button
          onClick={() => setCurrentTab('hourly')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg min-w-[56px] min-h-[44px] transition-colors ${
            currentTab === 'hourly' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Hourly</span>
        </button>

        <button
          onClick={() => setCurrentTab('forecast')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg min-w-[56px] min-h-[44px] transition-colors ${
            currentTab === 'forecast' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">7-Day</span>
        </button>
        <button
          onClick={() => setCurrentTab('planner')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg min-w-[56px] min-h-[44px] transition-colors ${
            currentTab === 'planner' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Planner</span>
        </button>
        <button
          onClick={() => setCurrentTab('airquality')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg min-w-[56px] min-h-[44px] transition-colors ${
            currentTab === 'airquality' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wind className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Air Q</span>
        </button>
      </nav>

      {/* Back to top floating button */}
      <BackToTop />

      {/* Production Footer with Author Arpan Goswami */}
      <Footer />

    </div>
  );
}
