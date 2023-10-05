import { formatBN } from '../../utils/numbers'
import React, { FC } from 'react'
import Flex from './Flex'
import Text from './Text'
import {CSS} from "@stitches/react";

type Props = {
  amount: string | number | bigint | null | undefined
  maximumFractionDigits?: number
  decimals?: number
  containerCss?: CSS,
  css?: Parameters<typeof Text>['0']['css']
  textStyle?: Parameters<typeof Text>['0']['style']
  children?: React.ReactNode
  options?: Intl.NumberFormatOptions
}

const FormatCrypto: FC<Props> = ({
  amount,
  maximumFractionDigits = 4,
  decimals = 18,
  containerCss,
  css,
  textStyle = 'subtitle3',
  children,
  options
}) => {
  const value = formatBN(amount, maximumFractionDigits, decimals, options)
  return (
    <Flex align="center" css={{ gap: '$1', minWidth: 'max-content', ...containerCss }}>
      {value !== '-' ? children : null}
      <Text style={textStyle} css={css} as="p">
        {value}
      </Text>
    </Flex>
  )
}

export default FormatCrypto
