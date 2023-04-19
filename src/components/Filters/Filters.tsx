import React, {
  PropsWithChildren,
  ReactElement,
  SetStateAction,
  createContext,
  useState,
} from 'react';
import styled from 'styled-components';
import * as Popover from '@radix-ui/react-popover';
import {
  MixerVerticalIcon,
  Cross1Icon,
  ReloadIcon,
} from '@radix-ui/react-icons';
import SortIconSvg from '@/assets/icons/sort-icon.svg';
import { useContext } from 'react';
import { Multiselect, useMultiselect } from '../Common/Multiselect';

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

const CloseIcon = styled(Cross1Icon)`
  cursor: pointer;
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

export const FiltersContainer = styled.div`
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
