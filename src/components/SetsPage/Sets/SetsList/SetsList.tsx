import * as React from 'react';
import { BoxSet, useGetBoxSetsQuery } from '@/models/boxSets';
import SetsRow from './SetRow';
import { StyledList } from './styles';

const SetsList: React.FC = () => (
  <StyledList inRow={3} useQuery={useGetBoxSetsQuery} rootMargin='300px'>
    {({ rows }) =>
      rows.map((row, index) => <SetsRow key={index} sets={row as BoxSet[]} />)
    }
  </StyledList>
);

export default SetsList;
