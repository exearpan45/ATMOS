import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-slate-800/80 bg-slate-950 text-slate-400 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">A</span>
              </div>
              <span className="text-base font-bold text-white tracking-tight">ATMOS</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm">
              A clear, calm view of the weather around you, with forecasts and daily conditions.
            </p>
          </div>

        </div>

        <p className="text-[10px] text-slate-500">
          Weather data: <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-cyan-400">Open-Meteo</a>
        </p>
        <div className="pt-4 border-t border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} ATMOS Platform · All rights reserved.
          </div>
          <div className="font-semibold text-slate-300">
            Created by <span className="text-cyan-400">Arpan Goswami</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
