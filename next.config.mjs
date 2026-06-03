/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["gamificacaogarcezconsultoria.local", "192.168.10.103"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "dgalywyr863hv.cloudfront.net" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" }
    ]
  }
};

export default nextConfig;
