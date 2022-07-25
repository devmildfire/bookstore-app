import styled from 'styled-components';
import Like from '@/assets/icons/like.svg';

export interface StyledLikeProps {
  readonly isActive: boolean;
}

export const StyledLike = styled(Like)<StyledLikeProps>`
  display: inline-block;

  width: 26px;
  height: 22px;

  stroke: var(
    ${(props) => (props.isActive ? '--main-red-100' : '--main-white')}
  );

  fill: ${(props) => (props.isActive ? 'var(--main-red-100)' : 'transparent')};

  transition: stroke 125ms ease-in-out, fill 125ms ease-in-out;

  :hover,
  :focus-visible {
    stroke: var(
      ${(props) => (props.isActive ? '--main-white' : '--main-red-100')}
    );
  }
`;
