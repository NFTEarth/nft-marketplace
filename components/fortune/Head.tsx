import { FC } from 'react'
import NextHead from 'next/head'
import {RoundStatus} from "../../hooks/useFortuneRound";
import {formatEther} from "viem";

type Props = {
  status: RoundStatus
  totalPrize: bigint
  convertedCountdown: string
}

const getTitleText = (status: number, totalPrize: string, convertedCountdown: string) => {
  if (status === RoundStatus.Open) {
    return `${convertedCountdown} • Ξ${totalPrize} • Fortune | NFTEarth`
  }

  if (status === RoundStatus.Drawing) {
    return `Drawing Winner... • Ξ${totalPrize} • Fortune  | NFTEarth`
  }

  if (status === RoundStatus.Drawn) {
    return `Winner Drawn • Ξ${totalPrize} • Fortune  | NFTEarth`
  }

  return `Preparing Game... • Fortune  | NFTEarth`
}

const description = 'Fortune is a nail-biting game that invites players to deposit ETH, NFTE and NFTs from eligible collections into a shared prize pool, and the winner takes all. Find out more at NFTEarth.'
const ogImage = 'https://app.nftearth.exchange/images/fortune-og.png'

const Head: FC<Props> = ({
  status = 0,
  totalPrize= BigInt(0),
  convertedCountdown = '00:00',
}) => {
  const title = getTitleText(status, formatEther(totalPrize), convertedCountdown)
  return (
    <NextHead>
      {/* Title */}
      <title>{title}</title>

      {/* Meta tags */}
      <meta name="description" content={description} />
      <meta name="application-name" content="Fortune" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={title} />
      <meta name="description" content={description} />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="msapplication-TileColor" content="#2B5797" />
      <meta name="msapplication-tap-highlight" content="no" />
      <meta name="theme-color" content="#000000" />

      <link rel="apple-touch-icon" href="/fortune/apple-touch-icon.png" />
      <link rel="apple-touch-icon" sizes="192x192" href="/fortune/icon-192x192.png" />
      <link rel="apple-touch-icon" sizes="384x384" href="/fortune/icon-384x384.png" />
      <link rel="apple-touch-icon" sizes="512x512" href="/fortune/icon-512x512.png" />

      <link rel="icon" type="image/png" sizes="32x32" href="/fortune/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/fortune/favicon-16x16.png" />
      <link rel="shortcut icon" href="/fortune/favicon.ico" />
      <link rel="mask-icon" href="/fortune/fortune.svg" color="#de05ff" />

      <link rel='apple-touch-startup-image' href='/images/fortune-og.png' sizes='1536x2048' />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="https://twitter.com/NFTEarth_L2" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="en" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1600" />
      <meta property="og:image:height" content="900" />
      <meta property="og:image:alt" content="Fortune" />
    </NextHead>
  )
}

export default Head