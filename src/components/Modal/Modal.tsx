import React, {
  useState,
  createContext,
  Dispatch,
  SetStateAction,
  ReactNode,
  useContext,
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
import Button from '../Common/Button';
import breakPoints from '@/utils/breakPoints';

interface LookupPros {
  [key: string]: ReactNode;
}

const modalIconLookup: LookupPros = {
  audio: <AudioIcon />,
  book2: <BookTwoIcon />,
  write: <BookIcon />,
  digital: <DigitalIcon />,
};

interface BookModalState {
  title: string;
  price: number;
  // newPrice?: number;
  author: string;
  types: string[];
}

interface ModalContextProps {
  handleOpenModal: Dispatch<SetStateAction<boolean>>;
  handleModalState: Dispatch<SetStateAction<BookModalState>>;
}

export const ModalContext = createContext<ModalContextProps>({
  handleOpenModal: () => undefined,
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
  padding: 0px 5vw;
`;
const ModalTitle = styled(Text)`
  font-size: 24px;
  opacity: 0.5;
  text-align: left;
  max-width: 580px;
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
const Price = styled(Text)`
  font-size: clamp(14px, 2vw, 24px);
  font-weight: 700;
`;

const Buttons = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: 0.2s;
  width: 100%;
`;

const IconButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 10px 5vw;
  cursor: pointer;
  &:hover {
    background: var(--main-red-30);
  }
`;

const IconButtonContainer = styled.div`
  display: grid;
  max-width: 580px;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  justify-items: start;
  width: 100%;
  margin: 0;
`;

const IconButton = styled.button`
  background-color: transparent;
  width: clamp(40px, 10vw, 55px);
  height: clamp(40px, 10vw, 55px);
  color: var(--main-white-100);
  transition: 0.15s;
  padding: 0;
  cursor: pointer;

  &:hover {
    color: var(--main-red-100);
    border-color: var(--main-red-100);
  }

  & path {
    stroke-width: 2px;
  }

  & circle {
    stroke-width: 2px;
  }
`;

const TotalPrice = styled(Text)`
  display: flex;
  gap: 55px;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
  border-top: thin solid var(--main-white-30);
  max-width: 580px;
  width: 100%;

  @media ${breakPoints.sm} {
    gap: 8px;
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
  width: 100%;
  padding: 0 5vw;

  @media ${breakPoints.sm} {
    gap: 12px;
  }
`;

const AddToCartButton = styled(Button)`
  padding: clamp(8px, 1vw, 14px) clamp(24px, 7vw, 80px);
  @media ${breakPoints.sm} {
    min-height: 48px;
    min-width: 100%;
  }
  @media ${breakPoints.sm} {
    min-height: 48px;
    min-width: 100%;
  }
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 30px;
  right: 30px;
  width: 24px;
  color: white;
  background: transparent;
  padding: 0;
  cursor: pointer;
  transition: 0.1s;
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

type EditionsMap = {
  [key: string]: string;
};

const editions: EditionsMap = {
  write: 'Печатное издание',
  book2: 'Книга 2.0',
  digital: 'Цифровое издание',
  audio: 'Аудиокнига',
};

const Edition = styled(Text)`
  font-size: clamp(10px, 3vw, 16px);
  text-transform: uppercase;
  padding: 0 5vw;
`;

function BookModal(props: BookModalState) {
  const { title, types, author, price } = props;
  const [sum, setSum] = useState(0);
  const { handleOpenModal } = useModal();

  return (
    <Container>
      <CloseButton type='button' onClick={() => handleOpenModal(false)}>
        <CloseIcon />
      </CloseButton>
      <Title variant='text'>{title}</Title>
      <Author>{author}</Author>
      <ModalTitleWrapper>
        <ModalTitle>Выберите тип издания</ModalTitle>
      </ModalTitleWrapper>
      <Buttons>
        {types.map((type: string) => {
          return (
            <IconButtonWrapper
              onClick={() => setSum((prev) => prev + price)}
              key={type}
            >
              <IconButtonContainer>
                <IconButton type='button'>{modalIconLookup[type]}</IconButton>
                <Edition variant='text'>{editions[type]}</Edition>
                <Price>{`${price}₽`}</Price>
              </IconButtonContainer>
            </IconButtonWrapper>
          );
        })}
      </Buttons>
      <Footer>
        <TotalPrice>
          Сумма:
          <Price>{`${sum}₽`}</Price>
        </TotalPrice>
        <AddToCartButton>Добавить в корзину</AddToCartButton>
      </Footer>
    </Container>
  );
}

const modalLookup = makeMap({ book: BookModal });

function ModalContentFallback() {
  return <div>Не удалось загрузить модальное окно</div>;
}

export default function ModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [modalState, setModalState] = useState({
    title: '',
    price: 0,
    author: '',
    types: [''],
  });
  const type = 'book';
  const ModalContent = modalLookup.get(type) ?? ModalContentFallback;

  return (
    <ModalContext.Provider
      value={{ handleOpenModal: setOpen, handleModalState: setModalState }}
    >
      {children}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <DialogOverlay />
          <DialogContent>
            <ModalContent {...modalState} />
          </DialogContent>
        </Dialog.Portal>
      </Dialog.Root>
    </ModalContext.Provider>
  );
}
