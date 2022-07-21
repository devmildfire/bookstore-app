import * as React from 'react';
import { StyledImage } from './styles';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

const Image: React.FC<ImageProps> = (props) => <StyledImage {...props} />;

export default React.memo(Image);
