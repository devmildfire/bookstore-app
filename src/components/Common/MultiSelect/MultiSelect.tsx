// import { useMultipleSelection, useCombobox } from 'downshift';
import React, { useState } from 'react';
import styled from 'styled-components';
import CloseIcon from '@/assets/icons/close.svg';

// export default function MultiSelect() {
//   return <div />;
// }

interface withOpenProps {
  readonly open: boolean;
}

const FilterContainer = styled.div<withOpenProps>`
  position: relative;
  display: flex;
  flex-direction: column;
  width: fit-content;
  padding: 18px 24px 0;
  box-shadow: ${(props) => {
    return props.open ? '5px 5px 15px rgba(0, 0, 0, 0.3)' : 'none';
  }};
  border-radius: 4px;
`;

const Options = styled.div<withOpenProps>`
  position: absolute;
  top: 39px;
  left: 0;
  width: 100%;
  display: flex;
  z-index: 2;
  border-radius: 0 0 4px 4px;
  padding: 0 24px 18px;
  flex-direction: column;
  background-color: var(--main-black);
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.3);
`;

const Selected = styled.li`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 6px 9px;
  font-size: 12px;
  background-color: var(--main-red-50);
  border-radius: 4px;
  width: fit-content;
  cursor: pointer;
`;

const SelectedList = styled.ul`
  padding: 12px 0;
`;

const RemoveIcon = styled(CloseIcon)`
  color: var(--main-black);
  width: 12px;
  height: 12px;
`;

const OptionsList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const OptionItem = styled.li`
  width: fit-content;
`;

const Trigger = styled.button`
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 0;
  background-color: transparent;
  color: var(--main-white);
  transition: 0.1 ease;
  cursor: pointer;

  & span {
    font-size: 1.5rem;
    line-height: 1;
  }

  &:hover span {
    color: var(--main-red-100);
  }
`;

interface Item {
  [key: string]: string;
}

const items: Item[] = [
  { year: '2023' },
  { year: '2022' },
  { year: '2021' },
  { year: '2020' },
  { year: '2019' },
  { year: '2018' },
  { year: '2017' },
];

// const initialSelectedItems: Item[] = [];

// function getFilteredBooks(selectedItems, inputValue) {
//   const lowerCasedInputValue = inputValue.toLowerCase();

//   return items.filter((item) => {
//     return (
//       !selectedItems.includes(item) &&
//       (item.year.toLowerCase().includes(lowerCasedInputValue) ||
//         item.author.toLowerCase().includes(lowerCasedInputValue))
//     );
//   });
// }

export default function MultiSelect() {
  // const [inputValue, setInputValue] = useState('');
  // const [selectedItems, setSelectedItems] = useState(initialSelectedItems);
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen((prev) => !prev);
  };

  return (
    <FilterContainer open={open}>
      <Trigger onClick={handleOpen}>
        <p>Год издания</p>
        <span>&#9660;</span>
      </Trigger>
      {open && (
        <Options open={open}>
          <SelectedList>
            <Selected>
              <p>2019</p>
              <RemoveIcon />
            </Selected>
          </SelectedList>
          <OptionsList>
            {items.map((item) => (
              <OptionItem>{item.year}</OptionItem>
            ))}
          </OptionsList>
        </Options>
      )}
    </FilterContainer>
  );
  // const items = useMemo(
  //   () => getFilteredBooks(selectedItems, inputValue),
  //   [selectedItems, inputValue]
  // );
  // const {
  //   getSelectedItemProps,
  //   getDropdownProps,
  //   addSelectedItem,
  //   removeSelectedItem,
  // } = useMultipleSelection({
  //   selectedItems,
  //   onStateChange({ selectedItems: newSelectedItems, type }) {
  //     switch (type) {
  //       case useMultipleSelection.stateChangeTypes.SelectedItemKeyDownBackspace:
  //       case useMultipleSelection.stateChangeTypes.SelectedItemKeyDownDelete:
  //       case useMultipleSelection.stateChangeTypes.DropdownKeyDownBackspace:
  //       case useMultipleSelection.stateChangeTypes.FunctionRemoveSelectedItem:
  //         setSelectedItems(newSelectedItems);
  //         break;
  //       default:
  //         break;
  //     }
  //   },
  // });

  // const {
  //   isOpen,
  //   getToggleButtonProps,
  //   getLabelProps,
  //   getMenuProps,
  //   getInputProps,
  //   highlightedIndex,
  //   getItemProps,
  //   selectedItem,
  // } = useCombobox({
  //   items,
  //   itemToString(item) {
  //     return item ? item.title : '';
  //   },
  //   defaultHighlightedIndex: 0, // after selection, highlight the first item.
  //   selectedItem: null,
  //   stateReducer(state, actionAndChanges) {
  //     const { changes, type } = actionAndChanges;

  //     switch (type) {
  //       case useCombobox.stateChangeTypes.InputKeyDownEnter:
  //       case useCombobox.stateChangeTypes.ItemClick:
  //       case useCombobox.stateChangeTypes.InputBlur:
  //         return {
  //           ...changes,
  //           ...(changes.selectedItem && {
  //             isOpen: true,
  //             highlightedIndex: 0,
  //           }),
  //         };
  //       default:
  //         return changes;
  //     }
  //   },
  //   onStateChange({
  //     inputValue: newInputValue,
  //     type,
  //     selectedItem: newSelectedItem,
  //   }) {
  //     switch (type) {
  //       case useCombobox.stateChangeTypes.InputKeyDownEnter:
  //       case useCombobox.stateChangeTypes.ItemClick:
  //         setSelectedItems([...selectedItems, newSelectedItem]);
  //         break;

  //       case useCombobox.stateChangeTypes.InputChange:
  //         setInputValue(newInputValue);

  //         break;
  //       default:
  //         break;
  //     }
  //   },
  // });

  // return (
  //   <div className=''>
  //     <div className=''>
  //       <SelectLabel className='' {...getLabelProps()}>
  //         год:
  //       </SelectLabel>
  //       <div className=''>
  //         {selectedItems.map((selectedItemForRender, index) => {
  //           return (
  //             <span
  //               className=''
  //               key={`selected-item-${
  //                 selectedItemForRender.author + selectedItemForRender.title
  //               }`}
  //               {...getSelectedItemProps({
  //                 selectedItem: selectedItemForRender,
  //                 index,
  //               })}
  //             >
  //               {selectedItemForRender.title}
  //               <button
  //                 type='button'
  //                 className=''
  //                 onClick={(e) => {
  //                   e.stopPropagation();
  //                   removeSelectedItem(selectedItemForRender);
  //                 }}
  //               >
  //                 &#10005;
  //               </button>
  //             </span>
  //           );
  //         })}
  //       </div>
  //     </div>
  //     <ul {...getMenuProps()} className=''>
  //       {isOpen && (
  //         <>
  //           <div className=''>
  //             <input
  //               placeholder='Best book ever'
  //               className=''
  //               {...getInputProps(
  //                 getDropdownProps({ preventKeyAction: isOpen })
  //               )}
  //             />
  //             <button
  //               aria-label='toggle menu'
  //               className=''
  //               type='button'
  //               {...getToggleButtonProps()}
  //             >
  //               &#8595;
  //             </button>
  //           </div>
  //           {items.map((item, index) => (
  //             <li
  //               className=''
  //               key={`${item.title}${item.author}`}
  //               {...getItemProps({ item, index })}
  //             >
  //               <span>{item.title}</span>
  //               <span className=''>{item.author}</span>
  //             </li>
  //           ))}
  //         </>
  //       )}
  //     </ul>
  //   </div>
  // );
}
