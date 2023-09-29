import {
  Chain,
  arbitrum,
  mainnet,
  optimism,
} from 'wagmi/chains'

export const arbitrumNova = {
  id: 42170,
  name: 'Arbitrum Nova',
  network: 'arbitrum-nova',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    blast: {
      http: ['https://arbitrum-nova.public.blastapi.io'],
      webSocket: ['wss://arbitrum-nova.public.blastapi.io'],
    },
    default: {
      http: ['https://nova.arbitrum.io/rpc'],
    },
    public: {
      http: ['https://nova.arbitrum.io/rpc'],
    },
  },
  blockExplorers: {
    etherscan: { name: 'Arbiscan', url: 'https://nova.arbiscan.io' },
    blockScout: {
      name: 'BlockScout',
      url: 'https://nova-explorer.arbitrum.io/',
    },
    default: { name: 'Arbiscan', url: 'https://nova.arbiscan.io' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 1746963,
    },
  },
} as const satisfies Chain

//CONFIGURABLE: The default export controls the supported chains for the marketplace. Removing
// or adding chains will result in adding more or less chains to the marketplace.
// They are an extension of the wagmi chain objects

export type ReservoirChain = Chain & {
  lightIconUrl: string
  darkIconUrl: string
  reservoirBaseUrl: string
  proxyApi: string
  routePrefix: string
  apiKey?: string
  coingeckoId?: string
  collectionSetId?: string
  community?: string
}

export const DefaultChain: ReservoirChain = {
  ...arbitrum,
  // Any url to display the logo of the chain in light mode
  lightIconUrl: '/icons/arbitrum-icon-dark.svg',
  // Any url to display the logo of the chain in dark mode
  darkIconUrl: '/icons/arbitrum-icon-light.svg',
  // The base url of the reservoir api, this is used in the app when
  // directly interacting with the reservoir indexer servers (in the api proxy for example)
  // or when prefetching server side rendered data
  reservoirBaseUrl: 'https://api-arbitrum.reservoir.tools',
  // Used on the client side portions of the marketplace that need an api key added
  // Prevents the api key from being leaked in the clientside requests
  // If you'd like to disable proxying you can just change the proxyApi to the reservoirBaseUrl
  // Doing so will omit the api key unless further changes are made
  proxyApi: '/api/reservoir/arbitrum',
  // A prefix used in the asset specific routes on the app (tokens/collections)
  routePrefix: 'arbitrum',
  // Reservoir API key which you can generate at https://reservoir.tools/
  // This is a protected key and displays as 'undefined' on the browser
  // DO NOT add NEXT_PUBLIC to the key or you'll risk leaking it on the browser
  apiKey: process.env.RESERVOIR_API_KEY,
  // Coingecko id, used to convert the chain's native prices to usd. Can be found here:
  // https://www.coingecko.com/en/api/documentation#operations-coins-get_coins_list
  coingeckoId: 'arbitrum',
  collectionSetId: process.env.NEXT_PUBLIC_ARBITRUM_COLLECTION_SET_ID,
  community: process.env.NEXT_PUBLIC_ARBITRUM_COMMUNITY,
}

type NFTBridge = {
  proxy: `0x${string}`
  ERC721Factory?: `0x${string}`
  ERC1155Factory?: `0x${string}`
}

export const NFT_BRIDGE : Record<number, NFTBridge> = {
  [mainnet.id]: {
    proxy: '0x90aEC282ed4CDcAab0934519DE08B56F1f2aB4d7',
  },
  [optimism.id]: {
    proxy: '0x653b58c9D23De54E44dCBFbD94C6759CdDa7f93D',
    ERC721Factory: '0xc2106ca72996e49bBADcB836eeC52B765977fd20'
  }
}

export type OFTChain = {
  id: number
  lzId: number
  name: string
  routePrefix?: string
  address: `0x${string}`
  LPNFTE?: `0x${string}`
  xNFTE?: `0x${string}`
  uniProxy?: `0x${string}`
  feeDistributor?: `0x${string}`
  lightIconUrl: string
  darkIconUrl: string
  coingeckoNetworkId: string
}

export const OFT_CHAINS : OFTChain[] = [
  {
    id: arbitrum.id,
    lzId: 110,
    name: arbitrum.name,
    routePrefix: 'arbitrum',
    address: '0x51B902f19a56F0c8E409a34a215AD2673EDF3284',
    LPNFTE: '0x82496243c0a1a39c5c6250bf0115c134Ba76698c',
    xNFTE: '0xE57bd15448C3b2D1dBAD598775DD2F36F93EBf90',
    feeDistributor: '0x9138A2e628f92a42397B3B600E86047AE49aCa98',
    uniProxy: '0x82FcEB07a4D01051519663f6c1c919aF21C27845',
    lightIconUrl: '/icons/arbitrum-icon-dark.svg',
    darkIconUrl: '/icons/arbitrum-icon-light.svg',
    coingeckoNetworkId: 'arbitrum-one'
  },
  {
    id: mainnet.id,
    lzId: 101,
    name: mainnet.name,
    address: '0x8c223a82E07feCB49D602150d7C2B3A4c9630310',
    lightIconUrl: '/icons/eth-icon-dark.svg',
    darkIconUrl: '/icons/eth-icon-light.svg',
    coingeckoNetworkId: 'ethereum'
  }
]

export const FORTUNE_CHAINS = [
  {
    id: arbitrum.id as number,
    address: '0xB11eD4D3b3D8Ace516Ceae0a8D4764BbF2B08c50',
    priceOracle: '0x896397f72bd5c207cab95740d48ca76acf960b16',
    transferManager: '0xf502c99ebdffd2f5fb92c162ea12d741b98402c2'
  }
]

export default [
  DefaultChain,
  {
    ...arbitrumNova,
    lightIconUrl: '/icons/arbitrum-nova-icon-dark.svg',
    darkIconUrl: '/icons/arbitrum-nova-icon-light.svg',
    reservoirBaseUrl: 'https://api-arbitrum-nova.reservoir.tools',
    proxyApi: '/api/reservoir/arbitrum-nova',
    routePrefix: 'arbitrum-nova',
    apiKey: process.env.RESERVOIR_API_KEY,
    coingeckoId: 'ethereum',
    collectionSetId: process.env.NEXT_PUBLIC_ARBITRUM_NOVA_COLLECTION_SET_ID,
    community: process.env.NEXT_PUBLIC_ARBITRUM_NOVA_COMMUNITY,
  },
  {
    ...mainnet,
    name: 'Ethereum',
    lightIconUrl: '/icons/eth-icon-dark.svg',
    darkIconUrl: '/icons/eth-icon-light.svg',
    reservoirBaseUrl: 'https://api.reservoir.tools',
    proxyApi: '/api/reservoir/ethereum',
    routePrefix: 'ethereum',
    apiKey: process.env.RESERVOIR_API_KEY,
    coingeckoId: 'ethereum',
    collectionSetId: process.env.NEXT_PUBLIC_ETH_COLLECTION_SET_ID,
    community: process.env.NEXT_PUBLIC_ETH_COMMUNITY,
  }
] as ReservoirChain[]
