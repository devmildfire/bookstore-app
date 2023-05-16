import React, {
  useState,
  useEffect,
  useCallback,
  ReactElement,
  PropsWithChildren,
} from 'react';
import useEmblaCarousel, { EmblaOptionsType } from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import styled, { StyledComponent } from 'styled-components';
import books from '@/mocks/books';
import { DotButton } from './DotButton';
import Link from 'next/link';
import breakPoints from '@/utils/breakPoints';
import { SliderContainer } from '../Slider/styles';

type PropType = {
  slides: number[];
  options?: EmblaOptionsType;
  forwardedRef: null;
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

const StyledAuthor = styled(Text)`
  text-align: left;
  font-size: 48px;
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

const StyledButton = styled.button`
  background-color: transparent;
  border: thin solid white;
  color: white;
  min-height: 44px;
  width: 100%;
  border-radius: 4px;
  margin-top: 24px;
  max-width: 256px;
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

  @media ${breakPoints.lg} {
    padding: 55px 0vw;
  }
`;

const Viewport = styled.div`
  /* max-width: 1440px; */
  overflow: hidden;
  margin: 0 auto;
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  height: auto;
  /* gap: var(--slide-spacing); */
`;

const SlideContainer = styled.div`
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

const Cover = styled.img`
  display: block;
  height: var(--slide-height);
  max-height: 70vh;
  width: 100%;
  object-fit: contain;
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

function Carousel(props: PropType): ReactElement {
  const { slides, options, forwardedRef } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options, [Autoplay()]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollTo = useCallback(
    (index: number) => {
      console.log('hi');
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
  }, [emblaApi, onSelect]);

  return (
    <Wrapper ref={forwardedRef}>
      <Viewport ref={emblaRef}>
        <Container>
          {slides.map((index) => (
            <Slide key={index}>
              <SlideContainer>
                <Link href={`/books/${books[index].transliteratedTitle}`}>
                  <Cover src={books[index].cover} alt={books[index].title} />
                </Link>
                <StyledInfo>
                  <StyledTitle variant='heading' tag='h1'>
                    {books[index].title}
                  </StyledTitle>
                  <StyledAuthor variant='heading' tag='h2'>
                    {books[index].authors
                      .map((author) => author.name)
                      .join(', ')}
                  </StyledAuthor>
                  <StyledThesis variant='caption'>
                    {books[index].thesis}
                  </StyledThesis>
                  <StyledButton type='button'>Познать</StyledButton>
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
