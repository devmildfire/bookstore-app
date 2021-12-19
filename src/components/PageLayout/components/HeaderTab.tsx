import React, { useState, useRef, useMemo } from 'react';
import { usePopper } from 'react-popper';
import Link from 'next/link';
import styled from 'styled-components';

export type MenuItem = {
  title: string,
  link: string,
}

export type IHeaderTab = {
  title: string,
  link: string,
  submenu?: MenuItem[],
}

const StyledLink = styled.a`
  :hover {
    color: red;
    cursor: pointer;
  }
`;

const PopperContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: black;
  padding: 20px;
`;

const HeaderTab = ({
  title,
  link,
  submenu,
}: IHeaderTab): React.ReactElement => {
  const [showPopper, setShowPopper] = useState(false);

  const buttonRef = useRef(null);
  const popperRef = useRef(null);

  const [arrowRef, setArrowRef] = useState<HTMLDivElement | null>(null);

  const offset = useMemo(
    () => ({
      name: 'offset',
      options: {
        offset: ({ reference, popper }: any) => [(popper.width - reference.width) / 2 - 20, 0],
      },
    }),
    [],
  );

  const { styles, attributes } = usePopper(
    buttonRef.current,
    popperRef.current,
    {
      modifiers: [
        {
          name: 'arrow',
          options: {
            element: arrowRef,
          },
        },
        offset,
      ],
    },
  );
  return (
    <>
      {!submenu
        ? (
          <Link href={link} passHref>
            <StyledLink href='fakeHref'>{title}</StyledLink>
          </Link>
        )
        : (
          <>
            <StyledLink
              ref={buttonRef}
              onMouseEnter={() => setShowPopper(true)}
              onMouseLeave={() => setShowPopper(false)}
            >
              {title}
            </StyledLink>
            {showPopper ? (
              <PopperContainer
                ref={popperRef}
                onMouseEnter={() => setShowPopper(true)}
                onMouseLeave={() => setShowPopper(false)}
                style={styles.popper}
                {...attributes.popper}
              >
                <div ref={setArrowRef} style={styles.arrow} id='arrow' />
                {submenu?.map((tab) => (
                  <Link href={tab.link} passHref key={tab.title}>
                    <StyledLink href='fakeHref'>{tab.title}</StyledLink>
                  </Link>
                ))}
              </PopperContainer>
            ) : null}
          </>
        )}
    </>
  );
};

export default HeaderTab;
