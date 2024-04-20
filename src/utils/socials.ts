import IconInsta from '@/assets/icons/footer-insta.svg';
import IconTelegram from '@/assets/icons/footer-telegram.svg';
import IconVk from '@/assets/icons/footer-vk.svg';
import IconFb from '@/assets/icons/footer-facebook.svg';
import IconTwitter from '@/assets/icons/footer-twitter.svg';

interface ISocialItem {
  readonly icon: SVGImage;
  readonly href: string;
  readonly name: string;
}

const socials: ISocialItem[] = [
  {
    icon: IconTelegram,
    href: 'https://t.me/ichtivo',
    name: 'Телеграм',
  },
  {
    icon: IconVk,
    href: 'https://vk.com/ichtivo',
    name: 'VK',
  },
  {
    icon: IconInsta,
    href: 'https://www.instagram.com/ichtivo/',
    name: 'Instagram',
  },
  {
    icon: IconFb,
    href: 'https://www.facebook.com/ichtivo',
    name: 'Facebook',
  },
  {
    icon: IconTwitter,
    href: 'https://twitter.com/ichtivo',
    name: 'Twitter',
  },
];

export default socials;
