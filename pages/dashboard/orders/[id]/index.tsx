import * as React from 'react';

import { GetServerSideProps } from 'next/types';
import PageLayout from '@/layouts/PageLayout';
import DashMain from '@/components/DashBoardPage/DashMain';
import DashNav from '@/components/DashBoardPage/DashNav';
import { LogOut } from '@/components/LoginPage/Logout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { QueryData, Session } from '@supabase/supabase-js';
import { supabase } from 'api/supabase-client';
import { Button } from '@/components/ui/button';
import Text from '@/components/Common/Text';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;

  return {
    props: { id },
  };
};

type Props = {
  id: string;
};

const OrderPage = ({ id }: Props): React.ReactElement => {
  const [session, setSession] = useState<Session>();
  const [order, setOrder] = useState<OrderWithItemsType>();
  const router = useRouter();

  const orderQuery = supabase
    .from('Orders')
    .select(`*, items: OrderItems(*)`)
    .eq('id', id)
    .single();

  type OrderWithItemsType = QueryData<typeof orderQuery>;

  const getOrder = async (): Promise<OrderWithItemsType | null> => {
    const { data } = await orderQuery;

    return data || null;
  };

  const getData = async () => {
    const order = await getOrder();
    order && setOrder(order);
  };

  const check_session = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error(error);
      } else {
        data.session && setSession(data.session);
        !data.session?.user.user_metadata.isAdmin && router.push('/login');
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    check_session();
    getData();
  }, []);

  let date = new Date();
  let monthString = '';
  let dateString = '';
  let timeString = '';
  let hour = 0;
  let min = 0;

  if (order) {
    date = new Date(order.created_at);
    monthString =
      date.getMonth() + 1 < 10
        ? `0${date.getMonth() + 1}`
        : `${date.getMonth() + 1}`;
    dateString = date.getDate() + '.' + monthString + '.' + date.getFullYear();
    min = date.getUTCMinutes();
    hour = date.getUTCHours();
    timeString = `${hour}:${min}`;
  }

  return (
    <PageLayout>
      <DashMain>
        <div className='text-center dark flex flex-col justify-center items-center align-middle w-full self-center space-y-16'>
          <DashNav />

          <Text variant='h2_1_Cart'> Заказ {id} </Text>

          {order && (
            <div className='flex flex-col gap-6'>
              <div className='flex flex-col gap-2 items-start'>
                <Text variant='ctext'> статус: {order.status} </Text>
                <Text variant='ctext'> дата: {dateString} </Text>
                <Text variant='ctext'> время UTC: {timeString} </Text>

                <Text variant='ctext'> email: {order.email} </Text>
                <Text variant='ctext'> адрес: {order.adress} </Text>
                <Text variant='ctext'> телефон: {order.phone} </Text>
                <Text variant='ctext'> сумма: {order.summ} </Text>
              </div>

              <div>
                <Text variant='h2c'> позиции заказа </Text>

                <div className='w-full flex flex-col gap-6 items-start'>
                  {order.items.map((item) => {
                    return (
                      <div
                        key={`${item.id} ` + item.name}
                        className='w-full flex flex-col gap-1 items-start'
                      >
                        <Text variant='ctext'> название: {item.name} </Text>
                        <Text variant='ctext'> тип: {item.type} </Text>
                        <Text variant='ctext'>количество: {item.quantity}</Text>
                        <Text variant='ctext'> скидка: {item.discount} </Text>
                        <Text variant='ctext'>
                          цена без учёта скидки: {item.price}
                        </Text>
                        <Text variant='ctext'>
                          цена c учётом скидки:{' '}
                          {Math.floor(
                            (item.price! * (100 - item.discount!)) / 100
                          )}
                        </Text>
                        <hr className='w-full h-px my-8 bg-gray-200 border-0 dark:bg-gray-700' />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div>
            <Button
              variant='outline'
              onClick={() => {
                router.back();
              }}
            >
              {' '}
              вернуться к заказам{' '}
            </Button>
          </div>
          {session && <LogOut session={session} />}
        </div>
      </DashMain>
    </PageLayout>
  );
};

export default OrderPage;
