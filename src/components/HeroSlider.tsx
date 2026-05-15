'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from './Button';

interface Slide {
    id: number;
    image: string;
    title: string;
    description: string;
    ctaText: string;
    ctaLink: string;
    secondaryCtaText?: string;
    secondaryCtaLink?: string;
}

const slides: Slide[] = [
    {
        id: 1,
        image: '/images/hero-banner-main.png',
        title: 'One stop solution for Hotel supplies and Engineering Products',
        description: '',
        ctaText: 'View Products',
        ctaLink: '/products',
        secondaryCtaText: 'Contact Us',
        secondaryCtaLink: '/contact',
    },
    {
        id: 2,
        image: '/images/hero-slide-1.png',
        title: 'Premium Hotel & Hospitality Supplies',
        description: 'From OS&E and FF&E to Engineering spares and maintenance products — trusted by hotels in Middle East and Africa',
        ctaText: 'View Catalogue',
        ctaLink: '/request-catalogue',
        secondaryCtaText: 'Contact Us',
        secondaryCtaLink: '/contact',
    },
    {
        id: 3,
        image: '/images/hero-slide-2.png',
        title: 'Reliable Engineering Solutions',
        description: 'Comprehensive engineering supplies including HVAC, electrical, plumbing, and maintenance essentials.',
        ctaText: 'View Catalogue',
        ctaLink: '/engineering-solutions',
        secondaryCtaText: 'Contact Us',
        secondaryCtaLink: '/contact',
    },
    {
        id: 4,
        image: '/images/hero-slide-3.png',
        title: 'Elegant Tabletop & Dining',
        description: 'Curated dinnerware, glassware, and cutlery to elevate your guests\' dining experience.',
        ctaText: 'View Catalogue',
        ctaLink: '/hospitality-supplies',
        secondaryCtaText: 'Contact Us',
        secondaryCtaLink: '/contact',
    },
    {
        id: 5,
        image: '/images/hero-slide-4.png',
        title: 'Custom & Project Solutions',
        description: 'Bespoke furniture, project services, and custom sourcing tailored to your hospitality needs.',
        ctaText: 'View Catalogue',
        ctaLink: '/hospitality-supplies',
        secondaryCtaText: 'Contact Us',
        secondaryCtaLink: '/contact',
    },
    {
        id: 6,
        image: '/images/hero-slide-5.png',
        title: 'Professional Kitchen Equipment',
        description: 'Top-tier cookware and tools designed for professional chefs and busy commercial kitchens.',
        ctaText: 'View Catalogue',
        ctaLink: '/hospitality-supplies',
        secondaryCtaText: 'Contact Us',
        secondaryCtaLink: '/contact',
    },
];

export const HeroSlider: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, []);

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    useEffect(() => {
        if (isPaused) return;
        const timer = setInterval(() => {
            nextSlide();
        }, 5000);

        return () => clearInterval(timer);
    }, [nextSlide, isPaused]);

    return (
        <div
            className="relative h-[600px] w-full overflow-hidden bg-neutral-900 group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Slides */}
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                >
                    {/* Background Image */}
                    <div className="absolute inset-0">
                        <Image
                            src={slide.image}
                            alt={slide.title}
                            fill
                            className="object-cover"
                            priority={index === 0}
                        />
                        {/* Dark Overlay */}
                        <div className="absolute inset-0 bg-black/60" />
                    </div>

                    {/* Content */}
                    <div className="container relative z-20 h-full flex flex-col justify-center items-center text-center px-4">
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg max-w-4xl">
                            {slide.title}
                        </h1>
                        {slide.description && (
                            <p className="text-lg md:text-2xl text-neutral-200 mb-8 max-w-3xl drop-shadow-md">
                                {slide.description}
                            </p>
                        )}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href={slide.ctaLink}>
                                <Button variant="primary" size="lg" className="min-w-[200px] shadow-lg hover:shadow-xl transition-all">
                                    {slide.ctaText}
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                            {slide.secondaryCtaText && slide.secondaryCtaLink && (
                                <Link href={slide.secondaryCtaLink}>
                                    <Button variant="secondary" size="lg" className="min-w-[200px] bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-sm">
                                        {slide.secondaryCtaText}
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            ))
            }

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/20 hover:bg-black/40 text-white/70 hover:text-white transition-all backdrop-blur-sm -translate-x-full group-hover:translate-x-0 duration-300"
                aria-label="Previous slide"
            >
                <ChevronLeft className="w-8 h-8" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/20 hover:bg-black/40 text-white/70 hover:text-white transition-all backdrop-blur-sm translate-x-full group-hover:translate-x-0 duration-300"
                aria-label="Next slide"
            >
                <ChevronRight className="w-8 h-8" />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex space-x-3">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-[#d4af37] w-8' : 'bg-white/40 hover:bg-white/60 w-2'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div >
    );
};
