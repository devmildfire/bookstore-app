import React, { useContext } from 'react';
import { DeviceInfoContext } from '@/contexts/DeviceInfoContext';
import aboutInfo from '@/mocks/aboutInfo';
import AboutCard from './AboutCard';
import { StyledList, StyledSlide } from './styles';
import Slider from '@/components/Common/Slider';

const AboutList = (): React.ReactElement => {
  const { isMobile, } = useContext(DeviceInfoContext);
  const isSlider = isMobile;
  const initialSlide = Math.ceil(aboutInfo.length / 2);

  return isSlider ? (
    <Slider
      spaceBetween={10}
      slidesPerView={1.6}
      initialSlide={initialSlide}
      centeredSlides
    >
      {aboutInfo.map((about) => (
        <StyledSlide key={about.content}>
          {({ isActive, }) => (
            <AboutCard className={isActive ? 'active' : ''} {...about} />
          )}
        </StyledSlide>
      ))}
    </Slider>
  ) : (
    <StyledList>
      {aboutInfo.map((about) => (
        <AboutCard {...about} key={about.content} />
      ))}
    </StyledList>
  );
};

export default AboutList;
