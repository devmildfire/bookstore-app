import React, {
  PropsWithChildren,
  ReactElement,
  useCallback,
  useState,
} from 'react';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';
import styled, { StyledComponent } from 'styled-components';
import Book2 from '../Icons/Book2';
import Digital from '../Icons/Digital';
import BookIcon from '../Icons/Book';
import Audio from '../Icons/Audio';
import { EditionType } from '@/components/BookPage/BookProperties/BookProperties';
import breakPoints from '@/utils/breakPoints';
import { BookTableTypesEnum } from '@/models/books';
import { Title } from 'pages/books';

interface TriggerProps {
  active?: string;
}

interface TabContentProps {
  direction: number;
}

interface TabsProps {
  types: {
    type: BookTableTypesEnum;
    info: Title[BookTableTypesEnum];
  }[];
  first_release: Date;
  // prices: Record<BookTableTypesEnum[number], number>[];
  prices: Record<string, number>[];

  editions: EditionType;
}

// type TabsProps = Title & { editions: EditionType };

const StyledTab = styled.li`
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  transition: 0.2s;
  flex-grow: 1;
  &:after {
    opacity: 1;
  }
  &:before {
    opacity: 1;
  }
  &.active::after {
    content: '';
    width: 18px;
    height: 18px;
    background: radial-gradient(
      at right 10%,
      rgba(255, 255, 255, 0) 70%,
      var(--main-white-100) 75%,
      var(--main-white-100) 100%
    );
    position: absolute;
    left: 100%;
    bottom: 0;
    opacity: 1;
    transition: 0.2s;
  }
  &.active::before {
    content: '';
    width: 18px;
    height: 18px;
    background: radial-gradient(
      at left 10%,
      rgba(255, 255, 255, 0) 70%,
      var(--main-white-100) 75%,
      var(--main-white-100) 100%
    );
    position: absolute;
    right: 100%;
    bottom: 0;
    opacity: 1;
    transition: 0.2s;
  }
  &:first-of-type:before {
    content: '';
    opacity: 0;
  }
  &:last-of-type:after {
    content: '';
    opacity: 0;
  }
  @media screen and (max-width: 576px) {
    &.active::after {
      background: none;
    }
    &.active::before {
      background: none;
    }
  }
`;

const Trigger = styled.button<TriggerProps>`
  display: flex;
  justify-content: center;
  background-color: transparent;
  color: var(--main-white-100);
  width: 100%;
  height: 100%;
  padding: 8px 0;
  cursor: pointer;
  border-radius: 14px 14px 0 0;
  border: thin solid var(--main-white-100);
  transition: 0.2s;
  &:hover {
    background-color: var(--main-white-10);
  }
  &.active {
    color: var(--main-black);
    background-color: var(--main-white-100);
  }
  @media screen and (max-width: 576px) {
    border: none;
    border-radius: 14px;
  }
`;

const StyledTabs = styled.div`
  @media screen and (max-width: 576px) {
    width: 100%;
  }
`;
// const Title = styled.h3`
//   padding-bottom: 25px;
//   font-size: 42px;
// `;
const Labels = styled.ul`
  display: flex;
  flex-direction: row;

  /* background-color: #141414; */
  /* padding: 8px 8px 0px; */
  @media screen and (max-width: 576px) {
    background-color: #0e0e0e;
    padding: 4px;
    border-radius: 18px;
  }
`;

const StyledTabContent = styled.div`
  border: thin solid var(--main-white-100);
  border-radius: 0 0 14px 14px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media screen and (max-width: 576px) {
    border: none;
  }
`;
const TabContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  width: 100%;

  padding-bottom: 44px;
  @media ${breakPoints.lg} {
    padding-bottom: 24px;
  }
  @media screen and (max-width: 576px) {
    padding-bottom: 12px;
  }
`;
const StyledBook2Icon = styled(Book2)`
  height: 48px;
  width: 48px;
  stroke-width: 2px;

  @media screen and (max-width: 576px) {
    height: 24px;
    width: 24px;
    /* padding: 1px; */
  }
`;

const StyledDigitalIcon = styled(Digital)`
  height: 48px;
  width: 48px;
  stroke-width: 2px;

  @media screen and (max-width: 576px) {
    height: 24px;
    width: 24px;
    /* padding: 1px; */
  }
`;

const StyledBookIcon = styled(BookIcon)`
  height: 48px;
  width: 48px;
  stroke-width: 2px;

  @media screen and (max-width: 576px) {
    height: 24px;
    width: 24px;
    /* padding: 1px; */
  }
`;

const StyledAudioIcon = styled(Audio)`
  height: 48px;
  width: 48px;
  stroke-width: 2px;

  @media screen and (max-width: 576px) {
    height: 24px;
    width: 24px;
    /* padding: 1px; */
  }
`;

// const icons: Record<BookTableTypesEnum[number], any> = {
//   Ebooks: StyledDigitalIcon,
//   Audiobooks: StyledAudioIcon,
//   CardBooks: StyledBook2Icon,
//   PrintedBooks: StyledBookIcon,
// };

// const icons: Record<string, any> = {
const icons: Record<BookTableTypesEnum[number], any> = {
  eBook: StyledDigitalIcon,
  audioBook: StyledAudioIcon,
  cardBook: StyledBook2Icon,
  printedBook: StyledBookIcon,
};

interface TabProps {
  active: string;
  handleTabClick: (tab: BookTableTypesEnum, index: number) => void;
  item: BookTableTypesEnum;
  index: number;
}

function Tab(props: TabProps) {
  const { active, handleTabClick, item, index } = props;

  const Icon = icons[item];

  return (
    <StyledTab className={active === item ? 'active' : ''}>
      <Trigger
        className={active === item ? 'active' : ''}
        onClick={() => handleTabClick(item, index)}
      >
        <Icon />
      </Trigger>
    </StyledTab>
  );
}

const variants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    };
  },
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => {
    return {
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    };
  },
};

function TabContent({
  direction,
  children,
}: PropsWithChildren<TabContentProps>) {
  return (
    <AnimatePresence initial={false} custom={direction}>
      <StyledTabContent>
        <TabContainer
          custom={direction}
          variants={variants}
          initial='enter'
          animate='center'
          exit='exit'
          transition={{
            x: { duration: 0.2 },
            opacity: { duration: 0.2 },
          }}
        >
          {children}
        </TabContainer>
      </StyledTabContent>
    </AnimatePresence>
  );
}

export default function Tabs(
  props: PropsWithChildren<TabsProps>
): ReactElement {
  const { types, first_release, prices, editions } = props;
  const [active, setActive] = useState<BookTableTypesEnum>(types[0].type);
  const [[page, direction], setPage] = useState([0, 0]);

  function onTabClick(tab: BookTableTypesEnum, index: number) {
    setActive(tab);
    setPage([index, index - page]);
  }

  // const date = new Date(year, month, day).toLocaleDateString('ru-RU');
  const formatDate = dayjs(first_release).format('DD.MM.YYYY');
  const handleTabClick = useCallback(onTabClick, [setActive, setPage]);
  const ActiveTabContent = editions[active];

  return (
    <StyledTabs>
      <Labels>
        {types.map((item, idx) => (
          <Tab
            key={item.type}
            active={active}
            // active={'printedBook'}
            handleTabClick={handleTabClick}
            index={idx}
            item={item.type}
          />
        ))}
      </Labels>
      <TabContent direction={direction}>
        <ActiveTabContent />
      </TabContent>
    </StyledTabs>
  );
}
