import * as React from 'react';
import { BoxSet } from '@/models/boxSets';
import Container from '@/components/Common/Container';
import Row from '@/components/Common/Row';
import { StyledWrapper } from './styles';
import SetCard from './SetCard';
import SetPreview from './SetPreview/SetPreview';

interface SetsRowProps {
  readonly sets: BoxSet[];
}

const SetsRow: React.FC<SetsRowProps> = (props) => {
  const { sets } = props;

  return (
    <StyledWrapper>
      <Container>
        <Row gap={57}>
          {sets.map((set) => (
            <SetCard {...set} key={set.id} />
          ))}
        </Row>
      </Container>
      <SetPreview sets={sets} />
    </StyledWrapper>
  );
};

export default SetsRow;
