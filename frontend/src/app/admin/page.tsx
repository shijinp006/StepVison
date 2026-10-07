'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { adminApi, AdminSessionInfo } from '@/lib/adminApi';

type AuthState = { status: 'loading' } | { status: 'guest' } | { status: 'authed'; session: AdminSessionInfo };

export default function AdminPage() {
    const [auth, setAuth] = useState<AuthState>({ status: 'loading' });

    useEffect(() => {
        adminApi
            .me()
            .then((session) => setAuth({ status: 'authed', session }))
            .catch(() => setAuth({ status: 'guest' }));
    }, []);

    const handleLoggedOut = useCallback(() => setAuth({ status: 'guest' }), []);

    if (auth.status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" aria-label="Loading" />
            </div>
        );
    }

    if (auth.status === 'guest') {
        return <AdminLogin onLoggedIn={(session) => setAuth({ status: 'authed', session })} />;
    }

    return <AdminDashboard session={auth.session} onLoggedOut={handleLoggedOut} />;
}
