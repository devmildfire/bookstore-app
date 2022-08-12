import styled from 'styled-components';
import Text from '@/components/Common/Text';
import Button from '@/components/Common/Button';

export const StyledWrapper = styled.div`
  display: grid;
  grid-template-columns: max-content 1fr;
  grid-template-rows: min-content 1fr min-content;
  row-gap: 20px;
  column-gap: 140px;

  margin: 0 110px;
`;

export const StyledImage = styled.img`
  grid-row: 1/-1;

  width: 332px;
  height: 493px;

  object-fit: cover;

  filter: drop-shadow(-10px -10px 40px rgba(0, 0, 0, 0.8))
    drop-shadow(10px 10px 40px rgba(0, 0, 0, 0.8));
`;

export const StyledAuthor = styled(Text)`
  margin-top: 68px;
`;

export const StyledBookName = styled(Text)`
  margin-bottom: 40px;
`;

export const StyledButton = styled(Button)`
  align-self: end;
`;
