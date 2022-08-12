import * as React from 'react';
import { BoxSet } from '@/models/boxSets';
import Container from '@/components/Common/Container';
import { StyledRow, StyledWrapper } from './styles';
import SetCard from './SetCard';
import SetPreview from './SetPreview/SetPreview';
import useGetParam from '@/hooks/useGetParam';
import { GET_PARAMS } from '@/consts/query';

interface SetsRowProps {
  readonly sets: BoxSet[];
}

const SetsRow: React.FC<SetsRowProps> = (props) => {
  const { sets, } = props;
  const openSetId = Number(useGetParam(GET_PARAMS.openProduct));

  return (
    <StyledWrapper>
      <Container>
        <StyledRow inRow={sets.length}>
          {sets.map((set) => (
            <SetCard isOpen={openSetId === set.id} {...set} key={set.id} />
          ))}
        </StyledRow>
      </Container>
      <SetPreview sets={sets} />
    </StyledWrapper>
  );
};

export default SetsRow;
