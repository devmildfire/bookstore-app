import { ShipmentSchema, ShipmentFormData } from '@/types/schemas/shipment';
import {
  StyledForm,
  StyledButton,
  FormDiv,
} from '@/components/CartPage/styles';
import { useForm, UseFormRegisterReturn } from 'react-hook-form';
import { FieldError, UseFormRegister } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  OrderItemInsertType,
  OrdersInsertType,
  OrdersType,
  roboUrlProps,
} from 'pages/api/order';
import { postData } from '@/utils/postData';
import { CartItemType } from 'pages/api/cart';
import { promoStore } from '@/store/PromoStore';
import { cartStore } from '@/store/CartStore';

async function emptyCartFromDB(cartID: string) {
  const emptyCartResponse: string = await postData(`/api/cart`, {
    oper: 'emptycart',
    id: cartID,
  });
}

async function createNewOrder(order: OrdersInsertType) {
  const newOrderResponse: OrdersType[] = await postData(`/api/order`, {
    oper: 'add',
    order: order,
  });
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

  if (promoStore.codeIsValid && promoStore.promoCode?.type === 'item') {
    const index = promoStore.discountItemIndex!;
    const item = orderItems[index];
    item.summ =
      item.quantity! *
      Math.floor((item.price! * (100 - promoStore.promoCode.discount!)) / 100);
  }

  return orderItems;
}

async function getPayUrl(props: roboUrlProps) {
  const roboUrl: string = await postData(`/api/order`, {
    oper: 'payurl',
    props: props,
  });
  return roboUrl;
}

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

type ValidFieldNames = keyof ShipmentFormData;

interface shipmentProps {
  setStage: (stage: string) => void;
  cartID: string;
  totalPrice: number;
}

export function Shipment({
  setStage,
  cartID,
  totalPrice,
}: shipmentProps): React.ReactElement {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShipmentFormData>({
    resolver: zodResolver(ShipmentSchema),
  });

  const onSubmit = async (data: ShipmentFormData) => {
    const price = promoStore.cartPromoPrice || totalPrice;

    const order: OrdersInsertType = {
      adress: data.adress,
      email: data.email,
      status: 'pending',
      cart_id: cartID,
      summ: price,
    };
    const orderID = await createNewOrder(order);

    const orderItemsAr = createOrderItemsAr(cartStore.cart, orderID);

    const orderItemsArReturn = createNewOrderItems(orderItemsAr);

    const promoNotice =
      promoStore.cartPromoPrice &&
      promoStore.promoCode &&
      promoStore.promoCode.type! === 'cart'
        ? ` C учётом промокода: ${price}₽`
        : '';

    const orderDescription =
      orderItemsAr
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
            '₽.'
          );
        })
        .toString() + promoNotice;

    const payUrlProps: roboUrlProps = {
      invoiceID: orderID,
      email: data.email,
      outSum: price.toString(),
      invoiceDescription: orderDescription,
    };
    const payUrl = await getPayUrl(payUrlProps);

    emptyCartFromDB(cartID);

    window.open(payUrl, '_blank'); //  изначально в сафари этот способ открыть новое окно блокируется, возможно есть другой лучший способ перенаправить пользователя в сервис оплаты
  };

  return (
    <div>
      <div>
        <StyledForm onSubmit={handleSubmit(onSubmit)}>
          <FormDiv>
            <FormField
              type='text'
              placeholder='Email'
              register={register('email', { required: 'email is required' })}
              name='email'
              error={errors.email}
            />
          </FormDiv>

          <FormDiv>
            <FormField
              type='text'
              placeholder='adress'
              register={register('adress', { required: 'adress is required' })}
              name='adress'
              error={errors.adress}
            />
          </FormDiv>

          <StyledButton type='submit'>Перейти к оплате</StyledButton>

          <div />
        </StyledForm>
      </div>

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
