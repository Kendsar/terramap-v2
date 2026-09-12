export type PropertyType = 'land' | 'farm' | 'house';

export type PropertyStatus = 'active' | 'draft' | 'sold';

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
  ownerId: string;
  status: PropertyStatus;
  /** Creation time in milliseconds since epoch. Undefined until the server timestamp resolves. */
  createdAt?: number;
}

/** Fields a client supplies when publishing a listing. */
export type NewProperty = Omit<Property, 'id' | 'createdAt'>;
