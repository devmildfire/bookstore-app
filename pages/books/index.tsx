import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { InferGetStaticPropsType } from 'next';
import HomeLayout from '@/layouts/HomeLayout';
import Products from '@/components/Products';
import Filters from '@/components/Filters';
import Carousel from '@/components/Carousel';
import { Drawer } from '@/components/Drawer';
import { BookTableTypesTuple, Title } from '@/models/books';
import { setOrGetCartCookie } from '@/utils/cardID';
import { Cart, CartItem } from '@/types/api';
import { Course } from '@/types/course';
import { API } from 'api/books/';

export const getServerSideProps = async () => {
  const { data, error } = await API.getTitles();

  // FIXME: Нужно обрабатывать ошибки, чтобы пользователь был в курсе, что что-то пошло не так
  if (error) {
    console.error(error);
  }

  if (data) {
    const bookTypes: BookTableTypesTuple = [
      'PrintedBooks',
      'Ebooks',
      'Audiobooks',
      'CardBooks',
    ];
    const titles = data.map((title) => ({
      ...title,
      price: bookTypes
        .map((type) => (title[type] ? title[type].price : null))
        .filter((price) => price !== null) as number[],
      types: bookTypes
        .map((type) => (title[type] ? type : null))
        .filter((type) => type !== null) as BookTableTypesTuple,
    }));

    return {
      props: {
        titles,
      },
    };
  }

  return null;
};

// async function postData(url = '', data = {}) {
//   const response = await fetch(url, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       // 'Content-Type': 'application/x-www-form-urlencoded',
//     },
//     referrerPolicy: 'no-referrer',
//     body: JSON.stringify(data),
//   });

//   return response.json();
// }

// function TestBox({ titles, courses }: { titles: Title[]; courses: Course[] }) {
//   const [cart, setCart] = useState<Cart>([]);
//   const [cartID, setCartID] = useState('');

//   const getCartFromDB = useCallback(
//     async (id: string) => {
//       const cartItems: Cart = await postData(`/api/cart`, {
//         oper: 'fetch',
//         id: cartID,
//       });
//       console.log(
//         'fetched cart items list ... ',
//         JSON.stringify(cartItems, null, 2)
//       );
//       setCart([...cartItems]);
//     },
//     [cartID]
//   );

//   function findItemIndex(name: string, category: string): number {
//     const index = cart.findIndex(
//       (item) => item?.name == name && item?.category == category
//     );
//     return index;
//   }

//   function updateCart(updatedItem: CartItem) {
//     const index = findItemIndex(updatedItem.name, updatedItem.category);

//     let list = [...cart];

//     index == -1 &&
//       (setCart([...cart.filter((item) => item.quantity !== 0), updatedItem]),
//       addItemToDB(updatedItem));

//     index !== -1 &&
//       ((list[index] = updatedItem),
//       (list = list.filter((item) => item.quantity !== 0)),
//       setCart([...list]),
//       updatedItem.quantity == 0
//         ? removeItemFromDB(updatedItem)
//         : updateItemInDB(updatedItem));
//   }

//   async function updateItemInDB(item: CartItem) {
//     const updatedItem: CartItem = await postData(`/api/cart`, {
//       oper: 'update',
//       item: item,
//     });
//     console.log('updated item ... ', JSON.stringify(updatedItem, null, 2));
//     cartID && getCartFromDB(cartID);
//   }

//   async function addItemToDB(item: CartItem) {
//     const addedItem: CartItem = await postData(`/api/cart`, {
//       oper: 'add',
//       item: item,
//     });
//     console.log('added item to list ... ', JSON.stringify(addedItem, null, 2));
//     cartID && getCartFromDB(cartID);
//   }

//   async function removeItemFromDB(item: CartItem) {
//     const removedItem: CartItem = await postData(`/api/cart`, {
//       oper: 'remove',
//       item: item,
//     });
//     console.log(
//       'removed item from list ... ',
//       JSON.stringify(removedItem, null, 2)
//     );
//     cartID && getCartFromDB(cartID);
//   }

//   interface productItemProps {
//     updateCart: (item: CartItem) => void;
//     item: CartItem;
//   }

//   function ProductItem({ updateCart, item }: productItemProps) {
//     const [number, setNumber] = useState(0);

//     useEffect(() => {
//       const index = cart.findIndex(
//         (cartItem) =>
//           cartItem.name == item.name && cartItem.category == item.category
//       );

//       index !== -1 &&
//         (setNumber(cart[index].quantity),
//         (item.quantity = cart[index].quantity),
//         (item.summ = item.quantity * item.price),
//         console.log(
//           `item number for ${item.name} - ${item.category} is ${cart[index].quantity}`
//         ));
//     }, [item]);

