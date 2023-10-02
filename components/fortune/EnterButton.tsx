import {Button} from "../primitives";
import {FC} from "react";

const FortuneEnterButton: FC<any> = (props) => {
  return (
    <Button
      disabled={props.disabled}
      css={{
        zIndex: 1,
        justifyContent: 'center',
      }}
      {...props}
    >{props.disabled ? 'Round Closed' : 'Enter Now'}</Button>
  )
}

export default FortuneEnterButton;