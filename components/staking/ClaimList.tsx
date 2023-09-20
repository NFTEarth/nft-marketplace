import {Box} from "../primitives";

const ClaimList = () => {
  return (
    <>
      {(new Array(4).fill('')).map((x, i) => (
        <Box
          key={`box-${i}`}
          css={{
            border: '1px dashed #79ffa8',
            opacity: 0.2,
            minWidth: '16.125rem',
            background: '#323232',
            minHeight: '9.875rem',
            borderRadius: '0.75rem',
            content: ' '
          }}
        />
      ))}
    </>
  )
}

export default ClaimList