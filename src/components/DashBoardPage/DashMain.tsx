import { PropsWithChildren } from 'react';

export default function DashMain(props: PropsWithChildren) {
  return <main className='max-width'>{props.children}</main>;
}
