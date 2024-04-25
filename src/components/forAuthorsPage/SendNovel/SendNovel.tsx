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
import RedLink from '@/components/Common/Link/RedLink';

const firstPar =
  'Мы редактируем, иллюстрируем и публикуем ваши рассказы (эссе, статьи, пьесы etc.) в литературном журнале арт\u2011конгрегации Русский Динозавр — нашего творческого объединения мастеров арт-контента. Публикации тиражируются в соцсетях и на партнёрских инфоресурсах. Двенадцать избранных рассказов года попадают в ежегодник «Могучий Русский Динозавр».';

const title = 'Отправить материал в литжурнал РД';

const SendNovel = (): React.ReactElement => {
  return (
    <NovelDiv>
      <div>
        <Text variant='h1c' className='title'>
          {title}
        </Text>

        <div className='content'>
          <Text className='ctext' variant='ctext'>
            {firstPar}
          </Text>

          <Text variant='h3c' align='start'>
            {'Отправляйте ваши произведения на почту: '}
            <RedLink href='mailto:info@chtivo.spb.ru'>
              info@chtivo.spb.ru
            </RedLink>
          </Text>
        </div>
      </div>
      <div className='PawsDiv'>
        <DinoPawsBook as={dinoPaws} className='picture' />
      </div>
    </NovelDiv>
  );
};

export default SendNovel;
