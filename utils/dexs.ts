import { CHAIN_IDS } from './chains';

enum DEX {
  SPOOKY='SPOOKY',
  SPIRIT='SPIRIT',
  SPIRIT_V2='SPIRIT_V2',
  EQUALIZER='EQUALIZER',
  EQUALIZERV2='EQUALIZERV2',
  SUSHI='SUSHI',
  SOLIDLY='SOLIDLY',
  TOMB='TOMB',
  ZIP='ZIP',
  VELODROME='VELODROME',
  VELODROME_V2='VELODROME_V2',
  GLACIER='GLACIER',
  SOLISNEK='SOLISNEK',
  SATIN='SATIN',
  THENA='THENA',
  THENAV2='THENAV2',
  XCAL='XCAL',
  SWAPFISH='SWAPFISH',
  ARBIDEX='ARBIDEX',
  SOLIDLY_V2='SOLIDLY_V2',
  SOLIDLIZARD='SOLIDLIZARD',
  RAMSES='RAMSES',
  STERLING='STERLING',
  EQUILIBRE='EQUILIBRE',
  VELOCIMETER='VELOCIMETER',
  VELOCORE='VELOCORE',
  CHRONOS='CHRONOS',
  UNKNOWN='UNKNOWN'
}

const UNKNOWN_DEX: DexInfo = {
  id: DEX.UNKNOWN,
  dexName: 'Unknown Exchange',
  iconPath: '/assets/images/dex/default.jpg'
};

