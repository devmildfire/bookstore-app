import { PropsWithChildren } from 'react';
import { OutlinedButton, RedButton, WhiteButton } from './styles';
import { TriggerProps } from './types';

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
