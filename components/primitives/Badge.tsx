import { styled } from 'stitches.config'

export default styled('span', {
  display: 'inline-block',
  fontSize: 10,
  fontFamily: '$button',
  px: 5,
  py: 2,
  variants: {
    color: {
      primary: {
        backgroundColor: '$primary11',
        color: '#000'
      },
      secondary: {
        backgroundColor: '$secondary8',
        color: '#000'
      },
    },
    corners: {
      square: {
        borderRadius: '$base',
      },
      rounded: {
        borderRadius: '$lg',
      },
      pill: {
        borderRadius: 99999,
      },
      circle: {
        borderRadius: '99999px',
        alignItems: 'center',
        justifyContent: 'center',
      },
    },
  },
  defaultVariants: {
    color: 'primary',
    corners: 'rounded'
  },
})
