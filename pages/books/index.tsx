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

type BooksPageProps = {
  forwardedRef: null;
} & InferGetStaticPropsType<typeof getServerSideProps>;

// readonly id: number;
// readonly name: string;
// readonly description: string;
// readonly thesis: string;
// readonly trailer: string;
// readonly ageRestriction: number;
// readonly cover?: string;
// readonly isFeatured: boolean;

export const getServerSideProps = async () => {
  // const { data: books, error } = await supabase.from('Titles').select('*');
  // return { props: { books: books as Book[] } };
  const { data: titles, error } = await supabase.from('Titles').select(
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
    titles && console.log('data is ...', JSON.stringify(titles, null, 2));
  }

  return { props: { titles: titles as unknown as Title[] } };
};

function CartID() {
  const [cartID, setCartID] = useState('');
  useEffect(() => {
    setCartID(setOrGetCartCookie()!.toString());
  }, []);
  return <div> ID корзины: {cartID} </div>;
}

function CartItems() {

    async function postData(url = "", data = {}) {
      
      const response = await fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data), // body data type must match "Content-Type" header
      });
      return response.json(); // parses JSON response into native JavaScript objects
    }

    type cartItemType = {
      id: string;
      name: string;
      category: string;
      quantity: number;
      summ: number;
      price: number;
    };
  

  // type itemType = {
  //   name: string;
  //   type: string;
  //   price: number;
  //   number: number;
  // };

  const [cart, setCart] = useState<cartItemType[]>([]);
  const [cartID, setCartID] = useState('');
  useEffect(() => {
    setCartID(setOrGetCartCookie()!.toString());
  }, []);

  useEffect(()=>{
    cartID && getCartFromDB(cartID);
  }, [cartID])


  async function getCartFromDB(id: string) {
    // const cartItems: cartItemType[] =  await postData("http://localhost:3000/api/cart", { id: cartID })
   
    const cartItems: cartItemType[] =  await postData(`/api/cart`, { id: cartID })

    console.log('fetched cart items list ... ', JSON.stringify(cartItems, null, 2));
    setCart([...cartItems]);
  }

  return (
    <div>
      {' '}
      cart
      <pre>{JSON.stringify(cart, null, 2)}</pre>
    </div>
  );
}


interface ProductListProps {
  titles: Title[];
}

function ProductList({ titles }: ProductListProps): ReactElement {
  return (
    <div>
      {titles.map((title) => {
        return (
          <ul key={title.name + title.id}>

            {title.PrintedBooks && (
              <div key={title.name + title.PrintedBooks.id}>
                <p>Printed Book - {title.name}</p>
                <button> buy </button>
              </div>
            )}

            {title.Audiobooks && (
              <div >
                <p>Audiobook - {title.name}</p>
                <button> buy </button>
              </div>
            )}

            {title.Ebooks && (
              <div>
                <p>eBook - {title.name}</p>
                <button> buy </button>
              </div>
            )}

            {title.CardBooks && (
              <div>
                <p>CardBooks - {title.name}</p>
                <button> buy </button>
              </div>
            )}
          </ul>
        );
      })}
    </div>
  );
}

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
          <CartID />
          <CartItems />
          <ProductList titles={titles} />
          <pre>{titles && JSON.stringify(titles, null, 2)}</pre>
          {/* <Products data={titles} /> */}
        </section>
      </HomeLayout>
    </>
  );
}

export default React.memo(BooksPage);
