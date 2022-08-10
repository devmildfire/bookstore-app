import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import {
  valuesContext,
  valuesHandlersContext
} from '../contexts/ValuesContext';
import Selected, { SelectedProps } from '../Selected';
import { StyledSelectedList } from './styles';

export interface SelectedListProps extends ClassNameProps {
  readonly Component?: React.ComponentType<SelectedProps>;
}

const SelectedList: React.FC<SelectedListProps> = (props) => {
  const { className, Component = Selected, } = props;
  const { selectedValue, } = React.useContext(valuesContext);
  const { deleteValue, } = React.useContext(valuesHandlersContext);
  return (
    <StyledSelectedList className={className}>
      {selectedValue.map((value) => (
        <Component value={value} onDelete={deleteValue} key={value.value} />
      ))}
    </StyledSelectedList>
  );
};

export default React.memo(SelectedList);
