import styled from 'styled-components';

export const Labels = styled.div`
  display: grid;
  grid-template-columns: 250px repeat(4, 1fr) 40px;
  padding-bottom: 35px;
  margin-bottom: 20px;
  font-size: 20px;
  border-bottom: 1px solid #dcdcdc33;
  @media (max-width: 768px) {
    display: none;
  }
  @media (max-width: 1024px) {
    font-size: 16px;
  }
`;

export const Label = styled.span`
  text-align: center;
`;

export {};
