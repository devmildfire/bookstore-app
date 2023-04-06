import type { NextPage } from 'next';
import React from 'react';
import HomeLayout from '@/layouts/HomeLayout';
import Products from '@/components/Products';
import Filters from '@/components/Filters';
import books from '@/mocks/books';
import Carousel from '@/components/Carousel';

const data = Array(12)
  .fill(0)
  .map(() => books[1])
  .map((book, idx) => ({
    ...book,
    id: book.id + idx,
  }));

// const getRandomInt = (min: number, max: number): number => {
//   min = Math.ceil(min);
//   max = Math.floor(max);
//   return Math.floor(Math.random() * (max - min) + min);
// };
function BooksPage({ forwardedRef }: { forwardedRef: null }) {
  return (
    <>
      <Carousel forwardedRef={forwardedRef} slides={[0, 1, 2]} />
      <HomeLayout title='Издания'>
        {/* <Books /> */}
        <section className='max-width'>
          <Filters />
          <Products data={data} />
        </section>
      </HomeLayout>
    </>
  );
}

// export const getStaticProps = wrapper.getStaticProps(
//   ({ dispatch }) =>
//     async () => {
//       const requests: Promise<unknown>[] = [
//         dispatch(
//           getBooks.initiate({
//             page: 1,
//             productType: [],
//             publishYear: [],
//           })
//         ),
//         dispatch(getPopularBooks.initiate(undefined)),
//       ];
//       await Promise.all(requests);

//       return {
//         props: {},
//         revalidate: 1,
//       };
//     }
// );

export default BooksPage;
