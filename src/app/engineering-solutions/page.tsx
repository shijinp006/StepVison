'use client';

import React, { useState, useMemo } from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/Button';
import { getCategoryBySlug, getProductsByCategoryId, getProductsBySubcategoryId } from '@/data/helpers';

const PRODUCTS_PER_PAGE = 12;

export default function EngineeringSolutionsPage() {
    // Hardcoded category slug for this page
    const categorySlug = 'engineering-solutions';
    const category = getCategoryBySlug(categorySlug);
    const [selectedSubcategory, setSelectedSubcategory] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Get products - safely handle missing category
    const allCategoryProducts = useMemo(() =>
        category ? getProductsByCategoryId(category.id) : [],
        [category]
    );

    const filteredProducts = useMemo(() => {
        if (selectedSubcategory) {
            return getProductsBySubcategoryId(selectedSubcategory);
        }
        return allCategoryProducts;
    }, [selectedSubcategory, allCategoryProducts]);

    if (!category) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-neutral-900 mb-2">Category Not Found</h1>
                    <p className="text-neutral-600">The Engineering Solutions category could not be found.</p>
                </div>
            </div>
        );
    }

    // Pagination
    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * PRODUCTS_PER_PAGE,
        currentPage * PRODUCTS_PER_PAGE
    );

    const handleSubcategoryChange = (subcategoryId: string) => {
        setSelectedSubcategory(subcategoryId);
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="container py-8">
                {/* Breadcrumb */}
                <Breadcrumb
                    items={[
                        { label: 'Engineering Solutions' },
                    ]}
                />

                {/* Category Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-neutral-900 mb-2">{category.name}</h1>
                    {category.description && (
                        <p className="text-lg text-neutral-600">{category.description}</p>
                    )}
                </div>

                {/* Subcategory Navigation */}
                {category.subcategories && category.subcategories.length > 0 && (
                    <div className="mb-8">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => handleSubcategoryChange('')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedSubcategory === ''
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-300'
                                    }`}
                            >
                                All
                            </button>
                            {category.subcategories.map((subcategory) => (
                                <button
                                    key={subcategory.id}
                                    onClick={() => handleSubcategoryChange(subcategory.id)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedSubcategory === subcategory.id
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-300'
                                        }`}
                                >
                                    {subcategory.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Results Count */}
                <div className="mb-6">
                    <p className="text-neutral-600">
                        Showing {paginatedProducts.length} of {filteredProducts.length} products
                    </p>
                </div>

                {/* Product Grid */}
                {paginatedProducts.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                            {paginatedProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        variant={currentPage === page ? 'primary' : 'outline'}
                                        size="sm"
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </Button>
                                ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-xl text-neutral-600">No products found in this category</p>
                    </div>
                )}
            </div>
        </div>
    );
}
