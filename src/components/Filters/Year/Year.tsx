import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { GET_PARAMS } from '@/consts/query';
import { useGetYearFilterQuery } from '@/models/books';
import Filter from '../Filter';
import { Option, SelectValue } from '@/components/Common/Select/types';

const Year: React.FC<ClassNameProps> = (props) => {
  const { data, } = useGetYearFilterQuery(undefined);
  const options = React.useMemo<Option<SelectValue>[]>(
    () => data?.map((year) => ({ label: year, value: year, })) || [],
    [data]
  );

  return (
    <Filter
      title='Год издания'
      options={options}
      queryName={GET_PARAMS.publishYear}
      {...props}
    />
  );
};

export default React.memo(Year);
