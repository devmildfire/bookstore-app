import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { BookType, useGetTypeFilterQuery } from '@/models/books';
import { GET_PARAMS } from '@/consts/query';
import Filter from '../Filter';
import { Option } from '@/components/Common/Select/types';
import { bookTypeNameMap } from '@/consts/products';

const Type: React.FC<ClassNameProps> = (props) => {
  const { data, } = useGetTypeFilterQuery(undefined);
  const options = React.useMemo<Option<BookType>[]>(
    () =>
      data?.map((type) => ({ label: bookTypeNameMap[type], value: type, }))
      || [],
    [data]
  );

  return (
    <Filter
      title='Тип издания'
      options={options}
      queryName={GET_PARAMS.productType}
      {...props}
    />
  );
};

export default Type;
