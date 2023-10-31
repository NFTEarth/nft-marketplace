import { toBigInt } from "ethers";
import produce from "immer";
import { create } from 'zustand'
import { devtools } from "zustand/middleware";


interface AppState {
  autoConnecting: boolean;
  setAutoConnecting: (autoConnecting: boolean) => void;



  NfteBalance: BigInt | undefined;
  setNfteBalance: (balance: BigInt | undefined) => void;
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