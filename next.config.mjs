/** @type {import('next').NextConfig} */
import path from "path";
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
      },
    ],
  },
  webpack: (config) => {
    // Resolve aliases
    config.resolve.alias["@"] = "/src"; // Adjust the path as needed

    return config;
  },
};

export default nextConfig;
