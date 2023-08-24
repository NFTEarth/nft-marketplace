import {Button} from "../primitives";
import {FC} from "react";
import {useFortune} from "../../hooks";

const FortuneEnterButton: FC<any> = (props) => {
  const { data: status } = useFortune<number>(d => d.status)

  return (
    <Button
      disabled={status !== 0}
      css={{
        zIndex: 1,
        justifyContent: 'center'
      }}
      {...props}
    >{status !== 0 ? 'Round Closed' : 'Enter Now'}</Button>
  )
}

export default FortuneEnterButton;