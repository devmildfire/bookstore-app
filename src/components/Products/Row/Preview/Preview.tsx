import { useRouter } from 'next/router';
import React, { useCallback } from 'react';
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
                <DescriptionBox>
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
                    controls
                    poster={preview.trailerPoster || undefined}
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
                      controls
                      poster={preview.trailerPoster || undefined}
                    >
                      <source src='video/composition-v2.mp4' />
                    </Video>
                    <img
                      className='absolute top-[50%] left-[50%] h-[80%] translate-y-[-50%] translate-x-[-50%] '
                      src={preview.cover}
                      alt={preview.name}
                    />
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

// function Preview({
//   isOpen,
//   shouldClose,
//   preview,
//   slug,
//   width,
//   videoContainerRef,
//   handleClose,
// }: PreviewProps) {
//   const router = useRouter();

//   const onOpenTitlePage = useCallback(() => {
//     router.push(`/books/${slug}`);
//   }, [slug, router]);

//   return (
//     <AnimatePresence>
//       {!shouldClose && preview && isOpen && width > 512 && (
//         <PreviewContainer
//           style={{ overflowX: 'hidden', overflowY: 'hidden' }}
//           className={isOpen ? 'visible' : 'hidden'}
//           width={document.body.clientWidth}
//         >
//           <MotionPreview
//             initial={{
//               opacity: 0,
//               height: 0,
//             }}
//             animate={{
//               opacity: 1,
//               height: width > 1024 ? '60vh' : 'auto',
//             }}
//             exit={{
//               opacity: 0,
//               height: 0,
//             }}
//             transition={{ duration: 0.4, ease: 'easeInOut' }}
//           >
//             <BookDescriptionContainer gap={32}>
//               <InfoContainer gap={12}>
//                 <div>
//                   <Title>{preview.name}</Title>
//                   <Author>
//                     {preview.authors.map((author) => author.name).join(', ')}
//                   </Author>
//                 </div>
//                 <Slogan>{preview.thesis}</Slogan>
//               </InfoContainer>
//               <DescriptionBox>
//                 <Description>
//                   {/* TODO убрать повторение перед релизом */}
//                   {preview.description}
//                 </Description>
//               </DescriptionBox>
//               <Button variant='outlined' onClick={onOpenTitlePage}>
//                 Познать
//               </Button>
//             </BookDescriptionContainer>
//             <VideoContainer ref={videoContainerRef}>
//               <Video autoPlay muted loop>
//                 <source src='video/composition-v2.mp4' />
//               </Video>
//             </VideoContainer>
//             <CloseButton onClick={handleClose} type='button'>
//               <CloseIcon />
//             </CloseButton>
//           </MotionPreview>
//         </PreviewContainer>
//       )}
//     </AnimatePresence>
//   );
// }

// export default React.memo(Preview);
export default Preview;
