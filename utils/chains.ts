import { arbitrum, mainnet, polygon, optimism, fantom, avalanche, zkSync, canto, Chain, bsc } from 'wagmi/chains'
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

type Address = `0x${string}`;

type Contract = {
  address: Address;
  blockCreated?: number;
};

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
  contracts?: {
    ensRegistry?: Contract;
    ensUniversalResolver?: Contract;
    multicall3?: Contract;
    nfte?: Contract;
  };
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
  contracts: {
    nfte: {
      address: '0x8c223a82E07feCB49D602150d7C2B3A4c9630310'
    }
  }
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
    contracts: {
      nfte: {
        address: '0x492Fa53b88614923937B7197C87E0F7F8EEb7B20'
      }
    }
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
    contracts: {
      nfte: {
        address: '0x51B902f19a56F0c8E409a34a215AD2673EDF3284'
      }
    }
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
    contracts: {
      nfte: {
        address: '0x8637725aDa78db0674a679CeA2A5e0A0869EF4A1'
      }
    }
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
    contracts: {
      nfte: {
        address: '0x1912A3504E59d1C1B060bf2d371DEB00b70E8796'
      }
    }
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
    contracts: {
      nfte: {
        address: '0xc2106ca72996e49bBADcB836eeC52B765977fd20'
      }
    }
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
    contracts: {
      nfte: {
        address: '0x2140Ea50bc3B6Ac3971F9e9Ea93A1442665670e4'
      }
    }
  },
] as ReservoirChain[]

export const BRIGED_CHAINS = [
  {
    id: mainnet.id,
    lzId: 101,
    name: mainnet.name,
    address: '0x8c223a82E07feCB49D602150d7C2B3A4c9630310',
    lightIconUrl: '/icons/eth-icon-dark.svg',
    darkIconUrl: '/icons/eth-icon-light.svg',
  },
  {
    id: polygon.id,
    lzId: 109,
    name: polygon.name,
    address: '0x492Fa53b88614923937B7197C87E0F7F8EEb7B20',
    lightIconUrl: '/icons/polygon-icon-dark.svg',
    darkIconUrl: '/icons/polygon-icon-light.svg'
  },
  {
    id: arbitrum.id,
    lzId: 110,
    name: arbitrum.name,
    address: '0x51B902f19a56F0c8E409a34a215AD2673EDF3284',
    lightIconUrl: '/icons/arbitrum-icon-dark.svg',
    darkIconUrl: '/icons/arbitrum-icon-light.svg'
  },
  {
    id: optimism.id,
    lzId: 111,
    name: optimism.name,
    address: '0x8637725aDa78db0674a679CeA2A5e0A0869EF4A1',
    lightIconUrl: '/icons/optimism-icon-dark.svg',
    darkIconUrl: '/icons/optimism-icon-light.svg',
  },
  {
    id: bsc.id,
    lzId: 102,
    name: bsc.name,
    address: '0x1912A3504E59d1C1B060bf2d371DEB00b70E8796',
    lightIconUrl: '/icons/bsc-icon-dark.svg',
    darkIconUrl: '/icons/bsc-icon-light.svg',
  },
  {
    id: base.id,
    lzId: 184,
    name: base.name,
    address: '0xc2106ca72996e49bBADcB836eeC52B765977fd20',
    lightIconUrl: '/icons/base-icon-dark.svg',
    darkIconUrl: '/icons/base-icon-light.svg',
  },
  {
    id: linea.id,
    lzId: 183,
    name: linea.name,
    address: '0x2140Ea50bc3B6Ac3971F9e9Ea93A1442665670e4',
    lightIconUrl: '/icons/linea-icon-dark.svg',
    darkIconUrl: '/icons/linea-icon-light.svg'
  },
  {
    id: avalanche.id,
    lzId: 106,
    name: avalanche.name,
    address: '0xD47E4F1ef1AA4090bc27420BDD5cB379Ced81440',
    lightIconUrl: '/icons/avalanche-icon-dark.svg',
    darkIconUrl: '/icons/avalanche-icon-light.svg'
  },
  // {
  //   id: 5000,
  //   lzId: 181,
  //   name: 'Mantle',
  //   address: '0x3E173b825ADEeF9661920B91A8d50B075Ad51bA5',
  //   lightIconUrl: '/icons/mantle-icon-dark.svg',
  //   darkIconUrl: '/icons/mantle-icon-light.svg'
  // }
]

export default CHAINS
