import React, {
  ReactElement,
  useState,
  MouseEvent,
  PropsWithChildren,
} from 'react';
import styled from 'styled-components';
import { Command } from 'cmdk';
import * as Popover from '@radix-ui/react-popover';
import {
  PopoverTrigger,
  PopoverContent,
  SelectedList,
  SelectedItem,
  ButtonsContainer,
  Button,
} from './styles';

const years = ['2023', '2022', '2021'];

type MultiselectType = {
  withInput?: boolean;
  title: string;
};

const StyledCommand = styled(Command)`
  background-color: var(--main-black);
  padding: 16px;
  border-radius: 4px;
  [cmdk-group-heading] {
    padding-bottom: 16px;
  }
`;

export function Multiselect(props: MultiselectType) {
  const { withInput, title } = props;
  const [options, setOptions] = useState<string[]>(years);
  const [selected, setSelected] = useState<string[]>([]);

  const handleSelect = (value: string) => {
    setSelected([...selected, value]);
    setOptions((prev) => prev.filter((option) => value !== option));
  };

  const handleRemove = (e: MouseEvent) => {
    const { target } = e;
    const value = (target as HTMLElement).textContent;
    if (value) {
      setOptions([...options, value]);
      setSelected((prev) => {
        return prev.filter((option) => value !== option);
      });
    }
  };
  return (
    <>
      <StyledCommand loop label={title}>
        {withInput && <Command.Input autoFocus />}
        <Command.List>
          {selected.length ? <Command.Separator alwaysRender /> : null}
          <Command.Group heading={title}>
            {options.map((option) => (
              <Command.Item key={option} onSelect={handleSelect}>
                {option}
              </Command.Item>
            ))}
            {withInput ? (
              <Command.Empty>Нет совпадений.</Command.Empty>
            ) : (
              <Command.Empty>Выбраны все варианты.</Command.Empty>
            )}
          </Command.Group>
          {/* скорее всего лучше использовать Command компоненты,
              чтобы облегчить handleRemove обработчик */}
          <SelectedList>
            {selected.map((item, id) => (
              <SelectedItem key={`${item}-${id + 1}`} onClick={handleRemove}>
                {item}
              </SelectedItem>
            ))}
          </SelectedList>
        </Command.List>
      </StyledCommand>
    </>
  );
}

interface DropdownProps {
  icon: string;
}

export function Dropdown(
  props: PropsWithChildren<DropdownProps>
): ReactElement {
  const { icon, children } = props;
  const [open, setOpen] = useState(false);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={open ? 'open' : ''}>
        <p>{icon}</p>
        <span>&#9660;</span>
      </PopoverTrigger>
      <Popover.Portal>
        <PopoverContent sideOffset={0} align='start'>
          {children}
          <ButtonsContainer>
            <Button>Применить</Button>
            <Button secondary>Сбросить</Button>
          </ButtonsContainer>
        </PopoverContent>
      </Popover.Portal>
    </Popover.Root>
  );
}
