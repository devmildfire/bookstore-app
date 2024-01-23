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
  type itemType = {
    name: string;
    type: string;
    price: number;
    number: number;
  };

  const [cart, setCart] = useState<itemType[]>([]);
  const [cartID, setCartID] = useState('');
  useEffect(() => {
    setCartID(setOrGetCartCookie()!.toString());
    getCartFromDB(setOrGetCartCookie()!.toString());
  }, []);

  async function getCartFromDB(id: string) {
    const { data, error } = await supabase.from('Cart').select().eq('id', id);

    data &&
      console.log('DB cart fetch success ... ', JSON.stringify(data, null, 2));
    error &&
      console.log('DBcart fetch FAILED ... ', JSON.stringify(error, null, 2));

    let itemList: itemType[] = [];

    data &&
      (itemList = data?.map((item) => {
        return {
          name: item.name,
          type: item.category,
          price: item.price,
          number: item.quantity,
        };
      }));

    console.log('fetched item list ... ', JSON.stringify(itemList, null, 2));

    setCart([...itemList]);
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
          <>
            {title.PrintedBooks && (
              <div>
                <p>Printed Book - {title.name}</p>
                <button> buy </button>
              </div>
            )}

            {title.Audiobooks && (
              <div>
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
          </>
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
