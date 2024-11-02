/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
      remotePatterns: [
          {
            protocol: 'https',
            hostname: 'files.edgestore.dev',
            port: '',
            pathname: '/rl9gmafi5pbqe7zt/myPublicImages/_public/**',
          },
          
        ], 
  }
};

export default nextConfig;
