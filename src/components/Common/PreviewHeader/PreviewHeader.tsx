import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import {
  StyledContainer,
  StyledCrossIcon,
  StyledHeader,
  StyledIconButton
} from './styles';

interface PreviewHeaderProps extends ClassNameProps {
  readonly exitHref: string;
}

const PreviewHeader: React.FC<React.PropsWithChildren<PreviewHeaderProps>> = (
  props
) => {
  const { exitHref, className, } = props;

  return (
    <StyledHeader>
      <StyledContainer className={className}>
        <StyledIconButton href={exitHref} scroll={false} shallow size='small'>
          <StyledCrossIcon />
        </StyledIconButton>
      </StyledContainer>
    </StyledHeader>
  );
};

export default React.memo(PreviewHeader);
