import React, {
  Dispatch,
  PropsWithChildren,
  ReactElement,
  SetStateAction,
  createContext,
  useEffect,
  useReducer,
  useState,
} from 'react';
import styled from 'styled-components';
import * as Popover from '@radix-ui/react-popover';
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

const PopoverContent = styled(Popover.Content)`
  position: relative;
  background-color: rgba(30, 30, 30, 0.6);
  padding: 35px 50px;
  border-radius: 8px;
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  gap: 35px;
  width: clamp(256px, 100vw, 755px);
  box-shadow: 0px 4px 5px rgba(0, 0, 0, 0.25);
`;

const PopoverTrigger = styled(Popover.Trigger)`
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

const PopoverLabel = styled.span`
  text-align: center;
  font-size: clamp(12px, 2vw, 16px);
  padding-bottom: 7px;
  opacity: 0.5;
`;

const StyledCommand = styled(Command)``;

const CommandList = styled(Command.List)`
  width: 100%;
  border-radius: 4px;
  background-color: #121212;
  padding: 15px 28px;
  color: #dcdcdc;
  font-size: clamp(12px, 2vw, 16px); ;
`;

const FiltersContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  scroll-padding-block: 8px;
  gap: 9px;
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
  margin-bottom: 10px;
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
  margin-bottom: 9px;
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
  width: fit-content;
  cursor: pointer;
  transition: 0.15s;
  font-variant-numeric: tabular-nums;
  &[cmdk-item][data-selected='true'] {
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

const SelectList = styled(Command.Group)`
  [cmdk-group-items] {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr;
    padding-top: 8px;
    gap: 8px;
    max-height: 130px;
    overflow-y: auto;
    /* width */
    ::-webkit-scrollbar {
      width: 4px;
    }
    [cmdk-group-items] .two-columng {
      grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
    }

    /* Track */
    ::-webkit-scrollbar-track {
      background: #232323;
      border-radius: 8px;
    }

    /* Handle */
    ::-webkit-scrollbar-thumb {
      background: var(--main-red-100);
      border-radius: 8px;
    }

    /* Handle on hover */
    ::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  }
`;

const CommandTitle = styled.span`
  display: inline-flex;
  padding-bottom: 15px;
