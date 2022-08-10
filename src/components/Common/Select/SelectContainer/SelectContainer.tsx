import * as React from 'react';
import useClickAway from '@/hooks/useClickAway';
import {
  ValuesContextProvider,
  ValuesProviderProps
} from '../contexts/ValuesContext';
import { StyledWrapper } from './styles';
import { SelectValue, Value } from '../types';
import { ClassNameProps } from '@/types/className';
import useToggle from '@/hooks/useToggle';
import { StateProvider } from '../contexts/StateContext';

export interface SelectContainerProps<
  T extends SelectValue,
  IsMulti extends boolean
> extends ClassNameProps,
    Omit<ValuesProviderProps<T, IsMulti>, 'selectedValue' | 'isMulti'> {
  readonly value: Value<T, IsMulti>;
  readonly isMulti?: IsMulti;
  readonly isLoading?: boolean;
}

const SelectContainer = <
  T extends SelectValue,
  IsMulti extends boolean = false
>(
    props: React.PropsWithChildren<SelectContainerProps<T, IsMulti>>
  ): React.ReactElement => {
  const {
    children,
    options,
    onChange,
    value,
    isLoading = false,
    isMulti = false,
  } = props;

  const { value: isOpen, toggleOff, toggleOn, } = useToggle();

  const [rootRef, setRootRef] = React.useState<HTMLDivElement | null>(null);

  useClickAway({
    elementRef: rootRef,
    onClickAway: toggleOff,
    condition: isOpen,
  });

  return (
    <StyledWrapper ref={setRootRef}>
      <ValuesContextProvider
        options={options}
        onChange={onChange}
        value={value}
        isMulti={isMulti}
      >
        <StateProvider
          isOpen={isOpen}
          root={rootRef}
          onOpen={toggleOn}
          onClose={toggleOff}
          isLoading={isLoading}
        >
          {children}
        </StateProvider>
      </ValuesContextProvider>
    </StyledWrapper>
  );
};

export default SelectContainer;
