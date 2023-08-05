import { arbitrum, mainnet, polygon, optimism, Chain, bsc } from 'wagmi/chains'
import {BigNumber} from "ethers";

//Chains that are missing from wagmi:
export const zora = {
  id: 7777777,
  name: 'ZORA',
  network: 'zora',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.zora.co'],
      webSocket: ['wss://rpc.zora.co'],
    },
    public: {
      http: ['https://rpc.zora.co'],
      webSocket: ['wss://rpc.zora.co'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'ZORA',
      url: 'https://explorer.zora.energy',
    },
    default: {
      name: 'ZORA',
      url: 'https://explorer.zora.energy',
    },
  },
} as const satisfies Chain

export const base = {
  id: 8453,
  name: 'Base',
  network: 'base',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://developer-access-mainnet.base.org'],
    },
    public: {
      http: ['https://developer-access-mainnet.base.org'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Basescan',
      url: 'https://basescan.org',
    },
    default: {
      name: 'BaseScan',
      url: 'https://basescan.org',
    },
  },
} as const satisfies Chain

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

export const linea = {
  id: 59144,
  name: 'Linea',
  network: 'linea',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.linea.build'],
    },
    public: {
      http: ['https://rpc.linea.build'],
    },
    infura: {
      http: ['https://linea-mainnet.infura.io/v3'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Linea Explorer',
      url: 'https://explorer.linea.build',
    },
    default: {
      name: 'Linea Explorer',
      url: 'https://explorer.linea.build',
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
  ...mainnet,
  // Any url to display the logo of the chain in light mode
  lightIconUrl: '/icons/eth-icon-dark.svg',
  // Any url to display the logo of the chain in dark mode
  darkIconUrl: '/icons/eth-icon-light.svg',
  // The base url of the reservoir api, this is used in the app when
  // directly interacting with the reservoir indexer servers (in the api proxy for example)
  // or when prefetching server side rendered data
  reservoirBaseUrl: 'https://api.reservoir.tools',
  // Used on the client side portions of the marketplace that need an api key added
  // Prevents the api key from being leaked in the clientside requests
  // If you'd like to disable proxying you can just change the proxyApi to the reservoirBaseUrl
  // Doing so will omit the api key unless further changes are made
  proxyApi: '/api/reservoir/ethereum',
  // A prefix used in the asset specific routes on the app (tokens/collections)
  routePrefix: 'ethereum',
  // Reservoir API key which you can generate at https://reservoir.tools/
  // This is a protected key and displays as 'undefined' on the browser
  // DO NOT add NEXT_PUBLIC to the key or you'll risk leaking it on the browser
  apiKey: process.env.RESERVOIR_API_KEY,
  // Coingecko id, used to convert the chain's native prices to usd. Can be found here:
  // https://www.coingecko.com/en/api/documentation#operations-coins-get_coins_list
  coingeckoId: 'ethereum',
  collectionSetId: process.env.NEXT_PUBLIC_ETH_COLLECTION_SET_ID,
  community: process.env.NEXT_PUBLIC_ETH_COMMUNITY,
}

const CHAINS = [
  DefaultChain,
  {
    ...polygon,
    lightIconUrl: '/icons/polygon-icon-dark.svg',
    darkIconUrl: '/icons/polygon-icon-light.svg',
    reservoirBaseUrl: 'https://api-polygon.reservoir.tools',
    proxyApi: '/api/reservoir/polygon',
    routePrefix: 'polygon',
    apiKey: process.env.RESERVOIR_API_KEY,
    coingeckoId: 'matic-network',
    collectionSetId: process.env.NEXT_PUBLIC_POLYGON_COLLECTION_SET_ID,
    community: process.env.NEXT_PUBLIC_POLYGON_COMMUNITY,
  },
  {
    ...arbitrum,
    name: 'Arbitrum',
    lightIconUrl: '/icons/arbitrum-icon-dark.svg',
    darkIconUrl: '/icons/arbitrum-icon-light.svg',
    reservoirBaseUrl: 'https://api-arbitrum.reservoir.tools',
    proxyApi: '/api/reservoir/arbitrum',
    routePrefix: 'arbitrum',
    apiKey: process.env.RESERVOIR_API_KEY,
    coingeckoId: 'arbitrum-iou',
    collectionSetId: process.env.NEXT_PUBLIC_ARBITRUM_COLLECTION_SET_ID,
    community: process.env.NEXT_PUBLIC_ARBITRUM_COMMUNITY,
  },
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
    ...optimism,
    name: 'Optimism',
    lightIconUrl: '/icons/optimism-icon-dark.svg',
    darkIconUrl: '/icons/optimism-icon-light.svg',
    reservoirBaseUrl: 'https://api-optimism.reservoir.tools',
    proxyApi: '/api/reservoir/optimism',
    routePrefix: 'optimism',
    apiKey: process.env.RESERVOIR_API_KEY,
    coingeckoId: 'optimism',
    collectionSetId: process.env.NEXT_PUBLIC_OPTIMISM_COLLECTION_SET_ID,
    community: process.env.NEXT_PUBLIC_OPTIMISM_COMMUNITY,
  },
  {
    ...zora,
    name: 'Zora',
    lightIconUrl: '/icons/zora-icon-dark.svg',
    darkIconUrl: '/icons/zora-icon-light.svg',
    reservoirBaseUrl: 'https://api-zora.reservoir.tools',
    proxyApi: '/api/reservoir/zora',
    routePrefix: 'zora',
    apiKey: process.env.RESERVOIR_API_KEY,
    coingeckoId: 'ethereum',
  },
  {
    ...bsc,
    lightIconUrl: '/icons/bsc-icon-dark.svg',
    darkIconUrl: '/icons/bsc-icon-light.svg',
    reservoirBaseUrl: 'https://api-bsc.reservoir.tools',
    proxyApi: '/api/reservoir/bsc',
    routePrefix: 'bsc',
    apiKey: process.env.RESERVOIR_API_KEY,
    coingeckoId: 'binancecoin',
    collectionSetId: process.env.NEXT_PUBLIC_BSC_COLLECTION_SET_ID,
    community: process.env.NEXT_PUBLIC_BSC_COMMUNITY,
  },
  {
    ...base,
    lightIconUrl: '/icons/base-icon-dark.svg',
    darkIconUrl: '/icons/base-icon-light.svg',
    reservoirBaseUrl: 'https://api-base.reservoir.tools',
    proxyApi: '/api/reservoir/base',
    routePrefix: 'base',
    apiKey: process.env.RESERVOIR_API_KEY,
    coingeckoId: 'ethereum',
    collectionSetId: process.env.NEXT_PUBLIC_BASE_COLLECTION_SET_ID,
    community: process.env.NEXT_PUBLIC_BASE_COMMUNITY,
  },
  {
    ...linea,
    lightIconUrl: '/icons/linea-icon-dark.svg',
    darkIconUrl: '/icons/linea-icon-light.svg',
    reservoirBaseUrl: 'https://api-linea.reservoir.tools',
    proxyApi: '/api/reservoir/linea',
    routePrefix: 'linea',
    apiKey: process.env.RESERVOIR_API_KEY,
    coingeckoId: 'ethereum',
    collectionSetId: process.env.NEXT_PUBLIC_LINEA_COLLECTION_SET_ID,
    community: process.env.NEXT_PUBLIC_LINEA_COMMUNITY,
  },
] as ReservoirChain[]


