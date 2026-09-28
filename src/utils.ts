export function getImageUrl(previewImage?: string, fallbackUrl?: string): string {
  if (previewImage) {
    if (previewImage.startsWith('file:///android_asset/catalog/')) {
      return previewImage.replace('file:///android_asset/catalog/', '/catalog/');
    }
    if (previewImage.startsWith('file:///android_asset/')) {
      return previewImage.replace('file:///android_asset/', '/');
    }
    return previewImage;
  }
  return fallbackUrl || '';
}

export const CATEGORY_LABELS: Record<string, { tr: string; en: string; icon: string }> = {
  scenes: { tr: 'Sahneler & Manzara', en: 'Scenes & Urban', icon: '🏙️' },
  artStyles: { tr: 'Sanat Stilleri', en: 'Art Styles', icon: '🎨' },
  portraitPhoto: { tr: 'Portre & Fotoğraf', en: 'Portraits & Photo', icon: '📸' },
  designUi: { tr: 'Tasarım & UI/UX', en: 'Design & UI/UX', icon: '✨' },
  productCommercial: { tr: 'Ürün & Reklam', en: 'Product & Ads', icon: '🛍️' },
  gameFantasy: { tr: 'Oyun & Fantastik', en: 'Gaming & Fantasy', icon: '🎮' }
};

export const SOURCE_BADGES: Record<string, { bg: string; text: string }> = {
  'Open Prompts': { bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', text: 'Open Prompts' },
  'GPT Image 2 Hub': { bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20', text: 'GPT Image 2 Hub' },
  'Awesome GPT-4o': { bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', text: 'Awesome GPT-4o' }
};

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn('Clipboard API failed, fallback to execCommand', err);
  }

  // Fallback
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch (e) {
    console.error('Copy fallback failed', e);
    return false;
  }
}
