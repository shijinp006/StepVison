import React from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { CategoryCard } from '@/components/CategoryCard';
import { getCategories } from '@/data/helpers';

export default function HospitalitySuppliesPage() {
    // Filter out Engineering Solutions as it has its own section
    const categories = getCategories().filter(cat => cat.slug !== 'engineering-solutions');

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="container py-8">
                <Breadcrumb
                    items={[
                        { label: 'Hospitality Supplies' },
                    ]}
                />
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-neutral-900 mb-4">Hospitality Supplies</h1>
                    <p className="text-lg text-neutral-600 max-w-3xl">
                        Explore our comprehensive collection of premium supplies for every aspect of your hospitality business, from dining to housekeeping.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category) => (
                        <CategoryCard key={category.id} category={category} />
                    ))}
                </div>
            </div>
        </div>
    );
}