`;

type SelectData = string[];

type MultiselectProps = {
  withSearch?: boolean;
  twoColumn?: boolean;
  title: string;
  options: SelectData;
  selected: SelectData;
  dispatch: Dispatch<MultiselectAction>;
};

type UseMultiselectType = {
  selected: SelectData;
  options: SelectData;
};

type MultiselectActionTypes = 'selected' | 'removed' | 'reset';

type MultiselectAction = {
  type: MultiselectActionTypes;
  item: string;
};

type MultiselectState = {
  selected: string[];
  options: string[];
};

function multiselectReducer(
  { selected, options }: MultiselectState,
  action: MultiselectAction
) {
  switch (action.type) {
    case 'selected': {
      const newSelected = [...selected, action.item].sort();
      const newOptions = options
        .filter((option) => action.item !== option)
        .sort();
      return { selected: newSelected, options: newOptions };
    }
    case 'removed': {
      const newOptions = [...options, action.item].sort();
      const newSelected = selected
        .filter((select) => action.item !== select)
        .sort();
      return { selected: newSelected, options: newOptions };
    }
    case 'reset': {
      const newOptions = [...options, ...selected].sort();
      return { selected: [], options: newOptions };
    }
  }
}

function useMultiselect(
  props: UseMultiselectType
): [string[], string[], Dispatch<MultiselectAction>] {
  const [{ selected, options }, dispatch] = useReducer(
    multiselectReducer,
    props
  );

  return [selected, options, dispatch];
}

function Multiselect(props: MultiselectProps) {
  const { options, selected, dispatch, title, withSearch, twoColumn } = props;

  return (
    <>
      <Command label={title}>
        <CommandList>
          <CommandTitle>{title}</CommandTitle>
          <CommandSeparator />
          {withSearch && (
            <SearchContainer>
              <CommandInput />
            </SearchContainer>
          )}
          <SelectList className={`${twoColumn ? 'two-column' : null}`}>
            {options.map((item, idx) => (
              <SelectItem
                onSelect={() => dispatch({ type: 'selected', item })}
                key={`${item}_${idx + Math.random()}`}
              >
                {item}
              </SelectItem>
            ))}
          </SelectList>
          <Command.Empty>Выбраны все фильтры.</Command.Empty>
        </CommandList>
        {selected.length > 0 && (
          <SelectedList>
            {selected.map((item, idx) => (
              <SelectedItem
                key={`${item}_${idx + Math.random()}`}
                onClick={() => dispatch({ type: 'removed', item })}
              >
                <ItemText>{item}</ItemText>
                <RemoveButton>
                  <Cross2Icon />
                </RemoveButton>
              </SelectedItem>
            ))}
          </SelectedList>
        )}
      </Command>
    </>
  );
}

const SelectedList = styled.ul`
  margin-bottom: 14px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 9px;
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
  opacity: 0.5;
  & > svg {
    width: 22px;
    height: 22px;
  }
  :hover {
    opacity: 1;
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

type FilterPopoverProps = PropsWithChildren<{
  title: string;
  icon: ReactElement;
  align: 'start' | 'center' | 'end';
  reset: () => void;
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

function FilterPopover(props: FilterPopoverProps) {
  const { title, icon, align, reset, children } = props;
  const [visible, setVisible] = useState(false);

  return (
    <Popover.Root modal={false} open={visible} onOpenChange={setVisible}>
      <PopoverTrigger>{icon}</PopoverTrigger>
      <Popover.Portal>
        <PopoverContent
          align={align}
          avoidCollisions={false}
          sticky='always'
          sideOffset={12}
        >
          <HeaderConainer>
            <IconButton icon={<ReloadIcon />} handleClick={reset} />

            <PopoverLabel>{title}</PopoverLabel>
            <IconButton
              icon={<CloseIcon />}
              handleClick={() => setVisible(false)}
            />
          </HeaderConainer>

          <FiltersContainer>{children}</FiltersContainer>
        </PopoverContent>
      </Popover.Portal>
    </Popover.Root>
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

function Filters() {
  const yearsData = ['2020', '2021', '2022', '2023'];
  const authorsData = [
    'Оганес Мартиросян',
    'Алексей Михайлов',
    'Анна Пашкова',
    'Александ Гаврилов',
    'Николай Старообрядцев',
  ];

  const [selectedYears, years, dispatchYearsAction] = useMultiselect({
    selected: [],
    options: yearsData,
  });

  const [selectedAuthors, authors, dispatchAuthorsAction] = useMultiselect({
    selected: [],
    options: authorsData,
  });

  function resetAll() {
    dispatchAuthorsAction({ type: 'reset', item: '' });
    dispatchYearsAction({ type: 'reset', item: '' });
  }

  return (
    <Triggers>
      <FilterPopover
        reset={resetAll}
        align='start'
        title='Фильтры'
        icon={<FilterIcon />}
      >
        <Multiselect
          dispatch={dispatchAuthorsAction}
          selected={selectedAuthors}
          options={authors}
          twoColumn
          title='Автор'
          withSearch
        />
        <Multiselect
          dispatch={dispatchYearsAction}
          selected={selectedYears}
          options={years}
          title='Тип издания'
        />
        <Multiselect
          dispatch={dispatchYearsAction}
          selected={selectedYears}
          options={years}
          title='Год издания'
        />
      </FilterPopover>
      <Separator />
      <FilterPopover
        reset={() => console.log('reset sorting')}
        align='end'
        title='Сортировка'
        icon={<SortIcon />}
      >
        <SortList>
          <li>По дате издания</li>
          <li>По автору</li>
          <li>По цене</li>
        </SortList>
      </FilterPopover>
    </Triggers>
  );
}

export default Filters;
