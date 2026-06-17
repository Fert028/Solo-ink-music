/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    includePaths: ['./src/styles'],
  },
  transpilePackages: ['@vercel/blob', 'undici'],
}

module.exports = nextConfig
