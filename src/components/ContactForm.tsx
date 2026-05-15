'use client';

import React, { useState } from 'react';
import { Button } from './Button';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

export const ContactForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Setup for email integration later
        console.log('Form submitted:', formData);
        setStatus('success');
        setFormData({
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: ''
        });

        // Reset success message after 5 seconds
        setTimeout(() => setStatus('idle'), 5000);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-lg border border-neutral-100">
            <h3 className="text-2xl font-bold text-neutral-900 mb-6">Send us a Message</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-neutral-700">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                        placeholder="John Doe"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-neutral-700">
                        Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                        placeholder="john@example.com"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium text-neutral-700">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                        placeholder="+971 50 123 4567"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium text-neutral-700">
                        Subject <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <select
                            id="subject"
                            name="subject"
                            required
                            value={formData.subject}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none appearance-none bg-white"
                        >
                            <option value="">Select a topic</option>
                            <option value="General Inquiry">General Inquiry</option>
                            <option value="Product Information">Product Information</option>
                            <option value="Quote Request">Request a Quote</option>
                            <option value="Partnership">Partnership Opportunity</option>
                            <option value="Other">Other</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-neutral-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-neutral-700">
                    Message <span className="text-red-500">*</span>
                </label>
                <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none resize-none"
                    placeholder="How can we help you?"
                />
            </div>

            <div className="pt-2">
                <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    className="h-12 text-lg"
                    disabled={status === 'submitting'}
                >
                    {status === 'submitting' ? (
                        <span className="flex items-center justify-center">
                            <svg className="w-5 h-5 mr-3 animate-spin" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Sending...
                        </span>
                    ) : status === 'success' ? (
                        <span className="flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Message Sent!
                        </span>
                    ) : (
                        <span className="flex items-center justify-center">
                            Send Message
                            <Send className="w-5 h-5 ml-2" />
                        </span>
                    )}
                </Button>
            </div>

            {status === 'success' && (
                <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-start animate-in fade-in slide-in-from-bottom-2">
                    <CheckCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold">Thank you for contacting us!</h4>
                        <p className="text-sm mt-1">We have received your message and will get back to you shortly.</p>
                    </div>
                </div>
            )}

            {status === 'error' && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start animate-in fade-in slide-in-from-bottom-2">
                    <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold">Something went wrong</h4>
                        <p className="text-sm mt-1">Please try again later or contact us directly via email.</p>
                    </div>
                </div>
            )}
        </form>
    );
};
