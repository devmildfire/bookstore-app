import React, { PropsWithChildren, useContext, useState } from 'react';
import * as Primitive from '@radix-ui/react-dialog';
import styled from 'styled-components';
import { Multiselect } from '../Common/Multiselect';
import { Text } from '../Common/Text/Text';
import { MixerVerticalIcon } from '@radix-ui/react-icons';
import { AnimatePresence, motion } from 'framer-motion';
import { useControls } from 'leva';
import breakPoints from '@/utils/breakPoints';
import { MultipleStoresContext } from '@/store/locals/dashboard/TitlesStore/context';
import { observer } from 'mobx-react-lite';
import { Titles, extendTitles } from 'pages/books';

const Content = styled(Primitive.Content)``;

const ContentWrapper = styled(motion.div)`
  display: flex;
  flex-direction: column;
  position: fixed;
  z-index: 99999;
  background: #0d0d0d;
  max-width: 755px;
  min-width: 300px;
`;

const WrapperLeft = styled(ContentWrapper)`
  top: 0%;
  left: 0%;
  height: 100%;
  width: 85%;
  min-width: 250px;
  padding: 8px 32px;
  border-radius: 0 8px 8px 0;
  box-shadow: 4px 0px 8px rgba(0, 0, 0, 0.5);
`;

const WrapperBottom = styled(ContentWrapper)`
  bottom: 0%;
  left: 50%;
  width: 95%;
  height: fit-content;
  max-height: 65vh;
  padding: 8px 32px 32px;
  border-radius: 8px 8px 0 0;
  @media ${breakPoints.sm} {
    padding: 8px;
  }
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
`;

const Overlay = styled(Primitive.Overlay)`
  background-color: #0505057a;
  backdrop-filter: blur(16px);
  position: fixed;
  inset: 0;
  animation: overlay-appear 0.5s ease;
  z-index: 99999;
`;

const Triggers = styled.div`
  background-color: #171717;
  border-radius: 60px;
  display: flex;
  justify-content: space-evenly;
  box-shadow: 0px 4px 5px rgba(0, 0, 0, 0.25);
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

const FilterIcon = styled(MixerVerticalIcon)`
  width: clamp(1rem, 3vw, 30px);
  height: auto;
`;

const Trigger = styled(Primitive.Trigger)`
  background: transparent;
  color: var(--main-white-80);
  padding: 16px;
  min-width: 64px;
  width: 100%;
  transition: 0.15s;
  cursor: pointer;

  &:hover {
    color: var(--main-red-100);
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
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

const Title = styled(Text)`
  margin: 0;
  margin: 48px 0 16px;
  text-transform: capitalize;
  @media ${breakPoints.sm} {
    margin: 16px 0 8px;
  }
`;

const DragHandle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 30px;
  &::before {
    content: '';
    display: block;
    border-radius: 4px;
    height: 4px;
    width: 100px;
    background-color: var(--main-white-50);
  }
  &:hover {
    cursor: grab;
  }
  &:hover ::before {
    background-color: var(--main-white-10);
  }
`;

type WrapperProps = { position: 'bottom' | 'left' };

const wrapperLookup = {
  bottom: WrapperBottom,
  left: WrapperLeft,
};

function Wrapper({
  position = 'left',
  children,
}: PropsWithChildren<WrapperProps>) {
  const transform = {
    bottom: {
      initial: 'translate(-50%, 50%)',
      animate: 'translate(-50%, 0%)',
      exit: 'translate(-50%, 50%)',
    },
    left: {
      initial: 'translate(-50%, 0%)',
      animate: 'translate(0%, 0%)',
      exit: 'translate(-50%, 0%)',
    },
  };

  const Container = wrapperLookup[position];

  return (
    <Container
      initial={{
        opacity: 0,
        transform: transform[position].initial,
      }}
      animate={{
        opacity: 1,
        transform: transform[position].animate,
      }}
      exit={{
        opacity: 0,
        transform: transform[position].exit,
      }}
      transition={{
        duration: 0.2,
        ease: 'easeInOut',
        opacity: { duration: 0.2 },
      }}
    >
      {children}
    </Container>
  );
}

const yearsData = ['2020', '2021', '2022', '2023'];
const editionsData = ['Печатное', 'Цифровое', 'Книга 2.0', 'Аудио'];
const authorsData = [
  'Оганес Мартиросян',
  'Алексей Михайлов',
  'Анна Пашкова',
  'Александ Гаврилов',
  'Николай Старообрядцев',
  'Андрей Янкус',
  'Джек Керуак',
  'Эдуард Диа Диникин',
  'Андрей Платонов',
  'Вячеслав Немиров',
  'Фёдор Достоевский',
  'Сергей Иннер',
  'Эрих фон Нефф',
  'Артём Северский',
  'Владислав Несветаев',
];

export const Drawer = observer(({ children }: PropsWithChildren) => {
  // const config = useControls('Фильтры', {
  //   position: {
  //     value: 'left',
  //     label: 'Позиция',
  //     options: { Слева: 'left', Внизу: 'bottom' },
  //   } as const,
  // });
  const [open, setOpen] = useState(false);

  const shortTitles = useContext(MultipleStoresContext).titleStore?.titles;

  let titles: Titles = [];
  shortTitles && (titles = extendTitles(shortTitles));

  const yearsDup = titles?.map((title) => title.firstRelease.slice(0, 4));
  const years = [...new Set(yearsDup)];

  const editions = titles?.map((title) => [...title.types]);

  console.log('years array from context', years);
  console.log('editions array from context', editions);

  return (
    <Triggers>
      <Primitive.Root open={open} onOpenChange={setOpen}>
        <Trigger>
          <FilterIcon />
        </Trigger>
        <AnimatePresence>
          {open ? (
            <>
              <Overlay forceMount />
              <Content forceMount>
                <Wrapper position='left'>
                  <Title variant='h3_3'>Фильтры</Title>
                  <Container>
                    <Multiselect
                      data={authorsData}
                      twoColumn
                      title='Автор'
                      withSearch
                    />
                    <Multiselect data={editionsData} title='Издания ' />
                    <Multiselect data={yearsData} title='Год издания' />
                  </Container>
                </Wrapper>
              </Content>
            </>
          ) : null}
        </AnimatePresence>
      </Primitive.Root>
    </Triggers>
  );
});
