import { TriggerStyles } from '../Common/Trigger/types';
import { Title, Titles } from 'pages/books';

export type RowProps = {
  row: Titles;
  data: Titles;
  buttonStyle: TriggerStyles;
  bookStyle: '3d' | 'flat';
  rowId: number;
  openRowId: number | undefined;
  handleOpenRow: (id: number) => void;
};

export type PreviewProps = {
  isOpen: boolean;
  shouldClose: boolean;
  preview?: Title;
  slug: string | null;
  width: number;
  handleClose: () => void;
  videoContainerRef: React.Ref<HTMLDivElement>;
};
