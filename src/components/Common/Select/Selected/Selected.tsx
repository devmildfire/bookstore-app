import * as React from 'react';
import Text from '@/components/Common/Text';
import { Handler, Option, SelectValue } from '../types';
import { StyledCross, StyledWrapper } from './styles';
import IconButton from '@/components/Common/IconButton';

export interface SelectedProps {
  readonly value: Option<SelectValue>;
  readonly onDelete: Handler<SelectValue>;
}

const Selected: React.FC<SelectedProps> = (props) => {
  const { value, onDelete } = props;

  const onClick = React.useCallback(() => {
    console.log('delete');
    onDelete(value);
  }, [value, onDelete]);

  return (
    <StyledWrapper>
      <Text variant='h4_2' component='span'>
        {value.label}
      </Text>
      <IconButton />
    </StyledWrapper>
  );
};

export default React.memo(Selected);
