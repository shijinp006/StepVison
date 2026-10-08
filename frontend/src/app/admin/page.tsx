import { AdminApp } from '@/components/admin/AdminApp';
import { getAdminSession } from '@/server/auth/session';

// The login is checked on the server, so the page opens straight onto the
// dashboard (or the sign-in form) without a loading round trip.
export default async function AdminPage() {
    return <AdminApp initialSession={await readSession()} />;
}

// If the session cannot be read (database down, a cookie left by an older
// deployment), show the sign-in form instead of a 500 page. The real error
// still goes to the server logs.
async function readSession() {
    try {
        return await getAdminSession();
    } catch (err) {
        console.error('Could not read the admin session:', err);
        return null;
    }
}
