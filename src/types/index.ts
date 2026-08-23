export type PropertyType = 'land' | 'farm' | 'house';

export interface Property {
  id: string;
  title: string;
  type: PropertyType;
  price: number;
  size: number;
  sizeUnit: 'acres' | 'sqft' | 'hectares' | 'sqm';
  placement: string;
  description: string;
  ownerName: string;
  contact: string;
  image: string;
  coordinates: number[][]; // [lat, lng][]
  features?: string[];
  zoning?: string;
}
