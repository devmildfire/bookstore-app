import React from 'react';
import HomeLayout from '@/layouts/HomeLayout';
import Products from '@/components/Products';
import Filters from '@/components/Filters';
import books from '@/mocks/books';
import Carousel from '@/components/Carousel';
import { Drawer } from '@/components/Drawer';
import { InferGetStaticPropsType } from 'next/types';

type BooksPageProps = {
  forwardedRef: null;
} /* & InferGetStaticPropsType<typeof getStaticProps> */;

const data = Array(12)
  .fill(0)
  .map((_, idx) => books[idx % 3])
  .map((book, idx) => ({
    ...book,
    id: idx + 1,
  }));

function BooksPage({ forwardedRef /* data */ }: BooksPageProps) {
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
          <Products data={data} />
        </section>
      </HomeLayout>
    </>
  );
}

// export const getStaticProps = async () => {
//   const response = await fetch('http://localhost:3000/api/books');
//   const data = await response.json();
//   return { props: { data } };
// };

export default BooksPage;
