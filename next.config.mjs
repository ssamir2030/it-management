/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,

    // Server Actions configuration
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb',
        },
    },

    // Logging configuration
    logging: {
        fetches: {
            fullUrl: false,
        },
    },

    async redirects() {
        return [
            {
                source: '/reports',
                destination: '/admin/reports',
                permanent: true,
            },
        ]
    },
};

export default nextConfig;
