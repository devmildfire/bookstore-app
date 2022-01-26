import React, { useCallback, useState } from 'react';
import Link from 'next/link';
import { ReactSVG } from 'react-svg';
import styled from 'styled-components';

import { BooksData } from '../../types/api';
import Button from '../Common/Button';
import Counter from '../Common/Counter';

const SPACE_AFTER_AUTHOR_NAME_REGEXP = /(?<=[А-Я|Ё]\.)(\s)/g;

 export type BookCardProps = {
  book: BooksData
}

const BookCard = ({ book }: BookCardProps): React.ReactElement => {
  const [like, setLike] = useState(false);
  const [inCardCount, setInCardCount] = useState(0);
  const {
    link,
    title,
    genre,
    price,
    oldPrice,
    author,
    authors,
    description,
    ageRestriction,
    yearOfPublication,
  } = book;

  const parsedAuthors = authors
    ?.join(', ')
    .replace(SPACE_AFTER_AUTHOR_NAME_REGEXP, '&nbsp;');
  const parsedDescription = description
    .map((paragraph) => <p className='descriptionParagraph'>{paragraph}</p>);

  const addToCart = useCallback(() => {
    setInCardCount((prev) => prev + 1);
  }, [inCardCount]);

  const removeFromCart = useCallback(() => {
    if (inCardCount > 0) {
      setInCardCount((prev) => prev - 1);
    }
  }, [inCardCount]);

  return (
    <StyledWrapper>
      <div className='cover'>
        <Link href='books/123' passHref>
          <img
            className='cardImage'
            src={link}
            alt='Book logo'
          />
        </Link>
        <div className='description'>
          <div className='descriptionText'>
            {parsedDescription}
          </div>
          <div className='descriptionInfo'>
            {`${yearOfPublication} | ${genre} | ${ageRestriction}`}
          </div>
        </div>
      </div>
      <div
        className='cardTitle'
      >
        {title}
      </div>
      { author && (
      <div
        className='cardAuthor'
      >
        {author}
      </div>
      )}
      {parsedAuthors && (
      <div
        className='cardAuthor'
        dangerouslySetInnerHTML={{ __html: parsedAuthors }}
      />
      )}
      <div className='cardInfo'>

        <div
          className='cardPrice'
        >
          {oldPrice && (
          <span className='oldPrice'>
            <del>{`${oldPrice}₽`}</del>
          </span>
          )}
          <span>{`${price}₽`}</span>
        </div>
        <ReactSVG
          src='like.svg'
          className={like ? 'liked' : 'like'}
          onClick={() => setLike((prev) => !prev)}
        />
      </div>
      {inCardCount === 0 ? (
        <Button
          text='Добавить в корзину'
          onClick={addToCart}
          className='cardButtonBuy'
        />
      ) : (
        <Counter
          value={inCardCount}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
        />
      )}
    </StyledWrapper>
  );
};

export default BookCard;

const StyledWrapper = styled.div`
  font-size: 16px;
  line-height: 20px;
  color: #F5F5F5;
  width: 320px;
  max-width: 320px;

  .cover {
    margin: 0 auto;
    max-height: 452px;
    box-shadow: 0.5px 0.5px 3px 1px rgb(207 207 236 / 20%);
    overflow: hidden;
    position: relative;
    max-width: 320px;

    .description {
      position: absolute;
      bottom: -293px;
      left: 0;
      width: 100%;
      padding: 20px 15px;
      background: rgba(19, 19, 19, 0.9);
      transition: .5s ease-in-out;
      font-size: 12px;
      line-height: 15px;

      .descriptionParagraph {
        margin-bottom: 20px;
      }

      .descriptionInfo {
        text-align: end;
      }
    }

    &:hover .description {
      bottom: 0;
    }
  }
  

  .cardImage {
    height: 450px;
    width: 320px;
  }

  .cardTitle {
    font-weight: bold;
    font-size: 20px;
    line-height: 24px;
    margin-top: 25px;
  }

  .cardAuthor {
    margin: 10px 0 23px 0;
    height: 40px;
  }

  .cardInfo {
    display: flex;
    justify-content: space-between;
  }

  .cardPrice {
    font-size: 20px;
    font-weight: bold;
    line-height: 24px;
  }

  .oldPrice {
    margin-right: 17px;
    color: #930000;
  }

  .like {
    transition: all .2s ease-out;
    &:hover {
      & > div {
        & > svg {
          fill: #930000;
        }
      }
    }
  }

  .liked {
    transition: all .2s ease-out;
    & > div {
      & > svg {
        fill: #930000;
      }
    }
  }

  .cardButtonBuy {
    width: 320px;
    height: 70px;
    color: #FFFFFF;
    margin-top: 40px;

    background: transparent;
    border: 1px solid #FFFFFF;
    cursor: pointer;
    transition: all .2s ease-out;

    &:hover {
      color: #930000;
      border: .5px solid rgb(220 220 220 / 50%);
    }
  }
`;
