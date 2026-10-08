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
    experimental: {
        // Product images (up to 4 MB) are uploaded through server actions,
        // whose default body limit is 1 MB.
        serverActions: { bodySizeLimit: '6mb' },
    },
};

export default nextConfig;
