import React, { useState, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Heart, 
  ExternalLink, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Info,
  Maximize2,
  Wand2,
  FileText
} from 'lucide-react';
import { CatalogItem } from '../types';
import { getImageUrl, CATEGORY_LABELS, SOURCE_BADGES, copyToClipboard } from '../utils';

interface PromptDetailModalProps {
  item: CatalogItem | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onSelectTag: (tag: string) => void;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  onOpenInStudio: (prompt: string) => void;
  similarItems: CatalogItem[];
  onSelectSimilar: (item: CatalogItem) => void;
}

export const PromptDetailModal: React.FC<PromptDetailModalProps> = ({
  item,
  onClose,
  isFavorite,
  onToggleFavorite,
  onSelectTag,
  onNavigatePrev,
  onNavigateNext,
  onOpenInStudio,
  similarItems,
  onSelectSimilar
}) => {
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [useOriginalImage, setUseOriginalImage] = useState(false);

  useEffect(() => {
    setImageError(false);
    setUseOriginalImage(false);
  }, [item?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onNavigatePrev) onNavigatePrev();
      if (e.key === 'ArrowRight' && onNavigateNext) onNavigateNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNavigatePrev, onNavigateNext]);

  if (!item) return null;

  const previewSrc = getImageUrl(item.previewImage, item.images?.[0]);
  const originalSrc = item.images && item.images.length > 0 ? item.images[0] : previewSrc;
  const currentImageSrc = useOriginalImage || imageError ? originalSrc : previewSrc;

  const handleCopy = async () => {
    const success = await copyToClipboard(item.prompt);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const categoryInfo = CATEGORY_LABELS[item.category];
  const sourceBadge = SOURCE_BADGES[item.sourceName];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      {/* Click outside to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40">
          <div className="flex items-center space-x-2">
            <span className={`px-2.5 py-1 rounded-xl text-xs font-semibold border ${sourceBadge?.bg || 'bg-slate-100'}`}>
              {item.sourceName}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {item.model}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* Prev / Next buttons */}
            {onNavigatePrev && (
              <button
                onClick={onNavigatePrev}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                title="Önceki prompt (Sol Ok)"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            {onNavigateNext && (
              <button
                onClick={onNavigateNext}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                title="Sonraki prompt (Sağ Ok)"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {/* Favorite toggle */}
            <button
              onClick={() => onToggleFavorite(item.id)}
              className={`p-2 rounded-xl border transition ${
                isFavorite
                  ? 'bg-rose-500 text-white border-rose-500'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-rose-500'
              }`}
              title={isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
              title="Kapat (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Column */}
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-square sm:aspect-auto sm:h-96 flex items-center justify-center border border-slate-200 dark:border-slate-800 group">
                <img
                  src={currentImageSrc}
                  alt={item.title}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-contain"
                />

                {/* Image resolution toggle */}
                {item.images && item.images.length > 0 && (
                  <button
                    onClick={() => setUseOriginalImage(!useOriginalImage)}
                    type="button"
                    className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl text-xs font-semibold bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 transition flex items-center space-x-1.5"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>{useOriginalImage ? 'Önizleme Çözünürlüğü' : 'Orijinal 4K / Web'}</span>
                  </button>
                )}
              </div>

              {/* Attribution / notes */}
              {item.attribution && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 italic bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                  ℹ️ {item.attribution}
                </p>
              )}
            </div>

            {/* Information & Prompt Column */}
            <div className="flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {item.title}
                  </h2>
                  {item.description && (
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Prompt block */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center space-x-1.5">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span>Tam Prompt Metni:</span>
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {item.prompt.length} karakter • {item.prompt.split(/\s+/).filter(Boolean).length} kelime
                    </span>
                  </div>

                  <div className="relative group/box">
                    <pre className="w-full max-h-56 overflow-y-auto p-4 rounded-2xl bg-slate-900 text-slate-100 dark:bg-slate-950 text-xs sm:text-sm font-mono whitespace-pre-wrap break-words leading-relaxed border border-slate-700/60 selection:bg-blue-600 selection:text-white">
                      {item.prompt}
                    </pre>

                    {/* Copy action on top right */}
                    <button
                      onClick={handleCopy}
                      type="button"
                      className="absolute top-2.5 right-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition flex items-center space-x-1.5"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Kopyalandı!' : 'Kopyala'}</span>
                    </button>
                  </div>
                </div>

                {/* Action Buttons: Copy Large & Studio */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={handleCopy}
                    type="button"
                    className={`w-full py-2.5 px-4 rounded-2xl font-semibold text-sm transition shadow-md flex items-center justify-center space-x-2 active:scale-95 cursor-pointer ${
                      copied
                        ? 'bg-emerald-600 text-white shadow-emerald-600/25'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Prompt Panoya Kopyalandı</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Promptu Kopyala</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      onOpenInStudio(item.prompt);
                      onClose();
                    }}
                    type="button"
                    className="w-full py-2.5 px-4 rounded-2xl font-semibold text-sm bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>Stüdyoda Düzenle</span>
                  </button>
                </div>

                {/* Metadata Details Table */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50/60 dark:bg-slate-950/40 text-xs space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Kategori</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {categoryInfo?.icon} {categoryInfo?.tr || item.category}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Model</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {item.model}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Yazar / Kaynak</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">
                        {item.authorHandle || item.sourceName}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Lisans</span>
                      {item.licenseUrl ? (
                        <a
                          href={item.licenseUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center space-x-1"
                        >
                          <span>{item.license}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="font-medium text-slate-800 dark:text-slate-200">{item.license}</span>
                      )}
                    </div>
                  </div>

                  {item.sourceUrl && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center space-x-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Orijinal Gönderi / Kaynak Bağlantısı</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Tags list */}
                {item.tags && item.tags.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Etiketler:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => {
                            onSelectTag(tag);
                            onClose();
                          }}
                          className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition cursor-pointer"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Similar Prompts section */}
          {similarItems.length > 0 && (
            <div className="pt-5 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span>Benzer Koleksiyon Promptları</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {similarItems.map((similar) => {
                  const img = getImageUrl(similar.previewImage, similar.images?.[0]);
                  return (
                    <div
                      key={similar.id}
                      onClick={() => onSelectSimilar(similar)}
                      className="group/sim cursor-pointer rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-blue-500 transition p-1.5"
                    >
                      <div className="aspect-[4/3] rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 mb-1.5">
                        <img
                          src={img}
                          alt={similar.title}
                          className="w-full h-full object-cover group-hover/sim:scale-105 transition-transform"
                          loading="lazy"
                        />
                      </div>
                      <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                        {similar.title}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
