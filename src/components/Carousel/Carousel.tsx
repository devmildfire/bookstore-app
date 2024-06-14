import React, {
  useState,
  useEffect,
  useCallback,
  ReactElement,
  PropsWithChildren,
  RefObject,
} from 'react';
// import useEmblaCarousel, { EmblaOptionsType } from 'embla-carousel-react';

import useEmblaCarousel from 'embla-carousel-react';
import { EmblaOptionsType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';
import styled, { StyledComponent } from 'styled-components';
import { DotButton } from './DotButton';
import Link from 'next/link';
import breakPoints from '@/utils/breakPoints';
import { Trigger } from '../Common/Trigger';
import { useRouter } from 'next/router';
import { Titles } from 'pages/books';
import Image, { ImageProps } from 'next/image';

type PropType = {
  titles: Titles;
  options?: EmblaOptionsType;
  forwardedRef: RefObject<HTMLDivElement>;
};

const StyledInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 720px;
  width: 100%;

  @media screen and (max-width: 512px) {
    display: none;
  }
`;

const fontFamilies: Record<string, string> = {
  sans: "'Montserrat', sans-serif",
  serif: "'Cheque', serif",
};

const StyledHeading = styled.h1`
  font-family: ${fontFamilies.serif};
  margin: 0;
`;

const StyledText = styled.p`
  font-family: ${fontFamilies.sans};
  margin: 0;
`;

const StyledCaption = styled.span`
  font-family: ${fontFamilies.sans};
  margin: 0;
`;

type HeadingTags = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
type TextTag = 'p';
type CaptionTag = 'span';

type TextProps = {
  variant: 'heading' | 'text' | 'caption';
  tag?: HeadingTags | TextTag | CaptionTag;
};

const lookupTextComponent: Record<
  string,
  StyledComponent<'h1' | 'p' | 'span', never>
> = {
  heading: StyledHeading,
  text: StyledText,
  caption: StyledCaption,
};
// TODO вынести в компонент Typography
function Text(props: PropsWithChildren<TextProps>) {
  const { variant, tag, children, ...rest } = props;
  const Component = lookupTextComponent[variant];

  return (
    <Component as={tag} {...rest}>
      {children}
    </Component>
  );
}

const StyledTitle = styled(Text)`
  text-align: left;
  font-size: 96px;
  font-weight: 900;
  line-height: 100%;

  @media screen and (max-width: 1280px) {
    font-size: 68px;
  }

  @media screen and (max-width: 1024px) {
    font-size: 48px;
  }
  @media screen and (max-width: 768px) {
    font-size: 36px;
  }
  @media screen and (max-width: 512px) {
    font-size: 24px;
    text-transform: uppercase;
  }
`;

// const StyledAuthor = styled(Text)`
//   text-align: left;
//   font-size: 48px;
//   @media screen and (max-width: 1024px) {
//     font-size: 36px;
//   }
//   @media screen and (max-width: 768px) {
//     font-size: 24px;
//   }

//   @media screen and (max-width: 512px) {
//     font-size: 12px;
//     text-transform: uppercase;
//   }
// `;

const StyledAuthor = styled.p`
  text-align: left;
  font-size: 48px;
  // margin-top: -40px;

  @media screen and (max-width: 1024px) {
    font-size: 36px;
  }
  @media screen and (max-width: 768px) {
    font-size: 24px;
  }

  @media screen and (max-width: 512px) {
    font-size: 12px;
    text-transform: uppercase;
  }
`;

const StyledThesis = styled(Text)`
  text-align: left;
  font-style: italic;
  text-transform: uppercase;
  opacity: 0.6;
  @media screen and (max-width: 768px) {
    font-size: 14px;
  }

  @media screen and (max-width: 512px) {
    font-size: 10px;
    text-transform: uppercase;
  }
`;

const StyledButton = styled(Trigger)`
  min-height: 44px;
  width: 100%;
  margin-top: 24px;
  max-width: 256px;
  padding: 20px 80px;
  @media screen and (max-width: 512px) {
    max-width: 256px;
    margin-top: 10px;
  }
`;

const Wrapper = styled.section`
  --slide-spacing: 16px;
  --slide-size: 100%;
  --slide-height: auto;
  padding: 55px 0vw;
  background-color: #050505;

  @media ${breakPoints.md} {
    padding: 25px 0vw 55px;
  }
`;

const Viewport = styled.div`
  /* max-width: 1440px; */
  // overflow: hidden;
  overflow-y: visible;
  overflow-x: clip;
  margin: 0 auto;
`;

const Container = styled.div`
  overflow: visible;

  display: flex;
  flex-direction: row;
  height: auto;
  /* gap: var(--slide-spacing); */
`;

const SlideContainer = styled.div`
  // padding-top: 25px;
  overflow: visible;

  max-width: 1440px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  width: 100%;
  @media ${breakPoints.sm} {
    justify-content: center;
  }
`;

const Slide = styled.div`
  overflow: visible;

  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 10vw;
  flex: 0 0 var(--slide-size);
  position: relative;
  @media ${breakPoints.lg} {
    padding: 0 5vw;
  }
`;

const Texture = styled.div`
  display: block;
  object-fit: cover;
  position: absolute;
  /* mix-blend-mode: normal; */

  /* NOTE(@sergromm): можно использовать градиент от 3d книг для слайдера */
  /* background-color: transparent;
  background-image: linear-gradient(
      90deg,
      hsla(0, 0%, 100%, 0),
      hsla(0, 0%, 100%, 0) 2%,
      hsla(0, 0%, 100%, 0.08) 4%,
      hsla(0, 0%, 100%, 0) 5%,
      hsla(0, 0%, 100%, 0) 6%,
      hsla(0, 0%, 100%, 0.04) 7%,
      hsla(0, 0%, 100%, 0) 8%
    ),
    linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.03),
      rgba(0, 0, 0, 0.1) 1%,
      transparent 2%,
      rgba(0, 0, 0, 0.02) 4%,
      rgba(0, 0, 0, 0.1) 5%,
      rgba(0, 0, 0, 0.3) 6%,
      rgba(0, 0, 0, 0.15) 7%,
      transparent
    );
  background-position: bottom;
  background-size: cover; */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
`;

const Dots = styled.div`
  bottom: auto;
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

type CoverPropsType = {
  className: string;
} & ImageProps;

const Cover = ({
  className,
  src,
  height,
  width,
  alt,
  style,
  fill,
  blurDataURL,
  placeholder,
}: CoverPropsType) => {
  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      fill={fill}
      style={style}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      // width={width}
      // height={height}
    />
  );
};

const CoverLink = styled(Link)`
  z-index: 9001;
  // box-shadow: 0px 5px 10px 0px rgba(255, 255, 255, 0.5);
  transition: all ease 0.5s;

  display: block;
  position: relative;
  height: var(--slide-height);
  max-height: 70vh;
  max-width: 48vh;
  width: 100%;
  aspect-ratio: 6/9;
  /* object-fit: contain; */

  &:hover {
    transform: translateY(-3px) scale(1.03);
    box-shadow: 0px 0px 60px -25px rgba(255, 0, 0, 1);
  }
`;

function Carousel(props: PropType): ReactElement {
  const { options, forwardedRef, titles } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options, [
    Autoplay({ delay: 2500, stopOnMouseEnter: true }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollTo = useCallback(
    (index: number) => {
      return emblaApi && emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setScrollSnaps(emblaApi.scrollSnapList());
  }, [emblaApi, onSelect, props.titles]);
  // FIXME(@sergromm): убрать этот ужас, вместо кнопки должен использоваться Link
  // нужно создать новый вариант для кнопки или новый компонент ссылки с такими же стилями
  const router = useRouter();
  return (
    <Wrapper ref={forwardedRef}>
      <Viewport ref={emblaRef}>
        <Container>
          {titles &&
            titles.map((title, index) => (
              <Slide key={index}>
                <SlideContainer>
                  <CoverLink href={`/books/${title.slug}`}>
                    <Texture /*src={texture.src} */ />

                    {/* <Cover src={title.cover} alt={title.name} /> */}

                    <Cover
                      src={title.cover}
                      alt={title.name}
                      className='coverClass'
                      fill={true}
                      width={330}
                      height={550}
                      placeholder={`data:image/${title.coverBlurHash.slice(
                        11
                      )}`}
                      blurDataURL={title.coverBlurHash}
                    />
                  </CoverLink>
                  <StyledInfo>
                    <div>
                      <StyledTitle variant='heading' tag='h1'>
                        {title.name}
                      </StyledTitle>
                      {/* <StyledAuthor variant='heading' tag='h2'>
                      {title.authors.map((author) => author.name).join(', ')}
                    </StyledAuthor> */}
                      <StyledAuthor>
                        {title.authors.map((author) => author.name).join(', ')}
                      </StyledAuthor>
                    </div>
                    <StyledThesis variant='caption'>
                      {title.thesis}
                    </StyledThesis>
                    <StyledButton
                      variant='outlined'
                      onClick={() => router.push(`/books/${title.slug}`)}
                    >
                      Познать
                    </StyledButton>
                  </StyledInfo>
                </SlideContainer>
              </Slide>
            ))}
        </Container>
      </Viewport>
      <Dots>
        {scrollSnaps.map((_, index) => (
          <DotButton
            key={`key${index + 1}`}
            selected={index === selectedIndex}
            onClick={() => scrollTo(index)}
          />
        ))}
      </Dots>
    </Wrapper>
  );
}

export default Carousel;
