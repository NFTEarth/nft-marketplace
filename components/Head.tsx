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
  ogImage = 'https://token-icons.s3.amazonaws.com/0x0f9b80fc3c8b9123d0aef43df58ebdbc034a8901.png',
  title = 'NFTEarth | Omnichain NFT Hub',
  description = 'NFTEarth is an open-source NFT hub built with Reservoir.',
}) => {
  return (
    <NextHead>
      {/* CONFIGURABLE: You'll probably want to configure this all to have custom meta tags and title to fit your application */}
      {/* CONFIGURABLE: There are also keywords in pages/_document.ts that you can also configure to fit your application */}

      {/* Title */}
      <title>{title}</title>

      {/* Meta tags */}
      <meta name="description" content={description} />

      {/* Twitter */}
      <meta name="twitter:card" content="NFTEarth" />
      <meta name="twitter:site" content="@NFTEarth_L2" />
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
      <meta property="og:image:type" content="https://token-icons.s3.amazonaws.com/0x0f9b80fc3c8b9123d0aef43df58ebdbc034a8901.png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="NFTEarth" />
    </NextHead>
  )
}
