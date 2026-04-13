import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export type ContentVideoProps = {
  content: string;
  durationInSeconds: number;
};

// 解析内容，支持：
// --- 分隔标题和副标题
// **文字** 突出核心句子
function parseContent(content: string): { title: string; subtitle: string; highlight: string } {
  const parts = content.split('---');
  const title = parts[0]?.trim() || content;
  const subtitle = parts[1]?.trim() || '';

  // 提取高亮文字
  const highlightMatch = title.match(/\*\*(.+?)\*\*/);
  const highlight = highlightMatch ? highlightMatch[1] : '';
  const cleanTitle = title.replace(/\*\*/g, '');

  return { title: cleanTitle, subtitle, highlight };
}

export const ContentVideo: React.FC<ContentVideoProps> = ({ content }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  const { title, subtitle, highlight } = parseContent(content);

  // 标题动画：0.5秒淡入 + 从下往上移动
  const titleStartFrame = Math.floor(0.5 * fps);
  const titleEndFrame = titleStartFrame + fps;
  const titleOpacity = interpolate(frame, [0, titleStartFrame, titleEndFrame], [0, 1, 1], { extrapolateLeft: 'clamp' });
  const titleY = interpolate(frame, [0, titleStartFrame, titleEndFrame], [50, 0, 0], { extrapolateLeft: 'clamp' });

  // 副标题动画：第2秒出现
  const subtitleStartFrame = Math.floor(2 * fps);
  const subtitleEndFrame = subtitleStartFrame + fps;
  const subtitleOpacity = interpolate(frame, [subtitleStartFrame - 5, subtitleStartFrame, subtitleEndFrame], [0, 1, 1], { extrapolateLeft: 'clamp' });
  const subtitleY = interpolate(frame, [subtitleStartFrame - 5, subtitleStartFrame, subtitleEndFrame], [20, 0, 0], { extrapolateLeft: 'clamp' });

  // 整体淡出（最后1秒）
  const fadeOutStart = durationInFrames - fps;
  const fadeOpacity = interpolate(frame, [fadeOutStart, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000',
        opacity: fadeOpacity,
        padding: 40,
      }}
    >
      {/* 标题 */}
      <div
        style={{
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#ffffff',
          fontSize: 48,
          fontWeight: 600,
          lineHeight: 1.4,
          transform: `translateY(${titleY}px)`,
          opacity: titleOpacity,
          marginBottom: subtitle ? 30 : 0,
        }}
      >
        {highlight ? (
          <>
            {title.split(highlight).map((part, i) => (
              <React.Fragment key={i}>
                {part}
                {i < title.split(highlight).length - 1 && (
                  <span style={{ color: '#ff6b6b', fontWeight: 700 }}>{highlight}</span>
                )}
              </React.Fragment>
            ))}
          </>
        ) : (
          title
        )}
      </div>

      {/* 副标题 */}
      {subtitle && (
        <div
          style={{
            textAlign: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            color: '#a0a0a0',
            fontSize: 28,
            lineHeight: 1.5,
            transform: `translateY(${subtitleY}px)`,
            opacity: subtitleOpacity,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
};
