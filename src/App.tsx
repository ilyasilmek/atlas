import React, { useState, useEffect, useMemo } from 'react';
import { CatalogItem, FilterState, CategoryFilter, SourceFilter, ModelFilter } from './types';
import { Header } from './components/Header';
import { FiltersBar } from './components/FiltersBar';
import { PromptCard } from './components/PromptCard';
import { PromptDetailModal } from './components/PromptDetailModal';
import { PromptStudioModal } from './components/PromptStudioModal';
import { EmptyState } from './components/EmptyState';
import { Loader2, ArrowUp, Sparkles, BookOpen } from 'lucide-react';

const INITIAL_FILTERS: FilterState = {
  searchQuery: '',
  category: 'all',
  source: 'all',
  model: 'all',
  onlyFavorites: false,
  selectedTag: null,
  noReferenceOnly: false,
  sortBy: 'default'
};

const PAGE_SIZE = 24;

export const App: React.FC = () => {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  // Favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('prompt_atlas_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Dark mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('prompt_atlas_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Modals & Navigation
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [studioPrompt, setStudioPrompt] = useState('');
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

  // Scroll to top button visibility
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('prompt_atlas_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('prompt_atlas_theme', 'light');
    }
  }, [darkMode]);

  // Persist favorites
  useEffect(() => {
    try {
      localStorage.setItem('prompt_atlas_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.warn('Failed to save favorites to localStorage', e);
    }
  }, [favorites]);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch catalog.json
  useEffect(() => {
    const loadCatalog = async () => {
      try {
        setLoading(true);
        const res = await fetch('/catalog/catalog.json');
        if (!res.ok) {
          throw new Error(`Katalog yüklenemedi: HTTP ${res.status}`);
        }
        const data = await res.json();
        setItems(data.items || []);
        setError(null);
      } catch (err: any) {
        console.error('Catalog load error', err);
        setError('Katalog verileri yüklenirken bir sorun oluştu.');
      } finally {
        setLoading(false);
      }
    };

    loadCatalog();
  }, []);

  // Unique sources and models
  const { sources, models } = useMemo(() => {
    const srcSet = new Set<string>();
    const mdlSet = new Set<string>();
    for (const item of items) {
      if (item.sourceName) srcSet.add(item.sourceName);
      if (item.model) mdlSet.add(item.model);
    }
    return {
      sources: Array.from(srcSet),
      models: Array.from(mdlSet)
    };
  }, [items]);

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    const query = filters.searchQuery.trim().toLowerCase();

    return items
      .filter((item) => {
        // Favorites filter
        if (filters.onlyFavorites && !favorites.includes(item.id)) {
          return false;
        }

        // Category filter
        if (filters.category !== 'all' && item.category !== filters.category) {
          return false;
        }

        // Source filter
        if (filters.source !== 'all' && item.sourceName !== filters.source) {
          return false;
        }

        // Model filter
        if (filters.model !== 'all' && item.model !== filters.model) {
          return false;
        }

        // Selected tag
        if (filters.selectedTag && !item.tags?.includes(filters.selectedTag)) {
          return false;
        }

        // No reference required filter
        if (filters.noReferenceOnly && item.requiresReference) {
          return false;
        }

        // Text search query
        if (query) {
          const inTitle = item.title?.toLowerCase().includes(query);
          const inPrompt = item.prompt?.toLowerCase().includes(query);
          const inAuthor = item.authorHandle?.toLowerCase().includes(query);
          const inTags = item.tags?.some((t) => t.toLowerCase().includes(query));
          const inCategory = item.category?.toLowerCase().includes(query);
          if (!inTitle && !inPrompt && !inAuthor && !inTags && !inCategory) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        if (filters.sortBy === 'promptLength') {
          return b.prompt.length - a.prompt.length;
        }
        return 0; // Default catalog order
      });
  }, [items, filters, favorites]);

  // Reset pagination when filters change
  useEffect(() => {
    setDisplayCount(PAGE_SIZE);
  }, [filters]);

  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, displayCount);
  }, [filteredItems, displayCount]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  // Modal navigation indices
  const currentItemIndex = useMemo(() => {
    if (!selectedItem) return -1;
    return filteredItems.findIndex((it) => it.id === selectedItem.id);
  }, [selectedItem, filteredItems]);

  const handleNavigatePrev = () => {
    if (currentItemIndex > 0) {
      setSelectedItem(filteredItems[currentItemIndex - 1]);
    }
  };

  const handleNavigateNext = () => {
    if (currentItemIndex >= 0 && currentItemIndex < filteredItems.length - 1) {
      setSelectedItem(filteredItems[currentItemIndex + 1]);
    }
  };

  // Similar items for currently selected modal item
  const similarItems = useMemo(() => {
    if (!selectedItem) return [];
    return items
      .filter((it) => it.id !== selectedItem.id && it.category === selectedItem.category)
      .slice(0, 4);
  }, [selectedItem, items]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        favoritesCount={favorites.length}
        onlyFavorites={filters.onlyFavorites}
        setOnlyFavorites={(val) => setFilters((prev) => ({ ...prev, onlyFavorites: val }))}
        onOpenStudio={() => {
          setStudioPrompt('');
          setIsStudioOpen(true);
        }}
        totalCount={items.length}
      />

      {/* Hero Banner (Only when not filtering heavily) */}
      {!filters.searchQuery && filters.category === 'all' && !filters.onlyFavorites && (
        <div className="bg-gradient-to-b from-blue-50/50 via-indigo-50/30 to-transparent dark:from-blue-950/20 dark:via-slate-900/40 dark:to-transparent border-b border-slate-200/60 dark:border-slate-800/60 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs font-semibold mb-2.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>stitchilyas Özel Koleksiyonu</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Yapay Zeka İçin İlham Verici Promptlar
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Open Prompts, GPT Image 2 Hub ve Awesome GPT-4o koleksiyonlarından derlenen 1200+ gerçek görsel ve prompt. Kopyalayın, uyarlayın ve kendi tasarımlarınızı oluşturun.
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 text-xs">
              <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                <div className="text-base font-bold text-blue-600 dark:text-blue-400">1221</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Prompt</div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                <div className="text-base font-bold text-indigo-600 dark:text-indigo-400">3</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Kaynak</div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">%100</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Çevrimdışı</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <FiltersBar
        filters={filters}
        setFilters={setFilters}
        totalMatches={filteredItems.length}
        sources={sources}
        models={models}
        onReset={handleResetFilters}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Katalog yükleniyor, lütfen bekleyin...
            </p>
          </div>
        ) : error ? (
          <div className="py-20 text-center max-w-md mx-auto space-y-3">
            <p className="text-sm text-red-500">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
            >
              Tekrar Dene
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            isFavoritesView={filters.onlyFavorites}
            onReset={handleResetFilters}
          />
        ) : (
          <div className="space-y-8">
            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {visibleItems.map((item) => (
                <PromptCard
                  key={item.id}
                  item={item}
                  isFavorite={favorites.includes(item.id)}
                  onToggleFavorite={toggleFavorite}
                  onSelect={(selected) => setSelectedItem(selected)}
                  onSelectTag={(tag) => setFilters((prev) => ({ ...prev, selectedTag: tag }))}
                />
              ))}
            </div>

            {/* Pagination / Load More */}
            {visibleItems.length < filteredItems.length && (
              <div className="pt-6 pb-12 flex flex-col items-center justify-center space-y-2">
                <button
                  onClick={() => setDisplayCount((prev) => prev + PAGE_SIZE)}
                  type="button"
                  className="px-7 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg transition active:scale-95 cursor-pointer flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span>Daha Fazla Prompt Göster ({visibleItems.length} / {filteredItems.length})</span>
                </button>
                <p className="text-xs text-slate-400">
                  Kalan {filteredItems.length - visibleItems.length} prompt
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Scroll to Top button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 p-3 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition active:scale-90 z-20 cursor-pointer"
          title="Yukarı Çık"
          aria-label="Yukarı Çık"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">Prompt Atlas</span>
            <span>•</span>
            <span className="font-mono text-blue-600 dark:text-blue-400">stitchilyas</span>
            <span>•</span>
            <span>v0.2.0</span>
          </div>

          <p className="text-[11px] text-slate-400">
            Open Prompts, GPT Image 2 Hub & Awesome GPT-4o koleksiyonlarından derlenmiştir. Lisanslar ve telif hakları ilgili kaynaklara aittir.
          </p>
        </div>
      </footer>

      {/* Detail Modal */}
      <PromptDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        isFavorite={selectedItem ? favorites.includes(selectedItem.id) : false}
        onToggleFavorite={toggleFavorite}
        onSelectTag={(tag) => setFilters((prev) => ({ ...prev, selectedTag: tag }))}
        onNavigatePrev={currentItemIndex > 0 ? handleNavigatePrev : undefined}
        onNavigateNext={currentItemIndex < filteredItems.length - 1 ? handleNavigateNext : undefined}
        onOpenInStudio={(prompt) => {
          setStudioPrompt(prompt);
          setIsStudioOpen(true);
        }}
        similarItems={similarItems}
        onSelectSimilar={(sim) => setSelectedItem(sim)}
      />

      {/* Prompt Studio Modal */}
      <PromptStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        initialPrompt={studioPrompt}
      />
    </div>
  );
};
export default App;
