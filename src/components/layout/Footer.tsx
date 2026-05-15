import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

export const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { label: 'Home', href: '/' },
        { label: 'About Us', href: '/about' },
        { label: 'Products', href: '/products' },
        { label: 'Why Choose Us', href: '/why-choose-us' },
        { label: 'Contact', href: '/contact' },
    ];

    const legalLinks = [
        { label: 'Privacy Policy', href: '/privacy-policy' },
        { label: 'Terms & Conditions', href: '/terms-conditions' },
    ];

    const socialLinks = [
        { icon: Facebook, href: '#', label: 'Facebook' },
        { icon: Instagram, href: '#', label: 'Instagram' },
        { icon: Linkedin, href: '#', label: 'LinkedIn' },
        { icon: Twitter, href: '#', label: 'Twitter' },
    ];

    return (
        <footer className="bg-neutral-900 text-neutral-300">
            <div className="container mx-auto py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div>
                        <h3 className="text-white text-xl font-bold mb-4">StepVision Hotel Supplies</h3>
                        <p className="text-sm mb-4">
                            Your trusted partner for premium hotel supplies and Engineering solutions across Middle East and Africa.
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-start space-x-2">
                                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                                <span className="text-sm">United Arab Emirates</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Phone className="w-4 h-4 flex-shrink-0" />
                                <a href="tel:0568978100" className="text-sm hover:text-primary-400 transition-colors">
                                    056 897 8100
                                </a>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Mail className="w-4 h-4 flex-shrink-0" />
                                <a
                                    href="mailto:sales@stepvisionhotelsupplies.com"
                                    className="text-sm hover:text-primary-400 transition-colors"
                                >
                                    sales@stepvisionhotelsupplies.com
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white text-lg font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            {quickLinks.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-sm hover:text-primary-400 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-white text-lg font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2">
                            {legalLinks.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-sm hover:text-primary-400 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Social Links */}
                    <div>
                        <h4 className="text-white text-lg font-semibold mb-4">Follow Us</h4>
                        <div className="flex space-x-4">
                            {socialLinks.map((social) => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
                                        aria-label={social.label}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-neutral-800 mt-8 pt-8 text-center">
                    <p className="text-sm text-neutral-400">
                        © {currentYear} StepVision Hotel Supplies. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};
