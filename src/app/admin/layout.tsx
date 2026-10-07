import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin | StepVision Hotel Supplies',
    robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <div className="admin-root min-h-screen bg-neutral-50">{children}</div>;
}
