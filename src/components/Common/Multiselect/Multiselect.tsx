import { Command } from 'cmdk';
import { Dispatch, useEffect, useReducer } from 'react';
import {
  CommandInput,
  CommandList,
  CommandSeparator,
  CommandTitle,
  ItemText,
  RemoveButton,
  SearchContainer,
  SelectItem,
  SelectList,
  SelectedItem,
  SelectedList,
} from './styles';
import { Cross2Icon } from '@radix-ui/react-icons';

const itemsToLabelsObj = {
  printedBook: 'печатное издание',
  eBook: 'электронная книга',
  audioBook: 'аудиокнига',
  cardBook: 'книга 2.0',
};

type SelectData = string[];

type MultiselectProps = {
  withSearch?: boolean;
  twoColumn?: boolean;
  title: string;
  data: SelectData;
  setFunction: (selected: string[]) => void;
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

export function useMultiselect(
  props: UseMultiselectType
): [string[], string[], Dispatch<MultiselectAction>] {
  const [{ selected, options }, dispatch] = useReducer(
    multiselectReducer,
    props
  );

  return [selected, options, dispatch];
}

export function Multiselect(props: MultiselectProps) {
  const { data, title, withSearch, twoColumn } = props;
  const [selected, options, dispatch] = useMultiselect({
    selected: [],
    options: data,
  });

  useEffect(() => {
    console.log(`runnig setFunction with selected = ${selected}`);
    props.setFunction(selected);
  }, [selected.length]);

  return (
    <>
      <Command label={title}>
        <CommandList>
          <CommandTitle>{title}</CommandTitle>
          <CommandSeparator />
          {withSearch && (
            <SearchContainer>
              <CommandInput autoFocus />
            </SearchContainer>
          )}
          <SelectList className={`${twoColumn ? 'two-column' : null}`}>
            {options.map((item) => (
              <SelectItem
                onSelect={() => dispatch({ type: 'selected', item })}
                key={item}
              >
                {item in itemsToLabelsObj ? itemsToLabelsObj[item] : item}
              </SelectItem>
            ))}
          </SelectList>
          <Command.Empty>Выбраны все фильтры.</Command.Empty>
        </CommandList>
        {selected.length > 0 && (
          <SelectedList>
            {selected.map((item) => (
              <SelectedItem
                key={item}
                onClick={() => dispatch({ type: 'removed', item })}
              >
                <ItemText>
                  {item in itemsToLabelsObj ? itemsToLabelsObj[item] : item}
                </ItemText>
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
