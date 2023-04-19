import styled from 'styled-components';
import { Command } from 'cmdk';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';

export const CommandTitle = styled.span`
  display: inline-flex;
  padding-bottom: 15px;
`;

export const SearchIcon = styled(MagnifyingGlassIcon)`
  position: absolute;
  top: 6px;
  right: 6px;
  color: #dcdcdc;
`;

export const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 10px;
`;

export const StyledCommand = styled(Command)``;

export const CommandList = styled(Command.List)`
  width: 100%;
  border-radius: 4px;
  background-color: #121212;
  padding: 15px 28px;
  color: #dcdcdc;
  font-size: clamp(12px, 2vw, 16px); ;
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

export const CommandInput = styled(Command.Input)`
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

export const CommandSeparator = styled(Command.Separator)`
  width: 100%;
  height: 1px;
  background-color: #555;
  margin-bottom: 9px;
`;

export const SelectList = styled(Command.Group)`
  [cmdk-group-items] {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
    grid-template-rows: 1fr;
    padding-top: 8px;
    gap: 8px;
    max-height: 130px;
    overflow-y: auto;
    .two-column&[cmdk-group-items] {
      grid-template-columns: 1fr 1fr;
    }
    /* width */
    ::-webkit-scrollbar {
      width: 4px;
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

export const SelectItem = styled(Command.Item)`
  width: fit-content;
  cursor: pointer;
  transition: 0.15s;
  font-variant-numeric: tabular-nums;
  &[cmdk-item][data-selected='true'] {
    color: var(--main-red-100);
    text-decoration: underline;
  }
`;

export const SelectedList = styled.ul`
  margin-bottom: 14px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 9px;
`;

export const SelectedItem = styled.li`
  display: flex;
  align-items: center;
  gap: 8px;
  justify-items: center;
  background-color: #500000;
  padding: 8px 10px 8px 16px;
  border-radius: 4px;
  cursor: pointer;
`;

export const ItemText = styled.p`
  font-size: 12px;
  font-variant-numeric: tabular-nums;
`;

export const RemoveButton = styled.button`
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
