import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Session } from '@supabase/supabase-js';
import { supabase } from 'api/supabase-client';
import DashMain from '@/components/DashBoardPage/DashMain';
import DashNav from '@/components/DashBoardPage/DashNav';
import { LogOut } from '@/components/LoginPage/Logout';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TitleType } from '../titles';
import { Database } from 'api/books/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export type PrintedBookType =
  Database['public']['Tables']['PrintedBooks']['Row'];
export type AudiobookType = Database['public']['Tables']['Audiobooks']['Row'];
export type EbookType = Database['public']['Tables']['Ebooks']['Row'];
export type CardBookType = Database['public']['Tables']['CardBooks']['Row'];

export type EditionsType = {
  printedBook?: PrintedBookType;
  audioBook?: AudiobookType;
  eBook?: EbookType;
  cardBook?: CardBookType;
};

const TitleEditions = ({ titleID }: { titleID: number }) => {
  const [editions, setEditions] = useState<EditionsType>();

  async function getEditions() {
    const { data, error } = await supabase
      .from('Titles')
      .select(
        `
        *,
        AuthorsList: Titles_Authors ( Author : Authors(*)),
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
        TitlesAwards ( *,  awards: Awards(*) )
      `
      )
      .eq('id', titleID)
      .single();

    if (data) {
      console.log('got some data');

      console.log('Printed Books', data.PrintedBooks);
      console.log('Audio Books', data.Audiobooks);
      console.log('eBooks', data.Ebooks);
      console.log('Card Books', data.CardBooks);

      const audioBook: AudiobookType | null = data.Audiobooks;
      const printedBook: PrintedBookType | null = data.PrintedBooks;
      const eBook: EbookType | null = data.Ebooks;
      const cardBook: CardBookType | null = data.CardBooks;

      setEditions({
        printedBook: printedBook || undefined,
        audioBook: audioBook || undefined,
        eBook: eBook || undefined,
        cardBook: cardBook || undefined,
      });
    }
  }

  useEffect(() => {
    getEditions();
  }, [titleID]);

  return (
    <div>
      <Accordion type='single' collapsible>
        {editions?.printedBook && (
          <AccordionItem
            value={`item-${editions?.printedBook.id}`}
            key={editions?.printedBook.ISBN}
            className='w-full'
          >
            <AccordionTrigger> Printed Book </AccordionTrigger>
            <AccordionContent>
              <p> ISBN: {editions?.printedBook.ISBN}</p>
              <p> Количество страниц: {editions?.printedBook.pages}</p>
              <p> extra: {editions?.printedBook.extra}</p>
              <p> форма: {editions?.printedBook.lit_form}</p>
            </AccordionContent>
          </AccordionItem>
        )}

        {editions?.audioBook && (
          <AccordionItem
            value={`item-${editions?.audioBook.id}`}
            key={editions?.audioBook.id}
            className='w-full'
          >
            <AccordionTrigger> Audio Book </AccordionTrigger>
            <AccordionContent>
              <p> длительность: {editions?.audioBook.duration}</p>
              <p> extra: {editions?.audioBook.extra}</p>
              <p> скидка: {editions?.audioBook.discount}</p>
            </AccordionContent>
          </AccordionItem>
        )}

        {editions?.eBook && (
          <AccordionItem
            value={`item-${editions?.eBook.id}`}
            key={editions?.eBook.id}
            className='w-full'
          >
            <AccordionTrigger> eBook </AccordionTrigger>
            <AccordionContent>
              <p> ISBN: {editions?.eBook.ISBN}</p>
              <p> extra: {editions?.eBook.extra}</p>
              <p> скидка: {editions?.eBook.discount}</p>
            </AccordionContent>
          </AccordionItem>
        )}

        {editions?.cardBook && (
          <AccordionItem
            value={`item-${editions?.cardBook.id}`}
            key={editions?.cardBook.id}
            className='w-full'
          >
            <AccordionTrigger> eBook </AccordionTrigger>
            <AccordionContent>
              <p> extra: {editions?.cardBook.extra}</p>
              <p> скидка: {editions?.cardBook.discount}</p>
            </AccordionContent>
          </AccordionItem>
        )}

        {!editions?.printedBook && (
          <AccordionItem
            value={`item-addPrintedBook`}
            key={`item-addPrintedBook`}
            className='w-full'
          >
            <AccordionTrigger className='w-full text-red-800'>
              Add Printed Book
            </AccordionTrigger>
            <AccordionContent>add some book</AccordionContent>
          </AccordionItem>
        )}

        {!editions?.audioBook && (
          <AccordionItem
            value={`item-addAudioBook`}
            key={`item-addAudioBook`}
            className='w-full'
          >
            <AccordionTrigger className='w-full text-red-800'>
              Add Audiobook
            </AccordionTrigger>
            <AccordionContent>add some Audiobook</AccordionContent>
          </AccordionItem>
        )}

        {!editions?.eBook && (
          <AccordionItem
            value={`item-addEBook`}
            key={`item-addEBook`}
            className='w-full'
          >
            <AccordionTrigger className='w-full text-red-800'>
              Add eBook{' '}
            </AccordionTrigger>
            <AccordionContent>add some eBook</AccordionContent>
          </AccordionItem>
        )}

        {!editions?.cardBook && (
          <AccordionItem
            value={`item-addCardBook`}
            key={`item-addCardBook`}
            className='w-full'
          >
            <AccordionTrigger className='w-full text-red-800'>
              Add Card Book
            </AccordionTrigger>
            <AccordionContent>add some Card Book</AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
};

const TitleSelect = () => {
  const [titles, setTitles] = useState<TitleType[]>();
  const selectedTitle = useRef<number>();

  async function getTitles() {
    const { data, error } = await supabase.from('Titles').select('*');

    data && console.log('Titles data ... ', data);
    error && alert(error);

    data && setTitles(data);
  }

  useEffect(() => {
    getTitles();
  }, []);

  if (!titles) {
    return <div>zero titles found in database</div>;
  }

  return (
    <div className='w-full'>
      <h3> Editions </h3>
      <div>
        <Select
          onValueChange={(value) => {
            selectedTitle.current = parseInt(value);
            console.log('set new ref ... ', selectedTitle.current);
          }}
        >
          {/* <SelectTrigger className='w-[280px]'> */}
          <SelectTrigger className='w-full'>
            <SelectValue placeholder='Select a Title' />
          </SelectTrigger>
          <SelectContent>
            {titles.map((title) => (
              <SelectItem value={title.id.toString()} key={title.id}>
                {' '}
                {title.name}{' '}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedTitle.current && (
        <TitleEditions titleID={selectedTitle.current} />
      )}
    </div>
  );
};

function Editions(): React.ReactElement {
  const [session, setSession] = useState<Session>();
  const router = useRouter();

  const check_session = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error(error);
      } else {
        data.session && setSession(data.session);
        !data.session?.user.user_metadata.isAdmin && router.push('/login');
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    check_session();
  });

  return (
    <DashMain>
      <div className='text-center dark flex flex-col justify-center items-center align-middle w-full self-center space-y-16'>
        <DashNav />
        <TitleSelect />
        {session && <LogOut session={session} />}
      </div>
    </DashMain>
  );
}

export default Editions;
