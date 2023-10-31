import { useAccount, useBalance, useNetwork } from "wagmi";
import { useEffect } from "react";

import useStore from "hooks/useStore";
import { nfteContractAddresses } from "../utils/constants";

const useNfteBalance = () => {
  const NfteBalance = useStore((state) => state.NfteBalance);
  const setNfteBalance = useStore((state) => state.setNfteBalance);

  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const balance = useBalance({
    enabled: isConnected,
    address: address,
    token: nfteContractAddresses[chain?.id!] as `0x{String}`,
    watch: true,
  });

  useEffect(() => {
    if (balance.data) {
      setNfteBalance(balance.data.value);
    }
  }, [balance.isSuccess, balance.isRefetching, balance.data, setNfteBalance]);

  useEffect(() => {
    if (!isConnected) {
      setNfteBalance(undefined);
    }
  }, [isConnected, setNfteBalance]);

  return { NfteBalance, setNfteBalance };
};

export default useNfteBalance;