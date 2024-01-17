import React from 'react';
import { InferGetStaticPropsType } from 'next';
import HomeLayout from '@/layouts/HomeLayout';
import Products from '@/components/Products';
import Filters from '@/components/Filters';
import Carousel from '@/components/Carousel';
import { Drawer } from '@/components/Drawer';
import { Book } from '@/models/books';
import { supabase } from 'api';

type BooksPageProps = {
  forwardedRef: null;
} & InferGetStaticPropsType<typeof getServerSideProps>;

export const getServerSideProps = async () => {
  const { data: books, error } = await supabase.from('Titles').select('*');
  return { props: { books: books as Book[] } };
};

function BooksPage({ forwardedRef, books }: BooksPageProps) {
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
          <Products data={books} />
        </section>
      </HomeLayout>
    </>
  );
}

export default React.memo(BooksPage);
