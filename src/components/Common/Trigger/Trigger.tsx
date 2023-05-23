import { ButtonHTMLAttributes, PropsWithChildren, ReactElement } from 'react';
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
export type TriggerStyles = 'outlined' | 'white' | 'red';
export interface TriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: TriggerStyles;
  leftSlot?: ReactElement;
  rightSlot?: ReactElement;
  className?: string;
  onClick: () => void;
}

const buttons = {
  outlined: OutlinedButton,
  red: RedButton,
  white: WhiteButton,
};
// TODO @sergromm: добавить возможность сделать кнопку ссылкой(?)
export function Trigger({
  variant,
  leftSlot,
  rightSlot,
  className,
  onClick,
  children,
}: PropsWithChildren<TriggerProps>) {
  const Button = buttons[variant];
  return (
    <Button onClick={onClick} className={className}>
      {leftSlot && leftSlot}
      {children}
      {leftSlot && rightSlot}
    </Button>
  );
}
