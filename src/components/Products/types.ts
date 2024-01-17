import { Book } from '@/models/books/types';
import { TriggerStyles } from '../Common/Trigger/types';

export type RowProps = {
  row: Book[];
  data: Book[];
  buttonStyle: TriggerStyles;
  bookStyle: '3d' | 'flat';
  rowId: number;
  openRowId: number | undefined;
  handleOpenRow: (id: number) => void;
};

export type PreviewProps = {
  isOpen: boolean;
  shouldClose: boolean;
  preview?: Book;
  width: number;
  handleClose: () => void;
  videoContainerRef: React.Ref<HTMLDivElement>;
};
