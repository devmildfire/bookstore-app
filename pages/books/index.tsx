import React from 'react';
import HomeLayout from '@/layouts/HomeLayout';
import Products from '@/components/Products';
import Filters from '@/components/Filters';
import books from '@/mocks/books';
import Carousel from '@/components/Carousel';
import { Drawer } from '@/components/Drawer';

const data = Array(12)
  .fill(0)
  .map(() => books[1])
  .map((book, idx) => ({
    ...book,
    id: book.id + idx,
  }));

function BooksPage({ forwardedRef }: { forwardedRef: null }) {
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
