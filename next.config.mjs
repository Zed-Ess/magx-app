/** @type {import('next').NextConfig} */

const nextConfig = {};
const withPWA = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

export default nextConfig;
