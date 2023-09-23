import * as SliderPrimitive from '@radix-ui/react-slider'
import {
  ComponentPropsWithoutRef,
  ElementRef,
  forwardRef,
} from 'react'
import { styled } from '../../stitches.config'

const StyledSlider = styled(SliderPrimitive.Root, {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  userSelect: 'none',
  touchAction: 'none',
  width: '100%',
  height: 20
})

export const Track = styled(SliderPrimitive.Track, {
  backgroundColor: '$primary6',
  position: 'relative',
  flexGrow: 1,
  borderRadius: 9999,
  height: 3
})

export const Range = styled(SliderPrimitive.Range, {
  position: 'absolute',
  backgroundColor: 'white',
  borderRadius: 9999,
  height: '100%'
})

export const Thumb = styled(SliderPrimitive.Thumb, {
  display: 'block',
  width: 20,
  height: 20,
  backgroundColor: 'white',
  boxShadow:  '0 2px 10px $primary10',
  borderRadius: 10,
  '&:hover': {
    backgroundColor: '$primary11'
  },
  '&:focus': {
    outline: 'none',
    boxShadow: '0 0 0 5px $primary9'
  }
})

const Slider = forwardRef<
  ElementRef<typeof StyledSlider>,
  ComponentPropsWithoutRef<typeof StyledSlider>
  >(({ children, ...props }, forwardedRef) => (
  <StyledSlider {...props}>
    <Track className="SliderTrack">
      <Range className="SliderRange" />
    </Track>
    <Thumb className="SliderThumb" aria-label="Volume" />
  </StyledSlider>
))


export default Slider;
