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
// import BookTwoIcon from '@/assets/icons/book2.svg';
// import BookIcon from '@/assets/icons/book.svg';
// import DigitalIcon from '@/assets/icons/digital.svg';

// interface LookupPros {
//   [key: string]: ReactNode;
// }

// const modalIconLookup: LookupPros = {
//   audio: AudioIcon,
//   book2: BookTwoIcon,
//   write: BookIcon,
//   digital: DigitalIcon,
// };

interface BookModalState {
  title: string;
  price: number;
  // newPrice?: number;
  author: string;
  types: string[];
}

interface ModalContextProps {
  handleOpenModal: Dispatch<SetStateAction<boolean>> | null;
  handleModalState: Dispatch<SetStateAction<BookModalState>> | null;
}

export const ModalContext = createContext<ModalContextProps>({
  handleOpenModal: null,
  handleModalState: null,
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

const Container = styled.div``;
const ModalTitle = styled(Text)`
  font-size: 24px;
  opacity: 0.5;
`;
const Title = styled(Text)``;
const Author = styled(Text)`
  font-size: 24px;
`;
const Price = styled(Text)`
  font-size: 24px;
  font-weight: 700;
`;
const Button = styled.button``;
const TotalPrice = styled(Text)``;

function BookModal(props: BookModalState) {
  const { title, types, author, price } = props;
  const [sum, setSum] = useState(0);

  function getType(type: string) {
    if (type === 'audio') {
      return <AudioIcon />;
    }
  }

  return (
    <Container>
      <ModalTitle>Выберите тип издания</ModalTitle>
      <Title variant='h2_2'>{title}</Title>
      <Author>{author}</Author>
      <Price>{`${price}₽`}</Price>
      {types.map((type: string) => {
        return (
          <Button onClick={() => setSum((prev) => prev + price)} type='button'>
            {getType(type)}
          </Button>
        );
      })}
      <TotalPrice>
        Сумма:
        <Price>{`${sum}₽`}</Price>
      </TotalPrice>
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
