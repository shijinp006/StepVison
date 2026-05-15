'use client';

import React from 'react';
import { X, Search } from 'lucide-react';
import { Button } from './Button';
import { Category } from '@/data/types';

export interface ProductFiltersProps {
    categories: Category[];
    selectedCategory: string;
    selectedSubcategory: string;
    searchQuery: string;
    onCategoryChange: (categoryId: string) => void;
    onSubcategoryChange: (subcategoryId: string) => void;
    onSearchChange: (query: string) => void;
    onClearFilters: () => void;
    isMobile?: boolean;
    onClose?: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
    categories,
    selectedCategory,
    selectedSubcategory,
    searchQuery,
    onCategoryChange,
    onSubcategoryChange,
    onSearchChange,
    onClearFilters,
    isMobile = false,
    onClose,
}) => {
    const selectedCategoryData = categories.find((cat) => cat.id === selectedCategory);
    const subcategories = selectedCategoryData?.subcategories || [];

    const hasActiveFilters = selectedCategory || selectedSubcategory || searchQuery;

    return (
        <div className={`bg-white ${isMobile ? 'p-6' : 'p-4'} rounded-lg ${!isMobile && 'border border-neutral-200'}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-neutral-900">Filters</h3>
                {isMobile && onClose && (
                    <button
                        onClick={onClose}
                        className="text-neutral-500 hover:text-neutral-700"
                        aria-label="Close filters"
                    >
                        <X className="w-6 h-6" />
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="mb-6">
                <label htmlFor="search" className="block text-sm font-medium text-neutral-700 mb-2">
                    Search Products
                </label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        id="search"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Product name or code..."
                        className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
                <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-2">
                    Category
                </label>
                <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Subcategory Filter */}
            {subcategories.length > 0 && (
                <div className="mb-6">
                    <label htmlFor="subcategory" className="block text-sm font-medium text-neutral-700 mb-2">
                        Subcategory
                    </label>
                    <select
                        id="subcategory"
                        value={selectedSubcategory}
                        onChange={(e) => onSubcategoryChange(e.target.value)}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    >
                        <option value="">All Subcategories</option>
                        {subcategories.map((subcategory) => (
                            <option key={subcategory.id} value={subcategory.id}>
                                {subcategory.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Clear Filters */}
            {hasActiveFilters && (
                <Button
                    variant="outline"
                    size="md"
                    onClick={onClearFilters}
                    className="w-full"
                >
                    Clear All Filters
                </Button>
            )}
        </div>
    );
};
