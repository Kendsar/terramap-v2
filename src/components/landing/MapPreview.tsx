'use client';

import Link from 'next/link';
import { Map, Layers, ArrowRight, CheckCircle2 } from 'lucide-react';

const DIFFERENTIATORS = [
  'View actual parcel polygon boundaries on the map',
  'Satellite + street view for every listing',
  'Click markers to instantly see property details',
  'Draw your own search boundary on the map',
];

export function MapPreview() {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-[#0d0f14] py-24">
      {/* Background glow */}
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left — Text */}
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1">
              <Layers className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-[12px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Interactive Map</span>
            </div>

            <h2 className="mb-4 font-outfit text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
              TerraLink's biggest{' '}
              <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
                differentiator
              </span>
            </h2>

            <p className="mb-8 text-lg text-slate-500 dark:text-gray-400 leading-relaxed">
              Unlike other marketplaces, TerraLink displays the actual land parcel on a satellite map — so you see exactly what you're buying before you visit.
            </p>

            <ul className="mb-8 flex flex-col gap-3">
              {DIFFERENTIATORS.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                  <span className="text-[15px] text-slate-700 dark:text-gray-300">{item}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/map"
              className="group inline-flex items-center gap-3 rounded-2xl bg-emerald-500 px-7 py-4 text-[15px] font-bold text-white shadow-xl shadow-emerald-500/30 transition-all hover:bg-emerald-600 hover:shadow-emerald-500/50 hover:scale-105 active:scale-95"
            >
              <Map className="h-5 w-5" />
              Explore the Interactive Map
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Right — Map Preview mockup */}
          <div className="relative">
            {/* Map window chrome */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl shadow-slate-900/20 dark:shadow-black/60">
              {/* Window title bar */}
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#1c212a] px-4 py-3 border-b border-slate-200 dark:border-white/10">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                <div className="ml-3 flex-1 rounded-lg bg-white dark:bg-[#15181e] px-3 py-1.5 text-[12px] font-medium text-slate-500 dark:text-gray-500">
                  terralink.tn/map
                </div>
              </div>

              {/* Map image */}
              <div className="relative h-80 bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=900&auto=format&fit=crop&q=80"
                  alt="Satellite map view of land parcels"
                  className="h-full w-full object-cover opacity-80"
                />

                {/* Overlay UI elements */}
                {/* Parcel polygon SVG overlay */}
                <svg
                  className="absolute inset-0 h-full w-full pointer-events-none"
                  viewBox="0 0 900 320"
                  preserveAspectRatio="none"
                >
                  <polygon
                    points="320,80 520,70 560,180 480,240 300,220 280,140"
                    fill="rgba(16,185,129,0.2)"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeDasharray="8 4"
                  />
                  <circle cx="430" cy="155" r="8" fill="#10b981" className="animate-ping" opacity="0.6" />
                  <circle cx="430" cy="155" r="8" fill="#10b981" />
                </svg>

                {/* Property info popup */}
                <div className="absolute top-4 right-4 rounded-2xl border border-white/20 bg-white/90 dark:bg-[#15181e]/90 backdrop-blur-md p-3 shadow-xl w-52">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">LAND</span>
                    <span className="text-[11px] text-slate-500 dark:text-gray-500">7,600 m²</span>
                  </div>
                  <div className="font-outfit text-[16px] font-bold text-slate-900 dark:text-white">120,000 TND</div>
                  <div className="text-[12px] text-slate-500 dark:text-gray-400">Agricultural Land · Kelibia</div>
                  <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Parcel boundary shown
                  </div>
                </div>

                {/* Bottom controls */}
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 dark:bg-[#15181e]/90 backdrop-blur-sm text-emerald-600 border border-white/30 shadow-lg">
                    <Map className="h-4 w-4" />
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 dark:bg-[#15181e]/90 backdrop-blur-sm text-slate-600 dark:text-gray-300 border border-white/30 shadow-lg">
                    <Layers className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating stat cards */}
            <div className="absolute -bottom-5 -left-6 rounded-2xl border border-emerald-500/30 bg-white dark:bg-[#15181e] px-4 py-3 shadow-xl">
              <div className="font-outfit text-[22px] font-extrabold text-emerald-500">2,400+</div>
              <div className="text-[12px] font-semibold text-slate-500 dark:text-gray-400">Active Listings</div>
            </div>
            <div className="absolute -top-5 -right-4 rounded-2xl border border-white/20 bg-white dark:bg-[#15181e] px-4 py-3 shadow-xl">
              <div className="font-outfit text-[22px] font-extrabold text-emerald-500">98%</div>
              <div className="text-[12px] font-semibold text-slate-500 dark:text-gray-400">Verified</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