const DEX_DETAILS: {
  [chainId: number]: DexDetails[]
} = {
  [CHAIN_IDS.FANTOM]: [
    {
      id: DEX.SPOOKY,
      dexName: 'Spooky',
      factoryAddress: '0x152eE697f2E276fA89E96742e9bB9aB1F2E61bE3',
      masterChefAddress: '0x2b2929E785374c651a81A63878Ab22742656DcDd',
      rewardsTokenAddress: '0x841fad6eae12c286d1fd18d1d525dffa75c7effe',
      rewardsTokenDecimals: 18,
      rewardsTokenSymbol: 'BOO',
      pendingRewardFunctionName: 'pendingBOO',
      rewardRateFunctionName: 'booPerSecond',
      initCodePairHash: '0xcdf2deca40a0bd56de8e3ce5c7df6727e5b1bf2ac96f283fa9c4b3e6b42ea9d2',
      subgraphUrl: 'https://api.thegraph.com/subgraphs/name/eerieeight/spookyswap',
      iconPath: '/assets/images/dex/spooky.png',
      lpFee: 0.0015,
      swapFee: 0.002,
      tokenInfoUrl: 'https://info.spooky.fi/token/',
      pairInfoUrl: 'https://info.spooky.fi/pair/',
      addLiquidityUrl: 'https://spooky.fi/#/add/',
      addLiquidityWETHSymbol: 'FTM',
      covalentName: 'spookyswap',
      cardColor: '#2d2b51'
    },
    {
      id: DEX.SPIRIT,
      dexName: 'Spirit',
      factoryAddress: '0xEF45d134b73241eDa7703fa787148D9C9F4950b0',
      masterChefAddress: '0x9083EA3756BDE6Ee6f27a6e996806FBD37F6F093',
      rewardsTokenAddress: '0x5cc61a78f164885776aa610fb0fe1257df78e59b',
      rewardsTokenDecimals: 18,
      rewardsTokenSymbol: 'SPIRIT',
      pendingRewardFunctionName: 'pendingSpirit',
      rewardRateFunctionName: 'spiritPerBlock',
      initCodePairHash: '0xe242e798f6cee26a9cb0bbf24653bf066e5356ffeac160907fe2cc108e238617',
      subgraphUrl: 'https://api.thegraph.com/subgraphs/name/layer3org/spiritswap-analytics',
      iconPath: '/assets/images/dex/spirit.png',
      lpFee: 0.0025,
      swapFee: 0.003,
      tokenInfoUrl: 'https://info.spiritswap.finance/token/',
      pairInfoUrl: 'https://info.spiritswap.finance/pair/',
      addLiquidityUrl: 'https://swap.spiritswap.finance/#/add/',
      addLiquidityWETHSymbol: 'FTM',
      covalentName: 'spiritswap',
      cardColor: '#1f3c3e'
    },
    {
      id: DEX.SPIRIT_V2,
      dexName: 'Spirit V2',
      iconPath: '/assets/images/dex/spirit-v2.png',
      addLiquidityUrl: 'https://beta.spiritswap.finance/liquidity',
      cardColor: '#185951'
    },
    {
      id: DEX.EQUALIZER,
      dexName: 'Equalizer',
      iconPath: '/assets/images/dex/equalizer.png',
      addLiquidityUrl: 'https://equalizer.exchange/liquidity/',
      cardColor: '#003178'
    },
    {
      id: DEX.EQUALIZERV2,
      dexName: 'Equalizer V2',
      iconPath: '/assets/images/dex/equalizer.png',
      addLiquidityUrl: 'https://equalizer.exchange/liquidity/',
      cardColor: '#012c4d'
    },
    {
      id: DEX.SUSHI,
      dexName: 'Sushi',
      factoryAddress: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      initCodePairHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      subgraphUrl: 'https://api.thegraph.com/subgraphs/name/sushiswap/fantom-exchange',
      iconPath: '/assets/images/dex/sushi.png',
      lpFee: 0.0025,
      swapFee: 0.003,
      tokenInfoUrl: 'https://analytics-ftm.sushi.com/tokens/',
      pairInfoUrl: 'https://analytics-ftm.sushi.com/pairs/',
      addLiquidityUrl: 'https://app.sushi.com/add/',
      addLiquidityWETHSymbol: 'ETH',
      covalentName: 'sushiswap',
      cardColor: '#3c183c'
    },
    {
      id: DEX.SOLIDLY,
      dexName: 'Solidly',
      iconPath: '/assets/images/dex/solidly.png',
      addLiquidityUrl: 'https://solidly.exchange/liquidity/',
      cardColor: '#212b48'
    },
    {
      id: DEX.TOMB,
      dexName: 'TombSwap',
      iconPath: '/assets/images/dex/tomb.png',
      subgraphUrl: 'https://api.thegraph.com/subgraphs/name/jamjomjim/tomb-finance',
      lpFee: 0.0025,
      swapFee: 0.005,
      tokenInfoUrl: 'https://info.swap.tomb.com/token/',
      pairInfoUrl: 'https://info.swap.tomb.com/pair/',
      addLiquidityUrl: 'https://swap.tomb.com/#/add/',
      cardColor: '#3f1d5f'
    }
  ],
  [CHAIN_IDS.OPTIMISM]: [
    {
      id: DEX.ZIP,
      dexName: 'ZipSwap',
      iconPath: '/assets/images/dex/zip.png',
      subgraphUrl: 'https://api.thegraph.com/subgraphs/name/nonamefits/zipswap',
      lpFee: 0.003,
      swapFee: 0.003,
      tokenInfoUrl: 'https://info.zipswap.fi/token/',
      pairInfoUrl: 'https://info.zipswap.fi/pair/',
      addLiquidityUrl: 'https://zipswap.fi/#/add/',
      addLiquidityWETHSymbol: 'ETH',
      cardColor: '#325078'
    },
    {
      id: DEX.VELODROME,
      dexName: 'Velodrome V1',
      iconPath: '/assets/images/dex/velodrome-v1.png',
      addLiquidityUrl: 'https://v1.velodrome.finance/liquidity/create',
      cardColor: '#48212c'
    },
    {
      id: DEX.VELODROME_V2,
      dexName: 'Velodrome V2',
      iconPath: '/assets/images/dex/velodrome.png',
      addLiquidityUrl: 'https://app.velodrome.finance/deposit/',
      cardColor: '#261134'
    }
  ],
  [CHAIN_IDS.ARBITRUM]: [
    {
      id: DEX.CHRONOS,
      dexName: 'Chronos',
      iconPath: '/assets/images/dex/chronos.png',
      addLiquidityUrl: 'https://app.chronos.exchange/liquidity',
      cardColor: '#1a0c40'
    },
    {
      id: DEX.RAMSES,
      dexName: 'Ramses',
      iconPath: '/assets/images/dex/ramses.png',
      addLiquidityUrl: 'https://app.ramses.exchange/liquidity/create',
      cardColor: '#2c2a2e'
    },
    {
      id: DEX.SOLIDLIZARD,
      dexName: 'SolidLizard',
      iconPath: '/assets/images/dex/solidlizard.png',
      addLiquidityUrl: 'https://solidlizard.finance/liquidity/create',
      cardColor: '#00066c'
    },
    {
      id: DEX.STERLING,
      dexName: 'Sterling',
      iconPath: '/assets/images/dex/sterling.png',
      addLiquidityUrl: 'https://sterling.finance/liquidity/create',
      cardColor: '#4c0000'
    },
    {
      id: DEX.XCAL,
      dexName: '3xcalibur',
      iconPath: '/assets/images/dex/3xcalibur.png',
      addLiquidityUrl: 'https://app.3xcalibur.com/liquidity/create',
      cardColor: '#294460'
    },
    {
      id: DEX.ARBIDEX,
      dexName: 'ArbiDex',
      factoryAddress: '0x1C6E968f2E6c9DEC61DB874E28589fd5CE3E1f2c',
      masterChefAddress: '0xd2bcFd6b84E778D2DE5Bb6A167EcBBef5D053A06',
      rewardsTokenAddress: '0xD5954c3084a1cCd70B4dA011E67760B8e78aeE84',
      rewardsTokenDecimals: 18,
      rewardsTokenSymbol: 'ARX',
      iconPath: '/assets/images/dex/arbidex.png',
      addLiquidityUrl: 'https://arbidex.fi/add/',
      addLiquidityWETHSymbol: 'ETH',
      cardColor: '#211B08'
    },
    {
      id: DEX.SWAPFISH,
      dexName: 'SwapFish',
      factoryAddress: '0x71539D09D3890195dDa87A6198B98B75211b72F3',
      masterChefAddress: '0x33141e87ad2DFae5FBd12Ed6e61Fa2374aAeD029',
      rewardsTokenAddress: '0xb348B87b23D5977E2948E6f36ca07E1EC94d7328',
      rewardsTokenDecimals: 18,
      rewardsTokenSymbol: 'FISH',
      pendingRewardFunctionName: 'pendingCake',
      rewardRateFunctionName: 'cakePerSecond',
      initCodePairHash: '0xfa92cf9f91596341d1d4b5e0903226886fea1aebab892d11d3c2c1d14ae97534',
      subgraphUrl: 'https://api.thegraph.com/subgraphs/name/swapfish/swapfish',
      iconPath: '/assets/images/dex/swapfish.png',
      lpFee: 0.00102,
      swapFee: 0.0017,
      addLiquidityUrl: 'https://swapfish.fi/add/',
      addLiquidityWETHSymbol: 'ETH',
      cardColor: '#2C2C5E'
    }
  ],
  [CHAIN_IDS.BSC]: [
    {
      id: DEX.THENA,
      dexName: 'Thena',
      iconPath: '/assets/images/dex/thena.png',
      addLiquidityUrl: 'https://thena.fi/liquidity/manage',
      cardColor: '#380047'
    },
    {
      id: DEX.THENAV2,
      dexName: 'Thena V2',
      iconPath: '/assets/images/dex/thena.png',
      addLiquidityUrl: 'https://thena.fi/liquidity/manage',
      cardColor: '#25022e'
    }
  ],
  [CHAIN_IDS.MAINNET]: [
    {
      id: DEX.SOLIDLY_V2,
      dexName: 'Solidly',
      iconPath: '/assets/images/dex/solidly-v2.png',
      addLiquidityUrl: 'https://solidly.com/liquidity/create/',
      cardColor: '#232323'
    }
  ],
  [CHAIN_IDS.KAVA]: [
    {
      id: DEX.EQUILIBRE,
      dexName: 'Équilibre',
      iconPath: '/assets/images/dex/equilibre.png',
      addLiquidityUrl: 'https://equilibrefinance.com/liquidity/create',
      cardColor: '#131929'
    }
  ],
  [CHAIN_IDS.CANTO]: [
    {
      id: DEX.VELOCIMETER,
      dexName: 'Velocimeter',
      iconPath: '/assets/images/dex/velocimeter.png',
      addLiquidityUrl: 'https://www.velocimeter.xyz/liquidity/create',
      cardColor: '#0F3639'
    }
  ],
  [CHAIN_IDS.AVAX]: [
    {
      id: DEX.GLACIER,
      dexName: 'Glacier',
      iconPath: '/assets/images/dex/glacier.png',
      addLiquidityUrl: 'https://glacier.exchange/liquidity/create',
      cardColor: '#24041E'
    },
    {
      id: DEX.SOLISNEK,
      dexName: 'SoliSnek',
      iconPath: '/assets/images/dex/solisnek.png',
      addLiquidityUrl: 'https://solisnek.finance/liquidity/create',
      cardColor: '#342302'
    }
  ],
  [CHAIN_IDS.POLYGON]: [
    {
      id: DEX.SATIN,
      dexName: 'Satin',
      iconPath: '/assets/images/dex/satin.png',
      addLiquidityUrl: 'https://satin.exchange/liquidity/create',
      cardColor: '#240504'
    }
  ],
  [CHAIN_IDS.ZKSYNC]: [
    {
      id: DEX.VELOCORE,
      dexName: 'Velocore',
      iconPath: '/assets/images/dex/velocore.png',
      addLiquidityUrl: 'https://app.velocore.xyz/liquidity/create',
      cardColor: '#210500'
    }
  ]
};

