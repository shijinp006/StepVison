'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

interface SiteShellProps {
    header: React.ReactNode;
    footer: React.ReactNode;
    floating: React.ReactNode;
    children: React.ReactNode;
}

// Renders the public site chrome everywhere except the admin area,
// which has its own header.
export const SiteShell: React.FC<SiteShellProps> = ({ header, footer, floating, children }) => {
    const pathname = usePathname();
    const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');

    if (isAdmin) return <>{children}</>;

    return (
        <>
            {header}
            <main className="min-h-screen">{children}</main>
            {footer}
            {floating}
        </>
    );
};
