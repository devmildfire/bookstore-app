import React from 'react';
import Text from '@/components/Common/Text';
import {
  // IconsDiv,
  NovelDiv,
  // TextDiv,
  DinoPawsBook,
  // OneIconDiv,
  // ReqDiv,
  // TextReqDiv,
} from './styles';
import dinoPaws from '@/assets/images/dinoPaws.svg';

const firstPar =
  'Мы редактируем, иллюстрируем и публикуем ваши рассказы (эссе, статьи, пьесы etc.) в литературном журнале арт\u2011конгрегации Русский Динозавр — нашего творческого объединения мастеров арт-контента. Публикации тиражируются в соцсетях и на партнёрских инфоресурсах. Двенадцать избранных рассказов года попадают в ежегодник «Могучий Русский Динозавр».';

const title = 'Отправить материал в литжурнал РД'

const SendNovel = (): React.ReactElement => {
  return (
    <NovelDiv>
      <Text variant='h3_1Man' className='title'>
        {title}
      </Text>
      {/* <TextDiv > */}
      <Text className='text' variant='manText'>
        {firstPar}
      </Text>
      <Text className='link' variant='h3_1SendMan' align='start'>
        {'Отправляйте ваши произведения на почту: '}
        <a href='mailto:info@chtivo.spb.ru'>info@chtivo.spb.ru</a>
      </Text>
      {/* </TextDiv> */}
      <DinoPawsBook as={dinoPaws as any} className='picture' />
    </NovelDiv>
  );
};

export default SendNovel;
