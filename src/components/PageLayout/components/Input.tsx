import * as React from 'react';
// import { useState } from 'react';
import styled from 'styled-components';
import Glass from '../../../assets/icons/search.svg';
// import books from '../../../mocks/books';
import colors from '@/utils/colors';

const StyledGlass = styled(Glass)`
  position: absolute;
  flex: none;
  left: 6%;
  --glass-height: 17px;
  height: var(--glass-height);
  top: calc(50% - var(--glass-height) / 2);
  width: 17px;

  @media (max-width: 1440px) {
    --glass-height: calc(14px + (100vw - 1024px) * 0.007211);
    top: calc(50% - calc(var(--glass-height) / 2));
    width: calc(14px + (100vw - 1024px) * 0.007211);
    height: var(--glass-height);
  }

  @media (max-width: 1024px) {
    --glass-height: calc(7px + (100vw - 320px) * 0.0099);
    top: calc(50% - calc(var(--glass-height) / 2));
    width: calc(7px + (100vw - 320px) * 0.0099);
    height: var(--glass-height);
  }

  @media (max-width: 320px) {
    --glass-height: 7px;
    width: 7px;
    height: var(--glass-height);
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

interface RedInputProps {
  className?: string;
}

function RedInput({ className }: RedInputProps) {
  // const [input, setInput] = useState("");
  // const [suggestions, setSuggestions] = useState([])
  // const [matchedResults, setMatchResults] = useState([])

  return (
    <div className={className}>
      <input type='text' id='input' />
      {/* <StyledSuggestions />  */}
    </div>
  );
}

const StyledInput = styled(RedInput)`
  input {
    position: relative;
    background-color: ${colors.blackBase};

    box-sizing: border-box;
    border-color: red;
    border-radius: 5px;
    border-width: 1px;
    width: 355px;

    height: 30px;

    color: ${colors.grey};
    font-size: 14px;

    padding-left: 17%;

    @media (max-width: 1920px) {
      --inputWidth: calc(256px + (100vw - 1440px) * 0.2062);
      width: var(--inputWidth);
    }

    @media (max-width: 1440px) {
      --inputWidth: calc(186px + (100vw - 1024px) * 0.1682);
      --inputHeight: calc(23px + (100vw - 1024px) * 0.01682);
      width: var(--inputWidth);
      height: var(--inputHeight);
    }

    @media (max-width: 1024px) {
      --inputHeight: calc(14px + (100vw - 320px) * 0.01278);
      --inputWidth: calc(99px + (100vw - 320px) * 0.1235);
      width: var(--inputWidth);
      height: var(--inputHeight);

      font-size: 12px;
    }

    @media (max-width: 320px) {
      width: 99px;
      height: 14px;
      border-radius: 2px;
      font-size: 10px;
    }
  }
`;

const StyledDiv = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
  margin-left: auto;
`;

const Input: React.FC = () => {
  return (
    <StyledDiv>
      <StyledInput />
      <StyledGlass />
    </StyledDiv>
  );
};

export { Input };
