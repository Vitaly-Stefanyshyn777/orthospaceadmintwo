/** @type {import('next').NextConfig} */
const nextConfig = {
  // Вимикаємо дубльований рендер в dev (Strict Mode)
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3002",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "test.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "test.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "orthospaceabackendtwo-production.up.railway.app",
        port: "",
        pathname: "/**",
      },
      // {
      //   protocol: "https",
      //   hostname: "rekogrinikfrontbeck-production-a699.up.railway.app",
      //   port: "",
      //   pathname: "/**",
      // },
    ],
  },
};

module.exports = nextConfig;
