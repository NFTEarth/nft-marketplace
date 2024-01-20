import useStore from "hooks/useStore";

const useTimeframe = () => {
  const timeframe = useStore((state) => state.timeframe);
  const setTimeframe = useStore((state) => state.setTimeframe);
  return {timeframe, setTimeframe};
};

export default useTimeframe;