const POLLING_INTERVAL = 2000;

const CHAIN_IDS = Object.freeze({
  MAINNET: 1,
  ROPSTEN: 3,
  RINKEBY: 4,
  GÖRLI: 5,
  OPTIMISM: 10,
  KOVAN: 42,
  POLYGON: 137,
  ZKSYNC: 324,
  MATIC_TESTNET: 80001,
  FANTOM: 250,
  FANTOM_TESTNET: 4002,
  XDAI: 100,
  BSC: 56,
  BSC_TESTNET: 97,
  ARBITRUM: 42161,
  ARBITRUM_TESTNET: 79377087078960,
  MOONBEAM_TESTNET: 1287,
  AVAX: 43114,
  HECO: 128,
  HECO_TESTNET: 256,
  HARMONY: 1666600000,
  HARMONY_TESTNET: 1666700000,
  OKEX: 66,
  OKEX_TESTNET: 65,
  KAVA: 2222,
  CANTO: 7700
});

const CHAIN_ICON_PATHS = {
  [CHAIN_IDS.MAINNET]: '/assets/images/chains/ethereum.png',
  [CHAIN_IDS.ROPSTEN]: '/assets/images/chains/ropsten-chain.jpg',
  [CHAIN_IDS.RINKEBY]: '/assets/images/chains/rinkeby-chain.jpg',
  [CHAIN_IDS.GÖRLI]: '/assets/images/chains/goerli-chain.jpg',
  [CHAIN_IDS.KOVAN]: '/assets/images/chains/kovan-chain.jpg',
  [CHAIN_IDS.FANTOM]: '/assets/images/chains/fantom.png',
  [CHAIN_IDS.OPTIMISM]: '/assets/images/chains/optimism.png',
  [CHAIN_IDS.FANTOM_TESTNET]: '/assets/images/chains/fantom-chain.jpg',
  [CHAIN_IDS.BSC]: '/assets/images/chains/binance-smart-chain.png',
  [CHAIN_IDS.BSC_TESTNET]: '/assets/images/chains/binance-smart-chain.png',
  [CHAIN_IDS.POLYGON]: '/assets/images/chains/polygon.png',
  [CHAIN_IDS.MATIC_TESTNET]: '/assets/images/chains/matic-chain.jpg',
  [CHAIN_IDS.XDAI]: '/assets/images/chains/xdai-chain.jpg',
  [CHAIN_IDS.ARBITRUM]: '/assets/images/chains/arbitrum-chain.png',
  [CHAIN_IDS.AVAX]: '/assets/images/chains/avax.png',
  [CHAIN_IDS.HECO]: '/assets/images/chains/heco-chain.jpg',
  [CHAIN_IDS.HECO_TESTNET]: '/assets/images/chains/heco-chain.jpg',
  [CHAIN_IDS.HARMONY]: '/assets/images/chains/harmony-chain.jpg',
  [CHAIN_IDS.HARMONY_TESTNET]: '/assets/images/chains/harmony-chain.jpg',
  [CHAIN_IDS.OKEX]: '/assets/images/chains/okex-chain.jpg',
  [CHAIN_IDS.OKEX_TESTNET]: '/assets/images/chains/okex-chain.jpg',
  [CHAIN_IDS.KAVA]: '/assets/images/chains/kava.png',
  [CHAIN_IDS.CANTO]: '/assets/images/chains/canto.png',
  [CHAIN_IDS.ZKSYNC]: '/assets/images/chains/zksync-era.png'
};

