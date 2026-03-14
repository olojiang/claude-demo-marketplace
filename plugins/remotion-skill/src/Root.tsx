import React from 'react';
import { Composition, CalculateMetadataFunction } from 'remotion';
import { ContentVideo, ContentVideoProps } from './ContentVideo';

const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;

const calculateMetadata: CalculateMetadataFunction<ContentVideoProps> = ({
  props,
}) => {
  const durationInSeconds = props.durationInSeconds ?? 5;
  const durationInFrames = Math.max(1, Math.round(durationInSeconds * FPS));
  return {
    durationInFrames,
    props,
  };
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ContentVideo"
      component={ContentVideo}
      durationInFrames={150}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{
        content: 'Hello World',
        durationInSeconds: 5,
      }}
      calculateMetadata={calculateMetadata}
    />
  );
};
