'use client';

import Button from '@/components/Common/Button';
import { Text } from '@/components/Common/Text/Text';
import breakPoints from '@/utils/breakPoints';
import { useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import { OrderItemType, OrdersType } from './api/order';
import { postData } from '@/utils/postData';
import { useCallback, useEffect, useState } from 'react';
import { setOrGetCartCookie } from '@/utils/cardID';

import Checkmark from '@/assets/images/checkmark.svg';
import PageLayout from '@/layouts/PageLayout';
import RedLink from '@/components/Common/Link/RedLink';

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

const Success = (): React.ReactElement => {
  const [cartID, setCartID] = useState('');

  const [order, setOrder] = useState<OrdersType | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemType[] | []>();
  const [itemsLinks, setItemsLinks] = useState<string[]>();
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

  const params = useSearchParams();

  const invID = params.get('invid');

  useEffect(() => {
    const newCartID = setOrGetCartCookie()?.toString();

    if (newCartID) {
      setCartID(newCartID);
    }
  }, []);

  useEffect(() => {
    // cartID && invID && getOrder(cartID, invID);
    // invID && getOrderItems(invID);
    invID && getAllLinks(invID);
  }, [invID, retries]);

  const getOrder = useCallback(
    async (cartID: string, orderID: string) => {
      const OrderResponse: OrdersType = await postData(`/api/order`, {
        oper: 'fetch',
        // cartID: cartID,
        orderID: orderID,
      });

      console.log('settring order');

      setOrder(OrderResponse);
    },
    [cartID]
  );

  const getOrderItems = useCallback(
    async (orderID: string) => {
      const OrderItemsResponse: OrderItemType[] = await postData(`/api/order`, {
        oper: 'fetchitems',
        orderID: orderID,
      });

      setOrderItems(OrderItemsResponse);
    },
    [cartID]
  );

  const getItemsLinks = async () => {
    if (orderItems && orderItems.length) {
      console.log('order items ...', orderItems);

      const itemslinks: string[] = await Promise.all(
        orderItems.map(async (item) => {
          const link: string = await postData(`/api/order`, {
            oper: 'fetchlink',
            titleName: item.name,
            productType: item.type,
          });
          console.log('link is ...', link);
          return link;
        })
      );

      setItemsLinks(itemslinks);
    }
  };

  const getAllLinks = async (orderID: string) => {
    console.log('fetching links ...');

    const allLinks: string[] = await postData(`/api/order`, {
      oper: 'fetchAllLinks',
      orderID: orderID,
    });

    allLinks.length &&
      (console.log('allLinks ', allLinks),
      allLinks.forEach((link) => {
        console.log(`downloading ... ${link} `);
        const fileName = link.split('/').pop();
        getFile(link, fileName!);

        setItemsLinks(allLinks);
      }),
      console.log('all links gotten are ... ', allLinks));

    !allLinks.length &&
      (console.log('NONE links gotten... retrying'), setRetries(retries + 1));
  };

  // useEffect(() => {
  //   console.log('getting links');
  //   orderItems && getItemsLinks();
  // }, [orderItems]);

  // useEffect(() => {
  //   console.log('downloading links');
  //   itemsLinks &&
  //     itemsLinks.forEach((link) => {
  //       console.log(`downloading ... ${link} `);
  //       const fileName = link.split('/').pop();
  //       getFile(link, fileName!);
  //     });
  // }, [itemsLinks]);

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
            Мы свяжемся с Вами для отправки печатного издания
          </Text>
          <div>
            <Text variant='h3c'>
              Скачивание цифрового издания должно начаться автоматически.
            </Text>
            <Text variant='h3c'>
              А если нет, то вот
              {itemsLinks?.length && (
                <RedLink href={itemsLinks[0]}> ссылка на скачивание </RedLink>
              )}
            </Text>
          </div>
        </div>
        <div className='flex flex-col gap-4 items-center sm:items-start'>
          <Text variant='ctext'>
            Вернитесь на главную или воспользуйтесь поиском, чтобы выбрать
            что-то ещё
          </Text>
          <StyledButton className='backButton' href='/' variant='wide'>
            Перейти на главную
          </StyledButton>
        </div>
        {/* order
        <pre>{JSON.stringify(order, null, 2)}</pre>
        items
        <pre>{JSON.stringify(orderItems, null, 2)}</pre>
        links
        <pre>{JSON.stringify(itemsLinks, null, 2)}</pre> */}
      </SuccessDiv>
    </PageLayout>
  );
};

export default Success;
