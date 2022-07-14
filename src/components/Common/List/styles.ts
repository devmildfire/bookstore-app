import styled from 'styled-components';

export interface StyledListProps {
  readonly gap: number | [number, number];
}

export const StyledList = styled.div<StyledListProps>`
  display: grid;

  gap: ${({ gap }) => (Array.isArray(gap) ? gap.join('px ') : gap)}px;
`;
