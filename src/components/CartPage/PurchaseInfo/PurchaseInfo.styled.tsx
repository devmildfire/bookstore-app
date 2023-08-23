import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  grid-area: ${(props) => props.theme.area};

  :first-of-type {
    margin-bottom: 15px;
  }
`;
export const Text = styled.p``;

export const Value = styled.span`
  font-weight: 900;
  margin-left: auto;
`;

export {};
