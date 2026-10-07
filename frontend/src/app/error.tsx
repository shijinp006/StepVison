'use client';

import { startTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Shown instead of a page that failed to render, usually because the catalog
// backend could not be reached. Header and footer from the layout stay.
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
    const router = useRouter();

    // Re-fetch the server-rendered page, then clear the error.
    const retry = () =>
        startTransition(() => {
            router.refresh();
            reset();
        });

    return (
        <div className="min-h-[60vh] flex items-center justify-center bg-neutral-50">
            <div className="container py-16 text-center max-w-xl">
                <h1 className="text-3xl font-bold text-neutral-900 mb-4">We couldn&apos;t load this page</h1>
                <p className="text-lg text-neutral-600 mb-8">
                    Our catalogue is temporarily unavailable. Please try again in a moment.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                    <button
                        onClick={retry}
                        className="px-6 py-3 rounded-lg bg-[#a48922] text-white font-semibold hover:opacity-90 transition"
                    >
                        Try again
                    </button>
                    <Link
                        href="/contact"
                        className="px-6 py-3 rounded-lg border border-[#a48922] text-[#a48922] font-semibold hover:bg-[#a48922]/10 transition"
                    >
                        Contact us
                    </Link>
                </div>
            </div>
        </div>
    );
}
