import React from 'react';
import styled from 'styled-components';
import { Multiselect, Dropdown } from '../Common/Multiselect';

const FiltersContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 2rem 0;
`;

// const FiltersGroup = styled.div`
//   display: flex;
// `;

// const SortGroup = styled.div``;

export default function Filters() {
  return (
    <FiltersContainer>
      <Dropdown icon='Фильтры'>
        <Multiselect title='Тип издания' />
        <Multiselect title='Тип издания' />
        <Multiselect withInput title='Тип издания' />
      </Dropdown>
      {/* <FiltersGroup>
        <Multiselect title='Тип издания' />
        <Multiselect title='Год издания' />
        <Multiselect title='Автор' withInput />
      </FiltersGroup>
      <div>
        <Multiselect title='Сортировать' />
      </div> */}
    </FiltersContainer>
  );
}
