import React, {
  MutableRefObject,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import styled, { keyframes } from 'styled-components';
import * as Styled from '../../src/components/CartPage/CartPage.styled';
import CartItem from '../../src/components/CartPage/CartItem/CartItem';
import Payment from '../../src/components/CartPage/Payment/Payment';
import backLinkArrow from '../../src/assets/icons/back-link-arrow.svg';
import ColumnLabels from '../../src/components/CartPage/ColumnLabels/ColumnLabels';
import { setOrGetCartCookie } from '@/utils/cardID';
import { Cart as CartType, CartItem as CartItemType } from '@/types/api';
import { postData } from '@/utils/postData';
import Text from '@/components/Common/Text';
import breakPoints from '@/utils/breakPoints';
import { StyledForm, StyledButton } from '@/components/CartPage/styles';
import debounce from '@/utils/debounce';
import { ZodError, ZodType, z } from 'zod';
import {
  useForm,
  Controller,
  // SubmitHandler,
  // SubmitErrorHandler,
  // ChangeHandler,
} from 'react-hook-form';
import { FieldError, UseFormRegister } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import Robokaska from '@/utils/robokaska';
import Input from '@/components/Common/Input';
import { json } from 'stream/consumers';

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
      ? Math.floor(product.price * (1 - product.discount / 100))
      : product.price;
    return acc + price * product.quantity;
  }, 0);
  return result;
};

interface shipmentProps {
  setStage: (stage: string) => void;
}

interface roboUrlProps {
  invoiceID: number;
  email: string;
  outSum: string;
  invoiceDescription: string;
}

// interface paymentProps {
//   setStage: (stage: string) => void;
//   quantity: number;
//   price: number;
// }

function generateRoboURL({
  invoiceID,
  email,
  outSum,
  invoiceDescription,
}: roboUrlProps) {
  const config = {
    shopIdentifier: process.env.NEXT_PUBLIC_SHOP_ID,
    password1: process.env.NEXT_PUBLIC_ROBOPASS_ONE,
    password2: process.env.NEXT_PUBLIC_ROBOPASS_TWO,
    testMode: true, // Указываем true, если работаем в тестовом режиме
  };

  const roboKassa = new Robokaska(config);

  // Вернёт строку с URL адресом, на который можно отправить пользователя
  const payURL = roboKassa.generateUrl(
    invoiceID,
    email,
    outSum,
    invoiceDescription
  );

  return payURL;
}

type FormData = {
  email: string;
  adress: string;
};

type FormFieldProps = {
  type: string;
  placeholder: string;
  name: ValidFieldNames;
  register: UseFormRegister<FormData>;
  error: FieldError | undefined;
  valueAsNumber?: boolean;
  onChange: (event: any) => void;
};

type ValidFieldNames = 'email' | 'adress';

const FormField: React.FC<FormFieldProps> = ({
  type,
  placeholder,
  name,
  register,
  error,
  valueAsNumber,
  onChange,
}) => (
  <>
    <input
      type={type}
      placeholder={placeholder}
      {...register(name, { valueAsNumber })}
      onChange={onChange}
    />
    {error && <span className='error-message'>{error.message}</span>}
  </>
);

function Form() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(UserSchema), // Apply the zodResolver
  });

  const onSubmit = async (data: FormData) => {
    console.log('SUCCESS', data);
    console.log('errors', errors);
  };

  const inputAdress = useRef() as MutableRefObject<HTMLInputElement>;
  const inputEmail = useRef() as MutableRefObject<HTMLInputElement>;

  function onAdressChange() {
    console.log(isValid);
    // console.log(
    //   'event parse...',
    //   UserSchema.safeParse({
    //     email: inputEmail.current.value,
    //     // adress: event.target.value,
    //     adress: inputAdress.current.value,
    //   })
    // );

    const result = UserSchema.safeParse({
      email: inputEmail.current.value,
      // adress: event.target.value,
      adress: inputAdress.current.value,
    });

    if (result.success === false) {
      // const errorArr = JSON.parse(result.error);
      const error = result.error;

      if (error instanceof ZodError) {
        // console.error('Object is not valid:', error.errors);
        // const errorAr = error.errors[0].message;
        const errorAr = error.errors;

        console.log(errorAr);

        errorAr.forEach((item) => {
          console.log(item.message);
        });
      }

      // error && console.log('error ... ', error);
      // const errorArr = JSON.parse(error.errors as string);

      // error && console.log('error amount ... ', errorArr);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='grid col-auto'>
        <h1 className='text-3xl font-bold mb-4'>Zod & React-Hook-Form</h1>

        {/* <FormField
          // ref={inputEmail}
          type='email'
          placeholder='Email'
          name='email'
          register={register}
          error={errors.email}
          onChange={() => {
            console.log(isValid);
          }}
        /> */}

        <input
          type='email'
          placeholder='Email'
          // name='email'
          {...register('email')}
          // error={errors.email}
          ref={inputEmail}
          onChange={onAdressChange}
        />

        <input
          type='text'
          placeholder='Adress'
          // name='email'
          {...register('adress')}
          // error={errors.email}
          ref={inputAdress}
          onChange={onAdressChange}
        />

        {/* <FormField
          // ref={inputAdress}
          type='text'
          placeholder='адрес'
          name='adress'
          register={register}
          error={errors.adress}
          onChange={(event) => {
            console.log('validity ...', isValid);
            console.log(
              'event parse...',
              // z.string().min(6).safeParse(event.target.value),
              UserSchema.safeParse({
                email: 'email@mail.com',
                adress: event.target.value,
              })
            );

            // console.log('adress error ...', errors.adress);
          }}
        /> */}

        {/* <button disabled={!isValid} type='submit' className='submit-button'> */}
        <button type='submit' className='submit-button'>
          Submit
        </button>
      </div>
    </form>
  );
}

