'use client';

import HallIcon from '@/assets/images/HAL9000_iconic_eye.svg';
import HalLogo from '@/assets/images/HALLOGO.svg';
import Button from '@/components/Common/Button';
import { Text } from '@/components/Common/Text/Text';
import breakPoints from '@/utils/breakPoints';
import { useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import { OrdersType } from './api/order';
import { postData } from '@/utils/postData';
import { useCallback, useEffect, useState } from 'react';
import { setOrGetCartCookie } from '@/utils/cardID';

const HallDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 0 10vw;

  @media ${breakPoints.lg} {
    padding: 0 5vw;
  }
`;

const HalLogoStyled = styled(HalLogo)`
  width: 100%;
  max-width: 200px;
  padding-bottom: 5px;

  @media ${breakPoints.lg} {
  }

  @media ${breakPoints.md} {
    max-width: 122px;
  }
`;

const HallIconStyled = styled(HallIcon)`
  width: 100%;
  max-width: 240px;

  @media ${breakPoints.md} {
    max-width: 150px;
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

const Hall = (): React.ReactElement => {
  const [cartID, setCartID] = useState('');

  const [order, setOrder] = useState<OrdersType | null>(null);

  const params = useSearchParams();

  const invID = params.get('invid');

  useEffect(() => {
    const newCartID = setOrGetCartCookie()?.toString();

    if (newCartID) {
      setCartID(newCartID);
    }
  }, []);

  useEffect(() => {
    cartID && invID && getOrder(cartID, invID);
  }, [invID]);

  const getOrder = useCallback(
    async (cartID: string, orderID: string) => {
      const OrderResponse: OrdersType = await postData(`/api/order`, {
        oper: 'fetch',
        cartID: cartID,
        orderID: orderID,
      });

      setOrder(OrderResponse);
    },
    [cartID]
  );

  return (
    <HallDiv>
      <HallIconStyled />
      <HalLogoStyled />
      <Text variant='h2_1_HAL' align='center'>
        «молодец, Дэйв {order?.id} !
      </Text>
      <Text variant='h2_1_HAL' align='center'>
        ты превратил {order?.summ} денег в книги»
      </Text>

      <Text variant='buttonText' align='center'>
        бумагу отправим по адресу {order?.adress}
      </Text>

      <Text variant='buttonText' align='center'>
        байты отправим на e-mail {order?.email}
      </Text>

      <StyledButton className='backButton' href='/' variant='wide'>
        {' '}
        Вернуться на главную{' '}
      </StyledButton>
      <pre>{JSON.stringify(order, null, 2)}</pre>
    </HallDiv>
  );
};

export default Hall;
