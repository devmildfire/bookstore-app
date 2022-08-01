import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { OnSelectValue, OptionType, SelectValue } from './types';
import { StyledWrapper } from './styles';
import useToggle from '@/hooks/useToggle';
import Control from './Control';
import useKeyListener from '@/hooks/useKeyListener';
import useClickAway from '@/hooks/useClickAway';
import Menu from './Menu';

interface SelectProps<T extends SelectValue> extends ClassNameProps {
  readonly title: string;
  readonly options: OptionType<T>[];
  readonly onChange: OnSelectValue<T>;
  readonly value: OptionType<T> | null;
}

const Select = <T extends SelectValue>(
  props: SelectProps<T>,
): React.ReactElement => {
  const {
    title,
    options,
    onChange,
    value,
  } = props;
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const { value: isOpen, toggleOff, toggleOn } = useToggle();
  const [isFocus, setFocus] = React.useState<boolean>(false);

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
    condition: isFocus && isOpen,
  });
  useClickAway({
    elementRef: rootRef,
    onClickAway: toggleOff,
    condition: isOpen,
  });

  return (
    <StyledWrapper>
      <Control
        title={title}
        isOpen={isOpen}
        onOpen={toggleOn}
        onClose={toggleOff}
        onFocus={onFocus}
        onBlur={onBlur}
        ref={rootRef}
      />

      <Menu
        isOpen={isOpen}
        onChange={onChange}
        options={options}
        value={value}
      />
    </StyledWrapper>
  );
};

export default React.memo(Select);
