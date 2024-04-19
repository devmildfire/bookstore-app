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

const Oferta = styled.div`
  white-space: pre-wrap;
  text-align: left;
`;

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
    const titles = data.map((title) => ({
      ...title,
      price: bookTypes
        .map((type) => (title[type] ? title[type].price : null))
        .filter((price) => price !== null) as number[],
      discount: bookTypes
        .map((type) => (title[type] ? title[type].discount : null))
        .filter((discount) => discount !== null) as number[],
      types: bookTypes
        .map((type) => (title[type] ? type : null))
        .filter((type) => type !== null) as BookTableTypesEnum[],
    }));

    return {
      props: {
        titles,
      },
    };
  }

  return null;
};

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
      />
      <HomeLayout title='Издания'>
        <section className='max-width'>
          <Drawer />
          <Products data={titles} />
          <Oferta>
            {`ИП Дедович Сергей Сергеевич
ОГРН (ОГРНИП) 315615400001147
ИНН 615423213890
ОКПО 0194667189
ОКТМО 40377000000
ОКВЭД основной 62.09
ОКВЭД дополнительный: 63.11.162.0162.0282.9994.9960.1060.2094.12
Электронная почта hello@russiandino.ru
Телефон 8 (812) 915 83 67
Юридический адрес: 196158, г. Санкт-Петербург, ул. Среднерогатская, д. 9, лит А, кв. 881.
Почтовый адрес: 191180, Санкт-Петербург, Дедович Сергей Сергеевич, до востребования`}
          </Oferta>
        </section>
      </HomeLayout>
    </PageLayout>
  );
}

export default React.memo(BooksPage);
