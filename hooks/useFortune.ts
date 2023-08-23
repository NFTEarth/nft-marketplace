import {useContext, useEffect} from "react";
import { FortuneContext } from "../context/FortuneContextProvider";

export default function useFortune<T = any>(query?: (data: any) => any) {
  const { data, functions } = useContext(FortuneContext)

  return {
    data: (query ? query(data) : data) as T,
    ...functions
  };
}