//     return (
//       <div key={item.name + item.category}>
//         <span>
//           {' '}
//           {item.name} - {item.category} - {item.price}{' '}
//         </span>
//         <button
//           onClick={() => {
//             setNumber(number - 1);
//             item.quantity -= 1;
//             item.summ -= item.price;
//             updateCart(item);
//           }}
//           disabled={number == 0}
//         >
//           -
//         </button>
//         <span> {item.quantity} </span>
//         <button
//           onClick={() => {
//             setNumber(number + 1);
//             item.quantity += 1;
//             item.summ += item.price;
//             updateCart(item);
//           }}
//         >
//           +
//         </button>
//       </div>
//     );
//   }

//   function ProductList({ titles }: { titles: Title[] }): ReactElement {
//     return (
//       <div>
//         {courses.map((course) => {
//           return (
//             <ul key={course.name + course.id}>
//               <ProductItem
//                 updateCart={updateCart}
//                 item={{
//                   id: cartID,
//                   name: course.name,
//                   category: 'Course',
//                   quantity: 0,
//                   summ: 0,
//                   price: course.price,
//                 }}
//               />
//             </ul>
//           );
//         })}

//         {titles.map((title) => {
//           return (
//             <ul key={title.name + title.id}>
//               {title.PrintedBooks && (
//                 <ProductItem
//                   updateCart={updateCart}
//                   item={{
//                     id: cartID,
//                     name: title.name,
//                     category: 'PrintBook',
//                     quantity: 0,
//                     summ: 0,
//                     price: Math.floor(
//                       (title.PrintedBooks.price *
//                         (100 - title.PrintedBooks.discount)) /
//                         100
//                     ),
//                   }}
//                 />
//               )}

//               {title.Audiobooks && (
//                 <ProductItem
//                   updateCart={updateCart}
//                   item={{
//                     id: cartID,
//                     name: title.name,
//                     category: 'AudioBook',
//                     quantity: 0,
//                     summ: 0,
//                     price: Math.floor(
//                       (title.Audiobooks.price *
//                         (100 - title.Audiobooks.discount)) /
//                         100
//                     ),
//                   }}
//                 />
//               )}

//               {title.Ebooks && (
//                 <ProductItem
//                   updateCart={updateCart}
//                   item={{
//                     id: cartID,
//                     name: title.name,
//                     category: 'EBook',
//                     quantity: 0,
//                     summ: 0,
//                     price: Math.floor(
//                       (title.Ebooks.price * (100 - title.Ebooks.discount)) / 100
//                     ),
//                   }}
//                 />
//               )}

//               {title.CardBooks && (
//                 <ProductItem
//                   updateCart={updateCart}
//                   item={{
//                     id: cartID,
//                     name: title.name,
//                     category: 'Book2.0',
//                     quantity: 0,
//                     summ: 0,
//                     price: Math.floor(
//                       (title.CardBooks.price *
//                         (100 - title.CardBooks.discount)) /
//                         100
//                     ),
//                   }}
//                 />
//               )}
//             </ul>
//           );
//         })}
//       </div>
//     );
//   }

//   useEffect(() => {
//     const newCartID = setOrGetCartCookie()?.toString();

//     if (newCartID) {
//       setCartID(newCartID);
//     }
//   }, []);

//   useEffect(() => {
//     cartID && getCartFromDB(cartID);
//   }, [cartID]);

//   return (
//     <div>
//       <CartID cartID={cartID} />
//       <CartItems cart={cart} />
//       <ProductList titles={titles} />
//     </div>
//   );
// }

// function CartID({ cartID }: { cartID: string }) {
//   return <div> ID корзины: {cartID} </div>;
// }

// function CartItems({ cart }: { cart: Cart }) {
//   return (
//     <div>
//       <div>cart contents</div>
//       <pre>{JSON.stringify(cart, null, 2)}</pre>
//     </div>
//   );
// }

type BooksPageProps = {
  forwardedRef: null;
} & InferGetStaticPropsType<typeof getServerSideProps>;

function BooksPage({ forwardedRef, titles }: BooksPageProps) {
  return (
    <>
      <Carousel
        forwardedRef={forwardedRef}
        slides={[0, 1, 2]}
        options={{ dragThreshold: 1, duration: 25 }}
      />
      <HomeLayout title='Издания'>
        <section className='max-width'>
          <Filters />
          <Drawer />
          <Products data={titles} />
        </section>
      </HomeLayout>
    </>
  );
}

export default React.memo(BooksPage);
