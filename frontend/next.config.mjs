// Set in .env.local (see .env.local.example). Accepts a bare host like
// "my-api.vercel.app" (https is assumed) and ignores a trailing slash.
function readBackendUrl() {
    const raw = process.env.BACKEND_URL?.trim();
    if (!raw) {
        throw new Error('BACKEND_URL is not set. Add it to .env.local, e.g. BACKEND_URL=http://localhost:5000');
    }

    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    try {
        return new URL(withProtocol).href.replace(/\/+$/, '');
    } catch {
        throw new Error(`BACKEND_URL is not a valid URL: "${raw}"`);
    }
}

const backendUrl = readBackendUrl();

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Hand the cleaned-up URL to the app so server-side fetches use it too.
    env: { BACKEND_URL: backendUrl },
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
    // Proxy the admin API, the public catalog API and uploaded images to the
    // Express backend so the browser talks to one origin and the session
    // cookies just work.
    async rewrites() {
        return [
            { source: '/api/admin/:path*', destination: `${backendUrl}/api/admin/:path*` },
            { source: '/api/catalog/:path*', destination: `${backendUrl}/api/catalog/:path*` },
            { source: '/uploads/:path*', destination: `${backendUrl}/uploads/:path*` },
        ];
    },
};

export default nextConfig;
