import styled from 'styled-components';
import Button from '../Common/Button';

export const StyledButtonBlock = styled.div`
  display: flex;
  justify-content: space-between;
  width: 330px;
  margin: 0 auto;
`;

export const StyledButton = styled(Button)`
  border: 1px solid #dcdcdc;

  &:hover {
    color: var(--main-red-100);
    border: 0.5px solid rgb(220 220 220 / 50%);
    background-color: var(--main-black);
  }
`;
