'use client';

import React, { useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Minus, Plus } from 'lucide-react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ImageGallery } from '@/components/ImageGallery';
import { Button } from '@/components/Button';
import { getProductById, getCategoryById } from '@/data/helpers';
import { useQuoteCart } from '@/store/useQuoteCart';
import { useToast } from '@/store/useToast';

interface ProductDetailPageProps {
    params: {
        category: string;
        productId: string;
    };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {

    const [quantity, setQuantity] = useState(1);

    const product = getProductById(params.productId);
    const addItem = useQuoteCart((state) => state.addItem);
    const addToast = useToast((state) => state.addToast);

    if (!product) {
        notFound();
    }

    const category = getCategoryById(product.categoryId);
    const subcategory = category?.subcategories?.find((sub) => sub.id === product.subcategoryId);

    const handleAddToQuote = () => {
        addItem(
            {
                productId: product.id,
                productName: product.name,
                productCode: product.code,
                imageUrl: product.images[0] || '',
            },
            quantity
        );
        addToast(`${quantity}x ${product.name} added to quote cart`, 'success');
    };

    const incrementQuantity = () => setQuantity((q) => q + 1);
    const decrementQuantity = () => setQuantity((q) => Math.max(1, q - 1));

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="container py-8">
                {/* Breadcrumb */}
                <Breadcrumb
                    items={[
                        { label: 'Products', href: '/products' },
                        { label: category?.name || 'Category', href: category ? `/products/${category.slug}` : '/products' },
                        { label: product.name },
                    ]}
                />

                {/* Back Button */}
                <div className="mb-6">
                    <Link
                        href={category ? `/products/${category.slug}` : '/products'}
                        className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to {category?.name || 'Products'}
                    </Link>
                </div>

                {/* Product Details */}
                <div className="bg-white rounded-lg shadow-sm p-8">
                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Image Gallery */}
                        <div>
                            <ImageGallery images={product.images} productName={product.name} />
                        </div>

                        {/* Product Info */}
                        <div>
                            {/* Product Code */}
                            <p className="text-sm text-neutral-500 mb-2">SKU: {product.code}</p>

                            {/* Product Name */}
                            <h1 className="text-4xl font-bold text-neutral-900 mb-4">{product.name}</h1>

                            {/* Category Badges */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                {category && (
                                    <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                                        {category.name}
                                    </span>
                                )}
                                {subcategory && (
                                    <span className="px-3 py-1 bg-neutral-100 text-neutral-700 text-sm font-medium rounded-full">
                                        {subcategory.name}
                                    </span>
                                )}
                                {product.isFeatured && (
                                    <span className="px-3 py-1 bg-secondary-100 text-secondary-700 text-sm font-medium rounded-full">
                                        Featured
                                    </span>
                                )}
                            </div>

                            {/* Brand */}
                            {product.brand && (
                                <div className="mb-6">
                                    <p className="text-sm text-neutral-500 mb-1">Brand</p>
                                    <p className="text-lg font-semibold text-neutral-900">{product.brand}</p>
                                </div>
                            )}

                            {/* Description */}
                            {product.shortDescription && (
                                <div className="mb-8">
                                    <h2 className="text-lg font-bold text-neutral-900 mb-2">Description</h2>
                                    <p className="text-neutral-700 leading-relaxed">{product.shortDescription}</p>
                                </div>
                            )}

                            {/* Divider */}
                            <div className="border-t border-neutral-200 my-8" />

                            {/* Quantity Selector */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Quantity
                                </label>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={decrementQuantity}
                                        className="w-10 h-10 flex items-center justify-center border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors"
                                        aria-label="Decrease quantity"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-20 text-center px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                    />
                                    <button
                                        onClick={incrementQuantity}
                                        className="w-10 h-10 flex items-center justify-center border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors"
                                        aria-label="Increase quantity"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Add to Quote Button */}
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={handleAddToQuote}
                                className="w-full"
                            >
                                <ShoppingCart className="w-5 h-5 mr-2" />
                                Add to Quote Cart
                            </Button>

                            {/* Info Note */}
                            <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
                                <p className="text-sm text-neutral-600">
                                    <strong>Note:</strong> This is a quote request system. Add products to your cart and submit
                                    a quote request to receive pricing and availability information.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
