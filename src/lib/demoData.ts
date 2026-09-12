import { Property } from '@/types';

/**
 * Opt-in sample listings for local development and demos.
 * Enable with NEXT_PUBLIC_ENABLE_DEMO_DATA=true; never enabled implicitly,
 * so production shows real Firestore listings only.
 */
export const isDemoDataEnabled = process.env.NEXT_PUBLIC_ENABLE_DEMO_DATA === 'true';

export const DEMO_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    title: 'Sunset Valley Agricultural Land',
    type: 'land',
    price: 450000,
    size: 25.5,
    sizeUnit: 'acres',
    placement: 'West Sonoma County, CA',
    description: 'Prime agricultural land with excellent soil quality and established irrigation systems. Perfect for vineyard or orchard development.',
    ownerName: 'Robert Chen',
    contact: '(555) 123-4567',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=60',
    coordinates: [[38.4, -122.9], [38.41, -122.9], [38.41, -122.89], [38.4, -122.89]],
    features: ['Irrigation System', 'Soil Tested', 'Paved Access'],
    zoning: 'Agricultural',
    ownerId: 'demo',
    status: 'active'
  },
  {
    id: 'prop-2',
    title: 'Modern Off-Grid Cabin & Farm',
    type: 'farm',
    price: 895000,
    size: 12.0,
    sizeUnit: 'acres',
    placement: 'Bend, Oregon',
    description: 'Fully self-sustaining farm with a beautiful modern cabin. Includes solar array, well, greenhouse, and established raised beds.',
    ownerName: 'Sarah Jenkins',
    contact: '(555) 987-6543',
    image: 'https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?w=800&auto=format&fit=crop&q=60',
    coordinates: [[44.05, -121.3], [44.06, -121.3], [44.06, -121.29], [44.05, -121.29]],
    features: ['Solar Power', 'Deep Well', 'Greenhouse', 'Modern Cabin'],
    zoning: 'Mixed Use',
    ownerId: 'demo',
    status: 'active'
  },
  {
    id: 'prop-3',
    title: 'Lakeside Estate Development Plot',
    type: 'house',
    price: 1250000,
    size: 3.5,
    sizeUnit: 'acres',
    placement: 'Lake Tahoe, NV',
    description: 'Rare lakefront property ready for development. Utilities already pulled to the site. Breathtaking panoramic views.',
    ownerName: 'Tahoe Development Group',
    contact: '(555) 444-3333',
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&auto=format&fit=crop&q=60',
    coordinates: [[39.09, -119.9], [39.1, -119.9], [39.1, -119.89], [39.09, -119.89]],
    features: ['Lakefront', 'Utilities Ready', 'Approved Plans'],
    zoning: 'Residential',
    ownerId: 'demo',
    status: 'active'
  }
];
