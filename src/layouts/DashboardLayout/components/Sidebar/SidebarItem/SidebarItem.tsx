import * as React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
  href: string;
  text: string;
  Icon: LucideIcon;
  className?: string;
  iconClassName?: string;
  withTooltip?: boolean;
  tooltip?: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  withTooltip,
  href,
  text,
  tooltip,
  Icon,
  className,
  iconClassName,
}) => {
  const link = (
    <Link
      href={href}
      className={
        className
          ? className
          : 'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8'
      }
    >
      <Icon className={iconClassName ? iconClassName : 'h-5 w-5'} />
      <span className='sr-only'>{text}</span>
    </Link>
  );

  if (withTooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side='right'>{tooltip}</TooltipContent>
      </Tooltip>
    );
  }

  return link;
};

export default React.memo(SidebarItem);
