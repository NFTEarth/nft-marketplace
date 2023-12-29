import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from 'next/document'
import { getCssText } from '../stitches.config'

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html>
        <Head>
          <style
            id="stitches"
            dangerouslySetInnerHTML={{ __html: getCssText() }}
          />
        </Head>

        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* Meta tags */}
        <meta name="keywords" content="nft, ethereum, protocol" />
        <meta name="keywords" content="NFT, API, Protocol" />

        {/* Favicon */}
        <link
          rel="shortcut icon"
          type="image/png"
          href="https://i.ibb.co/3WmYdg9/NFTE-Icon.png"
        />

        {/* NFTEarth meta tags */}
        <meta property="nftearth:title" content="Omnichain NFT Protocol" />
        <meta property="reservoir:icon" content="/reservoir-source-icon.png" />
        <meta
          property="reservoir:token-url-mainnet"
          content="/ethereum/asset/${contract}:${tokenId}"
        />
        <meta
          property="reservoir:token-url-goerli"
          content="/goerli/asset/${contract}:${tokenId}"
        />
        <meta
          property="reservoir:token-url-polygon"
          content="/polygon/asset/${contract}:${tokenId}"
        />
        <meta
          property="reservoir:token-url-arbitrum"
          content="/arbitrum/asset/${contract}:${tokenId}"
        />
        <meta
          property="reservoir:token-url-optimism"
          content="/optimism/asset/${contract}:${tokenId}"
        />
        <meta
          property="reservoir:token-url-zora"
          content="/zora/asset/${contract}:${tokenId}"
        />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
