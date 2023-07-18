import { Text } from '@/components/Common/Text/Text';
import React from 'react';
import styled from 'styled-components';

import socials from '@/utils/socials';
import contacts from '@/mocks/contacts';
import { string } from 'zod';
import breakPoints from '@/utils/breakPoints';

const PageContainer = styled.div`
  // * {
  //   outline: 1px solid green;
  // }
  // outline: 1px solid green;

  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;

  gap: 4.6vw;

  margin: auto 0;

  padding: 0 10vw;
`;

const Title = styled(Text)`
  width: 100%;
`;

const InfoDiv = styled.div`
  display: flex;

  justify-content: space-between;

  width: 100%;
`;

const Icon = styled.svg`
  height: 38px;
  width: 38px;
  color: var(--main-white-100);
  transition: all 0.3s ease-in-out;

  :hover {
    color: var(--main-red-100);
  }

  @media ${breakPoints.sm} {
    height: 25px;
    width: 25px;
  }
`;

const ContactsDiv: React.FC<{ className: string }> = ({ className }) => {
  return (
    <div className={className}>
      {/* {children} */}
      <div>
        <Text variant='h4_Abzac'> Соцсети </Text>
        <ul>
          {socials.map((item) => (
            <li key={item.name}>
              <a href={item.href}>
                <Icon as={item.icon} />
                <Text variant='manText'>{item.name}</Text>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <Text variant='h4_Abzac'> Контакты </Text>
        <ul>
          {contacts.map((item) => (
            <li key={item.content}>
              <a href={item.href}>
                <Icon as={item.icon} />
                <Text variant='manText'>{item.hightLightContent}</Text>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// <{className: string;}>

const StyledContDiv = styled(ContactsDiv)`
  display: flex;
  flex-direction: column;
  gap: 1.56vw;

  border-left: 1px solid grey;
  padding: 5.5vw 0;

  > div > h4 {
    border-left: 1px solid white;
    padding-left: 1.25vw;
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 1vw;
    padding-left: 1.25vw;
    padding-bottom: 1.3vw;
    padding-top: 1.3vw;
  }

  a {
    display: flex;
    justify-content: start;
    align-items: center;
    gap: 1.2vw;
  }
`;

const SubscribeDiv = styled.div``;

function ContactsPage() {
  return (
    <PageContainer>
      <Title variant='h2_1' align='left'>
        Будьте с нами
      </Title>
      <InfoDiv>
        <StyledContDiv className='SCDName' />
        <SubscribeDiv>тут подписка</SubscribeDiv>
      </InfoDiv>
    </PageContainer>
  );
}
export default ContactsPage;
