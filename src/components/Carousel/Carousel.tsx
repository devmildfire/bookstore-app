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

type PropType = {
  slides: number[];
  options?: EmblaOptionsType;
};

const StyledInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 720px;
  width: 100%;
  @media screen and (max-width: 768px) {
    align-items: center;
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
  @media screen and (max-width: 1024px) {
    font-size: 48px;
  }
  @media screen and (max-width: 768px) {
    font-size: 36px;
    text-align: center;
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
    text-align: center;
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
    text-align: center;
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

const StyledWrapper = styled.section`
  background-color: #050505;
  .embla {
    --slide-spacing: 16px;
    --slide-size: 100%;
    --slide-height: auto;
    padding: 24px;
  }
  .embla__viewport {
    overflow: hidden;
  }
  .embla__container {
    display: flex;
    flex-direction: row;
    height: auto;
    gap: var(--slide-spacing);
  }
  .embla__slide {
    display: grid;
    justify-content: center;
    align-items: center;
    grid-template-columns: auto auto;
    gap: 48px;
    flex: 0 0 var(--slide-size);
    min-width: 0;
    position: relative;
    @media screen and (max-width: 512px) {
      align-items: flex-start;
      grid-template-columns: 1fr;
      grid-template-rows: minmax(150px, 1fr) auto;
      gap: 12px;
    }
  }
  .embla__slide__img {
    display: block;
    height: var(--slide-height);
    max-height: 70vh;
    width: 100%;
    object-fit: contain;
  }

  .embla__dot {
    -webkit-appearance: none;
    background-color: transparent;
    touch-action: manipulation;
    display: inline-flex;
    text-decoration: none;
    cursor: pointer;
    border: 0;
    padding: 0;
    margin: 0;
  }
  .embla__dots {
    z-index: 1;
    bottom: auto;
    position: absolute;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .embla__dot {
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 0.75rem;
    margin-left: 0.75rem;
  }
  .embla__dot:after {
    background: var(--main-white-100);
    border-radius: 50%;
    width: 5px;
    height: 5px;
    content: '';
  }
  .embla__dot--selected:after {
    background: var(--main-red-100);
    width: 10px;
    height: 10px;
  }
`;
function Carousel(props: PropType): ReactElement {
  const { slides, options } = props;
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
    <StyledWrapper>
      <div className='embla'>
        <div className='embla__viewport' ref={emblaRef}>
          <div className='embla__container'>
            {slides.map((index) => (
              <div className='embla__slide' key={index}>
                <img
                  className='embla__slide__img'
                  src={books[index].cover}
                  alt={books[index].title}
                />
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
              </div>
            ))}
          </div>
        </div>
        <div className='embla__dots'>
          {scrollSnaps.map((_, index) => (
            <DotButton
              key={`key${index + 1}`}
              selected={index === selectedIndex}
              onClick={() => scrollTo(index)}
            />
          ))}
        </div>
      </div>
    </StyledWrapper>
  );
}

export default Carousel;
