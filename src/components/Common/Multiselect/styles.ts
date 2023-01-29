import styled from 'styled-components';
import * as Popover from '@radix-ui/react-popover';

export const PopoverTrigger = styled(Popover.Trigger)`
  display: flex;
  position: relative;
  z-index: 2;
  background-color: var(--main-black);
  align-items: center;
  gap: 1rem;
  color: var(--main-white-100);
  border: none;
  padding: 8px 16px;
  font-size: 1rem;
  transition: 0.2s ease;
  cursor: pointer;
  &:hover {
    color: var(--red-hover);
  }

  & p {
    margin: 0;
  }
`;

export const SelectedList = styled.ul`
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const SelectedItem = styled.div`
  border-radius: 4px;
  background: var(--main-red-50);
  font-variant-numeric: tabular-nums;
  padding: 4px 8px;
  width: fit-content;
  cursor: pointer;
  &:hover {
    color: var(--main-white-100);
  }
`;

export const PopoverContent = styled(Popover.Content)`
  background-color: var(--main-black);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  z-index: 1;
  color: var(--main-white-100);
  width: fit-content;
  padding: 64px 16px 16px;
  border-radius: 4px;
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.5);
  min-width: 128px;
  max-width: 350px;
  [cmdk-item] {
    font-size: 1rem;
    height: 2rem;
    outline: none;
    width: fit-content;
    cursor: pointer;
    font-variant-numeric: tabular-nums;
  }
  [cmdk-item][aria-selected='true'] {
    color: var(--red-hover);
    /* border-color: var(--red-hover); */
  }
  [cmdk-separator] {
    height: 1rem;
  }
`;

interface ButtonProps {
  secondary?: boolean;
}

export const Button = styled.button<ButtonProps>`
  width: fit-content;
  background-color: ${(props) => {
    return props.secondary ? 'gray' : 'var(--main-red-50)';
  }};
  padding: 8px 16px;
  color: var(--main-white-100);
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

export const ButtonsContainer = styled.div`
  display: flex;
  gap: 8px;
`;
