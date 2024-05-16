import books from '@/mocks/books';
// import { Book, Title } from '@/models/books';
import breakPoints from '@/utils/breakPoints';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Command } from 'cmdk';
import { KeyboardEvent, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Text } from '../Common/Text/Text';
import Link from 'next/link';
import { useModal } from './Modal';
import { useRouter } from 'next/router';
import { Title, Titles } from 'pages/books';
import { API } from 'api/books';
import { ITitle } from '@/entities/title/client';
import { normalizeTitle } from '@/entities/title/normalize';
import {
  MultipleStoresContext,
  TitlesContext,
  useTitlesStore,
} from '@/store/locals/dashboard/TitlesStore';
import { observer } from 'mobx-react-lite';
import { titlesStore } from '@/store/locals/dashboard/TitlesStore/TitlesStore';
// import { titlesStore } from '@/store/locals/dashboard/TitlesStore/TitlesStore';

const CommandContainer = styled(Command)`
  position: relative;
  width: 100%;
  margin-top: 16px;
`;

const CommandInput = styled(Command.Input)`
  position: relative;
  background-color: transparent;
  border-bottom: thin solid var(--main-white-60);
  width: 100%;
  height: 30px;
  margin-bottom: 16px;
  color: var(--grey);
  font-size: 16px;
  padding-left: 32px;
  transition: 0.22s;
  :focus {
    border-bottom: thin solid var(--main-red-100);
  }
  @media ${breakPoints.sm} {
    font-size: 14px;
  }
`;

const CommandItem = styled(Command.Item)`
  padding: 12px 12px 12px 0;
  cursor: pointer;
  border-radius: 6px;
  transition: 0.16s;
  &:hover {
    background-color: #232323;
    padding-left: 12px;
  }
  &[data-selected='true'] {
    background-color: #232323;
    padding-left: 12px;
  }
`;

const StyledGlass = styled(MagnifyingGlassIcon)`
  position: absolute;
  flex: none;
  left: 8px;
  height: 17px;
  top: 6px;
  width: 17px;

  @media (max-width: 1440px) {
    width: 17px;
    height: 17px;
  }

  @media (max-width: 1024px) {
    width: 17px;
    height: 17px;
  }

  @media ${breakPoints.sm} {
    width: 14px;
    height: 14px;
  }
`;

const MatchInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
`;

const BookCover = styled.img`
  display: block;
  height: 90px;
  width: 60px;
  object-fit: contain;
`;

const MatchLink = styled(Link)`
  display: flex;
  gap: 16px;
  @media ${breakPoints.sm} {
    gap: 8px;
  }
`;

const MatchText = styled.p<{ weight?: 'normal' | 'bold' }>`
  font-size: 14px;
  font-weight: ${(props) => (props.weight ? props.weight : 'normal')};
  @media ${breakPoints.sm} {
    font-size: 10px;
  }
`;

const BookTitle = styled(Text)`
  text-transform: capitalize;
`;

const SearchResults = styled(Command.List)`
  overflow-y: auto;
  max-height: 388px;
  min-height: 114px;
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
    background: var(--grey);
    border-radius: 8px;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

function MatchItem(props: ITitle) {
  const { handleOpenModal } = useModal();
  const router = useRouter();

  function handleSelect() {
    router.push(`/books/${props.slug}`);
    handleOpenModal(false, 'search');
  }

  const authorsString = props.authors.map((author) => author.name).join(' ');
  const searchString = authorsString + ' ' + props.name;

  return (
    <CommandItem onSelect={handleSelect} value={searchString}>
      <MatchLink
        onClick={() => handleOpenModal(false, 'search')}
        href={`/books/${props.slug}`}
      >
        <BookCover src={props.cover} alt={props.name} />
        <MatchInfoContainer>
          <MatchText weight='bold'>{props.name}</MatchText>
          <MatchText>
            {props.authors.map((author) => author.name).join(', ')}
          </MatchText>
        </MatchInfoContainer>
      </MatchLink>
    </CommandItem>
  );
}

export const SearchModal = observer(() => {
  const [query, setQuery] = useState('');

  return (
    <>
      <BookTitle variant='h3_3'>Поиск</BookTitle>
      <CommandContainer>
        <CommandInput value={query} onValueChange={setQuery} />
        <StyledGlass />
        <SearchResults>
          <Command.Empty>{`Простите, «${query}» у нас нет, а возможно никогда и не было.`}</Command.Empty>
          <Command.Group>
            {titlesStore?.titles &&
              titlesStore.titles.map((title) => (
                <MatchItem key={title.id} {...title} />
              ))}
          </Command.Group>
        </SearchResults>
      </CommandContainer>
    </>
  );
});
