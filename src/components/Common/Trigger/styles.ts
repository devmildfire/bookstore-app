import styled from 'styled-components';

const BaseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  width: fit-content;
  border-radius: 4px;
  letter-spacing: -0.3px;
  cursor: pointer;
  transition: 0.16s;
`;

export const RedButton = styled(BaseButton)`
  background: linear-gradient(
    to bottom,
    var(--main-red-100) 0%,
    var(--main-red-80) 100%
  );
  color: var(--main-white-80);
  :hover {
    color: var(--main-white-100);
  }
  :focus {
    background: linear-gradient(
      to bottom,
      var(--main-red-80) 0%,
      var(--main-red-100) 100%
    );
  }
`;

export const WhiteButton = styled(BaseButton)`
  background: var(--main-white-100);
  color: var(--main-black);
  :hover {
    background: var(--main-red-100);
    color: var(--main-white-100);
  }
  :focus {
    background: var(--main-red-80);
  }
`;

export const OutlinedButton = styled(BaseButton)`
  background: transparent;
  border: thin solid var(--main-white-100);
  color: var(--main-white-100);
  :hover {
    border-color: var(--main-red-50);
    background: var(--main-red-100);
  }
  :focus {
    border-color: var(--main-red-80);
    background: var(--main-red-80);
  }
`;
