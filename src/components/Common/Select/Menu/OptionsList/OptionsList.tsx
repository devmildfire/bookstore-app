/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { OnSelectValue, OptionType, SelectValue } from '../../types';
import { StyledOptionsList } from './styles';
import usePagination from './hooks/usePagination';
import useKeyListener from '@/hooks/useKeyListener';
import Option from './Option';

interface OptionsListProps<T extends SelectValue> extends ClassNameProps {
  readonly options: OptionType<T>[];
  readonly value: OptionType<T> | null;
  readonly onChange: OnSelectValue<T>;
}

const OptionsList = <T extends SelectValue>(
  props: OptionsListProps<T>,
): React.ReactElement => {
  const {
    options, className, onChange, value,
  } = props;
  const {
    current, nextElement, prevElement, setCurrent,
  } = usePagination(options, value);

  useKeyListener({
    onKeyDown: nextElement,
    keys: ['ArrowDown'],
  });

  useKeyListener({
    onKeyDown: prevElement,
    keys: ['ArrowUp'],
  });

  return (
    <StyledOptionsList className={className}>
      {options.map((option) => (
        <Option
          option={option}
          onHover={setCurrent}
          onChange={onChange}
          isCurrent={option === current}
          key={option.value}
        />
      ))}
    </StyledOptionsList>
  );
};

export default React.memo(OptionsList);
