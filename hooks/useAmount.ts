import useStore from "hooks/useStore";

const useAmount = () => {
  const amount = useStore((state) => state.amount);
  const setAmount = useStore((state) => state.setAmount);
  return { amount, setAmount };
};

export default useAmount;