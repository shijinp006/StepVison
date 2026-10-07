import React from 'react';

export interface CatalogStatusProps {
    error?: string;
}

// Shown in place of a page's products while the catalog loads or if it failed.
export const CatalogStatus: React.FC<CatalogStatusProps> = ({ error }) => (
    <div className="min-h-[50vh] flex items-center justify-center">
        {error ? (
            <p className="text-lg text-red-600">{error}</p>
        ) : (
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" aria-label="Loading" />
        )}
    </div>
);
