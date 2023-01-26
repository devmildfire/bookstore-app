import IconInsta from '@/assets/icons/footer-insta.svg';
import IconTelegram from '@/assets/icons/footer-telegram.svg';
import IconVk from '@/assets/icons/footer-vk.svg';
import IconFb from '@/assets/icons/footer-facebook.svg';
import IconTwitter from '@/assets/icons/footer-twitter.svg';

interface ISocialItem {
  readonly icon: SVGElement;
  readonly href: string;
}

const socials: ISocialItem[] = [
  {
    icon: IconTelegram,
    href: 'https://t.me/ichtivo',
  },
  {
    icon: IconVk,
    href: 'https://vk.com/ichtivo',
  },
  {
    icon: IconInsta,
    href: 'https://www.instagram.com/ichtivo/',
  },
  {
    icon: IconFb,
    href: 'https://www.facebook.com/ichtivo',
  },
  {
    icon: IconTwitter,
    href: 'https://twitter.com/ichtivo',
  },
];

export default socials;
