import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PreviewProps } from '../../types';
import { AnimatePresence } from 'framer-motion';
import CloseIcon from '@/assets/icons/close.svg';
import {
  Author,
  BookDescriptionContainer,
  Button,
  CloseButton,
  Description,
  DescriptionBox,
  InfoContainer,
  MotionPreview,
  PreviewContainer,
  Slogan,
  Title,
  Video,
  VideoContainer,
} from './styles';
import { previewStore } from '@/store/locals';
import { observer } from 'mobx-react-lite';
import {
  BackCover,
  // Book,
  BookForPreview,
  Cover,
  Lightmap,
  Pages,
} from '@/components/product-cards/ProductCard3d/styles';

const Preview = observer(
  ({
    isOpen,
    shouldClose,
    preview,
    slug,
    width,
    videoContainerRef,
    handleClose,
  }: PreviewProps) => {
    const router = useRouter();

    const [upperBlur, setUpperBlur] = useState(false);

    const descriptionRef = useRef<HTMLDivElement | null>(null);

    const logScroll = () => {
      const scrollH = descriptionRef.current?.scrollHeight || 0;
      const clientH = descriptionRef.current?.clientHeight || 0;

      const scrollAble = scrollH > clientH;

      const scrollAmount = descriptionRef.current?.scrollTop || 0;

      console.log('scroll...', scrollAmount);
      console.log('scrollAble...', scrollAble);

      scrollAmount > 10 && setUpperBlur(true);

      console.log('upperBlur...', upperBlur);
    };

    useEffect(() => {
      console.log('description ref...', descriptionRef.current);

      descriptionRef.current?.addEventListener('scroll', logScroll);
      return () => {
        descriptionRef.current?.removeEventListener('scroll', logScroll);
      };
    }, [isOpen]);

    const onOpenTitlePage = useCallback(() => {
      router.push(`/books/${slug}`);
    }, [slug, router]);

    return (
      <AnimatePresence>
        {!shouldClose && preview && isOpen && width > 512 && (
          <PreviewContainer
            style={{ overflowX: 'hidden', overflowY: 'hidden' }}
            className={isOpen ? 'visible' : 'hidden'}
            width={document.body.clientWidth}
          >
            <MotionPreview
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: width > 1024 ? '60vh' : 'auto',
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              <BookDescriptionContainer gap={32}>
                <InfoContainer gap={12}>
                  <div>
                    <Title>{preview.name}</Title>
                    <Author>
                      {preview.authors.map((author) => author.name).join(', ')}
                    </Author>
                  </div>
                  <Slogan>{preview.thesis}</Slogan>
                </InfoContainer>
                <DescriptionBox ref={descriptionRef}>
                  <Description>
                    {/* TODO убрать повторение перед релизом */}
                    {preview.description}
                  </Description>
                </DescriptionBox>
                <Button variant='outlined' onClick={onOpenTitlePage}>
                  Познать
                </Button>
              </BookDescriptionContainer>
              <VideoContainer ref={videoContainerRef}>
                {/* {preview.trailer || 'No trailer'} */}

                {preview.trailer && (
                  <Video
                    key={preview.trailer}
                    autoPlay
                    muted
                    loop
                    poster={preview.trailerPoster || undefined}
                    preload='auto'
                  >
                    <source src={preview.trailer} />
                  </Video>
                )}

                {!preview.trailer && (
                  <>
                    <Video
                      key={preview.name}
                      autoPlay
                      muted
                      loop
                      preload='auto'
                    >
                      <source src='video/shadows.mp4' />
                    </Video>
                    {/* translate-y-[-50%] translate-x-[-50%] */}
                    <BookForPreview className='absolute top-[50%] left-[50%] h-[80%]'>
                      <Cover
                        alt='cover'
                        src={preview.cover}
                        width={165}
                        height={275}
                        className='cover'
                      />
                      <Pages className='pages' />
                      <BackCover
                        aria-hidden='true'
                        src={preview.cover}
                        className='back-cover'
                      />
                      <Lightmap className='lightmap' />
                    </BookForPreview>
                  </>
                )}
              </VideoContainer>
              <CloseButton
                onClick={() => {
                  handleClose();
                  previewStore.openTitleID = null;
                }}
                type='button'
              >
                <CloseIcon />
              </CloseButton>
            </MotionPreview>
          </PreviewContainer>
        )}
      </AnimatePresence>
    );
  }
);

export default Preview;
