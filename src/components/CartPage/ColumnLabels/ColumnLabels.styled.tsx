import styled from 'styled-components';

export const Labels = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 300px repeat(4, 1fr) 24px;
  padding-bottom: 35px;
  margin-bottom: 20px;
  font-size: 20px;
  border-bottom: 1px solid #dcdcdc33;

  @media (max-width: 1024px) {
    font-size: 16px;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

export const Label = styled.span`
  text-align: center;
`;

export {};
