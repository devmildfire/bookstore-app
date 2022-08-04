import * as React from 'react';
import Select, {
  OnChangeValue,
  Option,
  SelectValue,
} from '@/components/Common/Select';
import { GET_PARAMS } from '@/consts/query';
import useStateSyncQuery, { GetValueByQuery } from '@/hooks/useStateSyncQuery';

const options: Option<SelectValue>[] = [
  {
    label: '2017',
    value: '2017',
  },
  {
    label: '2018',
    value: '2018',
  },
  {
    label: '2019',
    value: '2019',
  },
  {
    label: '2020',
    value: '2020',
  },
  {
    label: '2021',
    value: '2021',
  },
];

const getValueByQuery: GetValueByQuery<
  Option<SelectValue>,
  Option<SelectValue>[]
> = (values, value) => {
  const selected = Array.isArray(value) ? value : [value];
  return values.filter((option) => selected.includes(option.value.toString()));
};

const Filters: React.FC = () => {
  const [value, setValue] = useStateSyncQuery({
    queryName: GET_PARAMS.publishYear,
    values: options,
    shallow: false,
    getValueByQuery,
    getValueToQuery: (values) =>
      values.map((option) => option.value.toString()),
  });

  return (
    <div>
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

export default React.memo(Filters);
