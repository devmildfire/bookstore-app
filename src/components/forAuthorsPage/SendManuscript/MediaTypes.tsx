import digital from '@/assets/icons/digital.svg';
import audio from '@/assets/icons/audio.svg';
import print from '@/assets/icons/book.svg';
// import { ReactElement } from 'react';

export interface Media {
  readonly name: string;
  readonly icon: React.FunctionComponent;
}

const mediaTypes: Media[] = [
  {
    name: 'Цифровое',
    icon: digital,
  },
  {
    name: 'Аудио',
    icon: audio,
  },
  {
    name: 'Печатное',
    icon: print,
  },
];

export { mediaTypes };
