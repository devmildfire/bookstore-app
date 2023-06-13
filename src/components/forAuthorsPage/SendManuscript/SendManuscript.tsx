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
  'Здесь вы можете отправить свою рукопись для рассмотрения Советом Чтива. Заключаем только эксклюзивные контракты.';
const secondPar =
  'Мы предлагаем роялти 50% от всех чистых доходов с продаж всех изданий авторского текста:';

const SendManuscript = (): React.ReactElement => {
  return (
    <ContentDiv>
      <ManuscriptDiv>
        <Text variant='h3_1Man'>Уважаемые авторы</Text>
        <TextDiv>
          <Text variant='manText'>{firstPar}</Text>
          <Text variant='manText'>{secondPar}</Text>
        </TextDiv>
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
            <Text variant='manIcon'>{type.name}</Text>
          </OneIconDiv>
        );
      })}
    </IconsDiv>
  );
};

const Requirements = (): React.ReactElement => {
  return (
    <ReqDiv>
      <Text variant='sn_Title'>Требования к рукописи:</Text>

      {requirements.map((requirement) => {
        return (
          <TextReqDiv key={requirement}>
            <span>●</span>
            <Text variant='manText'>{requirement}</Text>
          </TextReqDiv>
        );
      })}
    </ReqDiv>
  );
};

const Conditions = (): React.ReactElement => {
  return (
    <ReqDiv>
      <Text variant='manRec'>Рукописи не рецензируются.</Text>
      <Text variant='h3_1SendMan' align='start'>
        {'Отправить рукопись можно на имейл '}
        <a href='mailto:info@chtivo.spb.ru'>info@chtivo.spb.ru</a>
        {'. '}
      </Text>
      <Text variant='h3_1SendMan' align='start'>
        {'Верим в вас. '}
      </Text>
      <TextForMobile variant='h3_1SendMan' align='start'>
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
