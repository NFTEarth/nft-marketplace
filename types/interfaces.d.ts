import { Web3Provider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';

import Subgraph from 'subgraph';
import { DexInfo } from 'config/web3/dexs';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { VaultDetails } from 'config/web3/contracts/vault-details';
import { ZERO_ADDRESS } from 'utils/address';
import { TokenPriceEntry } from 'tarot-router/tokenPrices';
import { DistributorDetails } from 'utils/constants';

type BorrowableContract = Contract;
type UniswapV2PairContract = Contract;
type ERC20Contract = Contract;

interface Collateral {
  exchangeRate: string;
  id: Address;
  liquidationPenalty: string;
  safetyMargin: string;
  totalBalance: string;
  totalBalanceUSD: string;
}

interface Underlying {
  decimals: string;
  derivedUSD: string;
  id: Address;
  name: string;
  symbol: string;
}

interface Pair {
  derivedUSD: string;
  reserve0: string;
  reserve1: string;
  reserveUSD: string;
  token0Price: string;
  token1Price: string;
  dexAPR: number;
  isVaultToken: boolean;
  rewardsToken?: Underlying;
  dex: DexInfo;
  uniswapV2PairAddress: Address;
  token0: TarotToken;
  token1: TarotToken;
  totalSupply: string;
}

export enum SortType {
  DEFAULT='default',
  DEPOSITED_LP='deposited-lp',
  UNLEVERAGED_APR='unleveraged-apr',
  LEVERAGED_APR='leveraged-apr',
  UTILIZATION='utilization',
  SUPPLY_APR='supply-apr',
  BORROW_APR='borrow-apr',
  FARMING_APR='farming-apr',
}

export enum FilterType {
  DEFAULT='default',
  SPIRIT='spirit',
  SPIRIT_V2='spirit-v2',
  EQUALIZER='equalizer',
  EQUALIZERV2='equalizer-v2',
  SPOOKY='spooky',
  SPOOKY_V2='spooky-v2',
  SPOOKY_V3='spooky-v3',
  SUSHI='sushi',
  TOMB='tomb',
  SPIRIT_BOOSTED='spirit-boosted',
  OXD_V1='oxd-v1',
  OXD='oxd',
  VEDAO='vedao',
  LIF3='lif3',
  BASED='based',
  T2OMB='t2omb',
  T3OMB='t3omb',
  SOLIDEX='solidex',
  VELODROME='velodrome',
  VELODROME_V2='velodrome-v2',
  GLACIER='glacier',
  SOLISNEK='solisnek',
  SATIN='satin',
  ZIP='zip',
  XCAL='excalibur',
  SWAPFISH='swapfish',
  ARBIDEX='arbidex',
  THENA='thena',
  THENAV2='thena-v2',
  MONOLITH='monolith',
  SOLIDLIZARD='solidlizard',
  RAMSES='ramses',
  ENNEAD='ennead',
  STERLING='sterling',
  SOLIDLY_V2='solidly-v2',
  EQUILIBRE='equilibre',
  VELOCIMETER='velocimeter',
  VELOCORE='velocore',
  CHRONOS='chronos'
}

export enum PairFilterType {
  ALL='all',
  STABLE='stable',
  VOLATILE='volatile'
}

export interface FarmingPool {
  id: string;
  distributor: {
    id: string;
  };
  epochAmount: string;
  epochBegin: string;
  segmentLength: string;
  sharePercentage: string;
  vestingBegin: string;
}

export type Address = string;
export type RouterContract = Contract;
export type FactoryContract = Contract;
export type TarotPriceOracleContract = Contract;
export type UniswapV2FactoryContract = Contract;
export type CollateralContract = Contract;
export type MerkleDistributorContract = Contract;
export type FarmingPoolContract = Contract;
export type VaultTokenContract = Contract;
export type MasterChefContract = Contract;
export type ClaimAggregatorContract = Contract;
export type ClaimableContract = Contract;
export type LiquidityGeneratorContract = Contract;
export type SupplyVaultContract = Contract;
export type FeeDistributorContract = Contract;
export type TarotContract = Contract;
export type XStakingPoolControllerContract = Contract;
export type TowerPoolFactoryContract = Contract;
export type TarotMigratorContract = Contract;

export type LendingPool = {
  uniswapV2Pair: UniswapV2PairContract;
  tokenA: ERC20Contract;
  tokenB: ERC20Contract;
  collateral: CollateralContract;
  borrowableA: BorrowableContract;
  borrowableB: BorrowableContract;
  farmingPoolA: FarmingPoolContract;
  farmingPoolB: FarmingPoolContract;
  vaultToken: VaultTokenContract;
  pendingReward?: Promise<number>;
  reinvestBountyFactor?: Promise<number>;
  vaultTotalSupply?: Promise<number>;
  vaultRewardRate?: Promise<number>;
  vaultActive?: Promise<boolean>;
  vaultAPR?: Promise<number>;
  reinvestBounty?: Promise<number>;
}

export enum PoolTokenType {
  Collateral = 'collateral',
  BorrowableA = 'borrowable0',
  BorrowableB = 'borrowable1'
}

export enum ApprovalType {
  POOL_TOKEN,
  UNDERLYING,
  BORROW
}

export interface Changes {
  changeBorrowedA: number;
  changeBorrowedB: number;
  changeCollateral: number;
}
export const NO_CHANGES = {
  changeBorrowedA: 0,
  changeBorrowedB: 0,
  changeCollateral: 0
};

export interface TarotRouterConfigInterface {
  subgraph: Subgraph;
  chainId: number;
  priceInverted: boolean;
  library?: Web3Provider;
}

export interface Borrowable {
  accrualTimestamp: string;
  borrowIndex: string;
  borrowRate: string;
  exchangeRate: string;
  farmingPool: FarmingPool;
  id: Address;
  kinkBorrowRate: string;
  kinkUtilizationRate: string;
  reserveFactor: string;
  totalBalance: string;
  totalBalanceUSD: string;
  totalBorrows: string;
  totalBorrowsUSD: string;
  underlying: Underlying;
}

export interface LendingPoolData {
  [PoolTokenType.BorrowableA]: Borrowable;
  [PoolTokenType.BorrowableB]: Borrowable;
  [PoolTokenType.Collateral]: Collateral;
  id: string;
  pair: Pair;
}

export interface CollateralPosition {
  balance: string;
  collateral: {
    lendingPool: {
      id: Address;
    }
  }
}

export interface SupplyPosition {
  balance: string;
  borrowable: {
    underlying: {
      id: Address
    };
    lendingPool: {
      id: Address;
    }
  }
}

export interface BorrowPosition {
  borrowBalance: string;
  borrowIndex: string;
  borrowable: {
    underlying: {
      id: Address
    };
    lendingPool: {
      id: Address;
    }
  }
}

export interface UserData {
  collateralPositions: { [key in Address]: CollateralPosition };
  supplyPositions: { [key in Address]: { [key in PoolTokenType]?: SupplyPosition } };
  borrowPositions: { [key in Address]: { [key in PoolTokenType]?: BorrowPosition } };
}

export interface TvlData {
  totalBalanceUSD: string;
  totalBorrowsUSD: string;
  totalSupplyUSD: string;
}

export interface TarotToken {
  id: string;
}

export interface ClaimEvent {
  amount: number;
  transactionHash: string;
}

export interface BigAmount {
  amount: BigNumber,
  decimals: BigNumber
}

export const ZERO_BIG_AMOUNT: BigAmount = {
  amount: BigNumber.from(0),
  decimals: BigNumber.from(18)
};

export type SupplyVault = {
  totalUnderlying: BigAmount;
  supplyRate: BigAmount;
  shareValuedAsUnderlying: BigAmount;
  feeDistributorRate?: BigAmount;
};

export const EMPTY_SUPPLY_VAULT: SupplyVault = {
  shareValuedAsUnderlying: ZERO_BIG_AMOUNT,
  totalUnderlying: ZERO_BIG_AMOUNT,
  supplyRate: ZERO_BIG_AMOUNT
};

export type XStakingPool = {
  stakedBalance: BigAmount;
  rewardTokensPerSecond: BigAmount;
  rewardTokenPrice: number;
  start: number;
  end: number;
}

export const EMPTY_X_STAKING_POOL: XStakingPool = {
  stakedBalance: ZERO_BIG_AMOUNT,
  rewardTokensPerSecond: ZERO_BIG_AMOUNT,
  rewardTokenPrice: 0,
  start: 0,
  end: 0
};

export type XStakingPoolAccountInfo = {
  pendingReward: BigAmount;
  stakedBalance: BigAmount;
}

export const EMPTY_X_STAKING_POOL_ACCOUNT_INFO: XStakingPoolAccountInfo = {
  pendingReward: ZERO_BIG_AMOUNT,
  stakedBalance: ZERO_BIG_AMOUNT
};

export type VaultRewardsInfo = {
  pendingRewards: number[];
  reinvestBounties: number[];
  rewardsTokensSymbols: string[];
  rewardsTokensAddresses: string[];
  rewardsTokensDecimals: number[];
}

export type PoolDisplayDetails = {
  id: string;
  totalCollateral: number,
  totalLp: BigNumberish,
  totalCollateralUSD: number,
  totalSupplyUSD: [number, number];
  excessSupply: [string, string];
  totalBorrows: [string, string];
  totalBorrowedUSD: [number, number];
  utilization: [number, number];
  supplyAPR: [number, number];
  borrowAPR: [number, number];
  currSupplyAPR: [number, number];
  currBorrowAPR: [number, number];
  unleveragedAPR: number;
  leveragedAPR: number;
  boostMultiplier?: BigNumberish;
  multiplier: number;
  vaultDetails?: VaultDetails;
  dex: DexInfo;
  symbol: [string, string];
  oracleIsInitialized: boolean;
  vaultAPR: number;
  dexAPR: number;
  hasFarming: [boolean, boolean];
  tokenIcon: [string, string];
  lendingPool: LendingPoolData;
  lendingPoolUrl: string;
  vaultActive: boolean;
  farmingPoolAPR: [number, number];
  pendingRewards: number[];
  reinvestBounties: number[];
  rewardsTokensDecimals: number[];
  rewardsTokensSymbols: string[];
  rewardsTokensAddresses: string[];
  vaultTokenExchangeRate: BigNumberish;
  collateralExchangeRate: BigNumberish;
  borrowableExchangeRate0: BigNumberish;
  borrowableExchangeRate1: BigNumberish;
  accrualTimestamp: [number, number];
  borrowRate: [BigNumberish, BigNumberish];
  kinkBorrowRate: [BigNumberish, BigNumberish];
  nextKinkBorrowRate: [BigNumberish, BigNumberish];
  rewardSpeed: [number, number];
  poolDisabled: boolean;
  poolDeactivated: boolean;
  depositFeeBps: BigNumberish;
  collateralUnderlyingReserves?: [BigNumberish, BigNumberish];
  twapReserves?: [BigNumberish, BigNumberish];
  priceFactor: number;
  stable: boolean;
  reinvestFee?: number;
  withdrawFee?: number;
}
export interface PoolDisplayDetailsMap {
  [key: string]: PoolDisplayDetails;
}
export interface SupplyVaultsMap {
  [key: string]: SupplyVault;
}

export interface UserDistribution {
  config: DistributorDetails;
  totalClaim: BigNumberish;
  totalDistribution: BigNumberish;
  availableClaimable: BigNumberish;
  claimed: BigNumberish;
  claimableSharePct: BigNumberish;
}

export interface UserDistributionMap {
  [distributorAddress: string]: UserDistribution;
}

export type TokenValue = {
  valueUSD: BigNumber;
  valueETH: BigNumber;
}

export const ZERO = BigNumber.from(0);
export const TEN_18 = BigNumber.from(10).pow(18);
export const TEN_27 = BigNumber.from(10).pow(27);

export const EMPTY_TOKEN_PRICE_ENTRY: TokenPriceEntry = {
  address: ZERO_ADDRESS,
  decimals: 18,
  priceETH: {
    path: [],
    value: ZERO
  },
  priceUSD: {
    path: [],
    value: ZERO
  }
};

export type BoostMaxxPoolInfo = {
  id: string;
  gauge: string;
  symbol: string;
  symbol0: string;
  symbol1: string;
  token0: string;
  token1: string;
  tokenIconA: string;
  tokenIconB: string;
  reserves: [BigNumber, BigNumber];
  reservesUSD: [BigNumber, BigNumber];
  totalDeposits: BigNumber;
  totalDepositsUSD: BigNumber;
  rewardRate: BigNumber;
  derivedBalance: BigNumber;
  derivedSupply: BigNumber;
  gaugeSupply: BigNumber;
  apr: BigNumber;
  userDeposits: BigNumber;
  userDepositsUSD: BigNumber;
  pendingReward: BigNumber;
  pendingRewardUSD: BigNumber;
  userLpBalance: BigNumber;
  totalSupply: BigNumber;
  decimals0: number;
  decimals1: number;
}
