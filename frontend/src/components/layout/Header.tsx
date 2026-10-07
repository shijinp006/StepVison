'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ShoppingCart, FileText, ChevronDown } from 'lucide-react';
import { Button } from '../Button';
import { useQuoteCart } from '@/store/useQuoteCart';

// Map category names to icon filenames - REMOVED UNUSED FUNCTION

export const Header: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isHospitalityDropdownOpen, setIsHospitalityDropdownOpen] = useState(false);
    const [isMobileHospitalityOpen, setIsMobileHospitalityOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const totalItems = useQuoteCart((state) => state.getTotalItems());




    React.useEffect(() => {
        setMounted(true);
    }, []);

    const navItems = [
        { label: 'Home', href: '/' },
        { label: 'About Us', href: '/about' },
        { label: 'Hotel Supplies', href: '/hospitality-supplies', hasDropdown: true },
        { label: 'Engineering Solutions', href: '/engineering-solutions' },
        { label: 'Contact', href: '/contact' },
    ];

    const productDropdownItems = [
        { label: 'Engineering Equipments', href: '/products/engineering-solutions' },
        { label: 'Housekeeping Equipments', href: '/products/housekeeping-cleaning' },
        { label: 'Banqueting', href: '/products/kitchen-catering' },
        { label: 'F & B Solutions & Equipment', href: '/products/tabletop-dining' },
        { label: 'Hotel Supply', href: '/hospitality-supplies' },
        { label: 'Room Supply', href: '/products/guest-room-essentials' },
        { label: 'Kids Area Supply', href: '/products/custom-project-solutions' },
        { label: 'Medical Supply Equipments', href: '/products/custom-project-solutions' },
        { label: 'Swimming Pool & Sauna Accessories', href: '/products/custom-project-solutions' },
    ];

    return (
        <header className="bg-black border-b border-neutral-800 sticky top-0 z-50 shadow-sm">
            <div className="w-full px-6 lg:px-8 max-w-[1600px] mx-auto">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center flex-shrink-0">
                        <div className="text-3xl font-extrabold text-white tracking-tight">
                            StepVision
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-8 ml-auto">
                        {navItems.map((item) => (
                            <div
                                key={item.label}
                                className="relative"
                                onMouseEnter={() => {
                                    if (item.hasDropdown) setIsHospitalityDropdownOpen(true);
                                }}
                                onMouseLeave={() => {
                                    if (item.hasDropdown) setIsHospitalityDropdownOpen(false);
                                }}
                            >
                                <Link
                                    href={item.href}
                                    className="text-white hover:text-primary-400 text-sm font-semibold uppercase tracking-wide transition-colors whitespace-nowrap flex items-center"
                                >
                                    {item.label}
                                    {item.hasDropdown && <ChevronDown className="w-4 h-4 ml-1" />}
                                </Link>

                                {item.hasDropdown && isHospitalityDropdownOpen && (
                                    <div className="absolute left-0 top-full pt-2 w-72 z-50">
                                        <div className="bg-[#f0f0f0] border border-neutral-200 shadow-xl py-1">
                                            {productDropdownItems.map((subItem) => (
                                                <Link
                                                    key={subItem.label}
                                                    href={subItem.href}
                                                    className="block px-6 py-2.5 text-[15px] text-neutral-700 hover:bg-[#d4af37] hover:text-white transition-colors border-b border-neutral-200 last:border-0"
                                                    onClick={() => setIsHospitalityDropdownOpen(false)}
                                                >
                                                    {subItem.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* CTAs */}
                    <div className="hidden lg:flex items-center space-x-3 ml-6 flex-shrink-0">
                        <Link href="/request-catalogue">
                            <Button variant="outline" size="sm">
                                <FileText className="w-3.5 h-3.5 mr-1.5" />
                                <span className="text-xs">Catalogue</span>
                            </Button>
                        </Link>
                        <Link href="/quote-cart" className="relative">
                            <Button variant="primary" size="sm">
                                <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                                <span className="text-xs">Quote Cart</span>
                                {mounted && totalItems > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-secondary-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                        {totalItems}
                                    </span>
                                )}
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Button - Show on LG screens now */}
                    <button
                        className="lg:hidden p-2 text-neutral-700 hover:text-primary-600"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden border-t border-neutral-200 py-4">
                        <nav className="flex flex-col space-y-2">
                            {navItems.map((item) => (
                                <div key={item.label}>
                                    {item.hasDropdown ? (
                                        <div>
                                            <button
                                                onClick={() => setIsMobileHospitalityOpen(!isMobileHospitalityOpen)}
                                                className="w-full text-left text-neutral-300 hover:text-white font-medium px-4 py-2 flex items-center justify-between"
                                            >
                                                <span>{item.label}</span>
                                                <ChevronDown
                                                    className={`w-4 h-4 transition-transform ${isMobileHospitalityOpen ? 'rotate-180' : ''}`}
                                                />
                                            </button>
                                            {isMobileHospitalityOpen && (
                                                <div className="bg-neutral-50 py-2 space-y-1">
                                                    {productDropdownItems.map((subItem) => (
                                                        <Link
                                                            key={subItem.label}
                                                            href={subItem.href}
                                                            className="block text-neutral-400 hover:text-white text-sm px-8 py-2"
                                                            onClick={() => {
                                                                setIsMobileMenuOpen(false);
                                                                setIsMobileHospitalityOpen(false);
                                                            }}
                                                        >
                                                            {subItem.label}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <Link
                                            href={item.href}
                                            className="text-neutral-300 hover:text-white font-medium px-4 py-2 block"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            {item.label}
                                        </Link>
                                    )}
                                </div>
                            ))}
                            <div className="px-4 pt-4 border-t border-neutral-200 space-y-3">
                                <Link href="/request-catalogue" className="block">
                                    <Button variant="outline" size="md" fullWidth>
                                        <FileText className="w-4 h-4 mr-2" />
                                        Request Catalogue
                                    </Button>
                                </Link>
                                <Link href="/quote-cart" className="block relative">
                                    <Button variant="primary" size="md" fullWidth>
                                        <ShoppingCart className="w-4 h-4 mr-2" />
                                        Quote Cart
                                        {mounted && totalItems > 0 && (
                                            <span className="ml-2 bg-secondary-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                                                {totalItems}
                                            </span>
                                        )}
                                    </Button>
                                </Link>
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};
