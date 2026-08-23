'use client';

import dynamic from 'next/dynamic';

const MapClient = dynamic(() => import('./MapClient'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#0b0d10] text-gray-500">
      Loading map...
    </div>
  ),
});

export function MapView(props: any) {
  return <MapClient {...props} />;
}
