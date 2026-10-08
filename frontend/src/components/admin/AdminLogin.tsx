'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Lock, Mail, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/Button';
import { adminApi, type AdminSessionInfo } from '@/lib/adminApi';

interface AdminLoginProps {
    onLoggedIn: (session: AdminSessionInfo) => void;
}

const inputClass =
    'w-full pl-10 pr-4 py-3 rounded-lg border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all';

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoggedIn }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const session = await adminApi.login(email, password);
            onLoggedIn(session);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-12">
            <div className="mb-8 text-center">
                <div className="text-4xl font-extrabold text-white tracking-tight">StepVision</div>
                <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto mt-3" />
                <p className="text-neutral-400 text-sm uppercase tracking-widest mt-3">Admin Panel</p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-white rounded-2xl shadow-2xl border-t-4 border-primary-500 p-8"
            >
                <h1 className="text-2xl font-bold text-neutral-900 mb-1">Sign in</h1>
                <p className="text-neutral-500 mb-6">Manage your product catalogue</p>

                {error && (
                    <div className="mb-5 flex items-start gap-2 bg-red-50 text-red-700 border border-red-200 rounded-lg p-3" role="alert">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                <div className="space-y-5">
                    <div>
                        <label htmlFor="admin-email" className="block text-sm font-medium text-neutral-700 mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <input
                                id="admin-email"
                                type="email"
                                autoComplete="username"
                                required
                                autoFocus
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={inputClass}
                                placeholder="admin@stepvisionhotelsupplies.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="admin-password" className="block text-sm font-medium text-neutral-700 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <input
                                id="admin-password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`${inputClass} pr-11`}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>

                <Button type="submit" variant="primary" size="lg" fullWidth className="mt-8" disabled={submitting}>
                    {submitting ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Signing in...
                        </>
                    ) : (
                        'Sign in'
                    )}
                </Button>
            </form>

            <Link href="/" className="mt-8 inline-flex items-center text-sm text-neutral-400 hover:text-primary-400">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to website
            </Link>
        </div>
    );
};
