'use client';

import { useRouter } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { REGIONS } from '@/lib/landingData';

export function ExploreRegions() {
  const router = useRouter();

  return (
    <section className="py-20 bg-slate-50 dark:bg-[#0b0d10]">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1">
            <MapPin className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-[12px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">By Region</span>
          </div>
          <h2 className="font-outfit text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
            Explore properties by region
          </h2>
          <p className="mt-3 text-slate-500 dark:text-gray-400 max-w-xl mx-auto">
            From coastal towns to the capital — find land and property in Tunisia's most vibrant regions.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
          {REGIONS.map((region, i) => (
            <button
              key={region.id}
              onClick={() => router.push(`/map?location=${region.name}`)}
              className={`group relative overflow-hidden rounded-3xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-emerald-500/10 ${
                i === 0 ? 'sm:col-span-2 lg:col-span-1' : ''
              }`}
            >
              {/* Image */}
              <div className="relative overflow-hidden" style={{ height: i < 2 ? '280px' : '220px' }}>
                <img
                  src={region.image}
                  alt={region.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                {/* Tag pill */}
                <div className="absolute top-4 left-4 rounded-full border border-white/20 bg-white/15 backdrop-blur-sm px-3 py-1 text-[11px] font-bold text-white">
                  {region.tag}
                </div>
              </div>

              {/* Label overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="flex items-end justify-between">
                  <div>
                    <h3 className="font-outfit text-[20px] font-extrabold text-white leading-none mb-1">
                      {region.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[13px] text-emerald-300 font-semibold">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {region.propertyCount} properties
                    </div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/0 border border-white/20 text-white transition-all duration-300 group-hover:bg-emerald-500 group-hover:border-emerald-500 group-hover:scale-110">
                    <MapPin className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
