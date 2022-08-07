import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { useGetAuthorFilterQuery } from '@/models/books';
import Select, {
  OnChangeValue,
  Option,
  SelectValue,
} from '@/components/Common/Select';
import useStateSyncQuery, { GetValueByQuery } from '@/hooks/useStateSyncQuery';
import { GET_PARAMS } from '@/consts/query';

type AuthorProps = ClassNameProps

const getValueByQuery: GetValueByQuery<
  Option<SelectValue>,
  Option<SelectValue>[]
> = (values, value) => {
  const selected = Array.isArray(value) ? value : [value];
  return values.filter((option) => selected.includes(option.value.toString()));
};

const Author: React.FC<AuthorProps> = (props) => {
  const { data } = useGetAuthorFilterQuery(undefined);
  const options = React.useMemo<Option<SelectValue>[]>(
    () =>
      data?.map((author) => ({ label: author.name, value: author.id })) || [],
    [data],
  );
  const [value, setValue] = useStateSyncQuery({
    queryName: GET_PARAMS.author,
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
        title='Авторы'
        value={value}
        isMulti
      />
    </div>
  );
};

export default Author;
