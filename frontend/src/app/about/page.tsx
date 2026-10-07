import React from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Building2, Users, Wrench, Package, Hotel, Utensils, Award, Globe, Clock, Shield } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="w-full px-6 lg:px-8 max-w-[1600px] mx-auto py-8">
                <Breadcrumb
                    items={[
                        { label: 'About Us' },
                    ]}
                />

                {/* Hero Section */}
                <div className="mb-16">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-8 text-center">
                        StepVision Hotel and Engineering Supplies
                    </h1>
                    <div className="bg-white rounded-xl shadow-md p-8 md:p-12 max-w-5xl mx-auto">
                        <p className="text-lg md:text-xl text-neutral-700 leading-relaxed mb-6 text-center">
                            Being part of <span className="font-semibold text-primary-600">StepVision International Group</span>,
                            we are a UAE-based hospitality supply partner delivering both operational products and engineering
                            solutions for hotels, resorts, and serviced apartments all over the Middle East and Africa.
                        </p>
                        <p className="text-lg md:text-xl text-neutral-700 leading-relaxed text-center">
                            Hotels choose us because we combine industry-leading hospitality supplies with engineering products
                            that keep operations running smoothly.
                        </p>
                    </div>
                </div>

                {/* Our Commitment Section */}
                <div className="mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-8 text-center">
                        Our Commitment to Excellence
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                            <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <Award className="w-8 h-8 text-primary-600" />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900 mb-2">
                                Quality Assured
                            </h3>
                            <p className="text-sm text-neutral-600">
                                Premium products meeting international standards
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                            <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <Clock className="w-8 h-8 text-primary-600" />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900 mb-2">
                                Fast Delivery
                            </h3>
                            <p className="text-sm text-neutral-600">
                                Quick turnaround times across the region
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                            <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <Globe className="w-8 h-8 text-primary-600" />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900 mb-2">
                                Regional Expertise
                            </h3>
                            <p className="text-sm text-neutral-600">
                                Deep understanding of Middle East & Africa markets
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                            <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <Shield className="w-8 h-8 text-primary-600" />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900 mb-2">
                                Trusted Partner
                            </h3>
                            <p className="text-sm text-neutral-600">
                                Reliable support for your operations
                            </p>
                        </div>
                    </div>
                </div>

                {/* Trusted by Multiple Hotel Departments */}
                <div className="mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-8 text-center">
                        Trusted by Multiple Hotel Departments
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow">
                            <div className="flex items-start space-x-4">
                                <div className="bg-primary-100 rounded-lg p-3 flex-shrink-0">
                                    <Wrench className="w-7 h-7 text-primary-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-neutral-900 mb-3">
                                        Engineering Teams
                                    </h3>
                                    <p className="text-neutral-600 leading-relaxed">
                                        Fast delivery of technical products to keep your facilities running at peak performance
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow">
                            <div className="flex items-start space-x-4">
                                <div className="bg-primary-100 rounded-lg p-3 flex-shrink-0">
                                    <Package className="w-7 h-7 text-primary-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-neutral-900 mb-3">
                                        Procurement Teams
                                    </h3>
                                    <p className="text-neutral-600 leading-relaxed">
                                        Vendor consolidation & compliance support to streamline your supply chain
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow">
                            <div className="flex items-start space-x-4">
                                <div className="bg-primary-100 rounded-lg p-3 flex-shrink-0">
                                    <Hotel className="w-7 h-7 text-primary-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-neutral-900 mb-3">
                                        Hotel Management
                                    </h3>
                                    <p className="text-neutral-600 leading-relaxed">
                                        Operational reliability & uptime ensuring seamless guest experiences
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>



                {/* Industries Served */}
                <div className="mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-8 text-center">
                        Industries We Serve
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-primary-600 hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-3 mb-2">
                                <Hotel className="w-6 h-6 text-primary-600" />
                                <h3 className="text-lg font-semibold text-neutral-900">
                                    Hotels & Resorts
                                </h3>
                            </div>
                            <p className="text-sm text-neutral-600 mt-2">
                                Comprehensive supply solutions for luxury and boutique properties
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-primary-600 hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-3 mb-2">
                                <Building2 className="w-6 h-6 text-primary-600" />
                                <h3 className="text-lg font-semibold text-neutral-900">
                                    Serviced Apartments
                                </h3>
                            </div>
                            <p className="text-sm text-neutral-600 mt-2">
                                Complete furnishing and operational supplies for extended stays
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-primary-600 hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-3 mb-2">
                                <Users className="w-6 h-6 text-primary-600" />
                                <h3 className="text-lg font-semibold text-neutral-900">
                                    Hospitality Groups & Chains
                                </h3>
                            </div>
                            <p className="text-sm text-neutral-600 mt-2">
                                Scalable solutions for multi-property operations
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-primary-600 hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-3 mb-2">
                                <Wrench className="w-6 h-6 text-primary-600" />
                                <h3 className="text-lg font-semibold text-neutral-900">
                                    Facility Management Companies
                                </h3>
                            </div>
                            <p className="text-sm text-neutral-600 mt-2">
                                Technical products and maintenance supplies
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-primary-600 hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-3 mb-2">
                                <Utensils className="w-6 h-6 text-primary-600" />
                                <h3 className="text-lg font-semibold text-neutral-900">
                                    F&B Outlets
                                </h3>
                            </div>
                            <p className="text-sm text-neutral-600 mt-2">
                                Kitchen equipment and dining essentials
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-primary-600 hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-3 mb-2">
                                <Package className="w-6 h-6 text-primary-600" />
                                <h3 className="text-lg font-semibold text-neutral-900">
                                    Corporate Procurement
                                </h3>
                            </div>
                            <p className="text-sm text-neutral-600 mt-2">
                                Bulk ordering and customized supply programs
                            </p>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="bg-neutral-900 rounded-xl shadow-xl p-10 md:p-14 text-center max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Ready to Partner with Us?
                    </h2>
                    <p className="text-lg text-neutral-300 mb-8 max-w-2xl mx-auto">
                        Join the leading hotels and hospitality groups across the Middle East and Africa who trust StepVision for their supply needs.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="/contact"
                            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
                        >
                            Contact Us Today
                        </a>
                        <a
                            href="/request-catalogue"
                            className="bg-white hover:bg-neutral-100 text-neutral-900 font-semibold px-8 py-3 rounded-lg transition-colors"
                        >
                            Request Catalogue
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
