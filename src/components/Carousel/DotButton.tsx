import React from 'react';
import styled from 'styled-components';

type DotButtonPropType = {
  selected: boolean;
  onClick: () => void;
};

const Dot = styled.button`
  -webkit-appearance: none;
  background-color: transparent;
  touch-action: manipulation;
  display: inline-flex;
  text-decoration: none;
  cursor: pointer;
  border: 0;
  padding: 0;
  margin: 0;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  margin-left: 0.75rem;

  &:after {
    background: var(--main-white-100);
    border-radius: 50%;
    width: 5px;
    height: 5px;
    content: '';
  }

  &.selected:after {
    background: var(--main-red-100);
    width: 10px;
    height: 10px;
  }
`;

export function DotButton(props: DotButtonPropType) {
  const { selected, onClick } = props;

  return (
    <Dot
      aria-label='navigation dot'
      className={selected ? 'selected' : ''}
      type='button'
      onClick={onClick}
    />
  );
}
