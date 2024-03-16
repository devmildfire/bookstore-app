import styled from 'styled-components';

export const Main = styled.main`
  /* padding: 40px; */
  width: 100%;
  /* max-width: 1440px; */
  margin: 0 auto;
`;

export const Title = styled.h1`
  text-align: left;
  width: fit-content;
  font-family: Cheque, serif;
  font-size: 24px;
  font-style: normal;
  font-weight: 900;
  /* margin: 0 auto; */
  margin-bottom: 30px;
  @media (min-width: 530px) {
    font-size: 32px;
    margin-bottom: 50px;
  }
  @media (min-width: 786px) {
    font-size: 48px;
    margin-bottom: 50px;
  }
  @media (min-width: 1024px) {
    font-size: 60px;
    margin-bottom: 50px;
  }
`;

export const ProductsList = styled.ul`
  width: 100%;
  /* margin: auto; */
  max-height: 520px;
  overflow-y: auto;

  ::-webkit-scrollbar {
    width: 4px;
  }

  ::-webkit-scrollbar-track {
    background: #222222;
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background: #505050;
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

export {};
