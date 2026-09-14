import { Property } from '@/types';

export const MOCK_PROPERTIES: Property[] = [
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
    zoning: 'Agricultural'
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
    zoning: 'Mixed Use'
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
    zoning: 'Residential'
  },
  {
    id: "prop-1789056261895",
    title: "Terrain a Kelibia la blanche",
    type: "land",
    price: 120000,
    size: 100,
    sizeUnit: "acres",
    placement: "Kelibia la blanche",
    description: "El belge land",
    ownerName: "Skander Jenhani",
    contact: "skander.jenhani@gmail.com",
    image: "https://images.unsplash.com/photo-1787127409176-f708062e051b?q=80&w=736&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    coordinates: [
      [
        36.85354873051317,
        11.12447261810303
      ],
      [
        36.85327838331946,
        11.124236583709717
      ],
      [
        36.853141063743784,
        11.124579906463625
      ],
      [
        36.853364207928955,
        11.124789118766786
      ]
    ],
    features: [],
    zoning: "Unspecified"
  }
];
