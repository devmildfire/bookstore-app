import * as React from 'react';
import { BoxSet, useGetBoxSetsQuery } from '@/models/boxSets';
import SetsRow from './SetRow';
import { StyledList } from './styles';

interface SetsListProps {}

const SetsList: React.FC<SetsListProps> = () => (
  <StyledList inRow={3} useQuery={useGetBoxSetsQuery} rootMargin='300px'>
    {({ rows, }) => rows.map((row) => <SetsRow sets={row as BoxSet[]} />)}
  </StyledList>
);

export default SetsList;
