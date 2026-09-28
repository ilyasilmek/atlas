import React from 'react';
import { 
  Search, 
  X, 
  Filter, 
  Layers, 
  Cpu, 
  RotateCcw,
  Sparkles,
  Tag
} from 'lucide-react';
import { FilterState, CategoryFilter, SourceFilter, ModelFilter } from '../types';
import { CATEGORY_LABELS } from '../utils';

interface FiltersBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalMatches: number;
  sources: string[];
  models: string[];
  onReset: () => void;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  filters,
  setFilters,
  totalMatches,
  sources,
  models,
  onReset
}) => {
  const hasActiveFilters = 
    filters.searchQuery !== '' || 
    filters.category !== 'all' || 
    filters.source !== 'all' || 
    filters.model !== 'all' || 
    filters.selectedTag !== null ||
    filters.noReferenceOnly;

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-4 px-4 sm:px-6 lg:px-8 space-y-3.5 transition-colors">
      <div className="max-w-7xl mx-auto space-y-3.5">
        {/* Top search & dropdowns row */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Prompt, başlık, etiket veya yazar ara... (Örn: cyberpunk, portrait, watercolor)"
              className="w-full pl-11 pr-10 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                aria-label="Aramayı temizle"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Source & Model dropdowns */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            {/* Source Selector */}
            <div className="relative flex-1 sm:flex-none">
              <select
                value={filters.source}
                onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value as SourceFilter }))}
                className="w-full sm:w-auto px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">📚 Tüm Kaynaklar</option>
                {sources.map(src => (
                  <option key={src} value={src}>{src}</option>
                ))}
              </select>
            </div>

            {/* Model Selector */}
            <div className="relative flex-1 sm:flex-none">
              <select
                value={filters.model}
                onChange={(e) => setFilters(prev => ({ ...prev, model: e.target.value as ModelFilter }))}
                className="w-full sm:w-auto px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">⚡ Tüm Modeller</option>
                {models.map(mdl => (
                  <option key={mdl} value={mdl}>{mdl}</option>
                ))}
              </select>
            </div>

            {/* Sort Selector */}
            <div className="relative flex-1 sm:flex-none">
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="w-full sm:w-auto px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="default">Varsayılan Sıralama</option>
                <option value="title">İsme Göre (A-Z)</option>
                <option value="promptLength">Prompt Uzunluğuna Göre</option>
              </select>
            </div>

            {/* Reset Filter Button */}
            {hasActiveFilters && (
              <button
                onClick={onReset}
                type="button"
                className="px-3 py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/60 dark:hover:text-red-400 transition text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                title="Tüm filtreleri sıfırla"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sıfırla</span>
              </button>
            )}
          </div>
        </div>

        {/* Categories Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
          <button
            onClick={() => setFilters(prev => ({ ...prev, category: 'all' }))}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer ${
              filters.category === 'all'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-transparent'
            }`}
          >
            🔥 Tümü
          </button>
          {Object.entries(CATEGORY_LABELS).map(([catKey, info]) => {
            const isSelected = filters.category === catKey;
            return (
              <button
                key={catKey}
                onClick={() => setFilters(prev => ({ ...prev, category: catKey as CategoryFilter }))}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{info.icon}</span>
                <span>{info.tr}</span>
              </button>
            );
          })}
        </div>

        {/* Selected tag banner or result count */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
          <div className="flex items-center space-x-2">
            <span>
              Toplam <strong className="text-slate-900 dark:text-slate-100 font-semibold">{totalMatches}</strong> prompt bulundu
            </span>

            {filters.selectedTag && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs">
                <Tag className="w-3 h-3" />
                <span>Etiket: #{filters.selectedTag}</span>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, selectedTag: null }))}
                  className="ml-1 hover:text-indigo-900 dark:hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          {/* Reference filter toggle */}
          <label className="inline-flex items-center space-x-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.noReferenceOnly}
              onChange={(e) => setFilters(prev => ({ ...prev, noReferenceOnly: e.target.checked }))}
              className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
            />
            <span className="text-xs">Sadece Referans Görsel İstemeyenler</span>
          </label>
        </div>
      </div>
    </div>
  );
};
