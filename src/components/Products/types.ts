import { Title } from '@/models/books/types';
import { TriggerStyles } from '../Common/Trigger/types';
import { ITitle } from '@/entities/title/client';

export type RowProps = {
  row: ITitle[];
  data: ITitle[];
  buttonStyle: TriggerStyles;
  bookStyle: '3d' | 'flat';
  rowId: number;
  openRowId: number | undefined;
  handleOpenRow: (id: number) => void;
};

export type PreviewProps = {
  isOpen: boolean;
  shouldClose: boolean;
  preview?: ITitle;
  slug: string | null;
  width: number;
  handleClose: () => void;
  videoContainerRef: React.Ref<HTMLDivElement>;
};
