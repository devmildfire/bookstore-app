import * as React from 'react';
// import { useState } from 'react';
import styled from 'styled-components';
import Glass from '../../../assets/icons/search.svg';
// import books from '../../../mocks/books';
import colors from '@/utils/colors';
import breakPoints from '@/utils/breakPoints';

const StyledGlass = styled(Glass)`
  position: absolute;
  flex: none;
  left: 14px;
  height: 17px;
  top: calc(50% - var(--glass-height) / 2);
  width: 17px;

  @media (max-width: 1440px) {
    top: calc(50% - calc(var(--glass-height) / 2));
    width: 17px;
    height: 17px;
  }

  @media (max-width: 1024px) {
    top: calc(50% - calc(var(--glass-height) / 2));
    width: 17px;
    height: 17px;
  }

  @media ${breakPoints.sm} {
    width: 14px;
    height: 14px;
    left: 6px;
    top: calc(50% - calc(var(--glass-height) / 2));
  } ;
`;

// function Suggestions({ className, }) {
//   return (
//     <div className={className}>
//       {
//         books.map(
//           (book) => {
//             return (
//               <div>
//                 {book.title}
//               </div>
//             );
//           }
//         )
//       }
//     </div>
//   );
// }

// const StyledSuggestions = styled(Suggestions)`
//   position: absolute;
//   top: 65%;
//   display: flex;
//   flex-direction: column;

//   background-color: black;

//   box-sizing: border-box;
//   // border-color: red;
//   border: 1px solid red;
//   border-radius: 5px;
//   // border-width: 1px;

//   padding: 20px;
// `;

const StyledInput = styled.input`
  background-color: ${colors.blackBase};
  border: thin solid var(--main-red-100);
  border-radius: 5px;
  max-width: 355px;
  width: 100%;
  height: 30px;
  color: ${colors.grey};
  font-size: 16px;
  padding-left: 42px;

  @media ${breakPoints.sm} {
    width: 35vw;
    height: 24px;
    padding-left: 22px;
    font-size: 14px;
  }
`;

const StyledDiv = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
`;

const SearchInput: React.FC = () => {
  return (
    <StyledDiv>
      <StyledInput />
      <StyledGlass />
    </StyledDiv>
  );
};

export { SearchInput };
