import * as React from 'react';
import Text from '@/components/Common/Text';
import { OptionType, SelectValue } from '../../../types';
import { StyledCross, StyledWrapper } from './styles';
import IconButton from '@/components/Common/IconButton';

interface SelectedProps<T extends SelectValue> {
  readonly value: OptionType<T>;
}

const Selected = <T extends SelectValue>(
  props: SelectedProps<T>,
): React.ReactElement => {
  const { value } = props;
  return (
    <StyledWrapper>
      <Text variant='h4_1' component='span'>
        {value.label}
      </Text>
      <IconButton size='small'>
        <StyledCross />
      </IconButton>
    </StyledWrapper>
  );
};

export default React.memo(Selected);
