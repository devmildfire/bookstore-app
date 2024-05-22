import React, { useCallback, useEffect, useRef } from 'react';
import {
  EmblaCarouselType,
  EmblaEventType,
  EmblaOptionsType,
} from 'embla-carousel';
import ClassNames from 'embla-carousel-class-names';
import useEmblaCarousel from 'embla-carousel-react';
import {
  usePrevNextButtons,
  PrevButton,
  NextButton,
} from './EmblaCarouselArrowButtons';
import { useDotButton, DotButton } from './EmblaCarouselDotButton';
import { ITitlePhoto } from '@/entities/title';
// import {
//   NextButton,
//   PrevButton,
//   usePrevNextButtons,
// } from './EmblaCarouselArrowButtons';
// import { DotButton, useDotButton } from './EmblaCarouselDotButton';

const TWEEN_FACTOR_BASE = 0.52;

const numberWithinRange = (number: number, min: number, max: number): number =>
  Math.min(Math.max(number, min), max);

type PropType = {
  photos: ITitlePhoto[];
  options?: EmblaOptionsType;
};

const BookPhotos: React.FC<PropType> = (props) => {
  const { photos, options } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options, [ClassNames()]);
  const tweenFactor = useRef(0);
  const tweenNodes = useRef<HTMLElement[]>([]);

  const setupKeyEventsForCarousels = (carousel: EmblaCarouselType) => {
    document.addEventListener('keyup', (event) => {
      switch (event.code) {
        case 'ArrowLeft':
          carousel.scrollPrev();
          break;
        case 'ArrowRight':
          carousel.scrollNext();
          break;
      }
    });
  };

  const fullScreenElement = useRef<HTMLDivElement>(null);

  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      fullScreenElement.current?.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }, []);

  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi);

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  const setTweenNodes = useCallback((emblaApi: EmblaCarouselType): void => {
    tweenNodes.current = emblaApi.slideNodes().map((slideNode) => {
      return slideNode.querySelector('.embla__slide__number') as HTMLElement;
    });
  }, []);

  const setTweenFactor = useCallback((emblaApi: EmblaCarouselType) => {
    tweenFactor.current = TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length;
  }, []);

  const tweenScale = useCallback(
    (emblaApi: EmblaCarouselType, eventName?: EmblaEventType) => {
      const engine = emblaApi.internalEngine();
      const scrollProgress = emblaApi.scrollProgress();
      const slidesInView = emblaApi.slidesInView();
      const isScrollEvent = eventName === 'scroll';

      emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
        let diffToTarget = scrollSnap - scrollProgress;
        const slidesInSnap = engine.slideRegistry[snapIndex];

        slidesInSnap.forEach((slideIndex) => {
          if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

          if (engine.options.loop) {
            engine.slideLooper.loopPoints.forEach((loopItem) => {
              const target = loopItem.target();

              if (slideIndex === loopItem.index && target !== 0) {
                const sign = Math.sign(target);

                if (sign === -1) {
                  diffToTarget = scrollSnap - (1 + scrollProgress);
                }
                if (sign === 1) {
                  diffToTarget = scrollSnap + (1 - scrollProgress);
                }
              }
            });
          }

          const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor.current);
          const scale = numberWithinRange(tweenValue, 0, 1).toString();
          const tweenNode = tweenNodes.current[slideIndex];
          tweenNode.style.transform = `scale(${scale}) translate(${
            diffToTarget * -400
          }%)`;
        });
      });
    },
    []
  );

  useEffect(() => {
    if (!emblaApi) return;

    setTweenNodes(emblaApi);
    setTweenFactor(emblaApi);
    tweenScale(emblaApi);

    emblaApi
      .on('reInit', setTweenNodes)
      .on('reInit', setTweenFactor)
      .on('reInit', tweenScale)
      .on('scroll', tweenScale)
      .on('slideFocus', tweenScale);

    setupKeyEventsForCarousels(emblaApi);
  }, [emblaApi, tweenScale]);

  return (
    <div
      className='embla w-full max-h-screen grid grid-cols-1 md:grid-cols-[min-content_1fr_min-content]'
      ref={fullScreenElement}
    >
      <div className='embla__controls'>
        <div className='embla__buttons'>
          <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
          {/* <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} /> */}
        </div>

        {/* <div className='embla__dots'>
          {scrollSnaps.map((_, index) => (
            <DotButton
              key={index}
              onClick={() => onDotButtonClick(index)}
              className={'embla__dot'.concat(
                index === selectedIndex ? ' embla__dot--selected' : ''
              )}
            />
          ))}
        </div> */}
      </div>

      <div
        className='embla__viewport'
        tabIndex={0}
        ref={emblaRef}
        onClick={toggleFullScreen}
      >
        <div className='embla__container'>
          {photos.map((photo, index) => (
            <div className='embla__slide' key={index}>
              {/* <div className='embla__slide__number'>{index + 1}</div> */}
              <div className='embla__slide__number'>
                <img src={photo.source} alt={photo.titleId.toString()} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='embla__controls'>
        <div className='embla__buttons hidden md:block'>
          {/* <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} /> */}
          <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
        </div>

        {/* <div className='embla__dots'>
          {scrollSnaps.map((_, index) => (
            <DotButton
              key={index}
              onClick={() => onDotButtonClick(index)}
              className={'embla__dot'.concat(
                index === selectedIndex ? ' embla__dot--selected' : ''
              )}
            />
          ))}
        </div> */}
      </div>
    </div>
  );
};

export default BookPhotos;
