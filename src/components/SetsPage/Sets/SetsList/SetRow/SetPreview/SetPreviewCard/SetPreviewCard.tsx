import * as React from 'react';
import Preview from '@/components/Common/Preview';
import { BoxSet } from '@/models/boxSets';

interface SetPreviewCardProps extends BoxSet {}

const SetPreviewCard: React.FC<SetPreviewCardProps> = (props) => {
  const { books } = props;
  console.log(books);
  return <Preview exitHref='/sets' open={false} />;
};

export default SetPreviewCard;
