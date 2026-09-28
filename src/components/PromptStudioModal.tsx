import React, { useState } from 'react';
import { 
  X, 
  Wand2, 
  Copy, 
  Check, 
  Sparkles, 
  Sliders, 
  RotateCcw,
  BookmarkPlus
} from 'lucide-react';
import { copyToClipboard } from '../utils';

interface PromptStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

const STYLE_PRESETS = [
  { label: '🎬 Sinematik Işık', text: 'cinematic lighting, shallow depth of field, 35mm photograph, hyper-detailed' },
  { label: '📸 Stüdyo Portre', text: 'studio portrait photography, soft rim lighting, sharp focus, 85mm f/1.4' },
  { label: '🎨 Suluboya Sanatı', text: 'delicate watercolor illustration, ink outlines, soft pastel gradients, artistic paper texture' },
  { label: '🌃 Siberpunk Neon', text: 'cyberpunk aesthetic, vibrant neon reflections, wet asphalt, futuristic atmosphere' },
  { label: '🧊 3D Render', text: '3D clay render, minimalist isometric view, soft diffused lighting, octane render, smooth textures' },
  { label: '📐 Minimalist Reklam', text: 'minimalist clean commercial product photography, white background, soft shadow' },
  { label: '🌿 Doğa & Makro', text: 'extreme macro photography, morning dew drops, natural bokeh, golden hour sunlight' },
  { label: '👾 Retro Piksel / Anime', text: '90s anime aesthetic, vibrant cel-shaded color palette, hand-drawn look' },
];

const ASPECT_RATIOS = [
  '--ar 16:9',
  '--ar 1:1',
  '--ar 9:16',
  '--ar 4:3',
  '--ar 21:9'
];

export const PromptStudioModal: React.FC<PromptStudioModalProps> = ({
  isOpen,
  onClose,
  initialPrompt = ''
}) => {
  const [promptText, setPromptText] = useState(initialPrompt || '');
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (initialPrompt) {
      setPromptText(initialPrompt);
    }
  }, [initialPrompt]);

  if (!isOpen) return null;

  const appendModifier = (modifier: string) => {
    setPromptText(prev => {
      const trimmed = prev.trim();
      if (!trimmed) return modifier;
      if (trimmed.endsWith(',')) return `${trimmed} ${modifier}`;
      return `${trimmed}, ${modifier}`;
    });
  };

  const handleCopy = async () => {
    if (!promptText.trim()) return;
    const success = await copyToClipboard(promptText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Prompt Stüdyosu & Oluşturucu
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Promptu düzenleyin, hazır stil ve oran etiketleri ekleyin
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Text Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Prompt Metni:</span>
              <span className="font-mono text-slate-400 text-[11px]">
                {promptText.length} karakter • {promptText.split(/\s+/).filter(Boolean).length} kelime
              </span>
            </div>
            <textarea
              rows={6}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Promptunuzu buraya yazın veya koleksiyondan bir prompt düzenleyin..."
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition leading-relaxed resize-y"
            />
          </div>

          {/* Quick Aspect Ratio selectors */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center space-x-1.5">
              <span>En-Boy Oranı Ekle (--ar):</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => appendModifier(ratio)}
                  className="px-3 py-1.5 rounded-xl text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white transition cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Style Presets */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Tek Tıkla Stil ve Işık Modifikatörleri:</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STYLE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => appendModifier(preset.text)}
                  className="p-2.5 rounded-xl text-left bg-slate-50 dark:bg-slate-950/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition cursor-pointer group"
                >
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {preset.label}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                    {preset.text}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              onClick={() => setPromptText('')}
              type="button"
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Temizle</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={onClose}
                type="button"
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
              >
                Kapat
              </button>

              <button
                onClick={handleCopy}
                disabled={!promptText.trim()}
                type="button"
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition shadow-md ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : promptText.trim()
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'
                    : 'bg-slate-300 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Panoya Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Hazır Promptu Kopyala</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
