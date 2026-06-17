/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    includePaths: ['./src/styles'],
  },
  transpilePackages: ['@vercel/blob'],
  experimental: {
    serverComponentsExternalPackages: ['@vercel/blob'],
  },
}

export default nextConfig

