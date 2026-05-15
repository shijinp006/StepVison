'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export interface ImageGalleryProps {
    images: string[];
    productName: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, productName }) => {
    const [selectedImage, setSelectedImage] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="aspect-square bg-neutral-100 rounded-lg flex items-center justify-center">
                <p className="text-neutral-400">No image available</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
                <Image
                    src={images[selectedImage]}
                    alt={`${productName} - Image ${selectedImage + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                    {images.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`relative aspect-square overflow-hidden rounded-md bg-neutral-100 border-2 transition-all ${selectedImage === index
                                    ? 'border-primary-600 ring-2 ring-primary-200'
                                    : 'border-transparent hover:border-neutral-300'
                                }`}
                        >
                            <Image
                                src={image}
                                alt={`${productName} - Thumbnail ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="100px"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
