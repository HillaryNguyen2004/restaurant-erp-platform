/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/gateway/:path*",
        destination: `${process.env.KONG_URL || "http://localhost:8000"}/:path*`,
      },
    ]
  },
}

export default nextConfig
