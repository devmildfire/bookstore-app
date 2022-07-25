import * as React from 'react';
import { BoxSet, useGetBoxSetsQuery } from '@/models/boxSets';
import separateOnRow from '@/utils/separateOnRow';
import SetsRow from './SetRow';
import { StyledList } from './styles';

interface SetsListProps {}

const SetsList: React.FC<SetsListProps> = () => {
  const { data: sets = [] } = useGetBoxSetsQuery(undefined);
  const separatedSets: BoxSet[][] = separateOnRow(sets, 3);
  return (
    <StyledList>
      {separatedSets.map((row) => (
        <SetsRow sets={row} />
      ))}
    </StyledList>
  );
};

export default SetsList;
