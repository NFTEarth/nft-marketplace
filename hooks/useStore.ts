import { BigNumberish } from "ethers";
import { create } from 'zustand'
import { devtools } from "zustand/middleware";



interface AppState {
  autoConnecting: boolean;
  setAutoConnecting: (autoConnecting: boolean) => void;

  NfteBalance: BigNumberish | undefined;
  setNfteBalance: (balance: BigNumberish | undefined) => void;
}

const useStore = create<AppState>()(
  devtools((set) => ({
    autoConnecting: false,
    setAutoConnecting: (autoConnecting) => {
      set(() => ({ autoConnecting: autoConnecting }));

    },
    NfteBalance: undefined,
    setNfteBalance: (balance: any) => {
      set(() => ({ NfteBalance: balance }));
    },
    

  }))
);

export default useStore;