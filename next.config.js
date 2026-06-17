/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    includePaths: ['./src/styles'],
  },
  experimental: {
    serverComponentsExternalPackages: ['@vercel/blob'],
  },
}

export default nextConfig

