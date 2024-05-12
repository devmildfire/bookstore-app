import React, { useEffect, useRef, useState } from 'react';
import { InferGetStaticPropsType } from 'next';
import HomeLayout from '@/layouts/HomeLayout';
import Products from '@/components/Products';
import Filters from '@/components/Filters';
import Carousel from '@/components/Carousel';
import { Drawer } from '@/components/Drawer';
import { bookTypes, BookTableTypesEnum } from '@/models/books';
import { API } from 'api/books/';
import styled from 'styled-components';
import PageLayout from '@/layouts/PageLayout';
import { normalizeTitle } from '@/entities/title/normalize';

function useOnScreen(ref: React.RefObject<Element>, rootMargin = '0px') {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const element = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIntersecting(entry.isIntersecting);
      },
      {
        rootMargin,
      }
    );
    observer.observe(element);
    return () => {
      observer.unobserve(element);
    };
  }, [isIntersecting, ref, ref.current, rootMargin]);

  return isIntersecting;
}

export const getServerSideProps = async () => {
  const { data, error } = await API.getTitles();

  // FIXME: Нужно обрабатывать ошибки, чтобы пользователь был в курсе, что что-то пошло не так
  if (error) {
    console.error(error);
  }

  if (data) {
    const normalizedTitles = data.map((title) => normalizeTitle(title));

    const titles = normalizedTitles.map((title) => {
      return {
        ...title,
        prices: bookTypes
          .map((type) => (title[type] ? title[type]?.price : null))
          .filter((price) => price !== null) as number[],
        discount: bookTypes
          .map((type) => (title[type] ? title[type]?.discount : null))
          .filter((discount) => discount !== null) as number[],
        types: bookTypes
          .map((type) => (title[type] ? type : null))
          .filter((type) => type !== null) as BookTableTypesEnum[],
      };
    });

    console.log('titles log ... ', titles);

    return {
      props: {
        titles,
      },
    };
  }

  // return {
  //   props: {
  //     titles: null,
  //   },
  // };

  return;
};

// FIXME возвращает тип элемента массива из другого типа, который является массивом
// FIXME возможно стоит его хранить где-то в другом месте
type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type TitlesFromProps = InferGetStaticPropsType<
  typeof getServerSideProps
>;

export type Titles = TitlesFromProps['titles'];
export type Title = ArrayElement<Titles>;

type BooksPageProps = {
  forwardedRef: null;
} & InferGetStaticPropsType<typeof getServerSideProps>;

function BooksPage({ forwardedRef, titles }: BooksPageProps) {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const isSliderOnScreen = useOnScreen(carouselRef);

  return (
    <PageLayout headTitle='Главная' shouldBlacken={isSliderOnScreen}>
      <Carousel
        forwardedRef={carouselRef}
        slides={[0, 1, 2]}
        options={{ dragThreshold: 1, duration: 25 }}
        titles={titles?.filter((title) => title.isFeatured === true) || []}
      />
      <HomeLayout title='Издания'>
        <section className='max-width'>
          <Drawer />
          {titles && <Products data={titles} />}
        </section>
      </HomeLayout>
    </PageLayout>
  );
}

export default React.memo(BooksPage);
