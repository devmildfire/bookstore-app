import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { OptionsContext } from '../../contexts/OptionsContext';
import Selected from './Selected';
import { StyledSelectedList } from './styles';

const SelectedList: React.FC<ClassNameProps> = (props) => {
  const { className } = props;
  const { selectedValue, deleteValue } = React.useContext(OptionsContext);
  return (
    <StyledSelectedList className={className}>
      {selectedValue.map((value) => (
        <Selected value={value} onDelete={deleteValue} />
      ))}
    </StyledSelectedList>
  );
};

export default React.memo(SelectedList);
