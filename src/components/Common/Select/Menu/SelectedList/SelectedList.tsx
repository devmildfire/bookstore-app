import * as React from 'react';
import { OptionType, SelectValue } from '../../types';
import Selected from './Selected';
import { StyledSelectedList } from './styles';

interface SelectedListProps<T extends SelectValue> {
  readonly value: OptionType<T> | null;
}

const SelectedList = <T extends SelectValue>(
  props: SelectedListProps<T>,
): React.ReactElement => {
  const { value } = props;
  return (
    <StyledSelectedList>
      <Selected value={value} />
    </StyledSelectedList>
  );
};

export default React.memo(SelectedList);
