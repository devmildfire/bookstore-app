import styled from 'styled-components';
import Text from '@/components/Common/Text';

export const StyledTitle = styled(Text).attrs({
  variant: 'h4_3',
  component: 'span',
  textTransform: 'uppercase',
})``;

export const StyledIconWrapper = styled.div`
  padding: 32px;

  color: var(--main-white-100);

  border: 1px solid var(--main-white-100);
`;

export const StyledBookInfo = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const StyledWrapper = styled.div`
  display: grid;
  gap: 14px;

  cursor: pointer;

  &:hover ${StyledIconWrapper}, &:hover ${StyledTitle} {
    border-color: var(--main-red-100);
    stroke: var(--main-red-100);
    fill: var(--main-red-100);
    color: var(--main-red-100);
  }
`;
