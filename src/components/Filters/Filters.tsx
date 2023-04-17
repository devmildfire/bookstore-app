import React, {
  PropsWithChildren,
  ReactElement,
  SetStateAction,
  createContext,
  useState,
} from 'react';
import styled from 'styled-components';
import * as Accordion from '@radix-ui/react-accordion';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  MixerVerticalIcon,
  Cross1Icon,
  MagnifyingGlassIcon,
  Cross2Icon,
  ReloadIcon,
  // CaretSortIcon,
} from '@radix-ui/react-icons';
import { Command } from 'cmdk';
import SortIconSvg from '@/assets/icons/sort-icon.svg';
import { useContext } from 'react';

const DropdownContent = styled(DropdownMenu.Content)`
  position: relative;
  background-color: rgba(30, 30, 30, 0.6);
  padding: 35px 50px;
  border-radius: 8px;
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: clamp(256px, 100vw, 755px);
  box-shadow: 0px 4px 5px rgba(0, 0, 0, 0.25);
`;

const DropdownTrigger = styled(DropdownMenu.Trigger)`
  background: transparent;
  color: #dcdcdc;
  padding: 16px;
  min-width: 64px;
  width: 100%;
  transition: 0.15s;
  cursor: pointer;

  &:hover {
    color: var(--main-red-100);
  }
`;

const DropdownLabel = styled(DropdownMenu.Label)`
  text-align: center;
  font-size: clamp(12px, 2vw, 16px);
  padding-bottom: 7px;
`;

const AccordionTrigger = styled(Accordion.Trigger)`
  width: 100%;
  text-align: left;
  margin: 0;
  padding: 6px 12px;
  font-size: clamp(12px, 2vw, 16px);
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #121212;
  color: #dcdcdc;
  border-radius: ${(props: { open: boolean }) => {
    return props.open ? '4px 4px 0 0' : '4px';
  }}; ;
`;

const AccordionRoot = styled(Accordion.Root)`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StyledCommand = styled(Command)`
  background-color: #121212;
  border-radius: 4px;
  display: flex;
  width: 100%;
`;

const CommandList = styled(Command.List)`
  width: 100%;
  padding: 6px 12px;
  color: #dcdcdc;
  font-size: clamp(12px, 2vw, 16px); ;
`;

const FiltersContainer = styled.div`
  overflow-y: auto;
  scroll-padding-block: 8px;
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  scrollbar-width: none; /* Firefox */

  &::-webkit-scrollbar {
    display: none; /* Safari and Chrome */
  }
`;

const CloseIcon = styled(Cross1Icon)`
  cursor: pointer;
`;

const SearchContainer = styled.div`
  position: relative;
`;

const CommandInput = styled(Command.Input)`
  background-color: #555;
  border: none;
  border-radius: 4px;
  font-size: clamp(12px, 2vw, 16px);
  padding: 4px 8px;
  color: #dcdcdc;
  width: -content;
  width: 100%;
  box-sizing: border-box;
`;

const SearchIcon = styled(MagnifyingGlassIcon)`
  position: absolute;
  top: 6px;
  right: 6px;
  color: #dcdcdc;
`;

const CommandSeparator = styled(Command.Separator)`
  width: 100%;
  height: 1px;
  background-color: #555;
  margin-bottom: 6px;
`;

const Triggers = styled.div`
  background-color: rgba(30, 30, 30, 0.4);
  border-radius: 60px;
  display: flex;
  justify-content: space-evenly;
  box-shadow: 0px 4px 5px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(4px);
  width: 100%;
  max-width: 755px;
  height: auto;
  max-height: 66px;
  margin: 62px 0;
`;

const Separator = styled.hr`
  width: 0px;
  opacity: 0.3;
`;

const SortList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-radius: 4px;
  background-color: #121212;
  margin: 0;
  list-style: none;
  font-size: clamp(12px, 2vw, 16px);
  padding: 12px 12px 18px;
`;

const SelectItem = styled(Command.Item)`
  cursor: pointer;
  transition: 0.15s;
  font-variant-numeric: tabular-nums;
  :hover {
    color: var(--main-red-100);
    text-decoration: underline;
  }
`;

const RemoveButton = styled.button`
  display: flex;
  color: var(--main-black);
  background-color: transparent;
  padding: 0;
  margin: 0;
  cursor: pointer;
  transition: 0.15s;
  &:hover {
    opacity: 0.5;
  }
`;

const SelectList = styled.ul`
  padding-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CommandTitle = styled.span`
  display: inline-flex;
  padding-bottom: 6px;
