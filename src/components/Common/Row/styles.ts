import styled from 'styled-components';

export interface StyledRowProps {
  readonly gap: number | [number, number];
}

/** TODO: переработать стили и вынести в отдельный копонент шаблон листа со строками */
export const StyledRow = styled.div<StyledRowProps>`
  display: flex;

  gap: ${({ gap }) => (Array.isArray(gap) ? gap.join('px ') : gap)}px;
`;
