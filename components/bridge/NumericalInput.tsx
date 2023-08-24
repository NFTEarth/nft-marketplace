import React, {ComponentPropsWithoutRef} from 'react';
import {Input} from "../primitives";
import {StyledInput} from "../primitives/Input";

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

const NumericalInput = React.memo(function InnerInput({
                                                      value,
                                                      onUserInput,
                                                      ...rest
                                                    }: {
  value: string | number
  onUserInput: (input: string) => void
  error?: boolean
  fontSize?: string
  align?: 'right' | 'left'
} & Omit<ComponentPropsWithoutRef<typeof Input>, 'ref' | 'onChange' | 'as'>) {
  const enforcer = (nextUserInput: string) => {
    if (nextUserInput === '' || RegExp(`^\\d*(?:\\\\[.])?\\d*$`).test(escapeRegExp(nextUserInput))) {
      onUserInput(nextUserInput);
    }
  };

  return (
    <Input
      {...rest}
      value={value}
      onFocus={(event) => event.target.select()}
      onChange={event => {
        if (event.target.value === '.') {
          event.target.value = '0.';
        }
        if (event.target.value === '') {
          event.target.value = '0';
        }
        const element = event.target;
        try {
          const caret = event.target.selectionStart;
          window.requestAnimationFrame(() => {
            element.selectionStart = caret;
            element.selectionEnd = caret;
          });
        } catch (error) {
          // Do nothing
        }
        // replace commas with periods, because uniswap exclusively uses period as the decimal separator
        enforcer(element.value.replace(/,/g, '.'));
      }}
      // universal input options
      inputMode='decimal'
      title='Token Amount'
      autoComplete='off'
      autoCorrect='off'
      // text-specific options
      type='text'
      pattern='^[0-9]*[.,]?[0-9]*$'
      placeholder='0.0'
      minLength={1}
      maxLength={79}
      spellCheck='false' />
  );
});

export default NumericalInput;
