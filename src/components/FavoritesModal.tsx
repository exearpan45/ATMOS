import React from 'react';
import { X, Bookmark, Trash2, MapPin, Compass } from 'lucide-react';
import { GeoLocation } from '../types/weather';

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: GeoLocation[];
  onSelectCity: (location: GeoLocation) => void;
  onRemoveFavorite: (id: number) => void;
  currentCityId: number;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({
  isOpen,
  onClose,
  favorites,
  onSelectCity,
  onRemoveFavorite,
  currentCityId,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Saved Favorite Cities</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 max-h-96 overflow-y-auto space-y-2">
          {favorites.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <Bookmark className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-300 font-medium">No saved cities yet</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Click the "Save City" bookmark button on the weather hero card to pin locations here for quick access.
              </p>
            </div>
          ) : (
            favorites.map((city) => {
              const isCurrent = city.id === currentCityId;
              return (
                <div
                  key={`fav-modal-${city.id}`}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-cyan-950/40 border-cyan-800/60 text-white'
                      : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40 text-slate-200'
                  }`}
                >
                  <div
                    onClick={() => {
                      onSelectCity(city);
                      onClose();
                    }}
                    className="flex-1 flex items-center gap-2.5 cursor-pointer truncate"
                  >
                    <MapPin className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-cyan-400' : 'text-amber-400'}`} />
                    <div className="truncate">
                      <div className="font-semibold text-sm truncate flex items-center gap-1.5">
                        <span>{city.name}</span>
                        {isCurrent && (
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700/60">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        {[city.admin1, city.country].filter(Boolean).join(', ')}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveFavorite(city.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors ml-2"
                    title="Remove from favorites"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>{favorites.length} pinned locations</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
