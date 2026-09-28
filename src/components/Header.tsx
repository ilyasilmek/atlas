import React from 'react';
import { 
  Sparkles, 
  Moon, 
  Sun, 
  Heart, 
  Wand2, 
  BookOpen, 
  Layers
} from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  favoritesCount: number;
  onlyFavorites: boolean;
  setOnlyFavorites: (val: boolean) => void;
  onOpenStudio: () => void;
  totalCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  setDarkMode,
  favoritesCount,
  onlyFavorites,
  setOnlyFavorites,
  onOpenStudio,
  totalCount
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/25 text-white">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Prompt<span className="text-blue-600 dark:text-blue-400">Atlas</span>
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50">
                  stitchilyas
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden xs:block">
                {totalCount > 0 ? `${totalCount} Yapay Zeka Promptu & Görseli` : 'Prompt & Görsel Kataloğu'}
              </p>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Prompt Studio Button */}
            <button
              onClick={onOpenStudio}
              type="button"
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-md hover:from-indigo-600 hover:to-blue-700 transition active:scale-95 cursor-pointer"
              title="Prompt Düzenleyici & Oluşturucu"
            >
              <Wand2 className="w-4 h-4" />
              <span className="hidden md:inline">Prompt Stüdyosu</span>
            </button>

            {/* Favorites Toggle */}
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              type="button"
              className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border transition active:scale-95 cursor-pointer ${
                onlyFavorites
                  ? 'bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-500/25'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Favorilerim"
            >
              <Heart className={`w-4 h-4 ${onlyFavorites ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">Favoriler</span>
              {favoritesCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-xs font-bold ${
                  onlyFavorites ? 'bg-white text-rose-600' : 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                }`}>
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Dark / Light Mode */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              type="button"
              className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              aria-label="Tema Değiştir"
              title={darkMode ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
