import React from 'react';
import { Sun, Moon, MapPin, Bookmark, RefreshCw } from 'lucide-react';
import { TemperatureUnit, ThemeMode } from '../types/weather';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  tempUnit: TemperatureUnit;
  onToggleTempUnit: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onDetectLocation: () => void;
  onOpenFavorites: () => void;
  favoritesCount: number;
  isLocating: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  tempUnit,
  onToggleTempUnit,
  theme,
  onToggleTheme,
  onDetectLocation,
  onOpenFavorites,
  favoritesCount,
  isLocating,
  onRefresh,
  isRefreshing,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'hourly', label: '24h Hourly' },
    { id: 'forecast', label: '7-Day Outlook' },
    { id: 'radar', label: 'Radar & Maps' },
    { id: 'airquality', label: 'Air Quality' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/80 dark:bg-slate-950/80 border-b border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
        
        {/* Zone 1: Single Brand Wordmark */}
        <button
          onClick={() => onTabChange('dashboard')}
          className="flex items-center gap-2.5 text-left text-xl font-extrabold tracking-tight text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-lg whitespace-nowrap shrink-0 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-200">
            <span className="text-white text-base font-black">A</span>
          </div>
          <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent font-bold">
            ATMOS
          </span>
        </button>

        {/* Zone 2: 4-5 Clean Single-Line Nav Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`px-3 py-1.5 rounded-md transition-all duration-150 whitespace-nowrap shrink-0 text-xs lg:text-sm font-medium ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-800/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Functional Actions & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh current meteorological conditions"
            aria-label="Refresh data"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-slate-800/80 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Detect Location Button */}
          <button
            onClick={onDetectLocation}
            disabled={isLocating}
            title="Locate via device GPS"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-cyan-300 hover:bg-slate-800/60 border border-slate-800/80 transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            <MapPin className={`w-3.5 h-3.5 ${isLocating ? 'animate-pulse text-cyan-400' : 'text-cyan-400'}`} />
            <span className="hidden sm:inline">{isLocating ? 'Locating...' : 'Detect GPS'}</span>
          </button>

          {/* Saved Favorites Drawer/Modal Toggle */}
          <button
            onClick={onOpenFavorites}
            title="View saved cities"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-amber-300 hover:bg-slate-800/60 border border-slate-800/80 transition-colors whitespace-nowrap shrink-0"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono tabular-nums text-xs text-amber-300">{favoritesCount}</span>
          </button>

          {/* Unit Toggle °C / °F */}
          <button
            onClick={onToggleTempUnit}
            title={`Switch to ${tempUnit === 'celsius' ? 'Fahrenheit (°F)' : 'Celsius (°C)'}`}
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-colors whitespace-nowrap shrink-0"
          >
            {tempUnit === 'celsius' ? '°C' : '°F'}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle visual theme"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-slate-800/80 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-300" />}
          </button>
        </div>

      </div>

      {/* Mobile Horizontal Navigation Tabs */}
      <div className="md:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 border-t border-slate-800/50 bg-slate-950/60 scrollbar-none">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'text-cyan-400 bg-cyan-950/60 border border-cyan-800/60'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
