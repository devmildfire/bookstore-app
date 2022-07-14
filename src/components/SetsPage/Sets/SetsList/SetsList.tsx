import * as React from 'react';
import { BoxSet, useGetBoxSetsQuery } from '@/models/boxSets';
import List from '@/components/Common/List';
import separateOnRow from '@/utils/separateOnRow';
import SetsRow from './SetRow';

interface SetsListProps {}

const SetsList: React.FC<SetsListProps> = () => {
  const { data: sets = [] } = useGetBoxSetsQuery(undefined);
  const separatedSets: BoxSet[][] = separateOnRow(sets, 3);
  return (
    <List gap={64}>
      {separatedSets.map((row) => (
        <SetsRow sets={row} />
      ))}
    </List>
  );
};

export default SetsList;
