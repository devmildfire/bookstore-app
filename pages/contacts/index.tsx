import { Text } from '@/components/Common/Text/Text';
import React from 'react';
import styled from 'styled-components';

import socials from '@/utils/socials';
import contacts from '@/mocks/contacts';
import { string } from 'zod';

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
  color: var(--main-white-100);
  transition: all 0.3s ease-in-out;

  :hover {
    color: var(--main-red-100);
  }
`;
// const ContactsDiv = styled.div``;



const ContactsDiv = ({ className }):React.ReactElement => {
  return (
    <div className={className}>
      {/* {children} */}
      <div>
        <Text variant='h3_1Man'> Соцсети </Text>
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
        <Text variant='h3_1Man'> Контакты </Text>
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


border-left: 1px solid grey;

> div > h3 {
  border-left: 1px solid white;
  padding-left: 2vw;
}

  ul {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-left: 2vw;
  }  

  a {
      display: flex;
      justify-content: start;
      gap: 20px;
  }
`;

const SubscribeDiv = styled.div``;

function ContactsPage() {
  return (
    <PageContainer>
      <Title variant='h1_Inv' align='left'>
        тут будет страница контактов
      </Title>
      <InfoDiv>
        <StyledContDiv className='SCDName' />
        <SubscribeDiv>тут подписка</SubscribeDiv>
      </InfoDiv>
    </PageContainer>
  );
}
export default ContactsPage;
