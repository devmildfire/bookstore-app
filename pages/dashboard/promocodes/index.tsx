import DashMain from '@/components/DashBoardPage/DashMain';
import DashNav from '@/components/DashBoardPage/DashNav';
import { LogOut } from '@/components/LoginPage/Logout';
import { Session } from '@supabase/supabase-js';
import { supabase } from 'api/supabase-client';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Database } from 'api/books/types';
import Text from '@/components/Common/Text';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { PromoEditForm, PromoForm } from '@/components/DashBoardPage/PromoForm';
import { Title } from '@/models/books';
import PageLayout from '@/layouts/PageLayout';
import { getEnumArray } from '@/utils/getEnumArray';
// import { PromoEditForm, PromoForm } from '@/components/DashBoardPage/PromoForm';

// export type AwardsType = Database['public']['Tables']['Awards']['Row'];
export type PromosType = Database['public']['Tables']['Promocodes']['Row'];

type promoListProps = {
  categories: string[];
  types: string[];
  prods: ProductArrayType;
};

const PromoList = ({ categories, types, prods }: promoListProps) => {
  const [promos, setPromos] = useState<PromosType[]>();

  async function getPromos() {
    const { data, error } = await supabase.from('Promocodes').select('*');

    data && console.log('promos data ... ', data);
    error && alert(error);

    data && setPromos(data);
  }

  useEffect(() => {
    getPromos();
  }, []);

  if (!promos) {
    return <div>zero promocodes found in database</div>;
  }

  return (
    <div className='w-full'>
      <Text variant='h3c'> Промокоды </Text>

      <Accordion type='single' collapsible className='w-full'>
        {promos.map((promo) => (
          <AccordionItem
            value={`item-${promo.id}`}
            key={promo.id}
            className='w-full'
          >
            <AccordionTrigger> {promo.code} </AccordionTrigger>
            <AccordionContent>
              <PromoEditForm
                categories={categories}
                types={types}
                prods={prods}
                promo={promo}
              />
            </AccordionContent>
          </AccordionItem>
        ))}

        <AccordionItem
          value='item-createnew'
          key='create-new'
          className='w-full'
        >
          <AccordionTrigger>
            <div className='flex flex-grow items-center'>
              <div className='flex-grow items-center text-red-800 hover:underline'>
                Добавить новый промокод
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <PromoForm categories={categories} types={types} prods={prods} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export type ProductArrayType = {
  name: string;
  types: (string | null)[];
}[];

export interface TitlesDB {
  readonly name: string;
  PrintedBooks: { id: number };
  Audiobooks: { id: number };
  Ebooks: { id: number };
  CardBooks: { id: number };
}

function Promos(): React.ReactElement {
  const [session, setSession] = useState<Session>();
  const [categoryArray, setCategoryArray] = useState<string[]>();
  const [typeArray, setTypeArray] = useState<string[]>();
  const [prods, setProds] = useState<ProductArrayType>();

  const router = useRouter();

  const check_session = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error(error);
      } else {
        data.session && setSession(data.session);
        // !data.session?.user.user_metadata.isAdmin && router.push('/login');
        !data.session?.user.app_metadata.claims_admin && router.push('/login');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getTitlesFromDB = async () => {
    console.log('getting titles ... ');
    const dbTitles = await supabase
      .from('Titles')
      .select(
        `
    name,
    CardBooks ( id ),
    Audiobooks ( id ),
    Ebooks ( id ),
    PrintedBooks ( id )
    `
      )
      .returns<TitlesDB[]>();

    // .returns<Title[]>();

    dbTitles.error &&
      console.log('titles error return', dbTitles.error.message);

    if (dbTitles.data) {
      console.log('dbTitles from DB are ... ', dbTitles.data);

      const products: ProductArrayType = dbTitles.data.map((title) => {
        return {
          name: title.name && title.name,
          types: [
            title.PrintedBooks ? 'PrintBook' : null,
            title.Audiobooks ? 'AudioBook' : null,
            title.Ebooks ? 'EBook' : null,
            title.CardBooks ? 'Book2.0' : null,
          ].filter((val) => val !== null),
        };
      });
      console.log('products from DB are ... ', products);
      setProds(products);
    }
  };

  const getTypesFromDB = async () => {
    const categoryEnumName = 'category';
    const typeEnumName = 'promotype';

    // const categoryArray = await check_enums(categoryEnumName);
    // const typeArray = await check_enums(typeEnumName);

    const categoryArray = await getEnumArray(categoryEnumName);
    const typeArray = await getEnumArray(typeEnumName);

    categoryArray && setCategoryArray(categoryArray);
    typeArray && setTypeArray(typeArray);
  };

  // const check_enums = async (enumName: string): Promise<string[] | null> => {
  //   const { data } = await supabase.rpc('get_types', { enum_type: enumName });
  //   if (data) {
  //     console.log(`got back ${enumName} enum from DB... `, data);
  //     return data as string[];
  //   } else {
  //     console.log('no data returned');
  //     return null;
  //   }
  // };

  useEffect(() => {
    check_session();
    getTypesFromDB();
    getTitlesFromDB();
  }, []);

  return (
    <PageLayout>
      <DashMain>
        <div className='text-center dark flex flex-col justify-center items-center align-middle w-full self-center space-y-16'>
          <DashNav />
          <PromoList
            categories={categoryArray || []}
            types={typeArray || []}
            prods={prods || []}
          />
          {session && <LogOut session={session} />}
        </div>
      </DashMain>
    </PageLayout>
  );
}

export default Promos;
