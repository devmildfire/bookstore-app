import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { useGetTypeFilterQuery } from '@/models/books';
import { GET_PARAMS } from '@/consts/query';
import Filter from '../Filter';
import { Option, SelectValue } from '@/components/Common/Select/types';

const Type: React.FC<ClassNameProps> = (props) => {
  const { data, } = useGetTypeFilterQuery(undefined);
  const options = React.useMemo<Option<SelectValue>[]>(
    () => data?.map((year) => ({ label: year, value: year, })) || [],
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
