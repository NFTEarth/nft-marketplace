import {Button} from "../primitives";
import {FC} from "react";
import {useFortune} from "../../hooks";
import {RoundStatus} from "../../hooks/useFortuneRound";

const FortuneEnterButton: FC<any> = (props) => {
  const { data: status } = useFortune<number>(d => d.status)

  return (
    <Button
      disabled={status !== RoundStatus.Open || props.disabled}
      css={{
        zIndex: 1,
        justifyContent: 'center'
      }}
      {...props}
    >{(status !== RoundStatus.Open || props.disabled) ? 'Round Closed' : 'Enter Now'}</Button>
  )
}

export default FortuneEnterButton;