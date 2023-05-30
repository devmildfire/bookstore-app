import books from '@/mocks/books';
import { Book } from '@/models/books';
import breakPoints from '@/utils/breakPoints';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Command } from 'cmdk';
import { useState } from 'react';
import styled from 'styled-components';
import { Text } from '../Common/Text/Text';

const CommandContainer = styled(Command)`
  position: relative;
  width: 100%;
  margin-top: 16px;
  overflow-y: scroll;
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

const MatchLink = styled.a`
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

const Title = styled(Text)`
  text-transform: capitalize;
`;

const SearchResults = styled(Command.List)`
  overflow-y: scroll;
  max-height: 388px;
  min-height: 114px;
`;

function MatchItem(props: Book) {
  return (
    <MatchLink href={`/books/${props.transliteratedTitle}`}>
      <BookCover src={props.cover} alt={props.title} />
      <MatchInfoContainer>
        <MatchText weight='bold'>{props.title}</MatchText>
        <MatchText>
          {props.authors.map((author) => author.name).join(', ')}
        </MatchText>
      </MatchInfoContainer>
    </MatchLink>
  );
}

export function SearchModal() {
  const [query, setQuery] = useState('');

  return (
    <>
      <Title variant='h3_3'>Поиск</Title>
      <CommandContainer>
        <CommandInput value={query} onValueChange={setQuery} />
        <StyledGlass />
        <Command.Empty>{`Простите, «${query}» у нас нет, а возможно никогда и не было.`}</Command.Empty>
        <SearchResults>
          <Command.Group>
            {books.map((book) => (
              <CommandItem key={book.id}>
                <MatchItem {...book} />
              </CommandItem>
            ))}
          </Command.Group>
        </SearchResults>
      </CommandContainer>
    </>
  );
}
