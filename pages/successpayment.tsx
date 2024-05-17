'use client';

import Button from '@/components/Common/Button';
import { Text } from '@/components/Common/Text/Text';
import breakPoints from '@/utils/breakPoints';
import { useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import { LinkReturnType, OrderItemType, OrdersType } from './api/order';
import { postData } from '@/utils/postData';
import { useCallback, useEffect, useState } from 'react';
import { setOrGetCartCookie } from '@/utils/cardID';

import Checkmark from '@/assets/images/checkmark.svg';
import PageLayout from '@/layouts/PageLayout';
import RedLink from '@/components/Common/Link/RedLink';

import { GetServerSideProps } from 'next/types';
import { type GetServerSidePropsContext } from 'next';

type propsType = {
  InvID: number;
  OutSum: number;
  SignatureValue: string;
};

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const req = context.req;
  const read = req.read();
  // const jso = JSON.parse(read) as propsType;
  const dataString = read.toString();
  console.log('datastring is ... ', dataString);
  //  as propsType;

  const jso = {
    InvID: 1,
    OutSum: 23,
    SignatureValue: 'randomValue',
  } as propsType;

  console.log('req params', req.method, jso);

  const p = req.method;

  return {
    props: jso,
    // props: {
    //   jso: { InvID: jso },
    // },
  };
};

const SuccessDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 40px;
  padding: 100px calc((100vw - 1440px) / 2);

  @media ${breakPoints.xxl} {
    padding: 100px 10vw 0;
  }

  @media ${breakPoints.lg} {
    padding: 80px 5vw;
  }

  @media ${breakPoints.sm} {
    align-items: center;
    padding: 50px 5vw;

    h3,
    p {
      text-align: center;
    }
  }
`;

const StyledCheckMark = styled(Checkmark)`
  @media ${breakPoints.sm} {
    order: -1;
  }
`;

const CheckDiv = styled.div`
  display: flex;
  flex-direction: row;

  align-items: center;
  gap: clamp(10px, 1.25vw + 9.6px, 30px);

  @media ${breakPoints.lg} {
  }

  @media ${breakPoints.sm} {
    flex-direction: column;
  }
`;

const StyledButton = styled(Button)`
  padding-top: 5px;

  @media ${breakPoints.md} {
    > button {
      max-width: 217px;
      min-width: 217px;

      > p {
        font-size: 10px;
      }
    }
  }
`;

const Success = ({ jso }: { jso: propsType }): React.ReactElement => {
  console.log('props are: ', jso);

  const [cartID, setCartID] = useState('');

  const [order, setOrder] = useState<OrdersType | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemType[] | []>();
  const [itemsLinks, setItemsLinks] = useState<LinkReturnType[]>();
  const [retries, setRetries] = useState(0);

  const getFile = async (url: string, fileName: string) => {
    fetch(url).then((response) => {
      response.blob().then((blob) => {
        const fileUrl = window.URL.createObjectURL(blob);
        const alink = document.createElement('a');
        alink.href = fileUrl;
        alink.download = fileName;
        alink.click();
      });
    });
  };

  const invID = jso.InvID;
  const outSum = jso.OutSum;
  const signatureValue = jso.SignatureValue;

  useEffect(() => {
    const newCartID = setOrGetCartCookie()?.toString();

    if (newCartID) {
      setCartID(newCartID);
    }
  }, []);

  useEffect(() => {
    invID && getAllLinks(invID.toString());
  }, [invID, retries]);

  const getAllLinks = async (orderID: string) => {
    console.log('fetching links ...');

    const allLinks: LinkReturnType[] = await postData(`/api/order`, {
      oper: 'fetchAllLinks',
      orderID: orderID,
    });

    allLinks.length &&
      (console.log('allLinks ', allLinks),
      allLinks.forEach((link) => {
        console.log(`downloading ... ${link.name} `);
        // const fileName = link.split('/').pop();
        const fileName = link.name;

        getFile(link.url, fileName!);

        setItemsLinks(allLinks);
      }),
      console.log('all links gotten are ... ', allLinks));

    !allLinks.length &&
      (console.log('NONE links gotten... retrying'), setRetries(retries + 1));
  };

  return (
    <PageLayout>
      <SuccessDiv>
        <div className='flex flex-col gap-5'>
          <CheckDiv>
            <Text variant='h2c' style={{ paddingBottom: '0px' }}>
              Успех!
            </Text>
            <StyledCheckMark />
          </CheckDiv>
          <Text variant='h3_1Bel'>
            Мы свяжемся с Вами для отправки материального издания.
          </Text>
          <div>
            <Text variant='h3c'>
              Скачивание цифрового, аудио издания или курса должно начаться
              автоматически.
            </Text>
            <Text variant='h3c'>
              Если не началось, то нажмите сюда:
              {itemsLinks?.length &&
                itemsLinks.map((link, index) => {
                  return (
                    <div key={link.name + index.toString()}>
                      <RedLink href={link.url}>{link.name}</RedLink>
                    </div>
                  );
                })}
            </Text>
          </div>
        </div>
        <div className='flex flex-col gap-4 items-center sm:items-start'>
          <Text variant='ctext'>
            Спасибо за покупку. Вернитесь на главную страницу или воспользуйтесь
            поиском, чтобы выбрать что-то ещё
          </Text>
          <StyledButton className='backButton' href='/' variant='wide'>
            Перейти на главную
          </StyledButton>
        </div>
        order
        <pre>{JSON.stringify(order, null, 2)}</pre>
        items
        <pre>{JSON.stringify(orderItems, null, 2)}</pre>
        links
        <pre>{JSON.stringify(itemsLinks, null, 2)}</pre>
      </SuccessDiv>
    </PageLayout>
  );
};

export default Success;
