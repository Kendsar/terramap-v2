'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

const PROPERTY_TYPES = [
  { value: 'all', label: 'All Types', emoji: '🏘️' },
  { value: 'land', label: 'Land', emoji: '🌿' },
  { value: 'farm', label: 'Farm', emoji: '🌾' },
  { value: 'house', label: 'House', emoji: '🏡' },
];

export function HeroSearch() {
  const router = useRouter();
  const [propertyType, setPropertyType] = useState('all');
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [size, setSize] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (propertyType !== 'all') params.set('type', propertyType);
    if (location) params.set('location', location);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (size) params.set('size', size);
    router.push(`/map?${params.toString()}`);
  };

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&auto=format&fit=crop&q=80"
          alt="Aerial view of agricultural land"
          className="h-full w-full object-cover"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        {/* Emerald accent glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-transparent to-transparent" />
      </div>

      {/* Floating decorative orbs */}
      <div className="absolute top-1/4 left-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        {/* Badge */}
        {/* <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-4 py-2 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[13px] font-semibold text-emerald-300">Tunisia's Premier Land Marketplace</span>
        </div> */}

        {/* Headline */}
        <h1 className="mt-8 mb-4 font-outfit text-5xl font-extrabold leading-[1.1] tracking-tight text-white md:text-6xl lg:text-7xl">
          Find the right property{' '}
          <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            Connect with the right opportunity.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-300 md:text-xl">
          Explore agricultural lands, farms, and houses across Tunisia — with precision parcel maps and verified listings.
        </p>

        {/* Search Card */}
        <div className="mx-auto max-w-4xl rounded-3xl border border-white/15 bg-white/10 p-3 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.4)]">
          {/* Property Type Pills */}
          <div className="mb-3 flex gap-2 px-1">
            {PROPERTY_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setPropertyType(t.value)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all',
                  propertyType === t.value
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                )}
              >
                <span>{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* Search Fields */}
          <div className="flex flex-col gap-2 rounded-2xl bg-white dark:bg-[#15181e] p-2 md:flex-row md:items-center">
            {/* Location */}
            <div className="flex flex-1 items-center gap-3 rounded-xl px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
              <MapPin className="h-5 w-5 shrink-0 text-emerald-500" />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500 mb-0.5">Where?</div>
                <input
                  type="text"
                  placeholder="City, region or location"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full bg-transparent text-[14px] font-medium text-slate-800 dark:text-gray-100 outline-none placeholder:text-slate-400 dark:placeholder:text-gray-500"
                />
              </div>
            </div>

            <div className="hidden md:block h-10 w-px bg-slate-200 dark:bg-white/10" />

            {/* Price Range */}
            <div className="flex flex-1 items-center gap-3 rounded-xl px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
              <SlidersHorizontal className="h-5 w-5 shrink-0 text-emerald-500" />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500 mb-0.5">Price (TND)</div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                    className="w-full bg-transparent text-[14px] font-medium text-slate-800 dark:text-gray-100 outline-none placeholder:text-slate-400 dark:placeholder:text-gray-500"
                  />
                  <span className="text-slate-300 dark:text-gray-600">—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    className="w-full bg-transparent text-[14px] font-medium text-slate-800 dark:text-gray-100 outline-none placeholder:text-slate-400 dark:placeholder:text-gray-500"
                  />
                </div>
              </div>
            </div>

            <div className="hidden md:block h-10 w-px bg-slate-200 dark:bg-white/10" />

            {/* Property Size */}
            <div className="flex flex-1 items-center gap-3 rounded-xl px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
              <div className="h-5 w-5 shrink-0 flex items-center justify-center text-emerald-500 font-bold text-sm">m²</div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500 mb-0.5">Property Size</div>
                <input
                  type="text"
                  placeholder="e.g. 1,000 m²"
                  value={size}
                  onChange={e => setSize(e.target.value)}
                  className="w-full bg-transparent text-[14px] font-medium text-slate-800 dark:text-gray-100 outline-none placeholder:text-slate-400 dark:placeholder:text-gray-500"
                />
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-emerald-500 px-6 py-4 text-[15px] font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 hover:bg-emerald-600 hover:shadow-emerald-500/50 active:scale-95 md:rounded-2xl"
            >
              <Search className="h-5 w-5 stroke-[2.5px]" />
              <span className="hidden md:inline">Search</span>
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-8 flex flex-wrap justify-center gap-8">
          {[
            { value: '2,400+', label: 'Properties Listed' },
            { value: '18', label: 'Regions Covered' },
            { value: '98%', label: 'Verified Listings' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-outfit text-2xl font-extrabold text-white">{stat.value}</div>
              <div className="text-[13px] text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400 animate-bounce">
        <span className="text-[11px] font-semibold uppercase tracking-widest">Scroll</span>
        <ChevronDown className="h-4 w-4" />
      </div>
    </section>
  );
}
