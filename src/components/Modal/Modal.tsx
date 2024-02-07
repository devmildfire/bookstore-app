import React, {
  useState,
  createContext,
  Dispatch,
  SetStateAction,
  ReactNode,
  useContext,
  PropsWithChildren,
  useCallback,
} from 'react';
import styled from 'styled-components';
import * as Dialog from '@radix-ui/react-dialog';
import { DialogOverlay, DialogContent } from './styles';
import Text from '../Common/Text';
import AudioIcon from '@/assets/icons/audio.svg';
import BookTwoIcon from '@/assets/icons/book2.svg';
import BookIcon from '@/assets/icons/book.svg';
import DigitalIcon from '@/assets/icons/digital.svg';
import CloseIcon from '@/assets/icons/cross.svg';
import breakPoints from '@/utils/breakPoints';
import { BookTableTypesTuple } from '@/models/books/types';
import { AnimatePresence } from 'framer-motion';
import { Trigger } from '../Common/Trigger';
import { SearchModal } from './SearchModal';

const modalIconLookup: Record<BookTableTypesTuple[number], ReactNode> = {
  Audiobooks: <AudioIcon />,
  CardBooks: <BookTwoIcon />,
  PrintedBooks: <BookIcon />,
  Ebooks: <DigitalIcon />,
};

interface BookModalState {
  name: string;
  price: number;
  // newPrice?: number;
  author: string;
  types: BookTableTypesTuple[number][];
}

interface ModalContextProps {
  handleOpenModal: (open: boolean, type?: string) => void;
  handleModalState: Dispatch<SetStateAction<BookModalState>>;
}

export const ModalContext = createContext<ModalContextProps>({
  handleOpenModal: () => () => undefined,
  handleModalState: () => undefined,
});

export const useModal = (): ModalContextProps => {
  const currentModalContext = useContext(ModalContext);

  if (!currentModalContext) {
    throw new Error('useModal has to be used within <ModalContext.Provider>');
  }

  return currentModalContext;
};

