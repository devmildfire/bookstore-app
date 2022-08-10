import * as React from 'react';
import { SelectValue } from './types';
import Control from './Control';
import SelectMenu from './SelectMenu';
import SelectContainer, { SelectContainerProps } from './SelectContainer';
import SelectedList from './SelectedList';
import OptionsList from './OptionsList';

export interface SelectProps<T extends SelectValue, IsMulti extends boolean>
  extends SelectContainerProps<T, IsMulti> {
  readonly title: string;
  readonly menuClassName?: string;
}

const Select = <T extends SelectValue, IsMulti extends boolean = false>(
  props: SelectProps<T, IsMulti>
): React.ReactElement => {
  const { title, menuClassName, ...rest } = props;

  return (
    <SelectContainer {...rest}>
      <Control title={title} />
      <SelectMenu className={menuClassName}>
        <SelectedList />
        <OptionsList />
      </SelectMenu>
    </SelectContainer>
  );
};

export default React.memo(Select);
