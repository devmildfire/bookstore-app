import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { useGetAuthorFilterQuery } from '@/models/books';
import { GET_PARAMS } from '@/consts/query';
import Filter from '../Filter';
import { Option, SelectValue } from '@/components/Common/Select/types';

const Author: React.FC<ClassNameProps> = (props) => {
  const { data, } = useGetAuthorFilterQuery(undefined);
  const options = React.useMemo<Option<SelectValue>[]>(
    () =>
      data?.map((author) => ({ label: author.name, value: author.id, })) || [],
    [data]
  );

  return (
    <Filter
      title='Авторы'
      options={options}
      queryName={GET_PARAMS.author}
      {...props}
    />
  );
};

export default Author;
