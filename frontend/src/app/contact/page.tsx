import React from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ContactForm } from '@/components/ContactForm';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="container mx-auto py-8">
                <Breadcrumb
                    items={[
                        { label: 'Contact Us' },
                    ]}
                />

                <div className="mb-12 text-center max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
                        Get in Touch
                    </h1>
                    <p className="text-lg text-neutral-600">
                        Have questions about our products or need a custom quote? We&apos;re here to help.
                        Reach out to us using the form below or contact us directly.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                    {/* Contact Information - Takes up 1 column on lg screens */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Contact Info Card */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-neutral-100 h-full">
                            <h2 className="text-2xl font-bold text-neutral-900 mb-8">Contact Information</h2>

                            <div className="space-y-8">
                                <div className="flex items-start space-x-4">
                                    <div className="bg-primary-100 p-3 rounded-lg text-primary-600 flex-shrink-0">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-neutral-900 mb-1">Phone Number</h3>
                                        <p className="text-neutral-600 text-sm mb-2">Call us for immediate assistance</p>
                                        <a href="tel:+971568978100" className="text-lg font-bold text-primary-600 hover:text-primary-700 transition-colors">
                                            +971 56 897 8100
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="bg-primary-100 p-3 rounded-lg text-primary-600 flex-shrink-0">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-neutral-900 mb-1">Email Address</h3>
                                        <p className="text-neutral-600 text-sm mb-2">Send us your inquiries anytime</p>
                                        <a href="mailto:sales@stepvisionhotelsupplies.com" className="text-lg font-bold text-primary-600 hover:text-primary-700 transition-colors break-all">
                                            sales@stepvisionhotelsupplies.com
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="bg-primary-100 p-3 rounded-lg text-primary-600 flex-shrink-0">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-neutral-900 mb-1">Our Location</h3>
                                        <p className="text-neutral-600 text-sm mb-2">Visit our office</p>
                                        <p className="text-neutral-900 font-medium">
                                            United Arab Emirates
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="bg-primary-100 p-3 rounded-lg text-primary-600 flex-shrink-0">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-neutral-900 mb-1">Business Hours</h3>
                                        <p className="text-neutral-600 text-sm">
                                            Monday - Saturday: 9:00 AM - 6:00 PM<br />
                                            Sunday: Closed
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form - Takes up 2 columns on lg screens */}
                    <div className="lg:col-span-2">
                        <ContactForm />
                    </div>
                </div>
            </div>
        </div>
    );
}
