import React from 'react';

interface ISocialIconProps {
  children: SVGAElement
}

const SocialIcon = ({ children }: ISocialIconProps): React.ReactElement => (
  <>
    {children}
  </>
);

export default SocialIcon;
