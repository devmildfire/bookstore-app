import * as React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Package2, LogOut } from 'lucide-react';
import { SidebarItem } from './SidebarItem';
import { sidebarConfig } from '../config';

const Sidebar = () => {
  return (
    <aside className='fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex'>
      <TooltipProvider>
        <nav className='flex flex-col items-center gap-4 px-2 sm:py-5'>
          <SidebarItem
            href='#'
            text='Acme Inc'
            Icon={Package2}
            iconClassName='h-4 w-4 transition-all group-hover:scale-110'
            className='group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base'
          />
          {sidebarConfig.map((item, index) => (
            <SidebarItem
              key={index}
              withTooltip
              href={item.href}
              text={item.text}
              tooltip={item.tooltipText}
              Icon={item.Icon}
            />
          ))}
        </nav>
        <nav className='mt-auto flex flex-col items-center gap-4 px-2 sm:py-5'>
          <SidebarItem
            href='#'
            text='Выйти'
            tooltip='Выйти'
            Icon={LogOut}
            iconClassName='h-5 w-5 transition-all group-hover:scale-110'
            withTooltip
          />
        </nav>
      </TooltipProvider>
    </aside>
  );
};

export default React.memo(Sidebar);
