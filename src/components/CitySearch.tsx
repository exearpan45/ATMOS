import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Clock, Bookmark, Loader2 } from 'lucide-react';
import { GeoLocation } from '../types/weather';
import { searchCities } from '../services/api';

interface CitySearchProps {
  onSelectCity: (location: GeoLocation) => void;
  recentSearches: GeoLocation[];
  onRemoveRecent: (id: number) => void;
  favorites: GeoLocation[];
  currentCityName?: string;
}

export const CitySearch: React.FC<CitySearchProps> = ({
  onSelectCity,
  recentSearches,
  onRemoveRecent,
  favorites,
  currentCityName,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeoLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounced search logic
  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      setErrorMessage(null);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timer = setTimeout(async () => {
      try {
        const results = await searchCities(trimmed, controller.signal);
        setSuggestions(results);
        setSelectedIndex(-1);
        if (results.length === 0) {
          setErrorMessage(`No matching meteorological stations found for "${trimmed}"`);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setErrorMessage(err.message || 'Unable to connect to Geocoding service.');
          setSuggestions([]);
        }
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Click outside listener to dismiss suggestions
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelect(suggestions[selectedIndex]);
      } else if (suggestions.length > 0) {
        handleSelect(suggestions[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleSelect = (location: GeoLocation) => {
    onSelectCity(location);
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const clearInput = () => {
    setQuery('');
    setSuggestions([]);
    setErrorMessage(null);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto z-30">
      <div className="relative flex items-center">
        <Search className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={currentCityName ? `Search any city, village or coordinates (lat, lon)...` : 'Search any city, village or coordinates (lat, lon)...'}
          className="w-full pl-11 pr-10 py-3.5 rounded-xl bg-slate-900/95 dark:bg-slate-900/95 text-slate-100 placeholder-slate-500 border border-slate-700/80 focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none text-base sm:text-sm transition-all shadow-lg backdrop-blur-md min-h-[48px]"
          aria-label="Search cities or coordinates worldwide"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          role="combobox"
        />

        {isLoading ? (
          <div className="absolute right-3.5 flex items-center">
            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
          </div>
        ) : query ? (
          <button
            onClick={clearInput}
            className="absolute right-2.5 p-2 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Clear search"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-slate-900/98 border border-slate-700/80 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden max-h-[75vh] sm:max-h-96 overflow-y-auto divide-y divide-slate-800/80">
          
          {/* Active live search suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Matching Locations ({suggestions.length})</span>
                <span className="text-[10px] text-cyan-400 font-mono">All Global Settlements</span>
              </div>
              <ul role="listbox">
                {suggestions.map((item, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <li
                      key={`${item.id}-${index}`}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex items-center justify-between px-3 py-3 rounded-lg cursor-pointer transition-colors min-h-[48px] ${
                        isSelected
                          ? 'bg-cyan-950/60 text-cyan-200 border border-cyan-800/40'
                          : 'text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate min-w-0 pr-2">
                        <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                        <div className="truncate">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-semibold text-sm truncate">{item.name}</span>
                            {item.locality && item.locality !== item.name && (
                              <span className="text-[10px] font-mono px-1 rounded bg-slate-800 text-slate-300 shrink-0">
                                {item.locality}
                              </span>
                            )}
                          </div>
                          {(item.suburb || item.admin1 || item.country) && (
                            <p className="text-xs text-slate-400 truncate">
                              {[item.suburb, item.admin1, item.country].filter(Boolean).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-[11px] font-mono tabular-nums text-slate-500 shrink-0 ml-1">
                        {item.latitude.toFixed(2)}°, {item.longitude.toFixed(2)}°
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Error / No results state */}
          {errorMessage && suggestions.length === 0 && !isLoading && (
            <div className="p-4 text-center text-sm text-slate-400">
              <p>{errorMessage}</p>
            </div>
          )}

          {/* Saved Favorites quick selection */}
          {!query && favorites.length > 0 && (
            <div className="p-2">
              <div className="flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400/90">
                <span className="flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                  Saved Favorites
                </span>
              </div>
              <ul>
                {favorites.map((fav) => (
                  <li
                    key={`fav-${fav.id}`}
                    onClick={() => handleSelect(fav)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-slate-200 hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-sm font-medium truncate">{fav.name}</span>
                      {fav.country && <span className="text-xs text-slate-400">({fav.country})</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recent Searches section */}
          {!query && recentSearches.length > 0 && (
            <div className="p-2">
              <div className="flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Recent Searches
                </span>
              </div>
              <ul>
                {recentSearches.map((rec) => (
                  <li
                    key={`rec-${rec.id}`}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800/50 transition-colors group"
                  >
                    <div
                      onClick={() => handleSelect(rec)}
                      className="flex items-center gap-2 truncate flex-1 cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors shrink-0" />
                      <span className="text-sm truncate">{rec.name}</span>
                      {rec.country && <span className="text-xs text-slate-400 truncate">({rec.country})</span>}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveRecent(rec.id);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-700/60"
                      title="Remove from history"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!query && favorites.length === 0 && recentSearches.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-400">
              Type at least 2 characters to search for cities, airports, or weather stations globally.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
