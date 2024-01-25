import React, { ReactElement, useEffect, useState } from 'react';
import { InferGetStaticPropsType } from 'next';
import HomeLayout from '@/layouts/HomeLayout';
import Products from '@/components/Products';
import Filters from '@/components/Filters';
import Carousel from '@/components/Carousel';
import { Drawer } from '@/components/Drawer';
import { Book, Title } from '@/models/books';
import { supabase } from 'api';
import { setOrGetCartCookie } from '@/utils/cardID';
import { Cart, CartItem } from '@/types/api';

export const getServerSideProps = async () => {
  // const { data: books, error } = await supabase.from('Titles').select('*');
  // return { props: { books: books as Book[] } };
  const { data, error } = await supabase.from('Titles').select(
    `
    *,
    authors: Titles_Authors ( ...Authors(*)),
    Photos( * ),
    CardBooks ( * ),
    Audiobooks ( * ),
    Ebooks ( * ),
    PrintedBooks ( *,
      options:PrintOptions ( *,
        size:PrintSize( * )
      ),
      cover:PrintedCover( * )
    ),
    awards: TitlesAwards ( *,  ...Awards(*) )
    `
  );
  if (error) {
    console.error(error);
  } else {
    data && console.log('data is ...', JSON.stringify(data, null, 2));
  }

  // return { props: { titles: titles as unknown as Title[] } };
  return { props: { titles: data as unknown as Title[] } };
};

async function postData(url = '', data = {}) {
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}


function TestBox({ titles }: { titles: Title[] }) {
  const [cart, setCart] = useState<Cart>([]);
  const [cartID, setCartID] = useState('');

  async function getCartFromDB(id: string) {
    const cartItems: Cart = await postData(`/api/cart`, {
      oper: 'fetch',
      id: cartID,
    });
    console.log(
      'fetched cart items list ... ',
      JSON.stringify(cartItems, null, 2)
    );
    setCart([...cartItems]);
  }

 
  function findItemIndex(name: string, category: string): number {
    const index = cart.findIndex(
      (item) => item?.name == name && item?.category == category
    );
    return index;
  }


  function updateCart(updatedItem : CartItem ) {
    const index = findItemIndex(updatedItem.name, updatedItem.category)

    let list = [...cart]

    index == -1 && (
      setCart(
        [...cart.filter(
          (item) => item.quantity !== 0
        ), 
        updatedItem]
      ),
      addItemToDB(updatedItem)
    )

    index !== -1 && (
      list[index] = updatedItem,
      list = list.filter(
        (item) => item.quantity !== 0
      ),
      setCart([...list]),
      updatedItem.quantity == 0
        ? removeItemFromDB(updatedItem)
        : updateItemInDB(updatedItem)
    )
  }

  async function updateItemInDB(item: CartItem) {
    const updatedItem: CartItem = await postData(`/api/cart`, {
      oper: 'update',
      item: item,
    });
    console.log(
      'updated item ... ',
      JSON.stringify(updatedItem, null, 2)
    );
    cartID && getCartFromDB(cartID);
  }

  async function addItemToDB(item: CartItem) {
    const addedItem: CartItem = await postData(`/api/cart`, {
      oper: 'add',
      item: item,
    });
    console.log(
      'added item to list ... ',
      JSON.stringify(addedItem, null, 2)
    );
    cartID && getCartFromDB(cartID);
  }

  async function removeItemFromDB(item: CartItem) {
    const removedItem: CartItem = await postData(`/api/cart`, {
      oper: 'remove',
      item: item,
    });
    console.log(
      'removed item from list ... ',
      JSON.stringify(removedItem, null, 2)
    );
    cartID && getCartFromDB(cartID);
  }

 
  interface productItemProps {
    updateCart: (item: CartItem) => void,
    item: CartItem;
  }

  function ProductItem({updateCart, item }: productItemProps) {

    const [number, setNumber] = useState(0)

    useEffect(
      ()=> {
        const index = cart.findIndex(
          (cartItem) => cartItem.name == item.name && cartItem.category == item.category
        )

        index !== -1 && (
          setNumber(cart[index].quantity),
          item.quantity = cart[index].quantity,
          item.summ = item.quantity * item.price,
          console.log(`item number for ${item.name} - ${item.category} is ${cart[index].quantity}`)
        )
      }
    )

    return (
      <div key={item.name + item.category}>
        <span> {item.name} - {item.category} - {item.price} </span>
        <button
          onClick={
            ()=>{
              setNumber(number - 1);
              item.quantity -= 1;
              item.summ -= item.price;
              updateCart(item)
            }
          }
          disabled = {number == 0}
        >
          -
        </button>
        <span> {item.quantity} </span>
        <button
          onClick={
            ()=>{
              setNumber(number + 1);
              item.quantity += 1;
              item.summ += item.price;
              updateCart(item)
            }
          }
        >
          +
        </button>
      </div>
    )

  }

  function ProductList({ titles }: { titles: Title[] }): ReactElement {
    return (
      <div>
        {titles.map((title) => {
          return (
            <ul key={title.name + title.id}>

              {title.PrintedBooks && (
                <ProductItem updateCart={updateCart} item={
                 { id: cartID,
                  name: title.name,
                  category: 'PrintBook',
                  quantity: 0,
                  summ: 0,
                  price: title.PrintedBooks.price * ( 100 - title.PrintedBooks.discount)}
                }/>
              )}

              {title.Audiobooks && (
                <ProductItem updateCart={updateCart} item={
                  { id: cartID,
                    name: title.name,
                    category: 'AudioBook',
                    quantity: 0,
                    summ: 0,
                    price: title.Audiobooks.price * ( 100 - title.Audiobooks.discount) }
                  }/>
              )}

              {title.Ebooks && (
                <ProductItem updateCart={updateCart} item={
                  { id: cartID,
                    name: title.name,
                    category: 'EBook',
                    quantity: 0,
                    summ: 0,
                    price: title.Ebooks.price  * ( 100 - title.Ebooks.discount)}
                  }/>
              )}

              {title.CardBooks && (
                <ProductItem updateCart={updateCart} item={
                  { id: cartID,
                    name: title.name,
                    category: 'Book2.0',
                    quantity: 0,
                    summ: 0,
                    price: title.CardBooks.price * ( 100 - title.CardBooks.discount)}
                  }/>
              )}
            </ul>
          );
        })}
      </div>
    );
  }

  useEffect(() => {
    setCartID(setOrGetCartCookie()!.toString());
  }, []);

  useEffect(() => {
    cartID && getCartFromDB(cartID);
  }, [cartID]);

  return (
    <div>
      <CartID cartID={cartID} />
      <CartItems cart={cart} />
      <ProductList titles={titles} />
    </div>
  );
}

function CartID({ cartID }: { cartID: string }) {
  return <div> ID корзины: {cartID} </div>;
}

function CartItems({ cart }: { cart: Cart }) {
  return (
    <div>
      <div>cart contents</div>
      <pre>{JSON.stringify(cart, null, 2)}</pre>
    </div>
  );
}

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

          <TestBox titles={titles} />

          <pre>{titles && JSON.stringify(titles, null, 2)}</pre>
          {/* <Products data={titles} /> */}
        </section>
      </HomeLayout>
    </>
  );
}

export default React.memo(BooksPage);
