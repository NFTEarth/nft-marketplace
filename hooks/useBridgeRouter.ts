import {
  useContext,
  useEffect
} from 'react';
import { BridgeRouterContext } from 'context/BridgeContextProvider';

export default function useBridgeRouter() {
  const context = useContext(BridgeRouterContext);

  if (context === undefined) {
    throw new Error('useTarotRouter must be used within a TarotRouterProvider');
  }

  return context;
}
