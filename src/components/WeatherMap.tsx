import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, Play, Pause, RotateCcw, MapPin, Maximize2, ShieldCheck } from 'lucide-react';
import { GeoLocation, TemperatureUnit, WeatherData } from '../types/weather';
import { formatTemperature } from '../utils/formatters';
import { getWeatherCondition } from '../utils/weatherCodes';

interface WeatherMapProps {
  location: GeoLocation;
  weather: WeatherData;
  tempUnit: TemperatureUnit;
  onSelectLocation?: (location: GeoLocation) => void;
}

interface RainViewerData {
  version: string;
  generated: number;
  host: string;
  radar: {
    past: Array<{ time: number; path: string }>;
    nowcast: Array<{ time: number; path: string }>;
  };
  satellite: {
    infrared: Array<{ time: number; path: string }>;
  };
}

export const WeatherMap: React.FC<WeatherMapProps> = ({
  location,
  weather,
  tempUnit,
  onSelectLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const radarLayerRef = useRef<L.TileLayer | null>(null);
  const onSelectLocationRef = useRef(onSelectLocation);
  onSelectLocationRef.current = onSelectLocation;

  const [activeLayer, setActiveLayer] = useState<'radar' | 'satellite' | 'none'>('radar');
  const [rainViewerData, setRainViewerData] = useState<RainViewerData | null>(null);
  const [radarFrames, setRadarFrames] = useState<Array<{ time: number; path: string }>>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [layerOpacity, setLayerOpacity] = useState<number>(0.75);

  const condition = getWeatherCondition(weather.current.weatherCode, weather.current.isDay);

  // 1. Fetch free RainViewer radar metadata
  useEffect(() => {
    let isMounted = true;
    async function fetchRadarMetadata() {
      try {
        const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        if (res.ok) {
          const data: RainViewerData = await res.json();
          if (isMounted) {
            setRainViewerData(data);
            const frames = [...(data.radar?.past || []), ...(data.radar?.nowcast || [])];
            setRadarFrames(frames);
            if (frames.length > 0) {
              setCurrentFrameIndex(frames.length - 1); // default to latest live frame
            }
          }
        }
      } catch (err) {
        console.warn('RainViewer API notice: using fallback OpenStreetMap base map', err);
      }
    }

    fetchRadarMetadata();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [location.latitude, location.longitude],
        zoom: 7,
        zoomControl: true,
        attributionControl: true,
      });

      // CartoDB tiles
      const baseTile = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 18,
          subdomains: 'abcd',
        }
      );
      baseTile.addTo(map);

      // Custom marker icon
      const customIcon = L.divIcon({
        className: 'custom-weather-marker',
        html: `
          <div style="background: #06b6d4; color: white; padding: 4px 8px; border-radius: 9999px; font-weight: bold; font-family: monospace; font-size: 11px; box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4); display: flex; align-items: center; gap: 4px; border: 2px solid white; transform: translate(-50%, -50%);">
            <span>●</span>
            <span>${location.name}</span>
          </div>
        `,
        iconSize: [0, 0],
      });

      const marker = L.marker([location.latitude, location.longitude], { icon: customIcon });
      marker.addTo(map);
      marker.bindPopup(`
        <div style="font-family: system-ui; padding: 4px;">
          <h4 style="margin: 0 0 4px 0; font-weight: bold;">${location.name}</h4>
          <p style="margin: 0; font-size: 13px; color: #475569;">
            ${formatTemperature(weather.current.temperature, tempUnit)} · ${condition.title}
          </p>
        </div>
      `);

      // Click or tap anywhere on the map to pinpoint weather
      map.on('click', async (e: L.LeafletMouseEvent) => {
        if (onSelectLocationRef.current) {
          const { lat, lng } = e.latlng;
          try {
            const { reverseGeocode } = await import('../services/api');
            const pinLoc = await reverseGeocode(lat, lng);
            onSelectLocationRef.current(pinLoc);
          } catch {
            onSelectLocationRef.current({
              id: Math.round(lat * 10000 + lng * 100),
              name: `Pinpoint (${lat.toFixed(3)}°, ${lng.toFixed(3)}°)`,
              latitude: lat,
              longitude: lng,
              timezone: 'auto',
            });
          }
        }
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    } else {
      const map = mapInstanceRef.current;
      map.setView([location.latitude, location.longitude], 7);
      if (markerRef.current) {
        markerRef.current.setLatLng([location.latitude, location.longitude]);
        markerRef.current.setPopupContent(`
          <div style="font-family: system-ui; padding: 4px;">
            <h4 style="margin: 0 0 4px 0; font-weight: bold;">${location.name}</h4>
            <p style="margin: 0; font-size: 13px; color: #475569;">
              ${formatTemperature(weather.current.temperature, tempUnit)} · ${condition.title}
            </p>
          </div>
        `);
      }
    }
  }, [location]);

  // 3. Update Radar / Satellite Overlay Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !rainViewerData) return;

    // Remove existing radar layer
    if (radarLayerRef.current) {
      map.removeLayer(radarLayerRef.current);
      radarLayerRef.current = null;
    }

    if (activeLayer === 'none') {
      return;
    }

    let tileUrl = '';

    if (activeLayer === 'radar' && radarFrames.length > 0) {
      const activeFrame = radarFrames[currentFrameIndex] || radarFrames[radarFrames.length - 1];
      if (activeFrame) {
        // RainViewer radar tile scheme: {host}{path}/256/{z}/{x}/{y}/2/1_1.png
        // 2: color scheme (Universal Blue), 1_1: smooth snow & rain
        tileUrl = `${rainViewerData.host}${activeFrame.path}/256/{z}/{x}/{y}/2/1_1.png`;
      }
    } else if (activeLayer === 'satellite' && rainViewerData.satellite?.infrared?.length > 0) {
      const satList = rainViewerData.satellite.infrared;
      const latestSat = satList[satList.length - 1];
      tileUrl = `${rainViewerData.host}${latestSat.path}/256/{z}/{x}/{y}/0/0_0.png`;
    }

    if (tileUrl) {
      const newLayer = L.tileLayer(tileUrl, {
        opacity: layerOpacity,
        zIndex: 50,
        attribution: '&copy; <a href="https://www.rainviewer.com/api.html">RainViewer</a> Radar',
      });
      newLayer.addTo(map);
      radarLayerRef.current = newLayer;
    }
  }, [activeLayer, rainViewerData, radarFrames, currentFrameIndex, layerOpacity]);

  // 4. Play/Pause Radar Animation Loop
  useEffect(() => {
    if (!isPlaying || radarFrames.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentFrameIndex((prev) => (prev + 1) % radarFrames.length);
    }, 700);

    return () => clearInterval(interval);
  }, [isPlaying, radarFrames.length]);

  const recenterMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([location.latitude, location.longitude], 8, { animate: true });
    }
  };

  // Formatted timestamp of active frame
  const currentFrameTimestamp =
    radarFrames[currentFrameIndex]?.time
      ? new Intl.DateTimeFormat('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }).format(new Date(radarFrames[currentFrameIndex].time * 1000))
      : 'Live';

  return (
    <section className="rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl p-5 sm:p-6 shadow-xl space-y-4">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">
              Interactive Precipitation & Cloud Radar
            </h2>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Live Free Open Data
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real Doppler precipitation radar tiles and infrared cloud satellite layers · <span className="text-cyan-400 font-semibold">Tap anywhere on the globe to drop a pin</span>
          </p>
        </div>

        {/* Layer Switcher Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-lg border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveLayer('radar')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeLayer === 'radar'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Precipitation
          </button>
          <button
            onClick={() => setActiveLayer('satellite')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeLayer === 'satellite'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Infrared Clouds
          </button>
          <button
            onClick={() => setActiveLayer('none')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeLayer === 'none'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Terrain Only
          </button>
        </div>
      </div>

      {/* Map Viewport */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-inner h-[380px] sm:h-[460px] w-full z-10">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Map HUD Top Right */}
        <div className="absolute top-3 right-3 z-[400] flex items-center gap-2">
          <button
            onClick={recenterMap}
            title="Recenter to active city"
            className="p-2 rounded-lg bg-slate-900/90 text-slate-200 hover:text-cyan-400 hover:bg-slate-800 border border-slate-700 shadow-lg backdrop-blur-md transition-colors"
          >
            <MapPin className="w-4 h-4" />
          </button>
        </div>

        {/* Floating Animation Bar at Bottom of Map */}
        {activeLayer === 'radar' && radarFrames.length > 0 && (
          <div className="absolute bottom-4 left-4 right-4 z-[400] max-w-lg mx-auto p-2.5 rounded-xl bg-slate-950/90 border border-slate-700/80 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-3 text-xs">
            
            {/* Play / Pause Toggle */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors shrink-0"
              title={isPlaying ? 'Pause radar loop' : 'Play radar animation'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            {/* Time label and scrub slider */}
            <div className="flex-1 flex items-center gap-2">
              <span className="font-mono text-[11px] text-slate-400 shrink-0 w-14">
                {currentFrameTimestamp}
              </span>
              <input
                type="range"
                min={0}
                max={radarFrames.length - 1}
                value={currentFrameIndex}
                onChange={(e) => {
                  setIsPlaying(false);
                  setCurrentFrameIndex(Number(e.target.value));
                }}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Intensity Legend */}
            <div className="hidden sm:flex items-center gap-1 text-[10px] text-slate-400 shrink-0 font-mono">
              <span className="text-cyan-400">Light</span>
              <div className="w-12 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-500" />
              <span className="text-rose-400">Severe</span>
            </div>

          </div>
        )}
      </div>

      {/* Map Attribution and Data notes */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-1">
        <div>
          <span>Layers: OpenStreetMap & CARTO Voyager · Radar telemetry supplied by RainViewer Doppler grid</span>
        </div>
        <div className="font-mono text-slate-400">
          Center: {location.latitude.toFixed(3)}°N, {location.longitude.toFixed(3)}°E
        </div>
      </div>

    </section>
  );
};
