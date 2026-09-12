import { Suspense } from 'react';
import MapPageClient from './MapPageClient';

// MapPageClient reads filters from the query string with `useSearchParams`,
// which requires a Suspense boundary during prerendering.
export default function MapPage() {
    return (
        <Suspense
            fallback={
                <main className="h-screen w-full bg-slate-50 dark:bg-[#0b0d10]" />
            }
        >
            <MapPageClient />
        </Suspense>
    );
}
