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
  MutableRefObject,
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
import RedLink from '../Common/Link/RedLink';
import { Label } from '../ui/label';
import { Pagination } from './Pagination';
import { current } from '@reduxjs/toolkit';

export type OrdersType = Database['public']['Tables']['Orders']['Row'];
export type OrderItemsType = Database['public']['Tables']['OrderItems']['Row'];

type FilterProps = {
  setFilteredOrders: (orders: OrdersWithItemsType) => void;
  orders: OrdersWithItemsType;
};

const Filter = ({ orders, setFilteredOrders }: FilterProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const filterOrders = (orders: OrdersWithItemsType) => {
    const filteredOrders = orders.filter((order) =>
      order.email?.includes(inputRef.current?.value || '')
    );

    return filteredOrders;
  };

  return (
    <div className='flex flex-row justify-start items-center gap-4'>
      <Label htmlFor='emailInput'> email filter</Label>
      <input
        ref={inputRef}
        name='emailInput'
        type='text'
        onChange={() => {
          const filteredOrders = filterOrders(orders);
          setFilteredOrders(filteredOrders);
        }}
      />
    </div>
  );
};

const ordersQuery = supabase
  .from('Orders')
  .select(`*, items: OrderItems(*)`)
  .order('created_at', { ascending: false });

type OrdersWithItemsType = QueryData<typeof ordersQuery>;

const getOrders = async (): Promise<OrdersWithItemsType> => {
  const { data } = await ordersQuery;

  return data || [];
};

const OrdersList = ({ perPage }: { perPage: number }) => {
  const [orders, setOrders] = useState<OrdersWithItemsType>();
  const [filteredOrders, setFilteredOrders] = useState<OrdersWithItemsType>();
  const [page, setPage] = useState(1);

  const getData = async () => {
    const orders = await getOrders();
    orders && setOrders(orders);
    orders && setFilteredOrders(orders);
  };

  const ordersPerPage = perPage;
  const totalPages = filteredOrders
    ? Math.ceil(filteredOrders.length / ordersPerPage)
    : 1;

  const lastItemIndex = page * ordersPerPage;
  const firstItemIndex = lastItemIndex - ordersPerPage;
  const currentPageOrders = filteredOrders
    ? filteredOrders.slice(firstItemIndex, lastItemIndex)
    : [];

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className='flex flex-col gap-6'>
      {orders && (
        <Filter orders={orders} setFilteredOrders={setFilteredOrders} />
      )}

      <div className='grid gap-x-5 gap-y-3 grid-cols-[repeat(6,min-content)]'>
        <span>id</span>
        <span>date</span>
        <span>status</span>
        <span>email</span>
        <span>summ</span>
        <span>info</span>

        {currentPageOrders &&
          currentPageOrders.map((order) => {
            const date = new Date(order.created_at);
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
                <span>{order.summ}</span>
                <RedLink href={`/dashboard/orders/` + order.id}> info </RedLink>
              </>
            );
          })}
      </div>
      <Pagination totalPages={totalPages} onChange={setPage} />
    </div>
  );
};

export { OrdersList };
