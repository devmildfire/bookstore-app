// TODO оптимизировать изображения
import { AboutInto } from '@/types/aboutInfo';
import printed from '@/assets/images/printed-cover.jpg';
import bookV2 from '@/assets/images/book2.0-cover.jpg';
import digitaAndAudio from '@/assets/images/digital-and-audio-cover.png';

const aboutInfo: AboutInto[] = [
  {
    // TODO добавить перенос строки после тире
    content: 'Нестареющая классика — книги из деревьев.',
    image: printed.src,
    title: 'ПЕЧАТНЫЕ ИЗДАНИЯ',
  },
  {
    content: 'Компактная эстетика — материальный носитель цифрового издания.',
    image: bookV2.src,
    title: 'КНИГИ 2.0',
  },
  {
    content: 'Экология и скорость — издания будущего.',
    image: digitaAndAudio.src,
    title: 'ЦИФРОВЫЕ И АУДИО ИЗДАНИЯ',
  },
];

export default aboutInfo;
