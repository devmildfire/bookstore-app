import * as React from 'react';
import { OnSelectValue, OptionType, SelectValue } from '../types';
import OptionsList from './OptionsList';
import SelectedList from './SelectedList';
import { StyledMenuWrapper } from './styles';

interface MenuProps<T extends SelectValue> {
  readonly isOpen: boolean;
  readonly value: OptionType<T> | null;
  readonly options: OptionType<T>[];
  readonly onChange: OnSelectValue<T>;
}

const Menu = <T extends SelectValue>(
  props: MenuProps<T>,
): React.ReactElement | null => {
  const { isOpen, ...rest } = props;

  if (!isOpen) {
    return null;
  }

  const options = React.useMemo(
    () => rest.options.filter((option) => option !== rest.value),
    [rest.options, rest.value],
  );

  return (
    <StyledMenuWrapper>
      <SelectedList value={rest.value} />
      <OptionsList {...rest} options={options} />
    </StyledMenuWrapper>
  );
};

export default React.memo(Menu);