export const UserSchema: ZodType<FormData> = z.object({
  email: z.string().email(),
  adress: z.string().min(6),
});

const FormSchema = z.object({
  // email: z.string().email(),
  email: z.string(),
  adress: z.string(),
});

type FormSchemaType = z.infer<typeof FormSchema>;

function Shipment({ setStage }: shipmentProps): React.ReactElement {
  // const [wipe, setWipe] = useState(false);
  // const [isValid, setIsvalid] = useState(false);
  // const [error, setError] = useState('');
  const [payURL, setPayURL] = useState('');

  const {
    // handleSubmit,
    register,
    control,
    // formState: { errors, isSubmitSuccessful },
    formState: { errors, isValid },
  } = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
  });

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;

    const form = e.target.parentElement;

    console.log('is valid form ...', isValid);
    console.log('form errors ...', { ...errors });

    const { value } = input;
    // const valid = input.validity.valid;
    // не показываем сообщение об ошибке если поле пустое
    // if (value !== '') {
    //   setWipe(false);
    //   // setIsvalid(valid);
    //   setError(
    //     'Русский Динозар может писать только на валидные адреса электронной почты'
    //   );
    // }
    // if (value === '') {
    //   setWipe(true);
    // }

    // valid &&
    //   setPayURL(
    //     generateRoboURL({
    //       invoiceID: 1111,
    //       email: value,
    //       outSum: '555',
    //       invoiceDescription: 'testInvoice',
    //     })
    //   );
  };

  // const debouncedOnChange = debounce(onChangeInput, 2000);
  const debouncedOnChange = onChangeInput;

  return (
    <div>
      <div>
        {/* <StyledForm
          // onSubmit={handleSubmit(onSubmit, onError)}
          action={payURL}
          target='_blank'
          method='POST'
        >
          <input
            {...register('email', {
              required: 'This is email required error.',
            })}
            onChange={debouncedOnChange}
          />

          <input
            {...register('adress', {
              required: 'This is adress required error.',
            })}
            onChange={debouncedOnChange}
          /> */}

        {/* <Controller
            control={control}
            name='email'
            render={({
              field: {
                // onChange,
                onBlur,
                value,
              },
            }) => (
              <StyledInput
                placeholder='E-mail'
                onChange={debouncedOnChange}
                onInvalid={(e) => {
                  // отключает системное сообщение валидации
                  e.preventDefault();
                }}
                onBlur={onBlur}
                value={value}
                type='email'
                name='recipient[email]'
                id='recipient_email'
                required
                className='form-control'
              />
            )}
          /> */}

        {/* <Controller
            control={control}
            name='adress'
            render={({
              field: {
                // onChange,
                onBlur,
                value,
              },
            }) => (
              <StyledInput
                placeholder='адрес'
                onChange={debouncedOnChange}
                onInvalid={(e) => {
                  // отключает системное сообщение валидации
                  e.preventDefault();
                }}
                onBlur={onBlur}
                value={value}
                type='text'
                name='recipient[adress]'
                id='recipient_adress'
                required
                className='form-control'
              />
            )}
          /> */}

        {/* <StyledButton
            type='submit'
            // onClick={() => {
            //   setWipe(true);
            // }}
            disabled={!isValid}
            // disabled={!!errors}
          >
            Перейти к оплате
          </StyledButton>

          <div />
        </StyledForm> */}
        {/* {!isValid && !wipe && error && <ErrorOutput>{error}</ErrorOutput>} */}
        {/* {!isValid && <ErrorOutput> form is not valid </ErrorOutput>} */}
      </div>

      <Form />

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

  const [cart, setCart] = useState<CartType>([]);
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
  }, [cartID]);

  const getCartFromDB = useCallback(
    async (id: string) => {
      const cartItems: CartType = await postData(`/api/cart`, {
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
  }

  useEffect(() => {
    setTotalPrice(calculateTotalPrice(cart));
  }, [cart]);

  const productQuantity = cart.reduce(
    (acc, product) => acc + product.quantity,
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
                  quantity: product.quantity + 1,
                });
              }}
              decrimentQuantity={() => {
                updateItemInDB({
                  ...product,
                  quantity: product.quantity - 1,
                });
              }}
            />
          ))}
        </Styled.ProductsList>

        <ReturnButton>
          <BackIcon />
          Вернуться назад
        </ReturnButton>
        <Payment
          setStage={setStage}
          quantity={productQuantity}
          price={totalPrice}
        />
      </>
    );
  }

  // function CartID({ cartID }: { cartID: string }) {
  //   return <div> ID корзины: {cartID} </div>;
  // }

  // function CartItems({ cart }: { cart: CartType }) {
  //   return (
  //     <div>
  //       <div>cart contents</div>
  //       <pre>{JSON.stringify(cart, null, 2)}</pre>
  //     </div>
  //   );
  // }

  return (
    <Styled.Main>
      <StyledText textColor='white' variant='h2_1_Cart'>
        {stage === 'cartStage' ? 'Корзина' : 'Доставка'}
      </StyledText>

      {stage === 'cartStage' && (cart.length ? <FullCart /> : <EmptyCart />)}

      {stage === 'shipmentStage' && <Shipment setStage={setStage} />}
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
