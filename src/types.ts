export interface CatalogItem {
  id: string;
  title: string;
  prompt: string;
  images: string[];
  sourceId: string;
  sourceName: string;
  license: string;
  licenseUrl?: string;
  catalogUrl?: string;
  description?: string;
  model: string;
  category: string;
  tags: string[];
  sourceUrl?: string;
  authorHandle?: string;
  requiresReference?: boolean;
  previewImage?: string;
  attribution?: string;
}

export type CategoryFilter = 
  | 'all' 
  | 'scenes' 
  | 'artStyles' 
  | 'portraitPhoto' 
  | 'designUi' 
  | 'productCommercial' 
  | 'gameFantasy';

export type SourceFilter = 'all' | 'Open Prompts' | 'GPT Image 2 Hub' | 'Awesome GPT-4o';
export type ModelFilter = 'all' | 'GPT Image 2' | 'GPT-4o / gpt-image-1';

export interface FilterState {
  searchQuery: string;
  category: CategoryFilter;
  source: SourceFilter;
  model: ModelFilter;
  onlyFavorites: boolean;
  selectedTag: string | null;
  noReferenceOnly: boolean;
  sortBy: 'default' | 'title' | 'promptLength';
}
