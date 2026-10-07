// Set in .env.local (see .env.local.example).
const backendUrl = process.env.BACKEND_URL;
if (!backendUrl) {
    throw new Error('BACKEND_URL is not set. Add it to .env.local, e.g. BACKEND_URL=http://localhost:5000');
}

/** @type {import('next').NextConfig} */
const nextConfig = {
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
