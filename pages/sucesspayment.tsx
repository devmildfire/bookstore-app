// import Hal9000 from '@/assets/images/HAL9000.svg';
import HallIcon from '@/assets/images/HAL9000_iconic_eye.svg';
import HalLogo from '@/assets/images/HALLOGO.svg';
import Button from '@/components/Common/Button';
import { Text } from '@/components/Common/Text/Text';
import breakPoints from '@/utils/breakPoints';
import { useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import { OrdersInsertType, OrdersType } from './api/order';
import { postData } from '@/utils/postData';
import { useCallback, useEffect, useState } from 'react';
import { setOrGetCartCookie } from '@/utils/cardID';

// const HallIcon = styled.svg`
//   /* stroke: var(--main-white-100); */
//   margin: 0 auto;
//   /* height: 35vw; */
//   width: auto;
// `;

const HallDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  // gap: 2vh;
  /* justify-items: space-around; */
  /* height: 100%; */

  padding: 0 10vw;

  @media ${breakPoints.lg} {
    padding: 0 5vw;
  }
`;

const HalLogoStyled = styled(HalLogo)`
  width: 100%;
  /* max-width: 404px; */
  max-width: 200px;
  /* padding-bottom: 90px; */
  padding-bottom: 5px;

  @media ${breakPoints.lg} {
    /* padding-bottom: 70px; */
    /* padding-bottom: 10px; */
  }

  @media ${breakPoints.md} {
    /* padding-bottom: 20px; */
    /* padding-bottom: 10px; */
    /* max-width: 204px; */
    max-width: 122px;
  }
`;

const HallIconStyled = styled(HallIcon)`
  width: 100%;
  /* max-width: 550px; */
  max-width: 240px;

  @media ${breakPoints.md} {
    /* max-width: 250px; */
    max-width: 150px;
  }
`;

const StyledButton = styled(Button)`
  /* padding-top: 50px; */
  padding-top: 5px;

  @media ${breakPoints.md} {
    /* padding-top: 20px; */
    /* padding-top: 12px; */

    > button {
      max-width: 217px;
      min-width: 217px;

      > p {
        font-size: 10px;
      }
    }
  }
`;

// const getCartFromDB = useCallback(
//   async (id: string) => {
//     const cartItems: CartItemType[] = await postData(`/api/cart`, {
//       oper: 'fetch',
//       id: cartID,
//     });
//     console.log(
//       'fetched cart items list ... ',
//       JSON.stringify(cartItems, null, 2)
//     );
//     setCart([...cartItems]);
//   },
//   [cartID]
// );

const Hall = (): React.ReactElement => {
  // const [orderID, setOrderID] = useState();
  const [cartID, setCartID] = useState('');
  const [order, setOrder] = useState<OrdersType[]>([]);

  const params = useSearchParams();

  const sum = params.get('summ');
  const invID = params.get('inv_id');

  // setOrderID(invID!);

  // let order;

  useEffect(() => {
    const newCartID = setOrGetCartCookie()?.toString();

    if (newCartID) {
      setCartID(newCartID);
    }
  }, []);

  useEffect(() => {
    cartID && getOrder(cartID);
  }, [cartID]);

  const getOrder = useCallback(
    async (cartID: string) => {
      const OrderResponse: OrdersType[] = await postData(`/api/order`, {
        oper: 'fetch',
        // id: id,
        cartID: cartID,
      });
      console.log(
        'got order ... ',
        // JSON.stringify(newOrderResponse, null, 2)
        OrderResponse
      );
      // return JSON.parse(newOrderResponse)[0].id;
      setOrder(OrderResponse);
      // return OrderResponse;
    },
    [cartID]
  );

  // const order = getOrder('45');

  // const getOrder = useCallback(async (id: string) => {
  //   const OrderResponse: OrdersType[] = await postData(`/api/order`, {
  //     oper: 'fetch',
  //     id: id,
  //   });
  //   console.log(
  //     'got order ... ',
  //     // JSON.stringify(newOrderResponse, null, 2)
  //     OrderResponse
  //   );
  //   // return JSON.parse(newOrderResponse)[0].id;
  //   // return OrderResponse;
  //   setOrder(OrderResponse);
  // }, []);

  // useEffect(() => {
  //   const ID = params.get('inv_id');
  //   getOrder(ID!.toString());
  //   // getOrder('45');
  // }, []);

  return (
    <HallDiv>
      <HallIconStyled />
      <HalLogoStyled />
      <Text variant='h2_1_HAL' align='center'>
        «молодец, Дэйв {invID} !
      </Text>
      <Text variant='h2_1_HAL' align='center'>
        ты превратил {sum} денег в книги»
      </Text>
      <StyledButton className='backButton' href='/' variant='wide'>
        {' '}
        Вернуться на главную{' '}
      </StyledButton>
      <pre>{JSON.stringify(order, null, 2)}</pre>
      {/* <pre>{JSON.stringify(getOrder('45'), null, 2)}</pre> */}

      {/* {order[0].adress} */}
    </HallDiv>
  );
};

export default Hall;
