import { BalancerSDK, BalancerSdkConfig, Network } from '@balancer-labs/sdk';

const config: BalancerSdkConfig = {
  network: Network.BASE,
  rpcUrl: `https://base.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`,
};
const balancer = new BalancerSDK(config);