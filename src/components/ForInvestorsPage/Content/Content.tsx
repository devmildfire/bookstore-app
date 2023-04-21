import React from 'react';
import Text from '@/components/Common/Text';
import { IconsDiv, ContentDiv, TextDiv, Icon, OneIconDiv } from './styles';
import { awardTypes } from './AwardTypes';

const firstPar =
  'Наша миссия — отстоять принципы существования свободного художественного высказывания. Мы отбираем рукописи в зависимости от их литературной ценности, а не коммерческого потенциала и считаем, что книгоиздание не должно быть бизнесом, чтобы писатель оставался властителем дум, а не становился удовлетворителем потребительского спроса.';
const secondPar =
  'Чтиво было и остаётся социально-культурным проектом, который создают те, кто не может не заниматься литературой и книгоизданием. А чтобы те, кто понимает необходимость литературы, даже не обладая большими финансовыми активами, могли им в этом помогать, мы разработали программу социального инвестирования.';
const thirdPar =
  'Вы можете вложить в Чтиво любую сумму от 30 000₽. Ваши деньги пойдут на выпуск новых печатных изданий, оплату труда специалистов и расширение охвата Чтива. Вы получите деньги назад с процентом, а также:';
const fourthPar =
  'Возможно спонсорство с указанием бренда спонсора в издании и сопутствующих материалах.';

const fifthPar = 'Чтобы узнать больше и участвовать, пишите нам на ';

const sixthPar =
  'Рекомендуйте нас тем, кому может быть интересно менять реальность вместе с нами.';

const seventhPar =
  'А если хотите сделать небольшой разовый или ежемесячный донат и получить бонусы от Чтива и Русского Динозавра, добро пожаловать ';

const AwardIcons = (): React.ReactElement => {
  return (
    <IconsDiv>
      {awardTypes.map((award) => {
        return (
          <OneIconDiv key={award.name}>
            <Icon as={award.icon} />
            <Text variant='manIcon'>{award.text}</Text>
          </OneIconDiv>
        );
      })}
    </IconsDiv>
  );
};

const Content = (): React.ReactElement => {
  return (
    <ContentDiv>
      <TextDiv>
        <Text variant='manText'>{firstPar}</Text>
        <Text variant='manText'>{secondPar}</Text>
        <Text variant='manText'>{thirdPar}</Text>
      </TextDiv>
      <AwardIcons />
      <TextDiv>
        <Text variant='manText'>{fourthPar}</Text>
        <Text variant='manText'>
          {fifthPar}
          <a href='mailto:info@chtivo.spb.ru' target='_blank'>
            info@chtivo.spb.ru
          </a>
        </Text>
        <Text variant='manText'>{sixthPar}</Text>
        <Text variant='manText' fontWeight={700}>
          {seventhPar}
          <a href='https://boosty.to/russiandino' target='_blank'>
            на нашу страницу Бусти
          </a>
        </Text>
      </TextDiv>
    </ContentDiv>
  );
};

export default Content;
