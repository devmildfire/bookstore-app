import React, { ReactElement, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import Glass from '../../../assets/icons/search.svg';
import colors from '@/utils/colors';
import breakPoints from '@/utils/breakPoints';
import books from '@/mocks/books';
import { Title } from '@/models/books';

const StyledGlass = styled(Glass)`
  position: absolute;
  flex: none;
  left: 14px;
  height: 17px;
  top: calc(50% - var(--glass-height) / 2);
  width: 17px;

  @media (max-width: 1440px) {
    top: calc(50% - calc(var(--glass-height) / 2));
    width: 17px;
    height: 17px;
  }

  @media (max-width: 1024px) {
    top: calc(50% - calc(var(--glass-height) / 2));
    width: 17px;
    height: 17px;
  }

  @media ${breakPoints.sm} {
    width: 14px;
    height: 14px;
    left: 6px;
    top: calc(50% - calc(var(--glass-height) / 2));
  }
`;

const StyledInput = styled.input`
  position: relative;
  background-color: transparent;
  border: thin solid var(--main-red-60);
  border-radius: 5px;
  max-width: 355px;
  width: 100%;
  height: 30px;
  color: ${colors.grey};
  font-size: 16px;
  padding-left: 42px;
  transition: 0.22s;
  :focus {
    border: thin solid var(--main-red-100);
  }
  @media ${breakPoints.sm} {
    width: 35vw;
    height: 24px;
    padding-left: 22px;
    font-size: 14px;
    &.active {
      width: 50vw;
    }
  }
`;

const StyledDiv = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
`;

const StyledDropdown = styled.div`
  position: absolute;
  top: 52px;
  width: 100%;
  min-height: 0px;
  background-color: var(--main-black);
  border: thin solid var(--main-red-100);
  border-top: none;
  border-radius: 0px 0px 8px 8px;
  padding: 0px;
  opacity: 0;
  visibility: hidden;
  transition: 0.22s;

  &.active {
    opacity: 1;
    visibility: visible;
    padding: 20px 0 10px;
    min-height: fit-content;
  }

  @media ${breakPoints.xl} {
    top: 46px;
  }

  @media ${breakPoints.lg} {
    top: 40px;
  }

  @media ${breakPoints.sm} {
    top: 36px;
  }
`;

const StyledMatches = styled.ul`
  height: fit-content;
  max-height: 160px;
  overflow: hidden;
  overflow-y: auto;
  padding: 0 10px;
  width: 99%;
  /* width */
  ::-webkit-scrollbar {
    width: 4px;
    height: 80%;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: transparent;
    width: 14px;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: var(--main-red-100);
    border-radius: 25px;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

type OuterClickCallback = (e: MouseEvent) => void;

function useOuterClick(callback: OuterClickCallback) {
  const callbackRef = useRef<OuterClickCallback>();
  const innerRef = useRef<HTMLUListElement>();

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        innerRef.current &&
        callbackRef.current &&
        !innerRef.current.contains(e.target as Node)
      ) {
        callbackRef.current(e);
      }
    }

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return innerRef;
}

function SearchInput({
  isInputActive,
  setIsInputActive,
}: {
  isInputActive?: boolean;
  setIsInputActive: (a: boolean) => void;
}): ReactElement {
  const [matches, setMatches] = useState<Title[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  // const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const dropdownRef: any = useOuterClick(() => {
    if (isInputActive) {
      setIsInputActive(false);
    }
  });

  const handleSearch = (event: { target: { value: string } }) => {
    const query = event.target.value;
    setSearchQuery(query);
    if (query.length > 0) {
      const matched: Title[] = books.filter((b) => {
        return b.title.toLowerCase().includes(query.toLowerCase());
      });
      setMatches(matched);
    } else {
      setMatches([]);
    }
  };

  return (
    <StyledDiv>
      <StyledInput
        value={searchQuery}
        onChange={handleSearch}
        onClick={() => setIsInputActive(true)}
        className={isInputActive ? 'active' : ''}
      />
      <StyledGlass />
      <StyledDropdown
        ref={dropdownRef}
        className={`${isInputActive && matches.length > 0 && 'active'}`}
      >
        <StyledMatches></StyledMatches>
      </StyledDropdown>
    </StyledDiv>
  );
}

export { SearchInput };
