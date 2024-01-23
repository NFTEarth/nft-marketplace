import { FC } from 'react'
import NextHead from 'next/head'

type Props = {
  ogImage?: string
  title?: string
  description?: string
}

/**
 * Renders the <head> section of the HTML page, including meta tags, title, and favicon.
 * @param ogImage - The URL of the Open Graph image to be displayed in social media shares.
 * @param title - The title of the page.
 * @param description - The description of the page.
 */
export const Head: FC<Props> = ({
  ogImage = '/res2,png',
  title = 'NFTEarth',
  description = 'NFTEarth | Omnichain NFT Protocol',
}) => {
  return (
    <NextHead>
      {/* CONFIGURABLE: You'll probably want to configure this all to have custom meta tags and title to fit your application */}
      {/* CONFIGURABLE: There are also keywords in pages/_document.ts that you can also configure to fit your application */}

      {/* Title */}
      <title>{title}</title>

      {/* Meta tags */}
      <meta name="description" content={description} />

      <meta name="application-name" content="NFTEarth" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={title} />
      <meta name="description" content={description} />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="msapplication-TileColor" content="#A879FF" />
      <meta name="msapplication-tap-highlight" content="no" />
      <meta name="theme-color" content="#000000" />
      <link rel="manifest" href="/manifest.json" />

      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="apple-touch-icon" sizes="192x192" href="/icon-192x192.png" />
      <link rel="apple-touch-icon" sizes="384x384" href="/icon-384x384.png" />
      <link rel="apple-touch-icon" sizes="512x512" href="/icon-512x512.png" />

      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="shortcut icon" href="/favicon.ico" />
      <link rel="mask-icon" href="/nftearth-icon-gray.svg" color="#A879FF" />

      <link rel='apple-touch-startup-image' href={ogImage} sizes='540x540' />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="https://twitter.com/NFTEarth_L2" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Open Graph */}
      <meta property="og:type" content="https://nftearth.exchange" />
      <meta property="og:determiner" content="the" />
      <meta property="og:locale" content="en" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="540" />
      <meta property="og:image:height" content="540" />
      <meta property="og:image:alt" content="NFTEarth" />
    </NextHead>
  )
}
