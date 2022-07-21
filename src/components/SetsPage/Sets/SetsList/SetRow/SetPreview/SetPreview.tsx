import * as React from 'react';
import Fade from '@/components/Common/Fade';
import Preview from '@/components/Common/Preview';
import { BoxSet } from '@/models/boxSets';
import SetPreviewCard from './SetPreviewCard';
import useGetParam from '@/hooks/useGetParam';
import { GET_PARAMS } from '@/consts/query';
import { COLLAPSE_DURATION, FADE_DURATION } from '@/consts/animation';
import PreviewHeader from '@/components/Common/PreviewHeader';
import PreviewContent from '@/components/Common/PreviewContent';

interface SetPreviewProps {
  readonly sets: BoxSet[];
}

const SetPreview: React.FC<SetPreviewProps> = (props) => {
  const { sets } = props;

  const setId = Number(useGetParam(GET_PARAMS.openProduct));

  const open = sets.some((set) => set.id === setId);
  return (
    <Preview
      open={open}
      duration={COLLAPSE_DURATION}
      exitTimeout={COLLAPSE_DURATION}
    >
      <PreviewHeader exitHref='/sets' />
      <PreviewContent>
        {sets.map((set) => (
          <Fade
            open={set.id === setId}
            enterTimeout={FADE_DURATION}
            exitTimeout={FADE_DURATION}
            key={set.id}
          >
            <SetPreviewCard {...set} />
          </Fade>
        ))}
      </PreviewContent>
    </Preview>
  );
};

export default SetPreview;
