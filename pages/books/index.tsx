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

const testItem: CartItem = {
  id: '5a1b6bb4-7fac-4a2d-b3df-d3baa041991b',
  name: 'The TESTBook of Westmarch',
  category: 'Book2.0',
  quantity: 12345,
  summ: 987987,
  price: 989808,
};

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

  async function addItemToDB(item: CartItem) {
    const addedItem: CartItem = await postData(`/api/cart`, {
      oper: 'add',
      item: item,
    });
    console.log(
      'added item items list ... ',
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
      'removed item items list ... ',
      JSON.stringify(removedItem, null, 2)
    );
    cartID && getCartFromDB(cartID);
  }

  // function TestAddItem({ item }: { item: CartItem }) {

  //   return (
  //     <div>
  //       <p>Add a test item to Cart DB</p>
  //       <button
  //         onClick={() => {
  //           addItemToDB(item);
  //         }}
  //       >
  //         add test item
  //       </button>
  //       <p>remove a test item from Cart DB</p>
  //       <button
  //         onClick={() => {
  //           removeItemFromDB(item);
  //         }}
  //       >
  //         remove test item
  //       </button>
  //     </div>
  //   );
  // }

  function ProductList({ titles }: { titles: Title[] }): ReactElement {
    return (
      <div>
        {titles.map((title) => {
          return (
            <ul key={title.name + title.id}>
              {title.PrintedBooks && (
                <div key={title.name + title.PrintedBooks.id}>
                  <p>Printed Book - {title.name}</p>
                  <button
                    onClick={() => {
                      addItemToDB({
                        id: cartID,
                        name: title.name,
                        category: 'PrintBook',
                        quantity: 12345,
                        summ: 987987,
                        price: 989808,
                      });
                    }}
                  >
                    add
                  </button>
                  <button
                    onClick={() => {
                      removeItemFromDB({
                        id: cartID,
                        name: title.name,
                        category: 'PrintBook',
                        quantity: 12345,
                        summ: 987987,
                        price: 989808,
                      });
                    }}
                  >
                    remove
                  </button>
                </div>
              )}

              {title.Audiobooks && (
                <div>
                  <p>Audiobook - {title.name}</p>
                  <button
                    onClick={() => {
                      addItemToDB({
                        id: cartID,
                        name: title.name,
                        category: 'AudioBook',
                        quantity: 12345,
                        summ: 987987,
                        price: 989808,
                      });
                    }}
                  >
                    add
                  </button>
                  <button
                    onClick={() => {
                      removeItemFromDB({
                        id: cartID,
                        name: title.name,
                        category: 'AudioBook',
                        quantity: 12345,
                        summ: 987987,
                        price: 989808,
                      });
                    }}
                  >
                    remove
                  </button>
                </div>
              )}

              {title.Ebooks && (
                <div>
                  <p>eBook - {title.name}</p>
                  <button> add </button>
                </div>
              )}

              {title.CardBooks && (
                <div>
                  <p>CardBooks - {title.name}</p>
                  <button> add </button>
                </div>
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
      {/* <TestAddItem item={testItem} /> */}
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
