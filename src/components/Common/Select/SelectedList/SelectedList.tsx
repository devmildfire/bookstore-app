import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import {
  valuesContext,
  valuesHandlersContext,
} from '../contexts/ValuesContext';
import Selected from '../Selected';
import { StyledSelectedList } from './styles';

const SelectedList: React.FC<ClassNameProps> = (props) => {
  const { className } = props;
  const { selectedValue } = React.useContext(valuesContext);
  const { deleteValue } = React.useContext(valuesHandlersContext);
  return (
    <StyledSelectedList className={className}>
      {selectedValue.map((value) => (
        <Selected value={value} onDelete={deleteValue} />
      ))}
    </StyledSelectedList>
  );
};

export default React.memo(SelectedList);
