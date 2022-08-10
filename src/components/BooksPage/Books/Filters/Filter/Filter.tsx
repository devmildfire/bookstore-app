import * as React from 'react';
import useStateSyncQuery, {
  GetValueByQuery,
  GetValueToQuery
} from '@/hooks/useStateSyncQuery';
import { StyledSelectMenu } from './styles';
import {
  OnChangeValue,
  Option,
  SelectValue
} from '@/components/Common/Select/types';
import { ClassNameProps } from '@/types/className';
import {
  Control,
  OptionsList,
  SelectContainer,
  SelectedList
} from '@/components/Common/Select';

interface FilterProps extends ClassNameProps {
  readonly options: Option<SelectValue>[];
  readonly queryName: string;
  readonly title: string;
}

const getValueByQuery: GetValueByQuery<
  Option<SelectValue>,
  Option<SelectValue>[]
> = (values, value) => {
  const selected = Array.isArray(value) ? value : [value];
  return values.filter((option) => selected.includes(option.value.toString()));
};
const getValueToQuery: GetValueToQuery<Option<SelectValue>[]> = (values) =>
  values.map((option) => option.value.toString());

const Filter: React.FC<FilterProps> = (props) => {
  const { options, queryName, title, ...rest } = props;
  const [value, setValue] = useStateSyncQuery({
    queryName,
    values: options,
    shallow: false,
    getValueByQuery,
    getValueToQuery,
  });
  return (
    <SelectContainer
      options={options}
      value={value}
      onChange={setValue as OnChangeValue<SelectValue, true>}
      isMulti
      {...rest}
    >
      <Control title={title} />
      <StyledSelectMenu>
        <SelectedList />
        <OptionsList />
      </StyledSelectMenu>
    </SelectContainer>
  );
};

export default React.memo(Filter);
