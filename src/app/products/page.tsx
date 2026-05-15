'use client';

import React, { useState, useMemo } from 'react';
import { Filter } from 'lucide-react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ProductCard } from '@/components/ProductCard';
import { ProductFilters } from '@/components/ProductFilters';
import { Button } from '@/components/Button';
import { getCategories, getActiveProducts } from '@/data/helpers';
import { Product } from '@/data/types';

const PRODUCTS_PER_PAGE = 12;

export default function ProductsPage() {
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubcategory, setSelectedSubcategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const categories = getCategories();
    const allProducts = getActiveProducts();

    // Filter products
    const filteredProducts = useMemo(() => {
        let filtered: Product[] = allProducts;

        // Filter by category
        if (selectedCategory) {
            filtered = filtered.filter((p) => p.categoryId === selectedCategory);
        }

        // Filter by subcategory
        if (selectedSubcategory) {
            filtered = filtered.filter((p) => p.subcategoryId === selectedSubcategory);
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (p) =>
                    p.name.toLowerCase().includes(query) ||
                    p.code.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [allProducts, selectedCategory, selectedSubcategory, searchQuery]);

    // Pagination
    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * PRODUCTS_PER_PAGE,
        currentPage * PRODUCTS_PER_PAGE
    );

    const handleClearFilters = () => {
        setSelectedCategory('');
        setSelectedSubcategory('');
        setSearchQuery('');
        setCurrentPage(1);
    };

    const handleCategoryChange = (categoryId: string) => {
        setSelectedCategory(categoryId);
        setSelectedSubcategory(''); // Reset subcategory when category changes
        setCurrentPage(1);
    };

    const handleSubcategoryChange = (subcategoryId: string) => {
        setSelectedSubcategory(subcategoryId);
        setCurrentPage(1);
    };

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="container py-8">
                {/* Breadcrumb */}
                <Breadcrumb items={[{ label: 'Products' }]} />

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-neutral-900 mb-2">All Products</h1>
                    <p className="text-lg text-neutral-600">
                        Browse our complete range of hospitality supplies
                    </p>
                </div>

                <div className="flex gap-8">
                    {/* Desktop Sidebar Filters */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="sticky top-8">
                            <ProductFilters
                                categories={categories}
                                selectedCategory={selectedCategory}
                                selectedSubcategory={selectedSubcategory}
                                searchQuery={searchQuery}
                                onCategoryChange={handleCategoryChange}
                                onSubcategoryChange={handleSubcategoryChange}
                                onSearchChange={handleSearchChange}
                                onClearFilters={handleClearFilters}
                            />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Mobile Filter Button */}
                        <div className="lg:hidden mb-6">
                            <Button
                                variant="outline"
                                size="md"
                                onClick={() => setShowMobileFilters(true)}
                                className="w-full"
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                Filters
                                {(selectedCategory || selectedSubcategory || searchQuery) && (
                                    <span className="ml-2 bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">
                                        Active
                                    </span>
                                )}
                            </Button>
                        </div>

                        {/* Results Count */}
                        <div className="mb-6">
                            <p className="text-neutral-600">
                                Showing {paginatedProducts.length} of {filteredProducts.length} products
                            </p>
                        </div>

                        {/* Product Grid */}
                        {paginatedProducts.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
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
                                <p className="text-xl text-neutral-600 mb-4">No products found</p>
                                <Button variant="outline" size="md" onClick={handleClearFilters}>
                                    Clear Filters
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filter Drawer */}
            {showMobileFilters && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setShowMobileFilters(false)}
                    />
                    <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-xl overflow-y-auto">
                        <ProductFilters
                            categories={categories}
                            selectedCategory={selectedCategory}
                            selectedSubcategory={selectedSubcategory}
                            searchQuery={searchQuery}
                            onCategoryChange={handleCategoryChange}
                            onSubcategoryChange={handleSubcategoryChange}
                            onSearchChange={handleSearchChange}
                            onClearFilters={handleClearFilters}
                            isMobile
                            onClose={() => setShowMobileFilters(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
