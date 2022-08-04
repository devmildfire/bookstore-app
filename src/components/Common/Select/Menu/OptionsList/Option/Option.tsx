import classNames from 'classnames';
import * as React from 'react';
import Text from '@/components/Common/Text';
import { StyledOption } from './styles';
import { Handler, Option as OptionType, SelectValue } from '../../../types';
import useKeyListener from '@/hooks/useKeyListener';

interface OptionProps {
  readonly option: OptionType<SelectValue>;
  readonly onChange: Handler<SelectValue>;
  readonly onHover: Handler<SelectValue>;
  readonly isCurrent: boolean;
}

const Option: React.FC<OptionProps> = (props) => {
  const {
    option, onChange, isCurrent, onHover,
  } = props;
  const ref = React.useRef<HTMLLIElement | null>(null);

  const onMouseEnter = React.useCallback(() => {
    onHover(option);
  }, [onHover, option]);

  const onClick = React.useCallback(() => {
    onChange(option);
  }, [onChange, option]);

  useKeyListener({
    onKeyDown: onClick,
    keys: [' ', 'Enter'],
    condition: isCurrent,
  });

  return (
    <StyledOption
      key={option.value}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={classNames({ active: isCurrent })}
      ref={ref}
    >
      <Text variant='h4_1' component='span' textColor='inherit'>
        {option.label}
      </Text>
    </StyledOption>
  );
};

export default React.memo(Option);
