import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { StyledOptionsList } from './styles';
import usePagination from '../hooks/usePagination';
import useKeyListener from '@/hooks/useKeyListener';
import Option from './Option';
import { OptionsContext } from '../../contexts/OptionsContext';

const OptionsList: React.FC<ClassNameProps> = (props): React.ReactElement => {
  const { className } = props;
  const { options, addValue, selectedValue } = React.useContext(OptionsContext);
  const filteredOptions = React.useMemo(
    () => options.filter((option) => !selectedValue.includes(option)),
    [options, selectedValue],
  );

  const {
    current, nextElement, prevElement, setCurrent,
  } = usePagination(
    filteredOptions,
    { loop: true },
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
      {filteredOptions.map((option) => (
        <Option
          option={option}
          onHover={setCurrent}
          onChange={addValue}
          isCurrent={option === current}
          key={option.value}
        />
      ))}
    </StyledOptionsList>
  );
};

export default React.memo(OptionsList);
