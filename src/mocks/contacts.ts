import IconMail from '@/assets/icons/footer-mail.svg';
import IconPhone from '@/assets/icons/footer-phone.svg';

interface IContactItem {
  readonly icon: SVGElement;
  readonly content: string;
  readonly hightLightContent: string;
  readonly href: string;
}

const contacts: IContactItem[] = [
  {
    icon: IconPhone,
    content: 'Тел.',
    hightLightContent: '(812) 915-83-67',
    href: 'tel:+78129158367',
  },
  {
    icon: IconMail,
    content: 'E-mail',
    hightLightContent: 'info@chtivo.spb.ru',
    href: 'mailto:info@chtivo.spb.ru',
  }
];

export default contacts;
