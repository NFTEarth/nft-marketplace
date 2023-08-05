import { BigNumber } from '@ethersproject/bignumber';
import {useCallback, useContext, useMemo, useState} from 'react';
import useBridgeRouter  from './useBridgeRouter';
import { formatUnits } from '@ethersproject/units';
import {TransactionContext} from "../context/TransactionContextProvider";

export enum State {
  Disabled = 'disabled',
  Ready = 'ready',
  Pending = 'pending',
  Done = 'done',
}

export default function useBridge(
  amount: BigNumber,
  dest: number,
  invalidInput: boolean): [State, () => Promise<void>] {
  const { addTransaction } = useContext(TransactionContext);
  const [pending, setPending] = useState<boolean>(false);

  const summary = `Bridge ${formatUnits(amount, 18)} NFTE`;

  const bridgeState: State = useMemo(() => {
    if (invalidInput) return State.Disabled;
    if (pending) return State.Pending;
    return State.Ready;
  }, [pending, amount, dest]);

  const bridge = useCallback(async (): Promise<void> => {
    if (bridgeState !== State.Ready) return;
    setPending(true);
    try {
      // await tarotRouter.bridge(amount, dest, (hash: string) => {
      //   addTransaction({ hash, summary });
      // });
      //doUpdate();
    } finally {
      setPending(false);
    }
  }, [addTransaction, amount, dest]);

  return [bridgeState, bridge];
}
