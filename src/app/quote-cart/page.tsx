'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, MessageCircle, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/Button';
import { useQuoteCart } from '@/store/useQuoteCart';
import { Breadcrumb } from '@/components/Breadcrumb';

export default function QuoteCartPage() {
    const { items, removeItem, updateQuantity, getTotalItems } = useQuoteCart();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const totalItems = getTotalItems();

    const handleWhatsAppQuote = () => {
        const phoneNumber = '971568978100';

        let message = "Hello StepVision,\n\nI would like to request a quote for the following items:\n\n";

        items.forEach((item, index) => {
            message += `${index + 1}. ${item.productName} (Code: ${item.productCode}) - Qty: ${item.quantity}\n`;
        });

        message += "\nPlease provide best pricing and availability.";

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="container mx-auto py-8">
                <Breadcrumb items={[{ label: 'Quote Cart' }]} />

                <h1 className="text-3xl font-bold text-neutral-900 mb-8 mt-4">Your Quote Cart</h1>

                {items.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
                        <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="w-10 h-10 text-neutral-400" />
                        </div>
                        <h2 className="text-xl font-bold text-neutral-900 mb-2">Your cart is empty</h2>
                        <p className="text-neutral-600 mb-8 max-w-md mx-auto">
                            Browsing our catalog to find premium hotel supplies for your establishment.
                        </p>
                        <Link href="/">
                            <Button variant="primary" size="lg">
                                Start Browsing
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {items.map((item) => (
                                <div
                                    key={item.productId}
                                    className="bg-white p-4 rounded-xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row gap-6 items-start sm:items-center group transition-all hover:shadow-md"
                                >
                                    {/* Product Image */}
                                    <div className="relative w-24 h-24 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                                        <Image
                                            src={item.imageUrl || '/placeholder.jpg'}
                                            alt={item.productName}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-neutral-500 mb-1">
                                            {item.productCode}
                                        </p>
                                        <Link
                                            href={`/products/${item.productId}`}
                                            className="text-lg font-semibold text-neutral-900 hover:text-primary-600 transition-colors line-clamp-1"
                                        >
                                            {item.productName}
                                        </Link>
                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-3 bg-neutral-50 rounded-lg p-1">
                                        <button
                                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                            className="w-8 h-8 flex items-center justify-center rounded-md text-neutral-600 hover:bg-white hover:text-primary-600 hover:shadow-sm transition-all"
                                            aria-label="Decrease quantity"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-8 text-center font-semibold text-neutral-900">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                            className="w-8 h-8 flex items-center justify-center rounded-md text-neutral-600 hover:bg-white hover:text-primary-600 hover:shadow-sm transition-all"
                                            aria-label="Increase quantity"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        onClick={() => removeItem(item.productId)}
                                        className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        aria-label="Remove item"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Summary / Actions */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 sticky top-24">
                                <h3 className="text-lg font-bold text-neutral-900 mb-6">Quote Summary</h3>

                                <div className="flex justify-between items-center mb-6 text-neutral-600">
                                    <span>Total Items</span>
                                    <span className="font-semibold text-neutral-900">{totalItems}</span>
                                </div>

                                <div className="space-y-4">
                                    <button
                                        onClick={handleWhatsAppQuote}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-4 rounded-lg flex items-center justify-center transition-all hover:shadow-lg hover:translate-y-[-1px] active:translate-y-[0px]"
                                    >
                                        <MessageCircle className="w-5 h-5 mr-2" />
                                        Request Quote via WhatsApp
                                    </button>

                                    <Link href="/" className="block">
                                        <Button variant="outline" fullWidth className="py-6">
                                            Continue Browsing
                                        </Button>
                                    </Link>
                                </div>

                                <p className="text-xs text-neutral-500 mt-6 text-center">
                                    Our team will search for availability and get back to you with the best prices immediately.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
