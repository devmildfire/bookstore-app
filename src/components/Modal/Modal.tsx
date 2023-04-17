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
  text-align: center;
  gap: 12px;
  width: 100%;
  max-width: 768px;
  @media ${breakPoints.sm} {
    max-width: 280px;
    gap: 4px;
  }
`;

const ModalTitle = styled(Text)`
  font-size: 24px;
  opacity: 0.5;
  font-size: clamp(14px, 3vw, 24px);
`;
const Title = styled(Text)``;
const Author = styled(Text)`
  font-size: clamp(14px, 3vw, 24px);
`;
const Price = styled(Text)`
  font-size: clamp(14px, 3vw, 24px);
  font-weight: 700;
`;

const Buttons = styled.div`
  display: flex;
  flex-direction: row;
  gap: 24px;
  justify-content: space-evenly;

  @media ${breakPoints.sm} {
    gap: 8px;
  }
`;

const IconButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin: 32px 0 64px;
  @media ${breakPoints.sm} {
    margin: 0;
    margin: 24px 0;
  }
`;

const IconButton = styled.button`
  background-color: transparent;
  width: clamp(48px, 10vw, 150px);
  height: clamp(48px, 10vw, 150px);
  padding: min(2vw, 24px);
  color: var(--main-white-100);
  border: thin solid var(--main-white-100);
  border-radius: 4px;
  transition: 0.15s;
  cursor: pointer;

  &:hover {
    color: var(--main-red-100);
    border-color: var(--main-red-100);
  }

  @media ${breakPoints.md} {
    & circle {
      stroke-width: 0px;
    }

    & path {
      stroke-width: 2px;
    }
  }

  @media ${breakPoints.sm} {
    padding: 8px;
  }
`;

const TotalPrice = styled(Text)`
  display: flex;
  gap: 55px;
  align-items: center;

  @media ${breakPoints.sm} {
    gap: 8px;
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media ${breakPoints.sm} {
    flex-direction: column-reverse;
    gap: 12px;
  }
`;

const ToCartButton = styled(Button)`
  @media ${breakPoints.sm} {
    min-height: 48px;
    min-width: 100%;
  }
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 5%;
  right: 3%;
  width: 30px;
  color: white;
  background: transparent;
  cursor: pointer;
  transition: 0.1s;
  &:hover {
    opacity: 0.5;
  }

  @media ${breakPoints.md} {
    width: 24px;
  }
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
      <ModalTitle>Выберите тип издания</ModalTitle>
      <Title variant='h2_2'>{title}</Title>
      <Author>{author}</Author>

      <Buttons>
        {types.map((type: string) => {
          return (
            <IconButtonContainer key={type}>
              <IconButton
                onClick={() => setSum((prev) => prev + price)}
                type='button'
              >
                {modalIconLookup[type]}
              </IconButton>
              <Price>{`${price}₽`}</Price>
            </IconButtonContainer>
          );
        })}
      </Buttons>
      <Footer>
        <TotalPrice>
          Сумма:
          <Price>{`${sum}₽`}</Price>
        </TotalPrice>
        <ToCartButton>В корзину</ToCartButton>
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
