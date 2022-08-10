import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import Select, {
  OnChangeValue,
  Option,
  SelectValue
} from '@/components/Common/Select';
import { GET_PARAMS } from '@/consts/query';
import useStateSyncQuery, { GetValueByQuery } from '@/hooks/useStateSyncQuery';
import { useGetYearFilterQuery } from '@/models/books';

type YearProps = ClassNameProps

const getValueByQuery: GetValueByQuery<
  Option<SelectValue>,
  Option<SelectValue>[]
> = (values, value) => {
  const selected = Array.isArray(value) ? value : [value];
  return values.filter((option) => selected.includes(option.value.toString()));
};

const Year: React.FC<YearProps> = (props) => {
  const { data, } = useGetYearFilterQuery(undefined);
  const options = React.useMemo<Option<SelectValue>[]>(
    () => data?.map((year) => ({ label: year, value: year, })) || [],
    [data]
  );
  const [value, setValue] = useStateSyncQuery({
    queryName: GET_PARAMS.publishYear,
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
        title='Год издания'
        value={value}
        isMulti
      />
    </div>
  );
};

export default React.memo(Year);
