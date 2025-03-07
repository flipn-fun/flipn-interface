/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ["antd-mobile"],
  output: "standalone",

  compress: true,
  rewrites: async () => [
    {
      source: "/api/v1/:path*",
      destination: process.env.NEXT_PUBLIC_API + "/:path*"
    },
    {
      source: "/s3/img/:path*",
      destination: process.env.NEXT_PUBLIC_S3_URL_PREFIX + "/:path*"
    }
  ],

  webpack: (config, { dev, isServer, webpack }) => {
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
        splitChunks: {
          chunks: "all",
          minSize: 20000,
          maxSize: 24000000,
          cacheGroups: {
            default: false,
            vendors: false,

            framework: {
              chunks: "all",
              name: "framework",
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true
            },

            antd: {
              chunks: "all",
              name: "antd",
              test: /[\\/]node_modules[\\/](@ant-design|antd|antd-mobile)[\\/]/,
              priority: 30,
              enforce: true
            },

            lib: {
              test: /[\\/]node_modules[\\/]/,
              name: "lib",
              priority: 20
            }
          }
        }
      };
    }
    //https://docs.reown.com/appkit/next/core/installation#extra-configuration
    config.externals.push("pino-pretty", "lokijs", "encoding");

    // Fixes npm packages that depend on `fs` module


    if (config.resolve.fallback) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        "node:fs": false,
        "node:fs/promises": false
      }
    } else {
      config.resolve.fallback = { 
        fs: false,
        "node:fs": false,
        "node:fs/promises": false
      }
    }

    if (config.externals) {
      config.externals.push({ "node:fs": "commonjs node:fs" })
    }

    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^node:/,
        (resource) => {
          resource.request = resource.request.replace(/^node:/, '');
        },
      ),
    );

    return config;
  },
  images: {
    domains: ["picsum.photos", "flipn.s3.us-east-1.amazonaws.com"],
    minimumCacheTTL: 60,
    formats: ["image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**"
      }
    ]
  }
};

module.exports = nextConfig;
