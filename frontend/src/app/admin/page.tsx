import { AdminApp } from '@/components/admin/AdminApp';
import { getAdminSession } from '@/server/auth/session';

// The login is checked on the server, so the page opens straight onto the
// dashboard (or the sign-in form) without a loading round trip.
export default async function AdminPage() {
    const session = await getAdminSession();
    return <AdminApp initialSession={session} />;
}
