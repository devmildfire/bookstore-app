import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { SelectValue, Value } from './types';
import { StyledWrapper } from './styles';
import useToggle from '@/hooks/useToggle';
import Control from './Control';
import useKeyListener from '@/hooks/useKeyListener';
import useClickAway from '@/hooks/useClickAway';
import Menu from './Menu';
import {
  ValuesContextProvider,
  ValuesProviderProps,
} from './contexts/ValuesContext';
import { StateProvider } from './contexts/StateContext';

interface SelectProps<T extends SelectValue, IsMulti extends boolean>
  extends ClassNameProps,
    Omit<ValuesProviderProps<T, IsMulti>, 'selectedValue' | 'isMulti'> {
  readonly title: string;
  readonly value: Value<T, IsMulti>;
  readonly isMulti?: IsMulti;
}

/* TODO: Сделать возможность располагать компоненты селекта в произвольном порядке */
const Select = <T extends SelectValue, IsMulti extends boolean = false>(
  props: SelectProps<T, IsMulti>
): React.ReactElement => {
  const { title, options, onChange, value, isMulti = false } = props;

  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const { value: isOpen, toggleOff, toggleOn } = useToggle();
  const [isFocus, setFocus] = React.useState<boolean>(false);
  const hasValue = Array.isArray(value) ? !!value.length : !!value;

  const onFocus = React.useCallback(() => {
    setFocus(true);
  }, []);
  const onBlur = React.useCallback(() => {
    setFocus(false);
  }, []);

  useKeyListener({
    onKeyDown: toggleOn,
    keys: [' ', 'Enter'],
    condition: isFocus,
  });
  useKeyListener({
    onKeyDown: toggleOff,
    keys: ['Escape', 'Enter', ' '],
    condition: isOpen,
  });
  useClickAway({
    elementRef: rootRef,
    onClickAway: toggleOff,
    condition: isOpen,
  });

  return (
    <StyledWrapper ref={rootRef}>
      <ValuesContextProvider
        options={options}
        onChange={onChange}
        value={value}
        isMulti={isMulti}
      >
        <StateProvider
          isFocus={isFocus}
          isOpen={isOpen}
          hasValue={hasValue}
          onOpen={toggleOn}
          onClose={toggleOff}
          onFocus={onFocus}
          onBlur={onBlur}
        >
          <Control title={title} />
          <Menu isOpen={isOpen} target={rootRef.current} />
        </StateProvider>
      </ValuesContextProvider>
    </StyledWrapper>
  );
};

export default React.memo(Select);
