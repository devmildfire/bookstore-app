import { Text } from '@/components/Common/Text/Text';
import React from 'react';
import styled from 'styled-components';

import SubscribeForm from '@/components/AboutPage/BeWithUs/SubscribeForm/SubscribeForm';

import socials from '@/utils/socials';
import contacts from '@/mocks/contacts';
// import { string } from 'zod';
import breakPoints from '@/utils/breakPoints';
// import Hands from '@/assets/images/handshake.svg';
import Hands from '@/assets/images/handshake_2.svg';

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

  @media ${breakPoints.lg} {
    padding: 0 5vw;
  }
`;

const Title = styled(Text)`
  width: 100%;
  margin: 0;
  align-self: flex-start;
`;

const InfoDiv = styled.div`
  display: flex;

  justify-content: space-between;

  width: 100%;

  @media ${breakPoints.sm} {
    flex-direction: column;
    gap: 30px;
  }
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

const StyledContDiv = styled(ContactsDiv)`
  display: flex;
  flex-direction: column;
  gap: 1.56vw;

  border-left: 1px solid grey;
  /* padding: 3vw 0; */

  > div > h4 {
    border-left: 1px solid white;
    padding-left: 1.25vw;
    padding-bottom: 10px;
    padding-top: 10px;
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
    /* transition: all 0.6s ease-in-out; */

    :hover {
      p,
      svg {
        color: var(--main-red-100);
        transition: all 0.3s ease-in-out;
      }
    }
  }

  @media ${breakPoints.sm} {
    ul {
      gap: 10px;
      padding-left: max(4.25vw, 15px);
    }

    > div > h4 {
      border-left: 1px solid white;
      padding-left: max(4.25vw, 15px);
      padding-bottom: 10px;
      padding-top: 10px;
    }

    a {
      gap: max(8px, 3vw);
    }
  }
`;

const SubscribeDiv = styled.div`
  display: flex;
  flex-direction: column;
  /* justify-content: center; */
  justify-content: flex-start;
  align-items: flex-end;

  padding-top: 10px;

  gap: 30px;

  width: 45vw;

  > div {
    width: 100%;
  }

  > div > div {
    max-width: 100%;
    height: unset;
    line-height: unset;
    padding: 10px 20px;
  }

  @media ${breakPoints.xl} {
    width: 55vw;
  }

  @media ${breakPoints.lg} {
    width: 45vw;
  }

  @media ${breakPoints.md} {
    > div > form {
      grid-template-columns: 1fr;
      justify-items: center;

      input {
        max-width: 223px;
      }
      button {
        max-width: unset;
        min-width: unset;
        width: 223px;

        @media ${breakPoints.sm} {
          /* width: 150px; */
        }
      }
    }
  }

  @media ${breakPoints.sm} {
    width: 100%;
  }
`;

const SubscribeCTA = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
  align-items: flex-start;

  @media ${breakPoints.sm} {
    gap: 10px;
  }
`;

const StyledHands = styled(Hands)<{ className: string }>`
  padding-bottom: 0vw;

  @media ${breakPoints.md} {
    padding-bottom: 10vw;
  }
`;

function ContactsPage() {
  return (
    <PageContainer>
      <Title variant='h2_1' align='left'>
        Будьте с нами
      </Title>
      <InfoDiv>
        <StyledContDiv className='SCDName' />
        <SubscribeDiv>
          <SubscribeCTA>
            <Text variant='h4_Abzac'> Подписка на рассылку </Text>
            <Text variant='manText'> Знайте о Чтиве больше, чем кто-либо </Text>
          </SubscribeCTA>
          <SubscribeForm />
          <StyledHands className='hands_svg' />
        </SubscribeDiv>
      </InfoDiv>
    </PageContainer>
  );
}
export default ContactsPage;
