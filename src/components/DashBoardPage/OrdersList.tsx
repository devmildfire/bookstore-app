import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { UseFormReturn, useForm, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { supabase } from 'api/supabase-client';
import { useRouter } from 'next/router';
import { Textarea } from '../ui/textarea';
import {
  ChangeEvent,
  Children,
  RefObject,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { TitleType } from 'pages/dashboard/titles';
import { AuthorsType } from 'pages/dashboard/authors';

import { DateTimePicker } from '../ui/datetime-picker';
import { Checkbox } from '../ui/checkbox';
import slugify from 'slugify';
import MultipleSelector, { Option } from '@/components/ui/multiple-selector';
import { AwardsType } from 'pages/dashboard/awards';
import { Database } from 'api/books/types';
import { QueryData } from '@supabase/supabase-js';
import { getDate } from 'date-fns';

export type OrdersType = Database['public']['Tables']['Orders']['Row'];
export type OrderItemsType = Database['public']['Tables']['OrderItems']['Row'];

const ordersQuery = supabase.from('Orders').select(`*, items: OrderItems(*)`);

type OrdersWithItemsType = QueryData<typeof ordersQuery>;

const getOrders = async (): Promise<OrdersWithItemsType> => {
  const { data } = await ordersQuery;

  return data || [];
};

const OrdersList = () => {
  const [orders, setOrders] = useState<OrdersWithItemsType>();

  const getData = async () => {
    const orders = await getOrders();
    orders && setOrders(orders);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className='flex flex-col gap-6'>
      <div className='grid gap-x-4 gap-y-2 grid-cols-[min-content_max-content_200px_200px_200px]'>
        <span>id</span>
        <span>date</span>
        <span>status</span>
        <span>email</span>
        {/* <span>address</span> */}
        <span>summ</span>
        {/* <span>name</span> */}
        {/* <span>phone</span> */}

        {orders &&
          orders.map((order) => {
            const date = new Date(order.created_at);
            // const dateString = date.toUTCString();
            // const dateString = getDate(date);

            const monthString =
              date.getMonth() + 1 < 10
                ? `0${date.getMonth() + 1}`
                : date.getMonth() + 1;

            const dateString =
              date.getDate() + '.' + monthString + '.' + date.getFullYear();

            return (
              <>
                <span>{order.id}</span>
                <span>{dateString}</span>
                <span> {order.status} </span>
                <span>{order.email}</span>
                {/* <span>{order.adress}</span> */}
                <span>{order.summ}</span>
                {/* <span>{order.name}</span> */}
                {/* <span>{order.phone}</span> */}
              </>
            );
          })}
      </div>
    </div>
  );
};

export { OrdersList };
