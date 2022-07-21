import * as React from 'react';
import Container from '../Container';
import { StyledCrossIcon, StyledHeader, StyledIconButton } from './styles';

interface PreviewHeaderProps {
  readonly exitHref: string;
}

const PreviewHeader: React.FC<React.PropsWithChildren<PreviewHeaderProps>> = (
  props,
) => {
  const { exitHref } = props;

  return (
    <StyledHeader>
      <Container>
        <StyledIconButton href={exitHref} scroll={false} size='small'>
          <StyledCrossIcon />
        </StyledIconButton>
      </Container>
    </StyledHeader>
  );
};

export default React.memo(PreviewHeader);
