import { Flex } from "../primitives"
import {FC} from "preact/compat";

type ProgressBarProps = {
  percentage: number
  color?: string
}

const ProgressBar: FC<ProgressBarProps> = ({ percentage, color = '$primary9', ...restProps }) => {
  return (
    <Flex {...restProps} style={{ flex: 1, height: 15, backgroundColor: '#FFFFFF29', borderRadius: 30, overflow: 'hidden' }}>
      <Flex css={{ flex: percentage / 100, content: '' , height: 15, backgroundColor: color }} />
    </Flex>
  )
}

export default ProgressBar