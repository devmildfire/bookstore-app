import { ButtonHTMLAttributes, PropsWithChildren, ReactElement } from 'react';
import styled from 'styled-components';

export const FilledButton = styled.button`
  display: flex;
  align-items: center;
  font-weight: 500;
  background: linear-gradient(
    to bottom,
    var(--main-red-50) 0%,
    var(--main-red-30) 100%
  );
  /* box-shadow: 0px 4px 5px var(--main-red-40); */
  width: fit-content;
  color: var(--main-white-80);
  border-radius: 4px;
  transition: 0.18s;
  letter-spacing: -0.3px;
  cursor: pointer;
  :hover {
    color: var(--main-white-100);
    /* box-shadow: 0px 2px 8px var(--main-red-50); */
  }
  :focus {
    background: linear-gradient(
      to bottom,
      var(--main-red-30) 0%,
      var(--main-red-50) 100%
    );
    transform: translateY(1px);
  }
`;

export const OutlinedButton = styled.button`
  display: flex;
  align-items: center;
  font-weight: 500;
  background: transparent;
  width: fit-content;
  border: thin solid var(--main-white-100);
  color: var(--main-white-100);
  border-radius: 4px;
  transition: 0.18s;
  letter-spacing: -0.3px;
  cursor: pointer;
  :hover {
    border-color: var(--main-red-50);
    background: var(--main-red-50);
  }
  :focus {
    background: var(--main-red-30);
  }
`;

export interface TriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'outlined' | 'filled';
  leftSlot?: ReactElement;
  rightSlot?: ReactElement;
  className?: string;
  onClick: () => void;
}

const buttons = {
  outlined: OutlinedButton,
  filled: FilledButton,
};
// TODO @sergromm: добавить возможность сделать кнопку ссылкой(?)
export function Trigger({
  variant,
  leftSlot,
  rightSlot,
  className,
  children,
}: PropsWithChildren<TriggerProps>) {
  const Button = buttons[variant];
  return (
    <Button className={className}>
      {leftSlot && leftSlot}
      {children}
      {leftSlot && rightSlot}
    </Button>
  );
}
