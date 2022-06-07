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
    icon: IconInsta,
    href: 'http://instagram.com',
  },
  {
    icon: IconTelegram,
    href: 'http://t.me.com',
  },
  {
    icon: IconVk,
    href: 'http://vk.com',
  },
  {
    icon: IconFb,
    href: 'http://facebook.com',
  },
  {
    icon: IconTwitter,
    href: 'http://twitter.com',
  },
];

export default socials;
