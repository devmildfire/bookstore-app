import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { StyledOptionsList } from './styles';
import usePagination from '../hooks/usePagination';
import useKeyListener from '@/hooks/useKeyListener';
import Option from '../Option';
import {
  valuesContext,
  valuesHandlersContext,
} from '../contexts/ValuesContext';

const OptionsList: React.FC<ClassNameProps> = (props): React.ReactElement => {
  const { className } = props;
  const { values: options, selectedValue } = React.useContext(valuesContext);
  const { addValue, deleteValue } = React.useContext(valuesHandlersContext);
  const filteredOptions = React.useMemo(
    () => options.filter((option) => !option.disabled),
    [options]
  );

  const { current, nextElement, prevElement, setCurrent } = usePagination(
    filteredOptions,
    { loop: true }
  );

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
          onSelect={addValue}
          onUnselect={deleteValue}
          isCurrent={option === current}
          isSelect={selectedValue.includes(option)}
          key={option.value}
        />
      ))}
    </StyledOptionsList>
  );
};

export default React.memo(OptionsList);
