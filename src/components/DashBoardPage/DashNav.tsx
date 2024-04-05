import Link from 'next/link';

type DashItem = {
  title: string;
  link: string;
};

const dashlist: DashItem[] = [
  {
    title: 'Authors',
    link: '/dashboard/authors',
  },
  {
    title: 'Titles',
    link: '/dashboard/titles',
  },
  {
    title: 'Editions',
    link: '/dashboard/editions',
  },
  {
    title: 'Awards',
    link: '/dashboard/awards',
  },
  {
    title: 'Articles',
    link: '/dashboard/articles',
  },
  {
    title: 'Promocodes',
    link: '/dashboard/promocodes',
  },
];

export default function DashNav() {
  return (
    <div className='mt-10'>
      <ul className='flex flex-row gap-5 flex-wrap'>
        {dashlist.map((item) => (
          <li key={item.title}>
            <Link
              href={item.link}
              className='hover:underline hover:underline-offset-auto hover:text-red-800'
            >
              {' '}
              {item.title}{' '}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
