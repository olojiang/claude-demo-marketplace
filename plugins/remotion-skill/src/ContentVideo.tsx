import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export type ContentVideoProps = {
  content: string;
  durationInSeconds: number;
};

export const ContentVideo: React.FC<ContentVideoProps> = ({ content }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  const fadeDuration = Math.min(fps, Math.floor(durationInFrames / 4), durationInFrames - 1);
  const fadeInEnd = Math.max(1, fadeDuration);
  const fadeOutStart = Math.min(durationInFrames - 1, durationInFrames - fadeDuration);
  const fadeOutStartSafe = fadeOutStart > fadeInEnd ? fadeOutStart : fadeInEnd + 1;

  const opacity = interpolate(
    frame,
    [0, fadeInEnd, fadeOutStartSafe, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const lines = content.split('\n').filter(Boolean);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f0f0f',
        opacity,
      }}
    >
      <div
        style={{
          maxWidth: '80%',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#fafafa',
          fontSize: 42,
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {lines.length > 0 ? lines.map((line, i) => (
          <div key={i}>{line}</div>
        )) : content || ' '}
      </div>
    </div>
  );
};