function makeMap<V = unknown>(obj: Record<string, V>) {
  return new Map<string, V>(Object.entries(obj));
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  width: 100%;
  z-index: 99;
  gap: 12px;
  @media ${breakPoints.lg} {
    gap: 0;
  }
`;
const ModalTitleWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

const ModalTitle = styled(Text)`
  font-size: 24px;
  opacity: 0.5;
  text-align: left;
  width: 100%;
  padding-top: clamp(16px, 10vh, 35px);
  font-size: clamp(14px, 2vw, 18px);
  @media ${breakPoints.md} {
    padding-top: 16px;
  }
`;
const Title = styled(Text)`
  font-size: clamp(18px, 2vw, 30px);
  font-weight: bold;
`;
const Author = styled(Text)`
  font-size: clamp(14px, 2vw, 24px);
`;
const Price = styled.span`
  font-size: clamp(14px, 2vw, 24px);
  font-weight: 700;
  @media ${breakPoints.sm} {
    order: -1;
  }
`;

const DiscountPrice = styled(Price)`
  color: var(--main-red-100);
  font-size: clamp(10px, 2vw, 20px);
  position: relative;
  /* text-decoration: line-through; */

  ::before {
    content: '';
    display: block;
    position: absolute;
    top: 50%;
    left: 0;
    background-color: var(--main-red-100);
    transform: translate(5%, 30%) rotate(-15deg);
    width: 90%;
    height: 2px;
  }
  @media ${breakPoints.sm} {
    order: 1;
  }
`;

const Buttons = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: 0.2s;
  width: 100%;
`;

const IconButtonWrapper = styled.div<{ selected: boolean }>`
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 10px 0;
  font-variant-numeric: tabular-nums;
  /* background: ${(props) => (props.selected ? 'var(--main-red-30);' : '')}; */
  /* &:hover {
    background: var(--main-red-20);
  } */
  @media screen and (orientation: landscape) and (max-width: 883px) {
    padding: 4px 5vw;
  }
  @media screen and (orientation: landscape) and (max-width: 700px) {
    padding: 2px 5vw;
  }
`;

const IconButtonContainer = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: 48px;
  align-items: center;
  justify-items: start;
  justify-content: space-between;
  width: 100%;
  margin: 0;
  @media ${breakPoints.md} {
    gap: 6px;
    grid-template-columns: 1fr auto;
    grid-template-rows: auto auto;
  }
  @media screen and (orientation: landscape) and (max-width: 883px) {
    grid-template-columns: 1fr 1fr auto;
  }
`;

const IconWrapper = styled.div`
  background-color: transparent;
  width: clamp(20px, 10vw, 55px);
  height: clamp(20px, 10vw, 55px);
  color: var(--main-white-100);
  transition: 0.15s;
  padding: 0;

  & path {
    stroke-width: 2px;
  }

  & circle {
    stroke-width: 2px;
  }

  @media ${breakPoints.md} {
    place-self: flex-end;
  }

  @media ${breakPoints.sm} {
    display: none;
  }

  @media screen and (orientation: landscape) and (max-width: 883px) {
    display: none;
  }
`;

const TotalPrice = styled(Text)`
  display: flex;
  gap: 55px;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
  border-top: thin solid var(--main-white-30);
  width: 100%;

  @media ${breakPoints.sm} {
    gap: 8px;
    flex-direction: row-reverse;
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
  width: 100%;
  @media ${breakPoints.sm} {
    gap: 12px;
  }
`;

const AddToCartButton = styled(Trigger)`
  padding: clamp(14px, 3vw, 24px) clamp(24px, 7vw, 80px);
  font-size: clamp(12px, 3vw, 16px);
  max-width: 340px;

  @media ${breakPoints.md} {
    min-width: 100%;
  }
  @media ${breakPoints.sm} {
  }
  @media screen and (orientation: landscape) and (max-width: 883px) {
  }
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 20px;
  color: white;
  background: transparent;
  padding: 0;
  cursor: pointer;
  transition: 0.1s;
  z-index: 999999;
  display: flex;
  &:hover {
    opacity: 0.5;
  }

  @media ${breakPoints.md} {
    width: 16px;
    right: 24px;
    top: 24px;
  }

  @media ${breakPoints.sm} {
    right: 16px;
    top: 16px;
  }
`;

const EditionName = styled(Text)`
  font-size: clamp(10px, 3vw, 16px);
  text-transform: uppercase;

  @media ${breakPoints.md} {
    order: -1;
  }
  @media screen and (orientation: landscape) and (max-width: 883px) {
    font-size: clamp(10px, 2vw, 16px);
  }
`;

const ProductCopiesContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 12px;
  background-color: var(--main-white-10);
  border-radius: 50px;

  @media screen and (orientation: landscape) and (max-width: 883px) {
    place-self: center;
  }
`;

const ChangeCopiesButton = styled.button`
  font-size: 18px;
  padding: 0;
  line-height: 1;
  position: relative;
  background: transparent;
  color: var(--main-white-100);
  cursor: pointer;
  :before {
    content: '';
    position: absolute;
    top: -10px;
    left: -10px;
    right: -10px;
    bottom: -10px;
  }
`;

const PriceContainer = styled.div`
  display: grid;
  gap: 8px;
  grid-template-columns: 1fr 1fr;
  align-items: center;

  @media ${breakPoints.sm} {
  }
`;

const CopiesCount = styled.span`
  font-size: 14px;
`;

const Separator = styled.hr`
  border: thin solid var(--main-black);
  height: 10px;
`;

type ProductCopiesType = {
  setSum: Dispatch<SetStateAction<number>>;
  price: number;
};

function ProductCopies({ setSum, price }: ProductCopiesType) {
  const [copies, setCopies] = useState(0);

  function increment() {
    setCopies((prev) => prev + 1);
    setSum((prev) => prev + price);
  }

  function decrement() {
    if (copies > 0) {
      setCopies((prev) => prev - 1);
      setSum((prev) => prev - price);
    }
  }

  return (
    <ProductCopiesContainer>
      <ChangeCopiesButton onClick={decrement}>-</ChangeCopiesButton>
      <Separator />
      <CopiesCount>{copies}</CopiesCount>
      <Separator />
      <ChangeCopiesButton onClick={increment}>+</ChangeCopiesButton>
    </ProductCopiesContainer>
  );
}

type EditionsMap = {
  [key: string]: string;
};

const editions: EditionsMap = {
  write: 'Печатное издание',
  book2: 'Книга 2.0',
  digital: 'Цифровое издание',
  audio: 'Аудиокнига',
};

function Edition({ children }: PropsWithChildren) {
  const [isSelected, setIsSelected] = useState(false);
  return (
    <IconButtonWrapper
      selected={isSelected}
      onClick={() => setIsSelected((prev) => !prev)}
    >
      <IconButtonContainer>{children}</IconButtonContainer>
    </IconButtonWrapper>
  );
}

function BookModal(props: BookModalState) {
  const { name, types, author, price } = props;
  const [sum, setSum] = useState(0);

  return (
    <Container>
      <Title variant='text'>{name}</Title>
      <Author>{author}</Author>
      <ModalTitleWrapper>
        <ModalTitle>Типы издания</ModalTitle>
      </ModalTitleWrapper>
      <Buttons>
        {types.map((type) => {
          if (type !== null) {
            return (
              <Edition key={type}>
                <IconWrapper>{modalIconLookup[type]}</IconWrapper>
                <EditionName variant='text'>{editions[type]}</EditionName>
                <ProductCopies setSum={setSum} price={price} />
                <PriceContainer>
                  <Price>{`${price}₽`}</Price>
                </PriceContainer>
              </Edition>
            );
          }
        })}
      </Buttons>
      <Footer>
        <TotalPrice>
          <span>Сумма:</span>
          <Price>{`${sum}₽`}</Price>
        </TotalPrice>
        <AddToCartButton
          // добавить функцию добавления нужного количества копий книги в корзину
          variant='outlined'
          onClick={() => console.log('added to the cart')}
        >
          Добавить в корзину
        </AddToCartButton>
      </Footer>
    </Container>
  );
}

const modalLookup = makeMap({ book: BookModal, search: SearchModal });

function ModalContentFallback() {
  return <div>Не удалось загрузить модальное окно</div>;
}

export default function ModalProvider({ children }: { children: ReactNode }) {
  const [{ open, modalType }, setOpen] = useState({
    open: false,
    modalType: '',
  });
  const [modalState, setModalState] = useState<BookModalState>({
    name: '',
    price: 0,
    author: '',
    types: [],
  });

  const ModalContent = modalLookup.get(modalType) ?? ModalContentFallback;

  const handleOpenModal = useCallback(
    (open: boolean, type: string = modalType) => {
      return setOpen({ open, modalType: type });
    },
    [modalType]
  );

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'л') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleOpenModal(true, 'search');
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [handleOpenModal]);

  return (
    <ModalContext.Provider
      value={{
        handleOpenModal,
        handleModalState: setModalState,
      }}
    >
      {children}
      <Dialog.Root
        open={open}
        onOpenChange={(open: boolean) => setOpen({ open, modalType })}
      >
        <AnimatePresence>
          {open ? (
            <>
              <DialogOverlay open={open} forceMount />
              <Dialog.Content forceMount>
                <DialogContent
                  layout
                  initial={{
                    opacity: 0,
                    transform: 'translate(-50%, -50%) scale(0.7)',
                  }}
                  animate={{
                    opacity: 1,
                    transform: 'translate(-50%, -50%) scale(1)',
                  }}
                  exit={{
                    opacity: 0,
                    transform: 'translate(-50%, -50%) scale(0.9)',
                  }}
                  transition={{
                    duration: 0.2,
                    ease: 'easeInOut',
                    opacity: { duration: 0.2 },
                  }}
                >
                  <ModalContent {...modalState} />
                  <Dialog.Close asChild>
                    <CloseButton
                      type='button'
                      onClick={() => handleOpenModal(false)}
                      aria-label='Закрыть'
                    >
                      <CloseIcon />
                    </CloseButton>
                  </Dialog.Close>
                </DialogContent>
              </Dialog.Content>
            </>
          ) : null}
        </AnimatePresence>
      </Dialog.Root>
    </ModalContext.Provider>
  );
}
