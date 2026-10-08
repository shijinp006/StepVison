'use client';

import React, { useCallback, useState } from 'react';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';
import type { AdminSessionInfo } from '@/data/adminTypes';

interface AdminAppProps {
    initialSession: AdminSessionInfo | null; // null = not logged in
}

// Switches between the sign-in form and the dashboard as the admin logs in and out.
export const AdminApp: React.FC<AdminAppProps> = ({ initialSession }) => {
    const [session, setSession] = useState(initialSession);

    const handleLoggedOut = useCallback(() => setSession(null), []);

    if (!session) {
        return <AdminLogin onLoggedIn={setSession} />;
    }

    return <AdminDashboard session={session} onLoggedOut={handleLoggedOut} />;
};
