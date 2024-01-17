import { ButtonHTMLAttributes, ReactElement } from 'react';

export type TriggerStyles = 'outlined' | 'white' | 'red';

export interface TriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: TriggerStyles;
  leftSlot?: ReactElement;
  rightSlot?: ReactElement;
  className?: string;
  onClick: () => void;
}
