import React, { useState } from 'react';
import { 
  Heart, 
  Copy, 
  Check, 
  ExternalLink, 
  Image as ImageIcon,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { CatalogItem } from '../types';
import { getImageUrl, CATEGORY_LABELS, SOURCE_BADGES, copyToClipboard } from '../utils';

interface PromptCardProps {
  item: CatalogItem;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onSelect: (item: CatalogItem) => void;
  onSelectTag: (tag: string) => void;
}

export const PromptCard: React.FC<PromptCardProps> = ({
  item,
  isFavorite,
  onToggleFavorite,
  onSelect,
  onSelectTag
}) => {
  const [imageError, setImageError] = useState(false);
  const [copied, setCopied] = useState(false);

  // If local preview fails, fallback to remote images[0]
  const imageSrc = imageError && item.images && item.images.length > 0
    ? item.images[0]
    : getImageUrl(item.previewImage, item.images?.[0]);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyToClipboard(item.prompt);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(item.id);
  };

  const categoryInfo = CATEGORY_LABELS[item.category];
  const sourceBadge = SOURCE_BADGES[item.sourceName];

  return (
    <div 
      onClick={() => onSelect(item)}
      className="group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500/50 transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
    >
      {/* Image container */}
      <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={item.title}
            loading="lazy"
            onError={() => {
              if (!imageError) setImageError(true);
            }}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
            <ImageIcon className="w-10 h-10 mb-1 opacity-50" />
            <span className="text-xs">Önizleme Yok</span>
          </div>
        )}

        {/* Hover overlay hint */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3 pointer-events-none">
          <span className="text-xs font-medium text-white flex items-center space-x-1 drop-shadow">
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Detayları Aç</span>
          </span>
          <span className="text-xs font-semibold text-white/90 drop-shadow">
            {item.model}
          </span>
        </div>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {/* Category pill */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-medium bg-black/50 backdrop-blur-md text-white border border-white/10 shadow-sm">
            <span>{categoryInfo?.icon || '✨'}</span>
            <span>{categoryInfo?.tr || item.category}</span>
          </div>

          {/* Favorite button (clickable) */}
          <button
            onClick={handleFavoriteClick}
            type="button"
            className={`pointer-events-auto p-2 rounded-xl backdrop-blur-md transition shadow-md active:scale-90 ${
              isFavorite
                ? 'bg-rose-500 text-white shadow-rose-500/30'
                : 'bg-black/40 text-white/90 hover:bg-black/60 hover:text-white border border-white/20'
            }`}
            aria-label={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
            title={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Source and author info */}
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className={`px-2 py-0.5 rounded-lg border font-medium text-[11px] ${sourceBadge?.bg || 'bg-slate-100 text-slate-600'}`}>
              {item.sourceName}
            </span>
            {item.authorHandle && (
              <span className="text-slate-400 dark:text-slate-500 text-[11px] truncate max-w-[130px]">
                {item.authorHandle}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {item.title}
          </h3>

          {/* Prompt excerpt */}
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-mono bg-slate-50 dark:bg-slate-950/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800/80">
            {item.prompt}
          </p>
        </div>

        {/* Tags and Copy Button */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
          {/* First 2 tags */}
          <div className="flex flex-wrap gap-1 overflow-hidden max-h-6">
            {item.tags?.slice(0, 2).map((tag) => (
              <span
                key={tag}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTag(tag);
                }}
                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 transition"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Copy Prompt Button */}
          <button
            onClick={handleCopy}
            type="button"
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 cursor-pointer shrink-0 ${
              copied
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600'
            }`}
            title="Promptu Kopyala"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Kopyalandı!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Kopyala</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
