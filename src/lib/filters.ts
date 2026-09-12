import { Property, PropertyType } from '@/types';

export interface PropertyFilters {
  /** Free-text query matched against title and placement. */
  location: string;
  type: PropertyType | 'all';
  minPrice: number | null;
  maxPrice: number | null;
  /** Minimum listing size, expressed in the listing's own unit. */
  size: number | null;
  /** Currently only 'new' — listings created within NEW_LISTING_WINDOW_DAYS. */
  filter: string | null;
  /** Matched against the listing's features. */
  feature: string | null;
}

export const NEW_LISTING_WINDOW_DAYS = 30;

const PROPERTY_TYPES: PropertyType[] = ['land', 'farm', 'house'];

export const EMPTY_FILTERS: PropertyFilters = {
  location: '',
  type: 'all',
  minPrice: null,
  maxPrice: null,
  size: null,
  filter: null,
  feature: null,
};

function parseNumber(value: string | null): number | null {
  if (!value) return null;
  // Tolerates values typed with separators or units, e.g. "1,000 m²"
  const parsed = Number(value.replace(/[^\d.]/g, ''));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function parseFilters(params: URLSearchParams): PropertyFilters {
  const type = params.get('type');
  return {
    location: params.get('location') ?? '',
    type: PROPERTY_TYPES.includes(type as PropertyType) ? (type as PropertyType) : 'all',
    minPrice: parseNumber(params.get('minPrice')),
    maxPrice: parseNumber(params.get('maxPrice')),
    size: parseNumber(params.get('size')),
    filter: params.get('filter'),
    feature: params.get('feature'),
  };
}

/** Serializes filters back to a query string, omitting empty values. */
export function filtersToSearchParams(filters: PropertyFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.location) params.set('location', filters.location);
  if (filters.type !== 'all') params.set('type', filters.type);
  if (filters.minPrice !== null) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice !== null) params.set('maxPrice', String(filters.maxPrice));
  if (filters.size !== null) params.set('size', String(filters.size));
  if (filters.filter) params.set('filter', filters.filter);
  if (filters.feature) params.set('feature', filters.feature);
  return params;
}

export function hasActiveFilters(filters: PropertyFilters): boolean {
  return filtersToSearchParams(filters).toString().length > 0;
}

export function applyFilters(properties: Property[], filters: PropertyFilters): Property[] {
  const search = filters.location.trim().toLowerCase();
  const feature = filters.feature?.trim().toLowerCase();
  const newerThan = Date.now() - NEW_LISTING_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  return properties.filter((property) => {
    if (filters.type !== 'all' && property.type !== filters.type) return false;

    if (
      search &&
      !property.title.toLowerCase().includes(search) &&
      !property.placement.toLowerCase().includes(search)
    ) {
      return false;
    }

    if (filters.minPrice !== null && property.price < filters.minPrice) return false;
    if (filters.maxPrice !== null && property.price > filters.maxPrice) return false;
    if (filters.size !== null && property.size < filters.size) return false;

    if (filters.filter === 'new' && (property.createdAt ?? 0) < newerThan) return false;

    if (feature) {
      const matches = property.features?.some((f) => f.toLowerCase().includes(feature));
      if (!matches) return false;
    }

    return true;
  });
}
