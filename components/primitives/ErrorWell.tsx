import React, { ComponentPropsWithoutRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Flex from './Flex'
import Text from './Text'
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons'
import {parseError} from "../../utils/error";

type Props = {
  message?: string
  error?: any
} & Pick<ComponentPropsWithoutRef<typeof Flex>, 'css'>

export default function ErrorWell({ error, message, css }: Props) {
  const { message: errorMessage } = parseError(error || { message })

  return (
    <Flex
      css={{
        color: '$red11',
        p: '$4',
        gap: '$4',
        background: '$gray3',
        ...css,
      }}
      align="center"
    >
      <FontAwesomeIcon icon={faCircleExclamation} width={16} height={16} />
      <Text style="body3" color="error">
        {errorMessage || message || 'Oops, something went wrong. Please try again.'}
      </Text>
    </Flex>
  )
}
