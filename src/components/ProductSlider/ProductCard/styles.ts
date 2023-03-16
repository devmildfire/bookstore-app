import styled from 'styled-components';
import Text from '@/components/Common/Text';
import Button from '@/components/Common/Button';

export const StyledWrapper = styled.div`
  display: flex;
  padding: 68px 0;
  gap: 98px;
`;

export const StyledImage = styled.img`
  grid-row: 1/-1;

  width: 433px;
  height: 633px;

  object-fit: cover;
  box-shadow: -20px 30px 30px rgba(0, 0, 0, 0.5);
`;

export const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const StyledAuthor = styled(Text)`
  font-family: 'Cheque', serif;
  margin: 30px 0 42px;
`;

export const StyledThesis = styled(Text)`
  text-transform: uppercase;
  color: var(--main-white);
  opacity: 0.6;
  font-style: italic;
  font-weight: 500;
  margin-bottom: 162px;
`;

export const StyledBookName = styled(Text)`
  font-size: 70px;
  color: var(--main-white);
`;

export const StyledButton = styled(Button)`
  align-self: end;
`;
