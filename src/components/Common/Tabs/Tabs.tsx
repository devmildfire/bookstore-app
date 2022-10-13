import React, {
  PropsWithChildren,
  ReactElement,
  useCallback,
  useState,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled, { StyledComponent } from 'styled-components';
import Book2 from '../Icons/Book2';
import Digital from '../Icons/Digital';
import BookIcon from '../Icons/Book';
import Audio from '../Icons/Audio';
import { editionTypes } from '@/components/BookPage/BookProperties/BookProperties';

interface TabProps {
  active: string;
  handleTabClick: (tab: string, index: number) => void;
  item: string;
  index: number;
  length: number;
}

interface TriggerProps {
  active?: string;
}

interface TabContentProps {
  direction: number;
}

interface TabsProps {
  types: string[];
  publishDate: string;
  price: number;
  editions: editionTypes;
}

const StyledTab = styled.li`
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  transition: 0.3s;
  flex-grow: 1;
`;
const Pill = styled(motion.div)`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  z-index: -1;
  background-color: transparent;
  border-radius: 14px 14px 0 0;
  background-color: var(--main-white-100);
  /* border-radius: 4px; */
  &::after {
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
    transition: 0.3s;
  }
  &::before {
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
    transition: 0.3s;
  }
  &.first:before {
    content: '';
    opacity: 0;
  }
  &.last:after {
    content: '';
    opacity: 0;
  }
`;

const Trigger = styled.button<TriggerProps>`
  background-color: transparent;
  color: var(--main-white-100);
  width: 100%;
  height: 100%;
  padding: 8px 0;
  cursor: pointer;
  border-radius: 14px 14px 0 0;
  border: thin solid var(--main-white-100);
  transition: 0.3s;
  &:hover {
    background-color: var(--main-white-10);
  }
  &.active {
    color: var(--main-black);
  }
`;

const StyledTabs = styled.div``;
// const Title = styled.h3`
//   padding-bottom: 25px;
//   font-size: 42px;
// `;
const Labels = styled.ul`
  display: flex;
  flex-direction: row;
  border-radius: 4px;
  /* background-color: #141414; */
  /* padding: 8px 8px 0px; */
`;

const StyledTabContent = styled.div`
  border: thin solid var(--main-white-100);
  border-radius: 0 0 14px 14px;
  padding: 44px 110px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const TabContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  width: 100%;
`;
const StyledBook2Icon = styled(Book2)`
  height: 48px;
  width: 48px;
  stroke-width: 2px;
`;

const StyledDigitalIcon = styled(Digital)`
  height: 48px;
  width: 48px;
  stroke-width: 2px;
`;

const StyledBookIcon = styled(BookIcon)`
  height: 48px;
  width: 48px;
  stroke-width: 2px;
`;

const StyledAudioIcon = styled(Audio)`
  height: 48px;
  width: 48px;
  stroke-width: 2px;
`;

interface Icons {
  [key: string]: StyledComponent<any, any>;
}

const icons: Icons = {
  digital: StyledDigitalIcon,
  audio: StyledAudioIcon,
  book2: StyledBook2Icon,
  write: StyledBookIcon,
};

function Tab(props: TabProps) {
  const { active, handleTabClick, item, index, length } = props;
  const pillStyles = {
    0: 'first',
    [length - 1]: 'last',
  };
  const Icon = icons[item];
  return (
    <StyledTab>
      {item === active ? (
        <Pill
          className={pillStyles[index]}
          transition={{
            duration: 0.2,
            ease: 'easeInOut',
          }}
          layoutId='pill'
        />
      ) : null}

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
  const { types, publishDate, price, editions } = props;
  const [active, setActive] = useState(types[0]);
  const [[page, direction], setPage] = useState([0, 0]);

  function onTabClick(tab: string, index: number) {
    setActive(tab);
    setPage([index, index - page]);
  }

  const handleTabClick = useCallback(onTabClick, [setActive, setPage]);
  const ActiveTabContent = editions[active];

  return (
    <StyledTabs>
      <Labels>
        {types.map((item, idx) => (
          <Tab
            key={item}
            active={active}
            handleTabClick={handleTabClick}
            index={idx}
            item={item}
            length={types.length}
          />
        ))}
      </Labels>
      <TabContent direction={direction}>
        <ActiveTabContent releaseDate={publishDate} price={price} />
      </TabContent>
    </StyledTabs>
  );
}
