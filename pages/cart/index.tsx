import React, { useCallback, useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import * as Styled from '../../src/components/CartPage/CartPage.styled';
import CartItem from '../../src/components/CartPage/CartItem/CartItem';
import Payment from '../../src/components/CartPage/Payment/Payment';
import backLinkArrow from '../../src/assets/icons/back-link-arrow.svg';
import ColumnLabels from '../../src/components/CartPage/ColumnLabels/ColumnLabels';
import { setOrGetCartCookie } from '@/utils/cardID';
import { CartItemType } from 'pages/api/cart';
import { postData } from '@/utils/postData';
import Text from '@/components/Common/Text';
import breakPoints from '@/utils/breakPoints';
import { StyledForm, StyledButton } from '@/components/CartPage/styles';
import { useForm, UseFormRegisterReturn } from 'react-hook-form';
import { FieldError, UseFormRegister } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@/components/Common/Input';
import { ShipmentSchema, ShipmentFormData } from '@/types/schemas/shipment';
import {
  OrderItemInsertType,
  OrdersInsertType,
  OrdersType,
  roboUrlProps,
} from 'pages/api/order';
import { cartStore } from '@/store/CartStore';
import { observer } from 'mobx-react-lite';

const CartView = () => {
  return (
    <div>
      <pre>{JSON.stringify(cartStore.cart, null, 2)}</pre>
      <p>
        {cartStore.price &&
          `cart full price with discount is... ${cartStore.price} `}
      </p>
      {/* <p>{cartStore.codeItemIsValid && 'promo code item is valid'}</p>
      <p>{cartStore.codeDiscountIsValid && 'promo code discount is valid'}</p>
      <p>{cartStore.codeIsValid && 'promo code is valid'}</p> */}
    </div>
  );
};

const CartViewObs = observer(CartView);

const StyledText = styled(Text)`
  padding-bottom: 65px;

  @media ${breakPoints.xxl} {
    padding-bottom: 65px;
  }

  @media ${breakPoints.lg} {
    padding-bottom: 50px;
  }

  @media ${breakPoints.smd} {
    padding-bottom: 40px;
  }

  @media ${breakPoints.sm} {
    padding-bottom: 40px;
  }
`;

const BackIcon = styled(backLinkArrow)`
  margin-right: 5px;
  margin-top: 15px;
`;

const ReturnButton = styled.button`
  background-color: transparent;
  color: white;
  cursor: pointer;
`;

const calculateTotalPrice = (products: CartItemType[]): number => {
  const result = products.reduce((acc, product) => {
    const price = product.discount
      ? Math.floor(product.price! * (1 - product.discount / 100))
      : product.price;
    return acc + price! * product.quantity!;
  }, 0);
  return result;
};

interface shipmentProps {
  setStage: (stage: string) => void;
  cartID: string;
  totalPrice: number;
  cart: CartItemType[];
}

type ValidFieldNames = keyof ShipmentFormData;

type FormFieldProps = {
  type: string;
  placeholder: string;
  name: ValidFieldNames;
  register: UseFormRegisterReturn<ValidFieldNames>;
  error: FieldError | undefined;
  valueAsNumber?: boolean;
};

const FormField: React.FC<FormFieldProps> = ({
  type,
  placeholder,
  name,
  register,
  error,
  valueAsNumber,
}) => (
  <>
    <input type={type} placeholder={placeholder} {...register} />
    {error && <p>{error.message}</p>}
  </>
);

async function emptyCartFromDB(cartID: string) {
  const emptyCartResponse: string = await postData(`/api/cart`, {
    oper: 'emptycart',
    id: cartID,
  });
  console.log(
    'emptied cart of all items ... ',
    JSON.stringify(emptyCartResponse, null, 2)
  );
}

async function createNewOrder(order: OrdersInsertType) {
  const newOrderResponse: OrdersType[] = await postData(`/api/order`, {
    oper: 'add',
    order: order,
  });
  console.log(
    'created new order ... ',
    // JSON.stringify(newOrderResponse, null, 2)
    newOrderResponse
  );
  // return JSON.parse(newOrderResponse)[0].id;
  return newOrderResponse[0].id;
}

async function createNewOrderItems(itemsList: OrderItemInsertType[]) {
  const newOrderItemsResponse: OrderItemInsertType[] = await postData(
    `/api/order`,
    {
      oper: 'additems',
      items: itemsList,
    }
  );
  console.log('created new order items ... ', newOrderItemsResponse);

  return newOrderItemsResponse;
}

function createOrderItemsAr(
  cart: CartItemType[],
  orderID: number
): OrderItemInsertType[] {
  const orderItems = cart.map((item) => {
    return {
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      discount: item.discount,
      summ:
        item.quantity! *
        Math.floor((item.price! * (100 - item.discount!)) / 100),
      type: item.category,
      order_id: orderID,
    };
  });

  return orderItems;
}

async function getPayUrl(props: roboUrlProps) {
  const roboUrl: string = await postData(`/api/order`, {
    oper: 'payurl',
    props: props,
  });
  console.log('created new pay url ... ', roboUrl);

  return roboUrl;
}

function Shipment({
  setStage,
  cartID,
  totalPrice,
  cart,
}: shipmentProps): React.ReactElement {
  // const [wipe, setWipe] = useState(false);
  // const [isValid, setIsvalid] = useState(false);
  // const [error, setError] = useState('');
  const [payURL, setPayURL] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShipmentFormData>({
    resolver: zodResolver(ShipmentSchema),
  });

  const onSubmit = async (data: ShipmentFormData) => {
    console.log('SUCCESS', data);
    const order: OrdersInsertType = {
      adress: data.adress,
      email: data.email,
      status: 'pending',
      cart_id: cartID,
      summ: totalPrice,
    };
    const orderID = await createNewOrder(order);

    const orderItemsAr = createOrderItemsAr(cart, orderID);

    console.log('order ID is...', orderID);
    console.log('order items array is...', orderItemsAr);

    const orderItemsArReturn = createNewOrderItems(orderItemsAr);
    console.log('order items return array is...', orderItemsArReturn);

    const orderDescription = orderItemsAr
      .map((item) => {
        return (
          item.name! +
          ' - ' +
          item.type! +
          ' - количество ' +
          item.quantity +
          'шт. - ' +
          'цена ' +
          // item.summ +
          item.summ +
          '₽'
        );
      })
      .toString();

    const payUrlProps: roboUrlProps = {
      invoiceID: orderID,
      email: data.email,
      // outSum: totalPrice.toString(),
      outSum: '1',
      invoiceDescription: orderDescription,
    };
    const payUrl = await getPayUrl(payUrlProps);
    console.log('order pay url return is...', payUrl);

    emptyCartFromDB(cartID);

    window.open(payUrl, '_blank');
  };

  return (
    <div>
      <div>
        <StyledForm onSubmit={handleSubmit(onSubmit)}>
          <FormField
            type='text'
            placeholder='Email'
            register={register('email', { required: 'email is required' })}
            name='email'
            error={errors.email}
          />

          <FormField
            type='text'
            placeholder='adress'
            register={register('adress', { required: 'adress is required' })}
            name='adress'
            error={errors.adress}
          />

          <StyledButton type='submit'>Перейти к оплате</StyledButton>

          <div />
        </StyledForm>
      </div>

      {/* <Form /> */}

      <button
        onClick={() => {
          setStage('cartStage');
        }}
      >
        Вернуться
      </button>
    </div>
  );
}

const Cart = (): React.ReactElement => {
  const [totalPrice, setTotalPrice] = useState(0);

  const [cart, setCart] = useState<CartItemType[]>([]);

  const [cartID, setCartID] = useState('');
  const [stage, setStage] = useState('cartStage');

  useEffect(() => {
    const newCartID = setOrGetCartCookie()?.toString();

    if (newCartID) {
      setCartID(newCartID);
    }
  }, []);

  useEffect(() => {
    cartID && getCartFromDB(cartID);
    cartID && cartStore.setCart(cartID);
  }, [cartID]);

  const getCartFromDB = useCallback(
    async (id: string) => {
      const cartItems: CartItemType[] = await postData(`/api/cart`, {
        oper: 'fetch',
        id: cartID,
      });
      console.log(
        'fetched cart items list ... ',
        JSON.stringify(cartItems, null, 2)
      );
      setCart([...cartItems]);
    },
    [cartID]
  );

  async function updateItemInDB(item: CartItemType) {
    const updatedItem: CartItemType = await postData(`/api/cart`, {
      oper: 'update',
      item: item,
    });
    console.log('updated item ... ', JSON.stringify(updatedItem, null, 2));
    cartID && getCartFromDB(cartID);
    cartID && cartStore.setCart(cartID);
  }

  async function removeItemFromDB(item: CartItemType) {
    const removedItem: CartItemType = await postData(`/api/cart`, {
      oper: 'remove',
      item: item,
    });
    console.log(
      'removed item from list ... ',
      JSON.stringify(removedItem, null, 2)
    );
    cartID && getCartFromDB(cartID);
    cartID && cartStore.setCart(cartID);
  }

  useEffect(() => {
    setTotalPrice(calculateTotalPrice(cart));
  }, [cart]);

  const productQuantity = cart.reduce(
    (acc, product) => acc + product.quantity!,
    0
  ) as number;

  function EmptyCart() {
    return <div>В корзине пока ничего нет</div>;
  }

  function FullCart() {
    return (
      <>
        <ColumnLabels />
        <Styled.ProductsList>
          {cart.map((product) => (
            <CartItem
              key={product.name + product.category}
              {...product}
              handleDelete={() => {
                removeItemFromDB(product);
              }}
              incrementQuantity={() => {
                updateItemInDB({
                  ...product,
                  quantity: product.quantity! + 1,
                });
              }}
              decrimentQuantity={() => {
                updateItemInDB({
                  ...product,
                  quantity: product.quantity! - 1,
                });
              }}
            />
          ))}
        </Styled.ProductsList>

        <ReturnButton>
          <BackIcon />
          Вернуться назад
        </ReturnButton>

        <CartViewObs />

        <Payment
          setStage={setStage}
          quantity={productQuantity}
          price={totalPrice}
          cart={cart}
        />
      </>
    );
  }

  return (
    <Styled.Main>
      <StyledText textColor='white' variant='h2_1_Cart'>
        {stage === 'cartStage' ? 'Корзина' : 'Доставка'}
      </StyledText>

      {stage === 'cartStage' && (cart.length ? <FullCart /> : <EmptyCart />)}

      {stage === 'shipmentStage' && (
        <Shipment
          setStage={setStage}
          cartID={cartID}
          totalPrice={totalPrice}
          cart={cart}
        />
      )}
    </Styled.Main>
  );
};

const slideDown = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  50% {
    transform: translateY(0%);
    opacity: 1;  
  }
  to {
    transform: translateY(0%);
    opacity: 1;
  }
`;

const StyledInput = styled(Input)`
  background-color: var(--main-white-20);
  border: none;
  color: var(--main-white-100);
  padding: 20px;
  max-width: var(--width);
  margin: 0 auto;
  width: 100%;

  @media ${breakPoints.lg} {
    width: 100%;
    height: 45px;
    max-width: 415px;
    padding: 0px 6px;
    /* padding: 0px 0px; */
    margin: 0 auto;
    font-size: 14px;
  }

  @media ${breakPoints.smd} {
    width: 100%;
    height: 32px;
    max-width: 239px;
    padding: 0px 6px;
    margin: 0 auto;
    font-size: 10px;
  }

  @media ${breakPoints.sm} {
    width: 150px;
    height: 32px;
    max-width: var(--width);
    padding: 0px 6px;
    margin: 0 auto;
    font-size: 10px;
  }
`;

const ErrorOutput = styled.div`
  background-color: var(--main-red-20);
  color: var(--main-white-100);
  border: none;
  padding: 20px 0;
  margin: 0 auto;
  width: 879px;
  font-size: 16px;
  text-align: center;
  animation: ${slideDown} 0.2s linear;
  max-width: var(--width);
  border-radius: 2px;
  text-align: center;

  @media ${breakPoints.xl} {
    width: 879px;
    height: 42px;
    line-height: 42px;
    margin: 0 auto;
    font-size: 12px;
    padding: 0 6px;
  }

  @media ${breakPoints.lg} {
    width: 612px;
    height: 42px;
    line-height: 42px;
    margin: 0 auto;
    font-size: 12px;
    padding: 0 6px;
  }

  @media ${breakPoints.smd} {
    width: 400px;
    height: 32px;
    margin: 0 auto;
    font-size: 8px;
    padding: 0 6px;
    line-height: 32px;
  }

  @media ${breakPoints.sm} {
    width: 285px;
    margin: 0 auto;
    font-size: 8px;
    padding: 0 6px;
    line-height: 16px;
  }
`;

export default Cart;
