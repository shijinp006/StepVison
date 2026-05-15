import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Category } from '@/data/types';

export interface CategoryCardProps {
    category: Category;
}

// Map category slugs to banner image filenames
const getCategoryBannerImage = (categorySlug: string): string => {
    const imageMap: Record<string, string> = {
        'tabletop-dining': 'tabletop-dining.jpg',
        'kitchen-catering': 'kitchen-catering.jpg',
        'housekeeping-cleaning': 'housekeeping-cleaning.jpg',
        'guest-room-essentials': 'guest-room-essentials.jpg',
        'front-office-service': 'front-office-service.jpg',
        'stationery': 'stationery.jpg',
        'gift-items': 'gift-items.jpg',
        'party-items': 'party-items.jpg',
        'furniture': 'furniture.jpg',
        'upholstery': 'upholstery.jpg',
        'custom-project-solutions': 'custom-project-solutions.jpg',
    };
    return `/images/categories/${imageMap[categorySlug] || 'tabletop-dining.jpg'}`;
};

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
    return (
        <Link href={`/products/${category.slug}`} className="group block">
            <div className="relative h-64 md:h-72 lg:h-80 overflow-hidden rounded-lg shadow-lg transition-all duration-300 group-hover:shadow-2xl group-hover:scale-[1.02]">
                {/* Background Image */}
                <Image
                    src={getCategoryBannerImage(category.slug)}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-lg">
                        {category.name}
                    </h3>
                    {category.description && (
                        <p className="text-sm md:text-base text-white/90 mb-3 line-clamp-2 drop-shadow">
                            {category.description}
                        </p>
                    )}
                    {category.subcategories && category.subcategories.length > 0 && (
                        <div className="flex items-center justify-between">
                            <p className="text-xs md:text-sm text-white/80">
                                {category.subcategories.length} subcategories
                            </p>
                            <div className="flex items-center text-white font-medium text-sm md:text-base group-hover:text-primary-300 transition-colors">
                                Explore
                                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-1 group-hover:translate-x-2 transition-transform" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

