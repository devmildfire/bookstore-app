import React from 'react';
// import Link from 'next/link';
import Link from '@/components/Common/Link';
import setUUIDField from '@/utils/setUUIDField';
// import styled from 'styled-components';
import { NavDiv, LinkDiv, NavHeader } from './styles';
import { sidebarItem } from '@/types/sidebarItem';
import Text from '@/components/Common/Text';

/**
 *
 * @param header заголовок. Отображается над списком пунктов
 * @param navItems массив из объектов типа sidebarItem, содержащих текст для
 * ссылки и саму ссылку
 * @returns компонент бокового меню навигации с заголовком и списком пунктов
 *
 */

interface sidebarNavProps {
  header: string;
  navItems: sidebarItem[];
}

const SidebarNav = (props: sidebarNavProps): React.ReactElement => {
  const { header, navItems } = props;

  //  добавляет "уникальный" ключ каждому обхекту из массива navItems
  const sidebarItemsWID = setUUIDField(navItems);

  return (
    <NavDiv>
      <NavHeader href='/for-authors/main'>
        <Text variant='sn_Title'>{header}</Text>
      </NavHeader>
      {sidebarItemsWID.map((item) => {
        return (
          <LinkDiv key={item.key}>
            <Link href={item.link}>
              {/* {item.title} */}
              <Text variant='sn_Item'>{item.title}</Text>
            </Link>
          </LinkDiv>
        );
      })}
    </NavDiv>
  );
};

export default SidebarNav;