`;

type MultiselectProps = {
  withSearch?: boolean;
  title: string;
};

function Multiselect(props: MultiselectProps) {
  const { title, withSearch } = props;
  const initialData = ['2020', '2021', '2022', '2023'];
  const [selected, setSelected] = useState<string[]>([]);
  const [options, setOptions] = useState<string[]>(initialData);

  const handleSelect = (value: string) => {
    const newSelected = [...selected, value].sort();
    const newOptions = options.filter((option) => value !== option).sort();
    setSelected(newSelected);
    setOptions(newOptions);
  };

  const handleRemove = (value: string) => {
    const newOptions = [...options, value].sort();
    const newSelected = selected.filter((select) => value !== select).sort();
    setSelected(newSelected);
    setOptions(newOptions);
  };

  return (
    <>
      <StyledCommand label={title}>
        <CommandList>
          <CommandTitle>{title}</CommandTitle>
          <CommandSeparator />
          {withSearch && (
            <SearchContainer>
              <CommandInput />
              <SearchIcon />
            </SearchContainer>
          )}
          <Command.Empty>Выбраны все фильтры.</Command.Empty>
          <SelectList>
            {options.map((item, idx) => (
              <SelectItem key={idx} onSelect={() => handleSelect(item)}>
                {item}
              </SelectItem>
            ))}
          </SelectList>
        </CommandList>
      </StyledCommand>
      <SelectedList>
        {selected.map((item, idx) => (
          <SelectedItem onClick={() => handleRemove(item)} key={idx}>
            <ItemText>{item}</ItemText>
            <RemoveButton>
              <Cross2Icon />
            </RemoveButton>
          </SelectedItem>
        ))}
      </SelectedList>
    </>
  );
}

const SelectedList = styled.ul`
  margin-top: 8px;
  display: flex;
  gap: 8px;
`;

const SelectedItem = styled.li`
  display: flex;
  align-items: center;
  gap: 8px;
  justify-items: center;
  background-color: #500000;
  padding: 8px 10px 8px 16px;
  border-radius: 4px;
  cursor: pointer;
`;

const ItemText = styled.p`
  font-size: 12px;
  font-variant-numeric: tabular-nums;
`;

function Filters() {
  return (
    <>
      <Multiselect title='Автор' withSearch />
      <Multiselect title='Тип издания' />
      <Multiselect title='Год издания' />
    </>
  );
}

const HeaderConainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

type IconButtonProps = {
  icon: ReactElement;
  handleClick: (...args: any) => void;
};

const StyledIconButton = styled.button`
  background-color: transparent;
  padding: 0;
  cursor: pointer;
  border: none;
  color: var(--main-white-100);
  transition: 0.15s;
  position: relative;
  :hover {
    opacity: 0.5;
  }
  :before {
    content: '';
    position: absolute;
    top: -10px;
    left: -10px;
    right: -10px;
    bottom: -10px;
  }
`;

function IconButton({ icon, handleClick }: IconButtonProps) {
  return <StyledIconButton onClick={handleClick}>{icon}</StyledIconButton>;
}

type FilterDropDownProps = PropsWithChildren<{
  title: string;
  icon: ReactElement;
  align: 'start' | 'center' | 'end';
}>;

type FilterContextProps = {
  handleRemove: (value: string) => void;
  handleSelect: (value: string) => void;
  setOptions: SetStateAction<unknown>; // TODO @sergromm убрать unknown и any, использовать более точные типы.
  selected: any[];
  options: any[];
};

const FilterContext = createContext<FilterContextProps>({
  handleRemove: () => undefined,
  handleSelect: () => undefined,
  setOptions: () => undefined,
  selected: [],
  options: [],
});

export const useFilter = () => {
  const currentFilterContext = useContext(FilterContext);

  if (!currentFilterContext) {
    throw new Error('useFilter has to be used within <ModalFilter.Provider>');
  }

  return currentFilterContext;
};

function FilterDropdown({ title, icon, align, children }: FilterDropDownProps) {
  const [visible, setVisible] = useState(false);

  const handleResetFilters = () => {
    // setSelected([]);
    // setOptions(initialData);
  };

  function handleReset<T extends () => undefined>(callback: T) {
    callback();
  }
  return (
    <DropdownMenu.Root modal={false} open={visible} onOpenChange={setVisible}>
      <DropdownTrigger>{icon}</DropdownTrigger>
      <DropdownMenu.Portal>
        <DropdownContent
          align={align}
          avoidCollisions={false}
          sticky='always'
          sideOffset={12}
        >
          <HeaderConainer>
            <IconButton
              icon={<ReloadIcon />}
              handleClick={handleResetFilters}
            />

            <DropdownLabel>{title}</DropdownLabel>
            <IconButton
              icon={<CloseIcon />}
              handleClick={() => setVisible(false)}
            />
          </HeaderConainer>

          <FiltersContainer>{children}</FiltersContainer>
        </DropdownContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

const FilterIcon = styled(MixerVerticalIcon)`
  width: clamp(1rem, 3vw, 2rem);
  height: auto;
`;

const SortIcon = styled(SortIconSvg)`
  width: clamp(1rem, 3vw, 2rem);
  height: auto;
`;

function App() {
  return (
    <Triggers>
      <FilterDropdown align='start' title='Фильтры' icon={<FilterIcon />}>
        <Filters />
      </FilterDropdown>
      <Separator />
      <FilterDropdown align='end' title='Сортировка' icon={<SortIcon />}>
        <SortList>
          <li>По дате издания</li>
          <li>По автору</li>
          <li>По цене</li>
        </SortList>
      </FilterDropdown>
    </Triggers>
  );
}

export default App;
