import { useRouter } from 'next/router';
import React from 'react';
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

function Preview({
  isOpen,
  shouldClose,
  preview,
  width,
  videoContainerRef,
  handleClose,
}: PreviewProps) {
  const router = useRouter();
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
                <Title>{preview.title}</Title>
                <Author>
                  {preview.authors.map((author) => author.name).join(', ')}
                </Author>
                <Slogan>{preview.thesis}</Slogan>
              </InfoContainer>
              <DescriptionBox>
                <Description>
                  {/* TODO убрать повторение перед релизом */}
                  {preview.description}
                </Description>
              </DescriptionBox>
              <Button
                variant='outlined'
                onClick={() => router.push(`/books/deleted`)}
              >
                Познать
              </Button>
            </BookDescriptionContainer>
            <VideoContainer ref={videoContainerRef}>
              <Video autoPlay muted loop>
                <source src='video/composition-v2.mp4' />
              </Video>
            </VideoContainer>
            <CloseButton onClick={handleClose} type='button'>
              <CloseIcon />
            </CloseButton>
          </MotionPreview>
        </PreviewContainer>
      )}
    </AnimatePresence>
  );
}

export default React.memo(Preview);