const getDexById = (chainId: number, id: DEX) : DexInfo => {
  return DEX_DETAILS[chainId].find(dex => dex.id === id) as DexInfo || UNKNOWN_DEX;
};
const getDexByCovalentName = (chainId: number, covalentName: string) : DexDetails | null => {
  return DEX_DETAILS[chainId].find(dex => dex.covalentName === covalentName) || null;
};
export interface DexInfo {
  id: DEX;
  dexName: string;
  iconPath: string;
  tokenInfoUrl?: string;
  pairInfoUrl?: string;
  addLiquidityUrl?: string;
  addLiquidityWETHSymbol?: string;
}

export interface DexDetails extends Partial<DexInfo> {
  factoryAddress?: string;
  masterChefAddress?: string;
  rewardsTokenAddress?: string;
  rewardsTokenDecimals?: number;
  rewardsTokenSymbol?: string;
  pendingRewardFunctionName?: string;
  rewardRateFunctionName?: string;
  rewardEndFunctionName?: string;
  initCodePairHash?: string;
  subgraphUrl?: string;
  lpFee?: number;
  swapFee?: number;
  covalentName?: string;
  cardColor?: string;
}

export { DEX, DEX_DETAILS, getDexById, getDexByCovalentName, UNKNOWN_DEX };
