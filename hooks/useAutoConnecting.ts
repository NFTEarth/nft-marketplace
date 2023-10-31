import useStore from "../hooks/useStore";

const useAutoConnecting = () => {
  const autoConnecting = useStore((state) => state.autoConnecting);
  const setAutoConnecting = useStore((state) => state.setAutoConnecting);
  return { autoConnecting, setAutoConnecting };
};

export default useAutoConnecting;