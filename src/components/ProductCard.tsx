'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, MessageCircle } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { Product } from '@/data/types';
import { useQuoteCart } from '@/store/useQuoteCart';
import { useToast } from '@/store/useToast';
import { getCategoryById } from '@/data/helpers';

export interface ProductCardProps {
    product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const addItem = useQuoteCart((state) => state.addItem);
    const addToast = useToast((state) => state.addToast);
    const category = getCategoryById(product.categoryId);

    const handleAddToQuote = (e: React.MouseEvent) => {
        e.preventDefault();
        addItem({
            productId: product.id,
            productName: product.name,
            productCode: product.code,
            imageUrl: product.images[0] || '',
        });
        addToast(`${product.name} added to quote cart`, 'success');
    };

    const productUrl = category
        ? `/products/${category.slug}/${product.id}`
        : `/products/${product.id}`;

    return (
        <Card padding="none" hover className="overflow-hidden group">
            <Link href={productUrl}>
                <div className="relative aspect-square overflow-hidden bg-neutral-100">
                    <Image
                        src={product.images[0] || '/placeholder.jpg'}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {product.isFeatured && (
                        <div className="absolute top-2 right-2 bg-secondary-500 text-white px-2 py-1 rounded text-xs font-semibold">
                            Featured
                        </div>
                    )}
                </div>
                <div className="p-4">
                    <div className="mb-2">
                        <p className="text-xs text-neutral-500 mb-1">{product.code}</p>
                        <h3 className="font-semibold text-neutral-900 line-clamp-2 mb-1">
                            {product.name}
                        </h3>
                        {product.brand && (
                            <p className="text-sm text-primary-600">{product.brand}</p>
                        )}
                    </div>
                    {product.shortDescription && (
                        <p className="text-sm text-neutral-600 line-clamp-2 mb-4">
                            {product.shortDescription}
                        </p>
                    )}
                    <div className="flex gap-2">
                        <a
                            href={`https://wa.me/971568978100?text=I'm interested in ${product.name} (${product.code})`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-green-600 text-green-700 hover:bg-green-50"
                            >
                                <MessageCircle className="w-4 h-4 mr-1" />
                                WhatsApp
                            </Button>
                        </a>
                        <Button
                            variant="primary"
                            size="sm"
                            className="flex-1"
                            onClick={handleAddToQuote}
                        >
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            Add to Quote
                        </Button>
                    </div>
                </div>
            </Link>
        </Card>
    );
};
