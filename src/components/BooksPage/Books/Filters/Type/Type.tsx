import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { useGetTypeFilterQuery } from '@/models/books';
import Select, {
  OnChangeValue,
  Option,
  SelectValue
} from '@/components/Common/Select';
import useStateSyncQuery, { GetValueByQuery } from '@/hooks/useStateSyncQuery';
import { GET_PARAMS } from '@/consts/query';

type TypeProps = ClassNameProps

const getValueByQuery: GetValueByQuery<
  Option<SelectValue>,
  Option<SelectValue>[]
> = (values, value) => {
  const selected = Array.isArray(value) ? value : [value];
  return values.filter((option) => selected.includes(option.value.toString()));
};

const Type: React.FC<TypeProps> = (props) => {
  const { data, } = useGetTypeFilterQuery(undefined);
  const options = React.useMemo<Option<SelectValue>[]>(
    () => data?.map((year) => ({ label: year, value: year, })) || [],
    [data]
  );
  const [value, setValue] = useStateSyncQuery({
    queryName: GET_PARAMS.productType,
    values: options,
    shallow: false,
    getValueByQuery,
    getValueToQuery: (values) =>
      values.map((option) => option.value.toString()),
  });

  return (
    <div {...props}>
      <Select
        onChange={setValue as OnChangeValue<SelectValue, true>}
        options={options}
        title='Тип издания'
        value={value}
        isMulti
      />
    </div>
  );
};

export default Type;
