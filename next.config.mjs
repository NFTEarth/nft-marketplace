// import { withSentryConfig } from '@sentry/nextjs'
import withPWA from 'next-pwa'
import * as tsImport from 'ts-import'

const loadTS = (filePath) => tsImport.load(filePath)

const { DefaultChain: defaultChain } = await loadTS('./utils/chains.ts')

// const sentryWebpackPluginOptions = {
//   org: process.env.SENTRY_ORG,
//   project: 'javascript-nextjs',
//   silent: true,
// }

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // sentry: {
  //   hideSourceMaps: false,
  // },
  experimental: {
    transpilePackages: [
      '@reservoir0x/reservoir-kit-ui'
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.seadn.io',
      },
      {
        protocol: 'https',
        hostname: 'openseauserdata.com'
      },
   
    ],
  },
  async rewrites() {
    return [
      {
        source: '/:chain/asset/:assetId/buy',
        destination: '/:chain/asset/:assetId',
      },
      {
        source: '/:chain/collection/:contract/sweep',
        destination: '/:chain/collection/:contract',
      },
      {
        source: '/:chain/collection/:contract/mint',
        destination: '/:chain/collection/:contract',
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: "https://nftearth.exchange/polygon",
        permanent: true,
      },
      {
        source: '/collection/:chain/:collection',
        destination: '/:chain/collection/:collection',
        permanent: true,
      },
      {
        source: '/collection/:chain/:collection/:tokenId',
        destination: '/:chain/asset/:collection%3A:tokenId',
        permanent: true,
      },
      {
        source: '/collection-rankings',
        destination: `/${defaultChain.routePrefix}/collection-rankings`,
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'none'",
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ]
  },
}

// export default withSentryConfig(nextConfig, sentryWebpackPluginOptions)

export default withPWA({
  dest: 'public',
  scope: '/',
  disable: process.env.NODE_ENV === 'development',
})(nextConfig)
