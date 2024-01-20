import { BigNumber } from "ethers/lib/ethers";

export enum PoolType {
  NFTE = 0,
  EARTHLING = 1,
  ROBOROVER = 2,
  NFW3C = 3,
}

export type PoolTimeRange = {
  rewardsPerHour: BigNumber;
  rewardPoolPerDay: BigNumber;
  rewardPerHour: BigNumber;
  rewardPerDay: BigNumber;
  apr?: number;
}

export type Pool = {
  stakedAmount: BigNumber;
  currentTimeRange: PoolTimeRange
}

export type PoolData = {
  [key in PoolType]: {
    name: string;
    stakedAmount?: number;
    rewardPoolPerHour?: number;
    rewardPoolPerDay?: number;
    rewardPerHour?: number;
    rewardPerDay?: number;
    apr?: number;
  };
};

export enum Amount {
  PerNfte = "PerNfte",
  Max = "Max",
}