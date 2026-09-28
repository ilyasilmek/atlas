import React from 'react';
import { SearchX, Heart, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  isFavoritesView: boolean;
  onReset: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  isFavoritesView,
  onReset
}) => {
  return (
    <div className="py-20 px-4 text-center flex flex-col items-center justify-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4 shadow-inner">
        {isFavoritesView ? (
          <Heart className="w-8 h-8 text-rose-400 stroke-1" />
        ) : (
          <SearchX className="w-8 h-8 stroke-1" />
        )}
      </div>

      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
        {isFavoritesView ? 'Henüz Favori Eklenmemiş' : 'Sonuç Bulunamadı'}
      </h3>

      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
        {isFavoritesView
          ? 'Koleksiyondaki prompt kartlarında bulunan kalp ikonuna basarak beğendiğiniz promptları buraya kaydedebilirsiniz.'
          : 'Arama kriterlerinize veya seçilen filtrelere uyan prompt bulunamadı. Filtreleri temizleyip tekrar deneyin.'}
      </p>

      <button
        onClick={onReset}
        type="button"
        className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-md shadow-blue-500/25 flex items-center space-x-2 cursor-pointer"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Filtreleri Temizle</span>
      </button>
    </div>
  );
};
