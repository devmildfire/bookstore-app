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
            <Text variant='ctext'>{firstPar}</Text>
            <Text variant='ctext'>{secondPar}</Text>
          </TextDiv>
        </div>
        <MediaIcons />
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
      <Text variant='h2c'>Требования к рукописи:</Text>

      {requirements.map((requirement) => {
        return (
          <TextReqDiv key={requirement}>
            <span>●</span>
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
      <Text variant='ctext'>Рукописи не рецензируются.</Text>
      <Text variant='ctext'>
        Посетителей без предварительной записи в редакции не принимаем.
      </Text>
      <Text variant='h4c' align='start'>
        {'Отправляйте ваши рукопись на имейл '}
        <a href='mailto:info@chtivo.spb.ru'>info@chtivo.spb.ru</a>
        {'. '}
      </Text>
      <Text variant='h4c' align='start'>
        {'Верим в вас. '}
      </Text>
      <TextForMobile variant='ctext' align='start'>
        {
          'Также рассматриваем отдельные рассказы (в том числе статьи и эссе) для публикации в '
        }
        <a href='https://t.me/russiandino' target='_blank'>
          литжурнале Русского Динозавра
        </a>
      </TextForMobile>
    </ReqDiv>
  );
};

export default SendManuscript;