interface ChainDetails {
  chainId: string
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  minimumTxAmount?: BigNumber
  defaultBlocksPerSecond?: BigNumber
  rpcUrls: string[]
  blockExplorerUrls: string[]
}

const CHAIN_DETAILS: {
  // TODO: should type correctly
  [chainId: number]: ChainDetails
} = {
  [CHAIN_IDS.MAINNET]: {
    chainId: '0x1',
    chainName: 'Ethereum',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    minimumTxAmount: BigNumber.from(10).pow(16),
    defaultBlocksPerSecond: BigNumber.from(10).pow(18).div(13),
    rpcUrls: ['https://rpc.ankr.com/eth'],
    blockExplorerUrls: ['https://etherscan.io']
  },
  [CHAIN_IDS.ARBITRUM]: {
    chainId: '0xa4b1',
    chainName: 'Arbitrum',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    minimumTxAmount: BigNumber.from(10).pow(16),
    defaultBlocksPerSecond: BigNumber.from(10).pow(18),
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://arbiscan.io']
  },
  [CHAIN_IDS.CANTO]: {
    chainId: '0x1e14',
    chainName: 'Canto',
    nativeCurrency: {
      name: 'Canto',
      symbol: 'CANTO',
      decimals: 18
    },
    minimumTxAmount: BigNumber.from(10).pow(18),
    defaultBlocksPerSecond: BigNumber.from(10).pow(18).div(6),
    rpcUrls: ['https://canto.slingshot.finance'],
    blockExplorerUrls: ['https://evm.explorer.canto.io']
  },
  [CHAIN_IDS.OPTIMISM]: {
    chainId: '0xa',
    chainName: 'Optimism',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    minimumTxAmount: BigNumber.from(10).pow(16),
    defaultBlocksPerSecond: BigNumber.from(10).pow(18),
    rpcUrls: ['https://rpc.ankr.com/optimism'],
    blockExplorerUrls: ['https://optimistic.etherscan.io']
  },
  [CHAIN_IDS.FANTOM]: {
    chainId: '0xfa',
    chainName: 'Fantom',
    nativeCurrency: {
      name: 'Fantom',
      symbol: 'FTM',
      decimals: 18
    },
    defaultBlocksPerSecond: BigNumber.from(10).pow(18),
    rpcUrls: ['https://fantom.publicnode.com'],
    blockExplorerUrls: ['https://ftmscan.com']
  },
  [CHAIN_IDS.BSC]: {
    chainId: '0x38',
    chainName: 'BNB Chain',
    nativeCurrency: {
      name: 'Binance Coin',
      symbol: 'BNB',
      decimals: 18
    },
    minimumTxAmount: BigNumber.from(10).pow(16),
    defaultBlocksPerSecond: BigNumber.from(10).pow(18).div(3),
    rpcUrls: ['https://bsc-dataseed.binance.org'],
    blockExplorerUrls: ['https://bscscan.com']
  },
  [CHAIN_IDS.KAVA]: {
    chainId: '0x8ae',
    chainName: 'Kava',
    nativeCurrency: {
      name: 'Kava',
      symbol: 'KAVA',
      decimals: 18
    },
    minimumTxAmount: BigNumber.from(10).pow(16),
    defaultBlocksPerSecond: BigNumber.from(10).pow(18).mul(2).div(13),
    rpcUrls: ['https://evm.kava.io'],
    blockExplorerUrls: ['https://explorer.kava.io']
  },
  [CHAIN_IDS.POLYGON]: {
    chainId: '0x89',
    chainName: 'Polygon',
    nativeCurrency: {
      name: 'Matic',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: [
      'https://rpc.ankr.com/polygon'
    ],
    blockExplorerUrls: ['https://polygonscan.com']
  },
  [CHAIN_IDS.ZKSYNC]: {
    chainId: '0x144',
    chainName: 'zkSync Era',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    minimumTxAmount: BigNumber.from(10).pow(16),
    defaultBlocksPerSecond: BigNumber.from(10).pow(18),
    rpcUrls: ['https://mainnet.era.zksync.io'],
    blockExplorerUrls: ['https://explorer.zksync.io']
  },
  [CHAIN_IDS.HECO]: {
    chainId: '0x80',
    chainName: 'Heco',
    nativeCurrency: {
      name: 'Heco Token',
      symbol: 'HT',
      decimals: 18
    },
    rpcUrls: ['https://http-mainnet.hecochain.com'],
    blockExplorerUrls: ['https://hecoinfo.com']
  },
  [CHAIN_IDS.XDAI]: {
    chainId: '0x64',
    chainName: 'xDai',
    nativeCurrency: {
      name: 'xDai Token',
      symbol: 'xDai',
      decimals: 18
    },
    rpcUrls: ['https://rpc.xdaichain.com'],
    blockExplorerUrls: ['https://blockscout.com/poa/xdai']
  },
  [CHAIN_IDS.HARMONY]: {
    chainId: '0x63564C40',
    chainName: 'Harmony One',
    nativeCurrency: {
      name: 'One Token',
      symbol: 'ONE',
      decimals: 18
    },
    rpcUrls: ['https://api.s0.t.hmny.io'],
    blockExplorerUrls: ['https://explorer.harmony.one/']
  },
  [CHAIN_IDS.AVAX]: {
    chainId: '0xA86A',
    chainName: 'Avalanche',
    nativeCurrency: {
      name: 'Avalanche Token',
      symbol: 'AVAX',
      decimals: 18
    },
    rpcUrls: ['https://rpc.ankr.com/avalanche'],
    blockExplorerUrls: ['https://snowtrace.io']
  },
  [CHAIN_IDS.OKEX]: {
    chainId: '0x42',
    chainName: 'OKEx',
    nativeCurrency: {
      name: 'OKEx Token',
      symbol: 'OKT',
      decimals: 18
    },
    rpcUrls: ['https://exchainrpc.okex.org'],
    blockExplorerUrls: ['https://www.oklink.com/okexchain']
  }
};

const CHAIN_LABELS: { [chainId: number]: string } = {
  [CHAIN_IDS.MAINNET]: 'Ethereum',
  [CHAIN_IDS.RINKEBY]: 'Rinkeby',
  [CHAIN_IDS.ROPSTEN]: 'Ropsten',
  [CHAIN_IDS.GÖRLI]: 'Görli',
  [CHAIN_IDS.KOVAN]: 'Kovan',
  [CHAIN_IDS.FANTOM]: 'Fantom',
  [CHAIN_IDS.OPTIMISM]: 'Optimism',
  [CHAIN_IDS.ARBITRUM]: 'Arbitrum',
  [CHAIN_IDS.FANTOM_TESTNET]: 'Fantom Testnet',
  [CHAIN_IDS.POLYGON]: 'Polygon',
  [CHAIN_IDS.ZKSYNC]: 'zkSync Era',
  [CHAIN_IDS.MATIC_TESTNET]: 'Matic Testnet',
  [CHAIN_IDS.XDAI]: 'xDai',
  [CHAIN_IDS.BSC]: 'BNB\xa0Chain',
  [CHAIN_IDS.BSC_TESTNET]: 'BSC Testnet',
  [CHAIN_IDS.AVAX]: 'Avalanche',
  [CHAIN_IDS.HECO]: 'HECO',
  [CHAIN_IDS.HECO_TESTNET]: 'HECO Testnet',
  [CHAIN_IDS.HARMONY]: 'Harmony',
  [CHAIN_IDS.HARMONY_TESTNET]: 'Harmony Testnet',
  [CHAIN_IDS.OKEX]: 'OKExChain',
  [CHAIN_IDS.OKEX_TESTNET]: 'OKExChain',
  [CHAIN_IDS.KAVA]: 'Kava',
  [CHAIN_IDS.CANTO]: 'Canto'
};

const ACTIVE_CHAINS = [
  CHAIN_IDS.FANTOM,
  CHAIN_IDS.OPTIMISM,
  CHAIN_IDS.ARBITRUM,
  CHAIN_IDS.CANTO,
  CHAIN_IDS.BSC,
  CHAIN_IDS.MAINNET,
  CHAIN_IDS.KAVA,
  CHAIN_IDS.AVAX,
  CHAIN_IDS.POLYGON,
  CHAIN_IDS.ZKSYNC
];

export {
  CHAIN_IDS,
  POLLING_INTERVAL,
  CHAIN_ICON_PATHS,
  CHAIN_DETAILS,
  CHAIN_LABELS,
  ACTIVE_CHAINS
};

export default CHAINS
