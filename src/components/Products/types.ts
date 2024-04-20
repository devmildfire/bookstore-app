import { Title } from '@/models/books/types';
import { TriggerStyles } from '../Common/Trigger/types';

export type RowProps = {
  row: Title[];
  data: Title[];
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
