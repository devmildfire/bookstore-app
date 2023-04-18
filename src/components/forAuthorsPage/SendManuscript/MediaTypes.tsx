import digital from '@/assets/icons/digital.svg';
import audio from '@/assets/icons/audio.svg';
import print from '@/assets/icons/book.svg';

export interface Media {
  readonly name: string;
  readonly icon: SVGImage;
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
