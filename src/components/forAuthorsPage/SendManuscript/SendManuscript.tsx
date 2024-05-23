import React from 'react';
import Text from '@/components/Common/Text';
import {
  IconsDiv,
  ManuscriptDiv,
  TextDiv,
  Icon,
  OneIconDiv,
  ReqDiv,
  TextReqDiv,
  TextForMobile,
  ContentDiv,
  BugDiv,
} from './styles';
import { mediaTypes } from './MediaTypes';
import { requirements } from './Requirements';
import BugTypeWriter from '@/assets/images/BugTypeWriter.png';
import Image from 'next/image';
import FAQ from './faq';
import RedLink from '@/components/Common/Link/RedLink';

const firstString =
  'Убедитесь, что ваша рукопись соответствует требованиям ниже, и присылайте её вместе с синопсисом на ';

const secondString =
  'Заключаем только эксклюзивные контракты. Мы предлагаем вам роялти 50% чистого дохода от всех покупок изданий авторского текста:';

const thirdString =
  'Мы не берём денег с авторов за издание, только платим им. Если хотите издаватьс яна коммерческой основе, обратитесь в наш Русский Динозавр: ';

const firstPar =
  'Здесь вы можете узнать, как отправить свою рукопись для рассмотрения Советом Чтива. Заключаем только эксклюзивные контракты.';
const secondPar =
  'Мы предлагаем роялти 50% от всех чистых доходов с продаж всех изданий авторского текста:';

const SendManuscript = (): React.ReactElement => {
  return (
    <ContentDiv>
      <ManuscriptDiv>
        <div>
          <Text variant='h1c'>Уважаемые авторы</Text>
          <TextDiv>
            <Text variant='ctext'>
              {firstString}{' '}
              <RedLink href='mailto:info@chtivo.spb.ru'>
                info@chtivo.spb.ru
              </RedLink>{' '}
            </Text>
            <Text variant='ctext'>{secondString}</Text>
          </TextDiv>
        </div>
        <MediaIcons />
        <TextDiv>
          <Text variant='ctext'>
            {thirdString}{' '}
            <RedLink href='mailto:hello@russiandino.ru'>
              info@chtivo.spb.ru
            </RedLink>{' '}
          </Text>
        </TextDiv>
        <Requirements />
        <Conditions />
      </ManuscriptDiv>
      <BugPart />
    </ContentDiv>
  );
};

const BugPart = (): React.ReactElement => {
  return (
    <BugDiv>
      <Image src={BugTypeWriter} alt='theBugTypeWriter' />
    </BugDiv>
  );
};

const MediaIcons = (): React.ReactElement => {
  return (
    <IconsDiv>
      {mediaTypes.map((type) => {
        const CurrentIcon = type.icon;
        return (
          <OneIconDiv key={type.name}>
            <Icon>
              <CurrentIcon />
            </Icon>
            <Text variant='ctext'>{type.name}</Text>
          </OneIconDiv>
        );
      })}
    </IconsDiv>
  );
};

const Requirements = (): React.ReactElement => {
  return (
    <ReqDiv>
      <Text variant='h1c'>Требования к рукописи</Text>

      {requirements.map((requirement) => {
        return (
          <TextReqDiv key={requirement}>
            <span className='text-mainred'>●</span>
            <Text variant='ctext'>{requirement}</Text>
          </TextReqDiv>
        );
      })}
    </ReqDiv>
  );
};

const Conditions = (): React.ReactElement => {
  return (
    <ReqDiv>
      <Text variant='ctext'>
        Подробно о том, как мы работаем с рукописями, узнайте в{' '}
        <RedLink href='https://dzen.ru/a/ZVjmIR0BaUxB4hsg?share_to=link'>
          статье
        </RedLink>
        .
      </Text>
      <Text variant='ctext'>
        Также рассматриваем отдельные рассказы (статьи, эссе, пьесы) до 30 тысяч
        символов с пробелами для публикации в литжурнале Русского Динозавра с
        тиражированием на:{' '}
        <RedLink href='https://dzen.ru/russiandino?share_to=link'>Дзен</RedLink>
        , <RedLink href='https://vk.com/russiantrex'>ВКонтакте</RedLink>,{' '}
        <RedLink href='https://t.me/russiandino'>Телеграм</RedLink>,{' '}
        <RedLink href='https://www.instagram.com/russiandino_ru/?igshid=MzRlODBiNWFlZA%3D%3D'>
          Инстаграм*
        </RedLink>
        , <RedLink href='https://pikabu.ru/@russiandino'>Пикабу</RedLink>.
        Важно: материал не должен быть ранее опубликован на Дзене.
      </Text>
      <Text variant='ctext'>Рукописи не рецензируются.</Text>
      <Text variant='ctext'>
        Посетителей без предварительной записи в редакции не принимаем.
      </Text>
      {/* <Text variant='h4c' align='start'>
        {'Отправляйте ваши рукопись на имейл '}
        <a href='mailto:info@chtivo.spb.ru'>info@chtivo.spb.ru</a>
      </Text> */}
      <Text variant='h4c' align='start'>
        {'Верим в вас. '}
      </Text>
      <p className='smalltext'>
        *Правительственные органы страны Россия признали Инстаграм
        экстремистской организацией, будьте бдительны.
      </p>
      {/* <TextForMobile variant='ctext' align='start'>
        {
          'Также рассматриваем отдельные рассказы (в том числе статьи и эссе) для публикации в '
        }
        <a href='https://t.me/russiandino' target='_blank'>
          литжурнале Русского Динозавра
        </a>
      </TextForMobile> */}
      <FAQ />
    </ReqDiv>
  );
};

export default SendManuscript;
