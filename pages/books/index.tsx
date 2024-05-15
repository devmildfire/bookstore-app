import React, { useContext, useEffect, useRef, useState } from 'react';
import HomeLayout from '@/layouts/HomeLayout';
import Products from '@/components/Products';
import Filters from '@/components/Filters';
import Carousel from '@/components/Carousel';
import { Drawer } from '@/components/Drawer';
import { bookTypes, BookTableTypesEnum } from '@/models/books';
import PageLayout from '@/layouts/PageLayout';
import { MultipleStoresContext } from '@/store/locals/dashboard/TitlesStore';
import { observer } from 'mobx-react-lite';
import { ITitle } from '@/entities/title';
import { FilterModel } from '@/store/models/filters';
import PageLoading from '@/components/PageLoading/PageLoading';

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

// FIXME возвращает тип элемента массива из другого типа, который является массивом
// FIXME возможно стоит его хранить где-то в другом месте
type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type Title = ITitle & {
  prices: number[];
  discount: number[];
  types: BookTableTypesEnum[];
};

export type Titles = Title[];

function haveCommonItems(arr1: any[], arr2: any[]) {
  return arr1.some((item) => arr2.includes(item));
}

export const extendTitles = (titles: ITitle[]): Titles => {
  return titles.map((title) => {
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
};

const BooksPage = observer(() => {
  const multipleStoresFromContext = useContext(MultipleStoresContext);

  let titlesFromStore;

  multipleStoresFromContext.titleStore?.titles &&
    (titlesFromStore = extendTitles(
      multipleStoresFromContext.titleStore?.titles
    ));

  const filtersFromStore = multipleStoresFromContext?.filterStore
    ?.filters as FilterModel;

  const filteredByAuthorsTitles =
    filtersFromStore?.authors.length === 0
      ? titlesFromStore
      : titlesFromStore?.filter((title) => {
          const authorsArray = title.authors.map((author) => author.name);

          return haveCommonItems(authorsArray, filtersFromStore.authors);
        });

  const filteredByTypeTitles =
    filtersFromStore?.types.length === 0
      ? filteredByAuthorsTitles
      : filteredByAuthorsTitles?.filter((title) => {
          return haveCommonItems(title.types, filtersFromStore.types);
        });

  const filteredByYearTitles =
    filtersFromStore?.years.length === 0
      ? filteredByTypeTitles
      : filteredByTypeTitles?.filter((title) => {
          return haveCommonItems(
            [title.firstRelease.slice(0, 4)],
            filtersFromStore.years
          );
        });

  const carouselRef = useRef<HTMLDivElement | null>(null);
  const isSliderOnScreen = useOnScreen(carouselRef);

  return (
    <PageLayout headTitle='Главная' shouldBlacken={isSliderOnScreen}>
      <Carousel
        forwardedRef={carouselRef}
        slides={[0, 1, 2]}
        options={{ dragThreshold: 1, duration: 25 }}
        titles={
          titlesFromStore?.filter((title) => title.isFeatured === true) || []
        }
      />
      <HomeLayout title='Издания'>
        <section className='max-width'>
          <Drawer />
          {filteredByYearTitles && <Products data={filteredByYearTitles} />}

          {/* {titlesFromStore && <Products data={titlesFromStore} />} */}
        </section>
      </HomeLayout>
    </PageLayout>
  );
});

export default React.memo(BooksPage);
