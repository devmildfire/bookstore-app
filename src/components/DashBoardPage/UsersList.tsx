import { supabase } from 'api/supabase-client';
import { useEffect, useRef, useState } from 'react';

import { Database } from 'api/books/types';
import { QueryData } from '@supabase/supabase-js';
// import RedLink from '../Common/Link/RedLink';
import { Label } from '../ui/label';
import { Pagination } from './Pagination';

// export type OrdersType = Database['public']['Tables']['Orders']['Row'];
// export type OrderItemsType = Database['public']['Tables']['OrderItems']['Row'];

export type UsersType = Database['public']['Tables']['users']['Row'];

type FilterProps = {
  setFilteredUsers: (users: UsersType[]) => void;
  users: UsersType[];
};

const Filter = ({ users, setFilteredUsers }: FilterProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const filterUsers = (users: UsersType[]) => {
    const filteredUsers = users.filter((user) =>
      user.email?.includes(inputRef.current?.value || '')
    );

    return filteredUsers;
  };

  return (
    <div className='flex flex-row justify-start items-center gap-4'>
      <Label htmlFor='emailInput'> email filter</Label>
      <input
        ref={inputRef}
        name='emailInput'
        type='text'
        onChange={() => {
          const filteredUsers = filterUsers(users);
          setFilteredUsers(filteredUsers);
        }}
      />
    </div>
  );
};

// const ordersQuery = supabase
//   .from('Orders')
//   .select(`*, items: OrderItems(*)`)
//   .order('created_at', { ascending: false });

const usersQuery = supabase
  .from('users')
  .select(`*`);

type UsersQueryType = QueryData<typeof usersQuery>;



const getUsers = async (): Promise<UsersQueryType> => {
  const { data } = await usersQuery;

  return data || [];
};

const UsersList = ({ perPage }: { perPage: number }) => {
  const [users, setUsers] = useState<UsersQueryType>();
  const [filteredUsers, setFilteredUsers] = useState<UsersQueryType>();
  const [page, setPage] = useState(1);

  const getData = async () => {
    const users = await getUsers();
    users && setUsers(users);
    users && setFilteredUsers(users);
  };

  const ordersPerPage = perPage;
  const totalPages = filteredUsers
    ? Math.ceil(filteredUsers.length / ordersPerPage)
    : 1;

  const lastItemIndex = page * ordersPerPage;
  const firstItemIndex = lastItemIndex - ordersPerPage;
  const currentPageUsers = filteredUsers
    ? filteredUsers.slice(firstItemIndex, lastItemIndex)
    : [];

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className='flex flex-col gap-6'>
      {users && (
        <Filter users={users} setFilteredUsers={setFilteredUsers} />
      )}

      <div className='grid gap-x-5 gap-y-3 grid-cols-[repeat(3,max-content)]'>
        <span>id</span>
        {/* <span>date</span>
        <span>status</span> */}
        <span>email</span>
        {/* <span>summ</span>
        <span>info</span> */}
        <span> is admin </span> 

        {currentPageUsers &&
          currentPageUsers.map((user) => {
            // const date = new Date(order.created_at);
            // const monthString =
            //   date.getMonth() + 1 < 10
            //     ? `0${date.getMonth() + 1}`
            //     : date.getMonth() + 1;

            // const dateString =
            //   date.getDate() + '.' + monthString + '.' + date.getFullYear();

            return (
              <>
                <span>{user.id}</span>
                {/* <span>{dateString}</span> */}
                {/* <span> {order.status} </span> */}
                <span>{user.email}</span>
                <span>{
                   JSON.stringify(user.raw_app_meta_data['claims_admin'], null, 2) 
                }</span>

                {/* <span>{order.summ}</span> */}
                {/* <RedLink href={`/dashboard/orders/` + order.id}> info </RedLink> */}
              </>
            );
          })}
      </div>
      <Pagination totalPages={totalPages} onChange={setPage} />
    </div>
  );
};

export { UsersList };
