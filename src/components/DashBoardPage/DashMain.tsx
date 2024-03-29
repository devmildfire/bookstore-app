import { PropsWithChildren } from 'react';

export default function DashMain(props: PropsWithChildren) {
  return (
    <main className='px-[5vw] sm:px-[5vw] lg:px-[10vw]'>{props.children}</main>
  );
}
