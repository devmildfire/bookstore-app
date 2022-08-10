import classNames from 'classnames';
import * as React from 'react';
import Text from '@/components/Common/Text';
import { StyledOption } from './styles';
import { Handler, Option as OptionType, SelectValue } from '../types';
import useKeyListener from '@/hooks/useKeyListener';

interface OptionProps {
  readonly option: OptionType<SelectValue>;
  readonly onSelect: Handler<SelectValue>;
  readonly onUnselect: Handler<SelectValue>;
  readonly onHover: Handler<SelectValue>;
  readonly isCurrent: boolean;
  readonly isSelect: boolean;
}

const Option: React.FC<OptionProps> = (props) => {
  const {
    option, onSelect, onUnselect, isCurrent, onHover, isSelect,
  } = props;
  const ref = React.useRef<HTMLLIElement | null>(null);

  const onMouseEnter = React.useCallback(() => {
    onHover(option);
  }, [onHover, option]);

  const onClick = React.useCallback(() => {
    if (isSelect) {
      onUnselect(option);
    } else {
      onSelect(option);
    }
  }, [isSelect, option, onUnselect, onSelect]);

  useKeyListener({
    onKeyDown: onClick,
    keys: [' ', 'Enter'],
    condition: isCurrent,
  });

  return (
    <StyledOption
      key={option.value}
      onClick={!option.disabled ? onClick : undefined}
      onMouseEnter={onMouseEnter}
      className={classNames({ active: isCurrent && !option.disabled })}
      ref={ref}
    >
      <Text variant='h4_1' component='span' textColor='inherit'>
        {option.label}
      </Text>
    </StyledOption>
  );
};

export default React.memo(Option);
