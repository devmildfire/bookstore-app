import React, { ReactElement, useState, MouseEvent } from 'react';
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

interface MultiselectProps {
  withInput?: boolean;
  title: string;
}

export default function Multiselect(props: MultiselectProps): ReactElement {
  const { withInput, title } = props;
  const [open, setOpen] = useState(false);
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
    <Popover.Root open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={open ? 'open' : ''}>
        <p>{title}</p>
        <span>&#9660;</span>
      </PopoverTrigger>
      <Popover.Portal>
        <PopoverContent sideOffset={-48} align='start'>
          <Command loop label='Command Menu'>
            {withInput && <Command.Input autoFocus />}
            <Command.List>
              {/* скорее всего лучше использовать Command компоненты,
              чтобы облегчить handleRemove обработчик */}
              <SelectedList>
                {selected.map((item, id) => (
                  <SelectedItem
                    key={`${item}-${id + 1}`}
                    onClick={handleRemove}
                  >
                    {item}
                  </SelectedItem>
                ))}
              </SelectedList>
              {selected.length ? <Command.Separator alwaysRender /> : null}
              <Command.Group heading=''>
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
            </Command.List>
          </Command>
          <ButtonsContainer>
            {/* <Button>Применить</Button> */}
            <Button secondary>Сбросить</Button>
          </ButtonsContainer>
        </PopoverContent>
      </Popover.Portal>
    </Popover.Root>
  );
}
