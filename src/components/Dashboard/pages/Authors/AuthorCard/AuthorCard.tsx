import * as React from 'react';
import Image from 'next/image';
import { PlusCircledIcon } from '@radix-ui/react-icons';

import { cn } from '@/lib/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import Link from 'next/link';
import { AuthorPreview } from '@/entities/author';

interface AuthorCard extends React.HTMLAttributes<HTMLDivElement> {
  author: AuthorPreview;
  navigateTo: string;
  aspectRatio?: 'portrait' | 'square';
  width?: number;
  height?: number;
}

const AuthorCard: React.FC<AuthorCard> = ({
  author,
  aspectRatio = 'portrait',
  width,
  height,
  navigateTo,
  className,
  ...props
}) => {
  return (
    <div className={cn('space-y-3', className)} {...props}>
      <ContextMenu>
        <ContextMenuTrigger>
          <div className='overflow-hidden rounded-md'>
            <Link href={navigateTo}>
              <Image
                src={author.photo}
                alt={author.name}
                width={width}
                height={height}
                className={cn(
                  'h-full w-full object-cover transition-all hover:scale-105',
                  aspectRatio === 'portrait' ? 'aspect-[3/4]' : 'aspect-square'
                )}
              />
            </Link>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className='w-40'>
          <ContextMenuItem>Редактировать</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem>Удалить</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <div className='space-y-1 text-sm'>
        <h3 className='font-medium break-words'>{author.name}</h3>
      </div>
    </div>
  );
};

export default React.memo(AuthorCard);
